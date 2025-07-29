import React, { useState, useEffect } from 'react';
import { X, Upload, AlertTriangle, PenTool as Tool, Building2, MapPin, FileText } from 'lucide-react';
import Button from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { validateUUIDSafe } from '../../utils/uuid';
import { createPortal } from 'react-dom';

interface IsolatedCreateIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  buildingId: string;
  onIssueCreated?: () => void;
}

/**
 * Completely isolated modal that bypasses ALL existing CSS conflicts
 * Uses direct DOM manipulation and inline styles only
 */
const IsolatedCreateIssueModal = ({ isOpen, onClose, buildingId, onIssueCreated }: IsolatedCreateIssueModalProps) => {
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

  // Create isolated portal container
  useEffect(() => {
    if (isOpen) {
      // Create isolated container
      const container = document.createElement('div');
      container.id = 'isolated-modal-container';
      container.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        z-index: 999999 !important;
        pointer-events: auto !important;
        background-color: transparent !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 16px !important;
      `;
      
      document.body.appendChild(container);
      document.body.style.overflow = 'hidden';

      return () => {
        if (container.parentNode) {
          container.parentNode.removeChild(container);
        }
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      console.log('Isolated modal backdrop clicked');
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }
    if (!formData.location.unit.trim()) {
      setError('Unit number is required');
      return;
    }
    if (!formData.location.area.trim()) {
      setError('Area is required');
      return;
    }

    if (!buildingId || !user?.id) {
      setError('Missing required information');
      return;
    }

    setIsSubmitting(true);

    try {
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

      const { data: issue, error: issueError } = await supabase
        .from('issues')
        .insert([issueData])
        .select()
        .single();

      if (issueError) throw issueError;

      console.log('Issue created successfully:', issue);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'mechanical',
        priority: 'medium',
        location: { unit: '', area: '' },
        files: []
      });
      setCurrentStep(1);
      
      onIssueCreated?.();
      onClose();
    } catch (error) {
      console.error('Error creating issue:', error);
      setError('Failed to create issue. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      style={{
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        zIndex: '999999',
        pointerEvents: 'auto',
        backgroundColor: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={handleBackdropClick}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          pointerEvents: 'auto',
          zIndex: '1000000'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <AlertTriangle style={{ marginRight: '8px', color: '#f59e0b' }} size={20} />
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0' }}>Report New Issue</h2>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {error && (
            <div style={{ 
              backgroundColor: '#fef2f2', 
              color: '#dc2626', 
              padding: '12px', 
              borderRadius: '6px', 
              marginBottom: '16px',
              border: '1px solid #fecaca'
            }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
              Issue Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
              placeholder="Brief description of the issue"
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                minHeight: '80px',
                resize: 'vertical'
              }}
              placeholder="Detailed description of the issue"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                Unit Number *
              </label>
              <input
                type="text"
                value={formData.location.unit}
                onChange={(e) => setFormData(prev => ({ ...prev, location: { ...prev.location, unit: e.target.value } }))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                placeholder="e.g., 4B"
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                Area *
              </label>
              <input
                type="text"
                value={formData.location.area}
                onChange={(e) => setFormData(prev => ({ ...prev, location: { ...prev.location, area: e.target.value } }))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                placeholder="e.g., Kitchen"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '8px 16px',
                backgroundColor: isSubmitting ? '#9ca3af' : '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              {isSubmitting ? 'Creating...' : 'Create Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Render directly to body to bypass ALL CSS
  return createPortal(modalContent, document.body);
};

export default IsolatedCreateIssueModal;
