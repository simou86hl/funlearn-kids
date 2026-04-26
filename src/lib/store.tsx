"use client";
import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

// ============ TYPES ============
export type ViewType = 'home' | 'quizzes' | 'quiz-player' | 'games' | 'game-player' | 'tasks' | 'profile' | 'leaderboard';

export interface UserProgress {
  totalXP: number;
  level: number;
  streak: number;
  lastActiveDate: string;
  quizzesCompleted: string[]; // quiz_ids
  quizScores: Record<string, number>; // quiz_id -> score percentage
  gamesPlayed: string[]; // game_ids
  gameScores: Record<string, number>; // game_id -> score
  todayActivities: number;
  achievementsUnlocked: string[]; // achievement_ids
  tasksCompleted: Record<string, boolean>; // task_id -> completed today
}

export interface AppState {
  currentView: ViewType;
  selectedQuizId: number | null;
  selectedGameId: string | null;
  progress: UserProgress;
  profileName: string;
  profileAvatar: string;
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

const initialState: AppState = {
  currentView: 'home',
  selectedQuizId: null,
  selectedGameId: null,
  progress: loadProgress(),
  profileName: loadProfile().name,
  profileAvatar: loadProfile().avatar,
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
  | { type: 'LOAD_STATE' };

function calculateLevel(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

function updateStreak(lastActiveDate: string): number {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (lastActiveDate === today) return 1; // Will keep existing streak from saved data
  if (lastActiveDate === yesterday) return 2; // Continue streak
  return 1; // New streak
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
      };
    }
    case 'SET_PROFILE':
      return { ...state, profileName: action.name, profileAvatar: action.avatar };
    case 'LOAD_STATE':
      return {
        ...state,
        progress: loadProgress(),
        profileName: loadProfile().name,
        profileAvatar: loadProfile().avatar,
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
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    localStorage.setItem('kidlearn-progress', JSON.stringify(state.progress));
  }, [state.progress]);

  useEffect(() => {
    localStorage.setItem('kidlearn-profile', JSON.stringify({ name: state.profileName, avatar: state.profileAvatar }));
  }, [state.profileName, state.profileAvatar]);

  const navigate = (view: ViewType) => dispatch({ type: 'SET_VIEW', view });
  const startQuiz = (quizId: number) => dispatch({ type: 'SELECT_QUIZ', quizId });
  const startGame = (gameId: string) => dispatch({ type: 'SELECT_GAME', gameId });
  const completeQuiz = (quizId: number, score: number, xp: number) => dispatch({ type: 'COMPLETE_QUIZ', quizId, score, xp });
  const completeGame = (gameId: string, score: number, xp: number) => dispatch({ type: 'COMPLETE_GAME', gameId, score, xp });
  const completeTask = (taskId: string, xp: number) => dispatch({ type: 'COMPLETE_TASK', taskId, xp });
  const unlockAchievement = (achievementId: string, xp: number) => dispatch({ type: 'UNLOCK_ACHIEVEMENT', achievementId, xp });
  const setProfile = (name: string, avatar: string) => dispatch({ type: 'SET_PROFILE', name, avatar });

  return (
    <AppContext.Provider value={{ state, dispatch, navigate, startQuiz, startGame, completeQuiz, completeGame, completeTask, unlockAchievement, setProfile }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
