# UI Templates

A collection of polished UI template experiments and concept apps.

## Current Template

`gamified-path-version`

A minimal placeholder-only learning app UI with a gamified progression path, light progression mechanics, original styling, and a calm mobile-first presentation.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion
- Zustand

## Run The Current Template

The current working template implementation stays at the repo root for now to avoid breaking the app while the repository grows into a multi-template collection.

1. `npm install`
2. `npm run dev`
3. Open `http://localhost:3000`

Build locally:

1. `npm run build`
2. `npm run start`

## Folder Structure

```text
ui-templates/
  README.md
  package.json
  .gitignore
  docs/
    ADDING_NEW_TEMPLATES.md
    TEMPLATE_GUIDE.md
  references/
    uploaded/
      README.md
  templates/
    gamified-path-version/
      README.md
      template.json
      notes.md
      references/
        README.md
      screenshots/
        README.md
  public/
  src/
```

## Screenshots

Add template screenshots to `templates/gamified-path-version/screenshots/`.

Suggested names:

- `gamified-path-version-home.png`
- `gamified-path-version-lesson.png`
- `gamified-path-version-profile.png`

## Reference Images

Add shared uploaded references to `references/uploaded/`.

If a reference also belongs to a specific template, place a copy in `templates/gamified-path-version/references/`.

## Adding Future Templates

Use `docs/ADDING_NEW_TEMPLATES.md`.

Keep future templates:

- original
- minimal unless the concept requires more density
- clearly named
- documented with their own `README.md`
- packaged with screenshots, references, and notes

## Notes

- The current template is intentionally placeholder-only.
- Do not copy real brand systems, mascots, exact icons, or exact layouts.
- Keep concepts lightweight, responsive, and easy to preview.
