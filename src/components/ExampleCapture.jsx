import React, { useState } from 'react';
import { Camera, Sparkles, CheckCircle2, ArrowRight, RotateCcw } from 'lucide-react';
import { sound } from '../utils/sound';

export function ExampleCapture({
  currentClassId, // 'classA' | 'classB'
  classData,
  capturedExamples,
  onCapture,
  onSwitchClass,
  onProceedToTrain,
  targetCount = 6,
  isDemoMode = false,
  onNextDemoFrame
}) {
  const [isPressing, setIsPressing] = useState(false);
  const count = capturedExamples.length;
  const isSatisfied = count >= 4;

  const handleCaptureClick = () => {
    sound.playShutter();
    setIsPressing(true);
    onCapture(currentClassId);
    setTimeout(() => setIsPressing(false), 200);
  };

  return (
    <div className="w-full max-w-xl mx-auto my-4 text-center">
      {/* Target Class Guidance Banner */}
      <div className="p-4 rounded-2xl bg-white border border-[#DDE2E5] shadow-sm mb-4">
        <div className="flex items-center justify-between gap-3 mb-1">
          <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-[#E67E42]">
            COLLECTING TARGET
          </span>
          <span className="text-xs font-mono font-bold text-[#18324A]">
            {count} / {targetCount} SAMPLES
          </span>
        </div>

        <div className="flex items-center justify-center gap-2.5 my-2">
          <span className="text-3xl">{classData.icon}</span>
          <h3 className="font-display font-extrabold text-2xl text-[#18324A] uppercase">
            {classData.name}
          </h3>
        </div>

        <p className="text-xs text-[#20303C]/80 max-w-md mx-auto">
          {classData.hint || 'Position this object or gesture clearly in the camera frame.'}
        </p>

        {isDemoMode && (
          <p className="text-[11px] font-mono text-amber-700 bg-amber-50 rounded py-1 px-2 mt-2 border border-amber-200">
            Demo Mode Active: Click Capture to record pre-rendered exhibition specimens.
          </p>
        )}
      </div>

      {/* Main Big Capture Action Button */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={handleCaptureClick}
          className={`pressable w-full sm:w-auto px-10 py-5 bg-[#E67E42] hover:bg-[#d66e33] text-white font-display font-bold text-lg rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-transform ${
            isPressing ? 'scale-95' : 'hover:scale-[1.02]'
          }`}
        >
          <Camera className="w-6 h-6 animate-pulse" />
          <span>CAPTURE EXAMPLE</span>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-black/20 text-white">
            #{count + 1}
          </span>
        </button>

        {/* Transition Buttons */}
        {currentClassId === 'classA' && isSatisfied && (
          <button
            onClick={() => {
              sound.playClick();
              onSwitchClass('classB');
            }}
            className="pressable w-full sm:w-auto px-6 py-5 bg-[#18324A] hover:bg-[#20303C] text-white font-bold text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 animate-bounce"
          >
            <span>NEXT: COLLECT CLASS B</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {currentClassId === 'classB' && isSatisfied && (
          <button
            onClick={() => {
              sound.playClick();
              onProceedToTrain();
            }}
            className="pressable w-full sm:w-auto px-8 py-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base rounded-2xl shadow-xl flex items-center justify-center gap-2 animate-pulse"
          >
            <Sparkles className="w-5 h-5" />
            <span>PROCEED TO TRAIN MODEL</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="mt-3 text-xs text-[#20303C]/60 font-mono">
        💡 Tip: Rotate, move closer, and tilt slightly between captures to teach the machine variation!
      </div>
    </div>
  );
}
