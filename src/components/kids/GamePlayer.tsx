"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useApp } from "@/lib/store";
import { games } from "@/data/games";

// ==================== UTILITY ====================

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickRandom<T>(arr: T[], count: number): T[] {
  return shuffleArray(arr).slice(0, count);
}

// ==================== COMMON GAME BAR ====================

function GameTopBar({
  title,
  onBack,
  score,
  timer,
}: {
  title: string;
  onBack: () => void;
  score?: number;
  timer?: string;
}) {
  return (
    <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <button
        onClick={onBack}
        className="text-gray-600 hover:text-gray-800 text-lg font-bold px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
      >
        ← Back
      </button>
      <h2 className="font-bold text-gray-800 text-sm md:text-base truncate mx-4">
        {title}
      </h2>
      <div className="flex items-center gap-3 text-sm shrink-0">
        {score !== undefined && (
          <span className="bg-yellow-100 text-yellow-700 font-bold px-3 py-1 rounded-full">
            ⭐ {score}
          </span>
        )}
        {timer && (
          <span className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full">
            {timer}
          </span>
        )}
      </div>
    </div>
  );
}

function ResultScreen({
  score,
  xp,
  message,
  details,
  onPlayAgain,
  onBack,
}: {
  score: number;
  xp: number;
  message: string;
  details?: string;
  onPlayAgain: () => void;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full text-center">
        <div className="text-6xl mb-4">
          {score >= 80 ? "🏆" : score >= 50 ? "👏" : "💪"}
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {message}
        </h2>
        <p className="text-4xl font-bold text-purple-600 my-3">{score} pts</p>
        <p className="text-sm text-green-600 font-semibold">
          +{xp} XP earned!
        </p>
        {details && (
          <p className="text-sm text-gray-500 mt-2">{details}</p>
        )}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onPlayAgain}
            className="flex-1 bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-purple-700 transition-colors"
          >
            🔄 Play Again
          </button>
          <button
            onClick={onBack}
            className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
          >
            🎮 Games
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== 1. MEMORY MATCH ====================

function MemoryGame({
  onComplete,
  onBack,
}: {
  gameId: string;
  onComplete: (score: number, xp: number) => void;
  onBack: () => void;
}) {
  const [cards, setCards] = useState<
    { id: number; emoji: string; flipped: boolean; matched: boolean }[]
  >([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);
  const lockedRef = useRef(false);

  const initGame = useCallback(() => {
    const em = ["🐶", "🐱", "🐰", "🐻", "🦊", "🐸", "🐼", "🦁"];
    const pairs = em.flatMap((emoji, i) => [
      { id: i * 2, emoji, flipped: false, matched: false },
      { id: i * 2 + 1, emoji, flipped: false, matched: false },
    ]);
    setCards(shuffleArray(pairs));
    setSelected([]);
    setMoves(0);
    setFinished(false);
    setScore(0);
    lockedRef.current = false;
  }, []);

  // Initialize on mount
  useEffect(() => {
    initGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCardClick = (id: number) => {
    if (lockedRef.current) return;
    const card = cards.find((c) => c.id === id);
    if (!card || card.flipped || card.matched) return;
    if (selected.includes(id)) return;

    const newSelected = [...selected, id];
    setSelected(newSelected);
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, flipped: true } : c))
    );

    if (newSelected.length === 2) {
      setMoves((m) => m + 1);
      lockedRef.current = true;
      const [first, second] = newSelected;
      const card1 = cards.find((c) => c.id === first)!;
      const card2 = cards.find((c) => c.id === second)!;

      if (card1.emoji === card2.emoji) {
        // Match!
        setCards((prev) =>
          prev.map((c) =>
            c.id === first || c.id === second
              ? { ...c, matched: true }
              : c
          )
        );
        setSelected([]);
        lockedRef.current = false;

        // Check win - count matched after update
        setTimeout(() => {
          setCards((prev) => {
            const matchedCount = prev.filter((c) => c.matched).length;
            if (matchedCount === 16) {
              const finalMoves = moves + 1;
              const finalScore = Math.max(0, 100 - finalMoves * 5);
              setScore(finalScore);
              setFinished(true);
            }
            return prev;
          });
        }, 50);
      } else {
        // No match — flip back after 1 second
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === first || c.id === second
                ? { ...c, flipped: false }
                : c
            )
          );
          setSelected([]);
          lockedRef.current = false;
        }, 1000);
      }
    }
  };

  const completedRef = useRef(false);

  useEffect(() => {
    if (finished && !completedRef.current) {
      completedRef.current = true;
      const xp = Math.min(20, Math.floor(score / 5));
      onComplete(score, xp);
    }
  }, [finished, score, onComplete]);

  if (finished) {
    const xp = Math.min(20, Math.floor(score / 5));
    return (
      <ResultScreen
        score={score}
        xp={xp}
        message={score >= 80 ? "Amazing Memory! 🧠" : "Great Job!"}
        details={`${moves} moves`}
        onPlayAgain={() => { completedRef.current = false; initGame(); }}
        onBack={onBack}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50">
      <GameTopBar
        title="Memory Match"
        onBack={onBack}
        score={Math.max(0, 100 - moves * 5)}
      />
      <div className="max-w-md mx-auto px-4 pt-4">
        <p className="text-center text-gray-500 text-sm mb-3">
          Moves: {moves} | Pairs found:{" "}
          {cards.filter((c) => c.matched).length / 2}/8
        </p>
        <div className="grid grid-cols-4 gap-2">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className={`aspect-square rounded-xl text-3xl flex items-center justify-center font-bold transition-all duration-300 ${
                card.matched
                  ? "bg-green-100 border-2 border-green-400 scale-95"
                  : card.flipped
                  ? "bg-white border-2 border-purple-300 shadow-md"
                  : "bg-purple-500 hover:bg-purple-600 cursor-pointer shadow-md"
              }`}
              disabled={card.flipped || card.matched}
            >
              {card.flipped || card.matched ? card.emoji : "❓"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== 2. MATH RACE ====================

function MathRaceGame({
  onComplete,
  onBack,
}: {
  gameId: string;
  onComplete: (score: number, xp: number) => void;
  onBack: () => void;
}) {
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [problem, setProblem] = useState<{
    question: string;
    answer: number;
    options: number[];
  } | null>(null);
  const [solved, setSolved] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const generateProblem = useCallback(() => {
    const ops = ["+", "-", "×"];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a: number, b: number, answer: number;

    if (op === "+") {
      a = Math.floor(Math.random() * 50) + 1;
      b = Math.floor(Math.random() * 50) + 1;
      answer = a + b;
    } else if (op === "-") {
      a = Math.floor(Math.random() * 50) + 10;
      b = Math.floor(Math.random() * a) + 1;
      answer = a - b;
    } else {
      a = Math.floor(Math.random() * 12) + 1;
      b = Math.floor(Math.random() * 12) + 1;
      answer = a * b;
    }

    const options = new Set<number>([answer]);
    while (options.size < 4) {
      const offset = Math.floor(Math.random() * 10) - 5;
      const opt = answer + offset === answer ? answer + 1 : answer + offset;
      options.add(opt);
    }

    setProblem({
      question: `${a} ${op} ${b} = ?`,
      answer,
      options: shuffleArray([...options]),
    });
  }, []);

  const initGame = useCallback(() => {
    setTimeLeft(60);
    setScore(0);
    setSolved(0);
    setCorrect(0);
    setFinished(false);
    setFeedback(null);
    generateProblem();
  }, [generateProblem]);

  useEffect(() => {
    if (finished) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [finished]);

  useEffect(() => {
    if (!finished) generateProblem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnswer = (value: number) => {
    if (!problem || finished) return;
    setSolved((s) => s + 1);
    if (value === problem.answer) {
      setScore((s) => s + 10);
      setCorrect((c) => c + 1);
      setFeedback("✅ Correct!");
    } else {
      setScore((s) => Math.max(0, s - 2));
      setFeedback("❌ Wrong!");
    }
    setTimeout(() => {
      setFeedback(null);
      generateProblem();
    }, 500);
  };

  const completedRef = useRef(false);

  useEffect(() => {
    if (finished && !completedRef.current) {
      completedRef.current = true;
      const xp = Math.min(20, Math.floor(score / 5));
      onComplete(score, xp);
    }
  }, [finished, score, onComplete]);

  if (finished) {
    const accuracy = solved > 0 ? Math.round((correct / solved) * 100) : 0;
    const xp = Math.min(20, Math.floor(score / 5));
    return (
      <ResultScreen
        score={score}
        xp={xp}
        message={score >= 100 ? "Math Champion! 🏆" : "Good Try!"}
        details={`Solved: ${solved} | Correct: ${correct} | Accuracy: ${accuracy}%`}
        onPlayAgain={() => { completedRef.current = false; initGame(); }}
        onBack={onBack}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-yellow-50">
      <GameTopBar
        title="Math Race"
        onBack={onBack}
        score={score}
        timer={`${timeLeft}s`}
      />
      <div className="max-w-md mx-auto px-4 pt-8 flex flex-col items-center">
        {feedback && (
          <div
            className={`text-lg font-bold mb-4 ${
              feedback.startsWith("✅") ? "text-green-600" : "text-red-500"
            }`}
          >
            {feedback}
          </div>
        )}
        {problem && (
          <>
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 text-center w-full">
              <p className="text-sm text-gray-400 mb-2">Solve this:</p>
              <p className="text-4xl font-bold text-gray-800">
                {problem.question}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full">
              {problem.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(opt)}
                  className="bg-white hover:bg-orange-100 active:bg-orange-200 text-2xl font-bold text-gray-800 py-5 rounded-xl shadow-md transition-colors"
                >
                  {opt}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ==================== 3. WORD SCRAMBLE ====================

const WORD_LIST = [
  "APPLE", "BRAIN", "CLOUD", "DANCE", "EAGLE",
  "FLAME", "GRAPE", "HOUSE", "JUICE", "LIGHT",
  "MOUSE", "OCEAN", "PIANO", "QUEEN", "RIVER",
  "STONE", "TIGER", "WATER", "YOUTH", "ZEBRA",
];

function scrambleWord(word: string): string {
  let scrambled = word.split("");
  // Keep scrambling until it's different from the original
  for (let attempt = 0; attempt < 100; attempt++) {
    scrambled = shuffleArray(word.split(""));
    if (scrambled.join("") !== word) break;
  }
  return scrambled.join("");
}

function WordScrambleGame({
  onComplete,
  onBack,
}: {
  gameId: string;
  onComplete: (score: number, xp: number) => void;
  onBack: () => void;
}) {
  const [roundWords, setRoundWords] = useState<string[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [scrambled, setScrambled] = useState("");
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const initGame = useCallback(() => {
    const words = pickRandom(WORD_LIST, 10);
    setRoundWords(words);
    setCurrentRound(0);
    setScore(0);
    setCorrectCount(0);
    setInput("");
    setHintUsed(false);
    setShowHint(false);
    setFeedback(null);
    setFinished(false);
    setScrambled(scrambleWord(words[0]));
  }, []);

  useEffect(() => {
    initGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [currentRound]);

  const handleCheck = () => {
    if (finished || currentRound >= roundWords.length) return;
    const answer = roundWords[currentRound];
    const isCorrect = input.trim().toUpperCase() === answer;

    if (isCorrect) {
      const points = hintUsed ? 5 : 10;
      setScore((s) => s + points);
      setCorrectCount((c) => c + 1);
      setFeedback("✅ Correct!");
    } else {
      setFeedback(`❌ The word was: ${answer}`);
    }

    setTimeout(() => {
      setFeedback(null);
      const nextRound = currentRound + 1;
      if (nextRound >= 10) {
        setFinished(true);
      } else {
        setCurrentRound(nextRound);
        setInput("");
        setHintUsed(false);
        setShowHint(false);
        setScrambled(scrambleWord(roundWords[nextRound]));
      }
    }, 1200);
  };

  const handleHint = () => {
    if (currentRound < roundWords.length) {
      setShowHint(true);
      setHintUsed(true);
    }
  };

  const completedRef = useRef(false);

  useEffect(() => {
    if (finished && !completedRef.current) {
      completedRef.current = true;
      const xp = Math.min(20, Math.floor(score / 5));
      onComplete(score, xp);
    }
  }, [finished, score, onComplete]);

  if (finished) {
    const xp = Math.min(20, Math.floor(score / 5));
    return (
      <ResultScreen
        score={score}
        xp={xp}
        message={score >= 80 ? "Word Master! 📚" : "Nice Try!"}
        details={`${correctCount}/10 words correct`}
        onPlayAgain={() => { completedRef.current = false; initGame(); }}
        onBack={onBack}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-indigo-50">
      <GameTopBar
        title="Word Scramble"
        onBack={onBack}
        score={score}
        timer={`${currentRound + 1}/10`}
      />
      <div className="max-w-md mx-auto px-4 pt-8 flex flex-col items-center">
        {feedback && (
          <div
            className={`text-lg font-bold mb-4 ${
              feedback.startsWith("✅") ? "text-green-600" : "text-red-500"
            }`}
          >
            {feedback}
          </div>
        )}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 text-center w-full">
          <p className="text-sm text-gray-400 mb-3">
            Unscramble this word:
          </p>
          <p className="text-4xl font-bold text-indigo-700 tracking-[0.3em]">
            {scrambled}
          </p>
          {showHint && currentRound < roundWords.length && (
            <p className="text-sm text-gray-400 mt-3">
              Hint: starts with &quot;{roundWords[currentRound][0]}&quot;
            </p>
          )}
        </div>
        <div className="flex gap-3 w-full max-w-sm mb-4">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleCheck()}
            placeholder="Type your answer..."
            maxLength={10}
            className="flex-1 border-2 border-indigo-200 rounded-xl px-4 py-3 text-center text-lg font-bold text-gray-800 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleCheck}
            className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Check
          </button>
        </div>
        <button
          onClick={handleHint}
          className="text-sm text-indigo-400 hover:text-indigo-600 underline"
        >
          💡 Show Hint
        </button>
      </div>
    </div>
  );
}

// ==================== 4. HANGMAN ====================

const HANGMAN_WORDS: { word: string; category: string }[] = [
  { word: "SCIENCE", category: "School Subject" },
  { word: "PLANETS", category: "Space" },
  { word: "OCEAN", category: "Nature" },
  { word: "RAINBOW", category: "Weather" },
  { word: "DINOSAUR", category: "Animals" },
  { word: "VOLCANO", category: "Nature" },
  { word: "THUNDER", category: "Weather" },
  { word: "CRYSTAL", category: "Minerals" },
  { word: "PENGUIN", category: "Animals" },
  { word: "GALAXY", category: "Space" },
];

const HANGMAN_FACES = ["☺️", "😐", "😟", "😰", "😱", "💀"];

function HangmanGame({
  onComplete,
  onBack,
}: {
  gameId: string;
  onComplete: (score: number, xp: number) => void;
  onBack: () => void;
}) {
  const [wordObj, setWordObj] = useState(HANGMAN_WORDS[0]);
  const [guessed, setGuessed] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState(0);
  const [finished, setFinished] = useState(false);
  const [won, setWon] = useState(false);
  const [score, setScore] = useState(0);

  const initGame = useCallback(() => {
    const pick = HANGMAN_WORDS[Math.floor(Math.random() * HANGMAN_WORDS.length)];
    setWordObj(pick);
    setGuessed(new Set());
    setWrong(0);
    setFinished(false);
    setWon(false);
    setScore(0);
  }, []);

  useEffect(() => {
    initGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const maskedWord = wordObj.word
    .split("")
    .map((ch) => (guessed.has(ch) ? ch : "_"))
    .join(" ");

  const isWin = wordObj.word
    .split("")
    .every((ch) => guessed.has(ch));

  useEffect(() => {
    if (isWin && !finished) {
      const finalScore = Math.max(0, 100 - wrong * 15);
      setScore(finalScore);
      setWon(true);
      setFinished(true);
    }
  }, [isWin, wrong, finished]);

  const handleGuess = (letter: string) => {
    if (finished || guessed.has(letter)) return;
    const newGuessed = new Set(guessed);
    newGuessed.add(letter);
    setGuessed(newGuessed);

    if (!wordObj.word.includes(letter)) {
      const newWrong = wrong + 1;
      setWrong(newWrong);
      if (newWrong >= 6) {
        setScore(0);
        setWon(false);
        setFinished(true);
      }
    }
  };

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const completedRef = useRef(false);

  useEffect(() => {
    if (finished && !completedRef.current) {
      completedRef.current = true;
      const xp = Math.min(20, Math.floor(score / 5));
      onComplete(score, xp);
    }
  }, [finished, score, onComplete]);

  if (finished) {
    const xp = Math.min(20, Math.floor(score / 5));
    return (
      <ResultScreen
        score={score}
        xp={xp}
        message={won ? "You Saved Them! 🎉" : `The word was: ${wordObj.word}`}
        details={won ? `${wrong} wrong guesses` : "Better luck next time!"}
        onPlayAgain={() => { completedRef.current = false; initGame(); }}
        onBack={onBack}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-orange-50">
      <GameTopBar
        title="Hangman"
        onBack={onBack}
        score={Math.max(0, 100 - wrong * 15)}
      />
      <div className="max-w-md mx-auto px-4 pt-6 flex flex-col items-center">
        {/* Hangman face */}
        <div className="text-7xl mb-4">
          {HANGMAN_FACES[Math.min(wrong, 5)]}
        </div>
        <p className="text-sm text-gray-400 mb-2">
          Category: <span className="font-semibold">{wordObj.category}</span>
        </p>

        {/* Masked word */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 w-full text-center">
          <p className="text-3xl font-bold text-gray-800 tracking-[0.2em]">
            {maskedWord}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            {wrong}/6 wrong guesses
          </p>
        </div>

        {/* Alphabet grid */}
        <div className="grid grid-cols-7 gap-2 w-full max-w-sm">
          {alphabet.map((letter) => {
            const isUsed = guessed.has(letter);
            const isCorrect = isUsed && wordObj.word.includes(letter);
            const isWrong = isUsed && !wordObj.word.includes(letter);

            return (
              <button
                key={letter}
                onClick={() => handleGuess(letter)}
                disabled={isUsed}
                className={`aspect-square rounded-lg text-lg font-bold flex items-center justify-center transition-all ${
                  isCorrect
                    ? "bg-green-200 text-green-700 cursor-default"
                    : isWrong
                    ? "bg-red-100 text-red-300 cursor-default line-through"
                    : "bg-white hover:bg-red-100 text-gray-700 shadow-sm cursor-pointer active:scale-95"
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ==================== 5. NUMBER PATTERNS ====================

interface PatternRound {
  sequence: number[];
  answer: number;
  options: number[];
  display: string;
}

function generatePatternRound(roundIndex: number): PatternRound {
  const patterns: (() => PatternRound)[] = [
    // +2 pattern
    () => {
      const start = Math.floor(Math.random() * 10) + 1;
      const seq = Array.from({ length: 5 }, (_, i) => start + i * 2);
      const answer = seq[4];
      return { sequence: seq.slice(0, 4), answer, options: generateOptions(answer), display: seq.slice(0, 4).join(", ") + ", _" };
    },
    // +3 pattern
    () => {
      const start = Math.floor(Math.random() * 10) + 1;
      const seq = Array.from({ length: 5 }, (_, i) => start + i * 3);
      const answer = seq[4];
      return { sequence: seq.slice(0, 4), answer, options: generateOptions(answer), display: seq.slice(0, 4).join(", ") + ", _" };
    },
    // +5 pattern
    () => {
      const start = Math.floor(Math.random() * 5) + 1;
      const seq = Array.from({ length: 5 }, (_, i) => start + i * 5);
      const answer = seq[4];
      return { sequence: seq.slice(0, 4), answer, options: generateOptions(answer), display: seq.slice(0, 4).join(", ") + ", _" };
    },
    // ×2 pattern
    () => {
      const start = Math.floor(Math.random() * 3) + 1;
      const seq = Array.from({ length: 5 }, (_, i) => start * Math.pow(2, i));
      const answer = seq[4];
      return { sequence: seq.slice(0, 4), answer, options: generateOptions(answer), display: seq.slice(0, 4).join(", ") + ", _" };
    },
    // Fibonacci-like
    () => {
      const a = Math.floor(Math.random() * 5) + 1;
      const b = Math.floor(Math.random() * 5) + 1;
      const seq = [a, b];
      for (let i = 2; i < 6; i++) seq.push(seq[i - 1] + seq[i - 2]);
      const answer = seq[5];
      return { sequence: seq.slice(0, 5), answer, options: generateOptions(answer), display: seq.slice(0, 5).join(", ") + ", _" };
    },
    // Squares
    () => {
      const start = Math.floor(Math.random() * 3) + 1;
      const seq = Array.from({ length: 5 }, (_, i) => (start + i) * (start + i));
      const answer = seq[4];
      return { sequence: seq.slice(0, 4), answer, options: generateOptions(answer), display: seq.slice(0, 4).join(", ") + ", _" };
    },
  ];

  // Pick a pattern based on round (easier first)
  const patternIndex =
    roundIndex < 4
      ? Math.floor(Math.random() * 3) // Easy patterns
      : roundIndex < 7
      ? 3 + Math.floor(Math.random() * 2) // Medium
      : 4 + Math.floor(Math.random() * 2); // Hard
  const gen = patterns[patternIndex % patterns.length];
  return gen();
}

function generateOptions(answer: number): number[] {
  const options = new Set<number>([answer]);
  while (options.size < 4) {
    const offset = Math.floor(Math.random() * 8) - 4;
    if (offset === 0) continue;
    options.add(answer + offset);
  }
  return shuffleArray([...options]);
}

function PatternGame({
  onComplete,
  onBack,
}: {
  gameId: string;
  onComplete: (score: number, xp: number) => void;
  onBack: () => void;
}) {
  const [rounds, setRounds] = useState<PatternRound[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  const initGame = useCallback(() => {
    const generated = Array.from({ length: 10 }, (_, i) =>
      generatePatternRound(i)
    );
    setRounds(generated);
    setCurrentRound(0);
    setScore(0);
    setCorrectCount(0);
    setFeedback(null);
    setFinished(false);
  }, []);

  useEffect(() => {
    initGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnswer = (value: number) => {
    if (finished || currentRound >= rounds.length) return;
    const round = rounds[currentRound];
    const isCorrect = value === round.answer;

    if (isCorrect) {
      setScore((s) => s + 10);
      setCorrectCount((c) => c + 1);
      setFeedback("✅ Correct!");
    } else {
      setFeedback(`❌ The answer was ${round.answer}`);
    }

    setTimeout(() => {
      setFeedback(null);
      if (currentRound + 1 >= 10) {
        setFinished(true);
      } else {
        setCurrentRound((r) => r + 1);
      }
    }, 1000);
  };

  const completedRef = useRef(false);

  useEffect(() => {
    if (finished && !completedRef.current) {
      completedRef.current = true;
      const xp = Math.min(20, Math.floor(score / 5));
      onComplete(score, xp);
    }
  }, [finished, score, onComplete]);

  if (finished) {
    const xp = Math.min(20, Math.floor(score / 5));
    return (
      <ResultScreen
        score={score}
        xp={xp}
        message={score >= 80 ? "Pattern Pro! 🧩" : "Good Effort!"}
        details={`${correctCount}/10 patterns correct`}
        onPlayAgain={() => { completedRef.current = false; initGame(); }}
        onBack={onBack}
      />
    );
  }

  const round = rounds[currentRound];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-cyan-50">
      <GameTopBar
        title="Number Patterns"
        onBack={onBack}
        score={score}
        timer={`${currentRound + 1}/10`}
      />
      <div className="max-w-md mx-auto px-4 pt-8 flex flex-col items-center">
        {feedback && (
          <div
            className={`text-lg font-bold mb-4 ${
              feedback.startsWith("✅") ? "text-green-600" : "text-red-500"
            }`}
          >
            {feedback}
          </div>
        )}
        {round && (
          <>
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 text-center w-full">
              <p className="text-sm text-gray-400 mb-3">
                What comes next?
              </p>
              <p className="text-2xl md:text-3xl font-bold text-blue-700 tracking-wider">
                {round.display}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full">
              {round.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(opt)}
                  className="bg-white hover:bg-blue-100 active:bg-blue-200 text-2xl font-bold text-gray-800 py-5 rounded-xl shadow-md transition-colors"
                >
                  {opt}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ==================== 6. COLOR MATCH ====================

const COLOR_MAP: Record<string, { ink: string; bg: string; label: string }> = {
  red:    { ink: "text-red-500",    bg: "bg-red-500",    label: "RED" },
  blue:   { ink: "text-blue-500",   bg: "bg-blue-500",   label: "BLUE" },
  green:  { ink: "text-green-500",  bg: "bg-green-500",  label: "GREEN" },
  yellow: { ink: "text-yellow-500", bg: "bg-yellow-500", label: "YELLOW" },
  purple: { ink: "text-purple-500", bg: "bg-purple-500", label: "PURPLE" },
  orange: { ink: "text-orange-500", bg: "bg-orange-500", label: "ORANGE" },
};

const COLOR_NAMES = Object.keys(COLOR_MAP);

function ColorMatchGame({
  onComplete,
  onBack,
}: {
  gameId: string;
  onComplete: (score: number, xp: number) => void;
  onBack: () => void;
}) {
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [wordName, setWordName] = useState("RED");
  const [inkColor, setInkColor] = useState("blue");
  const [buttonColors, setButtonColors] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const generateRound = useCallback(() => {
    const word = COLOR_NAMES[Math.floor(Math.random() * COLOR_NAMES.length)];
    let ink = COLOR_NAMES[Math.floor(Math.random() * COLOR_NAMES.length)];
    // Make sure ink is different from word
    while (ink === word) {
      ink = COLOR_NAMES[Math.floor(Math.random() * COLOR_NAMES.length)];
    }
    setWordName(word);
    setInkColor(ink);

    // Generate 4 button options, always including the correct ink color
    const options = new Set<string>([ink]);
    while (options.size < 4) {
      options.add(COLOR_NAMES[Math.floor(Math.random() * COLOR_NAMES.length)]);
    }
    setButtonColors(shuffleArray([...options]));
  }, []);

  const initGame = useCallback(() => {
    setTimeLeft(30);
    setScore(0);
    setFinished(false);
    setFeedback(null);
    generateRound();
  }, [generateRound]);

  useEffect(() => {
    if (finished) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [finished]);

  useEffect(() => {
    if (!finished) generateRound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleColorChoice = (color: string) => {
    if (finished) return;
    if (color === inkColor) {
      setScore((s) => s + 5);
      setFeedback("✅");
    } else {
      setFeedback("❌");
    }
    setTimeout(() => {
      setFeedback(null);
      generateRound();
    }, 300);
  };

  const completedRef = useRef(false);

  useEffect(() => {
    if (finished && !completedRef.current) {
      completedRef.current = true;
      const xp = Math.min(20, Math.floor(score / 5));
      onComplete(score, xp);
    }
  }, [finished, score, onComplete]);

  if (finished) {
    const xp = Math.min(20, Math.floor(score / 5));
    return (
      <ResultScreen
        score={score}
        xp={xp}
        message={score >= 60 ? "Color Expert! 🎨" : "Keep Practicing!"}
        details={`${score / 5} correct answers`}
        onPlayAgain={() => { completedRef.current = false; initGame(); }}
        onBack={onBack}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-teal-50">
      <GameTopBar
        title="Color Match"
        onBack={onBack}
        score={score}
        timer={`${timeLeft}s`}
      />
      <div className="max-w-md mx-auto px-4 pt-8 flex flex-col items-center">
        <p className="text-sm text-gray-400 mb-2">
          Click the <strong>INK COLOR</strong>, not the word!
        </p>

        {feedback && (
          <div
            className={`text-3xl font-bold mb-2 ${
              feedback === "✅" ? "text-green-600" : "text-red-500"
            }`}
          >
            {feedback}
          </div>
        )}

        {/* The Stroop word */}
        <div className="bg-white rounded-2xl shadow-lg p-10 mb-8 text-center w-full">
          <p
            className={`text-5xl font-black ${COLOR_MAP[inkColor].ink}`}
          >
            {COLOR_MAP[wordName].label}
          </p>
        </div>

        {/* Color buttons */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          {buttonColors.map((color) => (
            <button
              key={color}
              onClick={() => handleColorChoice(color)}
              className={`${COLOR_MAP[color].bg} text-white font-bold py-5 rounded-xl shadow-md hover:opacity-80 active:scale-95 transition-all text-lg`}
            >
              {COLOR_MAP[color].label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== MAIN GAME PLAYER ====================

export default function GamePlayer() {
  const { state, completeGame, navigate } = useApp();

  const gameId = state.selectedGameId;
  const game = games.find((g) => g.game_id === gameId);

  const handleComplete = useCallback(
    (score: number, xp: number) => {
      if (gameId) {
        completeGame(gameId, score, xp);
      }
    },
    [gameId, completeGame]
  );

  const handleBack = useCallback(() => {
    navigate("games");
  }, [navigate]);

  // Fallback if no game selected
  if (!game || !gameId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-xl text-gray-500 mb-4">No game selected</p>
          <button
            onClick={() => navigate("games")}
            className="bg-purple-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors"
          >
            Back to Games
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {game.type === "memory" && (
        <MemoryGame
          gameId={gameId}
          onComplete={handleComplete}
          onBack={handleBack}
        />
      )}
      {game.type === "math-race" && (
        <MathRaceGame
          gameId={gameId}
          onComplete={handleComplete}
          onBack={handleBack}
        />
      )}
      {game.type === "word-scramble" && (
        <WordScrambleGame
          gameId={gameId}
          onComplete={handleComplete}
          onBack={handleBack}
        />
      )}
      {game.type === "hangman" && (
        <HangmanGame
          gameId={gameId}
          onComplete={handleComplete}
          onBack={handleBack}
        />
      )}
      {game.type === "pattern" && (
        <PatternGame
          gameId={gameId}
          onComplete={handleComplete}
          onBack={handleBack}
        />
      )}
      {game.type === "color-match" && (
        <ColorMatchGame
          gameId={gameId}
          onComplete={handleComplete}
          onBack={handleBack}
        />
      )}
    </div>
  );
}
