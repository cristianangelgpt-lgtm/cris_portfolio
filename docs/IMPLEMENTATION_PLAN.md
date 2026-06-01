# Implementation Plan

## Objective

Build a new Astro portfolio website in English, independent from the previous
static site, using `portfolio-content` as the source of truth.

## Architecture

- `scripts/generate-content.mjs` reads `../portfolio-content`.
- Generated typed data is written to `src/data/generatedPortfolio.ts`.
- Project images are copied to `public/media/projects/`.
- `src/pages/index.astro` renders the home page.
- Area pages render `GIS Analysis`, `Remote Sensing` and `UAV Mapping`.
- `src/pages/profile/index.astro` presents CV/profile content.

## Content Rules

- Preserve folder order.
- Ignore folders that start with `0 -`.
- Include all current public projects.
- Use project images as the main visual material.
- Use fallback group/area images for projects without own images.

## Design Rules

- English-only public UI.
- Cinematic technical visual direction.
- Strong imagery first, concise text second.
- Inline `Read more` accordions for project details.
- PhotoSwipe lightbox for galleries.
