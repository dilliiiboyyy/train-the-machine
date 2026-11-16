import React, { useEffect, useState } from 'react';
import { Database, Brain, Cpu, CheckCircle2, ArrowRight, Activity, Hand, Sparkles } from 'lucide-react';
import { sound } from '../utils/sound';

/**
 * TrainingAnimation Component
 * Animates the browser pipeline:
 * CAMERA DATA ➔ POSE & HAND LANDMARKS ➔ TEMPORAL FEATURES ➔ CUSTOM CLASSIFIER ➔ READY
 */
export function TrainingAnimation({
  classes = [],
  totalSamples = 0,
  onComplete,
  onSkip
}) {
  const [stage, setStage] = useState(0);

  const STAGES = [
    { id: 'data', label: 'CAMERA DATA' },
    { id: 'landmarks', label: 'POSE & HANDS' },
    { id: 'features', label: 'TEMPORAL FEATURES' },
    { id: 'classifier', label: 'CUSTOM CLASSIFIER' },
    { id: 'ready', label: 'READY' }
  ];

  useEffect(() => {
    sound.playEnginePulse(380);

    const t1 = setTimeout(() => {
      setStage(1);
      sound.playEnginePulse(460);
    }, 650);

    const t2 = setTimeout(() => {
      setStage(2);
      sound.playEnginePulse(560);
    }, 1400);

    const t3 = setTimeout(() => {
      setStage(3);
      sound.playEnginePulse(700);
    }, 2200);

    const t4 = setTimeout(() => {
      setStage(4);
      sound.playSuccess();
    }, 3000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-[#18324A]/95 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-[#14293c] border-2 border-[#4E8585]/40 rounded-3xl p-6 sm:p-10 text-white shadow-2xl text-center overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern-dark opacity-30 pointer-events-none" />

        {/* Skip button */}
        <button
          onClick={onSkip}
          className="absolute top-5 right-5 text-xs text-[#DDE2E5]/70 hover:text-white uppercase font-mono px-3 py-1 rounded bg-white/5 hover:bg-white/10"
        >
          Skip ➔
        </button>

        {/* 5-Step Pipeline Tracker */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-6">
          {STAGES.map((stg, idx) => (
            <React.Fragment key={stg.id}>
              <div
                className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-mono font-bold flex items-center gap-1 transition-all ${
                  stage > idx
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : stage === idx
                    ? 'bg-[#E67E42] text-white shadow-[0_0_12px_rgba(230,126,66,0.6)] scale-105'
                    : 'bg-white/5 text-[#DDE2E5]/40 border border-white/5'
                }`}
              >
                {stage > idx ? (
                  <span>✓</span>
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                )}
                <span>{stg.label}</span>
              </div>
              {idx < STAGES.length - 1 && (
                <span className="text-[#DDE2E5]/30 text-[10px]">➔</span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Headline */}
        <div className="space-y-1 mb-6">
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white uppercase tracking-tight">
            {stage === 4 ? 'PATTERN ENGINE READY' : 'TRAINING PATTERN ENGINE'}
          </h2>
          <p className="text-xs sm:text-sm text-[#E67E42] font-mono">
            {stage === 0 && 'Reading raw video frames and user action captures...'}
            {stage === 1 && 'Extracting 17 body skeleton joints and 21 hand points...'}
            {stage === 2 && 'Computing joint geometry, angles & temporal velocities...'}
            {stage === 3 && 'Fitting custom in-browser decision boundary...'}
            {stage === 4 && 'Model trained & calibrated for live webcam inference!'}
          </p>
        </div>

        {/* Animated Central Pattern Apparatus */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 mx-auto mb-8 flex items-center justify-center">
          <div
            className="absolute inset-0 rounded-full border border-dashed border-[#E67E42]/40 animate-spin-slow pointer-events-none"
            style={{ animationDuration: '20s' }}
          />

          <div
            className="absolute inset-3 rounded-full border-2 border-t-[#E67E42] border-r-transparent border-b-[#4E8585] border-l-transparent animate-spin-reverse pointer-events-none"
            style={{ animationDuration: '10s' }}
          />

          {/* Clustering data particles */}
          <div className="absolute inset-6 pointer-events-none">
            <span
              className="absolute top-2 left-1/2 w-2 h-2 rounded-full bg-[#E67E42] shadow-[0_0_8px_#e67e42] animate-ping"
              style={{ animationDuration: '1.8s' }}
            />
            <span
              className="absolute bottom-3 left-1/3 w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_8px_#2dd4bf] animate-ping"
              style={{ animationDuration: '2.2s', animationDelay: '0.4s' }}
            />
            <span
              className="absolute top-1/2 right-3 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24] animate-ping"
              style={{ animationDuration: '2s', animationDelay: '0.8s' }}
            />
          </div>

          {/* Optical Core */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#18324A] border-2 border-[#E67E42] shadow-[0_0_24px_rgba(230,126,66,0.3)] flex flex-col items-center justify-center p-3 text-center">
            {stage === 4 ? (
              <div className="animate-scale-in text-emerald-400">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-1 text-emerald-400 animate-bounce" />
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase">
                  READY
                </span>
              </div>
            ) : (
              <div className="space-y-1">
                {stage === 1 ? (
                  <Activity className="w-8 h-8 mx-auto text-[#E67E42] animate-pulse" />
                ) : stage === 3 ? (
                  <Brain className="w-8 h-8 mx-auto text-teal-300 animate-pulse" />
                ) : (
                  <Cpu className="w-8 h-8 mx-auto text-amber-300 animate-spin-slow" />
                )}
                <span className="text-[9px] font-mono tracking-widest text-[#DDE2E5]/80 uppercase block">
                  {stage === 3 ? 'CALIBRATING' : 'PROCESSING'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Classes trained badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          {classes.map((cls) => (
            <span
              key={cls.id}
              className="px-3 py-1 rounded-full bg-black/40 border border-white/10 text-xs font-mono font-bold flex items-center gap-1.5"
            >
              <span>{cls.icon}</span>
              <span>{cls.name}</span>
            </span>
          ))}
          <span className="text-xs font-mono text-[#DDE2E5]/60">
            ({totalSamples} total samples)
          </span>
        </div>

        {/* Proceed Action when Ready */}
        {stage === 4 && (
          <button
            onClick={() => {
              sound.playClick();
              onComplete();
            }}
            className="pressable px-8 py-4 bg-[#E67E42] hover:bg-[#d66e33] text-white font-display font-bold text-base rounded-2xl shadow-xl flex items-center justify-center gap-2 mx-auto animate-scale-in"
          >
            <span>ENTER LIVE PREDICTION CHAMBER</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default TrainingAnimation;
