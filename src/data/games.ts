import { Game } from './types';
export const games: Game[] = [
  { game_id: 'memory-match', title: 'Memory Match', description: 'Flip cards and find matching pairs! Train your memory.', category: 'Logic', age_group: '5-7', difficulty: 'easy', emoji: '🃏', color: '#EC4899', type: 'memory', plays: 3420, avg_score: 72 },
  { game_id: 'math-race', title: 'Math Race', description: 'Solve math problems as fast as you can! Race against the clock.', category: 'Math', age_group: '8-10', difficulty: 'medium', emoji: '🏎️', color: '#F97316', type: 'math-race', plays: 2850, avg_score: 65 },
  { game_id: 'word-scramble', title: 'Word Scramble', description: 'Unscramble the letters to make a word!', category: 'English', age_group: '8-10', difficulty: 'medium', emoji: '🔤', color: '#8B5CF6', type: 'word-scramble', plays: 2100, avg_score: 68 },
  { game_id: 'hangman', title: 'Hangman', description: 'Guess the word one letter at a time before time runs out!', category: 'English', age_group: '11-13', difficulty: 'hard', emoji: '🎯', color: '#EF4444', type: 'hangman', plays: 1890, avg_score: 55 },
  { game_id: 'number-patterns', title: 'Number Patterns', description: 'Find the missing number in the pattern!', category: 'Logic', age_group: '11-13', difficulty: 'hard', emoji: '🔢', color: '#3B82F6', type: 'pattern', plays: 1560, avg_score: 58 },
  { game_id: 'color-match', title: 'Color Match', description: 'Match the color name with the right color! Be quick!', category: 'Logic', age_group: '5-7', difficulty: 'easy', emoji: '🎨', color: '#22C55E', type: 'color-match', plays: 4200, avg_score: 75 },
];
