# Sangdon Park Faculty Homepage

This repository contains the source code for the official academic homepage of **Sangdon Park**,
Assistant Professor in the **Department of Computer Engineering, School of SW Convergence, Daejeon University**.

- Site: https://sangdon-park.github.io/
- Korean page: `ko.html`
- English page: `en.html`
- Publications page: `publications.html`

## Project Structure

- `ko.html`, `en.html`: main faculty profile pages
- `publications.html`: detailed publication list and category tabs
- `articles/`: article pages (`*-en.html` for English counterparts)
- `css/main.css`: global design/theme
- `css/article.css`: article-specific styles
- `js/chatbot.js`: optional chatbot integration script
- `_config.yml`, `Gemfile`: Jekyll/GitHub Pages configuration

## Local Development

```bash
bundle install
bundle exec jekyll serve --livereload
```

Default local URL:

- http://127.0.0.1:4000

Production build:

```bash
JEKYLL_ENV=production bundle exec jekyll build
```

Health check:

```bash
bundle exec jekyll doctor
```

## Content Update Guide

1. **Profile / About / Teaching / Contact updates**
   - Edit `ko.html` and `en.html`.
2. **Publication updates**
   - Edit constants in `publications.html`:
     - `journalPapers`
     - `conferencePapers`
     - `standardsPapers`
     - `patents`
3. **Article updates**
   - Keep Korean and English article pairs synchronized.
4. **Images / CV files**
   - Replace `images/Sangdon.jpg`, `CV-ko.pdf`, `CV.pdf` as needed.

## Deployment

The site is deployed via **GitHub Pages** from the `main` branch.
Pushing to `main` triggers automatic deployment.

## GitHub Traffic Sync

Repository traffic is collected automatically and versioned in this repo:

- Workflow: `.github/workflows/github-traffic-sync.yml`
- Collector script: `scripts/update_github_traffic.py`
- Outputs:
  - `data/github-traffic-summary.md`
  - `data/github-traffic-latest.json`
  - `data/github-traffic-history.json`

The workflow runs daily and can also be started manually from
`Actions > Sync GitHub Traffic > Run workflow`.

## Notes

- Do not commit secrets or API tokens.
- If changing chatbot backend endpoints, verify CORS for site origin.
