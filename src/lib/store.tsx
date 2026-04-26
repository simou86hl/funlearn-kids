"use client";
import { createContext, useContext, useReducer, useEffect, useCallback, useRef, ReactNode } from 'react';

// ============ TYPES ============
export type ViewType = 'home' | 'quizzes' | 'quiz-player' | 'games' | 'game-player' | 'tasks' | 'profile' | 'leaderboard';

export interface Notification {
  id: string;
  message: string;
  type: 'xp' | 'achievement' | 'info';
  timestamp: number;
}

export interface UserProgress {
  totalXP: number;
  level: number;
  streak: number;
  lastActiveDate: string;
  quizzesCompleted: string[];
  quizScores: Record<string, number>;
  gamesPlayed: string[];
  gameScores: Record<string, number>;
  todayActivities: number;
  achievementsUnlocked: string[];
  tasksCompleted: Record<string, boolean>;
}

export interface AppState {
  currentView: ViewType;
  selectedQuizId: number | null;
  selectedGameId: string | null;
  progress: UserProgress;
  profileName: string;
  profileAvatar: string;
  onboardingComplete: boolean;
  soundEnabled: boolean;
  notifications: Notification[];
}

// ============ INITIAL STATE ============
const loadProgress = (): UserProgress => {
  if (typeof window === 'undefined') {
    return {
      totalXP: 0, level: 1, streak: 0, lastActiveDate: '',
      quizzesCompleted: [], quizScores: {}, gamesPlayed: [], gameScores: {},
      todayActivities: 0, achievementsUnlocked: [], tasksCompleted: {},
    };
  }
  try {
    const saved = localStorage.getItem('kidlearn-progress');
    if (saved) return JSON.parse(saved);
  } catch {}
  return {
    totalXP: 0, level: 1, streak: 0, lastActiveDate: '',
    quizzesCompleted: [], quizScores: {}, gamesPlayed: [], gameScores: {},
    todayActivities: 0, achievementsUnlocked: [], tasksCompleted: {},
  };
};

const loadProfile = () => {
  if (typeof window === 'undefined') return { name: 'Explorer', avatar: '🦁' };
  try {
    const saved = localStorage.getItem('kidlearn-profile');
    if (saved) return JSON.parse(saved);
  } catch {}
  return { name: 'Explorer', avatar: '🦁' };
};

const loadSettings = () => {
  if (typeof window === 'undefined') return { onboardingComplete: false, soundEnabled: true };
  try {
    const saved = localStorage.getItem('kidlearn-settings');
    if (saved) return JSON.parse(saved);
  } catch {}
  return { onboardingComplete: false, soundEnabled: true };
};

const initialState: AppState = {
  currentView: 'home',
  selectedQuizId: null,
  selectedGameId: null,
  progress: loadProgress(),
  profileName: loadProfile().name,
  profileAvatar: loadProfile().avatar,
  onboardingComplete: loadSettings().onboardingComplete,
  soundEnabled: loadSettings().soundEnabled,
  notifications: [],
};

// ============ ACTIONS ============
type Action =
  | { type: 'SET_VIEW'; view: ViewType }
  | { type: 'SELECT_QUIZ'; quizId: number }
  | { type: 'SELECT_GAME'; gameId: string }
  | { type: 'COMPLETE_QUIZ'; quizId: number; score: number; xp: number }
  | { type: 'COMPLETE_GAME'; gameId: string; score: number; xp: number }
  | { type: 'COMPLETE_TASK'; taskId: string; xp: number }
  | { type: 'UNLOCK_ACHIEVEMENT'; achievementId: string; xp: number }
  | { type: 'SET_PROFILE'; name: string; avatar: string }
  | { type: 'COMPLETE_ONBOARDING' }
  | { type: 'TOGGLE_SOUND' }
  | { type: 'ADD_NOTIFICATION'; notification: Notification }
  | { type: 'DISMISS_NOTIFICATION'; id: string }
  | { type: 'LOAD_STATE' };

