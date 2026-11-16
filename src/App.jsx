import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LoadingScreen } from './components/LoadingScreen';
import { Home } from './pages/Home';
import { TrainMachine } from './pages/TrainMachine';
import { HowItWorks } from './pages/HowItWorks';
import { Challenge } from './pages/Challenge';
import { Curators } from './pages/Curators';
import { sound } from './utils/sound';

export default function App() {
  // Show the polished loading screen once on initial application load
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Master reset key to force clean component recreation on reset
  const [resetKey, setResetKey] = useState(0);

  const handleNavigate = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleAudio = () => {
    const next = !audioEnabled;
    setAudioEnabled(next);
    sound.enabled = next;
  };

  const handleResetAll = () => {
    setResetKey((prev) => prev + 1);
    // If on train page, restart train fresh
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F3EA] text-[#20303C]">
      {/* Initial Exhibition Loading Screen */}
      {isInitialLoading && (
        <LoadingScreen onComplete={() => setIsInitialLoading(false)} />
      )}

      {/* 3-Zone Navigation Header */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onReset={handleResetAll}
        audioEnabled={audioEnabled}
        onToggleAudio={handleToggleAudio}
      />

      {/* Main Page Content */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <Home
            onStartExperiment={() => handleNavigate('train')}
            onExploreHowItWorks={() => handleNavigate('how-it-works')}
          />
        )}

        {currentPage === 'train' && (
          <TrainMachine
            key={resetKey}
            onResetAll={handleResetAll}
            onGoHome={() => handleNavigate('home')}
            onGoToChallenge={() => handleNavigate('challenge')}
          />
        )}

        {currentPage === 'how-it-works' && (
          <HowItWorks onStartExperiment={() => handleNavigate('train')} />
        )}

        {currentPage === 'challenge' && (
          <Challenge onGoToTrain={() => handleNavigate('train')} />
        )}

        {currentPage === 'curators' && <Curators />}
      </main>

      {/* Exhibition Footer */}
      <footer className="bg-[#14293c] text-[#DDE2E5]/70 py-8 border-t border-white/10 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-white tracking-wide">
              TRAIN THE MACHINE
            </span>
            <span>·</span>
            <span>School IT Exhibition</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-[#DDE2E5]/80">
            <button onClick={() => handleNavigate('home')} className="hover:text-white">
              Home
            </button>
            <span>·</span>
            <button onClick={() => handleNavigate('train')} className="hover:text-white">
              Train Machine
            </button>
            <span>·</span>
            <button onClick={() => handleNavigate('how-it-works')} className="hover:text-white">
              How It Works
            </button>
            <span>·</span>
            <button onClick={() => handleNavigate('challenge')} className="hover:text-white">
              Challenge
            </button>
            <span>·</span>
            <button onClick={() => handleNavigate('curators')} className="hover:text-white">
              Curators
            </button>
          </div>

          <div className="font-mono text-[11px] text-[#DDE2E5]/60">
            Curated by Dilshaan (Gr. 9) & Mirsab (Gr. 10)
          </div>
        </div>
      </footer>
    </div>
  );
}
