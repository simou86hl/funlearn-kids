"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useApp } from "@/lib/store";
import { quizzes } from "@/data/quizzes";
import type { QuizOption } from "@/data/types";

// ─── Pastel color palette for option buttons ───
const OPTION_COLORS = [
  { bg: "bg-red-50", border: "border-red-300", selected: "bg-red-200 border-red-500" },
  { bg: "bg-blue-50", border: "border-blue-300", selected: "bg-blue-200 border-blue-500" },
  { bg: "bg-green-50", border: "border-green-300", selected: "bg-green-200 border-green-500" },
  { bg: "bg-yellow-50", border: "border-yellow-300", selected: "bg-yellow-200 border-yellow-500" },
];

// ─── Confetti bright colors ───
const CONFETTI_COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
  "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F",
  "#BB8FCE", "#85C1E9", "#F0B27A", "#82E0AA",
  "#F1948A", "#85929E", "#73C6B6", "#F8C471",
];

// ─── Helper: format seconds as MM:SS ───
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── Helper: generate confetti pieces ───
function generateConfettiPieces(count: number) {
  const pieces: {
    left: number;
    duration: number;
    delay: number;
    color: string;
    size: number;
  }[] = [];
  for (let i = 0; i < count; i++) {
    pieces.push({
      left: Math.random() * 100,
      duration: 2 + Math.random() * 3,
      delay: Math.random() * 2,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: 6 + Math.random() * 6,
    });
  }
  return pieces;
}

