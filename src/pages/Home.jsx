import React from 'react';
import { PatternEngine } from '../components/PatternEngine';
import { CLASS_PRESETS } from '../data/presets';
import { ArrowRight, Camera, Sparkles, ShieldCheck, Cpu, Zap, Activity } from 'lucide-react';
import { sound } from '../utils/sound';

export function Home({ onStartExperiment, onExploreHowItWorks }) {
  const defaultPreset = CLASS_PRESETS[0];

  return (
    <div className="bg-[#F7F3EA] text-[#20303C] min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-10 sm:py-16 border-b border-[#DDE2E5]">
        <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          {/* Top metadata pill-free line */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#18324A]/10 pb-3 mb-8 text-xs text-[#20303C]/70">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#18324A] uppercase tracking-wider font-mono">
                IT EXHIBITION · EXPERIMENT LAB
              </span>
              <span aria-hidden="true">·</span>
              <span>Curated by Dilshaan (Gr. 9) & Mirsab (Gr. 10)</span>
            </div>
            <div className="flex items-center gap-2 font-mono font-medium text-[#E67E42]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>INTERACTIVE AI LAB</span>
            </div>
          </div>

          {/* Large Visual Split Composition: LEFT explanation, CENTER/RIGHT Pattern Engine */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* LEFT COLUMN: Short explanation & CTAs (6 cols) */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <div>
                <h1 className="font-display font-extrabold text-4xl sm:text-6xl md:text-7xl tracking-tight text-[#18324A] uppercase leading-[1.05]">
                  TRAIN THE <span className="text-[#E67E42]">MACHINE</span>
                </h1>
                <p className="font-display text-xl sm:text-2xl md:text-3xl font-semibold text-[#18324A]/90 mt-3 leading-snug">
                  “Can you teach a computer to recognize what your camera sees?”
                </p>
              </div>

              <p className="text-base sm:text-lg text-[#20303C]/80 max-w-xl font-normal leading-relaxed">
                Step into our interactive browser AI lab. Show real objects or hand gestures to your webcam,
                extract visual patterns in real time, and train an in-browser machine learning model.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => {
                    sound.playClick();
                    onStartExperiment();
                  }}
                  className="pressable px-8 py-4 bg-[#E67E42] hover:bg-[#d66e33] text-white font-display font-bold text-lg rounded-2xl shadow-xl flex items-center gap-3 transition-transform"
                >
                  <Camera className="w-5 h-5" />
                  <span>START EXPERIMENT</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  onClick={() => {
                    sound.playClick();
                    onExploreHowItWorks();
                  }}
                  className="pressable px-6 py-4 bg-[#18324A] hover:bg-[#20303C] text-white font-semibold text-sm rounded-2xl shadow-md transition-colors"
                >
                  <span>How It Works</span>
                </button>
              </div>

              {/* Privacy Reassurance Banner */}
              <div className="flex items-center justify-center lg:justify-start gap-2 text-xs text-[#20303C]/70 font-mono pt-3">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Camera frames are processed 100% locally. Zero cloud uploads.</span>
              </div>
            </div>

            {/* CENTER / RIGHT COLUMN: The Pattern Engine with Floating Labels (6 cols) */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              {/* Floating Labels around the machine with subtle animations as requested */}
              <div className="absolute -top-3 left-4 z-20 px-3 py-1 rounded-full bg-[#18324A] text-white text-[11px] font-mono shadow-md border border-white/10 animate-float">
                📹 CAMERA
              </div>
              <div className="absolute top-1/4 -right-2 z-20 px-3 py-1 rounded-full bg-[#E67E42] text-white text-[11px] font-mono shadow-md animate-float" style={{ animationDelay: '1s' }}>
                📊 DATA
              </div>
              <div className="absolute bottom-1/3 -left-3 z-20 px-3 py-1 rounded-full bg-[#4E8585] text-white text-[11px] font-mono shadow-md animate-float" style={{ animationDelay: '1.5s' }}>
                ⚙️ TRAINING
              </div>
              <div className="absolute -bottom-2 right-8 z-20 px-3 py-1 rounded-full bg-[#18324A] text-amber-300 text-[11px] font-mono shadow-md border border-white/10 animate-float" style={{ animationDelay: '2s' }}>
                🧠 PATTERN
              </div>
              <div className="absolute top-1/2 -left-6 z-20 px-3 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-mono shadow-md animate-float" style={{ animationDelay: '0.5s' }}>
                🎯 PREDICTION
              </div>

              {/* Central Pattern Engine Visual Component */}
              <PatternEngine
                state="READY"
                classA={defaultPreset.classA}
                classB={defaultPreset.classB}
                sampleCountA={6}
                sampleCountB={6}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Interactive Journey: COLLECT → TRAIN → TEST → DISCOVER */}
      <section className="py-14 bg-white border-b border-[#DDE2E5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-mono font-bold tracking-widest text-[#E67E42] uppercase block mb-1">
              THE 4-STAGE LAB WORKFLOW
            </span>
            <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-[#18324A] uppercase">
              COLLECT → TRAIN → TEST → DISCOVER
            </h2>
            <p className="text-sm text-[#20303C]/80 mt-2">
              A hands-on machine-learning pipeline modeled after real computer vision laboratories.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 rounded-2xl bg-[#F7F3EA] border border-[#DDE2E5] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#E67E42]/15 text-[#E67E42] flex items-center justify-center font-bold text-lg font-mono">
                01
              </div>
              <h3 className="font-display font-bold text-base text-[#18324A]">
                1. COLLECT
              </h3>
              <p className="text-xs text-[#20303C]/70 leading-relaxed">
                Show your webcam examples of two distinct classes (e.g. Open Hand vs. Fist). Capture 5 to 10 snapshots of each.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F7F3EA] border border-[#DDE2E5] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#4E8585]/15 text-[#4E8585] flex items-center justify-center font-bold text-lg font-mono">
                02
              </div>
              <h3 className="font-display font-bold text-base text-[#18324A]">
                2. TRAIN
              </h3>
              <p className="text-xs text-[#20303C]/70 leading-relaxed">
                The Pattern Engine processes raw pixels into normalized edge gradients and mathematical decision boundaries.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F7F3EA] border border-[#DDE2E5] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#18324A]/15 text-[#18324A] flex items-center justify-center font-bold text-lg font-mono">
                03
              </div>
              <h3 className="font-display font-bold text-base text-[#18324A]">
                3. TEST
              </h3>
              <p className="text-xs text-[#20303C]/70 leading-relaxed">
                Point your webcam at new gestures! The model evaluates live frames continuously and outputs smoothed probabilities.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F7F3EA] border border-[#DDE2E5] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-700 flex items-center justify-center font-bold text-lg font-mono">
                04
              </div>
              <h3 className="font-display font-bold text-base text-[#18324A]">
                4. DISCOVER
              </h3>
              <p className="text-xs text-[#20303C]/70 leading-relaxed">
                Try to fool the classifier by changing angles and lighting. Learn why representative data is essential for reliable AI.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
