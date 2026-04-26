"use client";

import { AppProvider, useApp } from "@/lib/store";
import { TopBar, BottomNav } from "@/components/kids/Navigation";
import HomeView from "@/components/kids/HomeView";
import QuizBrowser from "@/components/kids/QuizBrowser";
import QuizPlayer from "@/components/kids/QuizPlayer";
import GamesView from "@/components/kids/GamesView";
import GamePlayer from "@/components/kids/GamePlayer";
import TasksView from "@/components/kids/TasksView";
import ProfileView from "@/components/kids/ProfileView";
import LeaderboardView from "@/components/kids/LeaderboardView";

function AppContent() {
  const { state } = useApp();
  const showNav = state.currentView !== "quiz-player" && state.currentView !== "game-player";

  return (
    <div className="min-h-screen bg-gray-50">
      {showNav && <TopBar />}

      <main className={`${showNav ? "pt-16 pb-24" : ""}`}>
        {state.currentView === "home" && <HomeView />}
        {state.currentView === "quizzes" && <QuizBrowser />}
        {state.currentView === "quiz-player" && <QuizPlayer />}
        {state.currentView === "games" && <GamesView />}
        {state.currentView === "game-player" && <GamePlayer />}
        {state.currentView === "tasks" && <TasksView />}
        {state.currentView === "profile" && <ProfileView />}
        {state.currentView === "leaderboard" && <LeaderboardView />}
      </main>

      {showNav && <BottomNav />}
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
