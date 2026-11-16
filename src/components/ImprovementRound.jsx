import React, { useState } from 'react';
import { Eye, Lightbulb, ShieldAlert, Sparkles, PlusCircle, ArrowRight } from 'lucide-react';
import { sound } from '../utils/sound';

export function ImprovementRound({
  classA,
  classB,
  prediction,
  onAddMoreData,
  onCompleteExperiment
}) {
  const [activeTrick, setActiveTrick] = useState('distance');

  const tricks = [
    {
      id: 'distance',
      title: 'Move Farther Away',
      desc: 'Step 2 meters back or hold the object at arm\'s length.',
      observation: 'The object occupies fewer pixels; the machine\'s spatial grid sees background instead of features!'
    },
    {
      id: 'angle',
      title: 'Tilt or Turn Sideways',
      desc: 'Rotate your hand or object by 45° or 90° away from the lens.',
      observation: 'Edge silhouettes completely change orientation, causing confidence to drop!'
    },
    {
      id: 'lighting',
      title: 'Cast a Shadow or Dim Lights',
      desc: 'Block light with your other hand or move away from overhead lamps.',
      observation: 'Luminance values shift, altering the numerical color balance.'
    },
    {
      id: 'partial',
      title: 'Partially Hide the Object',
      desc: 'Cover half the object with paper or your fingers.',
      observation: 'The decision boundary struggles when crucial features are obscured!'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto my-8 space-y-8">
      {/* 1. CAN YOU FOOL THE MACHINE? */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#DDE2E5] shadow-xl text-[#20303C]">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#E67E42]/10 text-[#E67E42] text-xs font-mono font-bold tracking-wider uppercase mb-2">
          STAGE 05 · ADVERSARIAL TESTING
        </div>

        <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-[#18324A] uppercase tracking-tight">
          CAN YOU FOOL THE MACHINE?
        </h2>

        <p className="font-display text-base sm:text-lg font-semibold text-[#18324A]/80 mt-1">
          “Show the machine something unusual and see what happens.”
        </p>

        <p className="text-xs sm:text-sm text-[#20303C]/80 mt-2 max-w-2xl leading-relaxed">
          The machine doesn't have human intuition—it strictly compares live pixel mathematics to your training dataset.
          Test these 4 experiments to reveal its blind spots:
        </p>

        {/* Experiment cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-6">
          {tricks.map((trick) => {
            const isSelected = activeTrick === trick.id;
            return (
              <div
                key={trick.id}
                onClick={() => {
                  sound.playClick();
                  setActiveTrick(trick.id);
                }}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#E67E42] bg-[#F7F3EA] shadow-md ring-2 ring-[#E67E42]/30'
                    : 'border-[#DDE2E5] bg-white hover:border-[#4E8585]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="font-display font-bold text-sm text-[#18324A]">
                    {trick.title}
                  </h4>
                  {isSelected && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E67E42] text-white font-bold">
                      ACTIVE TEST
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#20303C]/70 mb-2">{trick.desc}</p>
                <div className="p-2 bg-white rounded-lg border border-[#DDE2E5] text-[11px] text-[#4E8585] font-mono">
                  🔎 {trick.observation}
                </div>
              </div>
            );
          })}
        </div>

        {/* Live prediction feedback box */}
        {prediction && (
          <div className="p-4 rounded-xl bg-[#14293c] text-white flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{prediction.predictedIcon}</span>
              <div>
                <span className="text-[10px] font-mono text-[#DDE2E5]/70 uppercase block">
                  CURRENT LIVE PREDICTION
                </span>
                <span className="font-display font-bold text-lg text-white">
                  {prediction.predictedName} ({prediction.confidence}%)
                </span>
              </div>
            </div>

            <div className="text-right text-xs font-mono text-teal-300">
              {prediction.isUncertain ? '⚠️ Model is uncertain!' : '✓ High confidence pattern'}
            </div>
          </div>
        )}

        {/* Core Scientific Principle Quote */}
        <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
          <p className="font-semibold text-sm mb-1">
            “Machine-learning systems learn from the examples they are given. New situations can produce uncertain or incorrect predictions.”
          </p>
          <p className="text-amber-800/80">
            This teaches us that an AI is only as capable as the diversity of scenarios included in its dataset.
          </p>
        </div>
      </div>

      {/* 2. IMPROVE YOUR MACHINE & DATA QUALITY COMPARISON */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#DDE2E5] shadow-xl text-[#20303C]">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#4E8585]/15 text-[#4E8585] text-xs font-mono font-bold tracking-wider uppercase mb-2">
          STAGE 06 · DATA QUALITY DEMONSTRATION
        </div>

        <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-[#18324A] uppercase tracking-tight">
          IMPROVE YOUR MACHINE
        </h2>

        <p className="font-display text-base sm:text-lg font-semibold text-[#18324A]/80 mt-1">
          “Add a few more examples and train again.”
        </p>

        {/* Round 1 vs Round 2 Comparison as requested */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          <div className="p-4 rounded-2xl bg-[#F7F3EA] border border-[#DDE2E5]">
            <span className="text-xs font-mono font-bold text-[#E67E42] block mb-1 uppercase">
              TRAINING ROUND 1
            </span>
            <h4 className="font-bold text-sm text-[#18324A] mb-2">
              Rigid / Single Condition
            </h4>
            <ul className="text-xs space-y-1.5 text-[#20303C]/80 font-mono">
              <li>• ONE ANGLE</li>
              <li>• ONE DISTANCE</li>
              <li>• ONE LIGHTING CONDITION</li>
            </ul>
            <p className="mt-3 text-[11px] text-slate-500 pt-2 border-t border-[#DDE2E5]">
              Result: Easily confused whenever the test setup shifts slightly.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
            <span className="text-xs font-mono font-bold text-emerald-700 block mb-1 uppercase">
              TRAINING ROUND 2
            </span>
            <h4 className="font-bold text-sm text-[#18324A] mb-2">
              Robust / Varied Conditions
            </h4>
            <ul className="text-xs space-y-1.5 text-emerald-900 font-mono">
              <li>• DIFFERENT ANGLES</li>
              <li>• DIFFERENT DISTANCES</li>
              <li>• DIFFERENT LIGHTING</li>
            </ul>
            <p className="mt-3 text-[11px] text-emerald-800 pt-2 border-t border-emerald-200">
              Result: The model learns invariance and maintains accurate predictions!
            </p>
          </div>
        </div>

        {/* Educational takeaway */}
        <div className="p-4 rounded-xl bg-[#18324A] text-white text-xs mb-6">
          <p className="text-sm font-semibold text-white mb-1">
            “Training examples that represent different conditions can help a model handle similar variation during testing.”
          </p>
          <p className="text-[#DDE2E5]/80 text-[11px]">
            Notice we don't claim "more data always fixes everything"—it is the <em>representativeness</em> and <em>variety</em> of data that matters most.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onAddMoreData();
            }}
            className="pressable px-6 py-3.5 bg-[#E67E42] hover:bg-[#d66e33] text-white font-display font-bold text-sm rounded-xl shadow-md flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>ADD MORE DATA & RETRAIN</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onCompleteExperiment();
            }}
            className="pressable px-6 py-3.5 bg-[#18324A] hover:bg-[#20303C] text-white font-bold text-sm rounded-xl flex items-center gap-2"
          >
            <span>VIEW FINAL TAKEAWAY</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
