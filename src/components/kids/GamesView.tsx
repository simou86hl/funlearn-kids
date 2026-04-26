"use client";

import { useApp } from "@/lib/store";
import { games } from "@/data/games";

const difficultyColors: Record<string, string> = {
  easy: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  hard: "bg-red-100 text-red-700",
};

export default function GamesView() {
  const { state, startGame } = useApp();
  const gamesPlayed = state.progress.gamesPlayed;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-purple-100 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-purple-700">🎮 Fun Games</h1>
          <p className="text-purple-400 text-sm mt-1">
            Pick a game and start playing!
          </p>
        </div>
      </div>

      {/* Game Grid */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {games.map((game) => {
            const hasPlayed = gamesPlayed.includes(game.game_id);

            return (
              <button
                key={game.game_id}
                onClick={() => startGame(game.game_id)}
                className="rounded-2xl overflow-hidden shadow-lg bg-white text-left transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-purple-300"
              >
                {/* Colored top section with emoji */}
                <div
                  className="h-24 flex items-center justify-center relative"
                  style={{ backgroundColor: game.color }}
                >
                  <span className="text-5xl drop-shadow-md">{game.emoji}</span>
                  {hasPlayed && (
                    <span className="absolute top-2 right-2 bg-white/90 text-xs font-semibold px-2 py-0.5 rounded-full shadow-sm">
                      ✅ Played
                    </span>
                  )}
                </div>

                {/* Info section */}
                <div className="p-3">
                  <h3 className="font-bold text-gray-800 text-sm leading-tight">
                    {game.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {game.description}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">
                      Plays: {game.plays.toLocaleString()}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${difficultyColors[game.difficulty]}`}
                    >
                      {game.difficulty}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Stats section */}
        <div className="mt-8 bg-white rounded-2xl shadow-md p-5 text-center">
          <p className="text-gray-500 text-sm">Your Progress</p>
          <p className="text-2xl font-bold text-purple-700 mt-1">
            Total games played: {gamesPlayed.length}
          </p>
          {gamesPlayed.length === 0 && (
            <p className="text-gray-400 text-sm mt-2">
              Pick a game above to get started! 🚀
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
