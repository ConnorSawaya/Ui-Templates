# Adding New Templates

## Naming Convention

- Use lowercase kebab-case.
- Keep names short and descriptive.
- Examples:
  - `gamified-path-version`
  - `checkout-minimal-flow`
  - `wellness-dashboard-soft`

## Folder Convention

Each new template should have:

```text
templates/<template-name>/
  README.md
  template.json
  notes.md
  references/
  screenshots/
```

If a template later becomes a standalone app, move its implementation into that folder and update the root README.

## What Every Template Needs

- `README.md`
- `template.json`
- `notes.md`
- at least one screenshot when available
- a references folder when inspiration is used

## Screenshot Convention

Use names like:

- `<template-name>-home.png`
- `<template-name>-detail.png`
- `<template-name>-mobile.png`

Do not store screenshots at the repo root.

## README Convention

Each template README should include:

- template name
- short description
- design goals
- style rules
- placeholder-content rule
- responsive behavior
- run instructions
- screens included
- future edit notes
