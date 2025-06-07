import React, { useState, useCallback, useEffect } from 'react';
import {
  FolderPlus,
  Search,
  Filter,
  FileText,
  Download,
  Clock,
  Calendar,
  Building2,
  Scale,
  Wallet,
  Shield,
  AlertTriangle,
  Upload,
  X,
  ChevronRight,
  File,
  CheckCircle2,
  Eye,
  Edit2,
  Save,
  MoreVertical
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const Documents = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);

  // Preview modal state
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Rename state
  const [editingDocumentId, setEditingDocumentId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const categories = [
    { id: 'legal', name: 'Legal Documents', icon: Scale },
    { id: 'financial', name: 'Financial', icon: Wallet },
    { id: 'insurance', name: 'Insurance', icon: Shield },
    { id: 'maintenance', name: 'Maintenance', icon: AlertTriangle },
  ];

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadingFiles(Array.from(e.target.files));
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setUploadingFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  // Preview functionality
  const handlePreview = async (doc: any) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(doc.storage_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      setPreviewUrl(url);
      setPreviewDocument(doc);
      setShowPreviewModal(true);
    } catch (error) {
      console.error('Error loading preview:', error);
    }
  };

  // Rename functionality
  const handleStartRename = (doc: any) => {
    setEditingDocumentId(doc.id);
    setEditingName(doc.storage_path.split('/').pop()?.replace(/^\d+-/, '') || '');
  };

  const handleSaveRename = async (doc: any) => {
    if (!editingName.trim()) return;

    try {
      // Create new file path with timestamp prefix
      const pathParts = doc.storage_path.split('/');
      const oldFileName = pathParts.pop();
      const timestamp = oldFileName?.split('-')[0] || new Date().getTime();
      const newFileName = `${timestamp}-${editingName.trim()}`;
      const newPath = [...pathParts, newFileName].join('/');

      // Update database record
      const { error } = await supabase
        .from('onboarding_documents')
        .update({ storage_path: newPath })
        .eq('id', doc.id);

      if (error) throw error;

      // Refresh documents list
      await fetchDocuments();
      setEditingDocumentId(null);
      setEditingName('');
    } catch (error) {
      console.error('Error renaming document:', error);
    }
  };

  const handleCancelRename = () => {
    setEditingDocumentId(null);
    setEditingName('');
  };

  // Check if the documents bucket exists on component mount
  useEffect(() => {
    const checkBucketExists = async () => {
      try {
        const { data: buckets, error } = await supabase.storage.listBuckets();

        if (error) {
          console.error('Error checking storage buckets:', error);
          console.log('Storage check failed, but continuing anyway for debugging');
          return;
        }

        const documentsBucketExists = buckets.some(bucket => bucket.name === 'documents');

        if (!documentsBucketExists) {
          console.warn('Documents storage bucket does not exist');
          // Temporarily disabled for debugging
          // setUploadError('Documents storage is not configured. Please contact support.');
          console.log('Bucket check failed, but continuing anyway for debugging');
        } else {
          console.log('Documents bucket found successfully');
        }
      } catch (error) {
        console.error('Error checking storage buckets:', error);
        console.log('Storage check failed, but continuing anyway for debugging');
      }
    };

    checkBucketExists();
  }, []);

  // Fetch documents function
  const fetchDocuments = async () => {
    if (!user?.metadata?.buildingId) return;

    setIsLoading(true);
    try {
      let query = supabase
        .from('onboarding_documents')
        .select('*')
        .eq('building_id', user.metadata.buildingId);

      if (selectedCategory !== 'all') {
        query = query.eq('document_type', selectedCategory);
      }

      if (searchQuery) {
        query = query.ilike('storage_path', `%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch documents when component mounts or category changes
  useEffect(() => {
    fetchDocuments();
  }, [user?.metadata?.buildingId, selectedCategory, searchQuery]);

  const uploadFiles = async () => {
    console.log('Upload button clicked!');
    console.log('Files to upload:', uploadingFiles);
    console.log('Selected category:', selectedCategory);
    console.log('User building ID:', user?.metadata?.buildingId);

    setIsUploading(true);
    setUploadError(null);

    try {
      // Check if the documents bucket exists
      const { data: buckets, error: bucketsError } = await supabase
        .storage
        .listBuckets();

      if (bucketsError) {
        console.error('Bucket check error:', bucketsError);
        console.log('Continuing with upload despite bucket check error');
      } else {
        const documentsBucketExists = buckets.some(bucket => bucket.name === 'documents');

        if (!documentsBucketExists) {
          console.warn('Documents bucket not found, but continuing anyway for debugging');
          // Temporarily disabled for debugging
          // throw new Error('Documents storage is not configured. Please contact support.');
        } else {
          console.log('Documents bucket confirmed for upload');
        }
      }

      for (const file of uploadingFiles) {
        // Create unique file path with timestamp to avoid conflicts
        const timestamp = new Date().getTime();
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `${user?.metadata?.buildingId}/${selectedCategory}/${timestamp}-${sanitizedFileName}`;

        console.log('📁 Uploading file to path:', filePath);

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file);

        if (uploadError) {
          console.error('💥 Storage upload error:', uploadError);
          throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
        }

        console.log('✅ File uploaded successfully to storage');

        // Create document record in the database
        console.log('🔍 Inserting document record:', {
          building_id: user?.metadata?.buildingId,
          document_type: selectedCategory,
          storage_path: filePath,
          uploaded_by: user?.id
        });

        const { error: dbError } = await supabase
          .from('onboarding_documents')
          .insert([
            {
              building_id: user?.metadata?.buildingId,
              document_type: selectedCategory,
              storage_path: filePath,
              uploaded_by: user?.id
            }
          ]);

        if (dbError) {
          console.error('❌ Database error:', dbError);
          throw dbError;
        }

        console.log('✅ Document record created successfully');
      }

      // Refresh the documents list
      console.log('🔄 Refreshing documents list...');
      await fetchDocuments();
      console.log('✅ Documents list refreshed');

      setShowUploadModal(false);
      setUploadingFiles([]);
    } catch (error: any) {
      setUploadError(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Preview Modal Component
  const PreviewModal = () => {
    if (!showPreviewModal || !previewDocument || !previewUrl) return null;

    const fileName = previewDocument.storage_path.split('/').pop();
    const fileExtension = fileName?.split('.').pop()?.toLowerCase();

    const renderPreview = () => {
      if (['pdf'].includes(fileExtension)) {
        return (
          <iframe
            src={previewUrl}
            className="w-full h-full border-0"
            title="Document Preview"
          />
        );
      } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)) {
        return (
          <img
            src={previewUrl}
            alt="Document Preview"
            className="max-w-full max-h-full object-contain"
          />
        );
      } else if (['txt', 'md'].includes(fileExtension)) {
        return (
          <div className="p-4 bg-gray-50 h-full overflow-auto">
            <p className="text-gray-600">Text file preview not available. Please download to view.</p>
          </div>
        );
      } else {
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FileText size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Preview not available for this file type</p>
              <p className="text-sm text-gray-500 mt-2">Please download to view the file</p>
            </div>
          </div>
        );
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-11/12 h-5/6 max-w-4xl flex flex-col">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-semibold truncate">{fileName}</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download size={16} />}
                onClick={async () => {
                  try {
                    const { data, error } = await supabase.storage
                      .from('documents')
                      .download(previewDocument.storage_path);

                    if (error) throw error;

                    const url = URL.createObjectURL(data);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = fileName;
                    document.body.appendChild(a);
                    a.click();
                    URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                  } catch (error) {
                    console.error('Error downloading file:', error);
                  }
                }}
              >
                Download
              </Button>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  setPreviewDocument(null);
                  if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(null);
                  }
                }}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            {renderPreview()}
          </div>
        </div>
      </div>
    );
  };

  const UploadModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Upload Documents</h2>
          <button onClick={() => setShowUploadModal(false)}>
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {uploadError && (
          <div className="mb-4 p-3 bg-error-50 text-error-700 rounded-md">
            {uploadError}
          </div>
        )}

        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <Upload size={32} className="mx-auto text-gray-400 mb-2" />
          <p className="text-gray-600 mb-2">Drag and drop your files here</p>
          <p className="text-gray-400 text-sm mb-4">or</p>
          <input
            type="file"
            id="file-upload"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
          <label
            htmlFor="file-upload"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 cursor-pointer"
          >
            Browse Files
          </label>
          {uploadingFiles.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-900 mb-2">Selected files:</h4>
              <ul className="space-y-2">
                {uploadingFiles.map((file, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-600">
                    <File size={16} className="mr-2" />
                    {file.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setShowUploadModal(false)}
          >
            Cancel
          </Button>
          <Button 
            variant="primary"
            onClick={uploadFiles}
            isLoading={isUploading}
            disabled={uploadingFiles.length === 0}
          >
            Upload {uploadingFiles.length > 0 ? `(${uploadingFiles.length} files)` : ''}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-16 lg:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Repository</h1>
          <p className="text-gray-600 mt-1">Access and manage all building related documents</p>
        </div>
        <Button 
          leftIcon={<FolderPlus size={16} />}
          variant="primary"
          onClick={() => setShowUploadModal(true)}
        >
          Upload Documents
        </Button>
      </div>
      
      {/* Categories */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`flex items-center px-4 py-2 rounded-lg border transition-all whitespace-nowrap ${
            selectedCategory === 'all'
              ? 'border-primary-500 bg-primary-50 text-primary-700' 
              : 'border-gray-200 hover:border-gray-300 text-gray-600'
          }`}
        >
          All Documents
        </button>
        {categories.map(category => {
          const Icon = category.icon;
          const isSelected = selectedCategory === category.id;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center px-4 py-2 rounded-lg border transition-all whitespace-nowrap ${
                isSelected 
                  ? 'border-primary-500 bg-primary-50 text-primary-700' 
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              <Icon size={16} className="mr-2" />
              {category.name}
            </button>
          );
        })}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Search documents..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
            />
            <Search 
              size={18} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
            />
          </div>
          <Button 
            variant="outline"
            leftIcon={<Filter size={16} />}
          >
            Filter
          </Button>
        </div>
      </div>

      {/* Documents List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No documents found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery || selectedCategory !== 'all' 
                ? 'Try changing your search or filter criteria' 
                : 'Get started by uploading your first document'}
            </p>
            <div className="mt-6">
              <Button
                variant="primary"
                leftIcon={<FolderPlus size={16} />}
                onClick={() => setShowUploadModal(true)}
              >
                Upload First Document
              </Button>
            </div>
          </div>
        ) : (
          documents.map((doc) => (
            <Card key={doc.id} hoverable>
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary-100">
                  <FileText className="h-5 w-5 text-primary-600" />
                </div>

                <div className="flex-1">
                  {editingDocumentId === doc.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-lg font-medium"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRename(doc);
                          if (e.key === 'Escape') handleCancelRename();
                        }}
                        autoFocus
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Save size={14} />}
                        onClick={() => handleSaveRename(doc)}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelRename}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <h3 className="text-lg font-medium">
                      {doc.storage_path.split('/').pop()?.replace(/^\d+-/, '') || doc.storage_path.split('/').pop()}
                    </h3>
                  )}
                  <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText size={14} />
                      <span>{doc.document_type}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Eye size={16} />}
                    onClick={() => handlePreview(doc)}
                  >
                    Preview
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Edit2 size={16} />}
                    onClick={() => handleStartRename(doc)}
                  >
                    Rename
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Download size={16} />}
                    onClick={async () => {
                      try {
                        const { data, error } = await supabase.storage
                          .from('documents')
                          .download(doc.storage_path);

                        if (error) throw error;

                        // Create a download link
                        const url = URL.createObjectURL(data);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = doc.storage_path.split('/').pop()?.replace(/^\d+-/, '') || doc.storage_path.split('/').pop();
                        document.body.appendChild(a);
                        a.click();
                        URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                      } catch (error) {
                        console.error('Error downloading file:', error);
                      }
                    }}
                  >
                    Download
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {showUploadModal && <UploadModal />}
      {showPreviewModal && <PreviewModal />}
    </div>
  );
};

export default Documents;