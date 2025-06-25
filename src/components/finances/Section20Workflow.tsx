import React, { useState } from 'react';
import { Users, FileText, Calendar, CheckCircle2, AlertTriangle, Clock, Send, Download, Eye } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import LegalGuidanceTooltip from '../legal/LegalGuidanceTooltip';
import LegalTemplateGenerator from '../legal/LegalTemplateGenerator';
import { getTemplateById } from '../../data/legalTemplates';

interface Section20ConsultationProps {
  onClose?: () => void;
}

type ConsultationStage = 'planning' | 'notice-intention' | 'estimates' | 'notice-proposal' | 'completion';

interface ConsultationData {
  worksDescription: string;
  estimatedCost: number;
  leaseholderCount: number;
  costPerLeaseholder: number;
  stage: ConsultationStage;
  noticeIntentionDate?: Date;
  noticeProposalDate?: Date;
  completionDate?: Date;
}

const Section20Workflow: React.FC<Section20ConsultationProps> = ({ onClose }) => {
  const [currentStage, setCurrentStage] = useState<ConsultationStage>('planning');
  const [consultationData, setConsultationData] = useState<ConsultationData>({
    worksDescription: '',
    estimatedCost: 0,
    leaseholderCount: 0,
    costPerLeaseholder: 0,
    stage: 'planning'
  });
  const [showTemplateGenerator, setShowTemplateGenerator] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const stages = [
    {
      id: 'planning' as ConsultationStage,
      title: 'Planning & Assessment',
      description: 'Define works and assess consultation requirements',
      icon: <FileText className="h-5 w-5" />,
      duration: '1-2 weeks'
    },
    {
      id: 'notice-intention' as ConsultationStage,
      title: 'Notice of Intention',
      description: 'First stage consultation notice (30 days)',
      icon: <Send className="h-5 w-5" />,
      duration: '30 days'
    },
    {
      id: 'estimates' as ConsultationStage,
      title: 'Obtain Estimates',
      description: 'Gather contractor estimates and proposals',
      icon: <FileText className="h-5 w-5" />,
      duration: '2-4 weeks'
    },
    {
      id: 'notice-proposal' as ConsultationStage,
      title: 'Notice of Proposal',
      description: 'Second stage consultation with estimates (30 days)',
      icon: <Send className="h-5 w-5" />,
      duration: '30 days'
    },
    {
      id: 'completion' as ConsultationStage,
      title: 'Completion',
      description: 'Finalise contractor and commence works',
      icon: <CheckCircle2 className="h-5 w-5" />,
      duration: '1-2 weeks'
    }
  ];

  const getStageStatus = (stageId: ConsultationStage) => {
    const stageIndex = stages.findIndex(s => s.id === stageId);
    const currentIndex = stages.findIndex(s => s.id === currentStage);
    
    if (stageIndex < currentIndex) return 'completed';
    if (stageIndex === currentIndex) return 'active';
    return 'pending';
  };

  const handleStageChange = (newStage: ConsultationStage) => {
    setCurrentStage(newStage);
    setConsultationData(prev => ({ ...prev, stage: newStage }));
  };

  const handleGenerateTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    setShowTemplateGenerator(true);
  };

  const renderPlanningStage = () => (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-gray-900">Planning & Assessment</h3>
          <LegalGuidanceTooltip
            title="Section 20 Planning Requirements"
            guidance={{
              basic: "Before starting consultation, assess if works exceed £250 per leaseholder. If so, Section 20 consultation is mandatory under LTA 1985.",
              intermediate: "Calculate total costs, identify all qualifying leaseholders, prepare detailed works specifications, and ensure proper consultation procedures are followed.",
              advanced: "Comply with Service Charges (Consultation Requirements) (England) Regulations 2003, consider dispensation applications if appropriate, and ensure proper notice procedures."
            }}
            framework="LTA_1985"
            mandatory={true}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description of Works
            </label>
            <textarea
              value={consultationData.worksDescription}
              onChange={(e) => setConsultationData(prev => ({ ...prev, worksDescription: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              rows={4}
              placeholder="Describe the proposed works in detail..."
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Total Cost (£)
              </label>
              <input
                type="number"
                value={consultationData.estimatedCost}
                onChange={(e) => {
                  const cost = parseFloat(e.target.value) || 0;
                  const costPerLeaseholder = consultationData.leaseholderCount > 0 ? cost / consultationData.leaseholderCount : 0;
                  setConsultationData(prev => ({ 
                    ...prev, 
                    estimatedCost: cost,
                    costPerLeaseholder 
                  }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Leaseholders
              </label>
              <input
                type="number"
                value={consultationData.leaseholderCount}
                onChange={(e) => {
                  const count = parseInt(e.target.value) || 0;
                  const costPerLeaseholder = count > 0 ? consultationData.estimatedCost / count : 0;
                  setConsultationData(prev => ({ 
                    ...prev, 
                    leaseholderCount: count,
                    costPerLeaseholder 
                  }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cost per Leaseholder
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">£</span>
                <input
                  type="number"
                  value={consultationData.costPerLeaseholder.toFixed(2)}
                  readOnly
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              {consultationData.costPerLeaseholder > 250 && (
                <p className="text-sm text-red-600 mt-1">
                  ⚠️ Section 20 consultation required (exceeds £250 per leaseholder)
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={() => handleStageChange('notice-intention')}
            disabled={!consultationData.worksDescription || consultationData.costPerLeaseholder <= 250}
          >
            Start Consultation Process
          </Button>
        </div>
      </div>
    </Card>
  );

  const renderNoticeIntentionStage = () => (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-gray-900">Notice of Intention</h3>
          <LegalGuidanceTooltip
            title="Notice of Intention Requirements"
            guidance={{
              basic: "The first stage of Section 20 consultation requires serving a Notice of Intention on all leaseholders, giving them 30 days to make observations.",
              intermediate: "Notice must include works description, estimated costs, and invitation for leaseholder observations and contractor nominations within 30 days.",
              advanced: "Comply with Service Charges (Consultation Requirements) (England) Regulations 2003 Schedule 1, ensuring proper service methods and content requirements."
            }}
            framework="LTA_1985"
            mandatory={true}
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Stage 1: Notice of Intention</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Serve notice on all leaseholders</li>
            <li>• 30-day observation period</li>
            <li>• Allow contractor nominations</li>
            <li>• Consider all responses received</li>
          </ul>
        </div>

        <div className="space-y-4">
          <Button
            variant="primary"
            leftIcon={<FileText className="h-4 w-4" />}
            onClick={() => handleGenerateTemplate('section-20-notice-intention')}
          >
            Generate Notice of Intention
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <h4 className="font-medium text-gray-900 mb-2">Checklist</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Notice generated and reviewed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>All leaseholders identified</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Notice served on all leaseholders</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>30-day period commenced</span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h4 className="font-medium text-gray-900 mb-2">Timeline</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Notice served:</span>
                  <span className="font-medium">Today</span>
                </div>
                <div className="flex justify-between">
                  <span>Responses due:</span>
                  <span className="font-medium">
                    {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Next stage:</span>
                  <span className="font-medium">Obtain Estimates</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => handleStageChange('planning')}>
            Back to Planning
          </Button>
          <Button variant="primary" onClick={() => handleStageChange('estimates')}>
            Proceed to Estimates
          </Button>
        </div>
      </div>
    </Card>
  );

  if (showTemplateGenerator && selectedTemplate) {
    const template = getTemplateById(selectedTemplate);
    if (template) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Generate Legal Document</h2>
            <Button variant="outline" onClick={() => setShowTemplateGenerator(false)}>
              Back to Workflow
            </Button>
          </div>
          <LegalTemplateGenerator
            template={template}
            onGenerate={(content, variables) => {
              console.log('Generated:', { content, variables });
              setShowTemplateGenerator(false);
            }}
          />
        </div>
      );
    }
  }

  return (
    <div className="space-y-6">
      {/* Workflow Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Section 20 Consultation Workflow</h2>
          <p className="text-gray-600 mt-1">
            Follow the legal process for major works consultation under LTA 1985
          </p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close Workflow
          </Button>
        )}
      </div>

      {/* Progress Timeline */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          {stages.map((stage, index) => (
            <div key={stage.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  getStageStatus(stage.id) === 'completed' ? 'bg-green-500 text-white' :
                  getStageStatus(stage.id) === 'active' ? 'bg-primary-500 text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {stage.icon}
                </div>
                <div className="text-center mt-2">
                  <div className="text-sm font-medium text-gray-900">{stage.title}</div>
                  <div className="text-xs text-gray-500">{stage.duration}</div>
                </div>
              </div>
              {index < stages.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  getStageStatus(stages[index + 1].id) === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Current Stage Content */}
      {currentStage === 'planning' && renderPlanningStage()}
      {currentStage === 'notice-intention' && renderNoticeIntentionStage()}
      {/* Additional stages would be implemented here */}
    </div>
  );
};

export default Section20Workflow;
