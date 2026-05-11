import React from 'react';
import { X, AlertTriangle, CheckCircle, Info, HelpCircle } from 'lucide-react';
import { Button } from './button';

export type ConfirmationType = 'danger' | 'warning' | 'info' | 'success';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmationType;
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <AlertTriangle className="w-10 h-10 text-red-500" />;
      case 'warning':
        return <HelpCircle className="w-10 h-10 text-amber-500" />;
      case 'success':
        return <CheckCircle className="w-10 h-10 text-emerald-500" />;
      case 'info':
        return <Info className="w-10 h-10 text-blue-500" />;
      default:
        return <Info className="w-10 h-10 text-blue-500" />;
    }
  };

  const getIconBg = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-50';
      case 'warning':
        return 'bg-amber-50';
      case 'success':
        return 'bg-emerald-50';
      case 'info':
        return 'bg-blue-50';
      default:
        return 'bg-blue-50';
    }
  };

  const getConfirmBtnClass = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'warning':
        return 'bg-amber-500 hover:bg-amber-600 text-white';
      case 'success':
        return 'bg-emerald-600 hover:bg-emerald-700 text-white';
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      default:
        return 'bg-accent-dark hover:bg-black text-white';
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-accent-dark/40 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden relative border border-white/20 animate-in zoom-in-95 slide-in-from-bottom-8 duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative background element */}
        <div className={`absolute top-0 right-0 w-32 h-32 ${getIconBg()} rounded-bl-full -mr-12 -mt-12 opacity-50`}></div>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-accent-dark hover:bg-slate-100 rounded-full transition-all z-10 disabled:opacity-30"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-10 pt-12 relative z-10">
          <div className="flex flex-col items-center text-center">
            <div className={`w-20 h-20 ${getIconBg()} rounded-3xl flex items-center justify-center mb-8 shadow-inner`}>
              {getIcon()}
            </div>
            
            <h2 className="text-2xl font-black text-accent-dark mb-4 tracking-tight">{title}</h2>
            <p className="text-text-main/60 font-medium leading-relaxed mb-10">
              {description}
            </p>
            
            <div className="grid grid-cols-2 gap-4 w-full">
              <Button 
                variant="outline" 
                onClick={onClose}
                disabled={isLoading}
                className="rounded-2xl h-14 font-bold border-slate-200 text-slate-500 hover:bg-slate-50 transition-all active:scale-95"
              >
                {cancelText}
              </Button>
              <Button 
                onClick={onConfirm}
                disabled={isLoading}
                className={`rounded-2xl h-14 font-black shadow-lg transition-all active:scale-95 ${getConfirmBtnClass()} disabled:opacity-70`}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : confirmText}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Bottom accent bar */}
        <div className={`h-1.5 w-full ${getConfirmBtnClass().split(' ')[0]}`}></div>
      </div>
    </div>
  );
};
