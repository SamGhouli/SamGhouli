# Inner Victory Platform

A personal development and wellness platform built with Next.js 14, Supabase, and Tailwind CSS.

## Features

- **Progress Tracking** — Log daily wins, habits, and milestones
- **Authentication** — Secure sign-up / sign-in powered by Supabase Auth
- **Dashboard** — Visual overview of streaks and achievements
- **Responsive UI** — Fully mobile-friendly design with Tailwind CSS

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Styling | Tailwind CSS |
| Language | TypeScript |

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### Installation

```bash
git clone https://github.com/SamGhouli/SamGhouli.git
cd SamGhouli/inner-victory
npm install
```

### Environment Variables

Create a `.env.local` file at the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
inner-victory/
├── app/          # Next.js App Router pages & layouts
├── components/   # Reusable UI components
├── hooks/        # Custom React hooks
├── lib/          # Supabase client & utilities
├── supabase/     # Database migrations & types
└── types/        # Shared TypeScript types
```

## Deployment

Deploy instantly on [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

Set the same environment variables in your Vercel project settings.
