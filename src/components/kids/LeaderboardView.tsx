"use client";
import React from "react";
import { useState, useMemo } from "react";
import { useApp } from "@/lib/store";
import { useIsDesktop } from "@/components/kids/Navigation";

const FAKE_AVATARS = ["🦊", "🐼", "🐸", "🦄", "🐯", "🐱", "🐶", "🐰", "🦉", "🐨", "🐵", "🦁", "🐲", "🦋", "🐬"];

const FAKE_NAMES = [
  "LunaStar", "MathKing", "QuizWhiz", "BrainBoss", "StarPlayer",
  "NeonNinja", "PixelPro", "CosmicKid", "RocketRex", "SmartyPants",
  "WonderWolf", "BoltBunny", "SparkleShark", "DreamDragon", "TurboTiger",
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

function generateFakePlayers(): Player[] {
  return FAKE_NAMES.map((name, i) => {
    const baseXP = [950, 820, 780, 720, 650, 600, 530, 470, 410, 380, 320, 280, 220, 150, 90];
    const xp = baseXP[i] + Math.floor(Math.random() * 40);
    return { name, avatar: FAKE_AVATARS[i % FAKE_AVATARS.length], xp, level: calculateLevel(xp) };
  });
}

const PodiumCard = React.memo(function PodiumCard({ player, place, height }: {
  player: Player;
  place: 1 | 2 | 3;
  height: string;
}) {
  const gradients: Record<number, { card: string; base: string; ring: string }> = {
    1: { card: "from-amber-400 to-yellow-500", base: "from-amber-400 to-amber-300", ring: "ring-yellow-300" },
    2: { card: "from-gray-300 to-gray-400", base: "from-gray-300 to-gray-200", ring: "ring-gray-300" },
    3: { card: "from-amber-600 to-amber-700", base: "from-amber-600 to-amber-500", ring: "ring-amber-500" },
  };
  const medals: Record<number, string> = { 1: "👑", 2: "🥈", 3: "🥉" };
  const g = gradients[place];

  return (
    <div className="flex flex-col items-center animate-spring" style={{ animationDelay: `${place * 150}ms` }}>
      <div className={`bg-gradient-to-b ${g.card} rounded-2xl p-3 sm:p-5 text-white shadow-xl text-center w-28 sm:w-36 ${player.isCurrentUser ? `ring-4 ${g.ring} animate-glow` : ""}`}>
        <span className="text-lg sm:text-xl block mb-0.5">{medals[place]}</span>
        <span className={`text-3xl sm:text-4xl block mb-1 ${place === 1 ? "animate-bounce-slow" : ""}`}>{player.avatar}</span>
        <span className="text-xs sm:text-sm font-bold block truncate">{player.name}</span>
        <span className="text-sm sm:text-base font-bold">{player.xp} XP</span>
        <span className="text-[10px] font-semibold opacity-80 block">Lvl {player.level}</span>
      </div>
      <div className={`bg-gradient-to-t ${g.base} rounded-t-lg w-28 sm:w-36 flex items-center justify-center mt-1 shadow-inner`} style={{ height }}>
        <div className="text-center">
          <span className="text-xl sm:text-3xl">{place === 1 ? "🥇" : place === 2 ? "🥈" : "🥉"}</span>
          <span className="text-xs sm:text-sm font-extrabold text-amber-800 block">{place}{place === 1 ? "st" : place === 2 ? "nd" : "rd"}</span>
        </div>
      </div>
    </div>
  );
});

export default function LeaderboardView() {
  const { state } = useApp();
  const isDesktop = useIsDesktop();
  const { progress, profileName, profileAvatar } = state;
  const [activeTab, setActiveTab] = useState<"all" | "quizzes" | "games">("all");

  const leaderboard = useMemo(() => {
    const fakePlayers = generateFakePlayers();
    const currentUser: Player = {
      name: profileName, avatar: profileAvatar, xp: progress.totalXP, level: progress.level, isCurrentUser: true,
    };
    return [...fakePlayers, currentUser].sort((a, b) => b.xp - a.xp);
  }, [profileName, profileAvatar, progress.totalXP, progress.level]);

  const userRank = useMemo(() => leaderboard.findIndex((p) => p.isCurrentUser) + 1, [leaderboard]);

  const top3 = leaderboard.slice(0, 3);
  const podiumOrder = [top3[1], top3[0], top3[2]];

  const tabs: { key: "all" | "quizzes" | "games"; label: string }[] = [
    { key: "all", label: "🏆 All" },
    { key: "quizzes", label: "📝 Quizzes" },
    { key: "games", label: "🎮 Games" },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="text-center animate-slide-up" style={{ opacity: 0 }}>
        <h1 className="text-2xl font-extrabold font-display section-title">
          <span className="gradient-text">Leaderboard</span> 🏆
        </h1>
        <p className="text-muted-foreground mt-1">See how you rank against other learners!</p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-2 animate-slide-up delay-100" style={{ opacity: 0 }}>
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all active:scale-95 ${
              activeTab === tab.key ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-md" : "bg-white text-gray-500 border-2 border-gray-200 hover:border-amber-300"
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Podium — more dramatic, bigger avatars */}
      <div className="podium-3d flex items-end justify-center gap-2 sm:gap-4 pt-2 sm:pt-4 animate-slide-up delay-200" style={{ opacity: 0 }}>
        {podiumOrder[0] && <PodiumCard player={podiumOrder[0]} place={2} height={isDesktop ? "96px" : "72px"} />}
        {podiumOrder[1] && <PodiumCard player={podiumOrder[1]} place={1} height={isDesktop ? "144px" : "104px"} />}
        {podiumOrder[2] && <PodiumCard player={podiumOrder[2]} place={3} height={isDesktop ? "72px" : "52px"} />}
      </div>

      {/* Your Rank */}
      <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-2xl p-4 text-white text-center shadow-lg shadow-violet-500/20 animate-slide-up delay-300" style={{ opacity: 0 }}>
        <span className="text-sm font-semibold">
          Your Rank: <span className="text-3xl font-extrabold ml-1">#{userRank || leaderboard.length + 1}</span>
        </span>
        <p className="text-xs mt-1 opacity-80">
          {userRank <= 3 ? "🎉 Amazing! You're in the top 3!" : userRank <= 10 ? "🔥 Great job! Keep climbing!" : "💪 Keep learning to rank up!"}
        </p>
      </div>

      {/* Full Rankings — wider on desktop */}
      <section className="animate-slide-up delay-400" style={{ opacity: 0 }}>
        <h2 className="text-lg font-bold font-display section-title mb-3">Full Rankings 📊</h2>
        <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar">
          {leaderboard.map((player, index) => {
            const rank = index + 1;
            const isUser = player.isCurrentUser;
            const maxXp = leaderboard[0]?.xp || 1;
            return (
              <div key={player.name + player.xp}
                className={`kid-card flex items-center gap-3 rounded-xl p-3 transition-all ${
                  isUser ? "bg-gradient-to-r from-violet-50 to-fuchsia-50 border-2 border-violet-400 shadow-md" : "card-premium"
                }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-extrabold flex-shrink-0 ${
                  rank === 1 ? "bg-gradient-to-b from-amber-400 to-yellow-500 text-white shadow-md"
                  : rank === 2 ? "bg-gradient-to-b from-gray-300 to-gray-400 text-white shadow-sm"
                  : rank === 3 ? "bg-gradient-to-b from-amber-600 to-amber-700 text-white shadow-sm"
                  : "bg-gray-100 text-gray-500"
                }`}>
                  {rank <= 3 ? (
                    <span className="text-lg">{rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}</span>
                  ) : <span>{rank}</span>}
                </div>

                <span className="text-2xl flex-shrink-0">{player.avatar}</span>

                <div className="flex-1 min-w-0">
                  <h4 className={`font-bold text-sm truncate ${isUser ? "text-violet-700 gradient-text" : "text-gray-800"}`}>
                    {player.name}
                    {isUser && <span className="text-[10px] ml-1 font-semibold text-violet-400">(You)</span>}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400">Level {player.level}</span>
                    <div className={`flex-1 ${isDesktop ? "max-w-32" : "max-w-16"} bg-gray-100 rounded-full h-1 overflow-hidden`}>
                      <div className="h-full bg-gradient-to-r from-violet-400 to-fuchsia-400 rounded-full" style={{ width: `${(player.xp / maxXp) * 100}%` }} />
                    </div>
                  </div>
                </div>

                {/* Desktop: show more info */}
                {isDesktop && (
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="text-xs text-gray-400 font-medium">{player.level} levels</span>
                    <span className="text-xs text-gray-400 font-medium">{Math.floor(player.xp / 100) * 100} XP milestone</span>
                  </div>
                )}

                <span className={`text-sm font-extrabold flex-shrink-0 ${isUser ? "text-violet-600" : "text-gray-600"}`}>
                  {player.xp} XP
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
