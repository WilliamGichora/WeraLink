import React from 'react';
import { ShieldCheck, Award } from 'lucide-react';

interface SystemBadgeProps {
  badgeName: string;
  className?: string;
}

export const SystemBadge: React.FC<SystemBadgeProps> = ({ badgeName, className = '' }) => {
  return (
    <div className={`relative flex flex-col w-32 drop-shadow-md hover:-translate-y-1 transition-transform ${className}`}>
      {/* Top Section: "CERTIFIED" */}
      <div className="bg-[#2B3A3F] text-white text-[10px] font-black uppercase tracking-[0.15em] text-center py-2 rounded-t-md">
        Certified
      </div>

      {/* Middle Section: Logo Area */}
      <div className="bg-white border-x border-[#2B3A3F]/10 px-2 py-4 flex flex-col items-center justify-center">
        <div className="w-8 h-8 rounded-full bg-stitch-primary/10 flex items-center justify-center mb-1 border border-stitch-primary/20">
          <ShieldCheck className="w-5 h-5 text-[#2B3A3F]" />
        </div>
        <span className="text-[7px] font-black uppercase tracking-widest text-[#2B3A3F]/80">
          WeraLink
        </span>
      </div>

      {/* Bottom Section: Ribbon/Shield Shape */}
      <div 
        className="bg-[#C50D53] text-white text-center px-2 pt-3 pb-8 flex items-center justify-center"
        style={{
          clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 16px), 50% 100%, 0 calc(100% - 16px))'
        }}
      >
        <span className="text-xs font-semibold leading-tight drop-shadow-sm">
          {badgeName}
        </span>
      </div>
      
      {/* 3D Fold Effect (optional nice touch) */}
      <div className="absolute top-[1.8rem] left-0 right-0 h-1 bg-black/20 pointer-events-none" />
    </div>
  );
};
