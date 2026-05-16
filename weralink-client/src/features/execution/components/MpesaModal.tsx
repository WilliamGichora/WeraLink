import { useState, useEffect } from 'react';
import { X, Smartphone, CheckCircle, AlertCircle } from 'lucide-react';
import { useInitiateEscrow, useGetTransactionStatus } from '../api/execution.api';


interface MpesaModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentId: string;
  amount: number;
  onSuccess: () => void;
}

export const MpesaModal = ({ isOpen, onClose, assignmentId, amount, onSuccess }: MpesaModalProps) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [step, setStep] = useState<'INPUT' | 'POLLING' | 'SUCCESS' | 'ERROR'>('INPUT');
  const [errorMessage, setErrorMessage] = useState('');
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);

  const { mutate: initiateEscrow, isPending: isInitiating } = useInitiateEscrow();
  
  // Layer 1: Real-time Polling Hook
  const { data: transactionStatus } = useGetTransactionStatus(checkoutRequestId);

  // Layer 2: Handle Status Transitions
  useEffect(() => {
    if (!transactionStatus) return;

    if (transactionStatus.status === 'SUCCESS') {
      setStep('SUCCESS');
      // Delay closing to show success state
      const timer = setTimeout(() => {
        onSuccess();
        onClose();
        // Reset for next time
        setStep('INPUT');
        setCheckoutRequestId(null);
      }, 2500);
      return () => clearTimeout(timer);
    } 
    
    if (transactionStatus.status === 'FAILED') {
      setStep('ERROR');
      setErrorMessage('M-Pesa payment failed or was cancelled by user.');
    }
  }, [transactionStatus, onSuccess, onClose]);

  const handleTrigger = () => {
    if (!phoneNumber) return;
    
    let formattedPhone = phoneNumber.replace(/\D/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.slice(1);
    } else if (!formattedPhone.startsWith('254')) {
      formattedPhone = '254' + formattedPhone;
    }

    initiateEscrow({ 
      assignmentId, 
      phoneNumber: formattedPhone 
    }, {
      onSuccess: (data) => {
        // If the gig was already funded (Escrow Credit), it returns status: SUCCESS immediately
        if (data.status === 'SUCCESS' || data.method === 'ESCROW_CREDIT') {
          setStep('SUCCESS');
          const timer = setTimeout(() => {
            onSuccess();
            onClose();
            setStep('INPUT');
          }, 2500);
          return;
        }

        // Otherwise, it's a standard STK push, so we start polling
        setCheckoutRequestId(data.CheckoutRequestID);
        setStep('POLLING');
      },
      onError: (error: any) => {
        setStep('ERROR');
        setErrorMessage(error.message || 'Failed to initiate payment.');
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-accent-dark/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative">
        
        {/* Close Button */}
        {step !== 'POLLING' && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-accent-dark dark:hover:text-white rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="p-8">
          
          {step === 'INPUT' && (
            <div className="animate-in slide-in-from-bottom-4 duration-300">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mb-6">
                <Smartphone className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-accent-dark dark:text-white mb-2 font-display">Fund Escrow via M-Pesa</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                Enter your M-Pesa number. You will receive an STK prompt on your phone to authorize <strong className="text-accent-dark dark:text-white">KES {amount.toLocaleString()}</strong>.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Safaricom Number</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">+254</span>
                    <input 
                      type="tel" 
                      placeholder="712 345 678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full pl-16 pr-4 py-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-lg font-bold text-accent-dark dark:text-white focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all outline-none"
                    />
                  </div>
                </div>
                
                <button 
                  onClick={handleTrigger}
                  disabled={!phoneNumber || phoneNumber.length < 9}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold text-lg py-4 rounded-xl shadow-[0_4px_14px_0_rgba(34,197,94,0.39)] hover:shadow-[0_6px_20px_rgba(34,197,94,0.23)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Pay KES {amount.toLocaleString()}
                </button>
              </div>
            </div>
          )}

          {step === 'POLLING' && (
            <div className="flex flex-col items-center text-center py-8 animate-in zoom-in duration-300">
              <div className="relative mb-8">
                <div className="w-24 h-24 rounded-full border-4 border-gray-100 dark:border-gray-700 border-t-green-500 animate-spin"></div>
                <Smartphone className="w-8 h-8 text-green-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <h2 className="text-xl font-bold text-accent-dark dark:text-white mb-2">Check Your Phone</h2>
              <p className="text-gray-500 dark:text-gray-400">
                Please enter your M-Pesa PIN on the prompt sent to your phone to complete the escrow deposit.
              </p>
            </div>
          )}

          {step === 'SUCCESS' && (
            <div className="flex flex-col items-center text-center py-8 animate-in slide-in-from-bottom-8 duration-500">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-accent-dark dark:text-white mb-2">Payment Successful!</h2>
              <p className="text-gray-500 dark:text-gray-400">
                Escrow funded. The worker has been assigned.
              </p>
            </div>
          )}

          {step === 'ERROR' && (
            <div className="flex flex-col items-center text-center py-8 animate-in slide-in-from-bottom-8 duration-500">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-accent-dark dark:text-white mb-2">Payment Failed</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8">
                {errorMessage}
              </p>
              <button 
                onClick={() => setStep('INPUT')}
                className="w-full bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 dark:text-accent-dark text-white font-bold py-4 rounded-xl transition-all"
              >
                Try Again
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
