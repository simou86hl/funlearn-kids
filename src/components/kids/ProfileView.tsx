"use client";
import React from "react";
import { useState, useRef, useEffect, useMemo } from "react";
import { useApp } from "@/lib/store";
import { achievements } from "@/data/achievements";
import { quizzes } from "@/data/quizzes";
import { Volume2, VolumeX, BookOpen, Gamepad2 } from "lucide-react";

const AVATAR_OPTIONS = ["🦁", "🐼", "🦊", "🐸", "🦄", "🐯", "🐱", "🐶", "🐰", "🦉", "🐨", "🐵"];

const ACHIEVEMENT_CATEGORIES = [
  { key: "quizzes", label: "📚 Quizzes", color: "from-violet-400 to-purple-500" },
  { key: "games", label: "🎮 Games", color: "from-pink-400 to-rose-500" },
  { key: "streak", label: "🔥 Streak", color: "from-orange-400 to-red-500" },
  { key: "xp", label: "⭐ XP", color: "from-amber-400 to-yellow-500" },
  { key: "subjects", label: "🌍 Subjects", color: "from-emerald-400 to-teal-500" },
];

const StatCard = React.memo(function StatCard({ emoji, value, label, isZero, motivationalText, ctaText, onCta }: {
  emoji: string; value: string | number; label: string; isZero: boolean; motivationalText?: string; ctaText?: string; onCta?: () => void;
}) {
  if (isZero && motivationalText) {
    return (
      <div className="empty-state-card rounded-xl p-4 text-center col-span-1">
        <span className="text-3xl block mb-1">{emoji}</span>
        <p className="text-xs font-bold text-primary">{motivationalText}</p>
        {ctaText && onCta && (
          <button
            onClick={onCta}
            className="mt-2 text-xs font-bold text-violet-600 bg-violet-100 px-3 py-1.5 rounded-full hover:bg-violet-200 transition-colors active:scale-95"
          >
            {ctaText}
          </button>
        )}
      </div>
    );
  }
  return (
    <div className="bg-white rounded-xl p-4 text-center border-2 border-gray-100 kid-card">
      <span className="text-2xl block mb-1">{emoji}</span>
      <span className="text-xl font-extrabold block">{value}</span>
      <span className="text-xs font-semibold text-gray-500">{label}</span>
    </div>
  );
});

