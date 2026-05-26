# gamified-path-version

Minimal placeholder-only learning app UI with a soft gamified path, circular lesson nodes, and light progression mechanics.

## Design Goals

- feel progression-based
- stay calm and minimal
- keep content sparse
- feel mobile-first
- remain original and placeholder-only

## Style Rules

- pale green background
- white phone-like surfaces
- soft green primary actions
- subtle borders and shadows
- restrained motion only

## Placeholder-Only Rule

Do not add real lesson content.

Use simple placeholders such as:

- `Unit 1`
- `Lesson 1`
- `Question title`
- `Prompt goes here`
- `Option 1`

## Responsive Behavior

- mobile-first layout
- centered phone-style preview on desktop
- narrow path layout that does not stretch too wide
- bottom navigation remains visible and usable

## How To Run

1. `cd templates/gamified-path-version`
2. `npm install`
3. `npm run dev`
4. Open `http://localhost:3000`

Build locally:

1. `cd templates/gamified-path-version`
2. `npm run build`
3. `npm run start`

Implementation lives here:

- `src/`
- `public/`
- `src/features/luma-learn/`
- `supabase/`

## Included Screens

- welcome screen
- home path screen
- learn screen
- lesson screen
- profile screen
- out-of-hearts state

## Notes For Future Edits

- keep the template minimal
- keep labels placeholder-only
- avoid copying real learning apps directly
- keep the root repo clean and treat this folder as the standalone template app