export default function QuizPlayer() {
  const { state, navigate, completeQuiz } = useApp();

  // ─── State ───
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [textInput, setTextInput] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  // ─── Find the quiz from store ───
  const quiz = useMemo(
    () => quizzes.find((q) => q.quiz_id === state.selectedQuizId),
    [state.selectedQuizId]
  );

  const questions = quiz?.questions ?? [];
  const totalQuestions = questions.length;
  const currentQ = questions[currentQuestion] ?? null;
  const progressPercent = totalQuestions > 0 ? ((currentQuestion) / totalQuestions) * 100 : 0;

  // ─── Timer countdown ───
  useEffect(() => {
    if (!quiz || quizFinished) return;
    const limit = quiz.settings.time_limit;
    if (limit <= 0) return;

    setTimeLeft(limit);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz, quizFinished]);

  // ─── Confetti cleanup ───
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  // ─── Time-up handler ───
  const handleTimeUp = useCallback(() => {
    if (quizFinished) return;
    // Move to results with whatever score we have
    setQuizFinished(true);
    setShowConfetti(true);
    if (quiz) {
      const scorePercentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
      const xpGained = Math.min(Math.round(scorePercentage / 5), 20);
      completeQuiz(quiz.quiz_id, scorePercentage, xpGained);
    }
  }, [quizFinished, quiz, totalQuestions, score, completeQuiz]);

  // ─── Confetti pieces (generated once, must be before early returns) ───
  const confettiPieces = useMemo(() => generateConfettiPieces(30), []);

  // ─── No quiz found guard ───
  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center max-w-md w-full">
          <div className="text-6xl mb-4">🤔</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Quiz not found!</h2>
          <p className="text-gray-500 mb-6">
            We couldn&apos;t find the quiz you were looking for.
          </p>
          <button
            onClick={() => navigate("quizzes")}
            className="bg-primary text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  // ─── Quit confirmation dialog ───
  const QuitConfirmOverlay = showQuitConfirm ? (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full text-center animate-bounce-in">
        <div className="text-5xl mb-3">🚪</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Quit Quiz?</h3>
        <p className="text-gray-500 mb-6">
          Your progress won&apos;t be saved. Are you sure?
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => setShowQuitConfirm(false)}
            className="px-6 py-2.5 rounded-full border-2 border-gray-300 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
          >
            Keep Going
          </button>
          <button
            onClick={() => navigate("quizzes")}
            className="px-6 py-2.5 rounded-full bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors"
          >
            Quit
          </button>
        </div>
      </div>
    </div>
  ) : null;

  // ─── Answer selection handlers ───
  function handleSingleSelect(optionId: string) {
    if (isSubmitted) return;
    setSelectedAnswers([optionId]);
  }

  function handleMultipleSelect(optionId: string) {
    if (isSubmitted) return;
    setSelectedAnswers((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId]
    );
  }

  // ─── Check answer logic ───
  function handleSubmit() {
    if (!currentQ) return;

    // For text type, validate input isn't empty
    if (currentQ.type === "text" && textInput.trim() === "") return;

    // For option types, require at least one selection
    if (currentQ.type !== "text" && selectedAnswers.length === 0) return;

    setIsSubmitted(true);
    setShowResult(true);

    let correct = false;

    if (currentQ.type === "text") {
      // Compare text answer (case-insensitive, trimmed)
      const userAnswer = textInput.trim().toLowerCase();
      const correctAnswer = (currentQ.correct_text_answer ?? "").trim().toLowerCase();
      correct = userAnswer === correctAnswer;
    } else if (currentQ.type === "single") {
      correct =
        selectedAnswers.length === 1 &&
        currentQ.options.find((o) => o.id === selectedAnswers[0])?.is_correct === true;
    } else if (currentQ.type === "multiple") {
      const correctOptions = currentQ.options
        .filter((o) => o.is_correct)
        .map((o) => o.id)
        .sort();
      const userSelection = [...selectedAnswers].sort();
      correct =
        correctOptions.length === userSelection.length &&
        correctOptions.every((id, i) => id === userSelection[i]);
    }

    setIsCorrect(correct);
    if (correct) {
      setScore((prev) => prev + 1);
    }

    // Auto-advance after 1.5 seconds
    setTimeout(() => {
      setShowResult(false);
      setIsSubmitted(false);
      setSelectedAnswers([]);
      setTextInput("");

      if (currentQuestion + 1 >= totalQuestions) {
        // Quiz complete
        setQuizFinished(true);
        setShowConfetti(true);
      } else {
        setCurrentQuestion((prev) => prev + 1);
      }
    }, 1500);
  }

  // ─── Restart quiz ───
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
    if (quiz?.settings.time_limit && quiz.settings.time_limit > 0) {
      setTimeLeft(quiz.settings.time_limit);
    }
  }

  // ─── Back to quizzes ───
  function handleBackToQuizzes() {
    navigate("quizzes");
  }

  // ═══════════════════════════════════════════════════
  // RESULTS SCREEN
  // ═══════════════════════════════════════════════════
  if (quizFinished) {
    const scorePercentage =
      totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    const xpGained = Math.min(Math.round(scorePercentage / 5), 20);

    const starCount = scorePercentage >= 80 ? 3 : scorePercentage >= 50 ? 2 : 1;

    const resultMessage =
      scorePercentage >= 80
        ? "Great job! 🎉"
        : scorePercentage >= 50
        ? "Good try! 💪"
        : "Keep learning! 📚";

    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 relative overflow-hidden">
        {/* Confetti */}
        {showConfetti && (
          <div className="confetti-container">
            {confettiPieces.map((piece, i) => (
              <div
                key={i}
                className="confetti-piece"
                style={{
                  left: `${piece.left}%`,
                  animationDuration: `${piece.duration}s`,
                  animationDelay: `${piece.delay}s`,
                  backgroundColor: piece.color,
                  width: `${piece.size}px`,
                  height: `${piece.size}px`,
                }}
              />
            ))}
          </div>
        )}

        <div className="max-w-lg mx-auto px-4 py-8 relative z-10">
          {/* Results card */}
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            {/* Quiz emoji & title */}
            <div className="text-5xl mb-2">{quiz.emoji}</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{quiz.title}</h2>

            {/* Star rating */}
            <div className="flex justify-center gap-3 mb-6">
              {[1, 2, 3].map((star) => (
                <span
                  key={star}
                  className={`text-5xl star-animate ${
                    star <= starCount ? "opacity-100" : "opacity-20"
                  }`}
                  style={{ animationDelay: `${star * 0.3}s` }}
                >
                  ⭐
                </span>
              ))}
            </div>

            {/* Score display */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-6">
              <div className="text-4xl font-bold text-primary mb-1">
                {scorePercentage}%
              </div>
              <div className="text-gray-600 text-lg">
                {score}/{totalQuestions} correct
              </div>
            </div>

            {/* Result message */}
            <p className="text-2xl font-semibold text-gray-800 mb-2">
              {resultMessage}
            </p>

            {/* XP gained */}
            <p className="text-base text-amber-600 font-medium mb-8">
              +{xpGained} XP earned! ⚡
            </p>

            {/* Action buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleRestart}
                className="w-full bg-primary text-white py-4 rounded-full text-lg font-bold hover:bg-primary/90 transition-colors shadow-lg"
              >
                🔄 Try Again
              </button>
              <button
                onClick={handleBackToQuizzes}
                className="w-full bg-gray-100 text-gray-700 py-4 rounded-full text-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                📋 Back to Quizzes
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════
  // QUESTION SCREEN
  // ═══════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      {QuitConfirmOverlay}

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* ─── Top bar ─── */}
        <div className="flex items-center justify-between mb-6">
          {/* Back / quit button */}
          <button
            onClick={() => setShowQuitConfirm(true)}
            className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors text-xl"
            aria-label="Quit quiz"
          >
            ←
          </button>

          {/* Quiz title */}
          <h1 className="text-lg font-bold text-gray-700 truncate max-w-[200px]">
            {quiz.emoji} {quiz.title}
          </h1>

          {/* Timer */}
          {quiz.settings.time_limit > 0 && (
            <div
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold ${
                timeLeft <= 30
                  ? "bg-red-100 text-red-600 animate-pulse"
                  : "bg-white text-gray-700 shadow-sm"
              }`}
            >
              <span>⏱️</span>
              <span>{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>

        {/* ─── Progress bar ─── */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium text-gray-500">
              Question {currentQuestion + 1} of {totalQuestions}
            </span>
            <span className="text-sm font-bold text-primary">
              {Math.round(progressPercent)}%
            </span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* ─── Question card ─── */}
        {currentQ && (
          <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8 mb-6">
            {/* Question text */}
            <div
              className={`rounded-2xl p-5 mb-6 transition-all ${
                showResult
                  ? isCorrect
                    ? "flash-correct bg-green-50"
                    : "flash-wrong bg-red-50"
                  : "bg-gradient-to-r from-blue-50 to-purple-50"
              }`}
            >
              {/* Feedback icon */}
              {showResult && (
                <div className="text-3xl mb-2">
                  {isCorrect ? "✅" : "❌"}
                </div>
              )}

              <h2 className="text-lg md:text-xl font-semibold text-gray-800 leading-relaxed">
                {currentQ.text}
              </h2>

              {/* Question type hint */}
              {currentQ.type === "multiple" && !showResult && (
                <p className="text-sm text-gray-400 mt-2">
                  Select all correct answers
                </p>
              )}
            </div>

            {/* ─── Options ─── */}
            {currentQ.type === "single" && (
              <div className="flex flex-col gap-3">
                {currentQ.options.map((option: QuizOption, index: number) => {
                  const colorScheme = OPTION_COLORS[index % OPTION_COLORS.length];
                  const isSelected = selectedAnswers.includes(option.id);
                  const showCorrectHighlight =
                    showResult && option.is_correct;
                  const showWrongHighlight =
                    showResult && isSelected && !option.is_correct;

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSingleSelect(option.id)}
                      disabled={isSubmitted}
                      className={`
                        w-full min-h-14 px-5 py-3 rounded-2xl border-2 text-left text-lg font-medium
                        transition-all duration-200 flex items-center gap-3
                        ${
                          showCorrectHighlight
                            ? "bg-green-100 border-green-500 text-green-800"
                            : showWrongHighlight
                            ? "bg-red-100 border-red-500 text-red-800"
                            : isSelected
                            ? `${colorScheme.selected} ${colorScheme.border} scale-[1.02] shadow-md`
                            : `${colorScheme.bg} ${colorScheme.border} hover:shadow-md hover:scale-[1.01]`
                        }
                        ${isSubmitted ? "cursor-not-allowed" : "cursor-pointer active:scale-[0.98]"}
                      `}
                    >
                      {/* Radio indicator */}
                      <span
                        className={`
                          w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
                          ${
                            showCorrectHighlight
                              ? "border-green-500 bg-green-500"
                              : showWrongHighlight
                              ? "border-red-500 bg-red-500"
                              : isSelected
                              ? `${colorScheme.border} ${colorScheme.bg}`
                              : "border-gray-300"
                          }
                        `}
                      >
                        {(isSelected || showCorrectHighlight) && (
                          <span className="w-3 h-3 rounded-full bg-current" />
                        )}
                      </span>
                      <span>{option.text}</span>
                      {showCorrectHighlight && (
                        <span className="ml-auto text-green-600">✓</span>
                      )}
                      {showWrongHighlight && (
                        <span className="ml-auto text-red-600">✗</span>
                      )}
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
                  const showCorrectHighlight =
                    showResult && option.is_correct;
                  const showWrongHighlight =
                    showResult && isSelected && !option.is_correct;
                  const showMissedHighlight =
                    showResult && !isSelected && option.is_correct;

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleMultipleSelect(option.id)}
                      disabled={isSubmitted}
                      className={`
                        w-full min-h-14 px-5 py-3 rounded-2xl border-2 text-left text-lg font-medium
                        transition-all duration-200 flex items-center gap-3
                        ${
                          showCorrectHighlight
                            ? "bg-green-100 border-green-500 text-green-800"
                            : showWrongHighlight
                            ? "bg-red-100 border-red-500 text-red-800"
                            : showMissedHighlight
                            ? "bg-green-100 border-green-400 border-dashed text-green-700"
                            : isSelected
                            ? `${colorScheme.selected} ${colorScheme.border} scale-[1.02] shadow-md`
                            : `${colorScheme.bg} ${colorScheme.border} hover:shadow-md hover:scale-[1.01]`
                        }
                        ${isSubmitted ? "cursor-not-allowed" : "cursor-pointer active:scale-[0.98]"}
                      `}
                    >
                      {/* Checkbox indicator */}
                      <span
                        className={`
                          w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0
                          ${
                            showCorrectHighlight
                              ? "border-green-500 bg-green-500"
                              : showWrongHighlight
                              ? "border-red-500 bg-red-500"
                              : showMissedHighlight
                              ? "border-green-400 bg-green-400"
                              : isSelected
                              ? `${colorScheme.border} ${colorScheme.bg}`
                              : "border-gray-300"
                          }
                        `}
                      >
                        {(isSelected || showCorrectHighlight || showMissedHighlight) && (
                          <span className="text-white text-xs font-bold">✓</span>
                        )}
                      </span>
                      <span>{option.text}</span>
                      {showCorrectHighlight && (
                        <span className="ml-auto text-green-600">✓</span>
                      )}
                      {showWrongHighlight && (
                        <span className="ml-auto text-red-600">✗</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {currentQ.type === "text" && (
              <div>
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Type your answer here..."
                  disabled={isSubmitted}
                  className={`
                    w-full min-h-14 px-5 py-3 rounded-2xl border-2 text-lg font-medium
                    transition-all duration-200 outline-none
                    ${
                      showResult
                        ? isCorrect
                          ? "border-green-500 bg-green-50 text-green-800"
                          : "border-red-500 bg-red-50 text-red-800"
                        : "border-gray-200 bg-gray-50 focus:border-primary focus:bg-white focus:shadow-md"
                    }
                    ${isSubmitted ? "cursor-not-allowed" : ""}
                  `}
                />
                {showResult && !isCorrect && currentQ.correct_text_answer && (
                  <p className="mt-2 text-sm text-red-600 font-medium">
                    Correct answer: {currentQ.correct_text_answer}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ─── Check Answer button ─── */}
        {!showResult && currentQ && (
          <button
            onClick={handleSubmit}
            disabled={
              isSubmitted ||
              (currentQ.type === "text"
                ? textInput.trim() === ""
                : selectedAnswers.length === 0)
            }
            className={`
              w-full py-4 rounded-full text-xl font-bold text-white shadow-lg
              transition-all duration-200
              ${
                isSubmitted ||
                (currentQ.type === "text"
                  ? textInput.trim() === ""
                  : selectedAnswers.length === 0)
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-primary hover:bg-primary/90 active:scale-[0.98] hover:shadow-xl"
              }
            `}
          >
            Check Answer ✓
          </button>
        )}

        {/* ─── Score tracker (small, bottom) ─── */}
        <div className="mt-6 flex justify-center">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm">
            <span className="text-lg">🎯</span>
            <span className="text-sm font-semibold text-gray-600">
              Score: {score}/{totalQuestions}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
