import React, { useState, useEffect } from 'react';
import { X, Upload, AlertTriangle, PenTool as Tool, Building2, MapPin, FileText } from 'lucide-react';
import Button from '../ui/Button';
import Portal from '../ui/Portal';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { validateUUIDSafe } from '../../utils/uuid';

interface CreateIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  buildingId: string;
  onIssueCreated?: () => void;
}

const CreateIssueModal = ({ isOpen, onClose, buildingId, onIssueCreated }: CreateIssueModalProps) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'mechanical',
    priority: 'medium',
    location: {
      unit: '',
      area: ''
    },
    files: [] as File[]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle escape key and body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'unit' || name === 'area') {
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [name]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateStep = (step: number): boolean => {
    setError(null);
    
    if (step === 1) {
      if (!formData.title.trim()) {
        setError('Title is required');
        return false;
      }
      if (!formData.description.trim()) {
        setError('Description is required');
        return false;
      }
    } else if (step === 2) {
      if (!formData.location.unit.trim()) {
        setError('Unit number is required');
        return false;
      }
      if (!formData.location.area.trim()) {
        setError('Area is required');
        return false;
      }
    }
    
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        files: [...Array.from(e.target.files || [])]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Final validation
    if (!validateStep(1) || !validateStep(2)) {
      return;
    }

    // Check if buildingId is provided and valid
    if (!buildingId) {
      setError('Building ID is required to create an issue');
      return;
    }

    // Validate UUID format
    const uuidValidation = validateUUIDSafe(buildingId);
    if (!uuidValidation.isValid) {
      setError(`Invalid building ID format: ${uuidValidation.error}`);
      console.error('UUID validation failed:', { buildingId, error: uuidValidation.error });
      return;
    }

    // Check if user is available
    if (!user?.id) {
      setError('User authentication required to create an issue');
      return;
    }

    setIsSubmitting(true);
    console.log('Creating issue with:', {
      buildingId,
      userId: user.id,
      userEmail: user.email,
      formData
    });

    try {
      // Create the issue
      const issueData = {
        building_id: buildingId,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        status: 'reported',
        reported_by: user.id,
        location: formData.location
      };

      console.log('Inserting issue data:', issueData);

      const { data: issue, error: issueError } = await supabase
        .from('issues')
        .insert([issueData])
        .select()
        .single();

      if (issueError) throw issueError;

      console.log('Issue created successfully:', issue);

      // Upload any attached files
      if (formData.files.length > 0 && issue) {
        console.log('Uploading files:', formData.files.length);
        for (const file of formData.files) {
          const filePath = `issues/${issue.id}/${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, file);

          if (uploadError) {
            console.warn('File upload error:', uploadError);
            // Don't throw here, just log the warning
          }
        }
      }
      
      // Reset form data
      setFormData({
        title: '',
        description: '',
        category: 'mechanical',
        priority: 'medium',
        location: {
          unit: '',
          area: ''
        },
        files: []
      });
      
      // Reset to first step
      setCurrentStep(1);

      console.log('Issue creation completed, calling callbacks');
      onIssueCreated?.();
      onClose();
    } catch (err: any) {
      console.error('Error creating issue:', err);
      setError(err.message || 'An error occurred while creating the issue');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 overflow-y-auto" style={{ zIndex: 9999 }}>
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
        <div className="flex min-h-screen items-center justify-center p-4" onClick={onClose}>
          <div
            className="relative w-full max-w-2xl rounded-lg bg-white shadow-xl"
            style={{ zIndex: 10000 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
          <div className="flex items-center justify-between border-b border-gray-200 p-4">
            <div className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-warning-500" />
              <h2 id="modal-title" className="text-lg font-semibold text-gray-900">Report New Issue</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="mb-4 rounded-md bg-error-50 p-4 text-sm text-error-500">
                {error}
              </div>
            )}

            {/* Step indicators */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  currentStep >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  1
                </div>
                <div className={`mx-2 h-1 w-8 ${
                  currentStep >= 2 ? 'bg-primary-600' : 'bg-gray-200'
                }`}></div>
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  currentStep >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  2
                </div>
                <div className={`mx-2 h-1 w-8 ${
                  currentStep >= 3 ? 'bg-primary-600' : 'bg-gray-200'
                }`}></div>
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  currentStep >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  3
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Step {currentStep} of 3
              </div>
            </div>

            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Issue Details</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Provide basic information about the issue
                  </p>
                </div>

                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Issue Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                    >
                      <option value="mechanical">Mechanical</option>
                      <option value="electrical">Electrical</option>
                      <option value="plumbing">Plumbing</option>
                      <option value="structural">Structural</option>
                      <option value="security">Security</option>
                      <option value="cleaning">Cleaning</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                      Priority
                    </label>
                    <select
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Location */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Issue Location</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Specify where the issue is located
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
                      Unit Number
                    </label>
                    <div className="relative mt-1">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Building2 className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="unit"
                        name="unit"
                        value={formData.location.unit}
                        onChange={handleChange}
                        className="block w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="area" className="block text-sm font-medium text-gray-700">
                      Specific Area
                    </label>
                    <div className="relative mt-1">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="area"
                        name="area"
                        value={formData.location.area}
                        onChange={handleChange}
                        className="block w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                        required
                        placeholder="e.g., Bathroom, Kitchen, Living Room"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Attachments */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Attachments</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Upload photos or documents related to the issue
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Photos & Documents
                  </label>
                  <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 py-10">
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4 flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500"
                        >
                          <span>Upload files</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            multiple
                            accept="image/*,.pdf,.doc,.docx"
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                      {formData.files.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-700">Selected files:</h4>
                          <ul className="mt-2 text-sm text-gray-500">
                            {formData.files.map((file, index) => (
                              <li key={index}>{file.name}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={isSubmitting}
                >
                  Back
                </Button>
              )}
              
              {currentStep < 3 ? (
                <Button
                  variant="primary"
                  onClick={handleNext}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                >
                  Submit Issue
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
};

export default CreateIssueModal;