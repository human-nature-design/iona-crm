'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Upload, FileText, X } from 'lucide-react';
import Papa from 'papaparse';
import { bulkCreateCollectionBlocksAction } from './block-actions';

interface ParsedBlock {
  category?: string;
  title?: string;
  description?: string;
}

interface UploadCsvDialogProps {
  collectionId: number;
}

export default function UploadCsvDialog({ collectionId }: UploadCsvDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedBlock[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }

    setFile(selectedFile);
    setError(null);
    parseCSV(selectedFile);
  };

  const parseCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const blocks = results.data.map((row: any) => ({
          category: row['Category'] || row['category'] || '',
          title: row['Block'] || row['block'] || row['Title'] || row['title'] || row['Feature'] || row['feature'] || row['feature (name)'] || row['feature name'] || '',
          description: row['Description'] || row['description'] || row['(block) description'] || row['block description'] || row['(feature) description'] || row['feature description'] || '',
        }));
        setParsedData(blocks);
      },
      error: (error) => {
        setError(`Error parsing CSV: ${error.message}`);
        setParsedData([]);
      },
    });
  };

  const handleUpload = async () => {
    if (parsedData.length === 0) {
      setError('No data to upload');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await bulkCreateCollectionBlocksAction({
        collectionId,
        blocks: parsedData,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setOpen(false);
        setFile(null);
        setParsedData([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        // Refresh the page to show new data
        window.location.reload();
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setParsedData([]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveRow = (index: number) => {
    setParsedData(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Upload Collection Blocks CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file with columns: Category, Block, Description
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          <div className="space-y-4">
            {!file ? (
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">
                  Select a CSV file to upload
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="csv-upload"
                />
                <label htmlFor="csv-upload">
                  <Button asChild>
                    <span>Choose File</span>
                  </Button>
                </label>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between p-4 bg-muted border border-border rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium text-foreground">{file.name}</span>
                    <span className="text-sm text-muted-foreground">
                      ({parsedData.length} blocks)
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRemoveFile}
                    className=""
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {error && (
                  <div className="p-4 bg-destructive/10 text-destructive border border-destructive/30 rounded-lg">
                    {error}
                  </div>
                )}

                {parsedData.length > 0 && (
                  <div className="border border-border rounded-lg max-h-96 overflow-auto bg-background">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-muted">
                        <tr className="border-b border-border">
                          <th className="text-left p-2 text-foreground">Category</th>
                          <th className="text-left p-2 text-foreground">Block</th>
                          <th className="text-left p-2 text-foreground">Description</th>
                          <th className="p-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedData.map((row, index) => (
                          <tr key={index} className="border-b border-border">
                            <td className="p-2 text-foreground">{row.category || '-'}</td>
                            <td className="p-2 text-foreground">{row.title || '-'}</td>
                            <td className="p-2 text-foreground">{row.description || '-'}</td>
                            <td className="p-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemoveRow(index)}
                                className="hover:bg-muted"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
            className=""
          >
            Cancel
          </Button>
          {file && parsedData.length > 0 && (
            <Button
              onClick={handleUpload}
              disabled={loading}
              className=""
            >
              {loading ? 'Uploading...' : `Upload ${parsedData.length} Blocks`}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
