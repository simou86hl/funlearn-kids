"use client";
import React from "react";
import { useApp } from "@/lib/store";
import { quizzes } from "@/data/quizzes";
import { games } from "@/data/games";
import { ChevronRight, Play, ArrowRight } from "lucide-react";

const categories = [
  { name: "Math", emoji: "🧮", color: "#F97316" },
  { name: "Science", emoji: "🔬", color: "#22C55E" },
  { name: "English", emoji: "📚", color: "#8B5CF6" },
  { name: "Geography", emoji: "🌍", color: "#3B82F6" },
  { name: "Logic", emoji: "🧩", color: "#EC4899" },
];

const CategoryCard = React.memo(function CategoryCard({ cat, count, onClick }: {
  cat: typeof categories[0];
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 w-24 sm:w-28 h-28 sm:h-32 rounded-2xl flex flex-col items-center justify-center gap-1 text-white shadow-lg card-hover active:scale-95 transition-all relative overflow-hidden"
      style={{ backgroundColor: cat.color }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
      <span className="text-2xl sm:text-3xl relative z-10 animate-float">{cat.emoji}</span>
      <span className="font-bold text-xs sm:text-sm relative z-10">{cat.name}</span>
      <span className="text-[10px] opacity-80 relative z-10">{count} quizzes</span>
      <ChevronRight className="absolute top-3 right-2 w-4 h-4 opacity-50" />
    </button>
  );
});

export default function HomeView() {
  const { state, navigate, startQuiz, startGame } = useApp();
  const { progress, profileName, profileAvatar } = state;

  const xpInLevel = progress.totalXP % 100;
  const isBrandNew =
    progress.quizzesCompleted.length === 0 &&
    progress.gamesPlayed.length === 0 &&
    progress.todayActivities === 0;

  const categoryCounts: Record<string, number> = {};
  for (const quiz of quizzes) {
    categoryCounts[quiz.category] = (categoryCounts[quiz.category] || 0) + 1;
  }

  const todayProgress = Math.min(progress.todayActivities / 5, 1);
  const circumference = 2 * Math.PI * 36;

  const getMotivation = () => {
    if (todayProgress >= 1) return "Amazing! Daily goal complete!";
    if (todayProgress >= 0.6) return "Almost there! Keep going!";
    if (todayProgress >= 0.2) return "Great start! You've got this!";
    return "Ready to learn today?";
  };

  // Quick play recommendations: pick quiz not completed, game not played
  const unplayedQuiz = quizzes.find((q) => !progress.quizzesCompleted.includes(String(q.quiz_id)));
  const unplayedGame = games.find((g) => !progress.gamesPlayed.includes(g.game_id));

  return (
    <div className="space-y-8 pb-8">
      {/* Brand new user welcome */}
      {isBrandNew ? (
        <div className="animate-slide-up">
          <div className="empty-state-card rounded-3xl p-8 sm:p-10 text-center">
            <span className="text-6xl block mb-4 animate-bounce-slow">🌟</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display mb-2 gradient-text">
              Welcome to FunLearn!
            </h1>
            <p className="text-muted-foreground text-lg mb-6 max-w-md mx-auto">
              Hey {profileName}! Ready to start your learning adventure? Let&apos;s go!
            </p>
            <button
              onClick={() => navigate("quizzes")}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-8 py-4 rounded-full text-lg font-bold shadow-lg shadow-violet-500/20 hover:opacity-90 transition-all active:scale-95 animate-glow"
            >
              <Play className="w-5 h-5 fill-current" />
              Take Your First Quiz
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Compact Welcome Card */}
          <div className="animate-slide-up" style={{ opacity: 0 }}>
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-100 to-fuchsia-100 flex items-center justify-center text-3xl flex-shrink-0 ring-2 ring-violet-200">
                {profileAvatar}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-extrabold text-gray-800 font-display truncate">
                  Hi, {profileName}!
                </h1>
                <p className="text-sm text-muted-foreground">
                  Level {progress.level} &bull; {xpInLevel}/100 XP
                </p>
                {/* Mini XP bar */}
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-400 to-fuchsia-500 rounded-full transition-all duration-500"
                    style={{ width: `${xpInLevel}%` }}
                  />
                </div>
              </div>
              {progress.streak > 0 && (
                <div className="flex-shrink-0 text-center">
                  <span className="text-2xl block">🔥</span>
                  <span className="text-xs font-bold text-orange-500">{progress.streak}d</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Play */}
          {(unplayedQuiz || unplayedGame) && (
            <div className="animate-slide-up delay-100" style={{ opacity: 0 }}>
              <h2 className="text-lg font-bold mb-3 font-display">Quick Play</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {unplayedQuiz && (
                  <button
                    onClick={() => startQuiz(unplayedQuiz.quiz_id)}
                    className="bg-white rounded-2xl p-4 shadow-sm text-left card-hover active:scale-[0.97] flex items-center gap-4 group"
                  >
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0"
                      style={{ backgroundColor: `${unplayedQuiz.color}15` }}
                    >
                      {unplayedQuiz.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recommended Quiz</p>
                      <h3 className="font-bold text-sm text-gray-800 truncate">{unplayedQuiz.title}</h3>
                      <p className="text-xs text-muted-foreground">{unplayedQuiz.questions.length} questions</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-violet-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </button>
                )}
                {unplayedGame && (
                  <button
                    onClick={() => startGame(unplayedGame.game_id)}
                    className="bg-white rounded-2xl p-4 shadow-sm text-left card-hover active:scale-[0.97] flex items-center gap-4 group"
                  >
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0"
                      style={{ backgroundColor: `${unplayedGame.color}15` }}
                    >
                      {unplayedGame.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Try a Game</p>
                      <h3 className="font-bold text-sm text-gray-800 truncate">{unplayedGame.title}</h3>
                      <p className="text-xs text-muted-foreground">{unplayedGame.plays.toLocaleString()} plays</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-violet-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Today's Progress */}
      {!isBrandNew && (
        <div className="bg-white rounded-2xl p-5 shadow-sm animate-slide-up delay-200" style={{ opacity: 0 }}>
          <h2 className="text-lg font-bold mb-3 font-display">Today&apos;s Progress</h2>
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 flex-shrink-0">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="36" stroke="#f0ecf9" strokeWidth="10" fill="none" />
                <circle
                  cx="50" cy="50" r="36"
                  stroke="url(#homeProgressGrad)" strokeWidth="10" fill="none"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - todayProgress)}
                  className="transition-all duration-700 ease-out"
                />
                <defs>
                  <linearGradient id="homeProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#d946ef" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-lg font-extrabold">
                {progress.todayActivities}
              </span>
            </div>
            <div>
              <p className="text-xl font-extrabold text-gray-800">
                {progress.todayActivities}/5
              </p>
              <p className="text-muted-foreground text-sm">activities completed</p>
              <p className="text-sm font-medium text-primary mt-0.5">{getMotivation()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Category Cards */}
      <div className="animate-slide-up delay-300" style={{ opacity: 0 }}>
        <h2 className="text-lg font-bold mb-3 font-display">Explore Categories</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
          {categories.map((cat) => (
            <div key={cat.name} className="snap-start">
              <CategoryCard cat={cat} count={categoryCounts[cat.name] || 0} onClick={() => navigate("quizzes")} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
