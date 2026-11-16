import React from 'react';
import { Sparkles, ArrowRight, Play, Database } from 'lucide-react';
import { sound } from '../utils/sound';

/**
 * TrainingBoard Component
 * Pre-training overview displaying dataset samples collected for all custom classes.
 */
export function TrainingBoard({
  classes = [],
  examplesByClass = {},
  onStartTraining,
  onBackToCapture
}) {
  const canTrain =
    classes.length >= 2 &&
    classes.every((c) => (examplesByClass[c.id] || []).length >= 2);

  return (
    <div className="max-w-2xl mx-auto my-8 p-6 sm:p-8 rounded-3xl bg-white border border-[#DDE2E5] shadow-2xl text-center">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#E67E42]/10 text-[#E67E42] text-xs font-mono font-bold tracking-wider uppercase mb-3">
        STAGE 03 · MODEL COMPILATION
      </div>

      <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#18324A] uppercase tracking-tight mb-2">
        READY TO TRAIN?
      </h2>

      <p className="text-sm text-[#20303C]/80 max-w-md mx-auto mb-6">
        Your browser has extracted body and hand landmarks. The in-browser ML engine is ready to compute geometric posture features and learn distinguishing motion patterns in local memory.
      </p>

      {/* Visual Dot Representation for all custom classes */}
      <div className="p-5 bg-[#F7F3EA] rounded-2xl border border-[#DDE2E5] max-w-md mx-auto mb-6 space-y-3 font-mono text-xs">
        {classes.map((cls) => {
          const list = examplesByClass[cls.id] || [];
          const count = list.length;

          return (
            <div
              key={cls.id}
              className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-[#DDE2E5]"
            >
              <span className="font-bold text-[#18324A] flex items-center gap-1.5 truncate">
                <span>{cls.icon}</span>
                <span className="truncate">{cls.name}</span>
              </span>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: Math.min(6, count) }).map((_, i) => (
                  <span
                    key={i}
                    className="w-3.5 h-3.5 rounded-full bg-[#E67E42] inline-block animate-scale-in"
                  />
                ))}
                {count > 6 && (
                  <span className="text-[10px] text-slate-500">+{count - 6}</span>
                )}
                <span className="ml-1 font-bold text-[#E67E42]">({count})</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Large Train Button */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={() => {
            sound.playClick();
            onStartTraining();
          }}
          disabled={!canTrain}
          className={`pressable w-full sm:w-auto px-10 py-5 font-display font-bold text-lg rounded-2xl shadow-xl flex items-center justify-center gap-2.5 transition-all ${
            canTrain
              ? 'bg-[#E67E42] hover:bg-[#d66e33] text-white animate-pulse'
              : 'bg-slate-300 text-slate-500 cursor-not-allowed'
          }`}
        >
          <Sparkles className="w-6 h-6" />
          <span>TRAIN THE MACHINE</span>
          <ArrowRight className="w-5 h-5 ml-1" />
        </button>

        {onBackToCapture && (
          <button
            onClick={() => {
              sound.playClick();
              onBackToCapture();
            }}
            className="w-full sm:w-auto px-6 py-5 rounded-2xl bg-white hover:bg-slate-50 text-slate-600 font-semibold text-sm border border-[#DDE2E5] transition-colors"
          >
            Capture More
          </button>
        )}
      </div>

      {!canTrain && (
        <p className="text-xs text-rose-500 font-mono mt-3">
          Capture at least 2 examples for each class before training.
        </p>
      )}
    </div>
  );
}

export default TrainingBoard;
