import React, { useState } from 'react';
import { Plus, Trash2, Sparkles, ArrowRight, Video, Package, Layers } from 'lucide-react';
import { sound } from '../utils/sound';
import { isObjectAction } from '../ml/objectFeatureExtractor';

// Presets covering Actions & Gestures
const QUICK_PRESETS = [
  { name: 'WAVING', icon: '👋', color: '#3B82F6', type: 'Movement (Recorded 1.5s)', kind: 'action' },
  { name: 'CLAPPING', icon: '👏', color: '#F59E0B', type: 'Movement (Recorded 1.5s)', kind: 'action' },
  { name: 'OPEN HAND', icon: '✋', color: '#EC4899', type: 'Hand Gesture', kind: 'action' },
  { name: 'FIST', icon: '✊', color: '#8B5CF6', type: 'Hand Gesture', kind: 'action' },
  { name: 'HANDS UP', icon: '🙋', color: '#06B6D4', type: 'Gesture Posture', kind: 'action' },
  { name: 'POINTING', icon: '👉', color: '#10B981', type: 'Hand Gesture', kind: 'action' },
  { name: 'THUMB UP', icon: '👍', color: '#6366F1', type: 'Hand Gesture', kind: 'action' }
];

export function ClassCreator({ initialClasses, onConfirmClasses }) {
  const [classes, setClasses] = useState(
    initialClasses || [
      { id: 'classA', name: 'WAVING', icon: '👋', color: '#3B82F6', kind: 'action' },
      { id: 'classB', name: 'CLAPPING', icon: '👏', color: '#F59E0B', kind: 'action' }
    ]
  );
  const handleUpdateName = (id, newName) => {
    const upper = newName.toUpperCase();
    setClasses((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        return { ...c, name: upper, kind: 'action' };
      })
    );
  };

  const handleApplyPresetToClass = (classId, preset) => {
    // Check if already selected by another class
    const isTaken = classes.some(
      (c) => c.id !== classId && c.name.trim().toUpperCase() === preset.name.toUpperCase()
    );
    if (isTaken) return;

    sound.playClick();
    setClasses((prev) =>
      prev.map((c) =>
        c.id === classId
          ? { ...c, name: preset.name, icon: preset.icon, color: preset.color, kind: 'action' }
          : c
      )
    );
  };

  const handleAddThirdClass = () => {
    if (classes.length >= 3) return;
    sound.playClick();

    // Find the first preset not currently in use
    const availablePreset = QUICK_PRESETS.find(
      (p) => !classes.some((c) => c.name.toUpperCase() === p.name.toUpperCase())
    ) || { name: 'OPEN HAND', icon: '✋', color: '#EC4899', kind: 'action' };

    setClasses((prev) => [
      ...prev,
      {
        id: 'classC',
        name: availablePreset.name,
        icon: availablePreset.icon,
        color: availablePreset.color,
        kind: 'action'
      }
    ]);
  };

  const handleRemoveThirdClass = () => {
    if (classes.length <= 2) return;
    sound.playClick();
    setClasses((prev) => prev.slice(0, 2));
  };

  // Names must be non-empty and strictly unique across classes
  const trimmedNames = classes.map((c) => c.name.trim().toUpperCase());
  const hasDuplicates = new Set(trimmedNames).size !== classes.length;
  const isValid =
    classes.length >= 2 &&
    classes.every((c) => c.name.trim().length > 0) &&
    !hasDuplicates;

  const handleContinue = () => {
    if (!isValid) return;
    sound.playSuccess();
    onConfirmClasses(classes);
  };

  return (
    <div className="max-w-4xl mx-auto my-6 p-6 sm:p-10 bg-white rounded-3xl border-2 border-[#DDE2E5] shadow-xl text-center">
      {/* Stage Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#E67E42]/10 text-[#E67E42] text-xs font-mono font-bold tracking-wider uppercase mb-4">
        <Sparkles className="w-3.5 h-3.5" />
        <span>STAGE 01 · EXPERIMENT DESIGN</span>
      </div>

      <h1 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight text-[#18324A] mb-3">
        WHAT DO YOU WANT TO TEACH?
      </h1>

      <p className="text-sm sm:text-base text-[#20303C]/80 max-w-xl mx-auto mb-8">
        Choose actions or gestures for the machine to recognize. Each action can only be chosen once!
      </p>

      {/* Class Cards Grid (2 to 3 classes) */}
      <div
        className={`grid gap-4 sm:gap-6 mb-8 ${
          classes.length === 3
            ? 'grid-cols-1 md:grid-cols-3'
            : 'grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto'
        }`}
      >
        {classes.map((cls, idx) => {
          // Check if this class has a duplicate name with another class
          const duplicateOtherIdx = classes.findIndex(
            (other) =>
              other.id !== cls.id &&
              other.name.trim().toUpperCase() === cls.name.trim().toUpperCase() &&
              cls.name.trim().length > 0
          );
          const isDuplicate = duplicateOtherIdx !== -1;

          return (
            <div
              key={cls.id}
              className={`p-5 sm:p-6 bg-[#F7F3EA] rounded-2xl border-2 transition-all text-left relative flex flex-col justify-between shadow-sm ${
                isDuplicate ? 'border-rose-400 bg-rose-50/40' : 'border-[#DDE2E5] hover:border-[#E67E42]/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold tracking-wider uppercase text-[#4E8585]">
                    CLASS 0{idx + 1}
                  </span>

                  {idx === 2 && (
                    <button
                      onClick={handleRemoveThirdClass}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Remove Class 3"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <span className="text-4xl sm:text-5xl select-none">{cls.icon}</span>
                  <div className="flex-1">
                    <label className="block text-[11px] font-mono text-[#20303C]/70 uppercase font-bold mb-1">
                      CLASS NAME
                    </label>
                    <input
                      type="text"
                      value={cls.name}
                      onChange={(e) => handleUpdateName(cls.id, e.target.value)}
                      maxLength={16}
                      placeholder={`e.g. ${QUICK_PRESETS[idx]?.name || 'ACTION'}`}
                      className={`w-full px-3 py-2 bg-white rounded-xl border font-display font-extrabold text-base sm:text-lg uppercase tracking-wide focus:outline-none focus:ring-2 ${
                        isDuplicate
                          ? 'border-rose-400 text-rose-900 focus:ring-rose-400'
                          : 'border-[#DDE2E5] text-[#18324A] focus:ring-[#E67E42]'
                      }`}
                    />
                  </div>
                </div>

                {isDuplicate && (
                  <p className="text-[11px] font-mono font-bold text-rose-600 mb-2">
                    ⚠️ Already chosen in Class 0{duplicateOtherIdx + 1}! Each class must be unique.
                  </p>
                )}

                {/* Show if dynamic motion */}
                {(cls.name.toUpperCase().includes('WAVE') || cls.name.toUpperCase().includes('CLAP')) && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md font-bold mb-3">
                    <Video className="w-3 h-3 text-blue-600" />
                    <span>RECORDED (1.5s Dynamic Motion)</span>
                  </span>
                )}
              </div>

              {/* Quick preset chips for this card */}
              <div className="pt-3 border-t border-[#DDE2E5]/80">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">
                    Quick Presets:
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-0.5">
                  {QUICK_PRESETS.map((p) => {
                    const isSelectedInOtherClass = classes.some(
                      (other) =>
                        other.id !== cls.id &&
                        other.name.trim().toUpperCase() === p.name.toUpperCase()
                    );
                    const isSelectedHere = cls.name.trim().toUpperCase() === p.name.toUpperCase();

                    return (
                      <button
                        key={p.name}
                        type="button"
                        disabled={isSelectedInOtherClass}
                        onClick={() => handleApplyPresetToClass(cls.id, p)}
                        className={`px-2 py-1 rounded text-[11px] font-mono flex items-center gap-1 transition-all ${
                          isSelectedHere
                            ? 'bg-[#18324A] text-white font-bold ring-2 ring-[#E67E42] shadow-sm'
                            : isSelectedInOtherClass
                            ? 'bg-slate-100/80 text-slate-400 border border-slate-200 cursor-not-allowed opacity-40 line-through'
                            : 'bg-white hover:bg-white/80 text-[#18324A] border border-[#DDE2E5] cursor-pointer hover:border-[#E67E42]/60'
                        }`}
                        title={
                          isSelectedInOtherClass
                            ? `"${p.name}" is already chosen in another class`
                            : `Select ${p.name}`
                        }
                      >
                        <span>{p.icon}</span>
                        <span>{p.name}</span>
                        {isSelectedInOtherClass && (
                          <span className="text-[9px] text-slate-400 ml-0.5">✕</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Third Class Option */}
      {classes.length < 3 && (
        <div className="mb-8">
          <button
            onClick={handleAddThirdClass}
            className="px-4 py-2 rounded-xl bg-white border border-dashed border-[#4E8585] text-[#4E8585] hover:bg-[#4E8585]/5 text-xs font-mono font-bold inline-flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ ADD OPTIONAL CLASS 3 (e.g. OPEN HAND OR FIST)</span>
          </button>
        </div>
      )}

      {/* Action Button */}
      <div className="flex justify-center">
        <button
          onClick={handleContinue}
          disabled={!isValid}
          className={`pressable px-8 py-4 font-display font-bold text-base rounded-2xl shadow-xl flex items-center gap-2.5 transition-all ${
            isValid
              ? 'bg-[#E67E42] hover:bg-[#d66e33] text-white hover:scale-[1.02] cursor-pointer'
              : 'bg-slate-300 text-slate-500 cursor-not-allowed'
          }`}
        >
          <span>CONTINUE TO CAMERA</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default ClassCreator;
