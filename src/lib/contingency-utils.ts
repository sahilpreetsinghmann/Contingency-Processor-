import * as XLSX from "xlsx";
import {
  ContingencyModification,
  DuplicateGroup,
  ProcessedFile,
  BaseFile,
  SHEET_TO_TYPE,
  NOT_APPLICABLE,
} from "@/types/contingency";

export function readExcelFile(file: File): Promise<XLSX.WorkBook> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        resolve(workbook);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

export function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

export function parseExcelSheet(
  workbook: XLSX.WorkBook,
  sheetName: string,
): any[] {
  if (!workbook.Sheets[sheetName]) {
    return [];
  }

  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: "",
    raw: false,
  });

  if (data.length < 2) return [];

  const headers = data[0] as string[];
  const deleteIndex = headers.findIndex(
    (h) => h && h.toLowerCase().includes("delete"),
  );
  const addIndex = headers.findIndex(
    (h) => h && h.toLowerCase().includes("add"),
  );

  return data.slice(1).map((row: any) => ({
    Delete: deleteIndex >= 0 ? row[deleteIndex] || "" : "",
    Add: addIndex >= 0 ? row[addIndex] || "" : "",
  }));
}

export function parseModifications(
  data: any[],
  sourceFile: string,
  sheet: string,
): { modifications: ContingencyModification[]; localDuplicates: Set<string> } {
  const modifications: ContingencyModification[] = [];
  const localDuplicates = new Set<string>();
  const deleteNames = new Set<string>();

  for (const row of data) {
    const deleteContent = row.Delete?.toString().trim() || "";
    const addContent = row.Add?.toString().trim() || "";

    // Process deletions
    if (deleteContent && !NOT_APPLICABLE.includes(deleteContent)) {
      const lines = deleteContent.split("\n").map((line) => line.trim());
      for (const line of lines) {
        if (line.startsWith("CONTINGENCY")) {
          deleteNames.add(line);
          modifications.push({
            type: "Delete",
            contingencyName: line,
            sourceFile,
            sheet,
          });
        }
      }
    }

    // Process additions
    if (addContent && !NOT_APPLICABLE.includes(addContent)) {
      const lines = addContent.split("\n").map((line) => line.trim());
      let currentEntry: string[] = [];
      let contingencyName: string | null = null;

      for (const line of lines) {
        if (line.startsWith("CONTINGENCY")) {
          contingencyName = line;
          if (deleteNames.has(contingencyName)) {
            localDuplicates.add(contingencyName);
          }
        }
        currentEntry.push(line);

        if (line === "END" && contingencyName) {
          modifications.push({
            type: "Add",
            contingencyName,
            content: [...currentEntry],
            sourceFile,
            sheet,
          });
          currentEntry = [];
          contingencyName = null;
        }
      }
    }
  }

  return { modifications, localDuplicates };
}

export async function processExcelFiles(
  files: File[],
): Promise<ProcessedFile[]> {
  const processedFiles: ProcessedFile[] = [];

  for (const file of files) {
    try {
      const workbook = await readExcelFile(file);
      const allModifications: ContingencyModification[] = [];
      const allLocalDuplicates = new Set<string>();

      for (const [sheetName, type] of Object.entries(SHEET_TO_TYPE)) {
        if (workbook.SheetNames.includes(sheetName)) {
          const data = parseExcelSheet(workbook, sheetName);
          const { modifications, localDuplicates } = parseModifications(
            data,
            file.name,
            sheetName,
          );

          allModifications.push(...modifications);
          localDuplicates.forEach((dup) => allLocalDuplicates.add(dup));
        }
      }

      processedFiles.push({
        name: file.name,
        type: "excel",
        modifications: allModifications,
        localDuplicates: allLocalDuplicates,
      });
    } catch (error) {
      console.error(`Error processing ${file.name}:`, error);
    }
  }

  return processedFiles;
}

