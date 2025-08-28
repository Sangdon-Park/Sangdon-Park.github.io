# Repository Guidelines

## Project Structure & Module Organization
- Root: Jekyll site configured by `_config.yml` and `Gemfile`.
- Pages: `index.html`, `ko.html`, `en.html`, `publications.html`.
- Content: `articles/` (individual article pages; use `-en` suffix for English variants).
- Assets: `css/`, `js/`, `images/`, `latex/`.
- Misc: `robots.txt`, `favicon.*`, `README.md`.

## Build, Test, and Development Commands
- Install: `bundle install` — installs Jekyll and plugins from `Gemfile`.
- Serve: `bundle exec jekyll serve --livereload` — run locally at `http://127.0.0.1:4000`.
- Build: `bundle exec jekyll build` (use `JEKYLL_ENV=production` for prod build).
- Doctor: `bundle exec jekyll doctor` — checks for common config issues.

## Coding Style & Naming Conventions
- Indentation: 2 spaces for HTML/CSS/JS.
- Filenames: kebab-case (e.g., `ai-apt-representative.html`), English copies end with `-en.html`.
- CSS: keep global styles in `css/main.css`; article-specific rules in `css/article.css`.
- JS: place scripts in `js/` (e.g., `js/chatbot.js`); keep inline scripts minimal.
- Paths: reference assets relative to site root (e.g., `/images/Sangdon.jpg`).

## Testing Guidelines
- Local check: run the dev server and verify page rendering and console is error-free.
- Links/data: click through navigation, external links, and publication lists.
- Articles: ensure both `ko` and `en` variants (when applicable) stay in sync.

## Commit & Pull Request Guidelines
- Messages: follow Conventional Commits (e.g., `feat:`, `fix:`, `chore:`); imperative mood.
- Scope: small, focused changes with clear summaries.
- PRs: include description, affected pages/locale, before/after screenshots for UI, and linked issues.

## Security & Configuration Tips
- Do not commit secrets. `js/chatbot.js` uses a public `CHATBOT_API` endpoint—no tokens in client code.
- Update analytics IDs in `_config.yml` as needed; avoid leaking test IDs.
- CORS: if changing chatbot endpoint, ensure it allows the site origin.

