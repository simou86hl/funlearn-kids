"use client";
import React from "react";
import { useState, useMemo } from "react";
import { useApp } from "@/lib/store";
import { quizzes } from "@/data/quizzes";
import { Search, X } from "lucide-react";

const categoryFilters = ["All", "Math", "Science", "English", "Geography", "Logic"];
const ageFilters = ["All Ages", "5-7", "8-10", "11-13"];
const difficultyFilters = [
  { key: "All", label: "All Levels" },
  { key: "easy", label: "Easy" },
  { key: "medium", label: "Medium" },
  { key: "hard", label: "Hard" },
];
const sortOptions = [
  { key: "popular", label: "Popular" },
  { key: "newest", label: "Newest" },
  { key: "easiest", label: "Easiest" },
  { key: "hardest", label: "Hardest" },
];

const categoryColors: Record<string, string> = {
  Math: "#F97316",
  Science: "#22C55E",
  English: "#8B5CF6",
  Geography: "#3B82F6",
  Logic: "#EC4899",
};

const difficultyBadge: Record<string, { label: string; cls: string }> = {
  easy:   { label: "Easy",   cls: "bg-emerald-100 text-emerald-700" },
  medium: { label: "Medium", cls: "bg-amber-100 text-amber-700" },
  hard:   { label: "Hard",   cls: "bg-red-100 text-red-700" },
};

const QuizCard = React.memo(function QuizCard({ quiz, isCompleted, score, onClick }: {
  quiz: typeof quizzes[0];
  isCompleted: boolean;
  score: number | undefined;
  onClick: () => void;
}) {
  const diff = difficultyBadge[quiz.difficulty];
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden shadow-sm text-left card-hover active:scale-[0.97] relative group"
    >
      <div className="h-2 w-full" style={{ backgroundColor: quiz.color }} />
      <div className="p-4">
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
        <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{quiz.description}</p>

        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="inline-block text-[10px] font-semibold text-white rounded-full px-2 py-0.5"
            style={{ backgroundColor: categoryColors[quiz.category] ?? "#6B7280" }}
          >
            {quiz.category}
          </span>
          {diff && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${diff.cls}`}>
              {diff.label}
            </span>
          )}
          <span className="text-xs text-muted-foreground">{quiz.age_group} &middot; {quiz.questions.length}Q</span>
        </div>

        <p className="text-xs text-muted-foreground mt-1.5">{quiz.avg_score}% avg &middot; {quiz.total_submissions.toLocaleString()} plays</p>
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

  const hasActiveFilters = categoryFilter !== "All" || ageFilter !== "All Ages" || difficultyFilter !== "All" || searchQuery !== "";

  const clearFilters = () => {
    setCategoryFilter("All");
    setAgeFilter("All Ages");
    setDifficultyFilter("All");
    setSearchQuery("");
  };

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
        <h1 className="text-2xl font-extrabold font-display">All Quizzes</h1>
        <p className="text-muted-foreground mt-1">
          {quizzes.length} Quizzes &middot; {statsCategories.size} Categories &middot; {quizzes.reduce((s, q) => s + q.questions.length, 0)} Questions
        </p>
      </div>

      {/* Search */}
      <div className="relative animate-slide-up delay-100" style={{ opacity: 0 }}>
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search quizzes..."
          className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Category Filter Pills */}
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

      {/* Age & Difficulty Filters */}
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
        <span className="w-px bg-gray-200 flex-shrink-0 self-stretch" />
        {difficultyFilters.map((d) => {
          const isActive = difficultyFilter === d.key;
          return (
            <button
              key={d.key}
              onClick={() => setDifficultyFilter(d.key)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 ${
                isActive
                  ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {d.label}
            </button>
          );
        })}
      </div>

      {/* Sort */}
      <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide animate-slide-up delay-300" style={{ opacity: 0 }}>
        <span className="text-xs font-semibold text-gray-400 flex-shrink-0">Sort:</span>
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

      {/* Results count */}
      <div className="flex items-center justify-between animate-slide-up delay-300" style={{ opacity: 0 }}>
        <p className="text-sm font-medium text-muted-foreground">
          Showing <span className="text-primary font-bold">{filteredQuizzes.length}</span> of {quizzes.length} quizzes
        </p>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs font-semibold text-violet-600 hover:text-violet-700 transition-colors flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Clear Filters
          </button>
        )}
      </div>

      {/* Quiz Grid */}
      {filteredQuizzes.length === 0 ? (
        <div className="text-center py-16 animate-scale-in">
          <div className="empty-state-card rounded-3xl p-8 max-w-sm mx-auto">
            <span className="text-6xl block mb-4">🔍</span>
            <p className="text-xl font-bold text-gray-700 font-display mb-2">No quizzes match your filters</p>
            <p className="text-muted-foreground text-sm mb-4">Try adjusting your search or filters</p>
            <button
              onClick={clearFilters}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-sm font-bold shadow-md hover:opacity-90 transition-all active:scale-95"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
