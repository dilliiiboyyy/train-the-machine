import React, { useState } from 'react';
import { CLASS_PRESETS } from '../data/presets';
import { sound } from '../utils/sound';
import { Check, Edit3, ArrowRight } from 'lucide-react';

export function ClassSelector({ selectedPreset, onSelectPreset, onConfirmClasses }) {
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [customA, setCustomA] = useState(selectedPreset.classA.name);
  const [customB, setCustomB] = useState(selectedPreset.classB.name);

  const handleApplyPreset = (preset) => {
    sound.playClick();
    onSelectPreset(preset);
    setCustomA(preset.classA.name);
    setCustomB(preset.classB.name);
  };

  const handleProceed = () => {
    sound.playClick();
    if (isCustomizing) {
      onSelectPreset({
        ...selectedPreset,
        classA: { ...selectedPreset.classA, name: customA.toUpperCase() || 'CLASS A' },
        classB: { ...selectedPreset.classB, name: customB.toUpperCase() || 'CLASS B' }
      });
    }
    onConfirmClasses();
  };

  return (
    <div className="max-w-3xl mx-auto my-8 p-6 sm:p-8 rounded-3xl bg-white border border-[#DDE2E5] shadow-xl text-[#20303C]">
      <div className="text-center max-w-xl mx-auto mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#E67E42]/10 text-[#E67E42] text-xs font-mono font-bold tracking-wider uppercase mb-2">
          STEP 01 · TARGET CLASSES
        </div>
        <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#18324A] uppercase">
          CHOOSE WHAT TO TEACH
        </h2>
        <p className="text-sm text-[#20303C]/80 mt-1">
          Pick two distinct objects or hand gestures for your camera experiment.
        </p>
      </div>

      {/* Preset Selector Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
        {CLASS_PRESETS.map((preset) => {
          const isSelected = selectedPreset.id === preset.id;
          return (
            <div
              key={preset.id}
              onClick={() => handleApplyPreset(preset)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                isSelected
                  ? 'border-[#18324A] bg-[#F7F3EA] shadow-md ring-2 ring-[#18324A]/20 scale-[1.01]'
                  : 'border-[#DDE2E5] bg-white hover:border-[#4E8585] hover:bg-[#F7F3EA]/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2 text-2xl">
                  <span className="w-9 h-9 rounded-full bg-white border border-[#DDE2E5] flex items-center justify-center shadow-sm">
                    {preset.classA.icon}
                  </span>
                  <span className="w-9 h-9 rounded-full bg-white border border-[#DDE2E5] flex items-center justify-center shadow-sm">
                    {preset.classB.icon}
                  </span>
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-[#18324A]">
                    {preset.classA.name} <span className="text-[#E67E42] font-mono text-xs">vs</span> {preset.classB.name}
                  </h4>
                  <span className="text-[11px] text-[#20303C]/60 block font-mono">
                    {preset.label}
                  </span>
                </div>
              </div>

              {isSelected && (
                <div className="w-6 h-6 rounded-full bg-[#18324A] text-white flex items-center justify-center text-xs">
                  <Check className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Custom Label Accordion / Toggle */}
      <div className="mb-6 p-4 rounded-xl bg-[#F7F3EA] border border-[#DDE2E5]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-[#18324A] uppercase flex items-center gap-1.5">
            <Edit3 className="w-3.5 h-3.5 text-[#E67E42]" /> CUSTOM CLASS LABELS (OPTIONAL)
          </span>
          <button
            onClick={() => setIsCustomizing(!isCustomizing)}
            className="text-xs text-[#E67E42] hover:underline font-semibold"
          >
            {isCustomizing ? 'Use Presets' : 'Customize Names'}
          </button>
        </div>

        {isCustomizing && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 pt-3 border-t border-[#DDE2E5]">
            <div>
              <label className="block text-[11px] font-mono text-slate-500 uppercase mb-1">
                Class A Name:
              </label>
              <input
                type="text"
                value={customA}
                onChange={(e) => setCustomA(e.target.value)}
                maxLength={20}
                className="w-full px-3 py-2 bg-white rounded-lg border border-[#DDE2E5] text-xs font-bold text-[#18324A] focus:outline-none focus:ring-2 focus:ring-[#E67E42]"
                placeholder="e.g. THUMBS UP"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-slate-500 uppercase mb-1">
                Class B Name:
              </label>
              <input
                type="text"
                value={customB}
                onChange={(e) => setCustomB(e.target.value)}
                maxLength={20}
                className="w-full px-3 py-2 bg-white rounded-lg border border-[#DDE2E5] text-xs font-bold text-[#18324A] focus:outline-none focus:ring-2 focus:ring-[#4E8585]"
                placeholder="e.g. THUMBS DOWN"
              />
            </div>
          </div>
        )}
      </div>

      {/* Proceed Button */}
      <div className="flex justify-end">
        <button
          onClick={handleProceed}
          className="pressable px-8 py-3.5 bg-[#E67E42] hover:bg-[#d66e33] text-white font-display font-bold text-base rounded-xl shadow-md flex items-center gap-2"
        >
          <span>CONFIRM & START CAPTURING</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
