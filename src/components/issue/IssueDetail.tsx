import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  MessageSquare, 
  MapPin, 
  PenTool as Tool, 
  Building2, 
  Wrench, 
  Zap, 
  Droplet, 
  Shield, 
  Brush,
  Link,
  User,
  History,
  Send,
  X,
  Edit,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Portal from '../ui/Portal';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface IssueDetailProps {
  issueId: string;
  onClose: () => void;
  onStatusChange?: () => void;
}

const IssueDetail = ({ issueId, onClose, onStatusChange }: IssueDetailProps) => {
  const { user } = useAuth();
  const [issue, setIssue] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);
  const [showAllTimeline, setShowAllTimeline] = useState(false);
  
  // Extract the UUID from the issue ID (remove the "ISS-" prefix)
  const actualIssueId = issueId.replace('ISS-', '');
  
  useEffect(() => {
    const fetchIssueDetails = async () => {
      setIsLoading(true);
      try {
        // Fetch issue details without user relationships to avoid foreign key error
        const { data: issueData, error: issueError } = await supabase
          .from('issues')
          .select('*')
          .eq('id', actualIssueId)
          .single();
          
        if (issueError) throw issueError;
        
        // Format the issue data
        const formattedIssue = {
          ...issueData,
          id: `ISS-${issueData.id.substring(0, 4)}`,
          reportedBy: issueData.reported_by ? {
            name: `${issueData.reported_by.raw_user_meta_data.firstName || ''} ${issueData.reported_by.raw_user_meta_data.lastName || ''}`.trim() || issueData.reported_by.email,
            role: issueData.reported_by.raw_user_meta_data.role
          } : 'Unknown',
          reportedAt: new Date(issueData.created_at).toLocaleDateString(),
          assignedTo: issueData.assigned_to ? {
            name: `${issueData.assigned_to.raw_user_meta_data.firstName || ''} ${issueData.assigned_to.raw_user_meta_data.lastName || ''}`.trim() || issueData.assigned_to.email,
            role: issueData.assigned_to.raw_user_meta_data.role
          } : null
        };
        
        setIssue(formattedIssue);
        setNewStatus(formattedIssue.status);
        
        // Fetch timeline
        const { data: timelineData, error: timelineError } = await supabase
          .from('issue_timeline')
          .select(`
            *,
            created_by(id, email, raw_user_meta_data)
          `)
          .eq('issue_id', actualIssueId)
          .order('created_at', { ascending: false });
          
        if (timelineError) throw timelineError;
        
        // Format timeline data
        const formattedTimeline = timelineData.map(item => ({
          ...item,
          createdBy: item.created_by ? {
            name: `${item.created_by.raw_user_meta_data.firstName || ''} ${item.created_by.raw_user_meta_data.lastName || ''}`.trim() || item.created_by.email,
            role: item.created_by.raw_user_meta_data.role
          } : 'System',
          createdAt: new Date(item.created_at).toLocaleString()
        }));
        
        setTimeline(formattedTimeline);
        
        // Fetch comments
        const { data: commentsData, error: commentsError } = await supabase
          .from('issue_comments')
          .select(`
            *,
            author_id(id, email, raw_user_meta_data)
          `)
          .eq('issue_id', actualIssueId)
          .order('created_at', { ascending: true });
          
        if (commentsError) throw commentsError;
        
        // Format comments data
        const formattedComments = commentsData.map(comment => ({
          ...comment,
          author: comment.author_id ? {
            name: `${comment.author_id.raw_user_meta_data.firstName || ''} ${comment.author_id.raw_user_meta_data.lastName || ''}`.trim() || comment.author_id.email,
            role: comment.author_id.raw_user_meta_data.role,
            id: comment.author_id.id
          } : 'Unknown',
          createdAt: new Date(comment.created_at).toLocaleString()
        }));
        
        setComments(formattedComments);
      } catch (error) {
        console.error('Error fetching issue details:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchIssueDetails();
    
    // Set up real-time subscriptions
    const timelineSubscription = supabase
      .channel('issue_timeline_changes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'issue_timeline',
        filter: `issue_id=eq.${actualIssueId}`
      }, (payload) => {
        // Fetch the new timeline entry with user details
        supabase
          .from('issue_timeline')
          .select(`
            *,
            created_by(id, email, raw_user_meta_data)
          `)
          .eq('id', payload.new.id)
          .single()
          .then(({ data, error }) => {
            if (error) {
              console.error('Error fetching new timeline entry:', error);
              return;
            }
            
            if (data) {
              const newEntry = {
                ...data,
                createdBy: data.created_by ? {
                  name: `${data.created_by.raw_user_meta_data.firstName || ''} ${data.created_by.raw_user_meta_data.lastName || ''}`.trim() || data.created_by.email,
                  role: data.created_by.raw_user_meta_data.role
                } : 'System',
                createdAt: new Date(data.created_at).toLocaleString()
              };
              
              setTimeline(prev => [newEntry, ...prev]);
            }
          });
      })
      .subscribe();
      
    const commentsSubscription = supabase
      .channel('issue_comments_changes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'issue_comments',
        filter: `issue_id=eq.${actualIssueId}`
      }, (payload) => {
        // Fetch the new comment with user details
        supabase
          .from('issue_comments')
          .select(`
            *,
            author_id(id, email, raw_user_meta_data)
          `)
          .eq('id', payload.new.id)
          .single()
          .then(({ data, error }) => {
            if (error) {
              console.error('Error fetching new comment:', error);
              return;
            }
            
            if (data) {
              const newComment = {
                ...data,
                author: data.author_id ? {
                  name: `${data.author_id.raw_user_meta_data.firstName || ''} ${data.author_id.raw_user_meta_data.lastName || ''}`.trim() || data.author_id.email,
                  role: data.author_id.raw_user_meta_data.role,
                  id: data.author_id.id
                } : 'Unknown',
                createdAt: new Date(data.created_at).toLocaleString()
              };
              
              setComments(prev => [...prev, newComment]);
            }
          });
      })
      .subscribe();
      
    const issueSubscription = supabase
      .channel('issue_changes')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'issues',
        filter: `id=eq.${actualIssueId}`
      }, (payload) => {
        // Refresh the issue data
        fetchIssueDetails();
        
        // Notify parent component
        onStatusChange?.();
      })
      .subscribe();
    
    return () => {
      timelineSubscription.unsubscribe();
      commentsSubscription.unsubscribe();
      issueSubscription.unsubscribe();
    };
  }, [actualIssueId, onStatusChange]);
  
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setIsSubmittingComment(true);
    try {
      const { error } = await supabase
        .from('issue_comments')
        .insert([
          {
            issue_id: actualIssueId,
            content: newComment,
            author_id: user?.id
          }
        ]);
        
      if (error) throw error;
      
      setNewComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };
  
  const handleStatusChange = async () => {
    if (newStatus === issue.status) {
      setIsEditingStatus(false);
      return;
    }
    
    setIsSubmittingStatus(true);
    try {
      const { error } = await supabase
        .from('issues')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', actualIssueId);
        
      if (error) throw error;
      
      setIsEditingStatus(false);
      onStatusChange?.();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsSubmittingStatus(false);
    }
  };
  
  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'plumbing':
        return <Droplet size={20} />;
      case 'electrical':
        return <Zap size={20} />;
      case 'mechanical':
        return <Wrench size={20} />;
      case 'security':
        return <Shield size={20} />;
      case 'cleaning':
        return <Brush size={20} />;
      default:
        return <Tool size={20} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'accent';
      default:
        return 'gray';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'in progress':
        return 'warning';
      case 'scheduled':
        return 'accent';
      default:
        return 'gray';
    }
  };
  
  if (isLoading) {
    return (
      <Portal>
        <div className="fixed inset-0 z-[1100] overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full m-4" role="dialog" aria-modal="true">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          </div>
        </div>
      </Portal>
    );
  }
  
  if (!issue) {
    return (
      <Portal>
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full m-4" role="dialog" aria-modal="true">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Issue Details</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <X size={20} />
              </button>
            </div>
            <div className="flex flex-col items-center justify-center h-64">
              <AlertTriangle size={48} className="text-warning-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Issue not found</h3>
              <p className="text-gray-500 mt-2">The issue you're looking for could not be found.</p>
              <Button variant="primary" className="mt-4" onClick={onClose}>
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </Portal>
    );
  }

  return (
    <Portal>
      <div className="fixed inset-0 z-[1100] overflow-y-auto bg-black bg-opacity-50">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full" role="dialog" aria-modal="true">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 p-4">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg bg-${getPriorityColor(issue.priority)}-100 mr-3`}>
                {getCategoryIcon(issue.category)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant={getPriorityColor(issue.priority)} size="sm">{issue.priority}</Badge>
                  <span className="text-sm text-gray-500">{issue.id}</span>
                </div>
                <h2 className="text-lg font-semibold">{issue.title}</h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="p-6 max-h-[80vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Main content - 2/3 width on desktop */}
              <div className="md:col-span-2 space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                  <p className="text-gray-900">{issue.description}</p>
                </div>
                
                {/* Status */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Status</h3>
                  <div className="flex items-center">
                    {isEditingStatus ? (
                      <div className="flex items-center space-x-2">
                        <select
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value)}
                          className="rounded-md border border-gray-300 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                        >
                          <option value="reported">Reported</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Scheduled">Scheduled</option>
                          <option value="Completed">Completed</option>
                        </select>
                        <Button 
                          variant="primary" 
                          size="sm"
                          isLoading={isSubmittingStatus}
                          onClick={handleStatusChange}
                        >
                          Save
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setIsEditingStatus(false);
                            setNewStatus(issue.status);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Badge variant={getStatusColor(issue.status)} size="md">{issue.status}</Badge>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="ml-2"
                          onClick={() => setIsEditingStatus(true)}
                        >
                          <Edit size={14} />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Timeline */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-500">Activity Timeline</h3>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowAllTimeline(!showAllTimeline)}
                    >
                      {showAllTimeline ? (
                        <>Show Less <ChevronUp size={14} className="ml-1" /></>
                      ) : (
                        <>Show All <ChevronDown size={14} className="ml-1" /></>
                      )}
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {(showAllTimeline ? timeline : timeline.slice(0, 5)).map((item, index) => (
                      <div key={item.id} className="flex">
                        <div className="mr-3 flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            {item.event_type === 'created' && <AlertTriangle size={14} className="text-warning-500" />}
                            {item.event_type === 'status_change' && <Clock size={14} className="text-primary-500" />}
                            {item.event_type === 'comment' && <MessageSquare size={14} className="text-accent-500" />}
                          </div>
                          {index < (showAllTimeline ? timeline.length - 1 : Math.min(timeline.length - 1, 4)) && (
                            <div className="w-0.5 h-full bg-gray-200 mt-1"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{item.description}</p>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <span>{typeof item.createdBy === 'string' ? item.createdBy : item.createdBy.name}</span>
                            <span className="mx-1">•</span>
                            <span>{item.createdAt}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {!showAllTimeline && timeline.length > 5 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full text-primary-600"
                        onClick={() => setShowAllTimeline(true)}
                      >
                        Show {timeline.length - 5} more activities
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Comments */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-4">Comments ({comments.length})</h3>
                  
                  <div className="space-y-4 mb-4">
                    {comments.map((comment) => (
                      <div 
                        key={comment.id} 
                        className={`p-3 rounded-lg ${
                          comment.author.id === user?.id ? 'bg-primary-50 ml-8' : 'bg-gray-50 mr-8'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="font-medium text-sm">
                            {comment.author.name}
                            {comment.author.id === user?.id && <span className="text-xs text-gray-500 ml-2">(You)</span>}
                          </div>
                          <div className="text-xs text-gray-500">{comment.createdAt}</div>
                        </div>
                        <p className="mt-1 text-gray-800">{comment.content}</p>
                      </div>
                    ))}
                    
                    {comments.length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        No comments yet. Be the first to comment!
                      </div>
                    )}
                  </div>
                  
                  <form onSubmit={handleSubmitComment} className="mt-4">
                    <div className="flex items-end space-x-2">
                      <div className="flex-1">
                        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                          Add a comment
                        </label>
                        <textarea
                          id="comment"
                          rows={2}
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                          placeholder="Type your comment here..."
                        />
                      </div>
                      <Button
                        type="submit"
                        variant="primary"
                        isLoading={isSubmittingComment}
                        disabled={!newComment.trim()}
                        rightIcon={<Send size={14} />}
                      >
                        Send
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
              
              {/* Sidebar - 1/3 width on desktop */}
              <div className="space-y-6">
                {/* Details */}
                <Card>
                  <h3 className="text-sm font-medium text-gray-500 mb-4">Details</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-gray-500">Category</div>
                      <div className="flex items-center mt-1">
                        <div className="p-1 rounded bg-gray-100 mr-2">
                          {getCategoryIcon(issue.category)}
                        </div>
                        <span className="text-sm font-medium">{issue.category}</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-gray-500">Location</div>
                      <div className="flex items-center mt-1">
                        <MapPin size={14} className="text-gray-400 mr-2" />
                        <span className="text-sm">
                          {issue.location?.unit ? `Unit ${issue.location.unit} - ${issue.location.area}` : 'Not specified'}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-gray-500">Reported By</div>
                      <div className="flex items-center mt-1">
                        <User size={14} className="text-gray-400 mr-2" />
                        <span className="text-sm">{typeof issue.reportedBy === 'string' ? issue.reportedBy : issue.reportedBy.name}</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-gray-500">Reported On</div>
                      <div className="flex items-center mt-1">
                        <Calendar size={14} className="text-gray-400 mr-2" />
                        <span className="text-sm">{issue.reportedAt}</span>
                      </div>
                    </div>
                    
                    {issue.assignedTo && (
                      <div>
                        <div className="text-xs text-gray-500">Assigned To</div>
                        <div className="flex items-center mt-1">
                          <User size={14} className="text-gray-400 mr-2" />
                          <span className="text-sm">{typeof issue.assignedTo === 'string' ? issue.assignedTo : issue.assignedTo.name}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
                
                {/* Quick Actions */}
                <Card>
                  <h3 className="text-sm font-medium text-gray-500 mb-4">Actions</h3>
                  
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" leftIcon={<Edit size={14} />}>
                      Edit Issue
                    </Button>
                    
                    <Button variant="outline" className="w-full justify-start" leftIcon={<User size={14} />}>
                      Assign Issue
                    </Button>
                    
                    {issue.status !== 'Completed' && (
                      <Button 
                        variant="success" 
                        className="w-full justify-start" 
                        leftIcon={<CheckCircle2 size={14} />}
                        onClick={() => {
                          setNewStatus('Completed');
                          setIsEditingStatus(true);
                        }}
                      >
                        Mark as Completed
                      </Button>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default IssueDetail;