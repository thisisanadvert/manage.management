import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  VoteIcon,
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  BarChart4,
  ChevronRight,
  Users,
  MessageSquare,
  Scale,
  Shield
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import CreatePollModal from '../components/modals/CreatePollModal';
import PollDetailModal from '../components/modals/PollDetailModal';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import LegalGuidanceTooltip from '../components/legal/LegalGuidanceTooltip';

const Voting = () => {
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPollId, setSelectedPollId] = useState<string | null>(null);
  const [polls, setPolls] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    active: 0,
    completed: 0,
    upcoming: 0,
    participation: 0
  });

  // Fetch polls from database
  const fetchPolls = async () => {
    if (!user?.metadata?.buildingId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('polls')
        .select(`
          *,
          poll_options(*),
          poll_votes(count),
          poll_comments(count)
        `)
        .eq('building_id', user.metadata.buildingId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setPolls(data);

        // Calculate stats
        const activeCount = data.filter(p => p.status === 'active').length;
        const completedCount = data.filter(p => p.status === 'completed').length;
        const upcomingCount = data.filter(p => p.status === 'upcoming').length;

        setStats({
          active: activeCount,
          completed: completedCount,
          upcoming: upcomingCount,
          participation: 85 // TODO: Calculate actual participation
        });
      }
    } catch (error) {
      console.error('Error fetching polls:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, [user?.metadata?.buildingId]);

  const handlePollCreated = () => {
    fetchPolls();
  };

  const handleViewDetails = (pollId: string) => {
    setSelectedPollId(pollId);
    setShowDetailModal(true);
  };

  const handleVoteSubmitted = () => {
    fetchPolls(); // Refresh polls after voting
  };

  // Sample data for fallback (keeping original structure)
  const samplePolls = [
    {
      id: 1,
      title: 'Electric Vehicle Charging Installation',
      description: 'Installation of 5 EV charging points in residents parking area. Total cost: £12,500 from reserve fund.',
      category: 'Building Improvement',
      requiredMajority: 75,
      status: 'active',
      startDate: '2025-04-23',
      endDate: '2025-05-14',
      participation: '45%',
      votes: { yes: 8, no: 4 },
      comments: 12
    },
    {
      id: 2,
      title: 'Garden Redesign Project',
      description: 'Comprehensive garden redesign including new seating area, improved lighting, and sustainable planting. Budget: £15,000.',
      category: 'Building Improvement',
      requiredMajority: 50,
      status: 'active',
      startDate: '2025-04-25',
      endDate: '2025-05-16',
      participation: '35%',
      votes: { yes: 6, no: 3 },
      comments: 8
    },
    {
      id: 3,
      title: 'Security System Upgrade',
      description: 'Installation of new HD CCTV cameras and upgraded door entry system. Total cost: £18,500.',
      category: 'Security',
      requiredMajority: 75,
      status: 'active',
      startDate: '2025-04-30',
      endDate: '2025-05-21',
      participation: '25%',
      votes: { yes: 4, no: 2 },
      comments: 5
    },
    {
      id: 4,
      title: 'Updated Pet Policy 2025',
      description: 'Proposal to update building pet policy to allow cats and small dogs under 15kg. Includes new registration requirements.',
      category: 'Policy',
      requiredMajority: 75,
      status: 'completed',
      startDate: '2025-03-01',
      endDate: '2025-03-31',
      participation: '85%',
      votes: { yes: 18, no: 6 },
      result: 'passed',
      comments: 24
    },
    {
      id: 5,
      title: 'Annual Budget 2026',
      description: 'Review and approval of proposed building budget for 2026, including service charge calculations.',
      category: 'Financial',
      requiredMajority: 75,
      status: 'upcoming',
      startDate: '2025-05-30',
      endDate: '2025-06-30',
      comments: 0
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'warning';
      case 'completed':
        return 'success';
      case 'upcoming':
        return 'accent';
      default:
        return 'gray';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'building improvement':
        return 'primary';
      case 'security':
        return 'error';
      case 'policy':
        return 'accent';
      case 'financial':
        return 'warning';
      default:
        return 'gray';
    }
  };

  // Use real polls if available, otherwise fall back to sample data
  const displayPolls = polls.length > 0 ? polls : samplePolls;

  const filteredPolls = displayPolls.filter(poll => {
    if (selectedFilter !== 'all' && poll.status !== selectedFilter) return false;
    if (searchQuery && !poll.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-16 lg:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Voting & Decision Making</h1>
            <p className="text-gray-600 mt-1">Manage building-wide decisions through transparent voting</p>
          </div>
          <LegalGuidanceTooltip
            title="Voting and Consultation Legal Requirements"
            guidance={{
              basic: "Certain decisions require formal consultation with leaseholders, including major works over £250 per leaseholder and long-term agreements.",
              intermediate: "Section 20 consultations must follow statutory procedures with proper notice periods. AGM voting requires specific quorum and majority requirements.",
              advanced: "Ensure compliance with consultation regulations, proxy voting rules, and decision recording requirements under LTA 1985 and company law."
            }}
            framework="LTA_1985"
            mandatory={true}
            externalResources={[
              {
                title: "LEASE Consultation Guide",
                url: "https://www.lease-advice.org/advice-guide/section-20-consultation/",
                type: "lease",
                description: "Statutory consultation requirements"
              }
            ]}
          />
        </div>
        <Button
          leftIcon={<Plus size={16} />}
          variant="primary"
          onClick={() => setShowCreateModal(true)}
        >
          Create New Poll
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-warning-50">
          <div className="flex items-center">
            <div className="p-3 bg-warning-100 rounded-lg">
              <VoteIcon className="h-6 w-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-warning-600">Active Polls</p>
              <h3 className="text-xl font-bold text-warning-900">{stats.active}</h3>
            </div>
          </div>
        </Card>

        <Card className="bg-success-50">
          <div className="flex items-center">
            <div className="p-3 bg-success-100 rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-success-600">Completed</p>
              <h3 className="text-xl font-bold text-success-900">{stats.completed}</h3>
            </div>
          </div>
        </Card>

        <Card className="bg-accent-50">
          <div className="flex items-center">
            <div className="p-3 bg-accent-100 rounded-lg">
              <Calendar className="h-6 w-6 text-accent-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-accent-600">Upcoming</p>
              <h3 className="text-xl font-bold text-accent-900">{stats.upcoming}</h3>
            </div>
          </div>
        </Card>

        <Card className="bg-primary-50">
          <div className="flex items-center">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-primary-600">Participation</p>
              <h3 className="text-xl font-bold text-primary-900">{stats.participation}%</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Statutory Consultations Section */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Scale className="h-6 w-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Statutory Consultations</h3>
              <p className="text-sm text-gray-700 mt-1">
                Legal consultations required under Section 20 LTA 1985 and other statutory requirements
              </p>
            </div>
          </div>
          <Button variant="primary" size="sm">
            Start Section 20 Consultation
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <h4 className="font-medium text-gray-900">Section 20 Consultations</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Required for major works over £250 per leaseholder
            </p>
            <div className="flex items-center space-x-2">
              <Badge variant="info">0 Active</Badge>
              <Badge variant="success">2 Completed</Badge>
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="h-4 w-4 text-blue-600" />
              <h4 className="font-medium text-gray-900">AGM Resolutions</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Annual General Meeting voting and resolutions
            </p>
            <div className="flex items-center space-x-2">
              <Badge variant="warning">1 Upcoming</Badge>
              <Badge variant="success">5 Passed</Badge>
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              <h4 className="font-medium text-gray-900">Policy Changes</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Building policy and rule changes requiring consultation
            </p>
            <div className="flex items-center space-x-2">
              <Badge variant="info">0 Active</Badge>
              <Badge variant="success">3 Approved</Badge>
            </div>
          </div>
        </div>
      </Card>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Search polls..." 
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
              <option value="all">All Polls</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="upcoming">Upcoming</option>
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
        {filteredPolls.map((poll) => (
          <Card key={poll.id} hoverable className="animate-slide-up">
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-lg bg-${getCategoryColor(poll.category)}-100`}>
                <VoteIcon className={`h-5 w-5 text-${getCategoryColor(poll.category)}-600`} />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={getCategoryColor(poll.category)} size="sm">{poll.category}</Badge>
                  <Badge variant={getStatusColor(poll.status)} size="sm">{poll.status}</Badge>
                  {poll.result && (
                    <Badge variant="success" size="sm">Passed</Badge>
                  )}
                </div>

                <h3 className="text-lg font-medium">{poll.title}</h3>
                <p className="mt-1 text-gray-600">{poll.description}</p>

                {poll.status !== 'upcoming' && (
                  <div className="mt-4 bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Participation</span>
                      <span>{poll.participation}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full" 
                        style={{ width: poll.participation }}
                      ></div>
                    </div>
                    {poll.votes && (
                      <div className="mt-2 flex items-center gap-4 text-sm">
                        <span className="text-success-600">Yes: {poll.votes.yes}</span>
                        <span className="text-error-600">No: {poll.votes.no}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>
                      {poll.status === 'upcoming' 
                        ? `Starts ${poll.startDate}`
                        : `Ends ${poll.endDate}`
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <AlertTriangle size={14} />
                    <span>{poll.requiredMajority}% majority required</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare size={14} />
                    <span>{poll.comments} comments</span>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                rightIcon={<ChevronRight size={16} />}
                onClick={() => handleViewDetails(poll.id.toString())}
              >
                View Details
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Poll Modal */}
      <CreatePollModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPollCreated={handlePollCreated}
      />

      {/* Poll Detail Modal */}
      {selectedPollId && (
        <PollDetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedPollId(null);
          }}
          pollId={selectedPollId}
          onVoteSubmitted={handleVoteSubmitted}
        />
      )}
    </div>
  );
};

export default Voting;