import React, { useState } from 'react';
import { CHALLENGE_QUESTIONS } from '../data/challengeQuestions';
import { Award, CheckCircle2, XCircle, ArrowRight, RotateCcw, Sparkles } from 'lucide-react';
import { sound } from '../utils/sound';
import confetti from 'canvas-confetti';

export function Challenge({ onGoToTrain }) {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [qId]: optionId }
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQ = CHALLENGE_QUESTIONS[currentQuestionIdx];
  const selectedOptionId = selectedAnswers[currentQ?.id];

  const handleSelectOption = (option) => {
    if (showExplanation) return;
    sound.playClick();

    const updated = { ...selectedAnswers, [currentQ.id]: option.id };
    setSelectedAnswers(updated);
    setShowExplanation(true);

    if (option.correct) {
      sound.playSuccess();
    } else {
      sound.playEnginePulse(360);
    }
  };

  const handleNext = () => {
    sound.playClick();
    setShowExplanation(false);
    if (currentQuestionIdx < CHALLENGE_QUESTIONS.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
    } else {
      setIsCompleted(true);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }
    }
  };

  const handleRestart = () => {
    sound.playClick();
    setSelectedAnswers({});
    setCurrentQuestionIdx(0);
    setShowExplanation(false);
    setIsCompleted(false);
  };

  // Calculate score
  const score = CHALLENGE_QUESTIONS.reduce((acc, q) => {
    const chosen = selectedAnswers[q.id];
    const isCorrect = q.options.find((o) => o.id === chosen)?.correct;
    return isCorrect ? acc + 1 : acc;
  }, 0);

  return (
    <div className="bg-[#F7F3EA] text-[#20303C] min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#E67E42]/10 text-[#E67E42] text-xs font-mono font-bold tracking-wider uppercase mb-2">
            EXHIBITION KNOWLEDGE CHECK
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[#18324A] uppercase tracking-tight">
            THE MACHINE LEARNING CHALLENGE
          </h1>
          <p className="text-sm text-[#20303C]/80 mt-1">
            Test what you discovered during your hands-on camera experiment!
          </p>
        </div>

        {!isCompleted ? (
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#DDE2E5] shadow-xl space-y-6">
            {/* Progress tracker */}
            <div className="flex items-center justify-between border-b border-[#DDE2E5] pb-3 text-xs font-mono">
              <span className="text-slate-400">
                QUESTION <strong className="text-[#18324A]">{currentQuestionIdx + 1}</strong> OF {CHALLENGE_QUESTIONS.length}
              </span>
              <span className="text-[#E67E42] font-bold">
                SCORE: {score}
              </span>
            </div>

            {/* Question Text */}
            <h3 className="font-display font-bold text-lg sm:text-xl text-[#18324A] leading-snug">
              {currentQ.question}
            </h3>

            {/* Options list */}
            <div className="space-y-3">
              {currentQ.options.map((opt) => {
                const isSelected = selectedOptionId === opt.id;
                let btnStyle = 'border-[#DDE2E5] bg-white hover:border-[#4E8585] text-[#20303C]';

                if (showExplanation) {
                  if (opt.correct) {
                    btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold';
                  } else if (isSelected && !opt.correct) {
                    btnStyle = 'border-rose-400 bg-rose-50 text-rose-900';
                  } else {
                    btnStyle = 'border-[#DDE2E5] bg-slate-50 text-slate-400 opacity-60';
                  }
                } else if (isSelected) {
                  btnStyle = 'border-[#18324A] bg-[#F7F3EA] shadow-md';
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt)}
                    disabled={showExplanation}
                    className={`w-full p-4 rounded-xl border-2 text-left text-xs sm:text-sm transition-all flex items-center justify-between gap-3 ${btnStyle}`}
                  >
                    <span>{opt.text}</span>
                    {showExplanation && opt.correct && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                    {showExplanation && isSelected && !opt.correct && (
                      <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation card upon answering */}
            {showExplanation && (
              <div className="p-4 rounded-xl bg-[#F7F3EA] border border-[#DDE2E5] space-y-3 animate-scale-in">
                <div className="text-xs text-[#20303C]/90 leading-relaxed font-mono">
                  <strong className="text-[#18324A] uppercase block mb-1">💡 WHY THIS IS TRUE:</strong>
                  {currentQ.explanation}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleNext}
                    className="pressable px-6 py-2.5 bg-[#E67E42] hover:bg-[#d66e33] text-white font-bold text-xs rounded-lg shadow flex items-center gap-1.5"
                  >
                    <span>
                      {currentQuestionIdx < CHALLENGE_QUESTIONS.length - 1 ? 'NEXT QUESTION' : 'VIEW SCORE SUMMARY'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Completion Certificate Screen */
          <div className="p-8 sm:p-12 rounded-3xl bg-[#14293c] border-2 border-emerald-500/40 text-white shadow-2xl text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(52,211,153,0.3)]">
              <Award className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold block mb-1">
                CHALLENGE COMPLETED
              </span>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl uppercase text-white">
                EXHIBITION CERTIFICATE
              </h2>
              <p className="text-sm text-[#DDE2E5]/80 font-mono mt-2">
                FINAL SCORE: <strong className="text-emerald-400 text-base">{score} / {CHALLENGE_QUESTIONS.length}</strong>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 max-w-md mx-auto text-xs text-[#DDE2E5]/90 space-y-2">
              <p>
                {score >= 4
                  ? 'Outstanding! You have mastered the relationship between training examples, feature vectors, and prediction confidence.'
                  : 'Well done! You explored how data diversity directly influences a machine learning model\'s accuracy.'}
              </p>
              <div className="pt-2 border-t border-white/10 text-[11px] font-mono text-[#E67E42]">
                Grade 9 & 10 IT Exhibition · Certified Experimenter
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={handleRestart}
                className="pressable px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/10 flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>TRY QUIZ AGAIN</span>
              </button>

              <button
                onClick={onGoToTrain}
                className="pressable px-8 py-3.5 bg-[#E67E42] hover:bg-[#d66e33] text-white font-display font-bold text-sm rounded-xl shadow-lg flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>TRAIN CAMERA MODEL AGAIN</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
