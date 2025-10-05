'use client';

import { useState } from 'react';
import { Upload, Download, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { orders } from '@/lib/api';
import toast from 'react-hot-toast';

interface ImportResult {
  totalRows: number;
  successCount: number;
  errorCount: number;
  successOrders: Array<{
    row: number;
    orderNumber: string;
    recipientName: string;
  }>;
  errors: Array<{
    row: number;
    error: string;
    data: any;
  }>;
}

export default function BulkImportOrders({ onImportComplete }: { onImportComplete?: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv',
      ];
      
      if (!validTypes.includes(selectedFile.type)) {
        toast.error('Please upload an Excel file (.xlsx, .xls) or CSV');
        return;
      }

      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await orders.bulkImport(formData);
      setResult(response.data.data);
      
      if (response.data.data.errorCount === 0) {
        toast.success(`Successfully imported all ${response.data.data.successCount} orders!`);
      } else {
        toast.success(`Imported ${response.data.data.successCount} orders with ${response.data.data.errorCount} errors`);
      }

      if (onImportComplete) {
        onImportComplete();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to import orders');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await orders.downloadTemplate();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'order-import-template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Template downloaded!');
    } catch (error) {
      toast.error('Failed to download template');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Bulk Import Orders</h3>
          <p className="text-sm text-gray-500">Upload an Excel file to import multiple orders at once</p>
        </div>
        <Button onClick={handleDownloadTemplate} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download Template
        </Button>
      </div>

      {/* Upload Section */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <label htmlFor="file-upload" className="cursor-pointer">
              <span className="mt-2 block text-sm font-medium text-gray-900">
                {file ? file.name : 'Choose Excel file or drag and drop'}
              </span>
              <span className="mt-1 block text-xs text-gray-500">
                Supported formats: .xlsx, .xls, .csv (Max 5MB)
              </span>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
              />
            </label>
          </div>
          {file && (
            <div className="mt-4">
              <Button onClick={handleUpload} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload and Import'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <h4 className="text-lg font-medium text-gray-900">Import Results</h4>
          
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{result.totalRows}</div>
              <div className="text-sm text-gray-600">Total Rows</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{result.successCount}</div>
              <div className="text-sm text-gray-600">Successful</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-600">{result.errorCount}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
          </div>

          {/* Success List */}
          {result.successOrders.length > 0 && (
            <div>
              <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                Successfully Imported ({result.successOrders.length})
              </h5>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {result.successOrders.slice(0, 10).map((order) => (
                  <div key={order.row} className="text-sm bg-green-50 rounded p-2">
                    Row {order.row}: <strong>{order.orderNumber}</strong> - {order.recipientName}
                  </div>
                ))}
                {result.successOrders.length > 10 && (
                  <div className="text-sm text-gray-500">
                    + {result.successOrders.length - 10} more orders...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error List */}
          {result.errors.length > 0 && (
            <div>
              <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                <XCircle className="h-5 w-5 text-red-500 mr-2" />
                Errors ({result.errorCount})
              </h5>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {result.errors.map((error) => (
                  <div key={error.row} className="text-sm bg-red-50 rounded p-2">
                    <div className="font-medium text-red-800">Row {error.row}:</div>
                    <div className="text-red-600">{error.error}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Import Instructions:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Download the template Excel file</li>
              <li>Fill in order details following the template format</li>
              <li>Upload the completed file</li>
              <li>Review the import results and fix any errors if needed</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
