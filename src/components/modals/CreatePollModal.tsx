import React, { useState } from 'react';
import { X, Plus, Trash2, Upload, Calendar, Users, FileText } from 'lucide-react';
import Button from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface PollOption {
  id: string;
  text: string;
  description: string;
}

interface CreatePollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPollCreated?: () => void;
}

const POLL_TYPES = [
  { value: 'binary', label: 'Yes/No/Abstain', description: 'Simple approval voting' },
  { value: 'multiple_choice', label: 'Multiple Choice', description: 'Choose from several options' },
  { value: 'supplier_selection', label: 'Supplier Selection', description: 'Compare quotes and suppliers' },
  { value: 'date_scheduling', label: 'Date Selection', description: 'Find the best meeting time' },
  { value: 'project_priority', label: 'Project Ranking', description: 'Rank projects by priority' },
  { value: 'satisfaction', label: 'Satisfaction Survey', description: 'Rate services or facilities' }
];

const CATEGORIES = [
  'Building Improvement',
  'Policy Change',
  'Financial',
  'Administrative',
  'Supplier Selection',
  'Project Prioritisation',
  'Date Scheduling',
  'Satisfaction Survey'
];

const CreatePollModal: React.FC<CreatePollModalProps> = ({ isOpen, onClose, onPollCreated }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Building Improvement',
    pollType: 'binary',
    votingMethod: 'single_choice',
    requiredMajority: 50,
    startDate: '',
    endDate: '',
    allowComments: true,
    allowAnonymous: false,
    showResultsDuring: false,
    maxSelections: 1,
    options: [] as PollOption[],
    files: [] as File[]
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const addOption = () => {
    const newOption: PollOption = {
      id: Date.now().toString(),
      text: '',
      description: ''
    };
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, newOption]
    }));
  };

  const updateOption = (id: string, field: 'text' | 'description', value: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map(option =>
        option.id === id ? { ...option, [field]: value } : option
      )
    }));
  };

  const removeOption = (id: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter(option => option.id !== id)
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        files: Array.from(e.target.files || [])
      }));
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.metadata?.buildingId) {
      setError('Building ID is required to create a poll');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create the poll
      const pollData = {
        building_id: user.metadata.buildingId,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        poll_type: formData.pollType,
        voting_method: formData.votingMethod,
        required_majority: formData.requiredMajority,
        start_date: formData.startDate,
        end_date: formData.endDate,
        status: new Date(formData.startDate) > new Date() ? 'upcoming' : 'active',
        created_by: user.id,
        allow_comments: formData.allowComments,
        allow_anonymous: formData.allowAnonymous,
        show_results_during: formData.showResultsDuring,
        max_selections: formData.maxSelections
      };

      const { data: poll, error: pollError } = await supabase
        .from('polls')
        .insert([pollData])
        .select()
        .single();

      if (pollError) throw pollError;

      // Add poll options if not binary
      if (formData.pollType !== 'binary' && formData.options.length > 0) {
        const optionsData = formData.options.map((option, index) => ({
          poll_id: poll.id,
          option_text: option.text,
          option_description: option.description,
          option_order: index + 1
        }));

        const { error: optionsError } = await supabase
          .from('poll_options')
          .insert(optionsData);

        if (optionsError) throw optionsError;
      }

      // Upload files if any
      if (formData.files.length > 0) {
        for (const file of formData.files) {
          const filePath = `polls/${poll.id}/${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, file);

          if (!uploadError) {
            await supabase
              .from('poll_attachments')
              .insert({
                poll_id: poll.id,
                file_name: file.name,
                file_path: filePath,
                file_size: file.size,
                file_type: file.type,
                uploaded_by: user.id
              });
          }
        }
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'Building Improvement',
        pollType: 'binary',
        votingMethod: 'single_choice',
        requiredMajority: 50,
        startDate: '',
        endDate: '',
        allowComments: true,
        allowAnonymous: false,
        showResultsDuring: false,
        maxSelections: 1,
        options: [],
        files: []
      });
      setCurrentStep(1);

      onPollCreated?.();
      onClose();
    } catch (err: any) {
      console.error('Error creating poll:', err);
      setError(err.message || 'An error occurred while creating the poll');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const selectedPollType = POLL_TYPES.find(type => type.value === formData.pollType);
  const needsOptions = !['binary', 'satisfaction'].includes(formData.pollType);

  return (
    <div className="fixed inset-0 overflow-y-auto" style={{ zIndex: 9999 }}>
      <div className="fixed inset-0 bg-transparent transition-opacity" onClick={onClose} />
      <div className="flex min-h-screen items-center justify-center p-4" onClick={onClose}>
        <div
          className="relative w-full max-w-4xl rounded-lg bg-white shadow-xl"
          style={{ zIndex: 10000 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-gray-200 p-6">
            <div className="flex items-center">
              <Users className="mr-3 h-6 w-6 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900">Create New Poll</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="mb-4 rounded-md bg-error-50 p-4 text-sm text-error-500">
                {error}
              </div>
            )}

            {/* Step indicators */}
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center">
                {[1, 2, 3].map((step) => (
                  <React.Fragment key={step}>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      currentStep >= step ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {step}
                    </div>
                    {step < 3 && (
                      <div className={`mx-4 h-1 w-12 ${
                        currentStep > step ? 'bg-primary-600' : 'bg-gray-200'
                      }`}></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
              <div className="text-sm text-gray-500">
                Step {currentStep} of 3
              </div>
            </div>

            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Poll Details</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Set up the basic information for your poll
                  </p>
                </div>

                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Poll Title
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
                      {CATEGORIES.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="pollType" className="block text-sm font-medium text-gray-700">
                      Poll Type
                    </label>
                    <select
                      id="pollType"
                      name="pollType"
                      value={formData.pollType}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                    >
                      {POLL_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {selectedPollType && (
                  <div className="rounded-lg bg-blue-50 p-4">
                    <p className="text-sm text-blue-700">{selectedPollType.description}</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Options & Settings */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Poll Configuration</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Configure voting options and poll settings
                  </p>
                </div>

                {/* Poll Options for non-binary polls */}
                {needsOptions && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Poll Options
                      </label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        leftIcon={<Plus size={16} />}
                        onClick={addOption}
                      >
                        Add Option
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {formData.options.map((option, index) => (
                        <div key={option.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-1 space-y-3">
                              <input
                                type="text"
                                placeholder={`Option ${index + 1} title`}
                                value={option.text}
                                onChange={(e) => updateOption(option.id, 'text', e.target.value)}
                                className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                                required
                              />
                              <textarea
                                placeholder="Optional description"
                                value={option.description}
                                onChange={(e) => updateOption(option.id, 'description', e.target.value)}
                                className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                                rows={2}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeOption(option.id)}
                              className="text-error-500 hover:text-error-700"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {formData.options.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                        <p>No options added yet. Click "Add Option" to get started.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Voting Settings */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="requiredMajority" className="block text-sm font-medium text-gray-700">
                      Required Majority (%)
                    </label>
                    <input
                      type="number"
                      id="requiredMajority"
                      name="requiredMajority"
                      min="1"
                      max="100"
                      value={formData.requiredMajority}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>

                  {formData.pollType === 'multiple_choice' && (
                    <div>
                      <label htmlFor="maxSelections" className="block text-sm font-medium text-gray-700">
                        Max Selections
                      </label>
                      <input
                        type="number"
                        id="maxSelections"
                        name="maxSelections"
                        min="1"
                        value={formData.maxSelections}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                      />
                    </div>
                  )}
                </div>

                {/* Poll Features */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700">Poll Features</h4>

                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="allowComments"
                        checked={formData.allowComments}
                        onChange={handleChange}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Allow comments and discussion</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="allowAnonymous"
                        checked={formData.allowAnonymous}
                        onChange={handleChange}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Allow anonymous voting</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="showResultsDuring"
                        checked={formData.showResultsDuring}
                        onChange={handleChange}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Show results while poll is active</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Schedule & Attachments */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Schedule & Attachments</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Set the poll timeline and add supporting documents
                  </p>
                </div>

                {/* Date Settings */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                      Start Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                      End Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                      required
                    />
                  </div>
                </div>

                {/* File Attachments */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supporting Documents
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
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
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PDF, DOC, XLS, images up to 10MB each</p>

                      {formData.files.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-700">Selected files:</h4>
                          <ul className="mt-2 text-sm text-gray-500">
                            {formData.files.map((file, index) => (
                              <li key={index} className="flex items-center justify-between py-1">
                                <span>{file.name}</span>
                                <span className="text-xs">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="mt-8 flex justify-end space-x-3">
              {currentStep > 1 && (
                <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
                  Back
                </Button>
              )}
              
              {currentStep < 3 ? (
                <Button variant="primary" onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button type="submit" variant="primary" isLoading={isSubmitting}>
                  Create Poll
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePollModal;