export function findDuplicates(
  processedFiles: ProcessedFile[],
): DuplicateGroup[] {
  const modificationMap = new Map<string, ContingencyModification[]>();
  const localDuplicates = new Set<string>();

  // Collect all local duplicates
  processedFiles.forEach((file) => {
    file.localDuplicates.forEach((dup) => localDuplicates.add(dup));
  });

  // Group modifications by contingency name and type
  processedFiles.forEach((file) => {
    file.modifications.forEach((mod) => {
      const key = `${mod.type}-${mod.contingencyName}`;
      if (!modificationMap.has(key)) {
        modificationMap.set(key, []);
      }
      modificationMap.get(key)!.push(mod);
    });
  });

  const duplicateGroups: DuplicateGroup[] = [];

  modificationMap.forEach((modifications, key) => {
    const contingencyName = modifications[0].contingencyName;

    // Include if it's a local duplicate or has multiple sources
    if (localDuplicates.has(contingencyName) || modifications.length > 1) {
      duplicateGroups.push({
        contingencyName,
        modifications,
        selectedIndex: 0, // Default to first option
      });
    }
  });

  return duplicateGroups;
}

export async function processBaseFiles(files: FileList): Promise<BaseFile[]> {
  const baseFiles: BaseFile[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      const content = await readTextFile(file);
      const lines = content.split("\n").map((line) => line.replace(/\r$/, ""));

      // Try to determine type from filename
      const filename = file.name.toLowerCase();
      let type = "unknown";

      for (const [sheetName, typeValue] of Object.entries(SHEET_TO_TYPE)) {
        if (filename.includes(typeValue.toLowerCase())) {
          type = typeValue;
          break;
        }
      }

      baseFiles.push({
        type,
        name: file.name,
        content: lines,
      });
    } catch (error) {
      console.error(`Error reading ${file.name}:`, error);
    }
  }

  return baseFiles;
}

export function generateRevisedFile(
  baseFile: BaseFile,
  modifications: ContingencyModification[],
  duplicateResolutions: DuplicateGroup[],
): string[] {
  const deletions = new Set<string>();
  const additions: string[][] = [];

  // Apply duplicate resolutions
  duplicateResolutions.forEach((group) => {
    const selectedMod = group.modifications[group.selectedIndex];
    const fileType = SHEET_TO_TYPE[selectedMod.sheet];

    if (fileType === baseFile.type) {
      if (selectedMod.type === "Delete") {
        deletions.add(selectedMod.contingencyName);
      } else if (selectedMod.type === "Add" && selectedMod.content) {
        additions.push(selectedMod.content);
      }
    }
  });

  // Apply non-duplicate modifications
  modifications.forEach((mod) => {
    const fileType = SHEET_TO_TYPE[mod.sheet];
    if (fileType === baseFile.type) {
      const isDuplicate = duplicateResolutions.some(
        (group) => group.contingencyName === mod.contingencyName,
      );

      if (!isDuplicate) {
        if (mod.type === "Delete") {
          deletions.add(mod.contingencyName);
        } else if (mod.type === "Add" && mod.content) {
          additions.push(mod.content);
        }
      }
    }
  });

  const finalLines: string[] = [
    "DEFAULT DISPATCH",
    "SYSTEM INERTIA",
    "END",
    "",
    "/ --- Modified Contingencies ---",
    "/--- Deleted Contingencies ---",
  ];

  let inBlock = false;
  let commentBlock = false;

  for (const line of baseFile.content) {
    if (line.startsWith("CONTINGENCY")) {
      const contingencyLine = line.trim();
      if (deletions.has(contingencyLine)) {
        commentBlock = true;
        finalLines.push("////Deleted Contingency////");
        finalLines.push("/" + line);
      } else {
        commentBlock = false;
        finalLines.push(line);
      }
      inBlock = true;
    } else if (line.trim() === "END") {
      inBlock = false;
      finalLines.push(commentBlock ? "/" + line : line);
    } else if (inBlock && commentBlock) {
      finalLines.push("/" + line);
    } else {
      finalLines.push(line);
    }
  }

  finalLines.push("");
  finalLines.push("/--- Added Contingencies ---");

  additions.forEach((block) => {
    finalLines.push(...block);
    finalLines.push("");
  });

  return finalLines;
}

export function downloadFile(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
