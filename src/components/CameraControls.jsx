import React, { useEffect } from 'react';
import {
  Camera,
  RefreshCw,
  EyeOff,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Video,
  Radio
} from 'lucide-react';
import { sound } from '../utils/sound';

/**
 * CameraControls Component
 * Provides a high-visibility, tactile capture interface for visitors:
 * - Huge Primary Shutter / Record Button with visual feedback
 * - Support for both Single Frame Snapshots and 1.5s Dynamic Sequences
 * - Progress counter: e.g. 3 of 5 examples captured
 * - Spacebar keyboard shortcut for hands-free capture
 * - Camera utility buttons (Reset / Switch)
 */
export function CameraControls({
  capturedCount = 0,
  targetCount = 5,
  activeClass = null,
  isLive = false,
  isDemoMode = false,
  isDynamicAction = false,
  isRecordingSequence = false,
  recordingProgress = 0,
  onCaptureOnce = null,
  onRecordSequence = null,
  onResetCamera = null,
  onStopCamera = null,
  onSwitchClass = null,
  onProceedToTrain = null,
  nextClassLabel = null,
  canAdvance = false,
  className = ''
}) {
  const isTargetMet = capturedCount >= targetCount;
  const progressPercent = Math.min(100, Math.round((capturedCount / targetCount) * 100));

  const classNameUpper = (activeClass?.name || '').toUpperCase().trim();
  const icon = activeClass?.icon || '';
  const isWaving = classNameUpper.includes('WAVE') || icon === '👋';
  const isClapping = classNameUpper.includes('CLAP') || icon === '👏';
  const isDynamic =
    Boolean(isDynamicAction) ||
    isWaving ||
    isClapping ||
    classNameUpper.includes('WALK') ||
    classNameUpper.includes('DANCE') ||
    classNameUpper.includes('JUMP') ||
    classNameUpper.includes('MOTION');

  // Enable Spacebar shortcut for effortless hands-free capturing/recording
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        if (isDynamic && onRecordSequence && !isRecordingSequence) {
          onRecordSequence();
        } else if (onCaptureOnce && !isRecordingSequence) {
          onCaptureOnce();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDynamic, onRecordSequence, onCaptureOnce, isRecordingSequence]);

  return (
    <div className={`w-full flex flex-col gap-3.5 pt-1 ${className}`}>
      {/* Primary Capture Action Area */}
      <div className="w-full p-4 sm:p-5 rounded-2xl bg-[#14293c] border-2 border-white/10 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-white relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#E67E42]/10 via-transparent to-teal-500/10 pointer-events-none" />

        {/* Left: Teaching Class Status & Progress Bar */}
        <div className="flex-1 w-full sm:w-auto text-center sm:text-left space-y-1.5 relative z-10">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">
              TEACHING:
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-white/10 text-white font-display font-bold text-sm">
              <span>{activeClass?.icon || '👋'}</span>
              <span>{activeClass?.name || 'WAVING'}</span>
            </span>
            {isDynamic && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                1.5s RECORDING
              </span>
            )}
          </div>

          <p className="text-xs text-slate-300">
            {isWaving
              ? 'Wave your hand back and forth continuously while recording 1.5s of motion.'
              : isClapping
              ? 'Clap your hands together repeatedly while recording 1.5s of motion.'
              : isDynamic
              ? 'Perform your motion continuously while recording a 1.5s sample.'
              : 'Strike your pose or gesture in front of the lens, then press Capture below.'}
          </p>

          {/* Progress Bar & Counter */}
          <div className="flex items-center justify-center sm:justify-start gap-2.5 pt-1">
            <div className="w-32 h-2.5 rounded-full bg-black/40 overflow-hidden border border-white/10">
              <div
                className={`h-full transition-all duration-300 ${
                  isTargetMet
                    ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                    : 'bg-[#E67E42]'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="font-mono text-xs font-bold text-white">
              {capturedCount} / {targetCount} examples
            </span>
            {isTargetMet && (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 inline shrink-0" />
            )}
          </div>
        </div>

        {/* Center / Right: Big Tactile Capture / Record Button */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto relative z-10">
          {isDynamic ? (
            /* 1.5s Motion Sequence Record Button */
            <button
              type="button"
              onClick={() => {
                if (!isRecordingSequence && onRecordSequence) {
                  onRecordSequence();
                }
              }}
              disabled={isRecordingSequence}
              className={`pressable w-full sm:w-auto px-7 py-4 rounded-2xl font-display font-extrabold text-sm sm:text-base uppercase tracking-wider flex items-center justify-center gap-3 shadow-2xl transition-all cursor-pointer ${
                isRecordingSequence
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-[#E67E42] hover:bg-[#d66e33] text-white hover:scale-105 shadow-[0_4px_20px_rgba(230,126,66,0.4)]'
              }`}
            >
              {isRecordingSequence ? (
                <>
                  <Radio className="w-5 h-5 text-white animate-spin" />
                  <span>
                    RECORDING {isWaving ? 'WAVE' : isClapping ? 'CLAP' : 'MOTION'} (
                    {Math.round(recordingProgress)}%)...
                  </span>
                </>
              ) : (
                <>
                  <Video className="w-5 h-5 text-white" />
                  <span>
                    {isWaving
                      ? 'START RECORDING (1.5s WAVE)'
                      : isClapping
                      ? 'START RECORDING (1.5s CLAP)'
                      : 'START RECORDING (1.5s MOTION)'}
                  </span>
                </>
              )}
            </button>
          ) : (
            /* High-Contrast Shutter Capture Button */
            <button
              type="button"
              onClick={() => {
                if (onCaptureOnce) {
                  onCaptureOnce();
                }
              }}
              className="pressable w-full sm:w-auto px-8 py-4 bg-[#E67E42] hover:bg-[#d66e33] text-white rounded-2xl font-display font-extrabold text-base sm:text-lg uppercase tracking-wider flex items-center justify-center gap-3 shadow-2xl shadow-[0_4px_25px_rgba(230,126,66,0.5)] transition-all hover:scale-105 active:scale-95 cursor-pointer border border-[#E67E42]/50 group"
            >
              <div className="w-7 h-7 rounded-full bg-white text-[#E67E42] flex items-center justify-center shadow group-hover:scale-110 transition-transform">
                <Camera className="w-4 h-4 text-[#E67E42]" />
              </div>
              <span>CAPTURE PHOTO</span>
            </button>
          )}

          {/* Quick Spacebar Hint Pill */}
          <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-black/30 px-2 py-1 rounded border border-white/5">
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-bold">Space</kbd>
            <span>{isDynamic ? 'to record' : 'to snap'}</span>
          </span>
        </div>
      </div>

      {/* Bottom Utility Bar (Switch Class, Reset Camera) */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-2 text-xs font-mono">
        <div className="flex items-center gap-2">
          {onSwitchClass && (
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onSwitchClass();
              }}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>{nextClassLabel || 'Switch to Next Class'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#E67E42]" />
            </button>
          )}

          {onProceedToTrain && canAdvance && (
            <button
              type="button"
              onClick={() => {
                sound.playSuccess();
                onProceedToTrain();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition-all shadow-md animate-pulse cursor-pointer"
            >
              <span>READY TO TRAIN ➔</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onResetCamera && !isDemoMode && (
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onResetCamera();
              }}
              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
              title="Reset webcam connection"
            >
              <RefreshCw className="w-3 h-3 text-[#E67E42]" />
              <span>RESET WEBCAM</span>
            </button>
          )}

          {onStopCamera && isLive && !isDemoMode && (
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onStopCamera();
              }}
              className="px-2 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 flex items-center gap-1 transition-colors"
              title="Release camera"
            >
              <EyeOff className="w-3 h-3" />
              <span>OFF</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CameraControls;
