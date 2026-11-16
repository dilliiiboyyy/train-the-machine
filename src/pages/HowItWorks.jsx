import React, { useState } from 'react';
import { ArrowRight, Cpu, Eye, Layers, ShieldCheck, Activity, Brain } from 'lucide-react';
import { sound } from '../utils/sound';

export function HowItWorks({ onStartExperiment }) {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: '01',
      title: 'PIXELS TO NUMBERS',
      subtitle: 'The Camera Sensor',
      icon: '📹',
      desc: 'When you show an open hand or a pen to the camera, the lens projects photons onto an electronic sensor. The computer doesn\'t see fingers or shapes—it sees a grid of 64 × 64 pixels, where each pixel has Red, Green, and Blue numbers from 0 to 255.',
      detail: 'A single camera frame translates into over 12,000 raw numbers stored in memory!'
    },
    {
      num: '02',
      title: 'FEATURE EXTRACTION',
      subtitle: 'Finding Edges & Shapes',
      icon: '📐',
      desc: 'Raw pixel values change whenever light flickers. To recognize patterns reliably, the Pattern Engine runs mathematical edge-detection filters (Sobel operators). These filters locate horizontal lines, vertical contours, and spatial quadrants.',
      detail: 'An open hand produces high perimeter gradients with finger gaps; a closed fist creates a solid central mass.'
    },
    {
      num: '03',
      title: 'THE PATTERN MATRIX',
      subtitle: 'High-Dimensional Vectors',
      icon: '🧠',
      desc: 'The machine converts each snapshot into a 64-dimensional feature vector. Imagine a multidimensional map where all your "Open Hand" snapshots cluster in one neighborhood, and all your "Fist" snapshots cluster in another.',
      detail: 'Training simply means calculating the mathematical boundary that cleanly divides the two clusters.'
    },
    {
      num: '04',
      title: 'LIVE PREDICTION',
      subtitle: 'Cosine Distance & Probabilities',
      icon: '🎯',
      desc: 'When live video streams into the browser, the machine extracts a feature vector 10 times every second and compares its distance to your stored clusters using vector geometry.',
      detail: 'If the new frame is 92% closer to the Open Hand cluster, the machine outputs: OPEN HAND (92%).'
    }
  ];

  return (
    <div className="bg-[#F7F3EA] text-[#20303C] min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#18324A] text-[#F7F3EA] text-xs font-mono font-bold tracking-wider uppercase mb-2">
            SCIENCE & MATHEMATICS BEHIND THE LAB
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-[#18324A] uppercase tracking-tight">
            HOW IT WORKS
          </h1>
          <p className="text-base text-[#20303C]/80 mt-2">
            Demystifying browser-based computer vision: From camera photons to mathematical pattern recognition.
          </p>
        </div>

        {/* Interactive Step Explorer */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {steps.map((s, idx) => {
            const isSelected = activeStep === idx;
            return (
              <div
                key={s.num}
                onClick={() => {
                  sound.playClick();
                  setActiveStep(idx);
                }}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#E67E42] bg-white shadow-xl scale-[1.02]'
                    : 'border-[#DDE2E5] bg-white/70 hover:bg-white hover:border-[#4E8585]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      STEP {s.num}
                    </span>
                    <span className="text-2xl">{s.icon}</span>
                  </div>
                  <h3 className="font-display font-bold text-sm text-[#18324A]">
                    {s.title}
                  </h3>
                  <span className="text-[11px] font-mono text-[#4E8585] block mt-0.5">
                    {s.subtitle}
                  </span>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{isSelected ? 'Viewing' : 'Inspect'}</span>
                  <span>➔</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Active Step Presentation */}
        <div className="p-6 sm:p-10 rounded-3xl bg-white border border-[#DDE2E5] shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#E67E42] uppercase">
              <span>STEP {steps[activeStep].num} DETAILS</span>
              <span>·</span>
              <span>{steps[activeStep].subtitle}</span>
            </div>

            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#18324A]">
              {steps[activeStep].title}
            </h2>

            <p className="text-sm sm:text-base text-[#20303C]/90 leading-relaxed">
              {steps[activeStep].desc}
            </p>

            <div className="p-4 rounded-xl bg-[#F7F3EA] border border-[#DDE2E5] text-xs font-mono text-[#18324A]">
              <strong>LAB NOTE:</strong> {steps[activeStep].detail}
            </div>
          </div>

          <div className="lg:col-span-4 p-6 bg-[#18324A] text-white rounded-2xl border border-white/10 text-center space-y-3">
            <span className="text-5xl block animate-float">
              {steps[activeStep].icon}
            </span>
            <h4 className="font-display font-bold text-base text-white">
              Mathematical Invariance
            </h4>
            <p className="text-xs text-[#DDE2E5]/70 leading-relaxed">
              By isolating geometry from brightness, the browser can classify items even on low-power devices.
            </p>
          </div>
        </div>

        {/* Scientific Mythbuster Box */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#18324A] text-[#F7F3EA] border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-[#E67E42] font-mono text-xs font-bold uppercase">
            <Brain className="w-4 h-4" />
            <span>SCIENTIFIC CLARITY: WHAT AI IS NOT</span>
          </div>

          <h3 className="font-display font-extrabold text-xl sm:text-2xl text-white">
            The Computer Doesn't "Understand" Objects Like Humans Do
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-black/30 border border-white/10 space-y-1">
              <strong className="text-amber-300 font-bold block">❌ HUMAN MISCONCEPTION:</strong>
              <p className="text-[#DDE2E5]/80">
                Thinking the computer recognizes that a "hand" has five fingers, skin warmth, bones, or biological purpose.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-black/30 border border-white/10 space-y-1">
              <strong className="text-emerald-400 font-bold block">✅ SCIENTIFIC REALITY:</strong>
              <p className="text-[#DDE2E5]/80">
                The machine is matching pixel color gradients against a mathematical cluster learned during your training clicks.
              </p>
            </div>
          </div>

          <div className="pt-4 flex justify-center">
            <button
              onClick={() => {
                sound.playClick();
                onStartExperiment();
              }}
              className="pressable px-8 py-3.5 bg-[#E67E42] hover:bg-[#d66e33] text-white font-display font-bold text-base rounded-xl shadow-lg flex items-center gap-2"
            >
              <span>EXPERIENCE IT LIVE WITH YOUR CAMERA</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
