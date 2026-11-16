import React from 'react';
import {
  Zap,
  HelpCircle,
  AlertCircle,
  PlusCircle,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  UserX,
  EyeOff,
  Flame
} from 'lucide-react';
import { sound } from '../utils/sound';

export function PredictionDisplay({
  prediction,
  classes = [],
  onAddMoreExamples,
  onResetExperiment
}) {
  if (!prediction) {
    return (
      <div className="w-full max-w-xl mx-auto my-4 p-8 bg-white rounded-3xl border-2 border-[#DDE2E5] shadow-lg text-center space-y-3">
        <div className="w-10 h-10 rounded-full border-2 border-[#E67E42] border-t-transparent animate-spin mx-auto" />
        <p className="text-xs font-mono text-slate-500">
          Awaiting live video frames and temporal motion stream...
        </p>
      </div>
    );
  }

  const { status, prediction: winnerName, predictedIcon, matchScore = 0, probabilities = {}, message, reason } =
    prediction;

  // Find class metadata if recognized
  const matchedClass = classes.find((c) => c.name === winnerName);

  return (
    <div className="w-full max-w-xl mx-auto my-4 p-5 sm:p-7 bg-white rounded-3xl border-2 border-[#DDE2E5] shadow-xl space-y-5">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-[#DDE2E5] pb-3">
        <span className="text-xs font-mono font-bold tracking-wider text-[#4E8585] uppercase flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-[#E67E42]" />
          <span>IN-BROWSER MODEL INFERENCE</span>
        </span>

        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
          TEMPORALLY SMOOTHED
        </span>
      </div>

      {/* State 1: NO PERSON DETECTED */}
      {status === 'no_person' && (
        <div className="text-center py-5 px-3 space-y-2.5 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 animate-scale-in">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-200 text-slate-500 flex items-center justify-center">
            <UserX className="w-6 h-6" />
          </div>
          <h3 className="font-display font-black text-xl sm:text-2xl text-[#18324A] uppercase tracking-tight">
            NO PERSON DETECTED
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Please step into the camera viewfinder so the system can perceive your posture.
          </p>
        </div>
      )}

      {/* State 2: NOT ENOUGH INFORMATION (Face only, missing body) */}
      {status === 'not_enough_info' && (
        <div className="text-center py-5 px-3 space-y-2.5 bg-amber-50 rounded-2xl border-2 border-dashed border-amber-300 animate-scale-in">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <EyeOff className="w-6 h-6" />
          </div>
          <h3 className="font-display font-black text-xl sm:text-2xl text-amber-900 uppercase tracking-tight">
            NOT ENOUGH INFORMATION
          </h3>
          <p className="text-xs text-amber-800 font-medium">
            {reason || 'The camera only sees part of your body. Step back so your posture can be measured.'}
          </p>
        </div>
      )}

      {/* State 3: NO TRAINED MATCH (Out of distribution / Untrained pose) */}
      {status === 'unknown' && (
        <div className="text-center py-4 px-2 space-y-2.5 bg-[#F7F3EA] rounded-2xl border-2 border-dashed border-[#DDE2E5] animate-scale-in">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 flex items-center justify-center">
            <HelpCircle className="w-8 h-8" />
          </div>

          <h3 className="font-display font-black text-2xl sm:text-3xl text-[#18324A] uppercase tracking-tight">
            NO TRAINED MATCH
          </h3>

          <p className="text-xs sm:text-sm text-[#20303C]/80 max-w-sm mx-auto font-medium">
            “The machine doesn’t recognize this as one of the things it learned.”
          </p>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-mono font-bold">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span>MATCH SCORE: {matchScore}% (BELOW THRESHOLD)</span>
          </div>

          <p className="text-[11px] font-mono text-slate-500 pt-1">
            💡 Educational Insight: A good classifier refuses to guess blindly when an untrained movement is performed!
          </p>
        </div>
      )}

      {/* State 4: RECOGNIZED CLASS */}
      {status === 'recognized' && (
        <div className="text-center py-4 bg-emerald-50/60 rounded-2xl border-2 border-emerald-500/30 animate-scale-in space-y-2">
          <div className="text-5xl sm:text-6xl animate-float inline-block">
            {predictedIcon || matchedClass?.icon || '✨'}
          </div>

          <h3 className="font-display font-black text-3xl sm:text-4xl text-[#18324A] uppercase tracking-tight">
            {winnerName}
          </h3>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#18324A] text-white text-xs font-mono font-bold shadow">
            <span>MATCH SCORE: {matchScore}%</span>
          </div>
        </div>
      )}

      {/* Multi-Class Similarity Estimates */}
      <div className="space-y-2.5 pt-1">
        <span className="text-[11px] font-mono font-bold uppercase text-slate-500 block">
          CLASS ESTIMATES:
        </span>

        {classes.map((cls) => {
          const prob = probabilities[cls.name] || 0;
          const isLead = status === 'recognized' && cls.name === winnerName;

          return (
            <div key={cls.id} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="flex items-center gap-1.5 font-bold text-[#18324A]">
                  <span>{cls.icon}</span>
                  <span>{cls.name}</span>
                </span>
                <span className={`font-bold tabular-nums ${isLead ? 'text-[#E67E42]' : 'text-slate-500'}`}>
                  {prob}%
                </span>
              </div>

              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                <div
                  className={`h-full rounded-full transition-all duration-300 ease-out ${
                    isLead ? 'bg-[#E67E42]' : 'bg-[#4E8585]/60'
                  }`}
                  style={{ width: `${Math.max(2, prob)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* "TRY TO FOOL YOUR MACHINE" SECTION (Section 26) */}
      <div className="p-3.5 bg-amber-500/10 rounded-2xl border border-amber-500/30 text-left text-xs space-y-1.5">
        <div className="font-bold text-[#18324A] uppercase font-display flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-[#E67E42]" />
          <span>TRY TO FOOL YOUR MACHINE:</span>
        </div>
        <p className="text-slate-700 leading-relaxed text-[11px]">
          Do something you never taught it! Wave your hands, crouch down, or step sideways. The machine should reject it and display <strong>NO TRAINED MATCH</strong> instead of forcing a guess!
        </p>
      </div>

      {/* Retrain & Reset Experiment Controls */}
      <div className="pt-3 border-t border-[#DDE2E5] flex flex-wrap items-center justify-between gap-2.5">
        {onAddMoreExamples && (
          <button
            onClick={() => {
              sound.playClick();
              onAddMoreExamples();
            }}
            className="pressable px-4 py-2 bg-[#18324A] hover:bg-[#23425f] text-white text-xs font-display font-bold uppercase rounded-xl flex items-center gap-1.5 shadow transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#E67E42]" />
            <span>ADD MORE EXAMPLES / RETRAIN</span>
          </button>
        )}

        {onResetExperiment && (
          <button
            onClick={() => {
              sound.playClick();
              onResetExperiment();
            }}
            className="px-3 py-2 text-xs font-mono text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            title="Start fresh with new custom classes"
          >
            Reset Experiment ➔
          </button>
        )}
      </div>
    </div>
  );
}

export default PredictionDisplay;
