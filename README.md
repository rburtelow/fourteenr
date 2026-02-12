# My14er - Hiking Dashboard

A modern hiking platform dashboard built with Next.js, React, and Tailwind CSS, following a custom design system for outdoor applications.

## Design System

This project implements a comprehensive design system optimized for hiking and outdoor applications:

- **Color Palette**: Lime accent (#B9D60F) with mint/teal gradients and neutral backgrounds
- **Typography**: Clean, modern sans-serif with emphasis on readability
- **Components**: Rounded cards, pill-shaped buttons, soft shadows
- **Layout**: Responsive 12-column grid with generous spacing

## Features

- **Dashboard Overview**: Quick stats on hikes, peaks summited, distance, and elevation
- **Activity Tracking**: View recent hikes and progress
- **Weather Widget**: Daily weather forecast with visual indicators
- **Trail Recommendations**: Personalized trail suggestions
- **Popular Trails**: Browse featured Colorado 14ers

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (install with `npm install -g pnpm`)

### Installation

Dependencies are already installed. If you need to reinstall:

```bash
pnpm install
```

### Development

Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the dashboard.

### Build for Production

```bash
pnpm build
pnpm start
```

## Design System Reference

The complete design system is documented in `design.json`, including:

- Color tokens and usage guidelines
- Typography scale and font families
- Component specifications (buttons, cards, navigation)
- Spacing, border radius, and elevation values
- Motion and interaction patterns

## Project Structure

```
my14er/
├── app/
│   ├── layout.tsx      # Root layout with fonts and metadata
│   ├── page.tsx        # Dashboard page with all components
│   └── globals.css     # Global styles and design tokens
├── design.json         # Complete design system specification
└── package.json        # Dependencies and scripts
```

## Component Overview

- **Navigation**: Floating pill navigation with logo and CTAs
- **StatCard**: Display key metrics with icons and trends
- **ActivityItem**: Show recent hike details
- **WeatherCard**: Two-tone card with temperature and forecast
- **TrailCard**: Compact trail recommendations
- **TrailCardLarge**: Featured trail cards with imagery

## Customization

To customize the design:

1. Update color values in `app/globals.css` (CSS variables)
2. Modify component styles using Tailwind classes in `app/page.tsx`
3. Reference `design.json` for design system guidelines

## License

This is a demo project for showcasing hiking platform UI design.
