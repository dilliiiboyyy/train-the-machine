import React, { useState } from 'react';
import { Terminal, Sliders, ChevronDown, ChevronUp, Eye, ShieldAlert } from 'lucide-react';
import { actionClassifier } from '../ml/actionClassifier';

/**
 * DeveloperDebugPanel Component
 * Exhibition diagnostic panel for tuning thresholds, observing real-time FPS,
 * frame windows, landmarks count, and classification distances.
 */
export function DeveloperDebugPanel({
  perceptionData,
  windowLength = 0,
  currentPrediction,
  classes = [],
  dataset = {},
  fps = 0,
  latencyMs = 0,
  cameraState = 'idle',
  cameraSensors = null
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [threshold, setThreshold] = useState(0.68);

  const handleThresholdChange = (e) => {
    const val = parseFloat(e.target.value);
    setThreshold(val);
    actionClassifier.setRejectionThreshold(val);
  };

  return (
    <div className="fixed bottom-3 right-3 z-50 font-mono text-xs select-none">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-2.5 py-1.5 rounded-lg bg-[#14293c]/90 text-[#DDE2E5] border border-white/20 hover:bg-[#18324A] shadow-xl flex items-center gap-1.5 transition-all text-[11px]"
      >
        <Terminal className="w-3.5 h-3.5 text-[#E67E42]" />
        <span>DEV MODE</span>
        {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
      </button>

      {/* Expanded Panel */}
      {isOpen && (
        <div className="mt-2 w-80 max-h-96 overflow-y-auto rounded-2xl bg-[#0c1a26]/95 border-2 border-[#E67E42]/60 p-4 text-[#F7F3EA] shadow-2xl backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-bold text-[#E67E42] flex items-center gap-1">
              <span>⚙️</span>
              <span>ENGINE DIAGNOSTICS</span>
            </span>
            <span className="text-[10px] text-emerald-400">
              {fps} FPS ({latencyMs}ms)
            </span>
          </div>

          {/* Perception State */}
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Camera State:</span>
              <span className="font-bold text-white uppercase">{cameraState}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Person Detected:</span>
              <span className={perceptionData?.hasPerson ? 'text-emerald-400' : 'text-rose-400'}>
                {perceptionData?.hasPerson ? 'YES' : 'NO'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Pose Landmarks:</span>
              <span className="text-white">
                {perceptionData?.poseLandmarks?.length || 0} joints
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Hand Tracked:</span>
              <span className={perceptionData?.hasHands ? 'text-teal-300' : 'text-slate-500'}>
                {perceptionData?.hasHands ? perceptionData?.gesture || 'DETECTED' : 'NONE'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Full Body vs Face:</span>
              <span className="text-amber-300">
                {perceptionData?.isFaceOnly ? 'FACE ONLY' : 'FULL BODY'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Temporal Window:</span>
              <span className="text-white">{windowLength} frames</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Tracked Pixels:</span>
              <span className="text-teal-300 font-bold">
                {perceptionData?.trackedPixelCount
                  ? `${perceptionData.trackedPixelCount.toLocaleString()} px`
                  : 'Active (HD)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Pixel Resolution:</span>
              <span className="text-amber-300 font-mono">
                {perceptionData?.pixelResolution || '320x240 HD'}
              </span>
            </div>

            {/* Real-Time Optical & Hardware Camera Sensors */}
            {cameraSensors && (
              <div className="pt-2 border-t border-white/10 space-y-1">
                <span className="text-amber-400 block text-[10px] uppercase font-bold flex items-center gap-1">
                  <span>📡</span>
                  <span>CAMERA SENSORS (REAL-TIME)</span>
                </span>
                <div className="flex justify-between">
                  <span className="text-slate-400">Light / Lux Sensor:</span>
                  <span className="font-bold" style={{ color: cameraSensors.light?.color }}>
                    {cameraSensors.light?.label || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Focus / Sharpness:</span>
                  <span className="font-bold" style={{ color: cameraSensors.focus?.color }}>
                    {cameraSensors.focus?.label || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Motion / Shake Sensor:</span>
                  <span className="font-bold" style={{ color: cameraSensors.motion?.color }}>
                    {cameraSensors.motion?.label || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Color Temperature:</span>
                  <span className="text-teal-300">
                    {cameraSensors.stream?.colorTemp || 'Balanced (5500K)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Hardware Sensor FPS:</span>
                  <span className="text-emerald-400 font-mono font-bold">
                    {cameraSensors.stream?.fps} FPS ({cameraSensors.stream?.resolution})
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Model & Classification State */}
          <div className="pt-2 border-t border-white/10 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Active Prediction:</span>
              <span className="font-bold text-[#E67E42]">
                {currentPrediction?.prediction || currentPrediction?.message || 'IDLE'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Match Score:</span>
              <span className="font-bold text-white">
                {currentPrediction?.matchScore ?? 0}%
              </span>
            </div>
          </div>

          {/* Dataset counts */}
          <div className="pt-2 border-t border-white/10 space-y-1 text-[11px]">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">
              Samples Per Class:
            </span>
            {classes.map((c) => (
              <div key={c.id} className="flex justify-between text-slate-300">
                <span>{c.name}:</span>
                <span className="font-bold">{(dataset[c.id] || []).length} examples</span>
              </div>
            ))}
          </div>

          {/* Unknown Threshold Slider */}
          <div className="pt-2 border-t border-white/10 space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Rejection Threshold:</span>
              <span className="text-amber-300 font-bold">{Math.round(threshold * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.45"
              max="0.88"
              step="0.01"
              value={threshold}
              onChange={handleThresholdChange}
              className="w-full accent-[#E67E42] cursor-pointer"
            />
            <span className="text-[9px] text-slate-500 block leading-tight">
              Higher = more strict unknown rejection. Lower = more lenient.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeveloperDebugPanel;
