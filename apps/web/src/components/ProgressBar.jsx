import React from 'react';
import { cn } from '@/lib/utils.js';

const ProgressBar = ({ percentage = 0, label, showLabel = true, estado = 'gris', className }) => {
  const colors = {
    verde: 'bg-emerald-500',
    amarillo: 'bg-amber-500',
    rojo: 'bg-rose-500',
    gris: 'bg-slate-300'
  };
  
  const bgColor = colors[estado] || colors.gris;
  const safePercentage = Math.min(Math.max(percentage, 0), 100);

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between items-end text-xs mb-1.5">
          {label && <span className="text-muted-foreground font-medium">{label}</span>}
          <span className="font-semibold text-foreground">{safePercentage.toFixed(1)}%</span>
        </div>
      )}
      <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden">
        <div 
          className={cn("h-full transition-all duration-500 ease-out", bgColor)} 
          style={{ width: `${safePercentage}%` }} 
        />
      </div>
    </div>
  );
};

export default ProgressBar;