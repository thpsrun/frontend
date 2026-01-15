# THPS Run - Frontend

React frontend for the Tony Hawk's Pro Skater speedrunning leaderboard.

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite 7** - Build tool & dev server
- **TailwindCSS 4** - Utility-first CSS
- **Tanstack Query** (React Query) - Server state management
- **Jotai** - Client state management
- **Radix UI** - Accessible component primitives

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

Frontend available at http://localhost:3000

## Environment Variables

Create `.env.local` with:

```env
VITE_API_BASE_URL=http://localhost:8001/api/v1
VITE_API_BASE=http://localhost:8001/api
```

## Available Scripts

```bash
npm run dev       # Start dev server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

## Deployment

See REPO_SEPARATION_GUIDE.md for deployment options (Vercel, Netlify, self-hosted).
