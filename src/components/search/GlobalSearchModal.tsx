/**
 * Global Search Modal
 * Full-screen search interface with results overlay
 */

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useSearch } from '../../contexts/SearchContext';
import GlobalSearchBar from './GlobalSearchBar';
import SearchResults from './SearchResults';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose
}) => {
  const { currentResults, clearSearch } = useSearch();

  // Handle escape key
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

  // Clear search when modal closes
  useEffect(() => {
    if (!isOpen) {
      clearSearch();
    }
  }, [isOpen, clearSearch]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1200] bg-black bg-opacity-50 flex items-start justify-center pt-16">
      {/* Modal Container */}
      <div className="w-full max-w-4xl mx-4 bg-white rounded-lg shadow-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Search</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <GlobalSearchBar
            placeholder="Search across all your building data..."
            showFilters={true}
            autoFocus={true}
            onResultClick={onClose}
          />
        </div>

        {/* Results */}
        <div className="flex-1 overflow-hidden">
          <SearchResults
            onResultClick={onClose}
            maxHeight="100%"
            showCategories={true}
          />
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchModal;
