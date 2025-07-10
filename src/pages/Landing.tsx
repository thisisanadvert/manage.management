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
    },
    {
      category: 'Compliance',
      date: 'April 28, 2025',
      title: 'Updated Safety Guidelines',
      description: 'Stay compliant with the latest building safety regulations and management requirements.'
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {newsItems.map((item, index) => (
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