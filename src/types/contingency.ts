export interface ContingencyModification {
  type: "Delete" | "Add";
  contingencyName: string;
  content?: string[];
  sourceFile: string;
  sheet: string;
}

export interface DuplicateGroup {
  contingencyName: string;
  modifications: ContingencyModification[];
  selectedIndex: number;
}

export interface ProcessedFile {
  name: string;
  type: string;
  modifications: ContingencyModification[];
  localDuplicates: Set<string>;
}

export interface BaseFile {
  type: string;
  name: string;
  content: string[];
}

export interface SheetTypeMapping {
  [key: string]: string;
}

export const SHEET_TO_TYPE: SheetTypeMapping = {
  Single: "single",
  "P2-1": "bus",
  Bus: "bus",
  Line_FB: "line",
  Tower: "tower",
};

export const NOT_APPLICABLE = ["NA", "N/A", "na", "n/a"];
