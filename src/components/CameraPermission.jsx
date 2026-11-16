import React, { useState, useEffect } from 'react';
import {
  Camera,
  ShieldCheck,
  PlayCircle,
  AlertCircle,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Lock,
  ArrowRight,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { sound } from '../utils/sound';

/**
 * CameraPermission Component
 * Pre-permission briefing screen displaying:
 * - Headline: "READY TO USE THE CAMERA?"
 * - Subtitle: "Your camera lets you give the machine real examples to learn from."
 * - States: 'idle', 'requesting', 'active', 'denied', 'error'
 * - Buttons: ENABLE CAMERA, TRY AGAIN, OPEN IN NEW TAB, USE DEMO MODE
 */
export function CameraPermission({
  onEnableCamera,
  onUseDemoMode,
  cameraState = 'idle', // 'idle' | 'requesting' | 'active' | 'denied' | 'error'
  errorMessage = '',
  selectedPreset = null
}) {
  const [directUrl, setDirectUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isIframe, setIsIframe] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDirectUrl(window.location.href);
      setIsIframe(window.self !== window.top);
    }
  }, []);

  const handleCopyUrl = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(directUrl || window.location.href);
        setIsCopied(true);
        sound.playSuccess();
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch {
      // ignore
    }
  };

  const isRequesting = cameraState === 'requesting';
  const isDenied = cameraState === 'denied';
  const isError = cameraState === 'error';
  const isConnected = cameraState === 'active';

  return (
    <div className="max-w-2xl mx-auto my-8 p-6 sm:p-10 rounded-3xl bg-[#14293c] border-2 border-[#4E8585]/40 text-white shadow-2xl text-center relative overflow-hidden">
      {/* Background scientific blueprint grid */}
      <div className="absolute inset-0 bg-grid-pattern-dark opacity-30 pointer-events-none" />

      {/* Stage Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#E67E42]/15 border border-[#E67E42]/40 text-[#E67E42] text-xs font-mono font-bold tracking-wider uppercase mb-5">
        <Sparkles className="w-3.5 h-3.5" />
        <span>STAGE 02 · OPTICAL SENSOR SETUP</span>
      </div>

      {/* Main Status Icon */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 flex items-center justify-center">
        {isConnected ? (
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center shadow-lg animate-scale-in">
            <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400" />
          </div>
        ) : isDenied || isError ? (
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-rose-500/20 border-2 border-rose-400 text-rose-400 flex items-center justify-center shadow-lg">
            <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-rose-400" />
          </div>
        ) : (
          <>
            <div className="absolute inset-0 rounded-3xl bg-[#E67E42]/20 border border-[#E67E42]/50 animate-pulse pointer-events-none" />
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#18324A] border-2 border-[#E67E42] text-[#E67E42] flex items-center justify-center shadow-lg">
              <Camera className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
          </>
        )}
      </div>

      {/* Primary Headline */}
      <h2 className="font-display font-extrabold text-3xl sm:text-4xl uppercase tracking-tight text-white mb-2">
        {isConnected
          ? 'CAMERA CONNECTED ✅'
          : isDenied
          ? 'CAMERA ACCESS DENIED'
          : isError
          ? 'CAMERA UNAVAILABLE'
          : 'READY TO USE THE CAMERA?'}
      </h2>

      {/* Subtitle Prompt */}
      <p className="font-display text-base sm:text-lg font-semibold text-[#E67E42] mb-3">
        {isConnected
          ? 'Live stream established! Transitioning to data capture...'
          : '“Your camera lets you give the machine real examples to learn from.”'}
      </p>

      <p className="text-xs sm:text-sm text-[#DDE2E5]/80 max-w-lg mx-auto mb-6 leading-relaxed">
        The Pattern Engine reads raw video frames directly in your browser, extracting edge gradients and contours.
        Show your real items in front of the webcam to train your AI model.
      </p>

      {/* Target Classes Summary Preview */}
      {selectedPreset && (
        <div className="p-3.5 mb-6 bg-black/35 rounded-2xl border border-white/10 max-w-md mx-auto flex items-center justify-between text-xs font-mono">
          <span className="text-[#DDE2E5]/60 uppercase tracking-wider text-[11px]">
            CLASSES TO TEACH:
          </span>
          <div className="flex items-center gap-3 font-bold text-white">
            <span className="flex items-center gap-1 text-[#E67E42]">
              <span>{selectedPreset.classA.icon}</span>
              <span>{selectedPreset.classA.name}</span>
            </span>
            <span className="text-slate-400 font-normal">vs</span>
            <span className="flex items-center gap-1 text-teal-300">
              <span>{selectedPreset.classB.icon}</span>
              <span>{selectedPreset.classB.name}</span>
            </span>
          </div>
        </div>
      )}

      {/* Camera Denied / Error Feedback Box with Specific iFrame & Permission Resolution */}
      {(isDenied || isError) && (
        <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-amber-950/85 border-2 border-amber-500/60 text-left text-xs text-amber-200 flex flex-col gap-3 shadow-lg animate-scale-in">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1.5 flex-1">
              <strong className="block text-sm text-white font-bold tracking-wide">
                {isDenied ? 'Camera Permission Was Denied / Blocked' : 'Camera Unavailable'}
              </strong>
              <p className="text-amber-200/90 leading-relaxed text-xs">
                {errorMessage ||
                  (isDenied
                    ? 'Camera permission was denied. Please allow camera access in your browser settings or use Demo Mode.'
                    : 'No camera was detected on this device.')}
              </p>
            </div>
          </div>

          {/* Diagnostic Troubleshooting Steps */}
          <div className="p-3.5 bg-black/45 rounded-xl border border-white/10 space-y-2 text-[11px] text-[#DDE2E5]/90 font-mono">
            <div className="font-bold text-amber-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <span>⚡ WHY THIS HAPPENS & HOW TO FIX:</span>
            </div>

            <div className="space-y-1.5">
              <div className="p-2 rounded bg-amber-900/40 border border-amber-500/30">
                <span className="font-bold text-amber-200 block mb-0.5">
                  1. Embedded Preview iFrame (Most Common in Web IDEs):
                </span>
                <span>
                  Browsers strictly block camera prompts inside embedded preview frames. Opening in a standalone browser tab fixes this instantly.
                </span>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {directUrl && (
                    <a
                      href={directUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E67E42] hover:bg-[#d66e33] text-white font-bold text-xs shadow transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>OPEN IN NEW TAB NOW ↗</span>
                    </a>
                  )}

                  <button
                    onClick={handleCopyUrl}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#DDE2E5] text-xs font-semibold border border-white/15 transition-all"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>COPIED URL!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>COPY DIRECT URL</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <strong>2. Browser Address Bar:</strong> Click the <strong>Camera 🎥 or Lock 🔒 icon</strong> at the left of your URL bar and change Camera to <strong>"Allow"</strong>, then click Try Again.
              </div>

              <div>
                <strong>3. System Permissions:</strong> Ensure your OS (macOS System Settings → Privacy & Security → Camera or Windows Settings → Camera) has enabled Camera for your browser.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-6">
        {isConnected ? (
          <div className="px-6 py-3.5 bg-emerald-600/30 border border-emerald-400 text-emerald-300 font-mono text-xs rounded-xl flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span>ACTIVATING SENSOR VIEWPORT...</span>
          </div>
        ) : isDenied || isError ? (
          <>
            {directUrl && isIframe && (
              <a
                href={directUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pressable w-full sm:w-auto px-6 py-4 bg-[#E67E42] hover:bg-[#d66e33] text-white font-display font-bold text-sm sm:text-base rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              >
                <ExternalLink className="w-4 h-4" />
                <span>OPEN IN NEW TAB ↗</span>
              </a>
            )}

            <button
              onClick={() => {
                sound.playClick();
                onEnableCamera();
              }}
              disabled={isRequesting}
              className="pressable w-full sm:w-auto px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-display font-bold text-sm sm:text-base rounded-2xl border border-white/15 flex items-center justify-center gap-2.5 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isRequesting ? 'animate-spin' : ''}`} />
              <span>{isRequesting ? 'REQUESTING CAMERA...' : 'TRY AGAIN'}</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onUseDemoMode();
              }}
              className="pressable w-full sm:w-auto px-6 py-4 bg-teal-700/60 hover:bg-teal-700 text-white font-semibold text-sm rounded-2xl border border-teal-500/40 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            >
              <PlayCircle className="w-4 h-4 text-teal-300" />
              <span>USE DEMO MODE</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => {
                sound.playClick();
                onEnableCamera();
              }}
              disabled={isRequesting}
              className={`pressable w-full sm:w-auto px-8 py-4 font-display font-bold text-base rounded-2xl shadow-xl flex items-center justify-center gap-2.5 transition-all ${
                isRequesting
                  ? 'bg-[#E67E42]/80 text-white cursor-wait'
                  : 'bg-[#E67E42] hover:bg-[#d66e33] text-white hover:scale-[1.02]'
              }`}
            >
              {isRequesting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>REQUESTING CAMERA...</span>
                </>
              ) : (
                <>
                  <Camera className="w-5 h-5" />
                  <span>ENABLE CAMERA</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onUseDemoMode();
              }}
              className="pressable w-full sm:w-auto px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-2xl border border-white/15 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            >
              <PlayCircle className="w-4 h-4 text-teal-300" />
              <span>USE DEMO MODE</span>
            </button>
          </>
        )}
      </div>

      {/* Safety & Local Browser Notice */}
      <div className="pt-4 border-t border-white/10 flex items-center justify-center gap-2 text-xs text-emerald-400 font-mono">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>100% In-Browser: Real camera stream runs in local memory only. Never uploaded to servers.</span>
      </div>
    </div>
  );
}

export default CameraPermission;
