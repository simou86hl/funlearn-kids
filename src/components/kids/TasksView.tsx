"use client";

import { useMemo } from "react";
import { useApp } from "@/lib/store";
import { dailyTasks, weeklyTasks } from "@/data/tasks";
import { achievements } from "@/data/achievements";

export default function TasksView() {
  const { state, completeTask } = useApp();
  const { progress } = state;

  // Count completed tasks
  const dailyCompleted = dailyTasks.filter(
    (t) => progress.tasksCompleted[t.task_id]
  ).length;
  const weeklyCompleted = weeklyTasks.filter(
    (t) => progress.tasksCompleted[t.task_id]
  ).length;

  // Pick 5 locked achievements as teasers (stable per render via useMemo)
  const lockedAchievements = useMemo(() => {
    const locked = achievements.filter(
      (a) => !progress.achievementsUnlocked.includes(a.achievement_id)
    );
    // Use a seeded sort based on achievement IDs for stability
    return [...locked].sort((a, b) => a.achievement_id.localeCompare(b.achievement_id)).slice(0, 5);
  }, [progress.achievementsUnlocked]);

  const unlockedAchievements = achievements.filter((a) =>
    progress.achievementsUnlocked.includes(a.achievement_id)
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-indigo-50 pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6 space-y-6">
        {/* ===== HEADER ===== */}
        <h1 className="text-2xl font-bold text-center text-gray-800">
          📋 Missions
        </h1>

        {/* ===== STREAK CARD ===== */}
        <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-center gap-3">
            <span className="text-4xl animate-bounce-slow">🔥</span>
            <span className="text-3xl font-extrabold">
              {progress.streak} Day Streak!
            </span>
          </div>
          <p className="text-center mt-2 text-orange-100 text-sm font-medium">
            {progress.streak > 0
              ? "Keep it up! You're doing amazing!"
              : "Start your streak today!"}
          </p>
        </div>

        {/* ===== DAILY MISSIONS ===== */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-800">
              📝 Today&apos;s Missions
            </h2>
            <span className="text-sm font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
              {dailyCompleted}/{dailyTasks.length} completed
            </span>
          </div>

          <div className="space-y-3">
            {dailyTasks.map((task) => {
              const isDone = !!progress.tasksCompleted[task.task_id];
              return (
                <div
                  key={task.task_id}
                  className={`kid-card bg-white rounded-xl p-4 border-2 transition-all ${
                    isDone
                      ? "border-green-300 bg-green-50 opacity-70"
                      : "border-purple-100 hover:border-purple-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl mt-0.5">{task.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {isDone && <span className="text-green-500">✅</span>}
                        <h3
                          className={`font-semibold text-gray-800 ${
                            isDone ? "line-through text-gray-400" : ""
                          }`}
                        >
                          {task.title}
                        </h3>
                      </div>
                      <p
                        className={`text-sm mt-0.5 ${
                          isDone ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {task.description}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs font-bold text-amber-500">
                          ⭐ +{task.reward_xp} XP
                        </span>
                        {isDone && (
                          <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                            Done!
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Claim button for completed tasks */}
                  {isDone && (
                    <button
                      onClick={() => completeTask(task.task_id, task.reward_xp)}
                      className="mt-3 w-full py-2 rounded-lg bg-gradient-to-r from-green-400 to-emerald-500 text-white text-sm font-bold hover:from-green-500 hover:to-emerald-600 transition-all active:scale-95"
                    >
                      🎁 Claim Reward
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Daily progress bar */}
          <div className="mt-3 bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="progress-bar-animated bg-gradient-to-r from-purple-400 to-indigo-500 h-full rounded-full"
              style={{
                width: `${(dailyCompleted / dailyTasks.length) * 100}%`,
              }}
            />
          </div>
        </section>

        {/* ===== WEEKLY MISSIONS ===== */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-800">
              🗓️ Weekly Missions
            </h2>
            <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
              {weeklyCompleted}/{weeklyTasks.length} completed
            </span>
          </div>

          <div className="space-y-3">
            {weeklyTasks.map((task) => {
              const isDone = !!progress.tasksCompleted[task.task_id];
              return (
                <div
                  key={task.task_id}
                  className={`kid-card bg-white rounded-xl p-4 border-2 transition-all ${
                    isDone
                      ? "border-green-300 bg-green-50 opacity-70"
                      : "border-blue-100 hover:border-blue-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl mt-0.5">{task.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {isDone && <span className="text-green-500">✅</span>}
                        <h3
                          className={`font-semibold text-gray-800 ${
                            isDone ? "line-through text-gray-400" : ""
                          }`}
                        >
                          {task.title}
                        </h3>
                      </div>
                      <p
                        className={`text-sm mt-0.5 ${
                          isDone ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {task.description}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs font-bold text-amber-500">
                          ⭐ +{task.reward_xp} XP
                        </span>
                        {isDone && (
                          <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                            Done!
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {isDone && (
                    <button
                      onClick={() => completeTask(task.task_id, task.reward_xp)}
                      className="mt-3 w-full py-2 rounded-lg bg-gradient-to-r from-green-400 to-emerald-500 text-white text-sm font-bold hover:from-green-500 hover:to-emerald-600 transition-all active:scale-95"
                    >
                      🎁 Claim Reward
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Weekly progress bar */}
          <div className="mt-3 bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="progress-bar-animated bg-gradient-to-r from-blue-400 to-indigo-500 h-full rounded-full"
              style={{
                width: `${(weeklyCompleted / weeklyTasks.length) * 100}%`,
              }}
            />
          </div>
        </section>

        {/* ===== RECENT ACHIEVEMENTS ===== */}
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3">
            🏆 Achievements
          </h2>

          {/* Unlocked achievements */}
          {unlockedAchievements.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-2">
                ✅ Unlocked ({unlockedAchievements.length})
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {unlockedAchievements.map((ach) => (
                  <div
                    key={ach.achievement_id}
                    className="kid-card bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-amber-200 rounded-xl p-3 text-center"
                  >
                    <span className="text-2xl block">{ach.emoji}</span>
                    <span className="text-xs font-bold text-gray-700 block mt-1">
                      {ach.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Locked teaser achievements */}
          {lockedAchievements.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                🔒 Keep going to unlock!
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {lockedAchievements.map((ach) => (
                  <div
                    key={ach.achievement_id}
                    className="relative bg-gray-100 border-2 border-gray-200 rounded-xl p-3 text-center overflow-hidden"
                  >
                    <div className="absolute inset-0 flex items-center justify-center opacity-30">
                      <span className="text-3xl">🔒</span>
                    </div>
                    <span className="text-2xl block grayscale opacity-50">
                      {ach.emoji}
                    </span>
                    <span className="text-xs font-bold text-gray-400 block mt-1">
                      ???
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
