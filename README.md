# CMind Landing Page

Professional landing page for CMind — a B2B multi-tenant School LMS for Arabic and international schools.

## File Structure

```
cmind-landing/
├── index.html          # Main HTML file (~43KB)
├── css/
│   └── main.css        # All styles (~59KB)
├── js/
│   └── main.js         # All JavaScript (~15KB)
├── assets/             # Images, fonts, etc.
├── logo.ico            # Favicon
├── logo.png            # Logo image
├── manifest.json       # PWA manifest
├── robots.txt          # SEO robots
├── sitemap.xml         # SEO sitemap
├── sw.js               # Service Worker
├── vercel.json         # Vercel deployment config
├── DEPLOYMENT_GUIDE.md # Deployment instructions
└── README.md           # This file
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
