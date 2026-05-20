# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Static website for **TB Abogados** (law firm in Argentina), deployed via GitHub Pages at `tbabogados.com.ar`.

## CSS Build

Tailwind CSS must be recompiled after adding new utility classes to any HTML or JS file:

```bash
npx tailwindcss -i ./css/tailwind-input.css -o ./css/tailwind-compiled.css --minify
```

`css/tailwind-compiled.css` is the active stylesheet referenced in all HTML files. `css/styles.css` holds custom and critical CSS not covered by Tailwind.

## Architecture

### Two-tier page structure

1. **`index.html` — pseudo-SPA**: The main page contains multiple `view-section` divs and uses hash-based routing (`#home`, `#servicios`, `#calculadoras`, `#divorcios`, etc.). Navigation never reloads the page. Some views are stored in `<template>` tags and hydrated lazily on first visit.

2. **Standalone HTML pages**: Each `servicios/<slug>/index.html` and `guias-legales/<slug>/index.html` is a fully independent page with its own `<head>`, nav, and styles.

### JavaScript files

- `js/main.js` — SPA router (`navigate()`, hash change listener), hero carousel, services carousel, mobile menu animation, and `ensureLazyView()` for template hydration.
- `js/calculadoras.js` — Legal calculators (sueldo neto, despido, ART, SAC/aguinaldo). Lazy-loaded the first time the `#calculadoras` view is opened via `window.__TB_CALCULADORAS_SRC`.
- `js/calculator-result-share.js` — Share/download buttons injected into calculator result cards.
- `js/whatsapp-widget.js` — Floating WhatsApp button.
- `js/divorcios-page.js` — Logic specific to the divorcios SPA view.

### Tailwind theme extensions

Custom colors defined in `tailwind.config.js`:
- `gold` / `gold-hover` / `gold-light` — brand accent color
- `darkblue-900/800/700` — dark grays used for headings

Fonts: `Playfair Display` (serif headings) and `Inter` (sans body).
