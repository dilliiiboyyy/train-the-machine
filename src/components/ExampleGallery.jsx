import React from 'react';
import { Trash2, Image as ImageIcon, Upload } from 'lucide-react';
import { sound } from '../utils/sound';

/**
 * ExampleGallery Component
 * Displays real webcam frame thumbnails captured by the visitor for each custom class.
 * Also supports uploading image examples from the device.
 */
export function ExampleGallery({
  classes = [],
  examplesByClass = {},
  onDeleteExample,
  onUploadImages
}) {
  const totalCount = Object.values(examplesByClass).reduce(
    (acc, list) => acc + (list ? list.length : 0),
    0
  );

  return (
    <div className="w-full max-w-4xl mx-auto my-6 p-4 sm:p-6 bg-white rounded-3xl border border-[#DDE2E5] shadow-lg">
      <div className="flex items-center justify-between border-b border-[#DDE2E5] pb-3 mb-4">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#4E8585]">
            CAPTURED POSE & OBJECT SAMPLES
          </span>
          <h3 className="font-display font-bold text-base sm:text-lg text-[#18324A]">
            Visitor Training Dataset
          </h3>
        </div>
        <div className="text-xs font-mono text-slate-500">
          TOTAL: <strong className="text-[#18324A]">{totalCount}</strong> EXAMPLES
        </div>
      </div>

      <div
        className={`grid gap-4 sm:gap-6 ${
          classes.length === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'
        }`}
      >
        {classes.map((cls) => {
          const list = examplesByClass[cls.id] || [];

          return (
            <div
              key={cls.id}
              className="p-3.5 bg-[#F7F3EA] rounded-2xl border border-[#DDE2E5] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-[#18324A] flex items-center gap-1.5 truncate">
                    <span>{cls.icon}</span>
                    <span className="truncate">{cls.name}</span>
                  </span>
                  
                  <div className="flex items-center gap-2">
                    {onUploadImages && (
                      <label className="cursor-pointer inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white hover:bg-slate-50 text-[10px] font-mono font-bold text-[#18324A] border border-[#DDE2E5] shadow-xs hover:border-[#E67E42]/60 transition-colors">
                        <Upload className="w-3 h-3 text-[#E67E42]" />
                        <span>+ Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              onUploadImages(cls.id, e.target.files);
                              e.target.value = '';
                            }
                          }}
                        />
                      </label>
                    )}
                    <span className="font-mono text-[#E67E42] font-bold shrink-0">
                      {list.length} SAMPLES
                    </span>
                  </div>
                </div>

                {/* Thumbnails Row */}
                <div className="grid grid-cols-4 gap-2 min-h-[70px] p-2 bg-white/80 rounded-xl border border-dashed border-[#DDE2E5] items-center">
                  {list.length === 0 ? (
                    <div className="col-span-full text-center text-xs text-slate-400 py-3 font-mono">
                      No captures or uploads yet for {cls.name}
                    </div>
                  ) : (
                    list.map((ex, idx) => (
                      <div
                        key={ex.id}
                        className="relative group aspect-square rounded-lg overflow-hidden border border-[#DDE2E5] bg-black shadow-sm"
                      >
                        <img
                          src={ex.dataUrl}
                          alt={`${cls.name} #${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={() => {
                              sound.playClick();
                              if (onDeleteExample) onDeleteExample(cls.id, ex.id);
                            }}
                            className="p-1 rounded bg-rose-600 text-white text-[10px]"
                            title="Delete sample"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="absolute bottom-0.5 right-0.5 text-[8px] font-mono bg-black/75 text-white px-1 rounded flex items-center gap-0.5">
                          {ex.source === 'upload' ? '📁' : '📷'} #{idx + 1}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-2 text-[10px] font-mono text-slate-500 text-center">
                {list.length >= 4 ? (
                  <span className="text-emerald-600 font-bold">✓ Ready for training</span>
                ) : (
                  <span>Capture or upload at least {Math.max(1, 4 - list.length)} more</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ExampleGallery;
