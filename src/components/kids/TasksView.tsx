"use client";
import React from "react";
import { useState, useMemo } from "react";
import { useApp } from "@/lib/store";
import { dailyTasks, weeklyTasks } from "@/data/tasks";
import { achievements } from "@/data/achievements";

function DayDots({ streak }: { streak: number }) {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const currentDayIndex = (new Date().getDay() + 6) % 7; // 0 = Monday

  return (
    <div className="flex justify-center gap-2 mt-4">
      {days.map((d, i) => {
        const isActive = i === currentDayIndex;
        const isFilled = i < streak;

        return (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              className={`day-dot ${
                isFilled
                  ? "bg-white/50 text-white shadow-inner"
                  : isActive
                  ? "bg-white/30 text-white ring-2 ring-white/50"
                  : "bg-white/15 text-white/40"
              }`}
            >
              {isFilled ? "✓" : d}
            </div>
            {isActive && (
              <span className="text-[8px] text-white/70 font-bold">Today</span>
            )}
          </div>
        );
      })}
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
    <div className={`kid-card rounded-xl p-4 accent-bar-left transition-all ${accent} ${
      isDone ? "opacity-80" : ""
    }`}
    style={
      accent === "accent-bar-left"
        ? { '--accent-color': '#8b5cf6', '--accent-bg': 'rgba(139, 92, 246, 0.04)' } as React.CSSProperties
        : accent === "border-l-blue-500"
        ? { '--accent-color': '#3b82f6', '--accent-bg': 'rgba(59, 130, 246, 0.04)' } as React.CSSProperties
        : { '--accent-color': '#8b5cf6', '--accent-bg': 'rgba(139, 92, 246, 0.04)' } as React.CSSProperties
    }
    >
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
              : "btn-primary text-white hover:opacity-90 shadow-md shadow-violet-500/20 animate-glow"
          }`}>
          {claimed ? "✅ Claimed!" : "✨ Claim Reward"}
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

  const nextToUnlock = useMemo(() => {
    const locked = achievements.filter((a) => !progress.achievementsUnlocked.includes(a.achievement_id));
    return locked.slice(0, 3);
  }, [progress.achievementsUnlocked]);

  const unlockedAchievements = achievements.filter((a) => progress.achievementsUnlocked.includes(a.achievement_id));

  const noTasksCompleted = dailyCompleted === 0 && weeklyCompleted === 0;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="text-center animate-slide-up" style={{ opacity: 0 }}>
        <h1 className="text-2xl font-extrabold font-display section-title">Missions 📋</h1>
        <p className="text-muted-foreground mt-1">Complete tasks to earn XP and unlock achievements!</p>
      </div>

      {/* Streak Card — with fire particles */}
      <div
        className={`rounded-3xl p-6 text-white shadow-xl text-center animate-slide-up delay-100 relative overflow-hidden streak-gradient-positive`}
        style={{ opacity: 0 }}
      >
        {/* CSS Fire particles */}
        {progress.streak > 0 && (
          <>
            <div className="fire-particle" style={{ left: '15%', '--fire-duration': '1.8s', '--fire-delay': '0s', '--fire-drift': '-8px' } as React.CSSProperties} />
            <div className="fire-particle" style={{ left: '30%', '--fire-duration': '2.2s', '--fire-delay': '0.3s', '--fire-drift': '12px' } as React.CSSProperties} />
            <div className="fire-particle" style={{ left: '50%', '--fire-duration': '1.5s', '--fire-delay': '0.6s', '--fire-drift': '-5px' } as React.CSSProperties} />
            <div className="fire-particle" style={{ left: '65%', '--fire-duration': '2s', '--fire-delay': '0.1s', '--fire-drift': '10px' } as React.CSSProperties} />
            <div className="fire-particle" style={{ left: '80%', '--fire-duration': '1.7s', '--fire-delay': '0.8s', '--fire-drift': '-12px' } as React.CSSProperties} />
            <div className="fire-particle" style={{ left: '42%', '--fire-duration': '2.4s', '--fire-delay': '0.4s', '--fire-drift': '6px' } as React.CSSProperties} />
          </>
        )}

        <span className="absolute top-3 right-4 text-3xl animate-bounce-slow opacity-40">
          {progress.streak > 0 ? "🔥" : "☀️"}
        </span>
        <div className="relative z-10">
          <span className="text-5xl block mb-2 animate-spring">
            {progress.streak > 0 ? "🔥" : "☀️"}
          </span>
          {progress.streak > 0 ? (
            <>
              <span className="text-3xl font-extrabold font-display">
                {progress.streak} Day Streak!
              </span>
              <p className="text-white/80 text-sm font-medium mt-2">
                Keep it up! You&apos;re doing amazing!
              </p>
            </>
          ) : (
            <>
              <span className="text-3xl font-extrabold font-display">
                Start Your Streak Today!
              </span>
              <p className="text-white/80 text-sm font-medium mt-2">
                Complete one activity to begin your streak!
              </p>
            </>
          )}
          <DayDots streak={progress.streak} />
        </div>
      </div>

      {/* Daily Missions */}
      <section className="animate-slide-up delay-200" style={{ opacity: 0 }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold font-display section-title">Today&apos;s Missions 📝</h2>
          <span className="text-sm font-semibold text-violet-600 bg-violet-100 px-3 py-1 rounded-full">{dailyCompleted}/{dailyTasks.length}</span>
        </div>
        {noTasksCompleted && (
          <p className="text-sm text-muted-foreground mb-3 -mt-1">
            You&apos;re just getting started! Complete your first mission. 💪
          </p>
        )}
        <div className="space-y-3">
          {dailyTasks.map((task) => (
            <TaskCard
              key={task.task_id}
              task={task}
              isDone={!!progress.tasksCompleted[task.task_id]}
              onComplete={() => completeTask(task.task_id, task.reward_xp)}
              accent="accent-bar-left"
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
          <h2 className="text-lg font-bold font-display section-title">Weekly Missions 🗓️</h2>
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
        <h2 className="text-lg font-bold font-display section-title mb-3">Achievements 🏆</h2>

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

        {/* Next to Unlock */}
        {nextToUnlock.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-violet-500 uppercase tracking-wider mb-2">🎯 Next to Unlock</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {nextToUnlock.map((ach) => (
                <div key={ach.achievement_id} className="card-premium p-3 text-center">
                  <span className="text-2xl block opacity-60">{ach.emoji}</span>
                  <span className="text-[10px] font-bold text-violet-400 block mt-1">{ach.description}</span>
                  <span className="text-[9px] text-violet-300 block mt-0.5">+{ach.xp_reward} XP</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {lockedAchievements.length > 0 && unlockedAchievements.length === 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">🔒 Keep going to unlock!</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {lockedAchievements.map((ach) => (
                <div key={ach.achievement_id} className="relative bg-gray-50 border border-gray-200 rounded-xl p-3 text-center overflow-hidden shimmer-locked">
                  <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none"><span className="text-3xl">🔒</span></div>
                  <span className="text-2xl block grayscale opacity-40">{ach.emoji}</span>
                  <span className="text-[10px] font-bold text-gray-400 block mt-1">???</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {unlockedAchievements.length === 0 && (
          <div className="empty-state-card p-6 text-center mt-3">
            <span className="text-3xl block mb-2">🏆</span>
            <p className="text-sm font-semibold text-gray-500">Achievements to Unlock!</p>
            <p className="text-xs text-muted-foreground mt-1">Complete activities to earn your first achievement</p>
          </div>
        )}
      </section>

      {/* Celebration confetti placeholder */}
      <div id="celebration-confetti" />
    </div>
  );
}
