# Anthony Baldoza - Portfolio

Plain HTML, CSS and JavaScript. No framework, no runtime dependencies.

## Structure
- index.html - all content and SEO tags
- assets/css/styles.css - source styles (theme tokens at the top)
- assets/js/main.js - theme toggle, menu, scrollspy, reveal, typewriter, form
- assets/css/styles.min.css, assets/js/main.min.js - minified files the page loads
- assets/img, assets/fonts, assets/docs - images, self-hosted Geist fonts, certificate PDF

## Editing
1. Edit styles.css or main.js (never the .min files).
2. Run: npm install (first time only), then npm run build
3. Commit and push.

## Deploy
- GitHub Pages: Settings > Pages > Deploy from branch > main > / (root).
- Vercel / Netlify: import the repo; framework preset "Other"; no build command; output directory is the root.

## TODO (needs your real info)
- Add your LinkedIn link in index.html (contact section and the JSON-LD sameAs list).
- Replace assets/img/projects/*.svg with real screenshots (keep 16:10, 1280x800 works well).
- Add dates to the timeline and your school name.
- Add assets/docs/resume.pdf and a Resume button in the hero.
- Check the Pokedex and Norita repo URLs, and update canonical/og:url if your site URL differs.
