# Joshua Chukwurah portfolio

A static site: no build step and no framework. Open `index.html` in a browser to preview it.

## Files
- `index.html`, `style.css`, `script.js`: the readable source. Edit these.
- `dist/`: the same site, minified (about 30 KB of code after gzip). Upload this folder to Netlify, Cloudflare Pages, GitHub Pages or Vercel.
- `Joshua_Chukwurah_CV.pdf`: the file behind the CV buttons. Replace it to update your CV.
- `favicon.svg` and `apple-touch-icon.png`: the tab and home screen icons.

## Common edits
- Project cards: the `#projects` section in `index.html` (each card sits inside a `.hang` wrapper).
- Hero words that type and switch: `headlineWords` in `script.js`.
- Colours: the CSS variables at the top of `style.css` (`--accent`, `--accent-2` and the light theme block).
- Regenerate `dist/` after editing: minify the three files with terser (JS), csso (CSS) and html-minifier-terser (HTML).

## Notes
- Fonts (Google Fonts) and the GSAP and three.js libraries load from CDNs, so the first visit needs a network connection.
- The site respects the visitor's reduced-motion setting and their light or dark preference.
