import React, { useState } from 'react';
import { Users, Mail, Phone, Home, CheckCircle2, Send, Download, Eye, Scale, BookOpen } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import LegalGuidanceTooltip from '../legal/LegalGuidanceTooltip';
import { useFormPersistence } from '../../hooks/useFormPersistence';

interface LeaseholderInfo {
  id: string;
  flatNumber: string;
  name: string;
  email: string;
  phone: string;
  interested: 'yes' | 'no' | 'maybe' | 'pending';
  concerns: string;
  contactMethod: 'email' | 'phone' | 'post' | 'door';
}

interface SurveyStats {
  total: number;
  responded: number;
  interested: number;
  notInterested: number;
  maybe: number;
  pending: number;
}

interface SurveyData {
  leaseholders: LeaseholderInfo[];
  surveyTemplate: string;
}

const LeaseholderSurvey: React.FC = () => {
  // Form persistence setup
  const initialSurveyData: SurveyData = {
    leaseholders: [],
    surveyTemplate: ''
  };

  const {
    formData: surveyData,
    setFormData: setSurveyData,
    persistenceState,
    saveNow,
    clearSavedData
  } = useFormPersistence(initialSurveyData, {
    formId: 'leaseholder-survey',
    version: '1.0',
    autoSave: true,
    showSaveIndicator: true
  });

  const [newLeaseholder, setNewLeaseholder] = useState<Partial<LeaseholderInfo>>({
    flatNumber: '',
    name: '',
    email: '',
    phone: '',
    interested: 'pending',
    concerns: '',
    contactMethod: 'email'
  });
  const [showAddForm, setShowAddForm] = useState(false);

  const addLeaseholder = () => {
    if (newLeaseholder.flatNumber && newLeaseholder.name) {
      const leaseholder: LeaseholderInfo = {
        id: Date.now().toString(),
        flatNumber: newLeaseholder.flatNumber || '',
        name: newLeaseholder.name || '',
        email: newLeaseholder.email || '',
        phone: newLeaseholder.phone || '',
        interested: newLeaseholder.interested || 'pending',
        concerns: newLeaseholder.concerns || '',
        contactMethod: newLeaseholder.contactMethod || 'email'
      };

      setSurveyData(prev => ({
        ...prev,
        leaseholders: [...prev.leaseholders, leaseholder]
      }));

      setNewLeaseholder({
        flatNumber: '',
        name: '',
        email: '',
        phone: '',
        interested: 'pending',
        concerns: '',
        contactMethod: 'email'
      });
      setShowAddForm(false);
    }
  };

  const updateLeaseholder = (id: string, updates: Partial<LeaseholderInfo>) => {
    setSurveyData(prev => ({
      ...prev,
      leaseholders: prev.leaseholders.map(lh =>
        lh.id === id ? { ...lh, ...updates } : lh
      )
    }));
  };

  const removeLeaseholder = (id: string) => {
    setSurveyData(prev => ({
      ...prev,
      leaseholders: prev.leaseholders.filter(lh => lh.id !== id)
    }));
  };

  const calculateStats = (): SurveyStats => {
    const total = surveyData.leaseholders.length;
    const responded = surveyData.leaseholders.filter(lh => lh.interested !== 'pending').length;
    const interested = surveyData.leaseholders.filter(lh => lh.interested === 'yes').length;
    const notInterested = surveyData.leaseholders.filter(lh => lh.interested === 'no').length;
    const maybe = surveyData.leaseholders.filter(lh => lh.interested === 'maybe').length;
    const pending = surveyData.leaseholders.filter(lh => lh.interested === 'pending').length;

    return { total, responded, interested, notInterested, maybe, pending };
  };

  const generateSurveyTemplate = () => {
    const template = `
Subject: Right to Manage (RTM) - Your Building's Future

Dear [Leaseholder Name],

We are exploring the possibility of forming a Right to Manage (RTM) company for our building. This would allow us, as leaseholders, to take control of the management of our building.

What is RTM?
- Right to Manage allows leaseholders to take over building management
- No need to prove fault with current management
- Leaseholders gain control over service charges and maintenance
- Professional management can still be appointed

Benefits of RTM:
✓ Greater control over service charges and budgets
✓ Direct say in maintenance and improvement decisions
✓ Transparency in building management
✓ Potential cost savings through competitive tendering

Next Steps:
If there is sufficient interest, we will:
1. Form an RTM company
2. Serve formal notice to the current managing agent
3. Take over management responsibilities

Your Response:
Please let us know if you would be interested in participating in an RTM claim by replying to this email or contacting [Your Name] at [Your Contact].

We need at least 50% of leaseholders to participate for a successful RTM claim.

Questions or concerns? We're happy to discuss this further.

Best regards,
[Your Name]
[Your Flat Number]
[Your Contact Information]

---
This is an informal survey. No legal obligations arise from your response.
    `.trim();

    setSurveyData(prev => ({
      ...prev,
      surveyTemplate: template
    }));
  };

  const stats = calculateStats();
  const participationRate = stats.total > 0 ? (stats.interested / stats.total) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Form Persistence Indicator */}
      {persistenceState.showSaveIndicator && (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${persistenceState.isSaving ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
            <span className="text-sm text-blue-800">
              {persistenceState.isSaving ? 'Saving...' :
               persistenceState.lastSaved ? `Last saved: ${persistenceState.lastSaved.toLocaleTimeString()}` :
               'Form data will be automatically saved'}
            </span>
          </div>
          {persistenceState.hasSavedData && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearSavedData}
              className="text-xs"
            >
              Clear Saved Data
            </Button>
          )}
        </div>
      )}

      {/* Legal Compliance Header */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Scale className="h-6 w-6 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Qualifying Tenant Participation Requirements</h3>
              <p className="text-sm text-gray-700 mt-1">
                Ensure compliance with CLRA 2002 minimum participation thresholds for RTM claims
              </p>
            </div>
            <LegalGuidanceTooltip
              title="RTM Participation Requirements"
              guidance={{
                basic: "Under CLRA 2002, at least 50% of qualifying tenants must participate in the RTM claim. Qualifying tenants are those holding long leases (over 21 years) of flats in the building.",
                intermediate: "Key requirements: qualifying tenants must hold leases granted for more than 21 years, must be current leaseholders, and at least half must be RTM company members when the claim notice is served.",
                advanced: "Detailed compliance: qualifying tenant definition under CLRA 2002 s75, participation calculation methods, timing requirements for membership, and evidence requirements for RTM claim validity."
              }}
              framework="CLRA_2002"
              mandatory={true}
              externalResources={[
                {
                  title: "LEASE Qualifying Tenants Guide",
                  url: "https://www.lease-advice.org/advice-guide/right-to-manage/qualifying-tenants/",
                  type: "lease",
                  description: "Understanding qualifying tenant requirements"
                }
              ]}
            />
          </div>
        </div>
        <div className="mt-4 p-3 bg-white rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Current Participation Rate:</span>
            <span className={`text-lg font-bold ${participationRate >= 50 ? 'text-green-600' : 'text-red-600'}`}>
              {participationRate.toFixed(1)}%
            </span>
          </div>
          <div className="mt-2">
            <div className="text-xs text-gray-600 mb-1">
              {participationRate >= 50 ? '✓ Meets legal minimum (50%)' : '✗ Below legal minimum (50%)'}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  participationRate >= 50 ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(participationRate, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Survey Statistics */}
      <Card>
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900">Leaseholder Survey Progress</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.interested}</div>
              <div className="text-sm text-gray-600">Interested</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">{stats.maybe}</div>
              <div className="text-sm text-gray-600">Maybe</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.notInterested}</div>
              <div className="text-sm text-gray-600">Not Interested</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Participation Rate</span>
              <span className={`font-medium ${participationRate >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                {participationRate.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  participationRate >= 50 ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(participationRate, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">
              {participationRate >= 50 
                ? 'Sufficient participation for RTM claim' 
                : 'Need 50% participation for RTM claim'
              }
            </p>
          </div>
        </div>
      </Card>

      {/* Survey Template Generator */}
      <Card>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Survey Template</h3>
          <p className="text-gray-600">Generate a template email to survey leaseholder interest</p>
          
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              leftIcon={<Eye size={16} />}
              onClick={generateSurveyTemplate}
            >
              Generate Template
            </Button>
            {surveyData.surveyTemplate && (
              <Button
                variant="outline"
                leftIcon={<Download size={16} />}
                onClick={() => {
                  const blob = new Blob([surveyData.surveyTemplate], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'rtm-survey-template.txt';
                  a.click();
                }}
              >
                Download
              </Button>
            )}
          </div>

          {surveyData.surveyTemplate && (
            <div className="mt-4">
              <textarea
                value={surveyData.surveyTemplate}
                onChange={(e) => setSurveyData(prev => ({
                  ...prev,
                  surveyTemplate: e.target.value
                }))}
                className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm font-mono"
                placeholder="Survey template will appear here..."
              />
            </div>
          )}
        </div>
      </Card>

      {/* Leaseholder Management */}
      <Card>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Leaseholder Directory</h3>
            <Button 
              variant="primary" 
              leftIcon={<Users size={16} />}
              onClick={() => setShowAddForm(true)}
            >
              Add Leaseholder
            </Button>
          </div>

          {/* Add Leaseholder Form */}
          {showAddForm && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium text-gray-900 mb-3">Add New Leaseholder</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Flat Number"
                  value={newLeaseholder.flatNumber}
                  onChange={(e) => setNewLeaseholder({...newLeaseholder, flatNumber: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={newLeaseholder.name}
                  onChange={(e) => setNewLeaseholder({...newLeaseholder, name: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={newLeaseholder.email}
                  onChange={(e) => setNewLeaseholder({...newLeaseholder, email: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={newLeaseholder.phone}
                  onChange={(e) => setNewLeaseholder({...newLeaseholder, phone: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-4">
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={addLeaseholder}>
                  Add Leaseholder
                </Button>
              </div>
            </div>
          )}

          {/* Leaseholder List */}
          <div className="space-y-3">
            {surveyData.leaseholders.map((leaseholder) => (
              <div key={leaseholder.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <div className="font-medium text-gray-900">{leaseholder.name}</div>
                      <div className="text-sm text-gray-600">Flat {leaseholder.flatNumber}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">{leaseholder.email}</div>
                      <div className="text-sm text-gray-600">{leaseholder.phone}</div>
                    </div>
                    <div>
                      <select
                        value={leaseholder.interested}
                        onChange={(e) => updateLeaseholder(leaseholder.id, { 
                          interested: e.target.value as 'yes' | 'no' | 'maybe' | 'pending' 
                        })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="yes">Interested</option>
                        <option value="maybe">Maybe</option>
                        <option value="no">Not Interested</option>
                      </select>
                    </div>
                    <div className="flex justify-end">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => removeLeaseholder(leaseholder.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
                {leaseholder.concerns && (
                  <div className="mt-2 text-sm text-gray-600">
                    <strong>Concerns:</strong> {leaseholder.concerns}
                  </div>
                )}
              </div>
            ))}
            
            {surveyData.leaseholders.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No leaseholders added yet. Click "Add Leaseholder" to get started.
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Next Steps */}
      {participationRate >= 50 && (
        <Card>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              <h3 className="text-lg font-semibold text-green-800">Ready for Next Step</h3>
            </div>
            <p className="text-gray-600">
              You have sufficient leaseholder support to proceed with RTM company formation.
            </p>
            <Button variant="primary" className="w-full">
              Proceed to Company Formation
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default LeaseholderSurvey;
