import React from 'react';

export function PredictionBars({ classA, classB, probA = 50, probB = 50 }) {
  const isALeading = probA >= probB;

  return (
    <div className="w-full space-y-3 font-mono text-xs">
      {/* Class A Bar */}
      <div className="p-3 bg-white rounded-xl border border-[#DDE2E5] shadow-sm">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-bold text-[#18324A] flex items-center gap-1.5">
            <span className="text-base">{classA.icon}</span>
            <span>{classA.name}</span>
          </span>
          <span className={`font-bold tabular-nums ${isALeading ? 'text-[#E67E42]' : 'text-slate-500'}`}>
            {probA}%
          </span>
        </div>
        <div className="w-full bg-[#F7F3EA] h-3.5 rounded-full overflow-hidden p-0.5 border border-[#DDE2E5]">
          <div
            className="bg-[#E67E42] h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${probA}%` }}
          />
        </div>
      </div>

      {/* Class B Bar */}
      <div className="p-3 bg-white rounded-xl border border-[#DDE2E5] shadow-sm">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-bold text-[#18324A] flex items-center gap-1.5">
            <span className="text-base">{classB.icon}</span>
            <span>{classB.name}</span>
          </span>
          <span className={`font-bold tabular-nums ${!isALeading ? 'text-[#4E8585]' : 'text-slate-500'}`}>
            {probB}%
          </span>
        </div>
        <div className="w-full bg-[#F7F3EA] h-3.5 rounded-full overflow-hidden p-0.5 border border-[#DDE2E5]">
          <div
            className="bg-[#4E8585] h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${probB}%` }}
          />
        </div>
      </div>
    </div>
  );
}
