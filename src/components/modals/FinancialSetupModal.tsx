import React, { useState, useEffect } from 'react';
import { X, Wallet, PiggyBank, Calendar, AlertTriangle, CheckCircle2, ArrowRight, Info, DollarSign, Briefcase, Droplet, Zap, Brush, Wrench, Shield } from 'lucide-react';
import Button from '../ui/Button';
import Portal from '../ui/Portal';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { ensureBuildingAssociation } from '../../utils/buildingUtils';

interface FinancialSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSetupComplete: () => void;
}

const FinancialSetupModal = ({ isOpen, onClose, onSetupComplete }: FinancialSetupModalProps) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const initialFormData = {
    serviceChargeAccountBalance: '',
    reserveFundBalance: '',
    serviceChargeFrequency: 'Quarterly',
    totalAnnualBudget: '',
    annualMaintenanceBudget: '',
    annualInsuranceBudget: '',
    annualUtilitiesBudget: '',
    annualCleaningBudget: '',
    annualManagementFee: '',
    annualReserveContribution: '',
    hasMajorWorks: false,
    majorWorksDescription: '',
    majorWorksCost: '',
    currency: 'GBP',
    setupCompleted: false
  };
  
  const [formData, setFormData] = useState(initialFormData);

  // Fetch existing building data to pre-populate service charge frequency
  useEffect(() => {
    const fetchBuildingData = async () => {
      if (!user?.metadata?.buildingId) return;
      
      try {
        const { data, error } = await supabase
          .from('financial_setup')
          .select('*')
          .eq('building_id', user.metadata.buildingId)
          .maybeSingle();
          
        if (error) throw error;
        
        if (data) {
          // Pre-fill form with existing data
          setFormData({
            serviceChargeAccountBalance: data.service_charge_account_balance || 0,
            reserveFundBalance: data.reserve_fund_balance || 0,
            serviceChargeFrequency: data.service_charge_frequency || 'Quarterly',
            totalAnnualBudget: data.total_annual_budget || 0,
            annualMaintenanceBudget: data.annual_maintenance_budget || 0,
            annualInsuranceBudget: data.annual_insurance_budget || 0,
            annualUtilitiesBudget: data.annual_utilities_budget || 0,
            annualCleaningBudget: data.annual_cleaning_budget || 0,
            annualManagementFee: data.annual_management_fee || 0,
            annualReserveContribution: data.annual_reserve_contribution || 0,
            hasMajorWorks: data.has_major_works || false,
            majorWorksDescription: data.major_works_description || '',
            majorWorksCost: data.major_works_cost || 0,
            currency: data.currency || 'GBP',
            setupCompleted: data.setup_completed || false
          });
        } else {
          // Set defaults for new setup
          setFormData({
            ...initialFormData,
            serviceChargeFrequency: 'Quarterly'
          });
        }
      } catch (error) {
        console.error('Error fetching building data:', error);
        setFormData(prev => ({
          ...prev,
          serviceChargeFrequency: 'Quarterly' // Default if error
        }));
      }
    };
    
    fetchBuildingData();
  }, [user?.metadata?.buildingId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      // Handle number inputs - keep as string if empty, convert to number otherwise
      if (value === '') {
        setFormData(prev => ({ ...prev, [name]: '' }));
      } else {
        const numValue = parseFloat(value);
        setFormData(prev => ({ ...prev, [name]: isNaN(numValue) ? '' : numValue }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateStep = (step: number): boolean => {
    setError(null);

    if (step === 1) {
      // Debug logging to understand the validation issue
      console.log('Validating step 1:', {
        serviceChargeAccountBalance: formData.serviceChargeAccountBalance,
        reserveFundBalance: formData.reserveFundBalance,
        serviceChargeFrequency: formData.serviceChargeFrequency,
        serviceChargeAccountBalanceType: typeof formData.serviceChargeAccountBalance,
        reserveFundBalanceType: typeof formData.reserveFundBalance
      });

      // Ensure values are numbers and handle potential string/NaN issues
      const serviceChargeBalance = formData.serviceChargeAccountBalance === '' ? 0 : Number(formData.serviceChargeAccountBalance);
      const reserveBalance = formData.reserveFundBalance === '' ? 0 : Number(formData.reserveFundBalance);

      if (isNaN(serviceChargeBalance) || serviceChargeBalance < 0) {
        setError('Service charge account balance must be zero or positive');
        return false;
      }
      if (isNaN(reserveBalance) || reserveBalance < 0) {
        setError('Reserve fund balance must be zero or positive');
        return false;
      }
      if (!formData.serviceChargeFrequency || formData.serviceChargeFrequency.trim() === '') {
        setError('Please select a service charge collection frequency');
        return false;
      }
    } else if (step === 2) {
      // Calculate total budget from components
      const calculatedTotal =
        (formData.annualMaintenanceBudget === '' ? 0 : Number(formData.annualMaintenanceBudget)) +
        (formData.annualInsuranceBudget === '' ? 0 : Number(formData.annualInsuranceBudget)) +
        (formData.annualUtilitiesBudget === '' ? 0 : Number(formData.annualUtilitiesBudget)) +
        (formData.annualCleaningBudget === '' ? 0 : Number(formData.annualCleaningBudget)) +
        (formData.annualManagementFee === '' ? 0 : Number(formData.annualManagementFee)) +
        (formData.annualReserveContribution === '' ? 0 : Number(formData.annualReserveContribution));

      if (calculatedTotal <= 0) {
        setError('At least one budget category must have a value greater than zero');
        return false;
      }
      if (formData.hasMajorWorks && !formData.majorWorksDescription) {
        setError('Please provide a description for the major works');
        return false;
      }
      if (formData.hasMajorWorks && Number(formData.majorWorksCost) <= 0) {
        setError('Major works cost must be greater than zero');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    console.log('Next button clicked, current step:', currentStep);
    console.log('Current form data:', formData);

    const isValid = validateStep(currentStep);
    console.log('Validation result:', isValid);

    if (isValid) {
      console.log('Validation passed, moving to next step');
      setCurrentStep(prev => prev + 1);
    } else {
      console.log('Validation failed, staying on current step');
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Final validation
    if (!validateStep(currentStep)) {
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Ensure we have a valid building association
      const buildingAssociation = await ensureBuildingAssociation(user);

      if (!buildingAssociation) {
        throw new Error('Unable to establish building association. Please contact support.');
      }

      const { buildingId, isNewBuilding } = buildingAssociation;
      console.log('Financial setup for building:', buildingId, isNewBuilding ? '(newly created)' : '(existing)');

      const { data, error } = await supabase
        .from('financial_setup')
        .upsert({
          building_id: buildingId,
          service_charge_account_balance: formData.serviceChargeAccountBalance === '' ? 0 : Number(formData.serviceChargeAccountBalance),
          reserve_fund_balance: formData.reserveFundBalance === '' ? 0 : Number(formData.reserveFundBalance),
          service_charge_frequency: formData.serviceChargeFrequency,
          annual_maintenance_budget: formData.annualMaintenanceBudget === '' ? 0 : Number(formData.annualMaintenanceBudget),
          annual_insurance_budget: formData.annualInsuranceBudget === '' ? 0 : Number(formData.annualInsuranceBudget),
          annual_utilities_budget: formData.annualUtilitiesBudget === '' ? 0 : Number(formData.annualUtilitiesBudget),
          annual_cleaning_budget: formData.annualCleaningBudget === '' ? 0 : Number(formData.annualCleaningBudget),
          annual_management_fee: formData.annualManagementFee === '' ? 0 : Number(formData.annualManagementFee),
          annual_reserve_contribution: formData.annualReserveContribution === '' ? 0 : Number(formData.annualReserveContribution),
          has_major_works: formData.hasMajorWorks,
          major_works_description: formData.majorWorksDescription,
          major_works_cost: formData.majorWorksCost === '' ? 0 : Number(formData.majorWorksCost),
          currency: formData.currency,
          setup_completed: true,
          created_by: user?.id
        })
        .select();

      if (error) throw error;
      
      setSuccess(true);
      setTimeout(() => {
        onSetupComplete();
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('Financial setup error:', err);

      // Handle specific database trigger errors
      if (err.message && err.message.includes('has no field "role"')) {
        setError('Database configuration issue detected. Please contact support or try again in a few minutes.');
      } else if (err.message && err.message.includes('permission denied')) {
        setError('You do not have permission to complete financial setup. Please ensure you are a director.');
      } else {
        setError(err.message || 'An unexpected error occurred. Please try again.');
      }
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
              <Wallet className="mr-2 h-5 w-5 text-primary-500" />
              <h2 id="modal-title" className="text-lg font-semibold text-gray-900">Financial Setup</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6">
            {success ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="mb-4 rounded-full bg-success-100 p-3">
                  <CheckCircle2 className="h-8 w-8 text-success-600" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">Setup Complete!</h3>
                <p className="text-center text-gray-600">
                  Your financial information has been saved successfully. Your dashboard will now show your financial data and reports.
                </p>
                <Button 
                  variant="primary" 
                  className="mt-6"
                  onClick={onClose}
                >
                  Return to Dashboard
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="mb-4 rounded-md bg-error-50 p-4 text-sm text-error-500">
                    {error}
                  </div>
                )}

                {/* Step indicators */}
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                      currentStep >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      1
                    </div>
                    <div className={`mx-2 h-1 w-8 transition-colors ${
                      currentStep >= 2 ? 'bg-primary-600' : 'bg-gray-200'
                    }`}></div>
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                      currentStep >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      2
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Step {currentStep} of 2
                  </div>
                </div>

                {/* Step 1: Account Balances */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="bg-primary-50 border border-primary-100 rounded-lg p-4 mb-6">
                      <div className="flex items-start">
                        <Info className="h-5 w-5 text-primary-600 mr-2 mt-0.5" />
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">Account Balances</h3>
                          <p className="mt-1 text-sm text-primary-700">
                            Enter your current financial account balances to set up your financial dashboard
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                      <h4 className="font-medium text-gray-900 mb-2">Current Account Balances</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        These are the current balances in your building's accounts
                      </p>

                      <div className="space-y-4">
                        <div>
                          <label htmlFor="serviceChargeAccountBalance" className="block text-sm font-medium text-gray-700">
                            Service Charge Account Balance (£)
                          </label>
                          <div className="relative mt-1">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                              <Wallet className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="number"
                              id="serviceChargeAccountBalance"
                              name="serviceChargeAccountBalance"
                              value={formData.serviceChargeAccountBalance}
                              onChange={handleChange}
                              className="block w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                              step="0.01"
                              min="0"
                              placeholder="0"
                              inputMode="decimal"
                            />
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            Current balance in your service charge account
                          </p>
                        </div>

                        <div>
                          <label htmlFor="reserveFundBalance" className="block text-sm font-medium text-gray-700">
                            Reserve Fund Balance (£)
                          </label>
                          <div className="relative mt-1">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                              <PiggyBank className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="number"
                              id="reserveFundBalance"
                              name="reserveFundBalance"
                              value={formData.reserveFundBalance}
                              onChange={handleChange}
                              className="block w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                              step="0.01"
                              min="0"
                              placeholder="0"
                              inputMode="decimal"
                            />
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            Current balance in your reserve/sinking fund
                          </p>
                        </div>

                        <div>
                          <label htmlFor="serviceChargeFrequency" className="block text-sm font-medium text-gray-700">
                            Service Charge Collection Frequency
                          </label>
                          <div className="relative mt-1">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                              <Calendar className="h-5 w-5 text-gray-400" />
                            </div>
                            <select
                              id="serviceChargeFrequency"
                              name="serviceChargeFrequency"
                              value={formData.serviceChargeFrequency}
                              onChange={handleChange}
                              className="block w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                            >
                              <option value="Monthly">Monthly</option>
                              <option value="Quarterly">Quarterly</option>
                              <option value="Bi-Annually">Bi-Annually</option>
                              <option value="Annually">Annually</option>
                            </select>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            How often service charges are collected from leaseholders
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Budget Information */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="bg-primary-50 border border-primary-100 rounded-lg p-4 mb-6">
                      <div className="flex items-start">
                        <Info className="h-5 w-5 text-primary-600 mr-2 mt-0.5" />
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">Annual Budget</h3>
                          <p className="mt-1 text-sm text-primary-700">
                            Break down your annual budget by category to track spending more effectively
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm mb-6">
                      <h4 className="font-medium text-gray-900 mb-2">Annual Budget Breakdown</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Enter your annual budget for each category
                      </p>

                      <div className="space-y-4">
                        <div>
                          <label htmlFor="annualMaintenanceBudget" className="block text-sm font-medium text-gray-700">
                            Maintenance & Repairs (£)
                          </label>
                          <div className="relative mt-1">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                              <Wrench className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="number"
                              id="annualMaintenanceBudget"
                              name="annualMaintenanceBudget"
                              value={formData.annualMaintenanceBudget}
                              onChange={handleChange}
                              className="block w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                              step="0.01"
                              min="0"
                              placeholder="0"
                              inputMode="decimal"
                            />
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            Regular maintenance and repairs for the building
                          </p>
                        </div>

                        <div>
                          <label htmlFor="annualInsuranceBudget" className="block text-sm font-medium text-gray-700">
                            Insurance (£)
                          </label>
                          <div className="relative mt-1">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                              <Shield className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="number"
                              id="annualInsuranceBudget"
                              name="annualInsuranceBudget"
                              value={formData.annualInsuranceBudget}
                              onChange={handleChange}
                              className="block w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                              step="0.01"
                              min="0"
                              placeholder="0"
                              inputMode="decimal"
                            />
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            Building insurance and other insurance costs
                          </p>
                        </div>

                        <div>
                          <label htmlFor="annualUtilitiesBudget" className="block text-sm font-medium text-gray-700">
                            Utilities (£)
                          </label>
                          <div className="relative mt-1">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                              <Zap className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="number"
                              id="annualUtilitiesBudget"
                              name="annualUtilitiesBudget"
                              value={formData.annualUtilitiesBudget}
                              onChange={handleChange}
                              className="block w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                              step="0.01"
                              min="0"
                              placeholder="0"
                              inputMode="decimal"
                            />
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            Electricity, water, gas for common areas
                          </p>
                        </div>

                        <div>
                          <label htmlFor="annualCleaningBudget" className="block text-sm font-medium text-gray-700">
                            Cleaning & Grounds (£)
                          </label>
                          <div className="relative mt-1">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                              <Brush className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="number"
                              id="annualCleaningBudget"
                              name="annualCleaningBudget"
                              value={formData.annualCleaningBudget}
                              onChange={handleChange}
                              className="block w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                              step="1"
                              min="0"
                              placeholder="0"
                            />
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            Cleaning services and grounds maintenance
                          </p>
                        </div>

                        <div>
                          <label htmlFor="annualManagementFee" className="block text-sm font-medium text-gray-700">
                            Management Fees (£)
                          </label>
                          <div className="relative mt-1">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                              <Briefcase className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="number"
                              id="annualManagementFee"
                              name="annualManagementFee"
                              value={formData.annualManagementFee}
                              onChange={handleChange}
                              className="block w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                              step="1"
                              min="0"
                              placeholder="0"
                            />
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            Fees for property management services
                          </p>
                        </div>

                        <div>
                          <label htmlFor="annualReserveContribution" className="block text-sm font-medium text-gray-700">
                            Reserve Fund Contribution (£)
                          </label>
                          <div className="relative mt-1">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                              <PiggyBank className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="number"
                              id="annualReserveContribution"
                              name="annualReserveContribution"
                              value={formData.annualReserveContribution}
                              onChange={handleChange}
                              className="block w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                              step="1"
                              min="0"
                              placeholder="0"
                            />
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            Annual contribution to the reserve/sinking fund
                          </p>
                        </div>
                        
                        <div className="pt-4 mt-4 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <div className="font-medium">Total Annual Budget</div>
                            <div className="text-lg font-bold">
                              £{(
                                formData.annualMaintenanceBudget +
                                formData.annualInsuranceBudget +
                                formData.annualUtilitiesBudget +
                                formData.annualCleaningBudget +
                                formData.annualManagementFee +
                                formData.annualReserveContribution
                              ).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                      <h4 className="font-medium text-gray-900 mb-2">Major Works Planning</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Indicate if you have any planned major works in the next 12 months
                      </p>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="hasMajorWorks"
                          name="hasMajorWorks"
                          checked={formData.hasMajorWorks}
                          onChange={(e) => setFormData(prev => ({ ...prev, hasMajorWorks: e.target.checked }))}
                          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <label htmlFor="hasMajorWorks" className="ml-2 block text-sm text-gray-700">
                          Planned major works in the next 12 months
                        </label>
                      </div>

                      {formData.hasMajorWorks && (
                        <>
                          <div>
                            <label htmlFor="majorWorksDescription" className="block text-sm font-medium text-gray-700">
                              Description of Major Works
                            </label>
                            <div className="mt-1">
                              <textarea
                                id="majorWorksDescription"
                                name="majorWorksDescription"
                                value={formData.majorWorksDescription}
                                onChange={handleChange}
                                rows={3}
                                className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                                required={formData.hasMajorWorks}
                                placeholder="Describe the planned major works..."
                              />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                              Provide details about the scope and nature of the works
                            </p>
                          </div>

                          <div>
                            <label htmlFor="majorWorksCost" className="block text-sm font-medium text-gray-700">
                              Estimated Cost (£)
                            </label>
                            <div className="relative mt-1">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Wallet className="h-5 w-5 text-gray-400" />
                              </div>
                              <div className="flex">
                                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                                  £
                                </span>
                                <input
                                  type="number"
                                  id="majorWorksCost"
                                  name="majorWorksCost"
                                  value={formData.majorWorksCost}
                                  onChange={handleChange}
                                  className="block w-full rounded-none rounded-r-md border border-gray-300 pl-3 pr-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                                  step="1"
                                  min="0"
                                  required={formData.hasMajorWorks}
                                  placeholder="0"
                                />
                              </div>
                              <p className="mt-1 text-xs text-gray-500">
                                Estimated total cost of the planned major works
                              </p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-6 flex justify-end space-x-3">
                  {currentStep > 1 && (
                    <Button
                      variant="ghost"
                      onClick={handleBack}
                      disabled={isSubmitting}
                    >
                      Back
                    </Button>
                  )}
                  
                  {currentStep < 2 ? (
                    <Button
                      variant="primary"
                      rightIcon={<ArrowRight size={16} />}
                      onClick={handleNext}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={isSubmitting}
                      disabled={isSubmitting}
                    >
                      Complete Setup
                    </Button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default FinancialSetupModal;