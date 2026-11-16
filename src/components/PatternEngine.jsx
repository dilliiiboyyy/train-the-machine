import React from 'react';
import { Cpu, Activity, Disc, Zap, Radio, Layers } from 'lucide-react';

/**
 * The Pattern Engine: Experimental Processing Core
 * Concentric layers:
 * 1. OUTER RING: "INPUT" stream with data tick marks & orbital particles
 * 2. MIDDLE RING: "FEATURES" matrix with digital gauges
 * 3. INNER CORE: "PATTERN" cluster with active pulsating neural nodes
 * 4. OUTPUT RING: "PREDICTION" vector
 */
export function PatternEngine({
  state = 'IDLE', // 'IDLE' | 'COLLECTING' | 'TRAINING' | 'READY' | 'PREDICTING'
  classA,
  classB,
  prediction,
  sampleCountA = 0,
  sampleCountB = 0,
  compact = false
}) {
  const isIdle = state === 'IDLE';
  const isCollecting = state === 'COLLECTING';
  const isTraining = state === 'TRAINING';
  const isReady = state === 'READY';
  const isPredicting = state === 'PREDICTING';

  // State styling helper
  const stateColor = {
    IDLE: 'text-[#DDE2E5]',
    COLLECTING: 'text-[#E67E42]',
    TRAINING: 'text-[#E67E42]',
    READY: 'text-emerald-400',
    PREDICTING: 'text-teal-300'
  }[state] || 'text-[#DDE2E5]';

  const stateBg = {
    IDLE: 'bg-white/5 border-white/10',
    COLLECTING: 'bg-[#E67E42]/15 border-[#E67E42]/40',
    TRAINING: 'bg-[#E67E42]/20 border-[#E67E42] animate-pulse',
    READY: 'bg-emerald-950/40 border-emerald-500/40',
    PREDICTING: 'bg-teal-950/40 border-teal-500/40'
  }[state] || 'bg-white/5 border-white/10';

  const totalSamples = sampleCountA + sampleCountB;

  return (
    <div
      className={`relative rounded-3xl bg-[#14293c] border-2 border-white/10 text-white shadow-2xl overflow-hidden flex flex-col items-center justify-between ${
        compact ? 'p-4 max-w-sm' : 'p-6 sm:p-8 max-w-lg w-full'
      }`}
    >
      {/* Background scientific radar / grid overlay */}
      <div className="absolute inset-0 bg-grid-pattern-dark opacity-30 pointer-events-none" />

      {/* Top Header & Telemetry */}
      <div className="w-full flex items-center justify-between z-10 border-b border-white/10 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#E67E42]/20 border border-[#E67E42]/40 flex items-center justify-center text-[#E67E42]">
            <Cpu className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="font-display font-bold text-xs sm:text-sm tracking-wider uppercase text-white leading-tight">
              THE PATTERN ENGINE
            </h3>
            <span className="text-[10px] font-mono text-[#DDE2E5]/60 block">
              BROWSER NEURAL CORE · v2.6
            </span>
          </div>
        </div>

        {/* State Badge */}
        <div className={`px-2.5 py-1 rounded-md border text-[11px] font-mono font-bold flex items-center gap-1.5 ${stateBg}`}>
          <span
            className={`w-2 h-2 rounded-full ${
              isReady
                ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                : isTraining
                ? 'bg-[#E67E42] animate-ping'
                : isPredicting
                ? 'bg-teal-300 animate-pulse'
                : isCollecting
                ? 'bg-[#E67E42]'
                : 'bg-slate-400'
            }`}
          />
          <span className={stateColor}>{state}</span>
        </div>
      </div>

      {/* CIRCULAR PROCESSING CORE (SVG + CSS ANIMATIONS) */}
      <div className="relative w-64 h-64 sm:w-80 sm:h-80 my-2 flex items-center justify-center">
        {/* Ambient glow behind core when active */}
        <div
          className={`absolute inset-4 rounded-full filter blur-2xl transition-all duration-700 pointer-events-none ${
            isPredicting
              ? 'bg-teal-500/25'
              : isTraining
              ? 'bg-[#E67E42]/30 scale-105'
              : isReady
              ? 'bg-emerald-500/20'
              : 'bg-white/5'
          }`}
        />

        {/* LAYER 1: OUTER RING ("INPUT STREAM") */}
        <div
          className={`absolute inset-0 rounded-full border border-dashed transition-all duration-700 ${
            isPredicting || isTraining
              ? 'border-[#E67E42]/60 animate-spin-slow'
              : isCollecting
              ? 'border-[#E67E42]/40 animate-spin-slow'
              : 'border-white/15'
          }`}
        />

        {/* Outer Ring Tick Marks & Measurement Points */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 320 320">
          <circle
            cx="160"
            cy="160"
            r="150"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1.5"
          />
          {/* Circular tick marks */}
          {Array.from({ length: 24 }).map((_, idx) => {
            const angle = (idx * 360) / 24;
            const rad = (angle * Math.PI) / 180;
            const x1 = 160 + Math.cos(rad) * 144;
            const y1 = 160 + Math.sin(rad) * 144;
            const x2 = 160 + Math.cos(rad) * 152;
            const y2 = 160 + Math.sin(rad) * 152;
            return (
              <line
                key={idx}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={idx % 6 === 0 ? '#E67E42' : 'rgba(255,255,255,0.2)'}
                strokeWidth={idx % 6 === 0 ? '2' : '1'}
              />
            );
          })}

          {/* Floating Data Particles in Outer Ring */}
          {(isTraining || isPredicting || isCollecting) && (
            <>
              <circle cx="160" cy="10" r="3.5" fill="#E67E42" className="animate-ping" />
              <circle cx="310" cy="160" r="3.5" fill="#4E8585" className="animate-pulse" />
              <circle cx="160" cy="310" r="3" fill="#E67E42" />
              <circle cx="10" cy="160" r="3" fill="#4E8585" />
            </>
          )}

          {/* Output Vector Beam (Active during prediction) */}
          {isPredicting && prediction && (
            <line
              x1="160"
              y1="160"
              x2={prediction.predictedClassId === 'classA' ? '60' : '260'}
              y2="60"
              stroke="#34d399"
              strokeWidth="2.5"
              strokeDasharray="4 4"
            />
          )}
        </svg>

        {/* LAYER 2: MIDDLE RING ("FEATURE EXTRACTION MATRIX") */}
        <div
          className={`absolute inset-8 sm:inset-10 rounded-full border-2 transition-all duration-500 flex items-center justify-center ${
            isTraining
              ? 'border-amber-400/80 animate-spin-reverse'
              : isPredicting
              ? 'border-teal-400/70 animate-spin-reverse'
              : isReady
              ? 'border-emerald-400/40'
              : 'border-white/15'
          }`}
        >
          {/* Feature Ring Indicator Badges */}
          <div className="absolute top-1 text-[9px] font-mono text-[#DDE2E5]/50 tracking-widest uppercase">
            INPUT STREAM
          </div>
          <div className="absolute bottom-1 text-[9px] font-mono text-[#DDE2E5]/50 tracking-widest uppercase">
            FEATURE MATRIX
          </div>
        </div>

        {/* LAYER 3: INNER CORE ("PATTERN CLUSTER") */}
        <div
          className={`relative w-28 h-28 sm:w-36 sm:h-36 rounded-full border-2 flex flex-col items-center justify-center p-2 text-center transition-all duration-500 z-10 ${
            isPredicting
              ? 'bg-[#18324A] border-teal-400 shadow-[0_0_25px_rgba(78,133,133,0.5)]'
              : isTraining
              ? 'bg-[#18324A] border-[#E67E42] scale-110 shadow-[0_0_25px_rgba(230,126,66,0.6)]'
              : isReady
              ? 'bg-[#18324A] border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.3)]'
              : isCollecting
              ? 'bg-[#18324A] border-[#E67E42]/60'
              : 'bg-[#18324A] border-white/20'
          }`}
        >
          {/* Core Symbol / Icon */}
          <div className="mb-0.5">
            {isPredicting ? (
              <Zap className="w-6 h-6 text-teal-300 animate-bounce" />
            ) : isTraining ? (
              <Layers className="w-6 h-6 text-[#E67E42] animate-spin" />
            ) : isReady ? (
              <Radio className="w-6 h-6 text-emerald-400 animate-pulse" />
            ) : (
              <Disc className="w-6 h-6 text-[#DDE2E5]/60" />
            )}
          </div>

          <span className="font-display font-extrabold text-xs sm:text-sm text-white tracking-wider">
            {isPredicting ? 'PREDICTING' : isTraining ? 'LEARNING' : isReady ? 'MODEL READY' : 'IDLE CORE'}
          </span>

          <span className="text-[10px] font-mono text-[#DDE2E5]/70 mt-0.5">
            {totalSamples > 0 ? `${totalSamples} SAMPLES` : 'AWAITING DATA'}
          </span>
        </div>
      </div>

      {/* BOTTOM TELEMETRY / SIGNAL BARS */}
      <div className="w-full mt-3 pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-xs font-mono z-10">
        {/* Class A Telemetry */}
        <div className="p-2 rounded-lg bg-black/30 border border-white/5">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-white flex items-center gap-1">
              <span>{classA?.icon || 'A'}</span>
              <span className="truncate max-w-[80px]">{classA?.name || 'Class A'}</span>
            </span>
            <span className="text-[#E67E42] font-bold">{sampleCountA}</span>
          </div>
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#E67E42] h-full transition-all duration-300"
              style={{ width: `${Math.min(100, (sampleCountA / 10) * 100)}%` }}
            />
          </div>
        </div>

        {/* Class B Telemetry */}
        <div className="p-2 rounded-lg bg-black/30 border border-white/5">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-white flex items-center gap-1">
              <span>{classB?.icon || 'B'}</span>
              <span className="truncate max-w-[80px]">{classB?.name || 'Class B'}</span>
            </span>
            <span className="text-[#4E8585] font-bold">{sampleCountB}</span>
          </div>
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#4E8585] h-full transition-all duration-300"
              style={{ width: `${Math.min(100, (sampleCountB / 10) * 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
