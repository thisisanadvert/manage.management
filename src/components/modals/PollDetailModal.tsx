import React, { useState, useEffect } from 'react';
import { X, Calendar, Users, MessageSquare, FileText, CheckCircle2 } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface PollDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  pollId: string;
  onVoteSubmitted?: () => void;
}

const PollDetailModal: React.FC<PollDetailModalProps> = ({ 
  isOpen, 
  onClose, 
  pollId, 
  onVoteSubmitted 
}) => {
  const { user } = useAuth();
  const [poll, setPoll] = useState<any>(null);
  const [options, setOptions] = useState<any[]>([]);
  const [userVote, setUserVote] = useState<any>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && pollId) {
      fetchPollDetails();
    }
  }, [isOpen, pollId]);

  const fetchPollDetails = async () => {
    try {
      // Fetch poll details
      const { data: pollData, error: pollError } = await supabase
        .from('polls')
        .select('*')
        .eq('id', pollId)
        .single();

      if (pollError) throw pollError;
      setPoll(pollData);

      // Fetch poll options if not binary
      if (pollData.poll_type !== 'binary') {
        const { data: optionsData, error: optionsError } = await supabase
          .from('poll_options')
          .select('*')
          .eq('poll_id', pollId)
          .order('option_order');

        if (optionsError) throw optionsError;
        setOptions(optionsData || []);
      }

      // Check if user has already voted
      const { data: voteData, error: voteError } = await supabase
        .from('poll_votes')
        .select('*')
        .eq('poll_id', pollId)
        .eq('user_id', user?.id);

      if (voteError) throw voteError;
      setUserVote(voteData?.[0] || null);

    } catch (error) {
      console.error('Error fetching poll details:', error);
      setError('Failed to load poll details');
    }
  };

  const handleVote = async () => {
    if (!user?.id || !poll) return;

    setIsSubmitting(true);
    setError(null);

    try {
      if (poll.poll_type === 'binary') {
        // Binary vote (yes/no/abstain)
        const voteValue = selectedOptions[0];
        if (!voteValue) {
          setError('Please select an option');
          return;
        }

        const { error } = await supabase
          .from('poll_votes')
          .insert({
            poll_id: pollId,
            user_id: user.id,
            vote: voteValue
          });

        if (error) throw error;

      } else {
        // Multiple choice vote
        if (selectedOptions.length === 0) {
          setError('Please select at least one option');
          return;
        }

        const votes = selectedOptions.map(optionId => ({
          poll_id: pollId,
          user_id: user.id,
          option_id: optionId,
          vote: 'selected'
        }));

        const { error } = await supabase
          .from('poll_votes')
          .insert(votes);

        if (error) throw error;
      }

      onVoteSubmitted?.();
      onClose();

    } catch (error: any) {
      console.error('Error submitting vote:', error);
      setError(error.message || 'Failed to submit vote');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOptionSelect = (optionId: string) => {
    if (poll?.voting_method === 'single_choice') {
      setSelectedOptions([optionId]);
    } else {
      setSelectedOptions(prev => 
        prev.includes(optionId) 
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    }
  };

  const handleBinaryVote = (vote: string) => {
    setSelectedOptions([vote]);
  };

  if (!isOpen || !poll) return null;

  const canVote = poll.status === 'active' && !userVote && 
    new Date(poll.start_date) <= new Date() && 
    new Date(poll.end_date) >= new Date();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
        
        <div className="relative w-full max-w-4xl rounded-lg bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-primary-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{poll.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="primary" size="sm">{poll.category}</Badge>
                  <Badge variant={poll.status === 'active' ? 'success' : 'gray'} size="sm">
                    {poll.status}
                  </Badge>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 rounded-md bg-error-50 p-4 text-sm text-error-500">
                {error}
              </div>
            )}

            {userVote && (
              <div className="mb-4 rounded-md bg-success-50 p-4 text-sm text-success-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>You have already voted in this poll</span>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Poll Description */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{poll.description}</p>
              </div>

              {/* Additional Context */}
              {poll.category === 'Supplier Selection' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Supplier Selection Details</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>• Please review all supplier quotes and specifications before voting</p>
                    <p>• Consider factors such as price, quality, timeline, and previous reviews</p>
                    <p>• This decision will be binding once the poll closes</p>
                  </div>
                </div>
              )}

              {poll.category === 'Building Improvement' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">Building Improvement Information</h4>
                  <div className="text-sm text-green-800 space-y-1">
                    <p>• This improvement may affect service charges</p>
                    <p>• Work schedule and resident impact will be communicated separately</p>
                    <p>• All necessary permits and approvals will be obtained before work begins</p>
                  </div>
                </div>
              )}

              {poll.category === 'Budget Approval' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-900 mb-2">Budget Approval Notice</h4>
                  <div className="text-sm text-yellow-800 space-y-1">
                    <p>• Detailed budget breakdown available in the documents section</p>
                    <p>• This budget will determine service charge levels for the coming year</p>
                    <p>• Questions about specific budget items can be raised in comments</p>
                  </div>
                </div>
              )}

              {/* Poll Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar size={16} />
                  <span>Ends: {new Date(poll.end_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Users size={16} />
                  <span>{poll.required_majority}% majority required</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <MessageSquare size={16} />
                  <span>Comments {poll.allow_comments ? 'enabled' : 'disabled'}</span>
                </div>
              </div>

              {/* Voting Section */}
              {canVote && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Cast Your Vote</h3>
                  
                  {poll.poll_type === 'binary' ? (
                    <div className="space-y-3">
                      {['yes', 'no', 'abstain'].map((option) => (
                        <label key={option} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="vote"
                            value={option}
                            checked={selectedOptions.includes(option)}
                            onChange={() => handleBinaryVote(option)}
                            className="mr-3 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="capitalize font-medium">{option}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {options.map((option) => (
                        <label key={option.id} className="flex items-start p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type={poll.voting_method === 'single_choice' ? 'radio' : 'checkbox'}
                            name="vote"
                            value={option.id}
                            checked={selectedOptions.includes(option.id)}
                            onChange={() => handleOptionSelect(option.id)}
                            className="mt-1 mr-3 text-primary-600 focus:ring-primary-500"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{option.option_text}</div>
                            {option.option_description && (
                              <div className="text-sm text-gray-600 mt-1">{option.option_description}</div>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 flex justify-end">
                    <Button
                      variant="primary"
                      onClick={handleVote}
                      isLoading={isSubmitting}
                      disabled={selectedOptions.length === 0}
                    >
                      Submit Vote
                    </Button>
                  </div>
                </div>
              )}

              {!canVote && poll.status === 'active' && userVote && (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle2 size={48} className="mx-auto mb-4 text-success-500" />
                  <h3 className="text-lg font-medium text-gray-900">Vote Submitted</h3>
                  <p>Thank you for participating in this poll.</p>
                </div>
              )}

              {poll.status !== 'active' && (
                <div className="text-center py-8 text-gray-500">
                  <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900">
                    {poll.status === 'upcoming' ? 'Poll Not Started' : 'Poll Closed'}
                  </h3>
                  <p>
                    {poll.status === 'upcoming' 
                      ? `This poll will start on ${new Date(poll.start_date).toLocaleDateString()}`
                      : 'This poll has ended and voting is no longer available.'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollDetailModal;
