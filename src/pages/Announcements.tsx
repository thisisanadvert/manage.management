import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  BellRing, 
  Clock, 
  Pin, 
  MessageSquare,
  Calendar,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  X,
  User,
  Building2
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const Announcements = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const announcements = [
    {
      id: 1,
      title: 'Emergency Maintenance: Elevator Repair',
      content: 'Main elevator will undergo emergency repairs on Tuesday. Engineers will be on site from 9 AM. Please use the service elevator during this time.',
      category: 'Maintenance',
      isPinned: true,
      postedBy: 'Sarah Foster',
      postedAt: '2 hours ago',
      comments: 5,
      priority: 'high'
    },
    {
      id: 2,
      title: 'Important: Fire Safety Inspection',
      content: 'Annual fire safety inspection scheduled for next week. Access required to all units. Please ensure clear access to all fire safety equipment.',
      category: 'Safety',
      isPinned: true,
      postedBy: 'Robert Thompson',
      postedAt: '1 day ago',
      comments: 3,
      priority: 'high'
    },
    {
      id: 3,
      title: 'Security System Upgrade Notice',
      content: 'Building security system will be upgraded next month. New key fobs will be distributed to all residents. More details to follow.',
      category: 'Security',
      isPinned: true,
      postedBy: 'Mark Anderson',
      postedAt: '2 days ago',
      comments: 7,
      priority: 'medium'
    },
    {
      id: 4,
      title: 'Summer Garden Maintenance',
      content: 'Garden maintenance work scheduled for next week. Please avoid using the garden area during this time.',
      category: 'Maintenance',
      isPinned: false,
      postedBy: 'Lisa Parker',
      postedAt: '3 days ago',
      comments: 2,
      priority: 'low'
    },
    {
      id: 5,
      title: 'Quarterly Service Charge Update',
      content: 'Q2 service charge statements have been issued. Please check your email for the detailed breakdown.',
      category: 'Financial',
      isPinned: false,
      postedBy: 'Sarah Foster',
      postedAt: '4 days ago',
      comments: 4,
      priority: 'medium'
    }
  ];

  const CreateAnnouncementModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create Announcement</h2>
          <button onClick={() => setShowCreateModal(false)}>
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter announcement title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter announcement content"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500">
                <option>Maintenance</option>
                <option>Safety</option>
                <option>Security</option>
                <option>Financial</option>
                <option>General</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500">
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
          </div>

          <div className="flex items-center">
            <input type="checkbox" id="pin" className="mr-2" />
            <label htmlFor="pin" className="text-sm text-gray-700">
              Pin this announcement
            </label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button variant="primary">
              Post Announcement
            </Button>
          </div>
        </form>
      </div>
    </div>
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      default:
        return 'gray';
    }
  };

  return (
    <div className="space-y-6 pb-16 lg:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-600 mt-1">Keep residents informed with important updates</p>
        </div>
        <Button 
          leftIcon={<Plus size={16} />}
          variant="primary"
          onClick={() => setShowCreateModal(true)}
        >
          New Announcement
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Search announcements..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
            />
            <Search 
              size={18} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="rounded-lg border border-gray-300 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            >
              <option value="all">All Categories</option>
              <option value="maintenance">Maintenance</option>
              <option value="safety">Safety</option>
              <option value="security">Security</option>
              <option value="financial">Financial</option>
            </select>
            <Button 
              variant="outline"
              leftIcon={<Filter size={16} />}
            >
              More Filters
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {announcements.map((announcement) => (
          <Card key={announcement.id} hoverable className="animate-slide-up">
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-lg ${
                announcement.isPinned ? 'bg-primary-100' : 'bg-gray-100'
              }`}>
                {announcement.isPinned ? (
                  <Pin className="h-5 w-5 text-primary-600" />
                ) : (
                  <BellRing className="h-5 w-5 text-gray-600" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge 
                    variant={getPriorityColor(announcement.priority)} 
                    size="sm"
                  >
                    {announcement.category}
                  </Badge>
                  {announcement.isPinned && (
                    <Badge variant="primary" size="sm">Pinned</Badge>
                  )}
                </div>

                <h3 className="text-lg font-medium">{announcement.title}</h3>
                <p className="mt-1 text-gray-600">{announcement.content}</p>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <User size={14} />
                    <span>{announcement.postedBy}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{announcement.postedAt}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare size={14} />
                    <span>{announcement.comments} comments</span>
                  </div>
                </div>
              </div>

              <Button variant="outline" size="sm">View Details</Button>
            </div>
          </Card>
        ))}
      </div>

      {showCreateModal && <CreateAnnouncementModal />}
    </div>
  );
};

export default Announcements;