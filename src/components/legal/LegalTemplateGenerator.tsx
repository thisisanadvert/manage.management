import React, { useState } from 'react';
import { FileText, Download, Copy, Eye, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { LegalTemplate, TemplateVariable } from '../../types/legal';
import { LegalComplianceService } from '../../services/legalComplianceService';

interface LegalTemplateGeneratorProps {
  template: LegalTemplate;
  onGenerate?: (content: string, variables: Record<string, any>) => void;
  className?: string;
}

const LegalTemplateGenerator: React.FC<LegalTemplateGeneratorProps> = ({
  template,
  onGenerate,
  className = ''
}) => {
  const [variables, setVariables] = useState<Record<string, any>>({});
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleVariableChange = (name: string, value: any) => {
    setVariables(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    template.variables.forEach(variable => {
      if (variable.required && !variables[variable.name]) {
        console.log(`Missing required field: ${variable.name} (${variable.description})`);
        newErrors[variable.name] = `${variable.description} is required`;
      }
    });

    console.log('Validation errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerate = () => {
    console.log('Generate button clicked');
    console.log('Current variables:', variables);
    console.log('Template variables:', template.variables);

    if (!validateForm()) {
      console.log('Validation failed, errors:', errors);
      return;
    }

    console.log('Validation passed, generating content...');
    const content = LegalComplianceService.processTemplate(template.id, variables);
    console.log('Generated content:', content);
    setGeneratedContent(content);
    setShowPreview(true);

    if (onGenerate) {
      onGenerate(content, variables);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([generatedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.title.toLowerCase().replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderVariableInput = (variable: TemplateVariable) => {
    const value = variables[variable.name] || variable.defaultValue || '';
    const hasError = !!errors[variable.name];

    const baseInputClasses = `block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
      hasError 
        ? 'border-red-300 bg-red-50' 
        : 'border-gray-300 bg-white'
    }`;

    switch (variable.type) {
      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleVariableChange(variable.name, e.target.value)}
            className={baseInputClasses}
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleVariableChange(variable.name, e.target.value)}
            className={baseInputClasses}
          />
        );
      
      case 'currency':
        return (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">£</span>
            </div>
            <input
              type="number"
              step="0.01"
              value={value}
              onChange={(e) => handleVariableChange(variable.name, e.target.value)}
              className={`${baseInputClasses} pl-7`}
            />
          </div>
        );
      
      case 'boolean':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={value === true || value === 'true'}
              onChange={(e) => handleVariableChange(variable.name, e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">
              {variable.description}
            </label>
          </div>
        );
      
      case 'text':
      case 'address':
      default:
        return variable.description.toLowerCase().includes('description') || 
               variable.description.toLowerCase().includes('details') ? (
          <textarea
            value={value}
            onChange={(e) => handleVariableChange(variable.name, e.target.value)}
            rows={3}
            className={baseInputClasses}
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => handleVariableChange(variable.name, e.target.value)}
            className={baseInputClasses}
          />
        );
    }
  };

  return (
    <div className={className}>
      <Card className="p-6">
        {/* Template Header */}
        <div className="flex items-start space-x-3 mb-6">
          <div className="flex-shrink-0">
            <FileText className="h-6 w-6 text-primary-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {template.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {template.description}
            </p>
            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
              <span>Version {template.version}</span>
              <span>•</span>
              <span>Last updated: {template.lastUpdated.toLocaleDateString('en-GB')}</span>
            </div>
          </div>
        </div>

        {/* Variable Inputs */}
        <div className="space-y-4 mb-6">
          <h4 className="text-sm font-medium text-gray-900">
            Template Variables
          </h4>
          
          {template.variables.map((variable) => (
            <div key={variable.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {variable.description}
                {variable.required && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </label>
              
              {renderVariableInput(variable)}
              
              {errors[variable.name] && (
                <div className="flex items-center space-x-1 mt-1">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-600">
                    {errors[variable.name]}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleGenerate}
            leftIcon={<Eye className="h-4 w-4" />}
            variant="primary"
          >
            Generate Preview
          </Button>
          
          {generatedContent && (
            <>
              <Button
                onClick={handleCopy}
                leftIcon={<Copy className="h-4 w-4" />}
                variant="outline"
              >
                Copy
              </Button>
              
              <Button
                onClick={handleDownload}
                leftIcon={<Download className="h-4 w-4" />}
                variant="outline"
              >
                Download
              </Button>
            </>
          )}
        </div>

        {/* Preview */}
        {showPreview && generatedContent && (
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Generated Document Preview
            </h4>
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                {generatedContent}
              </pre>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default LegalTemplateGenerator;
