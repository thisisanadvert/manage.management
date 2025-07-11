import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Shield,
  Users,
  ArrowRight,
  CheckCircle2,
  Building,
  FileText,
  Vote,
  MessageSquare,
  BarChart4,
  Clock,
  Heart,
  Newspaper,
  Scale,
  Home,
  Accessibility,
  Type,
  Eye,
  Zap,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Footer from '../components/layout/Footer';
import RoleSelector from '../components/landing/RoleSelector';
import AccessibilityToolbar from '../components/landing/AccessibilityToolbar';
import EasterEggSystem from '../components/landing/EasterEggSystem';
import Tooltip from '../components/ui/Tooltip';
import ArcadeEmbed from '../components/landing/ArcadeEmbed';
import { testSignupFlow, testDatabasePolicies } from '../utils/testSignup';

const Landing = () => {
  const navigate = useNavigate();

  const runTests = async () => {
    console.log('🚀 Running development tests...');
    await testSignupFlow();
    await testDatabasePolicies();
  };

  const features = [
    {
      title: 'Document Storage',
      description: 'Keep all your building paperwork in one safe place - no more lost documents!',
      tooltip: 'Store leases, insurance papers, maintenance records, and meeting minutes securely online. Everyone can access what they need, when they need it.',
      icon: FileText,
      color: 'bg-blue-100 text-blue-600',
      beginnerFriendly: true
    },
    {
      title: 'Easy Voting',
      description: 'Make decisions together without endless email chains or confusing meetings.',
      tooltip: 'Create simple polls for building decisions like choosing contractors, approving budgets, or scheduling maintenance. Everyone votes online at their convenience.',
      icon: Vote,
      color: 'bg-purple-100 text-purple-600',
      beginnerFriendly: true
    },
    {
      title: 'Stay Connected',
      description: 'Get important updates about your building delivered straight to you.',
      tooltip: 'Receive notifications about maintenance work, building news, and important announcements. No more missed information or wondering what\'s happening.',
      icon: MessageSquare,
      color: 'bg-green-100 text-green-600',
      beginnerFriendly: true
    },
    {
      title: 'Money Matters Made Simple',
      description: 'See exactly where your service charges go - complete transparency.',
      tooltip: 'View detailed breakdowns of building expenses, track service charge payments, and understand your building\'s finances with clear, simple reports.',
      icon: BarChart4,
      color: 'bg-yellow-100 text-yellow-600',
      beginnerFriendly: true
    },
    {
      title: 'Maintenance Made Easy',
      description: 'Report problems and track fixes without the hassle.',
      tooltip: 'Quickly report issues like broken lifts or leaky pipes. Track progress and get updates when work is scheduled or completed.',
      icon: Clock,
      color: 'bg-red-100 text-red-600',
      beginnerFriendly: true
    },
    {
      title: 'Trusted Suppliers',
      description: 'Find reliable contractors and services recommended by other buildings.',
      tooltip: 'Access a network of vetted suppliers for everything from cleaning to major repairs. See reviews and ratings from other building managers.',
      icon: Heart,
      color: 'bg-pink-100 text-pink-600',
      beginnerFriendly: true
    }
  ];

  const newsItems = [
    {
      category: 'Government Consultation',
      date: '4 July 2025',
      title: 'Comprehensive UK Government Consultation on Strengthening Leaseholder Protections',
      description: 'Major consultation on strengthening leaseholder protections over charges and services, running until 26 September 2025. This represents a significant step forward in implementing the Leasehold and Freehold Reform Act 2024.',
      highlighted: true,
      fullContent: `
## Overview

The UK government has launched a major consultation on **strengthening leaseholder protections over charges and services**, running from 4 July 2025 to 26 September 2025. This consultation represents a significant step forward in implementing the Leasehold and Freehold Reform Act 2024 and introduces additional reforms to address the "wild west" of leasehold management.

## Key Transparency Measures

### Annual Reports for Leaseholders

The government proposes mandatory annual reports that landlords must provide within the first month of each service charge period. These reports will include:

- **Key contact details** for managing agents, landlords, fire safety responsible persons, and Principal Accountable Persons
- **Important lease dates** including service charge demands and financial year-end dates
- **Building condition information** including details of previous and planned annual statutory surveys
- **Major works planning** with details of works planned for the next two years and whether costs are covered by reserve funds
- **Administration charge schedules** clearly set out for transparency
- **Formal proceedings information** including any enforcement notices, litigation, or enfranchisement claims

### Standardised Service Charge Demand Forms

To address current inconsistencies where landlords have considerable leeway in presenting service charge demands, the reforms mandate a prescribed format for all service charge demands. The new standardised forms will include:

- **Comprehensive cost breakdown** showing planned expenditure on maintenance, insurance, and management
- **Clear payment details** including amounts, deadlines, and consequences of non-payment
- **Budget information** for the forthcoming year
- **Property and party identification** with clear landlord and leaseholder details

Crucially, any deviation from the prescribed format will render non-payment or late payment provisions in the lease unenforceable.

### Enhanced Information Rights

Leaseholders will gain new rights to request detailed information from landlords or managing agents, including access to contracts, invoices, receipts, and written explanations of decision-making processes behind expenditures. This represents a significant expansion of current limited rights to request cost summaries.

## Major Works Reform

### Section 20 Consultation Process Overhaul

The government is proposing comprehensive reforms to the Section 20 major works consultation process, which has not been updated for over 20 years. Key proposals include:

- **Raising financial thresholds** to avoid capturing relatively minor works that add unnecessary costs and delays
- **Streamlining consultation procedures** to balance leaseholder notification needs with efficient work completion
- **Improving leaseholder engagement** through standardised forms and clearer information about work implications
- **Faster consultation processes** for dynamic markets like energy tariffs where delays could disadvantage leaseholders

### Mandatory Reserve Funds

The consultation proposes making reserve funds mandatory for both new and existing leases. This would include:

- **Professionally certified asset management plans** to underpin reserve fund calculations
- **Periodic review provisions** to ensure funds remain adequate
- **Integration with transparency measures** through inclusion in annual reports and detailed information availability

This aims to prevent the "lottery of timing" where large one-off bills for major works fall on whoever lives in the property at the time.

## Managing Agent Regulation

### Mandatory Professional Qualifications

Following Lord Best's 2019 recommendations, the government proposes introducing mandatory professional qualifications for managing agents in England. Housing Minister Matthew Pennycook described the current situation as "a bit of a wild west," noting that "a group of us could do it just by renting an office on top of a newsagent in the high street".

### Enhanced Leaseholder Powers

The consultation explores giving leaseholders greater powers to:
- **Veto the appointment** of particular managing agents
- **Demand replacement** of existing managing agents they are dissatisfied with
- **Apply for tribunal-appointed managers** through improved Section 24 processes

## Litigation Costs Reform

### Rebalancing the Costs Regime

The reforms fundamentally change how litigation costs are handled by:

- **Removing automatic cost recovery** for landlords, even when lease terms specify otherwise
- **Requiring tribunal approval** for landlords seeking to recover litigation costs from leaseholders
- **Granting leaseholders rights** to claim their litigation costs from landlords when successful
- **Exempting certain cases** such as undefended matters to avoid unnecessary delays

This removes a significant deterrent that previously prevented leaseholders from challenging unreasonable charges.

### Special Provisions for Resident-Led Buildings

The consultation recognises that Resident Management Companies and Right-to-Manage Companies may need different arrangements, proposing to suspend certain requirements until these organisations can draw upon service charge funds to bring cases.

## Fixed Service Charge Protections

Currently, leaseholders paying fixed service charges have fewer rights than those paying variable charges. The reforms propose extending equal protection to both groups, including:

- **Rights to challenge reasonableness** of fixed service charges
- **Enhanced transparency measures** through annual reports and standardised demands
- **Tribunal access** for disputes over service quality or charge appropriateness

## Digital Services and Modernisation

The consultation explores facilitating greater use of digital communication for providing information to leaseholders while ensuring those who need or prefer hard copies are not disadvantaged. This includes exploring how current largely paper-based systems can benefit from improved IT and electronic communications.

## Insurance Transparency

Building on Financial Conduct Authority rules, the reforms propose:

- **Mandatory disclosure** of insurance information without leaseholder requests
- **Commission structure transparency** including conflicts of interest declarations
- **Limited recoverable costs** restricted to actual premiums and genuine claims handling services

## Implementation Timeline

While the Leasehold and Freehold Reform Act 2024 became law on 24 May 2024, most provisions require secondary legislation before taking effect. The government has committed to implementing reforms "as quickly as possible" while ensuring they are "watertight".

The consultation represents a crucial step in this process, with responses due by 26 September 2025. Implementation is expected to require extensive secondary legislation and careful consideration of transitional arrangements.

## Significance for the Property Management Sector

This consultation marks a watershed moment for UK leasehold management, addressing longstanding issues of transparency, fairness, and accountability. For platforms like Manage.Management, these reforms present opportunities to support RTM directors, RMC directors, and leaseholders in navigating the new regulatory landscape through digital tools that facilitate compliance with enhanced transparency requirements and improved community governance.

The reforms' emphasis on standardisation, digital communication, and leaseholder empowerment aligns closely with modern property management platforms' capabilities to deliver transparent, community-led building management that the consultation seeks to encourage.
      `
    },
    {
      category: 'Feature Update',
      date: 'May 3, 2025',
      title: 'New Financial Dashboard',
      description: 'We\'ve launched an improved financial dashboard with enhanced reporting capabilities and real-time tracking of service charges.'
    },
    {
      category: 'Community',
      date: 'May 1, 2025',
      title: 'RTM Success Stories',
      description: 'Read how buildings across the UK are successfully managing their properties with our platform.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Skip to Content Link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Accessibility Toolbar */}
      <AccessibilityToolbar />

      {/* Easter Egg System */}
      <EasterEggSystem />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[1000] bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <a
                href="https://app.manage.management"
                data-logo
                className="text-lg font-bold text-primary-800 pixel-font hover:text-primary-600 transition-colors cursor-pointer"
                title="Click me 3 times for a surprise! 🎉"
              >
                Manage.Management
              </a>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/qualify')}
              >
                Do I Qualify?
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/signup')}
              >
                Get Started
              </Button>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden">
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/signup')}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main id="main-content" className="relative overflow-hidden pt-20 sm:pt-24 lg:pt-32 pb-12 sm:pb-16">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-accent-500/10 to-secondary-500/10" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-4">
              <Badge variant="primary" className="animate-pulse">
                🏠 Take real ownership of your home by taking over management of your building
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Managing Your Building{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">
                Made Simple
              </span>
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Whether you're a first-time homeowner or experienced property manager, our platform makes building management straightforward and stress-free.
            </p>
            <div className="mt-4 flex justify-center">
              <Tooltip
                content="Don't worry if these terms are new to you! RTM means 'Right to Manage' - it's when residents take control of managing their building. RMC means 'Resident Management Company' - it's when residents own the freehold and manage the building themselves. Click to learn more about qualifying!"
                glassmorphism={true}
                showCloseButton={true}
                position="bottom"
              >
                <button
                  onClick={() => navigate('/qualify')}
                  className="text-sm text-gray-500 flex items-center space-x-1 hover:text-primary-600 transition-colors cursor-pointer"
                  aria-label="Learn more about RTM and RMC - click to check if you qualify"
                >
                  <span>Perfect for RTM directors, RMC directors, and homeowners</span>
                  <HelpCircle size={14} className="text-gray-400 hover:text-primary-600 transition-colors" />
                </button>
              </Tooltip>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4 px-4">
              <Button
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight size={16} />}
                onClick={() => navigate('/signup')}
                className="w-full sm:w-auto transform hover:scale-105 transition-transform"
                aria-label="Start your free account - no credit card required"
              >
                🚀 Start Free Today
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/qualify')}
                className="w-full sm:w-auto"
                aria-label="Check if your building qualifies for RTM"
              >
                🏠 Do I Qualify?
              </Button>

              {import.meta.env.DEV && (
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={runTests}
                  className="w-full sm:w-auto"
                >
                  🧪 Run Tests
                </Button>
              )}
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <CheckCircle2 size={16} className="text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle2 size={16} className="text-green-500" />
                <span>Free 30-day trial</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle2 size={16} className="text-green-500" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>

          {/* Interactive Demo Section */}
          <div className="mt-16 sm:mt-20 lg:mt-24">
            <ArcadeEmbed />
          </div>

          {/* Features Grid */}
          <div className="mt-16 sm:mt-20 lg:mt-24">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 px-4">
                Everything you need to manage your building
              </h2>
              <p className="text-lg text-gray-600 px-4 max-w-2xl mx-auto">
                Don't worry if you're new to this - we've designed everything to be simple and intuitive
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-105 group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon size={24} />
                      </div>
                      <Tooltip
                        content={feature.tooltip}
                        glassmorphism={true}
                        showCloseButton={true}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <HelpCircle size={16} className="text-gray-400 hover:text-gray-600" />
                      </Tooltip>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                    {feature.beginnerFriendly && (
                      <div className="mt-3">
                        <Badge variant="secondary" className="text-xs">
                          ✨ Beginner Friendly
                        </Badge>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Latest Updates Section */}
          <div className="mt-16 sm:mt-20 lg:mt-24">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 px-4">Latest Updates</h2>
              <p className="mt-4 text-base sm:text-lg text-gray-600 px-4">Stay informed about the latest changes in property management</p>
            </div>

            {/* Highlighted Key Piece */}
            {newsItems.find(item => item.highlighted) && (
              <div className="mb-12">
                <Card className="border-2 border-primary-200 bg-gradient-to-r from-primary-50 to-blue-50">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Badge variant="primary" className="bg-primary-600 text-white">
                          🏛️ Key Update
                        </Badge>
                        <Badge variant="secondary">
                          {newsItems.find(item => item.highlighted)?.category}
                        </Badge>
                      </div>
                      <span className="text-sm text-gray-500">
                        {newsItems.find(item => item.highlighted)?.date}
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                      {newsItems.find(item => item.highlighted)?.title}
                    </h3>
                    <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                      {newsItems.find(item => item.highlighted)?.description}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        variant="primary"
                        rightIcon={<ArrowRight size={16} />}
                        onClick={() => navigate('/blog/government-consultation-leaseholder-protections')}
                      >
                        Read Full Article
                      </Button>
                      <Button
                        variant="outline"
                        rightIcon={<Newspaper size={16} />}
                        onClick={() => window.open('https://www.gov.uk/government/consultations/strengthening-leaseholder-protections-over-charges-and-services-consultation', '_blank')}
                      >
                        View Official Consultation
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Regular Updates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {newsItems.filter(item => !item.highlighted).map((item, index) => (
                <Card key={index} hoverable className="h-full">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="primary">{item.category}</Badge>
                      <span className="text-sm text-gray-500">{item.date}</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600 flex-grow">{item.description}</p>
                    <Button
                      variant="ghost"
                      className="mt-4"
                      rightIcon={<ArrowRight size={16} />}
                      onClick={() => navigate('/help')}
                    >
                      Learn More
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Role-based Features Section */}
      <RoleSelector />

      <Footer />
    </div>
  );
};

export default Landing;