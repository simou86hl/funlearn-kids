export interface QuizOption {
  id: string;
  text: string;
  is_correct: boolean;
}

export interface QuizQuestion {
  id: string;
  text: string;
  type: 'single' | 'multiple' | 'text' | 'order';
  options: QuizOption[];
  points: number;
  image: string;
  correct_text_answer?: string;
  correct_order?: string[];
}

export interface Quiz {
  quiz_id: number;
  title: string;
  description: string;
  category: string;
  age_group: string;
  difficulty: 'easy' | 'medium' | 'hard';
  emoji: string;
  color: string;
  questions: QuizQuestion[];
  settings: { randomize: boolean; show_results: boolean; time_limit: number };
  created_at: string;
  updated_at: string;
  status: 'active';
  total_submissions: number;
  avg_score: number;
}

export interface Game {
  game_id: string;
  title: string;
  description: string;
  category: string;
  age_group: string;
  difficulty: 'easy' | 'medium' | 'hard';
  emoji: string;
  color: string;
  type: 'memory' | 'math-race' | 'word-scramble' | 'hangman' | 'pattern' | 'color-match';
  plays: number;
  avg_score: number;
}

export interface Task {
  task_id: string;
  title: string;
  description: string;
  type: 'quiz' | 'game' | 'score' | 'streak' | 'complete_all';
  target: number;
  reward_xp: number;
  emoji: string;
  category: string;
}

export interface Achievement {
  achievement_id: string;
  title: string;
  description: string;
  emoji: string;
  xp_reward: number;
  condition: string;
  category: string;
}
