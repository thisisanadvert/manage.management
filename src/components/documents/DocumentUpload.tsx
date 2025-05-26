import React, { useState, useCallback, useEffect } from 'react';
import { Upload, X, FileText, AlertTriangle } from 'lucide-react';
import Button from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useFeatures } from '../../hooks/useFeatures';

interface DocumentUploadProps {
  buildingId: string;
  onUploadComplete?: () => void;
  allowedTypes?: string[];
  maxSize?: number; // in MB
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  buildingId,
  onUploadComplete,
  allowedTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx'],
  maxSize = 10
}) => {
  const { user } = useAuth();
  const { isDevelopmentEnvironment } = useFeatures();
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bucketExists, setBucketExists] = useState(true);

  // Check if the documents bucket exists
  useEffect(() => {
    const checkBucketExists = async () => {
      try {
        const { data: buckets, error } = await supabase.storage.listBuckets();
        
        if (error) {
          console.error('Error checking storage buckets:', error);
          return;
        }
        
        const documentsBucketExists = buckets.some(bucket => bucket.name === 'documents');
        setBucketExists(documentsBucketExists);
        
        if (!documentsBucketExists) {
          setError('Documents storage bucket not found. Please create it in your Supabase project.');
        }
      } catch (error) {
        console.error('Error checking storage buckets:', error);
      }
    };
    
    checkBucketExists();
  }, [isDevelopmentEnvironment]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      
      // Validate file types and sizes
      const invalidFiles = selectedFiles.filter(file => {
        const extension = '.' + file.name.split('.').pop()?.toLowerCase();
        return !allowedTypes.includes(extension);
      });

      const oversizedFiles = selectedFiles.filter(file => 
        file.size > maxSize * 1024 * 1024
      );

      if (invalidFiles.length > 0) {
        setError(`Invalid file type(s). Allowed types: ${allowedTypes.join(', ')}`);
        return;
      }

      if (oversizedFiles.length > 0) {
        setError(`Files must be smaller than ${maxSize}MB`);
        return;
      }

      setFiles(selectedFiles);
    }
  }, [allowedTypes, maxSize]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(droppedFiles);
  }, []);

  const handleUpload = async () => {
    if (!user || !buildingId || files.length === 0) return;
    
    setUploading(true);
    setError(null);

    if (!bucketExists) {
      setError('Document storage is not properly configured. Please contact support.');
      setUploading(false);
      return;
    }

    try {
      for (const file of files) {
        const timestamp = new Date().getTime();
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `${buildingId}/${timestamp}-${sanitizedName}`;

        // Upload file to storage
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Create document record
        const { error: dbError } = await supabase
          .from('onboarding_documents')
          .insert([{
            building_id: buildingId,
            document_type: file.name.split('.').pop()?.toLowerCase() || 'unknown',
            storage_path: filePath,
            uploaded_by: user.id
          }]);

        if (dbError) throw dbError;
      }

      setFiles([]);
      onUploadComplete?.();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-error-50 text-error-700 rounded-md flex items-center">
          <AlertTriangle size={16} className="mr-2" />
          {error}
          {!bucketExists && (
            <Button 
              variant="link" 
              size="sm" 
              className="ml-2"
              onClick={() => window.open('https://supabase.com/dashboard/project/_/storage/buckets', '_blank')}
            >
              Create Bucket
            </Button>
          )}
        </div>
      )}

      <div 
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <Upload size={32} className="mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600 mb-2">
          Drag and drop your files here, or
        </p>
        <input
          type="file"
          id="file-upload"
          multiple
          className="hidden"
          onChange={handleFileSelect}
          accept={allowedTypes.join(',')}
          disabled={!bucketExists}
        />
        <Button 
          variant="outline" 
          onClick={() => document.getElementById('file-upload')?.click()}
          disabled={!bucketExists}
        >
          Browse Files
        </Button>
        <p className="mt-2 text-sm text-gray-500">
          Maximum file size: {maxSize}MB
        </p>
        {!bucketExists && (
          <p className="mt-2 text-xs text-error-500">
            Storage bucket 'documents' not found in this environment
          </p>
        )}
      </div>

      {files.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Selected Files:</h4>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText size={16} className="text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">{file.name}</span>
                </div>
                <button
                  onClick={() => setFiles(files.filter((_, i) => i !== index))}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-end">
            <Button
              variant="primary"
              onClick={handleUpload}
              isLoading={uploading}
              disabled={uploading || !bucketExists}
            >
              Upload {files.length} file{files.length !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;