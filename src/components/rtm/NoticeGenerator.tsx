import React, { useState } from 'react';
import { FileText, Download, Send, Calendar, AlertTriangle, CheckCircle2, Mail, User } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface NoticeRecipient {
  id: string;
  type: 'landlord' | 'tenant' | 'managing_agent';
  name: string;
  address: string;
  email?: string;
  served: boolean;
  servedDate?: string;
  serviceMethod: 'hand' | 'post' | 'email' | 'registered_post';
}

interface ClaimNoticeData {
  rtmCompanyName: string;
  rtmCompanyNumber: string;
  buildingAddress: string;
  claimDate: string;
  acquisitionDate: string;
  recipients: NoticeRecipient[];
}

const NoticeGenerator: React.FC = () => {
  const [noticeData, setNoticeData] = useState<ClaimNoticeData>({
    rtmCompanyName: '',
    rtmCompanyNumber: '',
    buildingAddress: '',
    claimDate: '',
    acquisitionDate: '',
    recipients: []
  });

  const [newRecipient, setNewRecipient] = useState<Partial<NoticeRecipient>>({
    type: 'tenant',
    name: '',
    address: '',
    email: '',
    served: false,
    serviceMethod: 'post'
  });

  const [showAddRecipient, setShowAddRecipient] = useState(false);
  const [generatedNotice, setGeneratedNotice] = useState('');

  const addRecipient = () => {
    if (newRecipient.name && newRecipient.address) {
      const recipient: NoticeRecipient = {
        id: Date.now().toString(),
        type: newRecipient.type || 'tenant',
        name: newRecipient.name || '',
        address: newRecipient.address || '',
        email: newRecipient.email,
        served: false,
        serviceMethod: newRecipient.serviceMethod || 'post'
      };
      
      setNoticeData(prev => ({
        ...prev,
        recipients: [...prev.recipients, recipient]
      }));
      
      setNewRecipient({
        type: 'tenant',
        name: '',
        address: '',
        email: '',
        served: false,
        serviceMethod: 'post'
      });
      setShowAddRecipient(false);
    }
  };

  const removeRecipient = (id: string) => {
    setNoticeData(prev => ({
      ...prev,
      recipients: prev.recipients.filter(r => r.id !== id)
    }));
  };

  const updateRecipient = (id: string, updates: Partial<NoticeRecipient>) => {
    setNoticeData(prev => ({
      ...prev,
      recipients: prev.recipients.map(r => r.id === id ? { ...r, ...updates } : r)
    }));
  };

  const markAsServed = (id: string) => {
    updateRecipient(id, {
      served: true,
      servedDate: new Date().toISOString().split('T')[0]
    });
  };

  const calculateAcquisitionDate = () => {
    if (noticeData.claimDate) {
      const claimDate = new Date(noticeData.claimDate);
      const acquisitionDate = new Date(claimDate);
      acquisitionDate.setMonth(acquisitionDate.getMonth() + 3);
      
      setNoticeData(prev => ({
        ...prev,
        acquisitionDate: acquisitionDate.toISOString().split('T')[0]
      }));
    }
  };

  const generateNotice = () => {
    const notice = `
CLAIM NOTICE

Right to Manage under Chapter 1 of Part 2 of the Commonhold and Leasehold Reform Act 2002

TO: [RECIPIENT NAME]
OF: [RECIPIENT ADDRESS]

TAKE NOTICE that ${noticeData.rtmCompanyName} (Company Number: ${noticeData.rtmCompanyNumber}) ("the RTM Company") hereby gives you notice of its claim to acquire the right to manage the premises described below.

PREMISES: ${noticeData.buildingAddress}

The RTM Company claims the right to manage the above premises under Chapter 1 of Part 2 of the Commonhold and Leasehold Reform Act 2002.

DATE OF CLAIM: ${new Date(noticeData.claimDate).toLocaleDateString('en-GB')}

ACQUISITION DATE: ${new Date(noticeData.acquisitionDate).toLocaleDateString('en-GB')}

The RTM Company will acquire the right to manage the premises on the acquisition date specified above, being a date not less than three months after the date of this notice.

COUNTER-NOTICE: If you wish to dispute this claim, you may give a counter-notice to the RTM Company within one month of the date of service of this notice. Any counter-notice must:
(a) be in writing;
(b) state the grounds on which the claim is disputed; and
(c) be given to the RTM Company at its registered office.

RTM COMPANY DETAILS:
Name: ${noticeData.rtmCompanyName}
Company Number: ${noticeData.rtmCompanyNumber}
Registered Office: ${noticeData.buildingAddress}

This notice is given under section 79 of the Commonhold and Leasehold Reform Act 2002.

DATED: ${new Date(noticeData.claimDate).toLocaleDateString('en-GB')}

Signed: _________________________
For and on behalf of ${noticeData.rtmCompanyName}

---

IMPORTANT NOTES:
- This notice must be served on the landlord, any party (other than the landlord) who has an estate or interest in the premises and is entitled to receive rent, and every qualifying tenant of a flat contained in the premises.
- Service must be in accordance with section 111 of the Commonhold and Leasehold Reform Act 2002.
- Keep proof of service for all recipients.
    `.trim();

    setGeneratedNotice(notice);
  };

  const downloadNotice = () => {
    const blob = new Blob([generatedNotice], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rtm-claim-notice.txt';
    a.click();
  };

  const landlords = noticeData.recipients.filter(r => r.type === 'landlord');
  const tenants = noticeData.recipients.filter(r => r.type === 'tenant');
  const managingAgents = noticeData.recipients.filter(r => r.type === 'managing_agent');
  const servedCount = noticeData.recipients.filter(r => r.served).length;
  const totalRecipients = noticeData.recipients.length;

  return (
    <div className="space-y-6">
      {/* Notice Details */}
      <Card>
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900">RTM Claim Notice Generator</h3>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-900">Legal Requirements</h4>
                <ul className="text-sm text-amber-800 mt-2 space-y-1">
                  <li>• Notice must be served on landlord, managing agent, and all qualifying tenants</li>
                  <li>• Acquisition date must be at least 3 months after claim date</li>
                  <li>• Service must comply with section 111 of the Act</li>
                  <li>• Keep proof of service for all recipients</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                RTM Company Name
              </label>
              <input
                type="text"
                value={noticeData.rtmCompanyName}
                onChange={(e) => setNoticeData(prev => ({ ...prev, rtmCompanyName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., Riverside Apartments RTM Company Limited"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Number
              </label>
              <input
                type="text"
                value={noticeData.rtmCompanyNumber}
                onChange={(e) => setNoticeData(prev => ({ ...prev, rtmCompanyNumber: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., 12345678"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Building Address
              </label>
              <textarea
                value={noticeData.buildingAddress}
                onChange={(e) => setNoticeData(prev => ({ ...prev, buildingAddress: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={3}
                placeholder="Full address of the building"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Claim Date
              </label>
              <input
                type="date"
                value={noticeData.claimDate}
                onChange={(e) => {
                  setNoticeData(prev => ({ ...prev, claimDate: e.target.value }));
                  // Auto-calculate acquisition date
                  if (e.target.value) {
                    const claimDate = new Date(e.target.value);
                    const acquisitionDate = new Date(claimDate);
                    acquisitionDate.setMonth(acquisitionDate.getMonth() + 3);
                    setNoticeData(prev => ({
                      ...prev,
                      acquisitionDate: acquisitionDate.toISOString().split('T')[0]
                    }));
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Acquisition Date (auto-calculated)
              </label>
              <input
                type="date"
                value={noticeData.acquisitionDate}
                onChange={(e) => setNoticeData(prev => ({ ...prev, acquisitionDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 3 months after claim date
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Recipients Management */}
      <Card>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-semibold text-gray-900">Notice Recipients</h4>
            <Button 
              variant="primary" 
              leftIcon={<User size={16} />}
              onClick={() => setShowAddRecipient(true)}
            >
              Add Recipient
            </Button>
          </div>

          {/* Service Progress */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-medium text-blue-900">Service Progress</h5>
                <p className="text-sm text-blue-800">
                  {servedCount} of {totalRecipients} notices served
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-900">{totalRecipients > 0 ? Math.round((servedCount / totalRecipients) * 100) : 0}%</div>
                <div className="text-sm text-blue-700">Complete</div>
              </div>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2 mt-3">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${totalRecipients > 0 ? (servedCount / totalRecipients) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Add Recipient Form */}
          {showAddRecipient && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h5 className="font-medium text-gray-900 mb-3">Add Notice Recipient</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={newRecipient.type}
                  onChange={(e) => setNewRecipient({...newRecipient, type: e.target.value as 'landlord' | 'tenant' | 'managing_agent'})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="tenant">Qualifying Tenant</option>
                  <option value="landlord">Landlord/Freeholder</option>
                  <option value="managing_agent">Managing Agent</option>
                </select>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={newRecipient.name}
                  onChange={(e) => setNewRecipient({...newRecipient, name: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <textarea
                  placeholder="Full Address"
                  value={newRecipient.address}
                  onChange={(e) => setNewRecipient({...newRecipient, address: e.target.value})}
                  className="md:col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={2}
                />
                <input
                  type="email"
                  placeholder="Email (optional)"
                  value={newRecipient.email}
                  onChange={(e) => setNewRecipient({...newRecipient, email: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <select
                  value={newRecipient.serviceMethod}
                  onChange={(e) => setNewRecipient({...newRecipient, serviceMethod: e.target.value as 'hand' | 'post' | 'email' | 'registered_post'})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="post">Standard Post</option>
                  <option value="registered_post">Registered Post</option>
                  <option value="hand">Hand Delivery</option>
                  <option value="email">Email (if permitted)</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 mt-4">
                <Button variant="outline" onClick={() => setShowAddRecipient(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={addRecipient}>
                  Add Recipient
                </Button>
              </div>
            </div>
          )}

          {/* Recipients List */}
          <div className="space-y-3">
            {/* Landlords */}
            {landlords.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Landlords/Freeholders</h5>
                {landlords.map((recipient) => (
                  <div key={recipient.id} className="border border-gray-200 rounded-lg p-3 mb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h6 className="font-medium text-gray-900">{recipient.name}</h6>
                          {recipient.served && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Served {recipient.servedDate}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{recipient.address}</p>
                        <p className="text-xs text-gray-500">Service method: {recipient.serviceMethod.replace('_', ' ')}</p>
                      </div>
                      <div className="flex space-x-2">
                        {!recipient.served && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => markAsServed(recipient.id)}
                          >
                            Mark as Served
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => removeRecipient(recipient.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Managing Agents */}
            {managingAgents.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Managing Agents</h5>
                {managingAgents.map((recipient) => (
                  <div key={recipient.id} className="border border-gray-200 rounded-lg p-3 mb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h6 className="font-medium text-gray-900">{recipient.name}</h6>
                          {recipient.served && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Served {recipient.servedDate}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{recipient.address}</p>
                        <p className="text-xs text-gray-500">Service method: {recipient.serviceMethod.replace('_', ' ')}</p>
                      </div>
                      <div className="flex space-x-2">
                        {!recipient.served && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => markAsServed(recipient.id)}
                          >
                            Mark as Served
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => removeRecipient(recipient.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tenants */}
            {tenants.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Qualifying Tenants ({tenants.length})</h5>
                {tenants.map((recipient) => (
                  <div key={recipient.id} className="border border-gray-200 rounded-lg p-3 mb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h6 className="font-medium text-gray-900">{recipient.name}</h6>
                          {recipient.served && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Served {recipient.servedDate}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{recipient.address}</p>
                        <p className="text-xs text-gray-500">Service method: {recipient.serviceMethod.replace('_', ' ')}</p>
                      </div>
                      <div className="flex space-x-2">
                        {!recipient.served && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => markAsServed(recipient.id)}
                          >
                            Mark as Served
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => removeRecipient(recipient.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {noticeData.recipients.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No recipients added yet. Add landlords, managing agents, and qualifying tenants.
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Notice Generation */}
      <Card>
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">Generate Claim Notice</h4>
          
          <div className="flex space-x-3">
            <Button 
              variant="primary" 
              leftIcon={<FileText size={16} />}
              onClick={generateNotice}
              disabled={!noticeData.rtmCompanyName || !noticeData.claimDate || !noticeData.acquisitionDate}
            >
              Generate Notice
            </Button>
            {generatedNotice && (
              <Button 
                variant="outline" 
                leftIcon={<Download size={16} />}
                onClick={downloadNotice}
              >
                Download Notice
              </Button>
            )}
          </div>

          {generatedNotice && (
            <div className="mt-4">
              <textarea
                value={generatedNotice}
                onChange={(e) => setGeneratedNotice(e.target.value)}
                className="w-full h-96 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-mono"
                placeholder="Generated notice will appear here..."
              />
            </div>
          )}
        </div>
      </Card>

      {/* Service Completion */}
      {servedCount === totalRecipients && totalRecipients > 0 && (
        <Card>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              <h4 className="text-lg font-semibold text-green-800">All Notices Served</h4>
            </div>
            <p className="text-gray-600">
              All claim notices have been served. The one-month counter-notice period has now begun.
            </p>
            <Button variant="primary" className="w-full">
              Proceed to Acquisition Planning
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default NoticeGenerator;
