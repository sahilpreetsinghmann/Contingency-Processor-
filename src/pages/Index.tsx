import { Link } from "react-router-dom";
import { FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Index() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Fusion Starter
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          A modern, production-ready template for building full-stack React
          applications
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Contingency File Processor
            </CardTitle>
            <CardDescription>
              Process Excel modifications and generate updated contingency files
              with duplicate resolution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                <ul className="space-y-1">
                  <li>• Upload Excel files with CTG modifications</li>
                  <li>• Upload base contingency (.con) files</li>
                  <li>• Resolve duplicate modifications</li>
                  <li>• Download updated contingency files</li>
                </ul>
              </div>
              <Link to="/contingency-processor">
                <Button className="w-full">
                  Open Processor
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Technologies Used</CardTitle>
            <CardDescription>
              Modern React stack with TypeScript
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">
              <ul className="space-y-1">
                <li>• React 18 with TypeScript</li>
                <li>• React Router for navigation</li>
                <li>• TailwindCSS for styling</li>
                <li>• Radix UI components</li>
                <li>• Vite for development</li>
                <li>• Vitest for testing</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 text-center text-gray-500">
        <p>Built with ❤️ using the Fusion Starter template</p>
      </div>
    </div>
  );
}
