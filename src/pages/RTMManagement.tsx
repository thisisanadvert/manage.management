import React, { useState } from 'react';
import { 
  Building2, 
  Lightbulb, 
  Download, 
  FileText, 
  CheckSquare,
  AlertCircle,
  Clock,
  ChevronRight,
  ArrowRight,
  Users,
  Scale,
  Calendar,
  File,
  Flag
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const RTMManagement = () => {
  const [activeStep, setActiveStep] = useState(2);
  
  const rtmSteps = [
    { 
      id: 1, 
      title: 'Initial Assessment', 
      description: 'Assess building eligibility and gauge leaseholder interest',
      status: 'completed',
      tasks: [
        { id: 'task-1-1', title: 'Check building eligibility', completed: true },
        { id: 'task-1-2', title: 'Survey leaseholder interest', completed: true },
        { id: 'task-1-3', title: 'Collect preliminary information', completed: true },
      ]
    },
    { 
      id: 2, 
      title: 'Formation Planning', 
      description: 'Create RTM company and prepare necessary documentation',
      status: 'in-progress',
      tasks: [
        { id: 'task-2-1', title: 'Form RTM company with Companies House', completed: true },
        { id: 'task-2-2', title: 'Prepare articles of association', completed: true },
        { id: 'task-2-3', title: 'Draft membership agreements', completed: false },
        { id: 'task-2-4', title: 'Prepare financial projections', completed: false },
      ]
    },
    { 
      id: 3, 
      title: 'Formal Notice', 
      description: 'Serve formal RTM notice to landlord and gather responses',
      status: 'not-started',
      tasks: [
        { id: 'task-3-1', title: 'Draft RTM claim notice', completed: false },
        { id: 'task-3-2', title: 'Serve notice to landlord', completed: false },
        { id: 'task-3-3', title: 'Track response timeframes', completed: false },
        { id: 'task-3-4', title: 'Handle counter-notices (if any)', completed: false },
      ]
    },
    { 
      id: 4, 
      title: 'Acquisition of Management', 
      description: 'Complete acquisition and set up management processes',
      status: 'not-started',
      tasks: [
        { id: 'task-4-1', title: 'Determine acquisition date', completed: false },
        { id: 'task-4-2', title: 'Request management information from landlord', completed: false },
        { id: 'task-4-3', title: 'Set up service charge accounts', completed: false },
        { id: 'task-4-4', title: 'Transfer contracts to RTM company', completed: false },
        { id: 'task-4-5', title: 'First RTM company board meeting', completed: false },
      ]
    },
  ];
  
  const resources = [
    {
      id: 'res-1',
      title: 'RTM Claim Notice Template',
      description: 'Official template for the RTM claim notice to be served to the landlord.',
      category: 'Legal',
      type: 'document',
      downloadable: true
    },
    {
      id: 'res-2',
      title: 'Articles of Association Template',
      description: 'Standard articles of association for RTM companies with explanatory notes.',
      category: 'Legal',
      type: 'document',
      downloadable: true
    },
    {
      id: 'res-3',
      title: 'Financial Planning Spreadsheet',
      description: 'Template for projecting service charge budgets and RTM company expenses.',
      category: 'Financial',
      type: 'spreadsheet',
      downloadable: true
    },
    {
      id: 'res-4',
      title: 'RTM Legislation Guide',
      description: 'Comprehensive guide to the Commonhold and Leasehold Reform Act 2002 as it relates to RTM.',
      category: 'Educational',
      type: 'pdf',
      downloadable: true
    },
    {
      id: 'res-5',
      title: 'RTM Case Studies',
      description: 'Real-world examples of successful RTM formations with lessons learned.',
      category: 'Educational',
      type: 'pdf',
      downloadable: true
    },
    {
      id: 'res-6',
      title: 'RTM Timeline Calculator',
      description: 'Interactive tool to help plan and track the RTM formation process timeline.',
      category: 'Planning',
      type: 'tool',
      downloadable: false
    },
  ];
  
  const upcomingMilestones = [
    { id: 'mil-1', title: 'RTM Company Board Meeting', date: 'May 15, 2025', category: 'Meeting' },
    { id: 'mil-2', title: 'Serve Claim Notice to Landlord', date: 'June 1, 2025', category: 'Legal' },
    { id: 'mil-3', title: 'Expected Landlord Response Deadline', date: 'July 1, 2025', category: 'Legal' },
    { id: 'mil-4', title: 'Target Acquisition Date', date: 'September 1, 2025', category: 'Milestone' },
  ];
  
  const getStatusBadge = (status: string) => {
    if (status === 'completed') return <Badge variant="success">Completed</Badge>;
    if (status === 'in-progress') return <Badge variant="accent">In Progress</Badge>;
    if (status === 'not-started') return <Badge variant="gray">Not Started</Badge>;
    return <Badge variant="gray">Unknown</Badge>;
  };
  
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText size={16} />;
      case 'spreadsheet':
        return <FileText size={16} />;
      case 'pdf':
        return <File size={16} />;
      case 'tool':
        return <Lightbulb size={16} />;
      default:
        return <FileText size={16} />;
    }
  };
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Legal':
        return 'secondary';
      case 'Financial':
        return 'primary';
      case 'Educational':
        return 'accent';
      case 'Planning':
        return 'warning';
      case 'Meeting':
        return 'primary';
      case 'Milestone':
        return 'error';
      default:
        return 'gray';
    }
  };

  return (
    <div className="space-y-6 pb-16 lg:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">RTM Management</h1>
          <p className="text-gray-600 mt-1">Guide to Right to Manage formation and company management</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            leftIcon={<FileText size={16} />}
            variant="outline"
          >
            RTM Resources
          </Button>
          <Button 
            leftIcon={<Users size={16} />}
            variant="primary"
          >
            RTM Committee
          </Button>
        </div>
      </div>
      
      {/* RTM Progress Overview */}
      <Card className="bg-gradient-to-br from-primary-800 to-primary-900 text-white">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <div className="flex items-center">
              <Building2 size={24} className="mr-2" />
              <h2 className="text-xl font-bold">RTM Formation Progress</h2>
            </div>
            <p className="mt-2 text-primary-100">Track your building's journey to Right to Manage</p>
            
            <div className="mt-4">
              <div className="flex justify-between text-sm text-primary-100 mb-1">
                <span>Overall progress</span>
                <span>40% complete</span>
              </div>
              <div className="w-full bg-primary-950 bg-opacity-40 rounded-full h-2.5">
                <div className="bg-white h-2.5 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white bg-opacity-10 rounded-lg p-3">
                <div className="text-xs text-primary-100">Leaseholder Participation</div>
                <div className="text-xl font-bold mt-1">67%</div>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-3">
                <div className="text-xs text-primary-100">Tasks Completed</div>
                <div className="text-xl font-bold mt-1">6/18</div>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-3">
                <div className="text-xs text-primary-100">Current Stage</div>
                <div className="text-xl font-bold mt-1">2/4</div>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-3">
                <div className="text-xs text-primary-100">Est. Completion</div>
                <div className="text-xl font-bold mt-1">Sept 2025</div>
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-72 bg-white bg-opacity-10 rounded-lg p-4">
            <h3 className="font-semibold">RTM Company Details</h3>
            <div className="mt-3 space-y-3 text-sm">
              <div>
                <div className="text-primary-200">Company Name</div>
                <div className="font-medium">Waterside Apartments RTM Ltd</div>
              </div>
              <div>
                <div className="text-primary-200">Registration Number</div>
                <div className="font-medium">12345678</div>
              </div>
              <div>
                <div className="text-primary-200">Formation Date</div>
                <div className="font-medium">February 15, 2025</div>
              </div>
              <div>
                <div className="text-primary-200">Registered Address</div>
                <div className="font-medium">123 Riverside Drive, London, SE1 7TH</div>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* RTM Process Steps */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">RTM Formation Process</h2>
        
        <div className="space-y-4">
          {rtmSteps.map((step, index) => (
            <Card 
              key={step.id} 
              className={`transition-all border-l-4 ${
                step.status === 'completed' 
                  ? 'border-l-success-500 bg-success-50' 
                  : step.status === 'in-progress' 
                    ? 'border-l-accent-500' 
                    : 'border-l-gray-300'
              } ${activeStep === step.id ? 'ring-2 ring-primary-200' : ''}`}
              onClick={() => setActiveStep(step.id)}
            >
              <div className="flex flex-col lg:flex-row lg:items-center">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-900 font-bold border border-gray-200 mr-3">
                      {step.id}
                    </span>
                    <div className="flex items-center">
                      <h3 className="font-semibold text-lg text-gray-900">{step.title}</h3>
                      <div className="ml-3">
                        {getStatusBadge(step.status)}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 ml-11">{step.description}</p>
                  
                  {activeStep === step.id && (
                    <div className="mt-4 ml-11">
                      <h4 className="font-medium text-gray-900 mb-2">Tasks:</h4>
                      <ul className="space-y-2">
                        {step.tasks.map(task => (
                          <li key={task.id} className="flex items-start">
                            <div className={`mt-0.5 mr-2 ${task.completed ? 'text-success-500' : 'text-gray-400'}`}>
                              <CheckSquare size={16} />
                            </div>
                            <span className={task.completed ? 'text-gray-700 line-through' : 'text-gray-900'}>
                              {task.title}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 lg:mt-0 flex items-center justify-between lg:justify-end lg:w-48">
                  <div className="text-sm text-gray-500">
                    {step.status === 'completed' && (
                      <span className="flex items-center text-success-600">
                        <CheckSquare size={14} className="mr-1" />
                        Step Complete
                      </span>
                    )}
                    
                    {step.status === 'in-progress' && (
                      <span className="flex items-center text-accent-600">
                        <Clock size={14} className="mr-1" />
                        In Progress
                      </span>
                    )}
                    
                    {step.status === 'not-started' && (
                      <span className="flex items-center text-gray-500">
                        <AlertCircle size={14} className="mr-1" />
                        Not Started
                      </span>
                    )}
                  </div>
                  
                  {!activeStep || activeStep !== step.id ? (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-2"
                      onClick={() => setActiveStep(step.id)}
                    >
                      <ChevronRight size={16} />
                    </Button>
                  ) : (
                    <Button 
                      variant="primary" 
                      size="sm"
                      className="whitespace-nowrap ml-2"
                    >
                      {step.status === 'completed' ? 'View Details' : 'Manage Tasks'}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resources */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">RTM Resources</h2>
            <Button 
              variant="link" 
              rightIcon={<ArrowRight size={16} />}
            >
              View all resources
            </Button>
          </div>
          
          <div className="space-y-3">
            {resources.slice(0, 4).map((resource) => (
              <Card 
                key={resource.id} 
                hoverable 
                className="animate-slide-up"
              >
                <div className="flex">
                  <div className={`p-3 mr-3 rounded-lg bg-${getCategoryColor(resource.category)}-100`}>
                    {getResourceIcon(resource.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="font-medium text-gray-900">{resource.title}</h3>
                      <Badge
                        variant={getCategoryColor(resource.category) as any}
                        size="sm"
                        className="ml-2"
                      >
                        {resource.category}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{resource.description}</p>
                  </div>
                </div>
                
                <div className="flex justify-end mt-3 pt-3 border-t border-gray-100">
                  {resource.downloadable ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      leftIcon={<Download size={14} />}
                    >
                      Download
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm"
                    >
                      Access Tool
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Upcoming Milestones */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">RTM Timeline</h2>
            <Button 
              variant="outline" 
              size="sm"
            >
              View Calendar
            </Button>
          </div>
          
          <Card>
            <h3 className="font-medium text-gray-900 mb-4 flex items-center">
              <Flag size={18} className="mr-2 text-primary-600" />
              Upcoming Milestones
            </h3>
            
            <div className="space-y-4">
              {upcomingMilestones.map((milestone) => (
                <div 
                  key={milestone.id} 
                  className="flex items-start border-l-2 border-gray-200 pl-4 pb-4"
                >
                  <div className="w-24 flex-shrink-0 mr-4">
                    <div className="font-medium text-gray-900">{milestone.date.split(',')[0]}</div>
                    <div className="text-xs text-gray-500">{milestone.date.split(',')[1]}</div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h4 className="font-medium text-gray-900">{milestone.title}</h4>
                      <Badge
                        variant={getCategoryColor(milestone.category) as any}
                        size="sm"
                        className="ml-2"
                      >
                        {milestone.category}
                      </Badge>
                    </div>
                    
                    {milestone.category === 'Legal' && (
                      <p className="text-xs text-gray-500 mt-1">
                        Important legal deadline for the RTM process
                      </p>
                    )}
                    
                    {milestone.category === 'Meeting' && (
                      <p className="text-xs text-gray-500 mt-1">
                        Attendance required for all RTM committee members
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex justify-center">
              <Button 
                variant="link" 
                rightIcon={<ArrowRight size={16} />}
              >
                View full timeline
              </Button>
            </div>
          </Card>
          
          <div className="grid grid-cols-3 gap-4 mt-4">
            <Card className="p-3 bg-secondary-50">
              <div className="flex flex-col items-center">
                <Users size={24} className="text-secondary-600 mb-2" />
                <h3 className="font-medium text-center">RTM Committee</h3>
                <p className="text-xs text-center mt-1">View members</p>
              </div>
            </Card>
            <Card className="p-3 bg-primary-50">
              <div className="flex flex-col items-center">
                <Scale size={24} className="text-primary-600 mb-2" />
                <h3 className="font-medium text-center">Legal Framework</h3>
                <p className="text-xs text-center mt-1">View guidance</p>
              </div>
            </Card>
            <Card className="p-3 bg-accent-50">
              <div className="flex flex-col items-center">
                <Calendar size={24} className="text-accent-600 mb-2" />
                <h3 className="font-medium text-center">RTM Calendar</h3>
                <p className="text-xs text-center mt-1">View schedule</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RTMManagement;