import React, { useState, useCallback } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  FileText,
  AlertCircle,
  CheckCircle,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ContingencyFileUploader } from "@/components/ContingencyFileUploader";
import { DuplicateResolutionTable } from "@/components/DuplicateResolutionTable";
import {
  processExcelFiles,
  findDuplicates,
  processBaseFiles,
  generateRevisedFile,
  downloadFile,
} from "@/lib/contingency-utils";
import {
  ProcessedFile,
  DuplicateGroup,
  BaseFile,
  ContingencyModification,
} from "@/types/contingency";

type Step = "upload" | "processing" | "duplicates" | "results";

export default function ContingencyProcessor() {
  const [currentStep, setCurrentStep] = useState<Step>("upload");
  const [excelFiles, setExcelFiles] = useState<File[]>([]);
  const [baseFiles, setBaseFiles] = useState<File[]>([]);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [baseFileData, setBaseFileData] = useState<BaseFile[]>([]);
  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([]);
  const [allModifications, setAllModifications] = useState<
    ContingencyModification[]
  >([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExcelFilesChange = useCallback((files: FileList) => {
    setExcelFiles(Array.from(files));
  }, []);

  const handleBaseFilesChange = useCallback((files: FileList) => {
    setBaseFiles(Array.from(files));
  }, []);

  const processFiles = useCallback(async () => {
    if (excelFiles.length === 0) {
      setError("Please select at least one Excel file");
      return;
    }
    if (baseFiles.length === 0) {
      setError("Please select at least one base contingency file");
      return;
    }

    setProcessing(true);
    setError(null);
    setCurrentStep("processing");

    try {
      // Process Excel files
      const processed = await processExcelFiles(excelFiles);
      setProcessedFiles(processed);

      // Process base files
      const baseData = await processBaseFiles(baseFiles as any);
      setBaseFileData(baseData);

      // Collect all modifications
      const modifications = processed.flatMap((file) => file.modifications);
      setAllModifications(modifications);

      // Find duplicates
      const duplicateGroups = findDuplicates(processed);
      setDuplicates(duplicateGroups);

      setCurrentStep("duplicates");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred during processing",
      );
      setCurrentStep("upload");
    } finally {
      setProcessing(false);
    }
  }, [excelFiles, baseFiles]);

  const handleDuplicateResolution = useCallback(
    (groupIndex: number, selectedIndex: number) => {
      setDuplicates((prev) =>
        prev.map((group, index) =>
          index === groupIndex ? { ...group, selectedIndex } : group,
        ),
      );
    },
    [],
  );

  const generateFinalFiles = useCallback(() => {
    setCurrentStep("results");
  }, []);

  const downloadAllFiles = useCallback(() => {
    baseFileData.forEach((baseFile) => {
      const revisedContent = generateRevisedFile(
        baseFile,
        allModifications,
        duplicates,
      );
      const content = revisedContent.join("\n");
      const filename = `[REVISED] - ${baseFile.name.replace(".con", "")}.con`;
      downloadFile(content, filename);
    });
  }, [baseFileData, allModifications, duplicates]);

  const downloadIndividualFile = useCallback(
    (baseFile: BaseFile) => {
      const revisedContent = generateRevisedFile(
        baseFile,
        allModifications,
        duplicates,
      );
      const content = revisedContent.join("\n");
      const filename = `[REVISED] - ${baseFile.name.replace(".con", "")}.con`;
      downloadFile(content, filename);
    },
    [allModifications, duplicates],
  );

  const resetProcessor = useCallback(() => {
    setCurrentStep("upload");
    setExcelFiles([]);
    setBaseFiles([]);
    setProcessedFiles([]);
    setBaseFileData([]);
    setDuplicates([]);
    setAllModifications([]);
    setError(null);
  }, []);

  const getStepProgress = () => {
    switch (currentStep) {
      case "upload":
        return 25;
      case "processing":
        return 50;
      case "duplicates":
        return 75;
      case "results":
        return 100;
      default:
        return 0;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Contingency File Processor
        </h1>
        <p className="text-gray-600">
          Process Excel modifications and generate updated contingency files
        </p>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Badge variant={currentStep === "upload" ? "default" : "secondary"}>
              1. Upload Files
            </Badge>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <Badge
              variant={currentStep === "processing" ? "default" : "secondary"}
            >
              2. Processing
            </Badge>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <Badge
              variant={currentStep === "duplicates" ? "default" : "secondary"}
            >
              3. Resolve Duplicates
            </Badge>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <Badge
              variant={currentStep === "results" ? "default" : "secondary"}
            >
              4. Download Results
            </Badge>
          </div>
        </div>
        <Progress value={getStepProgress()} className="w-full" />
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {currentStep === "upload" && (
        <div className="space-y-6">
          <ContingencyFileUploader
            excelFiles={excelFiles}
            baseFiles={baseFiles}
            onExcelFilesChange={handleExcelFilesChange}
            onBaseFilesChange={handleBaseFilesChange}
          />

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {excelFiles.length} Excel file(s) and {baseFiles.length} base
              file(s) selected
            </div>
            <Button
              onClick={processFiles}
              disabled={excelFiles.length === 0 || baseFiles.length === 0}
              size="lg"
            >
              Process Files
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {currentStep === "processing" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 animate-spin" />
              Processing Files...
            </CardTitle>
            <CardDescription>
              Analyzing Excel files and detecting modifications...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={100} className="w-full animate-pulse" />
              <p className="text-sm text-gray-600 text-center">
                This may take a few moments depending on file size...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === "duplicates" && (
        <DuplicateResolutionTable
          duplicates={duplicates}
          onResolutionChange={handleDuplicateResolution}
          onProceed={generateFinalFiles}
        />
      )}

      {currentStep === "results" && (
        <div className="space-y-6">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Processing Complete!</AlertTitle>
            <AlertDescription>
              All files have been processed successfully. You can now download
              the revised contingency files.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Processing Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {excelFiles.length}
                  </div>
                  <div className="text-sm text-gray-600">Excel Files</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {baseFileData.length}
                  </div>
                  <div className="text-sm text-gray-600">Base Files</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {allModifications.length}
                  </div>
                  <div className="text-sm text-gray-600">
                    Total Modifications
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">
                    {duplicates.length}
                  </div>
                  <div className="text-sm text-gray-600">
                    Duplicates Resolved
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Generated Files</h3>
                  <Button
                    onClick={downloadAllFiles}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download All Files
                  </Button>
                </div>

                <div className="grid gap-3">
                  {baseFileData.map((baseFile, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <div>
                          <div className="font-medium">
                            [REVISED] - {baseFile.name.replace(".con", "")}.con
                          </div>
                          <div className="text-sm text-gray-600">
                            Type: {baseFile.type} • Original: {baseFile.name}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadIndividualFile(baseFile)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button variant="outline" onClick={resetProcessor}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Process More Files
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
