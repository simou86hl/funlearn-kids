"use client";
import React from "react";
import { useState, useMemo } from "react";
import { useApp } from "@/lib/store";
import { quizzes } from "@/data/quizzes";
import { Search } from "lucide-react";

const categoryFilters = ["All", "Math", "Science", "English", "Geography", "Logic"];
const ageFilters = ["All Ages", "5-7", "8-10", "11-13"];
const difficultyFilters = ["All", "easy", "medium", "hard"];
const sortOptions = [
  { key: "popular", label: "🔥 Popular" },
  { key: "newest", label: "🆕 Newest" },
  { key: "easiest", label: "🟢 Easiest" },
  { key: "hardest", label: "🔴 Hardest" },
];

const categoryColors: Record<string, string> = {
  Math: "#F97316",
  Science: "#22C55E",
  English: "#8B5CF6",
  Geography: "#3B82F6",
  Logic: "#EC4899",
};

const difficultyLabels: Record<string, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

function DifficultyDots({ difficulty }: { difficulty: string }) {
  const level = difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3;
  return (
    <span className="flex items-center gap-1">
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={`w-2 h-2 rounded-full ${i <= level ? "bg-violet-500" : "bg-gray-200"}`}
        />
      ))}
    </span>
  );
}

const QuizCard = React.memo(function QuizCard({ quiz, isCompleted, score, onClick }: {
  quiz: typeof quizzes[0];
  isCompleted: boolean;
  score: number | undefined;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden shadow-sm text-left card-hover active:scale-[0.97] relative group"
    >
      {/* Gradient top strip */}
      <div
        className="h-2 w-full"
        style={{ backgroundColor: quiz.color }}
      />

      <div className="p-4">
        {/* Badges */}
        <div className="flex items-center justify-between mb-2">
          {isCompleted && (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              ✅ Done
            </span>
          )}
          {isCompleted && score !== undefined && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              score >= 80 ? "text-emerald-600 bg-emerald-50" : score >= 50 ? "text-amber-600 bg-amber-50" : "text-red-500 bg-red-50"
            }`}>
              {score}%
            </span>
          )}
        </div>

        <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">{quiz.emoji}</span>

        <h3 className="font-bold text-base leading-tight mb-1 line-clamp-2">{quiz.title}</h3>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{quiz.description}</p>

        <span
          className="inline-block text-[10px] font-semibold text-white rounded-full px-2 py-0.5 mb-2"
          style={{ backgroundColor: categoryColors[quiz.category] ?? "#6B7280" }}
        >
          {quiz.category}
        </span>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium">{quiz.age_group}</span>
          <DifficultyDots difficulty={quiz.difficulty} />
          <span className="text-xs">{quiz.questions.length}Q</span>
        </div>

        <p className="text-xs text-muted-foreground mt-1">{quiz.avg_score}% avg score</p>
      </div>
    </button>
  );
});

export default function QuizBrowser() {
  const { startQuiz, state } = useApp();
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [ageFilter, setAgeFilter] = useState("All Ages");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [sortBy, setSortBy] = useState("popular");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredQuizzes = useMemo(() => {
    let result = quizzes.filter((quiz) => {
      const matchCategory = categoryFilter === "All" || quiz.category === categoryFilter;
      const matchAge = ageFilter === "All Ages" || quiz.age_group === ageFilter;
      const matchDifficulty = difficultyFilter === "All" || quiz.difficulty === difficultyFilter;
      const matchSearch = searchQuery === "" ||
        quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchAge && matchDifficulty && matchSearch;
    });

    switch (sortBy) {
      case "popular": result.sort((a, b) => b.total_submissions - a.total_submissions); break;
      case "newest": result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); break;
      case "easiest": result.sort((a, b) => a.avg_score - b.avg_score); break;
      case "hardest": result.sort((a, b) => b.avg_score - a.avg_score); break;
    }

    return result;
  }, [categoryFilter, ageFilter, difficultyFilter, sortBy, searchQuery]);

  const completedIds = new Set(state.progress.quizzesCompleted);

  const statsCategories = new Set(quizzes.map((q) => q.category));

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="animate-slide-up" style={{ opacity: 0 }}>
        <h1 className="text-2xl font-extrabold font-display">📝 All Quizzes</h1>
        <p className="text-muted-foreground mt-1">
          {quizzes.length} Quizzes · {statsCategories.size} Categories · {quizzes.reduce((s, q) => s + q.questions.length, 0)} Questions
        </p>
      </div>

      {/* Search */}
      <div className="relative animate-slide-up delay-100" style={{ opacity: 0 }}>
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search quizzes..."
          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all"
        />
      </div>

      {/* Filter Pills — Category */}
      <div className="animate-slide-up delay-200" style={{ opacity: 0 }}>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categoryFilters.map((cat) => {
            const isActive = categoryFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all active:scale-95 ${
                  isActive
                    ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-md"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Pills — Age & Difficulty */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide animate-slide-up delay-200" style={{ opacity: 0 }}>
        {ageFilters.map((age) => {
          const isActive = ageFilter === age;
          return (
            <button
              key={age}
              onClick={() => setAgeFilter(age)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 ${
                isActive
                  ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {age}
            </button>
          );
        })}
        <span className="w-px bg-gray-200 flex-shrink-0" />
        {difficultyFilters.map((d) => {
          const isActive = difficultyFilter === d;
          return (
            <button
              key={d}
              onClick={() => setDifficultyFilter(d)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 ${
                isActive
                  ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {d === "All" ? d : difficultyLabels[d]}
            </button>
          );
        })}
      </div>

      {/* Sort */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide animate-slide-up delay-300" style={{ opacity: 0 }}>
        {sortOptions.map((opt) => {
          const isActive = sortBy === opt.key;
          return (
            <button
              key={opt.key}
              onClick={() => setSortBy(opt.key)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 ${
                isActive
                  ? "bg-violet-100 text-violet-700 border border-violet-300"
                  : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Quiz Grid */}
      {filteredQuizzes.length === 0 ? (
        <div className="text-center py-16 animate-scale-in">
          <p className="text-6xl mb-4">🤔</p>
          <p className="text-xl font-bold text-gray-600 font-display">No quizzes found!</p>
          <p className="text-muted-foreground mt-1">Try changing your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {filteredQuizzes.map((quiz, idx) => {
            const isCompleted = completedIds.has(String(quiz.quiz_id));
            return (
              <div
                key={quiz.quiz_id}
                className="animate-slide-up"
                style={{ opacity: 0, animationDelay: `${Math.min(idx * 50, 300)}ms` }}
              >
                <QuizCard
                  quiz={quiz}
                  isCompleted={isCompleted}
                  score={state.progress.quizScores[String(quiz.quiz_id)]}
                  onClick={() => startQuiz(quiz.quiz_id)}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
