"use client";

import { useApp, ViewType } from "@/lib/store";
import { Home, BookOpen, Gamepad2, ListChecks, User } from "lucide-react";

// ─────────────────────────────────────────────
// Types & config
// ─────────────────────────────────────────────

interface NavTab {
  view: ViewType;
  emoji: string;
  label: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const TABS: NavTab[] = [
  { view: "home",      emoji: "🏠", label: "Home",   Icon: Home },
  { view: "quizzes",   emoji: "📝", label: "Quizzes", Icon: BookOpen },
  { view: "games",     emoji: "🎮", label: "Games",   Icon: Gamepad2 },
  { view: "tasks",     emoji: "📋", label: "Tasks",   Icon: ListChecks },
  { view: "profile",   emoji: "👤", label: "Profile", Icon: User },
];

const HIDDEN_VIEWS: ViewType[] = ["quiz-player", "game-player"];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function shouldHideNav(currentView: ViewType): boolean {
  return HIDDEN_VIEWS.includes(currentView);
}

// ─────────────────────────────────────────────
// BottomNav
// ─────────────────────────────────────────────

export function BottomNav() {
  const { state, navigate } = useApp();
  const { currentView } = state;

  if (shouldHideNav(currentView)) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-stretch justify-around rounded-t-2xl bg-white/80 px-2 pb-[env(safe-area-inset-bottom,8px)] pt-1 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] backdrop-blur-xl"
      role="tablist"
      aria-label="Main navigation"
    >
      {TABS.map(({ view, emoji, label, Icon }) => {
        const isActive = currentView === view;

        return (
          <button
            key={view}
            role="tab"
            aria-selected={isActive}
            aria-label={label}
            onClick={() => navigate(view)}
            className={`
              group relative flex min-h-16 min-w-0 flex-1 flex-col items-center justify-center gap-0.5
              rounded-2xl px-1 py-2 transition-all duration-300 ease-out
              ${
                isActive
                  ? "scale-105 bg-primary/10 text-primary"
                  : "text-gray-400 active:scale-95 active:bg-gray-100"
              }
            `}
          >
            {/* active dot indicator */}
            {isActive && (
              <span className="absolute left-1/2 top-0.5 h-1 w-6 -translate-x-1/2 rounded-full bg-primary transition-all duration-300" />
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
              className={`text-[10px] font-semibold leading-tight tracking-wide transition-colors duration-300 ${
                isActive ? "text-primary" : "text-gray-400"
              }`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

// ─────────────────────────────────────────────
// TopBar
// ─────────────────────────────────────────────

export function TopBar() {
  const { state, navigate } = useApp();
  const { currentView, progress } = state;

  if (shouldHideNav(currentView)) return null;

  const { totalXP, level, streak } = progress;
  const streakVisible = streak > 0;

  return (
    <header className="sticky top-0 z-50 flex w-full items-center justify-between bg-white/80 px-4 py-3 backdrop-blur-xl shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
      {/* Left – Platform name */}
      <button
        onClick={() => navigate("home")}
        className="flex items-center gap-1.5 transition-transform duration-200 active:scale-95"
        aria-label="Go to home"
      >
        <span className="text-2xl leading-none" role="img" aria-hidden="true">
          🌟
        </span>
        <h1 className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-lg font-extrabold tracking-tight text-transparent">
          FunLearn Kids
        </h1>
      </button>

      {/* Right – XP, Level, Streak */}
      <div className="flex items-center gap-3">
        {/* Streak */}
        {streakVisible && (
          <span
            className="flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-500 shadow-sm transition-transform duration-200 active:scale-95"
            title={`You're on a ${streak}-day streak!`}
          >
            <span role="img" aria-hidden="true" className="text-sm">
              🔥
            </span>
            {streak}
          </span>
        )}

        {/* Level badge */}
        <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary shadow-sm transition-transform duration-200 active:scale-95">
          <svg
            className="h-3.5 w-3.5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
          </svg>
          Lv&nbsp;{level}
        </span>

        {/* XP pill */}
        <span className="rounded-full bg-gradient-to-r from-primary/10 to-purple-100 px-3 py-1.5 text-xs font-bold text-primary shadow-sm">
          {totalXP.toLocaleString()}&nbsp;XP
        </span>
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────
// Default export – combined shell
// ─────────────────────────────────────────────

export default function Navigation() {
  return (
    <>
      <TopBar />
      <BottomNav />
    </>
  );
}
