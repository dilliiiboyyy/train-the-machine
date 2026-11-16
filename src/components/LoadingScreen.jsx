import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, CheckCircle2, Cpu, ShieldCheck } from 'lucide-react';
import { sound } from '../utils/sound';
import { classifier } from '../ml/model';
import { CLASS_PRESETS } from '../data/presets';

/**
 * LoadingScreen Component
 * Appears exclusively on initial application load.
 * Displays an animated Pattern Engine showing:
 * INPUT ➔ DATA ➔ LEARNING ➔ READY
 * Connects to real hardware/model initialization with a smooth reveal transition.
 */
export function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('input'); // 'input' | 'data' | 'learning' | 'ready'
  const [statusText, setStatusText] = useState('INITIALIZING... 0%');
  const [isExiting, setIsExiting] = useState(false);

  // Check for reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    let isCancelled = false;
    const startTime = performance.now();
    const minDurationMs = prefersReducedMotion ? 600 : 1900;
    const maxSafetyTimeoutMs = 3800;

    // Real Initialization Tasks
    const performRealInit = async () => {
      try {
        // 1. Warm audio synthesis context (non-blocking)
        if (sound && sound.playEnginePulse) {
          sound.playEnginePulse(220, 0.05);
        }

        // 2. Pre-initialize classifier default classes
        if (classifier && CLASS_PRESETS && CLASS_PRESETS[0]) {
          classifier.setClasses(CLASS_PRESETS[0].classA, CLASS_PRESETS[0].classB);
        }

        // 3. Check browser media capabilities
        if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
          // Verify presence of getUserMedia without requesting permission yet
          const hasSupport = typeof navigator.mediaDevices.getUserMedia === 'function';
          if (!hasSupport) {
            console.info('Camera API check: mediaDevices supported');
          }
        }
      } catch (err) {
        console.warn('Non-blocking initialization check:', err);
      }
    };

    performRealInit();

    // Smooth progress ticker
    const timerInterval = setInterval(() => {
      if (isCancelled) return;

      const elapsed = performance.now() - startTime;
      const progressFraction = Math.min(1, elapsed / minDurationMs);
      const currentPct = Math.round(progressFraction * 100);

      setProgress(currentPct);

      if (currentPct < 28) {
        setStage('input');
        setStatusText(`INITIALIZING... ${currentPct}%`);
      } else if (currentPct < 62) {
        setStage('data');
        setStatusText(`LOADING CAMERA SYSTEM... ${currentPct}%`);
      } else if (currentPct < 96) {
        setStage('learning');
        setStatusText(`PREPARING AI MODEL... ${currentPct}%`);
      } else {
        setStage('ready');
        setStatusText('PATTERN ENGINE READY');
      }

      if (progressFraction >= 1) {
        clearInterval(timerInterval);
        // Play gentle completion sound
        try {
          sound.playSuccess();
        } catch {
          // ignore
        }

        // Hold "READY" briefly for 350ms, then trigger smooth transition
        setTimeout(() => {
          if (!isCancelled) {
            setIsExiting(true);
            // Allow CSS transition to finish before unmounting
            setTimeout(() => {
              if (!isCancelled && onComplete) {
                onComplete();
              }
            }, 650);
          }
        }, 380);
      }
    }, 28);

    // Hard fallback safety timer to ensure loading screen never gets stuck
    const safetyTimer = setTimeout(() => {
      if (!isCancelled && !isExiting) {
        setIsExiting(true);
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 300);
      }
    }, maxSafetyTimeoutMs);

    return () => {
      isCancelled = true;
      clearInterval(timerInterval);
      clearTimeout(safetyTimer);
    };
  }, [onComplete, prefersReducedMotion]);

  // Stage steps metadata
  const stages = [
    { id: 'input', label: 'INPUT' },
    { id: 'data', label: 'DATA' },
    { id: 'learning', label: 'LEARNING' },
    { id: 'ready', label: 'READY' }
  ];

  const currentStageIndex =
    stage === 'ready' ? 3 : stage === 'learning' ? 2 : stage === 'data' ? 1 : 0;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Preparing the Pattern Engine"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#14293c] text-[#F7F3EA] overflow-hidden select-none transition-all duration-700 ease-out ${
        isExiting
          ? 'opacity-0 scale-[1.02] pointer-events-none'
          : 'opacity-100 scale-100'
      }`}
    >
      {/* Background scientific blueprint grid */}
      <div className="absolute inset-0 bg-grid-pattern-dark opacity-35 pointer-events-none" />

      {/* Subtle radial ambient vignette in brand navy & orange */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(230, 126, 66, 0.08) 0%, rgba(20, 41, 60, 0.6) 60%, rgba(15, 30, 44, 0.95) 100%)'
        }}
      />

      <div className="relative z-10 max-w-xl mx-auto px-6 flex flex-col items-center text-center space-y-6 sm:space-y-8">
        {/* Top Metadata Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#DDE2E5]/80 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-[#E67E42] animate-pulse" />
            <span>IT EXHIBITION · AI SCIENCE LAB</span>
          </div>

          <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl tracking-tight text-white uppercase leading-none">
            TRAIN THE <span className="text-[#E67E42]">MACHINE</span>
          </h1>

          <p className="font-display text-sm sm:text-base text-[#DDE2E5]/90 font-medium tracking-wide">
            “Preparing the Pattern Engine...”
          </p>
        </div>

        {/* 4-Stage Horizontal Pipeline: INPUT ➔ DATA ➔ LEARNING ➔ READY */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-3 text-[11px] sm:text-xs font-mono">
          {stages.map((stg, idx) => {
            const isActive = idx <= currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            return (
              <React.Fragment key={stg.id}>
                <div
                  className={`px-3 py-1 rounded-lg border transition-all duration-300 flex items-center gap-1.5 ${
                    isCurrent
                      ? 'bg-[#E67E42] text-white border-[#E67E42] font-bold shadow-[0_0_12px_rgba(230,126,66,0.4)] scale-105'
                      : isActive
                      ? 'bg-[#4E8585]/30 text-teal-200 border-[#4E8585]/60 font-medium'
                      : 'bg-white/5 text-[#DDE2E5]/40 border-white/5'
                  }`}
                >
                  {isActive && idx < currentStageIndex ? (
                    <span className="text-emerald-400 text-[10px]">✓</span>
                  ) : isCurrent ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  ) : (
                    <span className="text-[10px] text-white/30">0{idx + 1}</span>
                  )}
                  <span>{stg.label}</span>
                </div>
                {idx < stages.length - 1 && (
                  <span
                    className={`transition-colors duration-300 text-xs ${
                      idx < currentStageIndex ? 'text-[#E67E42]' : 'text-white/20'
                    }`}
                  >
                    ➔
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* CENTRAL ANIMATED PATTERN ENGINE (Scientific Apparatus) */}
        <div className="relative w-52 h-52 sm:w-64 sm:h-64 flex items-center justify-center my-2">
          {/* Outer Ring: Rotating Ticks */}
          <div
            className="absolute inset-0 rounded-full border border-dashed border-white/20 animate-spin-slow pointer-events-none"
            style={{ animationDuration: '28s' }}
          />

          {/* Calibrated Tick Marks on Outer Perimeter */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
          >
            {Array.from({ length: 24 }).map((_, i) => {
              const angle = (i * 360) / 24;
              const isAccent = i % 6 === 0;
              return (
                <line
                  key={i}
                  x1="50"
                  y1="3"
                  x2="50"
                  y2={isAccent ? "7" : "5"}
                  stroke={isAccent ? "#E67E42" : "rgba(221, 226, 229, 0.25)"}
                  strokeWidth={isAccent ? "1" : "0.5"}
                  transform={`rotate(${angle} 50 50)`}
                />
              );
            })}
          </svg>

          {/* Middle Ring: Segmented Rotating Arcs */}
          <div
            className="absolute inset-4 rounded-full border-2 border-t-[#E67E42] border-r-transparent border-b-[#4E8585] border-l-transparent animate-spin-reverse pointer-events-none"
            style={{ animationDuration: '14s' }}
          />

          {/* Inward Inflow Particles (Small data points streaming toward center) */}
          <div className="absolute inset-8 pointer-events-none">
            {/* Particle 1 */}
            <div
              className="absolute top-1 left-1/2 w-2 h-2 rounded-full bg-[#E67E42] shadow-[0_0_8px_#e67e42] animate-ping"
              style={{ animationDuration: '2.4s', animationDelay: '0s' }}
            />
            {/* Particle 2 */}
            <div
              className="absolute bottom-2 left-1/3 w-1.5 h-1.5 rounded-full bg-teal-300 shadow-[0_0_8px_#5eead4] animate-ping"
              style={{ animationDuration: '2.8s', animationDelay: '0.6s' }}
            />
            {/* Particle 3 */}
            <div
              className="absolute top-1/2 right-2 w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_8px_#fcd34d] animate-ping"
              style={{ animationDuration: '2.1s', animationDelay: '1.1s' }}
            />
          </div>

          {/* Inner Optical Core Container */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#18324A] border-2 border-[#E67E42]/60 shadow-[0_0_24px_rgba(230,126,66,0.25)] flex flex-col items-center justify-center p-3 text-center overflow-hidden">
            {/* Radial Core Pulse */}
            <div
              className={`absolute inset-0 bg-radial from-[#E67E42]/20 to-transparent transition-opacity duration-500 ${
                stage === 'ready' ? 'opacity-100 animate-pulse' : 'opacity-40'
              }`}
            />

            {/* Neural Cluster Matrix (3x3 dot pattern) */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-1.5 relative z-10">
              {Array.from({ length: 9 }).map((_, i) => {
                const isActive =
                  stage === 'ready' ||
                  (stage === 'learning' && i <= 6) ||
                  (stage === 'data' && i <= 3) ||
                  i === 4;
                return (
                  <span
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      isActive
                        ? stage === 'ready'
                          ? 'bg-emerald-400 shadow-[0_0_6px_#34d399] scale-125'
                          : 'bg-[#E67E42] shadow-[0_0_5px_#e67e42]'
                        : 'bg-white/20'
                    }`}
                  />
                );
              })}
            </div>

            {/* Engine Internal State Label */}
            <span
              className={`text-[9px] font-mono tracking-widest uppercase font-bold relative z-10 transition-colors ${
                stage === 'ready' ? 'text-emerald-400' : 'text-[#E67E42]'
              }`}
            >
              {stage === 'ready' ? 'READY' : 'INITIALIZING'}
            </span>
          </div>

          {/* Scientific Corner Reticle Accents */}
          <div className="absolute top-1 left-1 w-3 h-3 border-t border-l border-[#E67E42]/60 pointer-events-none" />
          <div className="absolute top-1 right-1 w-3 h-3 border-t border-r border-[#E67E42]/60 pointer-events-none" />
          <div className="absolute bottom-1 left-1 w-3 h-3 border-b border-l border-[#E67E42]/60 pointer-events-none" />
          <div className="absolute bottom-1 right-1 w-3 h-3 border-b border-r border-[#E67E42]/60 pointer-events-none" />
        </div>

        {/* Clean Animated Progress Bar & Telemetry */}
        <div className="w-full max-w-xs space-y-2">
          {/* Status Label */}
          <div className="flex items-center justify-between text-xs font-mono">
            <span
              className={`font-semibold tracking-wide transition-colors ${
                stage === 'ready' ? 'text-emerald-400' : 'text-white'
              }`}
            >
              {statusText}
            </span>
            <span className="text-[#DDE2E5]/60 tabular-nums">
              {progress}%
            </span>
          </div>

          {/* Progress Bar Track */}
          <div className="w-full h-2 rounded-full bg-black/50 border border-white/10 p-0.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-200 ease-out ${
                stage === 'ready'
                  ? 'bg-gradient-to-r from-[#E67E42] via-teal-400 to-emerald-400 shadow-[0_0_10px_#34d399]'
                  : 'bg-gradient-to-r from-[#E67E42] to-amber-400 shadow-[0_0_8px_rgba(230,126,66,0.6)]'
              }`}
              style={{ width: `${Math.max(4, progress)}%` }}
            />
          </div>

          <p className="text-[11px] font-mono text-[#DDE2E5]/60 pt-1">
            Browser Machine Learning · Hardware Accelerated
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;
