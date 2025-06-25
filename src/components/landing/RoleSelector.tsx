import React, { useState } from 'react';
import { Building, Users, Scale, Home, ChevronLeft, ChevronRight, Briefcase, Crown } from 'lucide-react';
import Card from '../ui/Card';

interface Role {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  icon: React.ReactNode;
  features: {
    title: string;
    description: string;
    icon: React.ReactNode;
  }[];
}

const roles: Role[] = [
  {
    id: 'director',
    title: 'RTM/RMC Director',
    description: 'Take control of your building management with confidence',
    icon: <Crown className="h-6 w-6" />,
    features: [
      {
        title: 'Board Management',
        description: 'Organise meetings, track decisions, and manage director responsibilities',
        icon: <Users className="h-5 w-5" />
      },
      {
        title: 'Financial Oversight',
        description: 'Monitor budgets, service charges, and reserve funds with transparency',
        icon: <Scale className="h-5 w-5" />
      },
      {
        title: 'Compliance & Legal',
        description: 'Stay on top of legal requirements, certifications, and deadlines',
        icon: <Building className="h-5 w-5" />
      }
    ]
  },
  {
    id: 'homeowner',
    title: 'Homeowner',
    subtitle: 'Leaseholders and Share of Freeholders',
    description: 'Stay connected and participate in your building community',
    icon: <Home className="h-6 w-6" />,
    features: [
      {
        title: 'Issue Reporting',
        description: 'Report maintenance issues and track their resolution progress',
        icon: <Building className="h-5 w-5" />
      },
      {
        title: 'Community Participation',
        description: 'Receive announcements, vote on decisions, and stay informed',
        icon: <Users className="h-5 w-5" />
      },
      {
        title: 'Service Charge Transparency',
        description: 'View detailed breakdowns of charges and building expenses',
        icon: <Scale className="h-5 w-5" />
      }
    ]
  },
  {
    id: 'management-company',
    title: 'Block Freeholders/Management Companies',
    description: 'Professional building management with transparency and efficiency',
    icon: <Briefcase className="h-6 w-6" />,
    features: [
      {
        title: 'Multi-Property Management',
        description: 'Manage multiple buildings and portfolios from one central platform',
        icon: <Building className="h-5 w-5" />
      },
      {
        title: 'Resident Communication',
        description: 'Keep residents informed with automated updates and announcements',
        icon: <Users className="h-5 w-5" />
      },
      {
        title: 'Financial Reporting',
        description: 'Generate detailed reports and maintain transparent financial records',
        icon: <Scale className="h-5 w-5" />
      }
    ]
  }
];

const RoleSelector: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState(0);

  const nextRole = () => {
    setSelectedRole((prev) => (prev + 1) % roles.length);
  };

  const prevRole = () => {
    setSelectedRole((prev) => (prev - 1 + roles.length) % roles.length);
  };

  const currentRole = roles[selectedRole];

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 px-4">
            Built for Your Role
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Whether you're managing a building or living in one, we have the tools you need
          </p>
        </div>

        {/* Role Selector */}
        <div className="flex justify-center mb-8">
          {/* Desktop Role Selector */}
          <div className="hidden sm:flex items-center space-x-2 lg:space-x-4 bg-white rounded-lg p-2 shadow-sm">
            {roles.map((role, index) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(index)}
                className={`flex items-center space-x-2 px-3 lg:px-4 py-2 rounded-md transition-colors text-sm lg:text-base ${
                  selectedRole === index
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {role.icon}
                <div className="text-left">
                  <span className="font-medium block">{role.title}</span>
                  {role.subtitle && (
                    <span className={`text-xs block ${
                      selectedRole === index ? 'text-white/80' : 'text-gray-500'
                    }`}>
                      {role.subtitle}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Mobile Role Selector */}
          <div className="sm:hidden w-full max-w-sm">
            <div className="bg-white rounded-lg p-2 shadow-sm">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-md border-0 bg-transparent text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {roles.map((role, index) => (
                  <option key={role.id} value={index}>
                    {role.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Role Content */}
        <div className="relative">
          <div className="text-center mb-6 sm:mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 px-4">
              {currentRole.title}
            </h3>
            {currentRole.subtitle && (
              <p className="text-sm sm:text-base text-gray-500 mb-2 px-4">
                {currentRole.subtitle}
              </p>
            )}
            <p className="text-base sm:text-lg text-gray-600 px-4">
              {currentRole.description}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {currentRole.features.map((feature, index) => (
              <Card key={index} className="p-4 sm:p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-primary-100 rounded-lg text-primary-600">
                    {feature.icon}
                  </div>
                </div>
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h4>
                <p className="text-sm sm:text-base text-gray-600">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>

          {/* Navigation Arrows - Hidden on mobile, visible on desktop */}
          <div className="hidden sm:flex justify-between items-center mt-8">
            <button
              onClick={prevRole}
              className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow text-gray-600 hover:text-primary-600"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <div className="flex space-x-2">
              {roles.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedRole(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    selectedRole === index ? 'bg-primary-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextRole}
              className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow text-gray-600 hover:text-primary-600"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* Mobile Navigation Dots */}
          <div className="sm:hidden flex justify-center space-x-2 mt-6">
            {roles.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedRole(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  selectedRole === index ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;
