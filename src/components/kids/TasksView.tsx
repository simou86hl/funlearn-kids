"use client";
import React from "react";
import { useState, useMemo } from "react";
import { useApp } from "@/lib/store";
import { dailyTasks, weeklyTasks } from "@/data/tasks";
import { achievements } from "@/data/achievements";

function DayDots({ streak }: { streak: number }) {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  return (
    <div className="flex justify-center gap-1.5 mt-3">
      {days.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-0.5">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
            i < streak ? "bg-white/40 text-white" : "bg-white/15 text-white/40"
          }`}>
            {i < streak ? "✓" : d}
          </div>
        </div>
      ))}
    </div>
  );
}

function TaskCard({ task, isDone, onComplete, accent }: {
  task: typeof dailyTasks[0];
  isDone: boolean;
  onComplete: () => void;
  accent: string;
}) {
  const [claimed, setClaimed] = useState(false);

  const handleClaim = () => {
    if (claimed) return;
    setClaimed(true);
    onComplete();
  };

  return (
    <div className={`kid-card bg-white rounded-xl p-4 border-l-4 transition-all ${accent} ${
      isDone ? "opacity-75" : ""
    }`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl mt-0.5">{task.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {isDone && <span className="text-emerald-500 animate-spring">✅</span>}
            <h3 className={`font-semibold text-gray-800 ${isDone ? "line-through text-gray-400" : ""}`}>{task.title}</h3>
          </div>
          <p className={`text-sm mt-0.5 ${isDone ? "text-gray-400" : "text-gray-500"}`}>{task.description}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs font-bold text-amber-500">⭐ +{task.reward_xp} XP</span>
          </div>
        </div>
      </div>
      {isDone && (
        <button onClick={handleClaim} disabled={claimed}
          className={`mt-3 w-full py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${
            claimed
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:opacity-90 shadow-md shadow-violet-500/20 animate-glow"
          }`}>
          {claimed ? "Claimed ✓" : "🎁 Claim Reward"}
        </button>
      )}
    </div>
  );
}

export default function TasksView() {
  const { state, completeTask } = useApp();
  const { progress } = state;

  const dailyCompleted = dailyTasks.filter((t) => progress.tasksCompleted[t.task_id]).length;
  const weeklyCompleted = weeklyTasks.filter((t) => progress.tasksCompleted[t.task_id]).length;

  const lockedAchievements = useMemo(() => {
    const locked = achievements.filter((a) => !progress.achievementsUnlocked.includes(a.achievement_id));
    return [...locked].sort((a, b) => a.achievement_id.localeCompare(b.achievement_id)).slice(0, 6);
  }, [progress.achievementsUnlocked]);

  const unlockedAchievements = achievements.filter((a) => progress.achievementsUnlocked.includes(a.achievement_id));

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="text-center animate-slide-up" style={{ opacity: 0 }}>
        <h1 className="text-2xl font-extrabold font-display">📋 Missions</h1>
        <p className="text-muted-foreground mt-1">Complete tasks to earn XP and unlock achievements!</p>
      </div>

      {/* Streak Card */}
      <div className="hero-gradient rounded-3xl p-6 text-white shadow-xl text-center animate-slide-up delay-100 relative overflow-hidden" style={{ opacity: 0 }}>
        <span className="absolute top-3 right-4 text-3xl animate-bounce-slow opacity-40">🔥</span>
        <div className="relative z-10">
          <span className="text-5xl block mb-2 animate-spring">{progress.streak > 0 ? "🔥" : "💤"}</span>
          <span className="text-3xl font-extrabold font-display">
            {progress.streak > 0 ? `${progress.streak} Day Streak!` : "Start Your Streak!"}
          </span>
          <p className="text-white/80 text-sm font-medium mt-2">
            {progress.streak > 0 ? "Keep it up! You're doing amazing!" : "Complete activities to start your streak!"}
          </p>
          <DayDots streak={progress.streak} />
        </div>
      </div>

      {/* Daily Missions */}
      <section className="animate-slide-up delay-200" style={{ opacity: 0 }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold font-display">📝 Today&apos;s Missions</h2>
          <span className="text-sm font-semibold text-violet-600 bg-violet-100 px-3 py-1 rounded-full">{dailyCompleted}/{dailyTasks.length}</span>
        </div>
        <div className="space-y-3">
          {dailyTasks.map((task) => (
            <TaskCard
              key={task.task_id}
              task={task}
              isDone={!!progress.tasksCompleted[task.task_id]}
              onComplete={() => completeTask(task.task_id, task.reward_xp)}
              accent="border-l-violet-500"
            />
          ))}
        </div>
        <div className="mt-3 bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div className="progress-bar-animated bg-gradient-to-r from-violet-400 to-fuchsia-500 h-full rounded-full" style={{ width: `${(dailyCompleted / dailyTasks.length) * 100}%` }} />
        </div>
      </section>

      {/* Weekly Missions */}
      <section className="animate-slide-up delay-300" style={{ opacity: 0 }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold font-display">🗓️ Weekly Missions</h2>
          <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">{weeklyCompleted}/{weeklyTasks.length}</span>
        </div>
        <div className="space-y-3">
          {weeklyTasks.map((task) => (
            <TaskCard
              key={task.task_id}
              task={task}
              isDone={!!progress.tasksCompleted[task.task_id]}
              onComplete={() => completeTask(task.task_id, task.reward_xp)}
              accent="border-l-blue-500"
            />
          ))}
        </div>
        <div className="mt-3 bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div className="progress-bar-animated bg-gradient-to-r from-blue-400 to-indigo-500 h-full rounded-full" style={{ width: `${(weeklyCompleted / weeklyTasks.length) * 100}%` }} />
        </div>
      </section>

      {/* Achievements */}
      <section className="animate-slide-up delay-400" style={{ opacity: 0 }}>
        <h2 className="text-lg font-bold font-display mb-3">🏆 Achievements</h2>

        {unlockedAchievements.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">✅ Unlocked ({unlockedAchievements.length})</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {unlockedAchievements.map((ach) => (
                <div key={ach.achievement_id} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-3 text-center card-hover animate-scale-in">
                  <span className="text-2xl block">{ach.emoji}</span>
                  <span className="text-[10px] font-bold text-gray-700 block mt-1 truncate">{ach.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {lockedAchievements.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">🔒 Keep going to unlock!</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {lockedAchievements.map((ach) => (
                <div key={ach.achievement_id} className="relative bg-gray-50 border-2 border-gray-200 rounded-xl p-3 text-center overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none"><span className="text-3xl">🔒</span></div>
                  <span className="text-2xl block grayscale opacity-40">{ach.emoji}</span>
                  <span className="text-[10px] font-bold text-gray-400 block mt-1">???</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
