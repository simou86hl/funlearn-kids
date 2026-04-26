"use client";
import React from "react";
import { useApp } from "@/lib/store";
import { quizzes } from "@/data/quizzes";
import { games } from "@/data/games";
import { ChevronRight } from "lucide-react";

const categories = [
  { name: "Math", emoji: "🧮", color: "#F97316" },
  { name: "Science", emoji: "🔬", color: "#22C55E" },
  { name: "English", emoji: "📚", color: "#8B5CF6" },
  { name: "Geography", emoji: "🌍", color: "#3B82F6" },
  { name: "Logic", emoji: "🧩", color: "#EC4899" },
];

const funFacts = [
  "📚 A group of flamingos is called a 'flamboyance'!",
  "🎮 Playing games can improve your problem-solving skills!",
  "🧠 Your brain uses about 20% of your body's energy!",
  "🌍 Honey never spoils — archaeologists found 3000-year-old edible honey!",
  "⭐ There are more stars in the universe than grains of sand on Earth!",
  "🐙 Octopuses have three hearts and blue blood!",
  "🔬 The shortest war in history lasted only 38 minutes!",
  "🦁 A tiger's stripes are as unique as human fingerprints!",
  "📝 Learning new things creates new connections in your brain!",
  "🚀 The International Space Station orbits Earth every 90 minutes!",
];

function DifficultyDots({ difficulty }: { difficulty: string }) {
  const level = difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3;
  return (
    <span className="flex items-center gap-1">
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={`w-2 h-2 rounded-full transition-colors ${
            i <= level ? "bg-violet-500" : "bg-gray-200"
          }`}
        />
      ))}
    </span>
  );
}

