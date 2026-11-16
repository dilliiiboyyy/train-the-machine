import React from 'react';
import { Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { sound } from '../utils/sound';

export function Navbar({
  currentPage,
  onNavigate,
  onReset,
  audioEnabled,
  onToggleAudio
}) {
  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'train', label: 'Train Machine' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'challenge', label: 'Challenge' },
    { id: 'curators', label: 'Curators' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#18324A] text-[#F7F3EA] border-b border-white/10 shadow-md backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark */}
        <button
          onClick={() => {
            sound.playClick();
            onNavigate('home');
          }}
          className="flex items-center gap-2.5 text-left focus:outline-none group shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-[#E67E42] flex items-center justify-center font-display font-bold text-white shadow-sm group-hover:scale-105 transition-transform">
            🤖
          </div>
          <div>
            <span className="font-display font-bold text-base sm:text-lg tracking-tight text-white block leading-tight">
              TRAIN THE MACHINE
            </span>
            <span className="text-[10px] tracking-wider uppercase text-[#DDE2E5]/70 block font-mono">
              IT Exhibition · Camera AI Lab
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 xl:gap-2">
          {navLinks.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  sound.playClick();
                  onNavigate(item.id);
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#E67E42] text-white shadow-sm font-semibold'
                    : 'text-[#DDE2E5]/80 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions - Audio & Reset */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Sound Toggle */}
          <button
            onClick={() => {
              onToggleAudio();
              sound.playClick();
            }}
            className="p-1.5 rounded-md text-[#DDE2E5]/80 hover:text-white hover:bg-white/10 transition-colors"
            title={audioEnabled ? 'Mute lab sounds' : 'Enable lab sounds'}
            aria-label={audioEnabled ? 'Mute lab sounds' : 'Enable lab sounds'}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4 text-teal-300" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Start Again / Reset Button */}
          <button
            onClick={() => {
              sound.playShutter();
              onReset();
            }}
            className="px-3 py-1.5 text-xs font-semibold text-[#18324A] bg-[#F7F3EA] hover:bg-white rounded-md transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            title="Reset captured examples and model"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#E67E42]" />
            <span className="hidden sm:inline">START AGAIN</span>
            <span className="sm:hidden">RESET</span>
          </button>
        </div>
      </div>

      {/* Mobile nav tab strip */}
      <div className="md:hidden flex items-center justify-between px-2 py-1.5 bg-[#14293c] border-t border-white/5 overflow-x-auto gap-1 text-xs">
        {navLinks.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                sound.playClick();
                onNavigate(item.id);
              }}
              className={`px-2.5 py-1 rounded text-[11px] whitespace-nowrap transition-colors ${
                isActive ? 'bg-[#E67E42] text-white font-medium' : 'text-[#DDE2E5]/70 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
