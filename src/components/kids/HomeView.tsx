"use client";

import { useApp } from "@/lib/store";
import { quizzes } from "@/data/quizzes";
import { games } from "@/data/games";

const categories = [
  { name: "Math", emoji: "🧮", color: "#F97316" },
  { name: "Science", emoji: "🔬", color: "#22C55E" },
  { name: "English", emoji: "📚", color: "#8B5CF6" },
  { name: "Geography", emoji: "🌍", color: "#3B82F6" },
  { name: "Logic", emoji: "🧩", color: "#EC4899" },
];

function DifficultyStars({ difficulty }: { difficulty: string }) {
  const level =
    difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3;
  return (
    <span className="text-lg">
      {"⭐".repeat(level)}
      {"☆".repeat(3 - level)}
    </span>
  );
}

export default function HomeView() {
  const { state, navigate, startQuiz, startGame } = useApp();
  const { progress, profileName, profileAvatar } = state;

  const xpInLevel = progress.totalXP % 100;
  const featuredQuizzes = quizzes.slice(0, 6);

  const categoryCounts: Record<string, number> = {};
  for (const quiz of quizzes) {
    categoryCounts[quiz.category] = (categoryCounts[quiz.category] || 0) + 1;
  }

  return (
    <div className="space-y-6 pb-8">
      {/* ===== Welcome Banner ===== */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">
          Welcome back, {profileName}! {profileAvatar}
        </h1>

        <p className="text-white/90 text-lg mb-2">
          Level {progress.level} &bull; {xpInLevel}/100 XP to next level
        </p>

        {/* XP progress bar */}
        <div className="w-full bg-white/30 rounded-full h-4 mb-3">
          <div
            className="bg-white rounded-full h-4 transition-all duration-500"
            style={{ width: `${xpInLevel}%` }}
          />
        </div>

        {/* Streak */}
        {progress.streak > 0 && (
          <p className="text-xl font-semibold">
            🔥 {progress.streak} day streak!
          </p>
        )}
      </div>

      {/* ===== Daily Progress Card ===== */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-4">Today&apos;s Progress</h2>
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke="#E5E7EB"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke="#8B5CF6"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 34}`}
                strokeDashoffset={`${2 * Math.PI * 34 * (1 - Math.min(progress.todayActivities / 5, 1))}`}
                className="transition-all duration-500"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">
              {progress.todayActivities}
            </span>
          </div>
          <div>
            <p className="text-2xl font-bold">
              {progress.todayActivities}/5
            </p>
            <p className="text-muted-foreground text-lg">
              activities completed
            </p>
          </div>
        </div>
      </div>

      {/* ===== Category Cards ===== */}
      <div>
        <h2 className="text-xl font-bold mb-3">Explore Categories</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => navigate("quizzes")}
              className="flex-shrink-0 w-28 h-32 rounded-2xl flex flex-col items-center justify-center gap-1 text-white shadow-md active:scale-95 transition-transform"
              style={{ backgroundColor: cat.color }}
            >
              <span className="text-3xl">{cat.emoji}</span>
              <span className="font-bold text-sm">{cat.name}</span>
              <span className="text-xs opacity-80">
                {categoryCounts[cat.name] || 0} quizzes
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ===== Featured Quizzes ===== */}
      <div>
        <h2 className="text-xl font-bold mb-3">Featured Quizzes</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {featuredQuizzes.map((quiz) => (
            <button
              key={quiz.quiz_id}
              onClick={() => startQuiz(quiz.quiz_id)}
              className="bg-white rounded-2xl p-4 shadow-sm text-left hover:-translate-y-1 transition-transform active:scale-[0.98]"
            >
              <span className="text-3xl block mb-2">{quiz.emoji}</span>
              <h3 className="font-bold text-base leading-tight mb-1 line-clamp-2">
                {quiz.title}
              </h3>
              <span
                className="inline-block text-xs font-semibold text-white rounded-full px-2 py-0.5 mb-1"
                style={{ backgroundColor: quiz.color }}
              >
                {quiz.category}
              </span>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{quiz.age_group}</span>
                <DifficultyStars difficulty={quiz.difficulty} />
              </div>
              <p className="text-sm font-semibold text-muted-foreground mt-1">
                {quiz.avg_score}% avg
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* ===== Popular Games ===== */}
      <div>
        <h2 className="text-xl font-bold mb-3">Popular Games</h2>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {games.map((game) => (
            <button
              key={game.game_id}
              onClick={() => startGame(game.game_id)}
              className="flex-shrink-0 w-36 bg-white rounded-2xl p-4 shadow-sm text-center hover:-translate-y-1 transition-transform active:scale-[0.98]"
            >
              <span className="text-4xl block mb-2">{game.emoji}</span>
              <h3 className="font-bold text-sm leading-tight mb-1">
                {game.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {game.plays.toLocaleString()} plays
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