export default function ProfileView() {
  const { state, setProfile, dispatch, toggleSound, navigate } = useApp();
  const { progress, profileName, profileAvatar, soundEnabled } = state;

  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(profileName);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  const currentLevel = progress.level;
  const xpForCurrentLevel = (currentLevel - 1) * 100;
  const xpForNextLevel = currentLevel * 100;
  const xpInLevel = progress.totalXP - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;
  const levelProgress = Math.min((xpInLevel / xpNeeded) * 100, 100);

  const circumference = 2 * Math.PI * 52;

  const achievementsByCategory = useMemo(() => {
    const grouped: Record<string, typeof achievements> = {};
    ACHIEVEMENT_CATEGORIES.forEach((cat) => {
      grouped[cat.key] = achievements.filter((a) => a.category === cat.key);
    });
    return grouped;
  }, []);

  const completedQuizData = useMemo(() => {
    return progress.quizzesCompleted
      .map((quizId) => {
        const quiz = quizzes.find((q) => String(q.quiz_id) === quizId);
        const score = progress.quizScores[quizId];
        if (!quiz || score === undefined) return null;
        return { ...quiz, score };
      })
      .filter(Boolean)
      .reverse();
  }, [progress.quizzesCompleted, progress.quizScores]);

  // Preview achievements for zero-state
  const previewAchievements = achievements.slice(0, 3);

  const handleNameSave = () => {
    const trimmed = editName.trim();
    if (trimmed.length > 0 && trimmed.length <= 20) setProfile(trimmed, profileAvatar);
    else setEditName(profileName);
    setIsEditingName(false);
  };

  const handleAvatarChange = (avatar: string) => {
    setProfile(profileName, avatar);
    setShowAvatarPicker(false);
  };

  const handleResetProgress = () => {
    localStorage.removeItem("kidlearn-progress");
    dispatch({ type: "LOAD_STATE" });
    setShowResetConfirm(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500 bg-emerald-100";
    if (score >= 50) return "text-amber-600 bg-amber-100";
    return "text-red-500 bg-red-100";
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 80) return "from-emerald-400 to-emerald-500";
    if (score >= 50) return "from-amber-400 to-amber-500";
    return "from-red-400 to-red-500";
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Profile Header */}
      <div className="hero-gradient rounded-3xl p-6 text-white shadow-xl relative overflow-hidden animate-slide-up" style={{ opacity: 0 }}>
        <span className="absolute -top-4 -right-4 text-6xl opacity-10">🌟</span>
        <div className="flex flex-col items-center gap-3 relative z-10">
          <button onClick={() => setShowAvatarPicker(!showAvatarPicker)} className="relative group">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-5xl group-hover:scale-110 transition-transform ring-4 ring-white/30">
              {profileAvatar}
            </div>
            <span className="absolute -bottom-1 -right-1 bg-white text-violet-600 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shadow-md">✏️</span>
          </button>

          {showAvatarPicker && (
            <div className="glass rounded-xl p-3 shadow-xl animate-scale-in">
              <p className="text-xs font-bold text-gray-500 text-center mb-2">Choose your avatar!</p>
              <div className="grid grid-cols-6 gap-1">
                {AVATAR_OPTIONS.map((avatar) => (
                  <button key={avatar} onClick={() => handleAvatarChange(avatar)}
                    className={`text-2xl p-1.5 rounded-lg hover:bg-violet-100 transition-colors ${
                      profileAvatar === avatar ? "bg-violet-200 ring-2 ring-violet-400" : ""
                    }`}>
                    {avatar}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="text-center">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input ref={nameInputRef} type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleNameSave(); if (e.key === "Escape") { setEditName(profileName); setIsEditingName(false); } }}
                  maxLength={20} className="bg-white/20 border-2 border-white/40 rounded-lg px-3 py-1 text-white text-center font-bold text-lg outline-none focus:border-white placeholder-white/60" placeholder="Your name" />
                <button onClick={handleNameSave} className="bg-emerald-400 hover:bg-emerald-500 text-white rounded-lg px-3 py-1.5 text-sm font-bold transition-colors active:scale-95">✓</button>
              </div>
            ) : (
              <button onClick={() => { setEditName(profileName); setIsEditingName(true); }} className="text-2xl font-extrabold font-display hover:opacity-80 transition-opacity active:scale-95">
                {profileName} ✏️
              </button>
            )}
          </div>

          {/* Level & XP Ring */}
          <div className="flex items-center gap-4 mt-2">
            <div className="relative w-28 h-28 flex-shrink-0">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" stroke="rgba(255,255,255,0.15)" strokeWidth="10" fill="none" />
                <circle cx="60" cy="60" r="52" stroke="rgba(255,255,255,0.8)" strokeWidth="10" fill="none"
                  strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - levelProgress / 100)}
                  className="transition-all duration-700" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold">Lv {currentLevel}</span>
                <span className="text-xs text-white/70">{levelProgress.toFixed(0)}%</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-white/80">{xpInLevel} / {xpNeeded} XP</p>
              <p className="text-xs text-white/60 mt-1">{xpNeeded - xpInLevel} XP to Level {currentLevel + 1}</p>
              <p className="text-sm font-bold mt-2">{progress.totalXP.toLocaleString()} Total XP</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid — Aspirational Empty States */}
      <div className="grid grid-cols-2 gap-3 animate-slide-up delay-100" style={{ opacity: 0 }}>
        <StatCard
          emoji="📝"
          value={progress.quizzesCompleted.length}
          label="Quizzes Done"
          isZero={progress.quizzesCompleted.length === 0}
          motivationalText="Ready to Learn!"
          ctaText="Browse Quizzes"
          onCta={() => navigate("quizzes")}
        />
        <StatCard
          emoji="🎮"
          value={progress.gamesPlayed.length}
          label="Games Played"
          isZero={progress.gamesPlayed.length === 0}
          motivationalText="Games Await!"
          ctaText="Explore Games"
          onCta={() => navigate("games")}
        />
        <StatCard
          emoji="🔥"
          value={progress.streak > 0 ? progress.streak : "☀️"}
          label="Day Streak"
          isZero={progress.streak === 0}
          motivationalText="Start Your Journey!"
        />
        <StatCard
          emoji="🏆"
          value={`${progress.achievementsUnlocked.length}/${achievements.length}`}
          label="Achievements"
          isZero={progress.achievementsUnlocked.length === 0}
          motivationalText="Achievements to Unlock!"
        />
      </div>

      {/* Achievement Showcase */}
      <section className="animate-slide-up delay-200" style={{ opacity: 0 }}>
        <h2 className="text-lg font-bold font-display mb-3">Your Achievements 🏆</h2>
        {ACHIEVEMENT_CATEGORIES.map((cat) => {
          const categoryAchievements = achievementsByCategory[cat.key];
          if (!categoryAchievements || categoryAchievements.length === 0) return null;
          return (
            <div key={cat.key} className="mb-5">
              <h3 className="text-sm font-bold text-gray-600 mb-2">{cat.label}</h3>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {categoryAchievements.map((ach) => {
                  const isUnlocked = progress.achievementsUnlocked.includes(ach.achievement_id);
                  return (
                    <div key={ach.achievement_id} className={`flex-shrink-0 w-20 rounded-xl p-3 text-center transition-all ${
                      isUnlocked ? `bg-gradient-to-br ${cat.color} text-white shadow-md animate-scale-in` : "bg-gray-50 border-2 border-gray-200"
                    }`}>
                      {isUnlocked ? (
                        <>
                          <span className="text-2xl block">{ach.emoji}</span>
                          <span className="text-[9px] font-bold block mt-1 truncate">{ach.title}</span>
                        </>
                      ) : (
                        <>
                          <div className="relative">
                            <span className="text-2xl block grayscale opacity-40">{ach.emoji}</span>
                            <span className="absolute inset-0 flex items-center justify-center text-lg opacity-40">🔒</span>
                          </div>
                          <span className="text-[9px] font-bold text-gray-400 block mt-1">???</span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Zero-state achievement preview */}
        {progress.achievementsUnlocked.length === 0 && (
          <div className="mt-3">
            <p className="text-xs font-semibold text-violet-500 uppercase tracking-wider mb-2">🎯 Next Achievements to Unlock</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {previewAchievements.map((ach) => (
                <div key={ach.achievement_id} className="bg-gradient-to-br from-violet-50/50 to-fuchsia-50/50 border-2 border-violet-200/50 rounded-xl p-3 text-center">
                  <span className="text-2xl block opacity-60">{ach.emoji}</span>
                  <span className="text-[10px] font-bold text-violet-500 block mt-1">{ach.title}</span>
                  <span className="text-[9px] text-violet-400 block mt-0.5">{ach.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Quiz History */}
      <section className="animate-slide-up delay-300" style={{ opacity: 0 }}>
        <h2 className="text-lg font-bold font-display mb-3">Recent Quiz Scores 📊</h2>
        {completedQuizData.length === 0 ? (
          <div className="empty-state-card rounded-xl p-8 text-center">
            <BookOpen className="w-10 h-10 text-violet-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm font-bold mb-1">No quizzes completed yet!</p>
            <p className="text-gray-400 text-xs mb-4">Start a quiz to see your scores here.</p>
            <button
              onClick={() => navigate("quizzes")}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-sm font-bold shadow-md hover:opacity-90 transition-all active:scale-95"
            >
              <BookOpen className="w-4 h-4" />
              Browse Quizzes
            </button>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
            {completedQuizData.map((quiz) => {
              if (!quiz) return null;
              const score = quiz.score;
              return (
                <div key={quiz.quiz_id} className="kid-card bg-white rounded-xl p-3.5 border border-gray-100 flex items-center gap-3">
                  <span className="text-2xl flex-shrink-0">{quiz.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800 text-sm truncate">{quiz.title}</h4>
                    <div className="mt-1 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${getScoreBarColor(score)} rounded-full`} style={{ width: `${score}%` }} />
                    </div>
                  </div>
                  <span className={`text-sm font-extrabold px-2.5 py-1 rounded-lg flex-shrink-0 ${getScoreColor(score)}`}>{score}%</span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Settings */}
      <section className="animate-slide-up delay-400" style={{ opacity: 0 }}>
        <h2 className="text-lg font-bold font-display mb-3">Settings ⚙️</h2>
        <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100">
          <button onClick={toggleSound} className="w-full flex items-center justify-between p-4 transition-all active:bg-gray-50">
            <div className="flex items-center gap-3">
              {soundEnabled ? <Volume2 className="w-5 h-5 text-violet-500" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
              <span className="font-medium text-gray-700">Sound Effects</span>
            </div>
            <div className={`w-11 h-6 rounded-full transition-colors relative ${soundEnabled ? "bg-violet-500" : "bg-gray-300"}`}>
              <div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-all ${soundEnabled ? "left-5.5" : "left-0.5"}`} />
            </div>
          </button>
          <button onClick={() => setShowResetConfirm(true)} className="w-full flex items-center justify-between p-4 transition-all active:bg-gray-50">
            <div className="flex items-center gap-3">
              <span className="text-lg">🗑️</span>
              <span className="font-medium text-gray-700">Reset Progress</span>
            </div>
            <span className="text-xs text-red-400 font-semibold">Danger Zone</span>
          </button>
        </div>
      </section>

      {/* Reset Confirmation */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-3xl p-6 max-w-sm w-full text-center animate-spring">
            <div className="text-5xl mb-3">⚠️</div>
            <h3 className="text-xl font-bold font-display mb-2">Reset All Progress?</h3>
            <p className="text-gray-500 mb-6 text-sm">You&apos;ll lose all XP, streaks, achievements, and quiz scores. This cannot be undone!</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setShowResetConfirm(false)} className="px-6 py-2.5 rounded-full border-2 border-gray-300 text-gray-600 font-semibold hover:bg-gray-50 transition-all active:scale-95">Cancel</button>
              <button onClick={handleResetProgress} className="px-6 py-2.5 rounded-full bg-red-500 text-white font-semibold hover:bg-red-600 transition-all active:scale-95">Reset</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
