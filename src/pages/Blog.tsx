import React from 'react';
import { ArrowRight, Calendar, User, Tag } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      title: 'Understanding Your Rights as a Leaseholder',
      excerpt: 'A comprehensive guide to leaseholder rights and responsibilities in the UK.',
      author: 'Legal Team',
      date: '2024-01-15',
      category: 'Legal',
      readTime: '5 min read',
      featured: true
    },
    {
      id: 2,
      title: 'RTM Process: A Step-by-Step Guide',
      excerpt: 'Everything you need to know about the Right to Manage process.',
      author: 'Property Expert',
      date: '2024-01-10',
      category: 'RTM',
      readTime: '8 min read',
      featured: false
    },
    {
      id: 3,
      title: 'Managing Building Finances Effectively',
      excerpt: 'Tips and best practices for transparent financial management.',
      author: 'Finance Team',
      date: '2024-01-05',
      category: 'Finance',
      readTime: '6 min read',
      featured: false
    }
  ];

  const categories = ['All', 'Legal', 'RTM', 'Finance', 'Maintenance', 'Community'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Property Management Blog
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Expert insights, guides, and updates to help you manage your building effectively
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <Button
              key={category}
              variant={category === 'All' ? 'primary' : 'outline'}
              size="sm"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Featured Post */}
        {blogPosts.find(post => post.featured) && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Article</h2>
            <Card className="overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/3 bg-gradient-to-br from-primary-500 to-primary-600 p-8 text-white">
                  <Badge variant="secondary" className="mb-4">
                    Featured
                  </Badge>
                  <h3 className="text-2xl font-bold mb-4">
                    {blogPosts.find(post => post.featured)?.title}
                  </h3>
                  <p className="text-primary-100 mb-6">
                    {blogPosts.find(post => post.featured)?.excerpt}
                  </p>
                  <Button variant="secondary">
                    Read Article
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </div>
                <div className="md:w-2/3 p-8">
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <User size={16} className="mr-2" />
                    <span className="mr-4">{blogPosts.find(post => post.featured)?.author}</span>
                    <Calendar size={16} className="mr-2" />
                    <span className="mr-4">{blogPosts.find(post => post.featured)?.date}</span>
                    <span>{blogPosts.find(post => post.featured)?.readTime}</span>
                  </div>
                  <div className="prose max-w-none">
                    <p className="text-gray-600 leading-relaxed">
                      This comprehensive guide covers everything you need to know about your rights as a leaseholder, 
                      including service charges, major works, and how to challenge unreasonable costs. Understanding 
                      these rights is crucial for effective building management and protecting your investment.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.filter(post => !post.featured).map((post) => (
            <Card key={post.id} hoverable className="h-full">
              <div className="p-6 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="primary">{post.category}</Badge>
                  <span className="text-sm text-gray-500">{post.readTime}</span>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {post.title}
                </h3>
                
                <p className="text-gray-600 mb-4 flex-grow">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <User size={14} className="mr-1" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar size={14} className="mr-1" />
                    <span>{post.date}</span>
                  </div>
                </div>
                
                <Button variant="ghost" className="w-full">
                  Read More
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Coming Soon Message */}
        <div className="text-center mt-16 p-8 bg-white rounded-lg border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            More Articles Coming Soon!
          </h3>
          <p className="text-gray-600 mb-6">
            We're working on more helpful guides and insights for property management. 
            Check back regularly for new content.
          </p>
          <Button variant="outline">
            Subscribe for Updates
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Blog;
