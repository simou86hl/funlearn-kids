"use client";

import { useApp, ViewType } from "@/lib/store";
import { Home, BookOpen, Gamepad2, ListChecks, User, Trophy } from "lucide-react";

interface NavTab {
  view: ViewType;
  emoji: string;
  label: string;
  desc: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const TABS: NavTab[] = [
  { view: "home",      emoji: "🏠", label: "Home",   desc: "Explore", Icon: Home },
  { view: "quizzes",   emoji: "📝", label: "Quizzes", desc: "Learn",   Icon: BookOpen },
  { view: "games",     emoji: "🎮", label: "Games",   desc: "Play",    Icon: Gamepad2 },
  { view: "leaderboard", emoji: "🏆", label: "Ranks",  desc: "Compete", Icon: Trophy },
  { view: "tasks",     emoji: "📋", label: "Tasks",   desc: "Missions", Icon: ListChecks },
  { view: "profile",   emoji: "👤", label: "Profile", desc: "Stats",   Icon: User },
];

const HIDDEN_VIEWS: ViewType[] = ["quiz-player", "game-player"];

function shouldHideNav(currentView: ViewType): boolean {
  return HIDDEN_VIEWS.includes(currentView);
}

// ─── BottomNav ───

export function BottomNav() {
  const { state, navigate } = useApp();
  const { currentView } = state;

  if (shouldHideNav(currentView)) return null;

  const activeIndex = TABS.findIndex((t) => t.view === currentView);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 glass rounded-t-3xl"
      role="tablist"
      aria-label="Main navigation"
    >
      <div className="relative flex items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom,8px)] pt-1.5">
        {/* Sliding pill indicator */}
        {activeIndex >= 0 && (
          <div
            className="nav-pill absolute top-0 h-[3px] rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
            style={{
              left: `${(activeIndex / TABS.length) * 100}%`,
              width: `${100 / TABS.length}%`,
            }}
          />
        )}

        {TABS.map(({ view, emoji, label, desc, Icon }) => {
          const isActive = currentView === view;

          return (
            <button
              key={view}
              role="tab"
              aria-selected={isActive}
              aria-label={label}
              onClick={() => navigate(view)}
              className={`
                group relative flex min-h-[60px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5
                rounded-2xl px-1 py-2 transition-all duration-300 ease-out
                ${isActive
                  ? "text-primary"
                  : "text-gray-400 active:scale-95 hover:text-gray-500"
                }
              `}
            >
              {/* Active glow */}
              {isActive && (
                <span className="absolute inset-2 rounded-2xl bg-primary/8 animate-glow pointer-events-none" />
              )}

              <span
                className={`transition-transform duration-300 ${
                  isActive ? "scale-110" : "group-hover:scale-105"
                }`}
              >
                <Icon
                  className="h-5 w-5 sm:hidden"
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                <span className="hidden sm:inline text-xl leading-none">
                  {emoji}
                </span>
              </span>

              <span
                className={`text-[10px] font-bold leading-tight tracking-wide transition-colors duration-300 ${
                  isActive ? "text-primary" : "text-gray-400"
                }`}
              >
                {label}
              </span>

              <span className="hidden md:block text-[8px] text-gray-300 leading-tight">
                {desc}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ─── TopBar ───

export function TopBar() {
  const { state, navigate } = useApp();
  const { currentView, progress } = state;

  if (shouldHideNav(currentView)) return null;

  const { totalXP, level, streak } = progress;
  const streakVisible = streak > 0;

  return (
    <header className="sticky top-0 z-50 glass gradient-border-bottom">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <button
          onClick={() => navigate("home")}
          className="flex items-center gap-1.5 transition-all duration-300 active:scale-95 hover:opacity-80"
          aria-label="Go to home"
        >
          <span className="text-2xl leading-none animate-bounce-slow" role="img" aria-hidden="true">
            🌟
          </span>
          <h1 className="logo-gradient text-lg font-extrabold tracking-tight font-display">
            FunLearn Kids
          </h1>
        </button>

        {/* Stats */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Streak */}
          {streakVisible && (
            <span
              className="flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-50 to-red-50 px-2.5 py-1.5 text-xs font-bold text-orange-500 shadow-sm transition-all duration-200 active:scale-95 animate-spring border border-orange-200/50"
              title={`You're on a ${streak}-day streak!`}
            >
              <span role="img" aria-hidden="true" className="text-sm">
                🔥
              </span>
              {streak}
            </span>
          )}

          {/* Level */}
          <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-primary shadow-sm transition-all duration-200 active:scale-95 animate-glow border border-primary/10">
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
            </svg>
            <span className="hidden sm:inline">Lv&nbsp;</span>{level}
          </span>

          {/* XP */}
          <span className="rounded-full bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-primary shadow-sm border border-violet-200/30 transition-all duration-200">
            <span className="hidden sm:inline">{'</>'}</span>
            {totalXP.toLocaleString()} XP
          </span>
        </div>
      </div>
    </header>
  );
}

export default function Navigation() {
  return (
    <>
      <TopBar />
      <BottomNav />
    </>
  );
}
