import { Check, Clock, Edit3, ShieldAlert, Award } from 'lucide-react';

export type WorkflowStatus = 'OFFERED' | 'ACCEPTED' | 'SUBMITTED' | 'REVISION_REQUESTED' | 'APPROVED' | 'PAID' | 'DISPUTED' | 'FAILED';

interface WorkflowStepperProps {
  currentStatus: WorkflowStatus;
  assignedAt?: string;
  submittedAt?: string;
}

export const WorkflowStepper = ({ currentStatus, assignedAt, submittedAt }: WorkflowStepperProps) => {
  const steps = [
    { id: 'ACCEPTED', label: 'Assigned', date: assignedAt || 'Pending', icon: Check },
    { id: 'SUBMITTED', label: 'In Progress', date: 'Working on evidence', icon: Clock },
    { id: 'UNDER_REVIEW', label: 'Under Review', date: submittedAt || 'Pending submission', icon: ShieldAlert },
    { id: 'APPROVED', label: 'Approved', date: 'Funds released', icon: Award }
  ];

  const getStepState = (stepId: string) => {
    switch (currentStatus) {
      case 'ACCEPTED':
      case 'REVISION_REQUESTED':
        if (stepId === 'ACCEPTED') return 'completed';
        if (stepId === 'SUBMITTED') return 'active';
        return 'upcoming';
      case 'SUBMITTED':
        if (stepId === 'ACCEPTED' || stepId === 'SUBMITTED') return 'completed';
        if (stepId === 'UNDER_REVIEW') return 'active';
        return 'upcoming';
      case 'APPROVED':
      case 'PAID':
        return 'completed';
      default:
        return 'upcoming';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
      <h3 className="font-bold text-accent-dark dark:text-white mb-8 text-xl font-display">Workflow Status</h3>
      
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-[15px] top-4 bottom-8 w-0.5 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        
        {steps.map((step) => {
          const state = getStepState(step.id);
          const Icon = step.icon;
          
          return (
            <div key={step.id} className={`relative flex gap-6 mb-8 last:mb-0 transition-opacity duration-300 ${state === 'upcoming' ? 'opacity-50 grayscale' : ''}`}>
              <div className={`
                w-8 h-8 rounded-full border-4 flex items-center justify-center z-10 transition-colors shadow-sm
                ${state === 'completed' ? 'bg-green-500 border-green-100 dark:border-green-900/30 text-white' : 
                  state === 'active' ? 'bg-primary border-primary/20 shadow-primary/30 text-white' : 
                  'bg-gray-200 dark:bg-gray-700 border-white dark:border-gray-800 text-gray-400'}
              `}>
                <Icon className="w-4 h-4" strokeWidth={2.5} />
              </div>
              
              <div className="grow pt-0.5">
                <h4 className={`text-base font-bold ${state === 'active' ? 'text-primary' : 'text-accent-dark dark:text-white'}`}>
                  {step.label}
                </h4>
                <p className="text-sm text-gray-500 mt-1">{step.date}</p>
                
                {currentStatus === 'REVISION_REQUESTED' && step.id === 'SUBMITTED' && (
                  <div className="mt-3 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 p-3 rounded-lg flex items-start gap-2 border border-amber-200 dark:border-amber-800">
                    <Edit3 className="w-4 h-4 mt-0.5 shrink-0" />
                    <span className="text-xs font-medium">Employer requested revisions to the submitted evidence. Please review notes and resubmit.</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
