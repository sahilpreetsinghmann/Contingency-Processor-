import React, { useCallback } from "react";
import { Upload, FileSpreadsheet, File } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileUploaderProps {
  title: string;
  description: string;
  acceptedTypes: string;
  multiple?: boolean;
  icon?: React.ReactNode;
  onFilesSelected: (files: FileList) => void;
  files?: File[];
  className?: string;
}

export function FileUploader({
  title,
  description,
  acceptedTypes,
  multiple = false,
  icon,
  onFilesSelected,
  files = [],
  className,
}: FileUploaderProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const droppedFiles = e.dataTransfer.files;
      if (droppedFiles.length > 0) {
        onFilesSelected(droppedFiles);
      }
    },
    [onFilesSelected],
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        onFilesSelected(e.target.files);
      }
    },
    [onFilesSelected],
  );

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Drag and drop files here, or{" "}
              <label className="text-blue-600 hover:text-blue-700 cursor-pointer underline">
                browse
                <input
                  type="file"
                  className="hidden"
                  accept={acceptedTypes}
                  multiple={multiple}
                  onChange={handleFileInput}
                />
              </label>
            </p>
            <p className="text-xs text-gray-500">
              Accepted types: {acceptedTypes}
            </p>
          </div>
        </div>

        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium text-gray-700">
              Selected Files:
            </h4>
            <div className="space-y-1">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded p-2"
                >
                  <File className="h-4 w-4" />
                  <span className="flex-1">{file.name}</span>
                  <span className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ContingencyFileUploaderProps {
  excelFiles: File[];
  baseFiles: File[];
  onExcelFilesChange: (files: FileList) => void;
  onBaseFilesChange: (files: FileList) => void;
}

export function ContingencyFileUploader({
  excelFiles,
  baseFiles,
  onExcelFilesChange,
  onBaseFilesChange,
}: ContingencyFileUploaderProps) {
  return (
    <div className="space-y-6">
      <FileUploader
        title="Excel Files with CTG Modifications"
        description="Upload Excel files containing contingency modifications. Files should have sheets named: Single, P2-1, Bus, Line_FB, Tower"
        acceptedTypes=".xlsx,.xls"
        multiple
        icon={<FileSpreadsheet className="h-5 w-5" />}
        onFilesSelected={onExcelFilesChange}
        files={excelFiles}
      />

      <FileUploader
        title="Base Contingency Files (.con)"
        description="Upload the base contingency files that will be modified. These should be .con files for different types (single, bus, line, tower, etc.)"
        acceptedTypes=".con,.txt"
        multiple
        icon={<File className="h-5 w-5" />}
        onFilesSelected={onBaseFilesChange}
        files={baseFiles}
      />
    </div>
  );
}
