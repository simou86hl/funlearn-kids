"use client";
import React from "react";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { games } from "@/data/games";
import { ChevronRight, Sparkles } from "lucide-react";

const difficultyBadge: Record<string, { label: string; cls: string }> = {
  easy:   { label: "Easy",   cls: "bg-emerald-100 text-emerald-700" },
  medium: { label: "Medium", cls: "bg-amber-100 text-amber-700" },
  hard:   { label: "Hard",   cls: "bg-red-100 text-red-700" },
};

const categoryTabs: { key: string; emoji: string }[] = [
  { key: "All", emoji: "🎯" },
  { key: "Logic", emoji: "🧩" },
  { key: "Math", emoji: "🧮" },
  { key: "English", emoji: "📚" },
  { key: "Science", emoji: "🔬" },
  { key: "Geography", emoji: "🌍" },
];

const GameCard = React.memo(function GameCard({ game, hasPlayed, bestScore, onClick }: {
  game: typeof games[0];
  hasPlayed: boolean;
  bestScore: number | undefined;
  onClick: () => void;
}) {
  const diff = difficultyBadge[game.difficulty];
  return (
    <button
      onClick={onClick}
      className="game-card-glow rounded-2xl overflow-hidden shadow-md bg-white text-left active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-violet-300 group game-card-accent"
      style={{ '--accent-color': game.color } as React.CSSProperties}
    >
      <div className="h-28 flex items-center justify-center relative" style={{ backgroundColor: game.color }}>
        <span className="text-5xl drop-shadow-md group-hover:scale-110 transition-transform">{game.emoji}</span>
        {hasPlayed && (
          <span className="absolute top-2 right-2 bg-white/90 text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm text-emerald-600">
            ✓ Played
          </span>
        )}
        {/* Sparkle decorations */}
        <Sparkles className="absolute top-2 left-2 w-3 h-3 text-white/40" />
      </div>
      <div className="p-3.5">
        <h3 className="font-bold text-gray-800 text-sm leading-tight mb-1">{game.title}</h3>
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{game.description}</p>
        <div className="flex items-center justify-between mt-2.5">
          <span className="text-xs text-gray-400">{game.plays.toLocaleString()} plays</span>
          <div className="flex items-center gap-1.5">
            {bestScore !== undefined && (
              <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded">{bestScore}pts</span>
            )}
            {diff && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${diff.cls}`}>
                {diff.label}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
});

export default function GamesView() {
  const { state, startGame } = useApp();
  const [activeCategory, setActiveCategory] = useState("All");
  const gamesPlayed = state.progress.gamesPlayed;

  const filteredGames = activeCategory === "All"
    ? games
    : games.filter((g) => g.category === activeCategory);

  // Featured game: highest play count
  const featuredGame = games.reduce((prev, curr) => curr.plays > prev.plays ? curr : prev, games[0]);

  const exploredPercent = Math.round((gamesPlayed.length / games.length) * 100);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="animate-slide-up" style={{ opacity: 0 }}>
        <h1 className="text-2xl font-extrabold font-display section-title">
          <span className="gradient-text">Fun Games</span> 🎮
        </h1>
        <p className="text-muted-foreground mt-1">{games.length} games to play and learn!</p>
      </div>

      {/* Progress bar — X/12 Games Explored */}
      <div className="card-premium p-4 animate-slide-up delay-100" style={{ opacity: 0 }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-600">Games Explored</span>
          <span className="text-sm font-bold text-primary">{gamesPlayed.length}/{games.length} ({exploredPercent}%)</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="progress-bar-animated bg-gradient-to-r from-violet-400 to-fuchsia-500 h-full rounded-full shimmer-overlay"
            style={{ width: `${exploredPercent}%` }}
          />
        </div>
        {gamesPlayed.length === 0 && (
          <p className="text-gray-400 text-xs mt-2">Pick a game below to get started! 🚀</p>
        )}
      </div>

      {/* Category Tabs with emoji */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide animate-slide-up delay-100" style={{ opacity: 0 }}>
        {categoryTabs.map(({ key, emoji }) => {
          const isActive = activeCategory === key;
          return (
            <button key={key} onClick={() => setActiveCategory(key)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all active:scale-95 flex items-center gap-1.5 ${
                isActive ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}>
              <span>{emoji}</span>
              {key}
            </button>
          );
        })}
      </div>

      {/* Featured Game Spotlight — with sparkles */}
      <div className="animate-slide-up delay-200" style={{ opacity: 0 }}>
        <div
          className="featured-glow rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden cursor-pointer card-hover active:scale-[0.98]"
          style={{ background: `linear-gradient(135deg, ${featuredGame.color}, ${featuredGame.color}bb)` }}
          onClick={() => startGame(featuredGame.game_id)}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
          {/* Sparkle decorations */}
          <Sparkles className="absolute top-6 right-8 w-8 h-8 text-white/20 animate-sparkle" />
          <Sparkles className="absolute bottom-8 left-12 w-6 h-6 text-white/15 animate-sparkle" style={{ animationDelay: '0.5s' }} />
          <Sparkles className="absolute top-20 left-1/3 w-5 h-5 text-white/10 animate-sparkle" style={{ animationDelay: '1s' }} />
          <div className="absolute top-4 right-6 text-6xl opacity-10">⭐</div>
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="text-7xl animate-bounce-slow flex-shrink-0">{featuredGame.emoji}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">⭐ Featured</span>
                <span className="text-xs font-semibold text-white/70">{featuredGame.plays.toLocaleString()} plays</span>
              </div>
              <h2 className="text-2xl font-extrabold font-display">{featuredGame.title}</h2>
              <p className="text-white/80 text-sm mt-1">{featuredGame.description}</p>
              <button className="mt-4 bg-white text-gray-800 px-8 py-3 rounded-full text-sm font-bold hover:bg-gray-100 transition-all active:scale-95 animate-glow inline-flex items-center gap-2 shadow-lg">
                <Sparkles className="w-4 h-4" />
                PLAY NOW <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Game Grid */}
      <div className="animate-slide-up delay-300" style={{ opacity: 0 }}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filteredGames.map((game) => (
            <GameCard
              key={game.game_id}
              game={game}
              hasPlayed={gamesPlayed.includes(game.game_id)}
              bestScore={state.progress.gameScores[game.game_id]}
              onClick={() => startGame(game.game_id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
