import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Calendar, User, Tag, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const Blog = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const blogPosts = [
    {
      id: 'government-consultation-leaseholder-protections',
      title: 'Comprehensive UK Government Consultation on Strengthening Leaseholder Protections',
      excerpt: 'Major consultation on strengthening leaseholder protections over charges and services, running until 26 September 2025. This represents a significant step forward in implementing the Leasehold and Freehold Reform Act 2024.',
      author: 'Policy Analysis Team',
      date: '4 July 2025',
      category: 'Government Policy',
      readTime: '15 min read',
      featured: true,
      fullContent: `
## Overview

The UK government has launched a major consultation on strengthening leaseholder protections over charges and services, running from 4 July 2025 to 26 September 2025. This consultation represents a significant step forward in implementing the Leasehold and Freehold Reform Act 2024 and introduces additional reforms to address the "wild west" of leasehold management.

## Key Transparency Measures

### Annual Reports for Leaseholders

The government proposes mandatory annual reports that landlords must provide within the first month of each service charge period. These reports will include:

• Key contact details for managing agents, landlords, fire safety responsible persons, and Principal Accountable Persons
• Important lease dates including service charge demands and financial year-end dates
• Building condition information including details of previous and planned annual statutory surveys
• Major works planning with details of works planned for the next two years and whether costs are covered by reserve funds
• Administration charge schedules clearly set out for transparency
• Formal proceedings information including any enforcement notices, litigation, or enfranchisement claims

### Standardised Service Charge Demand Forms

To address current inconsistencies where landlords have considerable leeway in presenting service charge demands, the reforms mandate a prescribed format for all service charge demands. The new standardised forms will include:

• Comprehensive cost breakdown showing planned expenditure on maintenance, insurance, and management
• Clear payment details including amounts, deadlines, and consequences of non-payment
• Budget information for the forthcoming year
• Property and party identification with clear landlord and leaseholder details

Crucially, any deviation from the prescribed format will render non-payment or late payment provisions in the lease unenforceable.

### Enhanced Information Rights

Leaseholders will gain new rights to request detailed information from landlords or managing agents, including access to contracts, invoices, receipts, and written explanations of decision-making processes behind expenditures. This represents a significant expansion of current limited rights to request cost summaries.

## Major Works Reform

### Section 20 Consultation Process Overhaul

The government is proposing comprehensive reforms to the Section 20 major works consultation process, which has not been updated for over 20 years. Key proposals include:

• Raising financial thresholds to avoid capturing relatively minor works that add unnecessary costs and delays
• Streamlining consultation procedures to balance leaseholder notification needs with efficient work completion
• Improving leaseholder engagement through standardised forms and clearer information about work implications
• Faster consultation processes for dynamic markets like energy tariffs where delays could disadvantage leaseholders

### Mandatory Reserve Funds

The consultation proposes making reserve funds mandatory for both new and existing leases. This would include:

• Professionally certified asset management plans to underpin reserve fund calculations
• Periodic review provisions to ensure funds remain adequate
• Integration with transparency measures through inclusion in annual reports and detailed information availability

This aims to prevent the "lottery of timing" where large one-off bills for major works fall on whoever lives in the property at the time.

## Managing Agent Regulation

### Mandatory Professional Qualifications

Following Lord Best's 2019 recommendations, the government proposes introducing mandatory professional qualifications for managing agents in England. Housing Minister Matthew Pennycook described the current situation as "a bit of a wild west," noting that "a group of us could do it just by renting an office on top of a newsagent in the high street".

### Enhanced Leaseholder Powers

The consultation explores giving leaseholders greater powers to:
• Veto the appointment of particular managing agents
• Demand replacement of existing managing agents they are dissatisfied with
• Apply for tribunal-appointed managers through improved Section 24 processes

## Litigation Costs Reform

### Rebalancing the Costs Regime

The reforms fundamentally change how litigation costs are handled by:

• Removing automatic cost recovery for landlords, even when lease terms specify otherwise
• Requiring tribunal approval for landlords seeking to recover litigation costs from leaseholders
• Granting leaseholders rights to claim their litigation costs from landlords when successful
• Exempting certain cases such as undefended matters to avoid unnecessary delays

This removes a significant deterrent that previously prevented leaseholders from challenging unreasonable charges.

### Special Provisions for Resident-Led Buildings

The consultation recognises that Resident Management Companies and Right-to-Manage Companies may need different arrangements, proposing to suspend certain requirements until these organisations can draw upon service charge funds to bring cases.

## Fixed Service Charge Protections

Currently, leaseholders paying fixed service charges have fewer rights than those paying variable charges. The reforms propose extending equal protection to both groups, including:

• Rights to challenge reasonableness of fixed service charges
• Enhanced transparency measures through annual reports and standardised demands
• Tribunal access for disputes over service quality or charge appropriateness

## Digital Services and Modernisation

The consultation explores facilitating greater use of digital communication for providing information to leaseholders while ensuring those who need or prefer hard copies are not disadvantaged. This includes exploring how current largely paper-based systems can benefit from improved IT and electronic communications.

## Insurance Transparency

Building on Financial Conduct Authority rules, the reforms propose:

• Mandatory disclosure of insurance information without leaseholder requests
• Commission structure transparency including conflicts of interest declarations
• Limited recoverable costs restricted to actual premiums and genuine claims handling services

## Implementation Timeline

While the Leasehold and Freehold Reform Act 2024 became law on 24 May 2024, most provisions require secondary legislation before taking effect. The government has committed to implementing reforms "as quickly as possible" while ensuring they are "watertight".

The consultation represents a crucial step in this process, with responses due by 26 September 2025. Implementation is expected to require extensive secondary legislation and careful consideration of transitional arrangements.

## Significance for the Property Management Sector

This consultation marks a watershed moment for UK leasehold management, addressing longstanding issues of transparency, fairness, and accountability. For platforms like Manage.Management, these reforms present opportunities to support RTM directors, RMC directors, and leaseholders in navigating the new regulatory landscape through digital tools that facilitate compliance with enhanced transparency requirements and improved community governance.

The reforms' emphasis on standardisation, digital communication, and leaseholder empowerment aligns closely with modern property management platforms' capabilities to deliver transparent, community-led building management that the consultation seeks to encourage.
      `
    },
    {
      id: 2,
      title: 'Understanding Your Rights as a Leaseholder',
      excerpt: 'A comprehensive guide to leaseholder rights and responsibilities in the UK.',
      author: 'Legal Team',
      date: '2024-01-15',
      category: 'Legal',
      readTime: '5 min read',
      featured: false
    },
    {
      id: 3,
      title: 'RTM Process: A Step-by-Step Guide',
      excerpt: 'Everything you need to know about the Right to Manage process.',
      author: 'Property Expert',
      date: '2024-01-10',
      category: 'RTM',
      readTime: '8 min read',
      featured: false
    },
    {
      id: 4,
      title: 'Managing Building Finances Effectively',
      excerpt: 'Tips and best practices for transparent financial management.',
      author: 'Finance Team',
      date: '2024-01-05',
      category: 'Finance',
      readTime: '6 min read',
      featured: false
    }
  ];

  const categories = ['All', 'Government Policy', 'Legal', 'RTM', 'Finance', 'Maintenance', 'Community'];

  // If viewing individual post
  if (postId) {
    const post = blogPosts.find(p => p.id === postId);
    if (!post) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
            <Button onClick={() => navigate('/blog')}>
              <ArrowLeft size={16} className="mr-2" />
              Back to Blog
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/blog')}
              className="mb-6"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Blog
            </Button>

            <div className="flex items-center space-x-2 mb-4">
              <Badge variant="primary">{post.category}</Badge>
              <span className="text-sm text-gray-500">{post.readTime}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>

            <div className="flex items-center text-sm text-gray-500 mb-6">
              <User size={16} className="mr-2" />
              <span className="mr-4">{post.author}</span>
              <Calendar size={16} className="mr-2" />
              <span>{post.date}</span>
            </div>

            <p className="text-xl text-gray-600 leading-relaxed">
              {post.excerpt}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="prose prose-lg max-w-none">
              {post.fullContent ? (
                <div
                  className="space-y-6"
                  dangerouslySetInnerHTML={{
                    __html: post.fullContent
                      .split('\n\n')
                      .map(paragraph => {
                        if (paragraph.startsWith('## ')) {
                          return `<h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4">${paragraph.replace('## ', '')}</h2>`;
                        } else if (paragraph.startsWith('### ')) {
                          return `<h3 class="text-xl font-semibold text-gray-900 mt-6 mb-3">${paragraph.replace('### ', '')}</h3>`;
                        } else if (paragraph.startsWith('- **')) {
                          return `<ul class="list-disc pl-6 space-y-2"><li class="text-gray-700">${paragraph.replace('- ', '')}</li></ul>`;
                        } else if (paragraph.trim()) {
                          return `<p class="text-gray-700 leading-relaxed">${paragraph}</p>`;
                        }
                        return '';
                      })
                      .join('')
                  }}
                />
              ) : (
                <p className="text-gray-600">Full content coming soon...</p>
              )}
            </div>
          </div>

          {/* Related Posts */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {blogPosts
                .filter(p => p.id !== postId && p.category === post.category)
                .slice(0, 2)
                .map((relatedPost) => (
                  <Card key={relatedPost.id} hoverable>
                    <div className="p-6">
                      <Badge variant="primary" className="mb-3">{relatedPost.category}</Badge>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {relatedPost.title}
                      </h4>
                      <p className="text-gray-600 mb-4">{relatedPost.excerpt}</p>
                      <Button
                        variant="ghost"
                        onClick={() => navigate(`/blog/${relatedPost.id}`)}
                      >
                        Read More
                        <ArrowRight size={16} className="ml-2" />
                      </Button>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/blog/${blogPosts.find(post => post.featured)?.id}`)}
                  >
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
                
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => navigate(`/blog/${post.id}`)}
                >
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