const CategoryCard = React.memo(function CategoryCard({ cat, count, onClick }: {
  cat: typeof categories[0];
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 w-28 h-32 rounded-2xl flex flex-col items-center justify-center gap-1 text-white shadow-lg card-hover active:scale-95 transition-all relative overflow-hidden"
      style={{ backgroundColor: cat.color }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
      <span className="text-3xl relative z-10 animate-float">{cat.emoji}</span>
      <span className="font-bold text-sm relative z-10">{cat.name}</span>
      <span className="text-xs opacity-80 relative z-10">{count} quizzes</span>
      <ChevronRight className="absolute top-3 right-2 w-4 h-4 opacity-50" />
    </button>
  );
});

const FeaturedQuizCard = React.memo(function FeaturedQuizCard({ quiz, onClick }: {
  quiz: typeof quizzes[0];
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl p-4 shadow-sm text-left card-hover active:scale-[0.97] relative overflow-hidden group"
    >
      {/* Gradient top strip */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
        style={{ backgroundColor: quiz.color }}
      />
      <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">{quiz.emoji}</span>
      <h3 className="font-bold text-base leading-tight mb-1 line-clamp-2">{quiz.title}</h3>
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="inline-block text-[10px] font-semibold text-white rounded-full px-2 py-0.5"
          style={{ backgroundColor: quiz.color }}
        >
          {quiz.category}
        </span>
        <span className="text-xs text-muted-foreground">{quiz.age_group}</span>
        <DifficultyDots difficulty={quiz.difficulty} />
      </div>
      <p className="text-xs text-muted-foreground mt-1">{quiz.avg_score}% avg · {quiz.questions.length}Q</p>
    </button>
  );
});

const GameCard = React.memo(function GameCard({ game, onClick }: {
  game: typeof games[0];
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 w-40 rounded-2xl overflow-hidden shadow-md bg-white text-left card-hover active:scale-[0.97] relative group"
    >
      <div
        className="h-24 flex items-center justify-center relative"
        style={{ backgroundColor: game.color }}
      >
        <span className="text-4xl drop-shadow-md group-hover:scale-110 transition-transform">{game.emoji}</span>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <span className="text-white font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 px-3 py-1 rounded-full">PLAY</span>
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-bold text-sm leading-tight mb-1">{game.title}</h3>
        <p className="text-xs text-muted-foreground">{game.plays.toLocaleString()} plays</p>
      </div>
    </button>
  );
});

export default function HomeView() {
  const { state, navigate, startQuiz, startGame } = useApp();
  const { progress, profileName, profileAvatar } = state;

  const xpInLevel = progress.totalXP % 100;
  const featuredQuizzes = quizzes.slice(0, 6);

  const categoryCounts: Record<string, number> = {};
  for (const quiz of quizzes) {
    categoryCounts[quiz.category] = (categoryCounts[quiz.category] || 0) + 1;
  }

  const todayProgress = Math.min(progress.todayActivities / 5, 1);
  const circumference = 2 * Math.PI * 42;

  const getMotivation = () => {
    if (todayProgress >= 1) return "🌟 Amazing! Daily goal complete!";
    if (todayProgress >= 0.6) return "🔥 Almost there! Keep going!";
    if (todayProgress >= 0.2) return "💪 Great start! You've got this!";
    return "🚀 Ready to learn today?";
  };

  return (
    <div className="space-y-6 pb-8">
      {/* ===== Hero Banner ===== */}
      <div className="hero-gradient rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden animate-slide-up">
        {/* Floating decorations */}
        <span className="absolute top-4 right-8 text-4xl animate-float opacity-30">📚</span>
        <span className="absolute top-12 right-24 text-3xl animate-float delay-200 opacity-25">🎮</span>
        <span className="absolute bottom-6 left-6 text-3xl animate-float delay-300 opacity-20">🧮</span>
        <span className="absolute bottom-10 right-12 text-2xl animate-float delay-500 opacity-25">🔬</span>

        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-1 font-display">
            Welcome back, {profileName}! {profileAvatar}
          </h1>

          <p className="text-white/90 text-lg mb-3">
            Level {progress.level} &bull; {xpInLevel}/100 XP to next level
          </p>

          {/* XP progress bar with shimmer */}
          <div className="w-full bg-white/20 rounded-full h-5 mb-3 overflow-hidden">
            <div
              className="bg-white rounded-full h-5 transition-all duration-700 ease-out shimmer-overlay relative"
              style={{ width: `${xpInLevel}%` }}
            >
              <div className="absolute inset-0 flex items-center justify-end pr-2">
                {xpInLevel > 15 && (
                  <span className="text-[10px] font-bold text-violet-900">{xpInLevel}%</span>
                )}
              </div>
            </div>
          </div>

          {progress.streak > 0 && (
            <p className="text-xl font-semibold animate-spring">
              🔥 {progress.streak} day streak!
            </p>
          )}
        </div>
      </div>

      {/* ===== Today's Progress ===== */}
      <div className="bg-white rounded-2xl p-6 shadow-sm animate-slide-up delay-100" style={{ opacity: 0 }}>
        <h2 className="text-xl font-bold mb-4 font-display">Today&apos;s Progress</h2>
        <div className="flex items-center gap-4">
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" stroke="#f0ecf9" strokeWidth="10" fill="none" />
              <circle
                cx="50" cy="50" r="42"
                stroke="url(#progressGrad)" strokeWidth="10" fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - todayProgress)}
                className="transition-all duration-700 ease-out"
              />
              <defs>
                <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#d946ef" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xl font-extrabold">
              {progress.todayActivities}
            </span>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-gray-800">
              {progress.todayActivities}/5
            </p>
            <p className="text-muted-foreground">activities completed</p>
            <p className="text-sm font-medium text-primary mt-1">{getMotivation()}</p>
          </div>
        </div>
      </div>

      {/* ===== Category Cards ===== */}
      <div className="animate-slide-up delay-200" style={{ opacity: 0 }}>
        <h2 className="text-xl font-bold mb-3 font-display">Explore Categories</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
          {categories.map((cat) => (
            <div key={cat.name} className="snap-start">
              <CategoryCard cat={cat} count={categoryCounts[cat.name] || 0} onClick={() => navigate("quizzes")} />
            </div>
          ))}
        </div>
      </div>

      {/* ===== Featured Quizzes ===== */}
      <div className="animate-slide-up delay-300" style={{ opacity: 0 }}>
        <h2 className="text-xl font-bold mb-3 font-display">Featured Quizzes</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {featuredQuizzes.map((quiz) => (
            <FeaturedQuizCard key={quiz.quiz_id} quiz={quiz} onClick={() => startQuiz(quiz.quiz_id)} />
          ))}
        </div>
      </div>

      {/* ===== Popular Games ===== */}
      <div className="animate-slide-up delay-400" style={{ opacity: 0 }}>
        <h2 className="text-xl font-bold mb-3 font-display">Popular Games</h2>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
          {games.slice(0, 6).map((game) => (
            <div key={game.game_id} className="snap-start">
              <GameCard game={game} onClick={() => startGame(game.game_id)} />
            </div>
          ))}
        </div>
      </div>

      {/* ===== Fun Facts Ticker ===== */}
      <div className="animate-slide-up delay-500" style={{ opacity: 0 }}>
        <div className="marquee-container bg-gradient-to-r from-violet-50 to-fuchsia-50 rounded-2xl py-3 px-4 border border-violet-100/50">
          <div className="marquee-content text-sm text-muted-foreground font-medium">
            {[...funFacts, ...funFacts].map((fact, i) => (
              <span key={i} className="whitespace-nowrap">{fact}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
