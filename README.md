# Cristian Choque Portfolio Site V2

Astro-based portfolio website generated from `../portfolio-content`.

The website is English-first and designed for GitHub Pages. The old
`../portfolio-site` is not used by this implementation.

## Commands

```powershell
npm install
npm run validate-content
npm run dev
npm run build
npm run preview
```

## GitHub Pages

This folder is the one that should become the GitHub repository. Do not publish
the whole `PORTFOLIO` workspace because it includes unrelated raw files, reports,
and local caches.

The repository is self-contained for deployment:

- `src/data/generatedPortfolio.ts` is committed
- `public/media/...` is committed
- `public/CV-CRIS.pdf` is committed
- the build falls back to these bundled files when `../portfolio-content` does not exist

For a project page such as `https://username.github.io/repo-name/`, Astro needs:

- `site = https://username.github.io`
- `base = /repo-name/`

This project now derives those values automatically in GitHub Actions from the
repository name, so you normally do not need to set them by hand.

If you want to test a project-page URL locally, build with:

```powershell
$env:SITE_BASE="/repo-name/"
$env:SITE_URL="https://username.github.io"
npm run build
```

For local development, no base override is required.

To publish on GitHub Pages:

1. Create a new public GitHub repository from the contents of this folder only.
2. Push the `main` branch.
3. In GitHub, open `Settings > Pages`.
4. Set `Source` to `GitHub Actions`.
5. Push changes normally; `.github/workflows/deploy.yml` will build and publish the site.

Do not upload:

- `node_modules/`
- `dist/`
- `.astro/`
- local log files

## Content Source

For local content regeneration, the site reads from `../portfolio-content`:

- area and group `README.md` files
- project `project.md`
- project `visual-index.md`
- project `images/`

When that source folder exists, run `npm run generate-content` before committing
changes. Do not edit generated files in `src/data/generatedPortfolio.ts` manually.
