import React, { useRef } from 'react';
import { 
  Download, 
  CheckCircle2, 
  Smartphone,
  ArrowLeft,
  Share2
} from 'lucide-react';
import { format } from 'date-fns';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: any;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, transaction }) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !transaction) return null;

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;
    
    const loadingToast = toast.loading('Generating high-quality PDF...');
    
    try {
      const element = receiptRef.current;
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: '#F6E8EA',
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 3, canvas.height / 3]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 3, canvas.height / 3);
      pdf.save(`WeraLink-Receipt-${receiptNumber || 'TXN'}.pdf`);
      
      toast.success('Receipt downloaded successfully', { id: loadingToast });
    } catch (error) {
      console.error('PDF Generation Error:', error);
      toast.error('Failed to generate PDF', { id: loadingToast });
    }
  };

  const handleShareWhatsApp = () => {
    const text = `WeraLink Receipt: Received ${currency} ${Number(amount).toLocaleString()} for ${gig.title}. Ref: ${receiptNumber}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const { assignment, amount, receiptNumber, completedAt, currency } = transaction;
  const { gig, worker } = assignment;

  return (
    <div className="fixed inset-0 z-9999 bg-accent-dark font-display text-text-main antialiased overflow-y-auto animate-in fade-in duration-300">
      {/* Background Decorative Blurs */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-primary-wera rounded-full blur-[120px] opacity-30"></div>
        <div className="absolute left-0 bottom-0 w-[400px] h-[400px] bg-accent-text rounded-full blur-[100px] opacity-20"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-start py-6 px-4">
        
        {/* Header Navigation - Compact */}
        <nav className="w-full max-w-7xl mx-auto flex justify-between items-center mb-6 shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-white/10 p-1.5 rounded-lg backdrop-blur-sm border border-white/10">
              <img 
                src="/assets/logos/weralink-brand-mark.png" 
                alt="Logo" 
                className="w-6 h-6 object-contain"
              />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">Wera<span className="text-primary-wera">Link</span></span>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white flex items-center gap-2 text-xs font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </button>
        </nav>

        {/* Main Content Area - Use flex-1 to push footer but allow shrinking */}
        <main className="w-full max-w-md relative flex flex-col items-center justify-center">
          
          {/* Top Success Banner */}
          <div className="bg-green-500 text-white text-center py-2 rounded-t-lg font-bold text-[9px] tracking-[0.2em] uppercase flex items-center justify-center gap-2 shadow-lg relative z-20 w-[85%] translate-y-1.5">
            <CheckCircle2 className="w-3 h-3" />
            Payment Successful
          </div>

          {/* The Receipt Card - Compact */}
          <div 
            ref={receiptRef}
            className="bg-[#F6E8EA] rounded-xl shadow-2xl overflow-hidden relative w-full flex flex-col"
          >
            {/* Gradient Top Border */}
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary-wera via-accent-text to-primary-wera"></div>

            {/* Header Section */}
            <div className="p-5 text-center border-b border-gray-200/60 relative">
              <div className="w-12 h-12 bg-white rounded-full mx-auto flex items-center justify-center shadow-sm mb-2.5 border border-white/50 overflow-hidden">
                <img 
                  src="/assets/logos/weralink-brand-mark.png" 
                  alt="WeraLink Logo" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <h1 className="text-lg font-black text-accent-dark mb-0.5 tracking-tight leading-none">Transaction Receipt</h1>
              <p className="text-gray-500 text-[10px] font-medium opacity-80">Thank you for using WeraLink</p>
            </div>

            {/* Amount Section */}
            <div className="bg-white/50 p-5 text-center backdrop-blur-sm">
              <p className="text-gray-400 text-[8px] font-black uppercase tracking-widest mb-1">Total Amount Paid</p>
              <div className="flex justify-center items-baseline text-accent-dark">
                <span className="text-base font-bold mr-1 text-slate-400">{currency || 'KES'}</span>
                <span className="text-3xl font-black tracking-tighter leading-none">
                  {Number(amount).toLocaleString()}
                </span>
                <span className="text-base font-bold text-slate-300">.00</span>
              </div>
              <div className="mt-2.5 inline-flex items-center px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-[8px] font-black uppercase tracking-widest border border-green-200 shadow-sm">
                Paid
              </div>
            </div>

            {/* Details Section */}
            <div className="p-5 space-y-3.5">
              <div className="space-y-2.5">
                <div className="flex justify-between items-center py-1 border-b border-gray-300/30 border-dashed">
                  <span className="text-gray-500 text-[9px] font-bold uppercase tracking-wider">Date & Time</span>
                  <span className="text-accent-dark font-bold text-[12px]">
                    {completedAt ? format(new Date(completedAt), 'MMM dd, yyyy, HH:mm a') : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-300/30 border-dashed">
                  <span className="text-gray-500 text-[9px] font-bold uppercase tracking-wider">M-Pesa Ref</span>
                  <span className="text-accent-dark font-mono font-black text-[12px] bg-white/40 px-1.5 py-0.5 rounded border border-white/20">
                    {receiptNumber || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-300/30 border-dashed">
                  <span className="text-gray-500 text-[9px] font-bold uppercase tracking-wider">Transaction ID</span>
                  <span className="text-accent-dark font-mono font-bold text-[12px] uppercase">TRX-{receiptNumber?.slice(-4)}-WL</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-300/30 border-dashed">
                  <span className="text-gray-500 text-[9px] font-bold uppercase tracking-wider">Payment Method</span>
                  <div className="flex items-center gap-1.5">
                    <Smartphone className="w-3 h-3 text-green-600" />
                    <span className="text-accent-dark font-bold text-[12px]">M-Pesa</span>
                  </div>
                </div>
                <div className="flex justify-between items-start py-1">
                  <span className="text-gray-500 text-[9px] font-bold uppercase tracking-wider">Service</span>
                  <div className="text-right max-w-[180px]">
                    <span className="text-accent-dark font-black text-[12px] block leading-tight">{gig.title}</span>
                    <span className="text-[8px] text-gray-400 font-bold block mt-0.5 uppercase tracking-tighter">Gig ID: #{gig.id.substring(0, 8)}</span>
                  </div>
                </div>
              </div>

              {/* Recipient Details Card */}
              <div className="bg-white rounded-lg p-2.5 border border-white/50 flex items-center gap-2.5 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-accent-dark text-white flex items-center justify-center text-[10px] font-black shadow-lg">
                  {worker.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                </div>
                <div>
                  <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest leading-none mb-0.5">Paid To</p>
                  <p className="text-[12px] font-black text-accent-dark leading-none">{worker.name}</p>
                </div>
              </div>
            </div>

            {/* Receipt Footer Pattern */}
            <div className="h-2.5 w-full opacity-10 shrink-0" style={{
              backgroundImage: 'radial-gradient(#EF626C 1px, transparent 1px)',
              backgroundSize: '8px 8px'
            }}></div>
          </div>

          {/* Action Buttons */}
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
            <button 
              onClick={handleDownloadPDF}
              className="flex items-center justify-center w-full px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-bold text-[13px] transition-all duration-200 backdrop-blur-sm group shadow-xl"
            >
              <Download className="w-3.5 h-3.5 mr-2 group-hover:scale-110 transition-transform" />
              Download PDF
            </button>
            <button 
              onClick={handleShareWhatsApp}
              className="flex items-center justify-center w-full px-4 py-2.5 bg-primary-wera hover:bg-primary-dark rounded-lg text-white font-bold text-[13px] transition-all duration-200 shadow-xl shadow-primary-wera/30 group"
            >
              <Share2 className="w-3.5 h-3.5 mr-2 group-hover:scale-110 transition-transform" />
              Share WhatsApp
            </button>
          </div>

          {/* Support Link */}
          <div className="mt-4 text-center">
            <p className="text-gray-500 text-[9px] font-medium opacity-70">
              Need help? <a href="#" className="text-primary-wera hover:text-white transition-colors underline underline-offset-4 decoration-primary-wera/30">Contact Support</a>
            </p>
          </div>
        </main>

        {/* Footer - Floating at bottom */}
        <footer className="shrink-0 pb-4 mt-auto text-center">
          <p className="text-gray-600 text-[8px] font-bold uppercase tracking-widest">
            © 2026 WeraLink. Secure Payments by WeraLink.
          </p>
        </footer>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-receipt, #printable-receipt * { visibility: visible; }
          #printable-receipt {
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 80%;
            padding: 40px;
            background-color: #F6E8EA !important;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
};
