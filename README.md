# FunLearn Kids - Educational Platform

A fun and interactive learning platform for kids aged 5-13. Built with Next.js 16, React, and Tailwind CSS.

## Features

- **18 Educational Quizzes** with 180 real questions across 5 subjects (Math, Science, English, Geography, History)
- **6 Interactive Games**: Memory Match, Math Race, Word Scramble, Hangman, Number Patterns, Color Match
- **Daily & Weekly Tasks** with streak tracking and rewards
- **Achievement System** with 15 unlockable badges
- **XP & Level Progression** with persistent localStorage
- **Leaderboard** with mock rankings and podium display
- **Kid-Friendly UI**: Colorful gradients, confetti animations, star ratings, large touch targets
- **Age-Appropriate Content** for ages 5-13

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: React Context + useReducer + localStorage
- **Icons**: Lucide React

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
  app/
    page.tsx          # Main SPA shell
    layout.tsx        # Root layout
    globals.css       # Global styles
  components/kids/
    Navigation.tsx    # Top bar + bottom nav
    HomeView.tsx      # Home screen
    QuizBrowser.tsx   # Quiz catalog
    QuizPlayer.tsx    # Quiz taking experience
    GamesView.tsx     # Games catalog
    GamePlayer.tsx    # 6 playable games
    TasksView.tsx     # Daily/weekly missions
    ProfileView.tsx   # User profile & stats
    LeaderboardView.tsx  # Rankings
  data/
    quizzes.ts        # 18 quizzes, 180 questions
    games.ts          # Game definitions
    tasks.ts          # Daily/weekly tasks
    achievements.ts   # 15 achievements
    types.ts          # TypeScript interfaces
  lib/
    store.tsx         # State management
```

## Deployment

Deploy easily on [Vercel](https://vercel.com):

```bash
npx vercel
```

## License

MIT
