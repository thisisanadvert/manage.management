import React, { useState } from 'react';
import { CheckCircle2, Circle, Calendar, FileText, PoundSterling, Users, Building2, AlertTriangle, Clock } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface AcquisitionTask {
  id: string;
  title: string;
  description: string;
  category: 'legal' | 'financial' | 'operational' | 'handover';
  priority: 'high' | 'medium' | 'low';
  deadline: string;
  completed: boolean;
  notes: string;
}

interface CounterNotice {
  id: string;
  receivedDate: string;
  from: string;
  grounds: string[];
  response: string;
  resolved: boolean;
}

const AcquisitionPlanner: React.FC = () => {
  const [tasks, setTasks] = useState<AcquisitionTask[]>([
    {
      id: '1',
      title: 'Monitor Counter-Notice Period',
      description: 'Wait for one month period for counter-notices to be served',
      category: 'legal',
      priority: 'high',
      deadline: '2024-02-01',
      completed: false,
      notes: ''
    },
    {
      id: '2',
      title: 'Arrange Management Handover Meeting',
      description: 'Schedule meeting with current managing agent for handover',
      category: 'operational',
      priority: 'high',
      deadline: '2024-02-15',
      completed: false,
      notes: ''
    },
    {
      id: '3',
      title: 'Transfer Service Charge Accounts',
      description: 'Arrange transfer of service charge reserve funds',
      category: 'financial',
      priority: 'high',
      deadline: '2024-03-01',
      completed: false,
      notes: ''
    },
    {
      id: '4',
      title: 'Review Insurance Policies',
      description: 'Obtain details of current insurance and arrange continuation',
      category: 'operational',
      priority: 'medium',
      deadline: '2024-02-20',
      completed: false,
      notes: ''
    },
    {
      id: '5',
      title: 'Obtain Contractor Details',
      description: 'Get contact details for all current contractors and suppliers',
      category: 'handover',
      priority: 'medium',
      deadline: '2024-02-25',
      completed: false,
      notes: ''
    },
    {
      id: '6',
      title: 'Set Up New Management Structure',
      description: 'Decide on self-management or appoint professional managing agent',
      category: 'operational',
      priority: 'high',
      deadline: '2024-02-10',
      completed: false,
      notes: ''
    }
  ]);

  const [counterNotices, setCounterNotices] = useState<CounterNotice[]>([]);
  const [newCounterNotice, setNewCounterNotice] = useState<Partial<CounterNotice>>({
    receivedDate: '',
    from: '',
    grounds: [],
    response: '',
    resolved: false
  });
  const [showAddCounterNotice, setShowAddCounterNotice] = useState(false);

  const updateTask = (id: string, updates: Partial<AcquisitionTask>) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
  };

  const addCounterNotice = () => {
    if (newCounterNotice.receivedDate && newCounterNotice.from) {
      const counterNotice: CounterNotice = {
        id: Date.now().toString(),
        receivedDate: newCounterNotice.receivedDate || '',
        from: newCounterNotice.from || '',
        grounds: newCounterNotice.grounds || [],
        response: newCounterNotice.response || '',
        resolved: false
      };
      
      setCounterNotices([...counterNotices, counterNotice]);
      setNewCounterNotice({
        receivedDate: '',
        from: '',
        grounds: [],
        response: '',
        resolved: false
      });
      setShowAddCounterNotice(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'legal': return <FileText className="h-4 w-4" />;
      case 'financial': return <PoundSterling className="h-4 w-4" />;
      case 'operational': return <Building2 className="h-4 w-4" />;
      case 'handover': return <Users className="h-4 w-4" />;
      default: return <Circle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const tasksByCategory = {
    legal: tasks.filter(task => task.category === 'legal'),
    financial: tasks.filter(task => task.category === 'financial'),
    operational: tasks.filter(task => task.category === 'operational'),
    handover: tasks.filter(task => task.category === 'handover')
  };

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900">Acquisition Progress</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{completedTasks}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">{totalTasks - completedTasks}</div>
              <div className="text-sm text-gray-600">Remaining</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{counterNotices.length}</div>
              <div className="text-sm text-gray-600">Counter-Notices</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{Math.round(progressPercentage)}%</div>
              <div className="text-sm text-gray-600">Complete</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{completedTasks} of {totalTasks} tasks completed</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Counter-Notices */}
      {counterNotices.length > 0 && (
        <Card>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-semibold text-gray-900">Counter-Notices Received</h4>
              <Button 
                variant="outline" 
                leftIcon={<FileText size={16} />}
                onClick={() => setShowAddCounterNotice(true)}
              >
                Add Counter-Notice
              </Button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h5 className="font-medium text-amber-900">Counter-Notice Response Required</h5>
                  <p className="text-sm text-amber-800 mt-1">
                    You must respond to any counter-notices within the statutory timeframe. Consider seeking legal advice.
                  </p>
                </div>
              </div>
            </div>

            {counterNotices.map((notice) => (
              <div key={notice.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h5 className="font-medium text-gray-900">From: {notice.from}</h5>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        notice.resolved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {notice.resolved ? 'Resolved' : 'Pending Response'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Received: {new Date(notice.receivedDate).toLocaleDateString()}</p>
                    {notice.grounds.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700">Grounds for dispute:</p>
                        <ul className="text-sm text-gray-600 list-disc list-inside">
                          {notice.grounds.map((ground, index) => (
                            <li key={index}>{ground}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {notice.response && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700">Response:</p>
                        <p className="text-sm text-gray-600">{notice.response}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Task Categories */}
      {Object.entries(tasksByCategory).map(([category, categoryTasks]) => (
        categoryTasks.length > 0 && (
          <Card key={category}>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                {getCategoryIcon(category)}
                <h4 className="text-lg font-semibold text-gray-900 capitalize">
                  {category} Tasks
                </h4>
                <span className="text-sm text-gray-500">
                  ({categoryTasks.filter(t => t.completed).length}/{categoryTasks.length})
                </span>
              </div>

              <div className="space-y-3">
                {categoryTasks.map((task) => (
                  <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <button
                        onClick={() => updateTask(task.id, { completed: !task.completed })}
                        className="mt-1"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className={`font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                            {task.title}
                          </h5>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                              {task.priority} priority
                            </span>
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(task.deadline).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        
                        <p className={`text-sm mt-1 ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                          {task.description}
                        </p>
                        
                        <div className="mt-2">
                          <textarea
                            value={task.notes}
                            onChange={(e) => updateTask(task.id, { notes: e.target.value })}
                            placeholder="Add notes..."
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )
      ))}

      {/* Key Deadlines */}
      <Card>
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">Key Deadlines</h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-red-600" />
                <div>
                  <h5 className="font-medium text-red-900">Counter-Notice Period Ends</h5>
                  <p className="text-sm text-red-700">One month after claim notice service</p>
                </div>
              </div>
              <div className="text-sm font-medium text-red-900">
                {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Building2 className="h-5 w-5 text-blue-600" />
                <div>
                  <h5 className="font-medium text-blue-900">Acquisition Date</h5>
                  <p className="text-sm text-blue-700">RTM company takes control</p>
                </div>
              </div>
              <div className="text-sm font-medium text-blue-900">
                {new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Completion Status */}
      {progressPercentage === 100 && (
        <Card>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              <h4 className="text-lg font-semibold text-green-800">Ready for Acquisition</h4>
            </div>
            <p className="text-gray-600">
              All acquisition tasks have been completed. Your RTM company is ready to take control of building management.
            </p>
            <div className="flex space-x-3">
              <Button variant="primary">
                Complete Acquisition
              </Button>
              <Button variant="outline">
                Download Handover Checklist
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AcquisitionPlanner;
