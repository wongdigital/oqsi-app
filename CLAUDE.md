# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OQSI (Outie Query System Interface) is a fan-made Severance-themed Next.js application that generates AI-powered "facts" about users' fictional "Outies" based on their "Innie" characteristics. It's built with Next.js 15, React 19, TypeScript, and integrates with OpenAI for AI generation.

## Development Commands

- `pnpm dev` - Start development server with Turbopack (preferred)
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint (Next.js config with unused variable rules)
- `npm install` or `pnpm install` - Install dependencies

Note: This project uses pnpm as the preferred package manager based on the presence of `pnpm-lock.yaml`.

## Architecture & Key Components

### Application Flow
1. User fills out multi-step questionnaire about their "Innie" (`src/content.json` defines the questions)
2. Selections are stored in Zustand store (`src/lib/store.ts`)
3. AI generates personalized "Outie facts" via `/api/generate-facts` endpoint
4. Facts are displayed with themed UI and background music

### State Management
- **Zustand stores**: Multiple stores handle different aspects
  - `src/lib/store.ts` - Main user data (name, selections)
  - `src/lib/music-player-store.ts` - Music player state
  - `src/lib/light-switch-store.ts` - Theme/lighting state

### API Integration
- **OpenAI**: Uses LangChain with gpt-4o-mini for fact generation (`src/app/api/generate-facts/route.ts`)
- **BunnyCDN**: Video streaming integration (`src/app/api/bunny/videos/route.ts`)

### UI Architecture
- **shadcn/ui components**: Located in `src/components/ui/`
- **Page templates**: `ContentPageTemplate.tsx` with slide-based navigation
- **Content types**: `ContentMultipleChoice.tsx`, `ContentInputFields.tsx`, `ContentTextOnly.tsx`
- **Global layout**: Music player, analytics, and theme management in `layout.tsx`

## Environment Variables

Required environment variables (see `.env.example`):
- OpenAI API configuration (standard or Azure)
- BunnyCDN configuration for video streaming
- Google Analytics measurement ID

## TypeScript Configuration

- Uses path aliases: `@/*` maps to `./src/*`
- Strict mode enabled with Next.js plugin integration
- Target: ES2017 with modern module resolution

## Styling & UI

- **Tailwind CSS**: v4 with custom animations (`tailwindcss-animate`)
- **Inter font**: Used as Helvetica substitute
- **Motion library**: For animations and transitions
- **Theme support**: Light/dark theme switching via LightSwitch component

## Content Management

The questionnaire content is defined in `src/content.json` with a structured format:
- Each slide has order, title, type, and options
- Types: `inputFields`, `multipleChoice`, `textOnly`
- Used by content template components to render appropriate UI

## Key Files to Understand

- `src/content.json` - Questionnaire structure
- `src/lib/store.ts` - Main application state
- `src/app/api/generate-facts/route.ts` - AI fact generation logic
- `src/components/ContentPageTemplate.tsx` - Core page navigation
- `src/lib/constants.ts` - Fact categories and fallback data