function calculateLevel(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

function updateStreak(lastActiveDate: string): number {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (lastActiveDate === today) return 1;
  if (lastActiveDate === yesterday) return 2;
  return 1;
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, currentView: action.view };
    case 'SELECT_QUIZ':
      return { ...state, selectedQuizId: action.quizId, currentView: 'quiz-player' };
    case 'SELECT_GAME':
      return { ...state, selectedGameId: action.gameId, currentView: 'game-player' };
    case 'COMPLETE_QUIZ': {
      const quizId = String(action.quizId);
      const newCompleted = state.progress.quizzesCompleted.includes(quizId)
        ? state.progress.quizzesCompleted
        : [...state.progress.quizzesCompleted, quizId];
      const newXP = state.progress.totalXP + action.xp;
      const today = new Date().toDateString();
      const streak = state.progress.lastActiveDate === today
        ? state.progress.streak
        : updateStreak(state.progress.lastActiveDate);
      return {
        ...state,
        progress: {
          ...state.progress,
          totalXP: newXP,
          level: calculateLevel(newXP),
          streak,
          lastActiveDate: today,
          quizzesCompleted: newCompleted,
          quizScores: { ...state.progress.quizScores, [quizId]: action.score },
          todayActivities: state.progress.todayActivities + 1,
        },
        notifications: [
          ...state.notifications,
          {
            id: `notif-${Date.now()}`,
            message: `+${action.xp} XP earned! ⚡`,
            type: 'xp',
            timestamp: Date.now(),
          },
        ],
      };
    }
    case 'COMPLETE_GAME': {
      const newXP = state.progress.totalXP + action.xp;
      const today = new Date().toDateString();
      const streak = state.progress.lastActiveDate === today
        ? state.progress.streak
        : updateStreak(state.progress.lastActiveDate);
      return {
        ...state,
        progress: {
          ...state.progress,
          totalXP: newXP,
          level: calculateLevel(newXP),
          streak,
          lastActiveDate: today,
          gamesPlayed: state.progress.gamesPlayed.includes(action.gameId)
            ? state.progress.gamesPlayed
            : [...state.progress.gamesPlayed, action.gameId],
          gameScores: { ...state.progress.gameScores, [action.gameId]: action.score },
          todayActivities: state.progress.todayActivities + 1,
        },
        notifications: [
          ...state.notifications,
          {
            id: `notif-${Date.now()}`,
            message: `+${action.xp} XP earned! ⚡`,
            type: 'xp',
            timestamp: Date.now(),
          },
        ],
      };
    }
    case 'COMPLETE_TASK': {
      const newXP = state.progress.totalXP + action.xp;
      return {
        ...state,
        progress: {
          ...state.progress,
          totalXP: newXP,
          level: calculateLevel(newXP),
          tasksCompleted: { ...state.progress.tasksCompleted, [action.taskId]: true },
        },
        notifications: [
          ...state.notifications,
          {
            id: `notif-${Date.now()}`,
            message: `+${action.xp} XP from mission! 🎯`,
            type: 'xp',
            timestamp: Date.now(),
          },
        ],
      };
    }
    case 'UNLOCK_ACHIEVEMENT': {
      const newXP = state.progress.totalXP + action.xp;
      return {
        ...state,
        progress: {
          ...state.progress,
          totalXP: newXP,
          level: calculateLevel(newXP),
          achievementsUnlocked: state.progress.achievementsUnlocked.includes(action.achievementId)
            ? state.progress.achievementsUnlocked
            : [...state.progress.achievementsUnlocked, action.achievementId],
        },
        notifications: [
          ...state.notifications,
          {
            id: `notif-${Date.now()}`,
            message: `Achievement unlocked! 🏆`,
            type: 'achievement',
            timestamp: Date.now(),
          },
        ],
      };
    }
    case 'SET_PROFILE':
      return { ...state, profileName: action.name, profileAvatar: action.avatar };
    case 'COMPLETE_ONBOARDING':
      return { ...state, onboardingComplete: true };
    case 'TOGGLE_SOUND':
      return { ...state, soundEnabled: !state.soundEnabled };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.notification],
      };
    case 'DISMISS_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter((n) => n.id !== action.id),
      };
    case 'LOAD_STATE':
      return {
        ...state,
        progress: loadProgress(),
        profileName: loadProfile().name,
        profileAvatar: loadProfile().avatar,
        onboardingComplete: loadSettings().onboardingComplete,
        soundEnabled: loadSettings().soundEnabled,
      };
    default:
      return state;
  }
}

