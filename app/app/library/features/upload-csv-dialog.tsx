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
import { bulkCreateBlocksAction } from './actions';

interface ParsedBlock {
  blockNumber?: string;
  category?: string;
  title?: string;
  description?: string;
}

interface UploadCsvDialogProps {
  collectionId?: number | null;
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
          blockNumber: row['Block #'] || row['block_number'] || row['blockNumber'] || row['Feature #'] || row['feature_number'] || '',
          category: row['Category'] || row['category'] || '',
          title: row['Title'] || row['title'] || row['Feature'] || row['feature'] || '',
          description: row['Description'] || row['description'] || '',
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
      const result = await bulkCreateBlocksAction({
        blocks: parsedData,
        collectionId: collectionId || undefined,
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
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Upload className="h-4 w-4 mr-2" />
          Upload CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white">Upload content blocks CSV</DialogTitle>
          <DialogDescription className="text-gray-400">
            Upload a CSV file with columns: Block #, Category, Title, Description
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          <div className="space-y-4">
            {!file ? (
              <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-500" />
                <p className="text-sm text-gray-400 mb-4">
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
                  <Button asChild className="bg-blue-600 hover:bg-blue-700">
                    <span>Choose File</span>
                  </Button>
                </label>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between p-4 bg-gray-800 border border-gray-700 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <span className="font-medium text-white">{file.name}</span>
                    <span className="text-sm text-gray-400">
                      ({parsedData.length} blocks)
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRemoveFile}
                    className="border-gray-700 hover:bg-gray-800"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {error && (
                  <div className="p-4 bg-red-900/20 text-red-400 border border-red-800 rounded-lg">
                    {error}
                  </div>
                )}

                {parsedData.length > 0 && (
                  <div className="border border-gray-700 rounded-lg max-h-96 overflow-auto bg-gray-950">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-gray-900">
                        <tr className="border-b border-gray-700">
                          <th className="text-left p-2 text-gray-300">Block #</th>
                          <th className="text-left p-2 text-gray-300">Category</th>
                          <th className="text-left p-2 text-gray-300">Title</th>
                          <th className="text-left p-2 text-gray-300">Description</th>
                          <th className="p-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedData.map((row, index) => (
                          <tr key={index} className="border-b border-gray-800">
                            <td className="p-2 text-gray-300">{row.blockNumber || '-'}</td>
                            <td className="p-2 text-gray-300">{row.category || '-'}</td>
                            <td className="p-2 text-gray-300">{row.title || '-'}</td>
                            <td className="p-2 text-gray-300">{row.description || '-'}</td>
                            <td className="p-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemoveRow(index)}
                                className="hover:bg-gray-800"
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
            className="border-gray-700 hover:bg-gray-800"
          >
            Cancel
          </Button>
          {file && parsedData.length > 0 && (
            <Button
              onClick={handleUpload}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Uploading...' : `Upload ${parsedData.length} blocks`}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
