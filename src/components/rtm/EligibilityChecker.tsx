import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, Home, Users, Calendar, Percent } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface EligibilityData {
  totalFlats: number;
  residentialFlats: number;
  commercialUnits: number;
  landlordResides: boolean;
  averageLeaseLength: number;
  participatingLeaseholders: number;
  buildingAge: number;
  hasFreeholder: boolean;
}

interface EligibilityResult {
  eligible: boolean;
  reasons: string[];
  warnings: string[];
  nextSteps: string[];
}

const EligibilityChecker: React.FC = () => {
  const [formData, setFormData] = useState<EligibilityData>({
    totalFlats: 0,
    residentialFlats: 0,
    commercialUnits: 0,
    landlordResides: false,
    averageLeaseLength: 0,
    participatingLeaseholders: 0,
    buildingAge: 0,
    hasFreeholder: true
  });

  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const checkEligibility = (): EligibilityResult => {
    const reasons: string[] = [];
    const warnings: string[] = [];
    const nextSteps: string[] = [];
    let eligible = true;

    // Check minimum flats requirement
    if (formData.totalFlats < 2) {
      eligible = false;
      reasons.push('Building must contain at least 2 flats');
    }

    // Check residential percentage (must be at least 75%)
    const residentialPercentage = (formData.residentialFlats / formData.totalFlats) * 100;
    if (residentialPercentage < 75) {
      eligible = false;
      reasons.push(`Building must be at least 75% residential (currently ${residentialPercentage.toFixed(1)}%)`);
    }

    // Check landlord residency rule (for buildings with 4 or fewer flats)
    if (formData.totalFlats <= 4 && formData.landlordResides) {
      eligible = false;
      reasons.push('Landlord cannot reside in buildings with 4 or fewer flats for RTM to apply');
    }

    // Check lease length requirement
    if (formData.averageLeaseLength < 21) {
      eligible = false;
      reasons.push('Average lease length must be at least 21 years');
    }

    // Check participation threshold (at least 50% of qualifying leaseholders)
    const participationRate = (formData.participatingLeaseholders / formData.residentialFlats) * 100;
    if (participationRate < 50) {
      eligible = false;
      reasons.push(`Need at least 50% leaseholder participation (currently ${participationRate.toFixed(1)}%)`);
    }

    // Add warnings for potential issues
    if (participationRate < 75) {
      warnings.push('Consider getting more leaseholders on board for a stronger claim');
    }

    if (formData.commercialUnits > 0) {
      warnings.push('Commercial units may complicate the RTM process - seek legal advice');
    }

    if (formData.buildingAge > 100) {
      warnings.push('Older buildings may have complex lease structures - review all leases carefully');
    }

    // Add next steps based on eligibility
    if (eligible) {
      nextSteps.push('Conduct a formal leaseholder survey');
      nextSteps.push('Form an RTM company');
      nextSteps.push('Serve the claim notice');
      nextSteps.push('Complete the acquisition process');
    } else {
      nextSteps.push('Address the eligibility issues identified above');
      nextSteps.push('Consider alternative management options');
      nextSteps.push('Seek professional legal advice');
    }

    return { eligible, reasons, warnings, nextSteps };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const eligibilityResult = checkEligibility();
    setResult(eligibilityResult);
    setShowResult(true);
  };

  const resetForm = () => {
    setFormData({
      totalFlats: 0,
      residentialFlats: 0,
      commercialUnits: 0,
      landlordResides: false,
      averageLeaseLength: 0,
      participatingLeaseholders: 0,
      buildingAge: 0,
      hasFreeholder: true
    });
    setResult(null);
    setShowResult(false);
  };

  if (showResult && result) {
    return (
      <Card>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">RTM Eligibility Result</h3>
            <Button variant="outline" onClick={resetForm}>
              Check Another Building
            </Button>
          </div>

          {/* Eligibility Status */}
          <div className={`p-4 rounded-lg border-2 ${
            result.eligible 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center space-x-3">
              {result.eligible ? (
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              ) : (
                <XCircle className="h-8 w-8 text-red-600" />
              )}
              <div>
                <h4 className={`text-lg font-semibold ${
                  result.eligible ? 'text-green-800' : 'text-red-800'
                }`}>
                  {result.eligible ? 'Eligible for RTM' : 'Not Eligible for RTM'}
                </h4>
                <p className={`text-sm ${
                  result.eligible ? 'text-green-700' : 'text-red-700'
                }`}>
                  {result.eligible 
                    ? 'Your building meets the basic requirements for Right to Manage'
                    : 'Your building does not currently meet RTM requirements'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Issues/Reasons */}
          {result.reasons.length > 0 && (
            <div className="space-y-3">
              <h5 className="font-medium text-gray-900 flex items-center">
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                {result.eligible ? 'Requirements Met' : 'Issues to Address'}
              </h5>
              <ul className="space-y-2">
                {result.reasons.map((reason, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    {result.eligible ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                    )}
                    <span className="text-sm text-gray-700">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {result.warnings.length > 0 && (
            <div className="space-y-3">
              <h5 className="font-medium text-gray-900 flex items-center">
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                Important Considerations
              </h5>
              <ul className="space-y-2">
                {result.warnings.map((warning, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                    <span className="text-sm text-gray-700">{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Next Steps */}
          <div className="space-y-3">
            <h5 className="font-medium text-gray-900 flex items-center">
              <Info className="h-5 w-5 text-blue-500 mr-2" />
              Recommended Next Steps
            </h5>
            <ol className="space-y-2">
              {result.nextSteps.map((step, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full flex items-center justify-center mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-sm text-gray-700">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {result.eligible && (
            <div className="pt-4 border-t border-gray-200">
              <Button variant="primary" className="w-full">
                Continue to Leaseholder Survey
              </Button>
            </div>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">RTM Eligibility Checker</h3>
          <p className="text-gray-600 mt-1">
            Check if your building qualifies for Right to Manage under UK law
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Total Flats */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Home className="inline h-4 w-4 mr-1" />
                Total Number of Flats
              </label>
              <input
                type="number"
                name="totalFlats"
                value={formData.totalFlats}
                onChange={handleInputChange}
                min="1"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., 12"
              />
              <p className="text-xs text-gray-500 mt-1">Include all flats in the building</p>
            </div>

            {/* Residential Flats */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Home className="inline h-4 w-4 mr-1" />
                Residential Flats
              </label>
              <input
                type="number"
                name="residentialFlats"
                value={formData.residentialFlats}
                onChange={handleInputChange}
                min="1"
                max={formData.totalFlats}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., 10"
              />
              <p className="text-xs text-gray-500 mt-1">Flats used for residential purposes only</p>
            </div>

            {/* Commercial Units */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="inline h-4 w-4 mr-1" />
                Commercial Units
              </label>
              <input
                type="number"
                name="commercialUnits"
                value={formData.commercialUnits}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., 2"
              />
              <p className="text-xs text-gray-500 mt-1">Shops, offices, or other commercial spaces</p>
            </div>

            {/* Average Lease Length */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Average Lease Length (years)
              </label>
              <input
                type="number"
                name="averageLeaseLength"
                value={formData.averageLeaseLength}
                onChange={handleInputChange}
                min="0"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., 99"
              />
              <p className="text-xs text-gray-500 mt-1">Remaining years on leases</p>
            </div>

            {/* Participating Leaseholders */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="inline h-4 w-4 mr-1" />
                Participating Leaseholders
              </label>
              <input
                type="number"
                name="participatingLeaseholders"
                value={formData.participatingLeaseholders}
                onChange={handleInputChange}
                min="1"
                max={formData.residentialFlats}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., 8"
              />
              <p className="text-xs text-gray-500 mt-1">Leaseholders interested in RTM</p>
            </div>

            {/* Building Age */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Building Age (years)
              </label>
              <input
                type="number"
                name="buildingAge"
                value={formData.buildingAge}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., 25"
              />
              <p className="text-xs text-gray-500 mt-1">Approximate age of the building</p>
            </div>
          </div>

          {/* Landlord Residency */}
          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="landlordResides"
                checked={formData.landlordResides}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">
                Landlord/freeholder resides in the building
              </span>
            </label>
            <p className="text-xs text-gray-500 ml-7">
              Important for buildings with 4 or fewer flats
            </p>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <Button type="submit" variant="primary" className="w-full">
              Check RTM Eligibility
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
};

export default EligibilityChecker;
