import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText } from 'lucide-react';
import Card from '../ui/Card';
import { usePDFEditor } from '../../hooks/usePDFEditor';

const PDFUploader: React.FC = () => {
  const { uploadDocument } = usePDFEditor();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      if (file.type === 'application/pdf') {
        uploadDocument(file);
      }
    });
  }, [uploadDocument]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  return (
    <Card className="p-8">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
        `}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="flex justify-center">
            {isDragActive ? (
              <FileText className="h-16 w-16 text-blue-500" />
            ) : (
              <Upload className="h-16 w-16 text-gray-400" />
            )}
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isDragActive ? 'Drop your PDF here' : 'Upload your PDF'}
            </p>
            <p className="text-gray-500">
              Drag and drop a PDF file, or click to select
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PDFUploader;