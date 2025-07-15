import React, { useState, useEffect } from 'react';
import { BudgetItem } from '../../types/finances';

interface BudgetItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: BudgetItem) => void;
  editingItem: BudgetItem | null;
  categories: {
    income: string[];
    expense: string[];
  };
}

const BudgetItemModal: React.FC<BudgetItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
  categories,
}) => {
  const [formData, setFormData] = useState<BudgetItem>({
    id: '',
    category: '',
    description: '',
    quarterlyEstimate: 0,
    annualEstimate: 0,
    type: 'expense',
    notes: ''
  });

  useEffect(() => {
    if (editingItem) {
      setFormData(editingItem);
    } else {
      setFormData({
        id: '',
        category: '',
        description: '',
        quarterlyEstimate: 0,
        annualEstimate: 0,
        type: 'expense',
        notes: ''
      });
    }
  }, [editingItem, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'type') {
      setFormData({
        ...formData,
        [name]: value,
        category: '' // Reset category when type changes
      });
    } else if (name === 'quarterlyEstimate' || name === 'annualEstimate') {
      setFormData({
        ...formData,
        [name]: value === '' ? 0 : parseFloat(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted!', formData);
    onSave(formData);
  };

  // Debug click handler
  const handleDebugClick = (e: React.MouseEvent) => {
    console.log('Modal clicked!', e.target);
    e.stopPropagation();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      style={{ pointerEvents: 'auto' }}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        style={{ pointerEvents: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {editingItem ? 'Edit Budget Item' : 'Add Budget Item'}
          </h3>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
            style={{ pointerEvents: 'auto' }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type *</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  required
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  required
                >
                  <option value="">Select category</option>
                  {categories[formData.type].map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description *</label>
              <input
                type="text"
                name="description"
                id="description"
                value={formData.description}
                onChange={handleChange}
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                placeholder="Enter description"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="quarterlyEstimate" className="block text-sm font-medium text-gray-700">Quarterly Estimate (£)</label>
                <input
                  type="number"
                  name="quarterlyEstimate"
                  id="quarterlyEstimate"
                  value={formData.quarterlyEstimate === 0 ? '' : formData.quarterlyEstimate}
                  onChange={handleChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label htmlFor="annualEstimate" className="block text-sm font-medium text-gray-700">Annual Estimate (£)</label>
                <input
                  type="number"
                  name="annualEstimate"
                  id="annualEstimate"
                  value={formData.annualEstimate === 0 ? '' : formData.annualEstimate}
                  onChange={handleChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                placeholder="Additional notes or details"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose();
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                style={{ pointerEvents: 'auto' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                disabled={!formData.category || !formData.description}
                style={{ pointerEvents: 'auto' }}
              >
                {editingItem ? 'Update' : 'Add'} Budget Item
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetItemModal;
