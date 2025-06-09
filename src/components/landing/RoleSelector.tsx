import React, { useState } from 'react';
import { Building, Users, Scale, Home, ChevronLeft, ChevronRight } from 'lucide-react';
import Card from '../ui/Card';

interface Role {
  id: string;
  title: string;
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
    id: 'rtm-director',
    title: 'RTM Director',
    description: 'Managing your Right to Manage company with confidence',
    icon: <Building className="h-6 w-6" />,
    features: [
      {
        title: 'Board Management',
        description: 'Organize meetings, track decisions, and manage director responsibilities',
        icon: <Users className="h-5 w-5" />
      },
      {
        title: 'Financial Oversight',
        description: 'Monitor budgets, service charges, and reserve funds with transparency',
        icon: <Scale className="h-5 w-5" />
      },
      {
        title: 'Compliance Tracking',
        description: 'Stay on top of legal requirements, certifications, and deadlines',
        icon: <Building className="h-5 w-5" />
      }
    ]
  },
  {
    id: 'sof-director',
    title: 'Share of Freehold Director',
    description: 'Collaborative ownership management made simple',
    icon: <Scale className="h-6 w-6" />,
    features: [
      {
        title: 'Shareholder Communication',
        description: 'Keep all shareholders informed with announcements and voting systems',
        icon: <Users className="h-5 w-5" />
      },
      {
        title: 'Property Maintenance',
        description: 'Coordinate repairs, improvements, and ongoing maintenance efficiently',
        icon: <Building className="h-5 w-5" />
      },
      {
        title: 'Cost Sharing',
        description: 'Transparent expense tracking and fair cost allocation among shareholders',
        icon: <Scale className="h-5 w-5" />
      }
    ]
  },
  {
    id: 'homeowner',
    title: 'Homeowner',
    description: 'Stay connected and informed about your building',
    icon: <Home className="h-6 w-6" />,
    features: [
      {
        title: 'Issue Reporting',
        description: 'Report maintenance issues and track their resolution progress',
        icon: <Building className="h-5 w-5" />
      },
      {
        title: 'Community Updates',
        description: 'Receive important announcements and participate in building decisions',
        icon: <Users className="h-5 w-5" />
      },
      {
        title: 'Service Charge Transparency',
        description: 'View detailed breakdowns of charges and building expenses',
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
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Built for Your Role
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Whether you're managing a building or living in one, we have the tools you need
          </p>
        </div>

        {/* Role Selector */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4 bg-white rounded-lg p-2 shadow-sm">
            {roles.map((role, index) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(index)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  selectedRole === index
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {role.icon}
                <span className="font-medium">{role.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Role Content */}
        <div className="relative">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {currentRole.title}
            </h3>
            <p className="text-lg text-gray-600">
              {currentRole.description}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {currentRole.features.map((feature, index) => (
              <Card key={index} className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-primary-100 rounded-lg text-primary-600">
                    {feature.icon}
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h4>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>

          {/* Navigation Arrows */}
          <div className="flex justify-between items-center mt-8">
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
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;
