"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useApp } from "@/lib/store";
import { quizzes } from "@/data/quizzes";
import type { QuizOption } from "@/data/types";
import { X } from "lucide-react";

const OPTION_COLORS = [
  { bg: "bg-red-50", border: "border-red-200", selected: "bg-red-100 border-red-400 ring-2 ring-red-200" },
  { bg: "bg-blue-50", border: "border-blue-200", selected: "bg-blue-100 border-blue-400 ring-2 ring-blue-200" },
  { bg: "bg-green-50", border: "border-green-200", selected: "bg-green-100 border-green-400 ring-2 ring-green-200" },
  { bg: "bg-amber-50", border: "border-amber-200", selected: "bg-amber-100 border-amber-400 ring-2 ring-amber-200" },
];

const CONFETTI_COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
  "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F",
  "#BB8FCE", "#85C1E9", "#F0B27A", "#82E0AA",
  "#F1948A", "#85929E", "#73C6B6", "#F8C471",
];

const LETTERS = ["A", "B", "C", "D"];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function generateConfettiPieces(count: number) {
  const pieces: { left: number; duration: number; delay: number; color: string; size: number }[] = [];
  for (let i = 0; i < count; i++) {
    pieces.push({
      left: Math.random() * 100,
      duration: 2 + Math.random() * 3,
      delay: Math.random() * 2,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: 6 + Math.random() * 8,
    });
  }
  return pieces;
}

function AnimatedCounter({ target, duration = 1500 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = null;
    const step = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp;
      const progress = Math.min((timestamp - startRef.current) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);

  return <>{count}</>;
}

// Floating +1 animation component
function FloatingPlusOne() {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 float-up-plus z-50">
      <span className="text-2xl font-extrabold text-emerald-500 drop-shadow-md">+1 ✨</span>
    </div>
  );
}

