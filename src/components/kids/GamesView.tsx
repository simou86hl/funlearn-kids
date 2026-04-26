"use client";
import React from "react";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { games } from "@/data/games";
import { ChevronRight } from "lucide-react";

const difficultyColors: Record<string, string> = {
  easy: "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-700",
  hard: "bg-red-100 text-red-700",
};

const categoryTabs = ["All", "Logic", "Math", "English", "Science", "Geography"];

const GameCard = React.memo(function GameCard({ game, hasPlayed, bestScore, onClick }: {
  game: typeof games[0];
  hasPlayed: boolean;
  bestScore: number | undefined;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl overflow-hidden shadow-md bg-white text-left card-hover active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-violet-300 group"
    >
      <div className="h-28 flex items-center justify-center relative" style={{ backgroundColor: game.color }}>
        <span className="text-5xl drop-shadow-md group-hover:scale-110 transition-transform">{game.emoji}</span>
        {hasPlayed && (
          <span className="absolute top-2 right-2 bg-white/90 text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm text-emerald-600">
            ✓ Played
          </span>
        )}
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
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${difficultyColors[game.difficulty]}`}>
              {game.difficulty}
            </span>
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

  const featuredGame = games[5]; // Color Match — most played

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="animate-slide-up" style={{ opacity: 0 }}>
        <h1 className="text-2xl font-extrabold font-display">
          <span className="gradient-text">🎮</span> Fun Games
        </h1>
        <p className="text-muted-foreground mt-1">{games.length} games to play and learn!</p>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide animate-slide-up delay-100" style={{ opacity: 0 }}>
        {categoryTabs.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all active:scale-95 ${
                isActive ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}>
              {cat}
            </button>
          );
        })}
      </div>

      {/* Featured Game Spotlight */}
      <div className="animate-slide-up delay-200" style={{ opacity: 0 }}>
        <div
          className="rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden cursor-pointer card-hover active:scale-[0.98]"
          style={{ background: `linear-gradient(135deg, ${featuredGame.color}, ${featuredGame.color}cc)` }}
          onClick={() => startGame(featuredGame.game_id)}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
          <div className="relative z-10 flex items-center gap-6">
            <div className="text-7xl animate-bounce-slow flex-shrink-0">{featuredGame.emoji}</div>
            <div className="flex-1">
              <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">Featured</span>
              <h2 className="text-2xl font-extrabold font-display mt-2">{featuredGame.title}</h2>
              <p className="text-white/80 text-sm mt-1">{featuredGame.description}</p>
              <button className="mt-3 bg-white text-gray-800 px-6 py-2.5 rounded-full text-sm font-bold hover:bg-gray-100 transition-all active:scale-95 animate-glow">
                PLAY NOW <ChevronRight className="inline w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Game Grid */}
      <div className="animate-slide-up delay-300" style={{ opacity: 0 }}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
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

      {/* Progress Section */}
      <div className="glass rounded-2xl p-5 text-center animate-slide-up delay-400" style={{ opacity: 0 }}>
        <p className="text-gray-500 text-sm font-medium">Your Progress</p>
        <p className="text-2xl font-extrabold text-primary mt-1 font-display">
          {gamesPlayed.length}/{games.length} games played
        </p>
        <div className="w-full bg-gray-200 rounded-full h-3 mt-3 overflow-hidden">
          <div
            className="progress-bar-animated bg-gradient-to-r from-violet-400 to-fuchsia-500 h-full rounded-full shimmer-overlay"
            style={{ width: `${(gamesPlayed.length / games.length) * 100}%` }}
          />
        </div>
        {gamesPlayed.length === 0 && (
          <p className="text-gray-400 text-sm mt-2">Pick a game above to get started! 🚀</p>
        )}
      </div>
    </div>
  );
}
