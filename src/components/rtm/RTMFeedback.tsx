import React, { useState } from 'react';
import { Star, Send, MessageCircle, ThumbsUp, ThumbsDown, AlertTriangle } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface FeedbackData {
  rating: number;
  category: 'tool_usability' | 'content_accuracy' | 'process_guidance' | 'technical_issues' | 'general';
  message: string;
  email: string;
  allowContact: boolean;
}

interface FeedbackItem {
  id: string;
  date: string;
  category: string;
  rating: number;
  message: string;
  status: 'pending' | 'reviewed' | 'resolved';
}

const RTMFeedback: React.FC = () => {
  const [feedback, setFeedback] = useState<FeedbackData>({
    rating: 0,
    category: 'general',
    message: '',
    email: '',
    allowContact: false
  });

  const [submitted, setSubmitted] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  // Mock previous feedback for demonstration
  const [previousFeedback] = useState<FeedbackItem[]>([
    {
      id: '1',
      date: '2024-01-15',
      category: 'Tool Usability',
      rating: 4,
      message: 'The eligibility checker is very helpful, but could use more detailed explanations.',
      status: 'reviewed'
    },
    {
      id: '2',
      date: '2024-01-10',
      category: 'Content Accuracy',
      rating: 5,
      message: 'Excellent legal guidance throughout the process.',
      status: 'resolved'
    }
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (feedback.rating === 0) {
      alert('Please provide a rating');
      return;
    }

    // Here you would typically send the feedback to your backend
    console.log('Submitting feedback:', feedback);
    
    // Simulate API call
    setTimeout(() => {
      setSubmitted(true);
      // Reset form after a delay
      setTimeout(() => {
        setSubmitted(false);
        setFeedback({
          rating: 0,
          category: 'general',
          message: '',
          email: '',
          allowContact: false
        });
      }, 3000);
    }, 1000);
  };

  const handleRatingClick = (rating: number) => {
    setFeedback(prev => ({ ...prev, rating }));
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return 'Very Poor';
      case 2: return 'Poor';
      case 3: return 'Average';
      case 4: return 'Good';
      case 5: return 'Excellent';
      default: return 'Rate your experience';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'tool_usability': return 'Tool Usability';
      case 'content_accuracy': return 'Content Accuracy';
      case 'process_guidance': return 'Process Guidance';
      case 'technical_issues': return 'Technical Issues';
      case 'general': return 'General Feedback';
      default: return category;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (submitted) {
    return (
      <Card>
        <div className="text-center py-8">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <ThumbsUp className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Thank You!</h3>
          <p className="text-gray-600">
            Your feedback has been submitted successfully. We appreciate your input and will use it to improve our RTM tools.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Feedback Form */}
      <Card>
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Share Your Feedback</h3>
            <p className="text-gray-600 mt-1">
              Help us improve the RTM formation tools by sharing your experience
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Overall Rating
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingClick(star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= (hoveredStar || feedback.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-3 text-sm text-gray-600">
                  {getRatingText(hoveredStar || feedback.rating)}
                </span>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feedback Category
              </label>
              <select
                value={feedback.category}
                onChange={(e) => setFeedback(prev => ({ 
                  ...prev, 
                  category: e.target.value as FeedbackData['category']
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="general">General Feedback</option>
                <option value="tool_usability">Tool Usability</option>
                <option value="content_accuracy">Content Accuracy</option>
                <option value="process_guidance">Process Guidance</option>
                <option value="technical_issues">Technical Issues</option>
              </select>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Feedback
              </label>
              <textarea
                value={feedback.message}
                onChange={(e) => setFeedback(prev => ({ ...prev, message: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Please share your thoughts, suggestions, or any issues you encountered..."
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address (optional)
              </label>
              <input
                type="email"
                value={feedback.email}
                onChange={(e) => setFeedback(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="your.email@example.com"
              />
              <p className="text-xs text-gray-500 mt-1">
                Provide your email if you'd like us to follow up on your feedback
              </p>
            </div>

            {/* Contact Permission */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="allowContact"
                checked={feedback.allowContact}
                onChange={(e) => setFeedback(prev => ({ ...prev, allowContact: e.target.checked }))}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="allowContact" className="text-sm text-gray-700">
                I'm happy to be contacted about my feedback for further discussion
              </label>
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              leftIcon={<Send size={16} />}
              className="w-full"
            >
              Submit Feedback
            </Button>
          </form>
        </div>
      </Card>

      {/* Quick Feedback Options */}
      <Card>
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">Quick Feedback</h4>
          <p className="text-gray-600">
            Found something specific? Let us know with a quick response:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="flex items-center justify-center space-x-2 p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition-colors">
              <ThumbsUp className="h-5 w-5 text-green-600" />
              <span className="text-green-800 font-medium">This was helpful</span>
            </button>
            
            <button className="flex items-center justify-center space-x-2 p-4 border-2 border-red-200 rounded-lg hover:bg-red-50 transition-colors">
              <ThumbsDown className="h-5 w-5 text-red-600" />
              <span className="text-red-800 font-medium">This needs improvement</span>
            </button>
            
            <button className="flex items-center justify-center space-x-2 p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              <span className="text-blue-800 font-medium">I have a suggestion</span>
            </button>
            
            <button className="flex items-center justify-center space-x-2 p-4 border-2 border-amber-200 rounded-lg hover:bg-amber-50 transition-colors">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <span className="text-amber-800 font-medium">I found an issue</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Previous Feedback */}
      {previousFeedback.length > 0 && (
        <Card>
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">Your Previous Feedback</h4>
            
            <div className="space-y-3">
              {previousFeedback.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {getCategoryLabel(item.category)}
                        </span>
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= item.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{item.message}</p>
                      <p className="text-xs text-gray-500">
                        Submitted on {new Date(item.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Feedback Guidelines */}
      <Card>
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">Feedback Guidelines</h4>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="font-medium text-blue-900 mb-2">How to provide effective feedback:</h5>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Be specific about which tool or section you're referring to</li>
              <li>• Describe what you expected vs. what actually happened</li>
              <li>• Include suggestions for improvement where possible</li>
              <li>• Let us know about any legal or technical inaccuracies</li>
              <li>• Share your overall experience with the RTM process</li>
            </ul>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h5 className="font-medium text-green-900 mb-2">What happens to your feedback:</h5>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• All feedback is reviewed by our product team</li>
              <li>• Technical issues are prioritised for immediate fixes</li>
              <li>• Feature suggestions are considered for future updates</li>
              <li>• We may contact you for clarification if you've provided your email</li>
              <li>• Your feedback helps improve the experience for all users</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RTMFeedback;
