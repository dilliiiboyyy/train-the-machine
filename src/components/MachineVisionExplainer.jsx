import React, { useState } from 'react';
import { Eye, ChevronDown, ChevronUp, Sparkles, Brain, Cpu } from 'lucide-react';
import { sound } from '../utils/sound';

/**
 * MachineVisionExplainer Component
 * Expandable educational module showing what the camera perceives:
 * skeleton coordinates, hand keypoints, and normalized vectors instead of raw RGB pixels.
 */
export function MachineVisionExplainer({ perceptionData, activeClassName = '' }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="w-full max-w-xl mx-auto my-4 bg-white rounded-2xl border-2 border-[#DDE2E5] overflow-hidden shadow-sm transition-all">
      <button
        onClick={() => {
          sound.playClick();
          setIsExpanded(!isExpanded);
        }}
        className="w-full px-4 py-3 bg-[#F7F3EA] hover:bg-[#eae4d5] flex items-center justify-between text-left transition-colors font-mono"
      >
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-[#E67E42]" />
          <span className="font-bold text-xs sm:text-sm text-[#18324A] uppercase tracking-wide">
            WHAT THE MACHINE SEES
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>{isExpanded ? 'Hide' : 'Expand'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-4 border-t border-[#DDE2E5] text-xs">
          {/* Visual Mini-Wireframe Canvas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <div className="aspect-[4/3] rounded-xl bg-[#14293c] p-2 flex flex-col justify-between border border-white/10 relative overflow-hidden">
              <span className="text-[10px] font-mono text-[#E67E42] font-bold">
                EXTRACTED SKELETON
              </span>

              {/* Simplified stick figure representation */}
              <div className="flex-1 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-24 h-24">
                  {/* Head */}
                  <circle cx="50" cy="20" r="8" fill="#4E8585" stroke="#E67E42" strokeWidth="2" />
                  {/* Torso */}
                  <line x1="50" y1="28" x2="50" y2="60" stroke="#E67E42" strokeWidth="3" />
                  {/* Shoulders & Arms */}
                  <line x1="32" y1="35" x2="68" y2="35" stroke="#E67E42" strokeWidth="3" />
                  <line x1="32" y1="35" x2="25" y2="52" stroke="#E67E42" strokeWidth="2.5" />
                  <line x1="68" y1="35" x2="75" y2="52" stroke="#E67E42" strokeWidth="2.5" />
                  {/* Hips & Legs */}
                  <line x1="38" y1="60" x2="62" y2="60" stroke="#E67E42" strokeWidth="3" />
                  <line x1="42" y1="60" x2="40" y2="85" stroke="#E67E42" strokeWidth="2.5" />
                  <line x1="58" y1="60" x2="60" y2="85" stroke="#E67E42" strokeWidth="2.5" />
                  {/* Joint Dots */}
                  <circle cx="50" cy="35" r="2.5" fill="#FFF" />
                  <circle cx="25" cy="52" r="2.5" fill="#2DD4BF" />
                  <circle cx="75" cy="52" r="2.5" fill="#2DD4BF" />
                  <circle cx="40" cy="85" r="2.5" fill="#FFF" />
                  <circle cx="60" cy="85" r="2.5" fill="#FFF" />
                </svg>
              </div>

              <div className="flex justify-between text-[9px] font-mono text-slate-400">
                <span>17 Body Joints</span>
                <span>21 Hand Points</span>
                <span className="text-teal-300 font-bold">
                  {perceptionData?.trackedPixelCount
                    ? `${perceptionData.trackedPixelCount.toLocaleString()} Pixels Tracked`
                    : 'HD Pixel Grid'}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-slate-700 leading-relaxed font-sans">
              <strong className="text-sm font-display text-[#18324A] block">
                High-Clarity Pixel Tracking Matrix
              </strong>
              <p className="text-xs">
                “The system tracks active foreground and skin pixels across a 320×240 matrix. By tracking pixel clusters and density, it achieves a crystal-clear reading of body posture and fine finger gestures.”
              </p>
              <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200 text-[11px] text-teal-900 font-mono">
                🔍 <strong>Pixel Clarity:</strong> Sampling 76,800 pixels per frame filters out background clutter and sharpens joint angle calculations!
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MachineVisionExplainer;
