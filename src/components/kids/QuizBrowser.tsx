"use client";

import { useState, useMemo } from "react";
import { useApp } from "@/lib/store";
import { quizzes } from "@/data/quizzes";

const categoryFilters = ["All", "Math", "Science", "English", "Geography", "Logic"];

const ageFilters = ["All Ages", "5-7", "8-10", "11-13"];

const categoryColors: Record<string, string> = {
  Math: "#F97316",
  Science: "#22C55E",
  English: "#8B5CF6",
  Geography: "#3B82F6",
  Logic: "#EC4899",
};

function DifficultyStars({ difficulty }: { difficulty: string }) {
  const level =
    difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3;
  return (
    <span className="text-base">
      {"⭐".repeat(level)}
      {"☆".repeat(3 - level)}
    </span>
  );
}

export default function QuizBrowser() {
  const { startQuiz, state } = useApp();
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [ageFilter, setAgeFilter] = useState("All Ages");

  const filteredQuizzes = useMemo(() => {
    return quizzes.filter((quiz) => {
      const matchCategory =
        categoryFilter === "All" || quiz.category === categoryFilter;
      const matchAge =
        ageFilter === "All Ages" || quiz.age_group === ageFilter;
      return matchCategory && matchAge;
    });
  }, [categoryFilter, ageFilter]);

  const completedIds = new Set(state.progress.quizzesCompleted);

  return (
    <div className="space-y-5 pb-8">
      {/* ===== Header ===== */}
      <div>
        <h1 className="text-2xl font-bold">📝 All Quizzes</h1>
        <p className="text-muted-foreground text-lg">
          {filteredQuizzes.length} quiz{filteredQuizzes.length !== 1 ? "zes" : ""} available
        </p>
      </div>

      {/* ===== Category Filter Row ===== */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {categoryFilters.map((cat) => {
          const isActive = categoryFilter === cat;
          return (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* ===== Age Filter Row ===== */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {ageFilters.map((age) => {
          const isActive = ageFilter === age;
          return (
            <button
              key={age}
              onClick={() => setAgeFilter(age)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-pink-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {age}
            </button>
          );
        })}
      </div>

      {/* ===== Quiz Grid ===== */}
      {filteredQuizzes.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🤔</p>
          <p className="text-xl font-semibold text-muted-foreground">
            No quizzes found!
          </p>
          <p className="text-muted-foreground mt-1">
            Try changing your filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filteredQuizzes.map((quiz) => {
            const isCompleted = completedIds.has(String(quiz.quiz_id));
            return (
              <button
                key={quiz.quiz_id}
                onClick={() => startQuiz(quiz.quiz_id)}
                className="bg-white rounded-2xl p-4 shadow-sm text-left hover:-translate-y-1 transition-transform active:scale-[0.98] relative"
              >
                {/* Completion checkmark */}
                {isCompleted && (
                  <span className="absolute top-3 right-3 text-xl">
                    ✅
                  </span>
                )}

                <span className="text-4xl block mb-2">{quiz.emoji}</span>

                <h3 className="font-bold text-base leading-tight mb-1 line-clamp-2">
                  {quiz.title}
                </h3>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {quiz.description}
                </p>

                <span
                  className="inline-block text-xs font-semibold text-white rounded-full px-2 py-0.5 mb-2"
                  style={{
                    backgroundColor: categoryColors[quiz.category] ?? "#6B7280",
                  }}
                >
                  {quiz.category}
                </span>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-medium">{quiz.age_group}</span>
                  <DifficultyStars difficulty={quiz.difficulty} />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
