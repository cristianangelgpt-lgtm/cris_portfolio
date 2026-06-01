# QA Checklist

## Content

- All public projects from `portfolio-content` are included.
- Folder order is preserved.
- Area pages match the source structure.
- Project summaries, metadata, deliverables and sources render correctly.
- Projects without images receive fallback visuals.

## Visual

- Home page has strong visual impact.
- Area pages are readable and image-forward.
- Mobile layout is usable.
- Images are not distorted.

## Interaction

- `Read more` opens and closes.
- PhotoSwipe lightbox opens galleries.
- Keyboard navigation works for links and accordions.

## Build

- `npm run validate-content` passes.
- `npm run build` passes.
- `npm run preview` serves the built site.
- GitHub Pages base path works with `SITE_BASE`.
