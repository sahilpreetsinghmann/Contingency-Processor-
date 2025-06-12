import React from "react";
import { Check, AlertTriangle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DuplicateGroup } from "@/types/contingency";
import { cn } from "@/lib/utils";

interface DuplicateResolutionTableProps {
  duplicates: DuplicateGroup[];
  onResolutionChange: (index: number, selectedIndex: number) => void;
  onProceed: () => void;
}

export function DuplicateResolutionTable({
  duplicates,
  onResolutionChange,
  onProceed,
}: DuplicateResolutionTableProps) {
  if (duplicates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <Check className="h-5 w-5" />
            No Duplicates Found
          </CardTitle>
          <CardDescription>
            Great! No duplicate modifications were detected. You can proceed
            with processing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onProceed} className="w-full">
            Proceed with Processing
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-700">
          <AlertTriangle className="h-5 w-5" />
          Duplicate Modifications Detected
        </CardTitle>
        <CardDescription>
          Multiple modifications found for the same contingencies. Please select
          which modification to keep for each duplicate.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="text-sm text-gray-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <strong>Found {duplicates.length} duplicate(s)</strong> - Please
            review and select the preferred modification for each contingency.
          </div>

          <ScrollArea className="h-96 border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-64">Contingency Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Source File</TableHead>
                  <TableHead>Sheet</TableHead>
                  <TableHead>Content Preview</TableHead>
                  <TableHead className="w-24">Select</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {duplicates.map((group, groupIndex) => (
                  <React.Fragment key={groupIndex}>
                    <TableRow className="bg-gray-50">
                      <TableCell
                        colSpan={6}
                        className="font-medium text-gray-700 py-2"
                      >
                        Duplicate Group {groupIndex + 1}:{" "}
                        {group.contingencyName}
                      </TableCell>
                    </TableRow>
                    {group.modifications.map((mod, modIndex) => (
                      <TableRow
                        key={`${groupIndex}-${modIndex}`}
                        className={cn(
                          "hover:bg-gray-50",
                          group.selectedIndex === modIndex &&
                            "bg-blue-50 border-l-4 border-l-blue-500",
                        )}
                      >
                        <TableCell className="font-mono text-sm">
                          {mod.contingencyName}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              mod.type === "Delete" ? "destructive" : "default"
                            }
                          >
                            {mod.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {mod.sourceFile}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{mod.sheet}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          {mod.content ? (
                            <div className="text-xs font-mono bg-gray-100 p-2 rounded overflow-hidden">
                              <div className="truncate">
                                {mod.content.slice(0, 3).join(" → ")}
                                {mod.content.length > 3 && "..."}
                              </div>
                              <div className="text-gray-500 mt-1">
                                {mod.content.length} lines total
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-500 italic">
                              Delete operation
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <RadioGroup
                            value={group.selectedIndex.toString()}
                            onValueChange={(value) =>
                              onResolutionChange(groupIndex, parseInt(value))
                            }
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value={modIndex.toString()}
                                id={`${groupIndex}-${modIndex}`}
                              />
                              <Label
                                htmlFor={`${groupIndex}-${modIndex}`}
                                className="sr-only"
                              >
                                Select option {modIndex + 1}
                              </Label>
                            </div>
                          </RadioGroup>
                        </TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-600">
              Please ensure you have selected an option for each duplicate group
              before proceeding.
            </div>
            <Button onClick={onProceed} size="lg">
              Proceed with Selected Resolutions
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
