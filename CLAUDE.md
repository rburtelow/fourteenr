# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev      # Start development server (http://localhost:3000)
pnpm build    # Build for production
pnpm start    # Run production build
pnpm lint     # Run ESLint
```

## Tech Stack

- Next.js 16 with App Router
- React 19
- Tailwind CSS v4 (uses `@theme inline` for CSS variables)
- TypeScript
- pnpm package manager

## Architecture

This is a hiking dashboard platform for Colorado 14ers. The app uses Next.js App Router with all pages in the `app/` directory.

**Design System**: The project follows a comprehensive design system documented in `design/design-system.json`. Key principles:
- Deep forest green (#064E3B) as the primary brand color for CTAs
- Large border radii (rounded-2xl/3xl cards, pill buttons) with soft shadows
- Warm off-white page background (#F6F8F6) with white card surfaces
- DM Sans for body/UI text, Playfair Display for editorial headlines

**CSS Tokens**: Design tokens are defined in `app/globals.css` using Tailwind v4's `@theme inline` syntax. When adding new semantic colors or spacing, add them there rather than hardcoding values.

**Font Setup**: Fonts are loaded via `next/font/google` in `app/layout.tsx` and exposed as CSS variables (`--font-sans`, `--font-display`).
