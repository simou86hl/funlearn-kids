"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useApp } from "@/lib/store";
import { achievements } from "@/data/achievements";
import { quizzes } from "@/data/quizzes";

const AVATAR_OPTIONS = [
  "🦁",
  "🐼",
  "🦊",
  "🐸",
  "🦄",
  "🐯",
  "🐱",
  "🐶",
  "🐰",
  "🦉",
  "🐨",
  "🐵",
];

const ACHIEVEMENT_CATEGORIES = [
  { key: "quizzes", label: "📚 Quizzes", color: "from-blue-400 to-indigo-500" },
  { key: "games", label: "🎮 Games", color: "from-pink-400 to-rose-500" },
  { key: "streak", label: "🔥 Streak", color: "from-orange-400 to-red-500" },
  { key: "xp", label: "⭐ XP", color: "from-yellow-400 to-amber-500" },
  { key: "subjects", label: "🌍 Subjects", color: "from-green-400 to-emerald-500" },
];

export default function ProfileView() {
  const { state, setProfile, dispatch } = useApp();
  const { progress, profileName, profileAvatar } = state;

  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(profileName);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing
  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  // Calculate level progress
  const currentLevel = progress.level;
  const xpForCurrentLevel = (currentLevel - 1) * 100;
  const xpForNextLevel = currentLevel * 100;
  const xpInLevel = progress.totalXP - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;
  const levelProgress = Math.min((xpInLevel / xpNeeded) * 100, 100);

  // Group achievements by category
  const achievementsByCategory = useMemo(() => {
    const grouped: Record<string, typeof achievements> = {};
    ACHIEVEMENT_CATEGORIES.forEach((cat) => {
      grouped[cat.key] = achievements.filter((a) => a.category === cat.key);
    });
    return grouped;
  }, []);

  // Get completed quizzes with scores
  const completedQuizData = useMemo(() => {
    return progress.quizzesCompleted
      .map((quizId) => {
        const quiz = quizzes.find((q) => String(q.quiz_id) === quizId);
        const score = progress.quizScores[quizId];
        if (!quiz || score === undefined) return null;
        return { ...quiz, score };
      })
      .filter(Boolean)
      .reverse(); // Most recent first
  }, [progress.quizzesCompleted, progress.quizScores]);

  const handleNameSave = () => {
    const trimmed = editName.trim();
    if (trimmed.length > 0 && trimmed.length <= 20) {
      setProfile(trimmed, profileAvatar);
    } else {
      setEditName(profileName);
    }
    setIsEditingName(false);
  };

  const handleAvatarChange = (avatar: string) => {
    setProfile(profileName, avatar);
    setShowAvatarPicker(false);
  };

  const handleResetProgress = () => {
    if (window.confirm("Are you sure you want to reset ALL your progress? This cannot be undone! 🚨")) {
      if (window.confirm("Really? You'll lose all your XP, streaks, and achievements! 😢")) {
        localStorage.removeItem("kidlearn-progress");
        dispatch({ type: "LOAD_STATE" });
      }
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500 bg-green-100";
    if (score >= 50) return "text-yellow-600 bg-yellow-100";
    return "text-red-500 bg-red-100";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-indigo-50 pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6 space-y-6">
        {/* ===== PROFILE HEADER ===== */}
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex flex-col items-center gap-3">
            {/* Avatar */}
            <button
              onClick={() => setShowAvatarPicker(!showAvatarPicker)}
              className="relative group"
            >
              <span className="text-6xl block group-hover:scale-110 transition-transform">
                {profileAvatar}
              </span>
              <span className="absolute -bottom-1 -right-1 bg-white text-purple-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-md">
                ✏️
              </span>
            </button>

            {/* Avatar Picker */}
            {showAvatarPicker && (
              <div className="bg-white rounded-xl p-3 shadow-xl animate-fade-in">
                <p className="text-xs font-bold text-gray-500 text-center mb-2">
                  Choose your avatar!
                </p>
                <div className="grid grid-cols-6 gap-1">
                  {AVATAR_OPTIONS.map((avatar) => (
                    <button
                      key={avatar}
                      onClick={() => handleAvatarChange(avatar)}
                      className={`text-2xl p-1.5 rounded-lg hover:bg-purple-100 transition-colors ${
                        profileAvatar === avatar
                          ? "bg-purple-200 ring-2 ring-purple-400"
                          : ""
                      }`}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Editable Name */}
            <div className="text-center">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    ref={nameInputRef}
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleNameSave();
                      if (e.key === "Escape") {
                        setEditName(profileName);
                        setIsEditingName(false);
                      }
                    }}
                    maxLength={20}
                    className="bg-white/20 border-2 border-white/40 rounded-lg px-3 py-1 text-white text-center font-bold text-lg outline-none focus:border-white placeholder-white/60"
                    placeholder="Your name"
                  />
                  <button
                    onClick={handleNameSave}
                    className="bg-green-400 hover:bg-green-500 text-white rounded-lg px-3 py-1.5 text-sm font-bold transition-colors"
                  >
                    ✓
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setEditName(profileName);
                    setIsEditingName(true);
                  }}
                  className="text-2xl font-extrabold hover:opacity-80 transition-opacity"
                >
                  {profileName} ✏️
                </button>
              )}
            </div>

            {/* Level Badge & Progress */}
            <div className="w-full bg-white/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold">
                  🏆 Level {currentLevel}
                </span>
                <span className="text-sm font-semibold">
                  {progress.totalXP} Total XP
                </span>
              </div>
              <div className="bg-white/30 rounded-full h-4 overflow-hidden">
                <div
                  className="progress-bar-animated bg-gradient-to-r from-yellow-300 to-amber-400 h-full rounded-full flex items-center justify-end pr-1"
                  style={{ width: `${levelProgress}%` }}
                >
                  {levelProgress > 20 && (
                    <span className="text-[10px] font-bold text-amber-800">
                      {Math.round(levelProgress)}%
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs text-purple-200 mt-1 text-center">
                {xpNeeded - xpInLevel} XP to Level {currentLevel + 1}
              </p>
            </div>
          </div>
        </div>

        {/* ===== STATS GRID ===== */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-4 text-center border-2 border-purple-100 kid-card">
            <span className="text-3xl block">📝</span>
            <span className="text-2xl font-extrabold text-purple-600 block">
              {progress.quizzesCompleted.length}
            </span>
            <span className="text-xs font-semibold text-gray-500">
              Quizzes Done
            </span>
          </div>
          <div className="bg-white rounded-xl p-4 text-center border-2 border-pink-100 kid-card">
            <span className="text-3xl block">🎮</span>
            <span className="text-2xl font-extrabold text-pink-600 block">
              {progress.gamesPlayed.length}
            </span>
            <span className="text-xs font-semibold text-gray-500">
              Games Played
            </span>
          </div>
          <div className="bg-white rounded-xl p-4 text-center border-2 border-orange-100 kid-card">
            <span className="text-3xl block">🔥</span>
            <span className="text-2xl font-extrabold text-orange-600 block">
              {progress.streak}
            </span>
            <span className="text-xs font-semibold text-gray-500">
              Day Streak
            </span>
          </div>
          <div className="bg-white rounded-xl p-4 text-center border-2 border-amber-100 kid-card">
            <span className="text-3xl block">🏆</span>
            <span className="text-2xl font-extrabold text-amber-600 block">
              {progress.achievementsUnlocked.length}/{achievements.length}
            </span>
            <span className="text-xs font-semibold text-gray-500">
              Achievements
            </span>
          </div>
        </div>

        {/* ===== ACHIEVEMENT SHOWCASE ===== */}
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3">
            🏆 Your Achievements
          </h2>

          {ACHIEVEMENT_CATEGORIES.map((cat) => {
            const categoryAchievements = achievementsByCategory[cat.key];
            if (!categoryAchievements || categoryAchievements.length === 0)
              return null;

            return (
              <div key={cat.key} className="mb-5">
                <h3 className="text-sm font-bold text-gray-600 mb-2">
                  {cat.label}
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {categoryAchievements.map((ach) => {
                    const isUnlocked =
                      progress.achievementsUnlocked.includes(
                        ach.achievement_id
                      );
                    return (
                      <div
                        key={ach.achievement_id}
                        className={`relative rounded-xl p-3 text-center transition-all ${
                          isUnlocked
                            ? `bg-gradient-to-br ${cat.color} text-white shadow-md`
                            : "bg-gray-100 border-2 border-gray-200"
                        }`}
                      >
                        {isUnlocked ? (
                          <>
                            <span className="text-2xl block">
                              {ach.emoji}
                            </span>
                            <span className="text-[10px] font-bold block mt-1">
                              {ach.title}
                            </span>
                            <span className="text-[9px] opacity-80 block">
                              {ach.description}
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="absolute inset-0 flex items-center justify-center opacity-20 z-10 pointer-events-none">
                              <span className="text-4xl">🔒</span>
                            </div>
                            <span className="text-2xl block grayscale opacity-40">
                              {ach.emoji}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 block mt-1">
                              {ach.title}
                            </span>
                            <span className="text-[9px] text-gray-300 block truncate">
                              ???
                            </span>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>

        {/* ===== QUIZ HISTORY ===== */}
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3">
            📊 Recent Quiz Scores
          </h2>

          {completedQuizData.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center border-2 border-dashed border-gray-200">
              <span className="text-4xl block mb-2">📝</span>
              <p className="text-gray-400 text-sm font-medium">
                No quizzes completed yet!
              </p>
              <p className="text-gray-300 text-xs mt-1">
                Start a quiz to see your scores here.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {completedQuizData.map((quiz) => {
                if (!quiz) return null;
                const score = quiz.score;
                const scoreColor = getScoreColor(score);
                return (
                  <div
                    key={quiz.quiz_id}
                    className="kid-card bg-white rounded-xl p-4 border-2 border-gray-100 flex items-center gap-3"
                  >
                    <span className="text-2xl">{quiz.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-800 text-sm truncate">
                        {quiz.title}
                      </h4>
                      <p className="text-xs text-gray-400">
                        {quiz.category} &bull; {quiz.difficulty}
                      </p>
                    </div>
                    <span
                      className={`text-sm font-extrabold px-3 py-1.5 rounded-lg ${scoreColor}`}
                    >
                      {score}%
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ===== RESET PROGRESS ===== */}
        <div className="pt-4 pb-8 text-center">
          <button
            onClick={handleResetProgress}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors underline underline-offset-2"
          >
            Reset Progress
          </button>
        </div>
      </div>
    </div>
  );
}
