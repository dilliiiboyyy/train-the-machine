import React from 'react';
import { Award, CheckCircle, ArrowRight, Home, Sparkles, RefreshCw, Hand, Activity, Timer, Brain } from 'lucide-react';
import { sound } from '../utils/sound';

export function TakeawayCard({
  classes = [],
  totalSamples = 0,
  onResetExperiment,
  onTestAgain,
  onGoHome
}) {
  return (
    <div className="max-w-4xl mx-auto my-8 space-y-8">
      <div className="p-6 sm:p-10 rounded-3xl bg-[#14293c] border-2 border-[#4E8585]/40 text-white shadow-2xl text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern-dark opacity-30 pointer-events-none" />

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold tracking-wider uppercase mb-3 border border-emerald-500/40">
          <Award className="w-3.5 h-3.5" />
          <span>EXHIBITION EXPERIMENT COMPLETE</span>
        </div>

        <h2 className="font-display font-extrabold text-3xl sm:text-5xl uppercase tracking-tight text-white mb-2">
          YOUR MACHINE IS TRAINED
        </h2>

        <p className="text-xs sm:text-sm text-[#DDE2E5]/80 font-mono mb-8">
          Trained with {totalSamples} real visitor examples across{' '}
          {classes.map((c) => c.name).join(', ')}.
        </p>

        {/* 4 Core Technology Explanations (Section 37) */}
        <div className="text-left bg-black/40 rounded-2xl p-6 border border-white/10 space-y-5 mb-8">
          <div className="text-center sm:text-left">
            <span className="text-xs font-mono text-[#E67E42] font-bold uppercase tracking-wider block">
              EDUCATIONAL TAKEAWAY
            </span>
            <h3 className="font-display font-black text-2xl sm:text-3xl text-white">
              HOW DID THE MACHINE LEARN?
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
            {/* 1. HAND GESTURES */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-2">
              <div className="flex items-center gap-2 font-mono font-bold text-teal-300">
                <Hand className="w-4 h-4" />
                <span>HAND GESTURES</span>
              </div>
              <p className="text-[#DDE2E5]/80 leading-relaxed">
                The system tracks 21 hand landmarks to recognize hand shapes, finger extension, and gestures like Open Palm vs Fist.
              </p>
            </div>

            {/* 2. BODY POSE */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-2">
              <div className="flex items-center gap-2 font-mono font-bold text-[#E67E42]">
                <Activity className="w-4 h-4" />
                <span>BODY POSE</span>
              </div>
              <p className="text-[#DDE2E5]/80 leading-relaxed">
                The system tracks 17 body landmarks (shoulders, elbows, wrists, hips) to measure posture geometry and arm relationships.
              </p>
            </div>

            {/* 3. MOVEMENT OVER TIME */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-2">
              <div className="flex items-center gap-2 font-mono font-bold text-amber-300">
                <Timer className="w-4 h-4" />
                <span>TEMPORAL MOTION</span>
              </div>
              <p className="text-[#DDE2E5]/80 leading-relaxed">
                Actions like waving and clapping require a short sequence over time (1–2s), not just a single snapshot!
              </p>
            </div>

            {/* 4. CUSTOM MODEL & UNKNOWN REJECTION */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-2">
              <div className="flex items-center gap-2 font-mono font-bold text-rose-300">
                <Brain className="w-4 h-4" />
                <span>UNKNOWN REJECTION</span>
              </div>
              <p className="text-[#DDE2E5]/80 leading-relaxed">
                The classifier only recognizes patterns you trained. For unfamiliar movements, it safely rejects: <strong>NO TRAINED MATCH</strong>.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#E67E42]/15 border border-[#E67E42]/30 text-center sm:text-left">
            <span className="text-xs text-[#F7F3EA] font-medium leading-relaxed block">
              💡 <strong>Key Exhibition Lesson:</strong> A machine can only learn from the specific examples we show it, and an intelligent system should not always be forced to guess!
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {onTestAgain && (
            <button
              onClick={() => {
                sound.playClick();
                onTestAgain();
              }}
              className="pressable px-6 py-3.5 bg-[#E67E42] hover:bg-[#d66e33] text-white font-display font-bold text-sm rounded-xl shadow-lg flex items-center gap-2"
            >
              <span>TEST MODEL AGAIN</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {onResetExperiment && (
            <button
              onClick={() => {
                sound.playClick();
                onResetExperiment();
              }}
              className="pressable px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-xl border border-white/15 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4 text-teal-300" />
              <span>RESET EXPERIMENT (NEW VISITOR)</span>
            </button>
          )}

          {onGoHome && (
            <button
              onClick={() => {
                sound.playClick();
                onGoHome();
              }}
              className="px-5 py-3.5 text-xs font-mono text-[#DDE2E5]/70 hover:text-white"
            >
              Back to Home
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TakeawayCard;