export default function QuizPlayer() {
  const { state, navigate, completeQuiz } = useApp();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [textInput, setTextInput] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [questionKey, setQuestionKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showPlusOne, setShowPlusOne] = useState(false);

  const quiz = useMemo(() => quizzes.find((q) => q.quiz_id === state.selectedQuizId), [state.selectedQuizId]);

  const questions = quiz?.questions ?? [];
  const totalQuestions = questions.length;
  const currentQ = questions[currentQuestion] ?? null;
  const progressPercent = totalQuestions > 0 ? (currentQuestion / totalQuestions) * 100 : 0;

  // Timer
  useEffect(() => {
    if (!quiz || quizFinished) return;
    const limit = quiz.settings.time_limit;
    if (limit <= 0) return;
    setTimeLeft(limit);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(interval); handleTimeUp(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz, quizFinished]);

  // Confetti cleanup
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  const handleTimeUp = useCallback(() => {
    if (quizFinished) return;
    setQuizFinished(true);
    setShowConfetti(true);
    if (quiz) {
      const sp = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
      const xp = Math.min(Math.round(sp / 5), 20);
      completeQuiz(quiz.quiz_id, sp, xp);
    }
  }, [quizFinished, quiz, totalQuestions, score, completeQuiz]);

  const confettiPieces = useMemo(() => generateConfettiPieces(40), []);

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 to-fuchsia-50 flex items-center justify-center p-6">
        <div className="glass rounded-3xl p-8 text-center max-w-md w-full animate-scale-in">
          <div className="text-6xl mb-4">🤔</div>
          <h2 className="text-2xl font-bold font-display mb-2">Quiz not found!</h2>
          <p className="text-gray-500 mb-6">We couldn&apos;t find the quiz you were looking for.</p>
          <button onClick={() => navigate("quizzes")} className="btn-primary px-8 py-3 rounded-full text-lg font-bold">
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  // Quit dialog
  const QuitConfirmOverlay = showQuitConfirm ? (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass rounded-3xl p-6 max-w-sm w-full text-center animate-spring">
        <div className="text-5xl mb-3">🚪</div>
        <h3 className="text-xl font-bold font-display mb-2">Quit Quiz?</h3>
        <p className="text-gray-500 mb-6">Your progress won&apos;t be saved. Are you sure?</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => setShowQuitConfirm(false)} className="px-6 py-2.5 rounded-full border-2 border-gray-300 text-gray-600 font-semibold hover:bg-gray-50 transition-all active:scale-95">Keep Going</button>
          <button onClick={() => navigate("quizzes")} className="px-6 py-2.5 rounded-full bg-red-500 text-white font-semibold hover:bg-red-600 transition-all active:scale-95">Quit</button>
        </div>
      </div>
    </div>
  ) : null;

  function handleSingleSelect(optionId: string) { if (!isSubmitted) setSelectedAnswers([optionId]); }
  function handleMultipleSelect(optionId: string) {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]);
  }

  function handleSubmit() {
    if (!currentQ) return;
    if (currentQ.type === "text" && textInput.trim() === "") return;
    if (currentQ.type !== "text" && selectedAnswers.length === 0) return;

    setIsSubmitted(true);
    setShowResult(true);

    let correct = false;
    if (currentQ.type === "text") {
      correct = textInput.trim().toLowerCase() === (currentQ.correct_text_answer ?? "").trim().toLowerCase();
    } else if (currentQ.type === "single") {
      correct = selectedAnswers.length === 1 && currentQ.options.find((o) => o.id === selectedAnswers[0])?.is_correct === true;
    } else if (currentQ.type === "multiple") {
      const correctOpts = currentQ.options.filter((o) => o.is_correct).map((o) => o.id).sort();
      correct = correctOpts.length === [...selectedAnswers].sort().length && correctOpts.every((id, i) => id === [...selectedAnswers].sort()[i]);
    }

    setIsCorrect(correct);
    if (correct) {
      setScore((prev) => prev + 1);
      // Show floating +1 animation
      setShowPlusOne(true);
      setTimeout(() => setShowPlusOne(false), 1000);
    }

    setTimeout(() => {
      setShowResult(false);
      setIsSubmitted(false);
      setSelectedAnswers([]);
      setTextInput("");

      if (currentQuestion + 1 >= totalQuestions) {
        setQuizFinished(true);
        setShowConfetti(true);
      } else {
        setCurrentQuestion((prev) => prev + 1);
        setQuestionKey((prev) => prev + 1);
      }
    }, 1500);
  }

  function handleRestart() {
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setTextInput("");
    setShowResult(false);
    setIsSubmitted(false);
    setIsCorrect(false);
    setScore(0);
    setShowConfetti(false);
    setQuizFinished(false);
    setShowQuitConfirm(false);
    setQuestionKey(0);
    setShowPlusOne(false);
    if (quiz?.settings.time_limit && quiz.settings.time_limit > 0) setTimeLeft(quiz.settings.time_limit);
  }

  // Timer ring — larger, animated color transition
  const timerLimit = quiz.settings.time_limit || 0;
  const timerProgress = timerLimit > 0 ? timeLeft / timerLimit : 1;
  const timerCircumference = 2 * Math.PI * 22;
  const timerOffset = timerCircumference * (1 - timerProgress);
  const timerColor = timeLeft <= 10 ? "#ef4444" : timeLeft <= 30 ? "#f59e0b" : "#8b5cf6";

  // ═══ RESULTS SCREEN ═══
  if (quizFinished) {
    const scorePercentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    const xpGained = Math.min(Math.round(scorePercentage / 5), 20);
    const starCount = scorePercentage >= 80 ? 3 : scorePercentage >= 50 ? 2 : 1;
    const resultMessage = scorePercentage >= 80 ? "Amazing! You're a star! 🎉" : scorePercentage >= 50 ? "Great effort! Keep going! 💪" : "Keep learning, you'll get there! 📚";

    const handleCopyScore = () => {
      const text = `I scored ${scorePercentage}% on "${quiz.title}" in FunLearn Kids! 🌟`;
      navigator.clipboard.writeText(text).then(() => setCopied(true));
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 to-fuchsia-50 relative overflow-hidden">
        {showConfetti && (
          <div className="confetti-container">
            {confettiPieces.map((piece, i) => (
              <div key={i} className="confetti-piece" style={{
                left: `${piece.left}%`, animationDuration: `${piece.duration}s`,
                animationDelay: `${piece.delay}s`, backgroundColor: piece.color,
                width: `${piece.size}px`, height: `${piece.size}px`,
              }} />
            ))}
          </div>
        )}

        <div className="max-w-lg mx-auto px-4 py-8 relative z-10">
          <div className="glass rounded-3xl p-8 text-center animate-scale-in">
            <div className="text-5xl mb-2">{quiz.emoji}</div>
            <h2 className="text-2xl font-bold font-display mb-6">{quiz.title}</h2>

            {/* Stars */}
            <div className="flex justify-center gap-3 mb-6">
              {[1, 2, 3].map((star) => (
                <span key={star} className={`text-5xl star-animate ${star <= starCount ? "opacity-100" : "opacity-20"}`} style={{ animationDelay: `${star * 0.3}s` }}>⭐</span>
              ))}
            </div>

            {/* Score — Animated Counter */}
            <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 rounded-2xl p-6 mb-6">
              <div className="text-6xl font-extrabold gradient-text mb-1 score-count-up">
                <AnimatedCounter target={scorePercentage} />%
              </div>
              <div className="text-gray-600 text-lg">{score}/{totalQuestions} correct</div>
            </div>

            <p className="text-xl font-semibold font-display mb-2">{resultMessage}</p>
            <p className="text-base text-amber-600 font-medium mb-4">+{xpGained} XP earned! ⚡</p>

            {/* Share */}
            <button
              onClick={handleCopyScore}
              className="mb-6 px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm font-semibold hover:bg-gray-200 transition-all active:scale-95"
            >
              {copied ? "✅ Copied!" : "📤 Share Score"}
            </button>

            <div className="flex flex-col gap-3">
              <button onClick={handleRestart} className="w-full btn-primary py-4 rounded-full text-lg font-bold shadow-lg shadow-violet-500/20">
                🔄 Try Again
              </button>
              <button onClick={() => navigate("quizzes")} className="w-full bg-gray-100 text-gray-700 py-4 rounded-full text-lg font-semibold hover:bg-gray-200 transition-all active:scale-[0.98]">
                📋 Back to Quizzes
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══ QUESTION SCREEN ═══
  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-fuchsia-50">
      {QuitConfirmOverlay}

      <div className="max-w-lg mx-auto px-4 py-6 relative">
        {/* Floating +1 animation */}
        {showPlusOne && <FloatingPlusOne />}

        {/* Top bar */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => setShowQuitConfirm(true)}
            className="w-11 h-11 rounded-full bg-white shadow-md flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all active:scale-95"
            aria-label="Quit quiz"
          >
            <X className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold text-gray-700 truncate max-w-[180px]">{quiz.emoji} {quiz.title}</h1>

          {/* Circular timer — larger */}
          {quiz.settings.time_limit > 0 && (
            <div className={`relative w-14 h-14 ${timeLeft <= 10 ? "animate-pulse" : ""}`}>
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="22" stroke="#e5e7eb" strokeWidth="4" fill="none" />
                <circle cx="24" cy="24" r="22" stroke={timerColor} strokeWidth="4" fill="none"
                  strokeLinecap="round" strokeDasharray={timerCircumference} strokeDashoffset={timerOffset}
                  className="transition-all duration-1000"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color: timerColor }}>
                {formatTime(timeLeft)}
              </span>
            </div>
          )}
        </div>

        {/* Progress bar with step markers */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium text-gray-500">Question {currentQuestion + 1} of {totalQuestions}</span>
            <span className="text-sm font-bold text-primary">{Math.round(progressPercent)}%</span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden relative">
            <div className="h-full bg-gradient-to-r from-violet-400 to-fuchsia-500 rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }} />
            <div className="absolute top-0 left-0 right-0 h-full flex items-center pointer-events-none">
              {questions.map((_, idx) => (
                <div key={idx} className="flex-1 flex justify-center">
                  <div className={`w-1.5 h-1.5 rounded-full transition-colors ${idx < currentQuestion ? "bg-white" : idx === currentQuestion ? "bg-white ring-1 ring-violet-400" : "bg-gray-300"}`} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Question card — with slide-in transition */}
        {currentQ && (
          <div key={questionKey} className="glass rounded-3xl shadow-lg p-6 md:p-8 mb-6 question-enter">
            {/* Question badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full">Q{currentQuestion + 1}</span>
              {currentQ.type === "multiple" && !showResult && (
                <span className="text-xs text-gray-400">Select all correct answers</span>
              )}
            </div>

            {/* Question text */}
            <div className={`rounded-2xl p-5 mb-6 transition-all relative ${
              showResult ? isCorrect ? "flash-correct bg-emerald-50" : "flash-wrong bg-red-50" : "bg-gradient-to-r from-violet-50 to-fuchsia-50"
            }`}>
              {showResult && <div className="text-3xl mb-2">{isCorrect ? "✅" : "❌"}</div>}
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 leading-relaxed">{currentQ.text}</h2>
            </div>

            {/* Options */}
            {currentQ.type === "single" && (
              <div className="flex flex-col gap-3">
                {currentQ.options.map((option: QuizOption, index: number) => {
                  const colorScheme = OPTION_COLORS[index % OPTION_COLORS.length];
                  const isSelected = selectedAnswers.includes(option.id);
                  const showCorrectHighlight = showResult && option.is_correct;
                  const showWrongHighlight = showResult && isSelected && !option.is_correct;

                  return (
                    <button key={option.id} onClick={() => handleSingleSelect(option.id)} disabled={isSubmitted}
                      className={`w-full min-h-[56px] px-4 py-3 rounded-2xl border-2 text-left text-base font-medium transition-all duration-200 flex items-center gap-3 active:scale-[0.97] ${
                        showCorrectHighlight ? "bg-emerald-100 border-emerald-500 text-emerald-800 ring-2 ring-emerald-200"
                        : showWrongHighlight ? "bg-red-100 border-red-500 text-red-800 ring-2 ring-red-200"
                        : isSelected ? `${colorScheme.selected} scale-[1.02] shadow-md`
                        : `${colorScheme.bg} ${colorScheme.border} hover:shadow-md hover:scale-[1.01]`
                      } ${isSubmitted ? "cursor-not-allowed" : "cursor-pointer"}`}>
                      <span className="w-7 h-7 rounded-lg bg-white/80 flex items-center justify-center flex-shrink-0 text-xs font-bold text-gray-500 shadow-sm">
                        {LETTERS[index]}
                      </span>
                      <span className="flex-1">{option.text}</span>
                      {(isSelected || showCorrectHighlight) && <span className="text-lg">{showCorrectHighlight ? "✓" : showWrongHighlight ? "✗" : ""}</span>}
                    </button>
                  );
                })}
              </div>
            )}

            {currentQ.type === "multiple" && (
              <div className="flex flex-col gap-3">
                {currentQ.options.map((option: QuizOption, index: number) => {
                  const colorScheme = OPTION_COLORS[index % OPTION_COLORS.length];
                  const isSelected = selectedAnswers.includes(option.id);
                  const showCorrectHighlight = showResult && option.is_correct;
                  const showWrongHighlight = showResult && isSelected && !option.is_correct;
                  const showMissedHighlight = showResult && !isSelected && option.is_correct;

                  return (
                    <button key={option.id} onClick={() => handleMultipleSelect(option.id)} disabled={isSubmitted}
                      className={`w-full min-h-[56px] px-4 py-3 rounded-2xl border-2 text-left text-base font-medium transition-all duration-200 flex items-center gap-3 active:scale-[0.97] ${
                        showCorrectHighlight ? "bg-emerald-100 border-emerald-500 text-emerald-800 ring-2 ring-emerald-200"
                        : showWrongHighlight ? "bg-red-100 border-red-500 text-red-800 ring-2 ring-red-200"
                        : showMissedHighlight ? "bg-emerald-50 border-emerald-400 border-dashed text-emerald-700 ring-2 ring-emerald-100"
                        : isSelected ? `${colorScheme.selected} scale-[1.02] shadow-md`
                        : `${colorScheme.bg} ${colorScheme.border} hover:shadow-md hover:scale-[1.01]`
                      } ${isSubmitted ? "cursor-not-allowed" : "cursor-pointer"}`}>
                      <span className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center flex-shrink-0 text-xs font-bold transition-colors ${
                        showCorrectHighlight || showMissedHighlight ? "border-emerald-500 bg-emerald-500 text-white"
                        : showWrongHighlight ? "border-red-500 bg-red-500 text-white"
                        : isSelected ? `${colorScheme.border} ${colorScheme.bg}`
                        : "border-gray-300 bg-white/80 text-gray-400"
                      }`}>
                        {(isSelected || showCorrectHighlight || showMissedHighlight) ? "✓" : LETTERS[index]}
                      </span>
                      <span className="flex-1">{option.text}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {currentQ.type === "text" && (
              <div>
                <input type="text" value={textInput} onChange={(e) => setTextInput(e.target.value)} placeholder="Type your answer here..." disabled={isSubmitted}
                  className={`w-full min-h-[56px] px-5 py-3 rounded-2xl border-2 text-lg font-medium transition-all outline-none ${
                    showResult ? isCorrect ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-red-500 bg-red-50 text-red-800"
                    : "border-gray-200 bg-white focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
                  } ${isSubmitted ? "cursor-not-allowed" : ""}`}
                />
                {showResult && !isCorrect && currentQ.correct_text_answer && (
                  <p className="mt-2 text-sm text-red-600 font-medium">Correct answer: {currentQ.correct_text_answer}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Submit button */}
        {!showResult && currentQ && (
          <button onClick={handleSubmit} disabled={isSubmitted || (currentQ.type === "text" ? textInput.trim() === "" : selectedAnswers.length === 0)}
            className={`w-full py-4 rounded-full text-lg font-bold text-white shadow-lg transition-all duration-200 ${
              isSubmitted || (currentQ.type === "text" ? textInput.trim() === "" : selectedAnswers.length === 0)
                ? "bg-gray-300 cursor-not-allowed" : "btn-primary hover:opacity-90 active:scale-[0.98] hover:shadow-xl shadow-violet-500/20"
            }`}>
            Check Answer ✓
          </button>
        )}

        {/* Score tracker */}
        <div className="mt-5 flex justify-center">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full glass text-sm">
            <span className="text-lg">🎯</span>
            <span className="font-semibold text-gray-600">Score: {score}/{totalQuestions}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
