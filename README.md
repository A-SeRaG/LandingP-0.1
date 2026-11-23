# CMind Landing Page

Professional landing page for CMind — a B2B multi-tenant School LMS for Arabic and international schools.

## File Structure

```
index.html            Landing page
privacy.html, terms.html, cookies.html   Legal pages (served at /privacy, /terms, /cookies)
css/main.css, css/legal.css
js/main.js            Interactions, form (Formspree), theme, service worker registration
sw.js                 Service worker (bump CACHE_NAME on each deploy)
assets/               Logo and icons (assets/icons)
og-image.png          Social share image (1200x630)
manifest.json, robots.txt, sitemap.xml, llms.txt
vercel.json           Security headers (CSP, HSTS, ...), clean URLs, cache rules
```

## Features

- **Neural Canvas Background** — Animated particle network
- **Custom Cursor** — Glow cursor with magnetic hover effects
- **Dark/Light Theme** — Toggle with localStorage persistence
- **Scroll Animations** — IntersectionObserver-based reveals
- **3D Card Tilts** — Perspective transforms on hover
- **Flip Cards** — Founder profiles with CSS 3D flip
- **Enrollment Modal** — Formspree-integrated contact form
- **Mobile Navigation** — Full-screen overlay menu
- **PWA Ready** — Service worker, manifest, offline support
- **SEO Optimized** — Schema.org, Open Graph, Twitter Cards
- **Accessibility** — ARIA labels, reduced motion support
- **Security Headers** — CSP, HSTS, X-Frame-Options

## Quick Start

### Option 1: Static Hosting (No Build)
Simply upload all files to any static host:
- Vercel
- Netlify
- GitHub Pages
- AWS S3
- Cloudflare Pages

### Option 2: Local Development
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000`

## Configuration

### Formspree Integration
Replace `YOUR_FORM_ID` in `js/main.js` with your actual Formspree form ID:
```javascript
const FORMSPREE_ID = 'your-form-id-here';
```

### Theme Colors
Edit CSS custom properties in `css/main.css`:
```css
:root {
  --cyan: #00f5ff;
  --dark: #020810;
  /* ... */
}
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- CSS and JS are split for parallel loading
- Fonts loaded with `font-display: swap`
- Images use `loading="lazy"` and `decoding="async"`
- Canvas animation capped at 30 FPS
- Tab visibility API pauses canvas when hidden
- Reduced motion support for accessibility

## License

© 2026 CMind. All rights reserved.