// ============ CONTEXT ============
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  navigate: (view: ViewType) => void;
  startQuiz: (quizId: number) => void;
  startGame: (gameId: string) => void;
  completeQuiz: (quizId: number, score: number, xp: number) => void;
  completeGame: (gameId: string, score: number, xp: number) => void;
  completeTask: (taskId: string, xp: number) => void;
  unlockAchievement: (achievementId: string, xp: number) => void;
  setProfile: (name: string, avatar: string) => void;
  completeOnboarding: () => void;
  toggleSound: () => void;
  addNotification: (message: string, type: 'xp' | 'achievement' | 'info') => void;
  dismissNotification: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Persist progress
  useEffect(() => {
    localStorage.setItem('kidlearn-progress', JSON.stringify(state.progress));
  }, [state.progress]);

  // Persist profile
  useEffect(() => {
    localStorage.setItem('kidlearn-profile', JSON.stringify({ name: state.profileName, avatar: state.profileAvatar }));
  }, [state.profileName, state.profileAvatar]);

  // Persist settings
  useEffect(() => {
    localStorage.setItem('kidlearn-settings', JSON.stringify({
      onboardingComplete: state.onboardingComplete,
      soundEnabled: state.soundEnabled,
    }));
  }, [state.onboardingComplete, state.soundEnabled]);

  // Auto-dismiss notifications after 3s
  useEffect(() => {
    if (state.notifications.length > 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const expired = state.notifications.filter(
          (n) => now - n.timestamp > 3000
        );
        expired.forEach((n) => dispatch({ type: 'DISMISS_NOTIFICATION', id: n.id }));
      }, 500);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.notifications]);

  const navigate = useCallback((view: ViewType) => dispatch({ type: 'SET_VIEW', view }), []);
  const startQuiz = useCallback((quizId: number) => dispatch({ type: 'SELECT_QUIZ', quizId }), []);
  const startGame = useCallback((gameId: string) => dispatch({ type: 'SELECT_GAME', gameId }), []);
  const completeQuiz = useCallback((quizId: number, score: number, xp: number) => dispatch({ type: 'COMPLETE_QUIZ', quizId, score, xp }), []);
  const completeGame = useCallback((gameId: string, score: number, xp: number) => dispatch({ type: 'COMPLETE_GAME', gameId, score, xp }), []);
  const completeTask = useCallback((taskId: string, xp: number) => dispatch({ type: 'COMPLETE_TASK', taskId, xp }), []);
  const unlockAchievement = useCallback((achievementId: string, xp: number) => dispatch({ type: 'UNLOCK_ACHIEVEMENT', achievementId, xp }), []);
  const setProfile = useCallback((name: string, avatar: string) => dispatch({ type: 'SET_PROFILE', name, avatar }), []);
  const completeOnboarding = useCallback(() => dispatch({ type: 'COMPLETE_ONBOARDING' }), []);
  const toggleSound = useCallback(() => dispatch({ type: 'TOGGLE_SOUND' }), []);
  const addNotification = useCallback((message: string, type: 'xp' | 'achievement' | 'info') => {
    dispatch({
      type: 'ADD_NOTIFICATION',
      notification: { id: `notif-${Date.now()}-${Math.random()}`, message, type, timestamp: Date.now() },
    });
  }, []);
  const dismissNotification = useCallback((id: string) => dispatch({ type: 'DISMISS_NOTIFICATION', id }), []);

  return (
    <AppContext.Provider value={{
      state, dispatch, navigate, startQuiz, startGame,
      completeQuiz, completeGame, completeTask, unlockAchievement,
      setProfile, completeOnboarding, toggleSound, addNotification, dismissNotification,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
