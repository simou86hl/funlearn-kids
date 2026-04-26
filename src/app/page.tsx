"use client";

import { AppProvider, useApp } from "@/lib/store";
import { TopBar, BottomNav, DesktopSidebar, useIsDesktop } from "@/components/kids/Navigation";
import HomeView from "@/components/kids/HomeView";
import QuizBrowser from "@/components/kids/QuizBrowser";
import QuizPlayer from "@/components/kids/QuizPlayer";
import GamesView from "@/components/kids/GamesView";
import GamePlayer from "@/components/kids/GamePlayer";
import TasksView from "@/components/kids/TasksView";
import ProfileView from "@/components/kids/ProfileView";
import LeaderboardView from "@/components/kids/LeaderboardView";
import { X } from "lucide-react";

function NotificationToast() {
  const { state, dismissNotification } = useApp();
  const { notifications } = state;

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none">
      {notifications.slice(-3).map((notif) => {
        const icon = notif.type === 'xp' ? '⚡' : notif.type === 'achievement' ? '🏆' : 'ℹ️';
        const bgClass = notif.type === 'xp'
          ? 'from-violet-500 to-fuchsia-500'
          : notif.type === 'achievement'
          ? 'from-amber-400 to-orange-500'
          : 'from-blue-400 to-cyan-500';

        return (
          <div
            key={notif.id}
            className={`notification-toast pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r ${bgClass} text-white shadow-xl shadow-violet-500/20 max-w-xs`}
          >
            <span className="text-lg flex-shrink-0">{icon}</span>
            <span className="text-sm font-bold flex-1">{notif.message}</span>
            <button
              onClick={() => dismissNotification(notif.id)}
              className="flex-shrink-0 p-0.5 rounded-full hover:bg-white/20 transition-colors active:scale-90"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

function AppContent() {
  const { state } = useApp();
  const isDesktop = useIsDesktop();
  const showNav = state.currentView !== "quiz-player" && state.currentView !== "game-player";
  const isPlayer = state.currentView === "quiz-player" || state.currentView === "game-player";

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar rendered via Navigation exports, but we also render it here for layout */}
      {showNav && <DesktopSidebar />}

      <main
        className={`${
          showNav && isDesktop ? "lg:ml-64" : ""
        } ${
          !isPlayer && !isDesktop ? "pt-16 pb-24" : ""
        } ${
          !isPlayer && isDesktop ? "pt-6" : ""
        }`}
      >
        <div className={`${isDesktop ? "max-w-6xl" : "max-w-5xl"} mx-auto px-4 sm:px-6`}>
          {state.currentView === "home" && <HomeView />}
          {state.currentView === "quizzes" && <QuizBrowser />}
          {state.currentView === "quiz-player" && <QuizPlayer />}
          {state.currentView === "games" && <GamesView />}
          {state.currentView === "game-player" && <GamePlayer />}
          {state.currentView === "tasks" && <TasksView />}
          {state.currentView === "profile" && <ProfileView />}
          {state.currentView === "leaderboard" && <LeaderboardView />}
        </div>
      </main>

      {showNav && <BottomNav />}
      <NotificationToast />
    </div>
  );
}

export default function Page() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
