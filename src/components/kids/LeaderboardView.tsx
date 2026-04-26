"use client";

import { useState, useMemo } from "react";
import { useApp } from "@/lib/store";

const FAKE_AVATARS = ["🦊", "🐼", "🐸", "🦄", "🐯", "🐱", "🐶", "🐰", "🦉", "🐨", "🐵", "🦁", "🐲", "🦋", "🐬"];

const FAKE_NAMES = [
  "LunaStar",
  "MathKing",
  "QuizWhiz",
  "BrainBoss",
  "StarPlayer",
  "NeonNinja",
  "PixelPro",
  "CosmicKid",
  "RocketRex",
  "SmartyPants",
  "WonderWolf",
  "BoltBunny",
  "SparkleShark",
  "DreamDragon",
  "TurboTiger",
];

interface Player {
  name: string;
  avatar: string;
  xp: number;
  level: number;
  isCurrentUser?: boolean;
}

function calculateLevel(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

// Generate consistent fake players based on a seed-like approach
function generateFakePlayers(): Player[] {
  return FAKE_NAMES.map((name, i) => {
    // Create varied XP scores — higher index doesn't necessarily mean lower
    const baseXP = [950, 820, 780, 720, 650, 600, 530, 470, 410, 380, 320, 280, 220, 150, 90];
    const xp = baseXP[i] + Math.floor(Math.random() * 40);
    return {
      name,
      avatar: FAKE_AVATARS[i % FAKE_AVATARS.length],
      xp,
      level: calculateLevel(xp),
    };
  });
}

export default function LeaderboardView() {
  const { state } = useApp();
  const { progress, profileName, profileAvatar } = state;
  const [activeTab, setActiveTab] = useState<"all" | "quizzes" | "games">("all");

  // Generate mock leaderboard data (stable via useMemo)
  const leaderboard = useMemo(() => {
    const fakePlayers = generateFakePlayers();

    // Create current user entry
    const currentUser: Player = {
      name: profileName,
      avatar: profileAvatar,
      xp: progress.totalXP,
      level: progress.level,
      isCurrentUser: true,
    };

    // Merge and sort by XP descending
    const allPlayers = [...fakePlayers, currentUser].sort(
      (a, b) => b.xp - a.xp
    );

    return allPlayers;
  }, [profileName, profileAvatar, progress.totalXP, progress.level]);

  // Find current user's rank
  const userRank = useMemo(
    () => leaderboard.findIndex((p) => p.isCurrentUser) + 1,
    [leaderboard]
  );

  // Top 3 players
  const top3 = leaderboard.slice(0, 3);
  const podiumOrder = [top3[1], top3[0], top3[2]]; // 2nd, 1st, 3rd for visual layout

  const tabs: { key: "all" | "quizzes" | "games"; label: string }[] = [
    { key: "all", label: "🏆 All" },
    { key: "quizzes", label: "📝 Quizzes" },
    { key: "games", label: "🎮 Games" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-yellow-50 pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6 space-y-6">
        {/* ===== HEADER ===== */}
        <h1 className="text-2xl font-bold text-center text-gray-800">
          🏆 Leaderboard
        </h1>

        {/* ===== CATEGORY FILTERS ===== */}
        <div className="flex justify-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all active:scale-95 ${
                activeTab === tab.key
                  ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-md"
                  : "bg-white text-gray-500 border-2 border-gray-200 hover:border-amber-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ===== TOP 3 PODIUM ===== */}
        <div className="flex items-end justify-center gap-3 pt-4">
          {/* 2nd Place */}
          {podiumOrder[0] && (
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-b from-gray-300 to-gray-400 rounded-2xl p-4 text-white shadow-lg text-center w-28">
                <span className="text-2xl block mb-1">
                  {podiumOrder[0].avatar}
                </span>
                <span className="text-[10px] font-bold block truncate">
                  {podiumOrder[0].name}
                </span>
                <span className="text-xs font-semibold opacity-80">
                  {podiumOrder[0].xp} XP
                </span>
              </div>
              <div className="bg-gradient-to-t from-gray-300 to-gray-200 rounded-t-lg w-28 h-24 flex items-center justify-center mt-1">
                <div className="text-center">
                  <span className="text-2xl">🥈</span>
                  <span className="text-sm font-extrabold text-gray-700 block">
                    2nd
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 1st Place (Taller) */}
          {podiumOrder[1] && (
            <div className="flex flex-col items-center">
              <div
                className={`bg-gradient-to-b from-yellow-400 to-amber-500 rounded-2xl p-4 text-white shadow-xl text-center w-32 ${
                  podiumOrder[1].isCurrentUser ? "ring-4 ring-purple-400" : ""
                }`}
              >
                <span className="text-3xl block mb-1 animate-bounce-slow">
                  {podiumOrder[1].avatar}
                </span>
                <span className="text-xs font-bold block truncate">
                  {podiumOrder[1].name}
                </span>
                <span className="text-sm font-bold">
                  {podiumOrder[1].xp} XP
                </span>
                <span className="text-xs font-semibold opacity-80 block">
                  Lvl {podiumOrder[1].level}
                </span>
              </div>
              <div className="bg-gradient-to-t from-yellow-400 to-amber-300 rounded-t-lg w-32 h-36 flex items-center justify-center mt-1 shadow-inner">
                <div className="text-center">
                  <span className="text-3xl">🥇</span>
                  <span className="text-base font-extrabold text-amber-800 block">
                    1st
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {podiumOrder[2] && (
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-b from-amber-600 to-amber-700 rounded-2xl p-4 text-white shadow-lg text-center w-28">
                <span className="text-2xl block mb-1">
                  {podiumOrder[2].avatar}
                </span>
                <span className="text-[10px] font-bold block truncate">
                  {podiumOrder[2].name}
                </span>
                <span className="text-xs font-semibold opacity-80">
                  {podiumOrder[2].xp} XP
                </span>
              </div>
              <div className="bg-gradient-to-t from-amber-600 to-amber-500 rounded-t-lg w-28 h-16 flex items-center justify-center mt-1">
                <div className="text-center">
                  <span className="text-2xl">🥉</span>
                  <span className="text-sm font-extrabold text-amber-800 block">
                    3rd
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ===== YOUR RANK CALLOUT ===== */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl p-4 text-white text-center shadow-md">
          <span className="text-sm font-semibold">
            Your Rank:{" "}
            <span className="text-2xl font-extrabold">
              #{userRank || leaderboard.length + 1}
            </span>
          </span>
          <span className="text-xs block mt-1 opacity-80">
            {userRank <= 3
              ? "🎉 Amazing! You're in the top 3!"
              : userRank <= 10
              ? "🔥 Great job! Keep climbing!"
              : "💪 Keep learning to rank up!"}
          </span>
        </div>

        {/* ===== FULL RANKINGS LIST ===== */}
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3">
            📊 Full Rankings
          </h2>
          <div className="space-y-2">
            {leaderboard.map((player, index) => {
              const rank = index + 1;
              const isUser = player.isCurrentUser;
              return (
                <div
                  key={player.name + player.xp}
                  className={`kid-card flex items-center gap-3 rounded-xl p-3 transition-all ${
                    isUser
                      ? "bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-400 shadow-md"
                      : "bg-white border-2 border-gray-100"
                  }`}
                >
                  {/* Rank Number */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold flex-shrink-0 ${
                      rank === 1
                        ? "bg-gradient-to-b from-yellow-400 to-amber-500 text-white"
                        : rank === 2
                        ? "bg-gradient-to-b from-gray-300 to-gray-400 text-white"
                        : rank === 3
                        ? "bg-gradient-to-b from-amber-600 to-amber-700 text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {rank <= 3 ? (
                      rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"
                    ) : (
                      <span>{rank}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <span className="text-2xl flex-shrink-0">{player.avatar}</span>

                  {/* Name & Level */}
                  <div className="flex-1 min-w-0">
                    <h4
                      className={`font-bold text-sm truncate ${
                        isUser ? "text-purple-700" : "text-gray-800"
                      }`}
                    >
                      {player.name}
                      {isUser && (
                        <span className="text-[10px] ml-1 font-semibold text-purple-400">
                          (You)
                        </span>
                      )}
                    </h4>
                    <span className="text-xs text-gray-400">
                      Level {player.level}
                    </span>
                  </div>

                  {/* XP */}
                  <span
                    className={`text-sm font-extrabold flex-shrink-0 ${
                      isUser ? "text-purple-600" : "text-gray-600"
                    }`}
                  >
                    {player.xp} XP
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
