import React, { useState } from 'react';
import { Calendar, Users, FileText, Clock, Plus, Download, Send, CheckCircle2, AlertTriangle } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import LegalGuidanceTooltip from '../legal/LegalGuidanceTooltip';

interface Meeting {
  id: string;
  title: string;
  type: 'board' | 'agm' | 'egm' | 'committee';
  date: Date;
  time: string;
  location: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  attendees: Array<{
    name: string;
    role: string;
    confirmed: boolean;
  }>;
  agenda: Array<{
    item: string;
    presenter: string;
    duration: number;
    status: 'pending' | 'discussed' | 'resolved';
  }>;
  documents: Array<{
    title: string;
    type: 'agenda' | 'minutes' | 'report' | 'proposal';
    url?: string;
  }>;
}

interface MeetingManagementProps {
  userRole: 'rtm-director' | 'rmc-director' | 'management-company';
}

const MeetingManagement: React.FC<MeetingManagementProps> = ({ userRole }) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'templates'>('upcoming');
  const [showNewMeetingModal, setShowNewMeetingModal] = useState(false);

  const upcomingMeetings: Meeting[] = [
    {
      id: '1',
      title: 'Monthly Board Meeting',
      type: 'board',
      date: new Date('2024-12-15'),
      time: '19:00',
      location: 'Community Room, Ground Floor',
      status: 'scheduled',
      attendees: [
        { name: 'John Smith', role: 'Chairman', confirmed: true },
        { name: 'Sarah Johnson', role: 'Secretary', confirmed: true },
        { name: 'Mike Brown', role: 'Treasurer', confirmed: false }
      ],
      agenda: [
        { item: 'Approval of Previous Minutes', presenter: 'Secretary', duration: 10, status: 'pending' },
        { item: 'Financial Report', presenter: 'Treasurer', duration: 20, status: 'pending' },
        { item: 'Maintenance Updates', presenter: 'Chairman', duration: 15, status: 'pending' },
        { item: 'New Business', presenter: 'All', duration: 15, status: 'pending' }
      ],
      documents: [
        { title: 'Meeting Agenda', type: 'agenda' },
        { title: 'Financial Report Q4', type: 'report' },
        { title: 'Previous Meeting Minutes', type: 'minutes' }
      ]
    },
    {
      id: '2',
      title: 'Annual General Meeting 2024',
      type: 'agm',
      date: new Date('2024-12-20'),
      time: '18:30',
      location: 'Main Hall, Building A',
      status: 'scheduled',
      attendees: [
        { name: 'All Leaseholders', role: 'Members', confirmed: false }
      ],
      agenda: [
        { item: 'Chairman\'s Report', presenter: 'Chairman', duration: 20, status: 'pending' },
        { item: 'Financial Statements', presenter: 'Treasurer', duration: 30, status: 'pending' },
        { item: 'Director Elections', presenter: 'Secretary', duration: 20, status: 'pending' },
        { item: 'Service Charge Budget 2025', presenter: 'Treasurer', duration: 25, status: 'pending' }
      ],
      documents: [
        { title: 'AGM Notice', type: 'agenda' },
        { title: 'Annual Financial Statements', type: 'report' },
        { title: 'Director Nomination Forms', type: 'proposal' }
      ]
    }
  ];

  const getMeetingTypeColor = (type: string) => {
    switch (type) {
      case 'board': return 'bg-blue-100 text-blue-800';
      case 'agm': return 'bg-purple-100 text-purple-800';
      case 'egm': return 'bg-orange-100 text-orange-800';
      case 'committee': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'info';
      case 'in_progress': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'info';
    }
  };

  const renderUpcomingMeetings = () => (
    <div className="space-y-6">
      {upcomingMeetings.map((meeting) => (
        <Card key={meeting.id} className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{meeting.title}</h3>
                <Badge className={getMeetingTypeColor(meeting.type)}>
                  {meeting.type.toUpperCase()}
                </Badge>
                <Badge variant={getStatusColor(meeting.status) as any}>
                  {meeting.status.replace('_', ' ')}
                </Badge>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{meeting.date.toLocaleDateString('en-GB')}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{meeting.time}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{meeting.attendees.length} attendees</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" leftIcon={<FileText className="h-4 w-4" />}>
                View Agenda
              </Button>
              <Button variant="primary" size="sm">
                Manage
              </Button>
            </div>
          </div>

          {/* Agenda Preview */}
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Agenda Items</h4>
            <div className="space-y-2">
              {meeting.agenda.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">{item.item}</span>
                    <span className="text-xs text-gray-500">({item.duration} min)</span>
                  </div>
                  <span className="text-xs text-gray-500">{item.presenter}</span>
                </div>
              ))}
              {meeting.agenda.length > 3 && (
                <div className="text-sm text-gray-500 text-center">
                  +{meeting.agenda.length - 3} more items
                </div>
              )}
            </div>
          </div>

          {/* Documents */}
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Documents</h4>
            <div className="flex flex-wrap gap-2">
              {meeting.documents.map((doc, idx) => (
                <div key={idx} className="flex items-center space-x-1 px-2 py-1 bg-blue-50 rounded text-sm">
                  <FileText className="h-3 w-3 text-blue-600" />
                  <span className="text-blue-800">{doc.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Attendee Status */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Attendance</h4>
            <div className="flex items-center space-x-4">
              {meeting.attendees.map((attendee, idx) => (
                <div key={idx} className="flex items-center space-x-1">
                  {attendee.confirmed ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-yellow-500" />
                  )}
                  <span className="text-sm text-gray-700">{attendee.name}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  const renderMeetingTemplates = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Meeting Templates</h3>
          <LegalGuidanceTooltip
            title="Meeting Legal Requirements"
            guidance={{
              basic: "Company meetings must follow proper procedures including adequate notice periods, quorum requirements, and accurate minute-taking to ensure legal validity.",
              intermediate: "Key requirements include 14-21 days notice for AGMs, proper agenda circulation, quorum calculations, voting procedures, and comprehensive minute recording.",
              advanced: "Detailed compliance includes Companies Act 2006 meeting requirements, Model Articles provisions, special resolution procedures, proxy voting rules, and statutory filing obligations."
            }}
            framework="CLRA_2002"
            mandatory={true}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <h4 className="font-medium text-gray-900">Board Meeting Template</h4>
                <p className="text-sm text-gray-600">Standard agenda and procedures for board meetings</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center space-x-3">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div>
                <h4 className="font-medium text-gray-900">AGM Template</h4>
                <p className="text-sm text-gray-600">Annual General Meeting agenda and notice template</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div>
                <h4 className="font-medium text-gray-900">EGM Template</h4>
                <p className="text-sm text-gray-600">Extraordinary General Meeting for urgent matters</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-green-600" />
              <div>
                <h4 className="font-medium text-gray-900">Minutes Template</h4>
                <p className="text-sm text-gray-600">Standardised format for meeting minutes</p>
              </div>
            </div>
          </Card>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Meeting Management</h2>
          <p className="text-gray-600 mt-1">
            Organise and manage board meetings, AGMs, and other company meetings
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setShowNewMeetingModal(true)}
        >
          Schedule Meeting
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'upcoming', label: 'Upcoming Meetings' },
            { id: 'past', label: 'Past Meetings' },
            { id: 'templates', label: 'Templates & Resources' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'upcoming' && renderUpcomingMeetings()}
      {activeTab === 'templates' && renderMeetingTemplates()}
      {/* Past meetings would be implemented similarly */}
    </div>
  );
};

export default MeetingManagement;
