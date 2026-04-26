import { Task } from './types';
export const dailyTasks: Task[] = [
  { task_id: 'daily-quiz-1', title: 'Quiz Champion', description: 'Complete 1 quiz today', type: 'quiz', target: 1, reward_xp: 20, emoji: '📝', category: 'daily' },
  { task_id: 'daily-game-1', title: 'Game Time', description: 'Play 1 game today', type: 'game', target: 1, reward_xp: 15, emoji: '🎮', category: 'daily' },
  { task_id: 'daily-score-80', title: 'High Scorer', description: 'Score 80% or higher on any quiz', type: 'score', target: 80, reward_xp: 30, emoji: '⭐', category: 'daily' },
  { task_id: 'daily-complete-3', title: 'Busy Bee', description: 'Complete 3 activities today', type: 'complete_all', target: 3, reward_xp: 25, emoji: '🐝', category: 'daily' },
  { task_id: 'daily-streak-3', title: 'On Fire!', description: 'Maintain a 3-day streak', type: 'streak', target: 3, reward_xp: 50, emoji: '🔥', category: 'daily' },
];
export const weeklyTasks: Task[] = [
  { task_id: 'weekly-quiz-5', title: 'Quiz Master', description: 'Complete 5 quizzes this week', type: 'quiz', target: 5, reward_xp: 100, emoji: '🏆', category: 'weekly' },
  { task_id: 'weekly-game-5', title: 'Game Pro', description: 'Play 5 games this week', type: 'game', target: 5, reward_xp: 80, emoji: '🕹️', category: 'weekly' },
  { task_id: 'weekly-score-90', title: 'Perfectionist', description: 'Score 90%+ on 3 quizzes', type: 'score', target: 90, reward_xp: 120, emoji: '💯', category: 'weekly' },
  { task_id: 'weekly-all-categories', title: 'Explorer', description: 'Complete activities in all 5 categories', type: 'complete_all', target: 5, reward_xp: 150, emoji: '🌍', category: 'weekly' },
];
