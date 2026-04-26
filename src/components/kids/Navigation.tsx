"use client";

import { useEffect, useState } from "react";
import { useApp, ViewType } from "@/lib/store";
import { Home, BookOpen, Gamepad2, ListChecks, User, Trophy, Star } from "lucide-react";

interface NavTab {
  view: ViewType;
  emoji: string;
  label: string;
  desc: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const TABS: NavTab[] = [
  { view: "home",        emoji: "🏠", label: "Home",   desc: "Explore", Icon: Home },
  { view: "quizzes",     emoji: "📝", label: "Quizzes", desc: "Learn",   Icon: BookOpen },
  { view: "games",       emoji: "🎮", label: "Games",   desc: "Play",    Icon: Gamepad2 },
  { view: "leaderboard", emoji: "🏆", label: "Ranks",  desc: "Compete", Icon: Trophy },
  { view: "tasks",       emoji: "📋", label: "Tasks",   desc: "Missions", Icon: ListChecks },
  { view: "profile",     emoji: "👤", label: "Profile", desc: "Stats",   Icon: User },
];

const HIDDEN_VIEWS: ViewType[] = ["quiz-player", "game-player"];

function shouldHideNav(currentView: ViewType): boolean {
  return HIDDEN_VIEWS.includes(currentView);
}

export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const onChange = (e: MediaQueryListEvent | MediaQueryList) => setIsDesktop(e.matches);
    onChange(mql);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isDesktop;
}

// ─── BottomNav (mobile only) ───

export function BottomNav() {
  const { state, navigate } = useApp();
  const isDesktop = useIsDesktop();
  const { currentView } = state;

  if (shouldHideNav(currentView) || isDesktop) return null;

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

        {TABS.map(({ view, label, Icon }) => {
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
                  {TABS.find((t) => t.view === view)?.emoji}
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
                {TABS.find((t) => t.view === view)?.desc}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ─── TopBar (mobile only) ───

export function TopBar() {
  const { state, navigate } = useApp();
  const isDesktop = useIsDesktop();
  const { currentView, progress } = state;

  if (shouldHideNav(currentView) || isDesktop) return null;

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
          {streakVisible && (
            <span
              className="flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-50 to-red-50 px-2.5 py-1.5 text-xs font-bold text-orange-500 shadow-sm transition-all duration-200 active:scale-95 animate-spring border border-orange-200/50"
              title={`You're on a ${streak}-day streak!`}
            >
              <span role="img" aria-hidden="true" className="text-sm">🔥</span>
              {streak}
            </span>
          )}

          <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-primary shadow-sm transition-all duration-200 active:scale-95 animate-glow border border-primary/10">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Lv&nbsp;</span>{level}
          </span>

          <span className="rounded-full bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-primary shadow-sm border border-violet-200/30 transition-all duration-200">
            {totalXP.toLocaleString()} XP
          </span>
        </div>
      </div>
    </header>
  );
}

// ─── DesktopSidebar (desktop only) ───

export function DesktopSidebar() {
  const { state, navigate } = useApp();
  const isDesktop = useIsDesktop();
  const { currentView, progress, profileName, profileAvatar } = state;

  if (!isDesktop || shouldHideNav(currentView)) return null;

  const xpInLevel = progress.totalXP % 100;

  return (
    <aside className="desktop-sidebar glass flex flex-col py-6 border-r border-white/20" role="navigation" aria-label="Desktop navigation">
      {/* Logo */}
      <div className="px-6 mb-8">
        <button
          onClick={() => navigate("home")}
          className="flex items-center gap-2 transition-all duration-300 hover:opacity-80 active:scale-95"
          aria-label="Go to home"
        >
          <span className="text-3xl leading-none animate-bounce-slow" role="img" aria-hidden="true">🌟</span>
          <h1 className="logo-gradient text-xl font-extrabold tracking-tight font-display">
            FunLearn Kids
          </h1>
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 space-y-1">
        {TABS.map(({ view, label, Icon }) => {
          const isActive = currentView === view;
          return (
            <button
              key={view}
              onClick={() => navigate(view)}
              className={`sidebar-nav-item w-full flex items-center gap-3 px-4 py-3 rounded-r-xl text-sm font-semibold transition-all ${
                isActive
                  ? "active text-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={isActive ? 2.2 : 1.8} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="px-6 pt-6 border-t border-gray-200/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-2xl ring-2 ring-primary/20">
            {profileAvatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-gray-800 truncate">{profileName}</p>
            <p className="text-xs text-gray-500">
              Level {progress.level} &bull; {xpInLevel}/100 XP
            </p>
          </div>
        </div>
        {/* Mini XP bar */}
        <div className="mt-2 w-full bg-gray-200/80 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-400 to-fuchsia-500 rounded-full transition-all duration-500"
            style={{ width: `${xpInLevel}%` }}
          />
        </div>
      </div>
    </aside>
  );
}

export default function Navigation() {
  return (
    <>
      <TopBar />
      <BottomNav />
      <DesktopSidebar />
    </>
  );
}
