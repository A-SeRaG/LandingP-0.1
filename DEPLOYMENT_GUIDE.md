# CMind Landing Page — Production Deployment Guide

## 🚀 Quick Deploy

### Option 1: Static Hosting (Recommended)
**Platforms:** Netlify, Vercel, Cloudflare Pages, GitHub Pages, AWS S3 + CloudFront

1. Upload all files to your hosting platform
2. Configure custom domain (cmind.tech)
3. Enable HTTPS (SSL certificate)
4. Set up CDN for global distribution

### Option 2: Docker Container
```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80 443
```

### Option 3: VPS/Cloud Server
```bash
# Install nginx
sudo apt update && sudo apt install nginx

# Copy files to web root
sudo cp -r . /var/www/cmind/

# Configure nginx (see nginx.conf below)
sudo nano /etc/nginx/sites-available/cmind

# Enable site
sudo ln -s /etc/nginx/sites-available/cmind /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx

# Setup SSL with Let's Encrypt
sudo certbot --nginx -d cmind.tech -d www.cmind.tech
```

---

## 🔒 Security Configuration

### Nginx Security Headers
```nginx
# /etc/nginx/conf.d/security.conf

server {
    listen 443 ssl http2;
    server_name cmind.tech;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/cmind.tech/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cmind.tech/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://formspree.io; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://formspree.io;" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

    # Compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css text/xml application/json application/javascript application/xml+rss application/atom+xml image/svg+xml;
    gzip_min_length 1000;
    gzip_comp_level 6;

    # Browser Caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # HTML files - no cache for instant updates
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Main page
    location / {
        root /var/www/cmind;
        index cmind-landing-production.html;
        try_files $uri $uri/ /cmind-landing-production.html;
    }

    # Service Worker - never cache
    location = /sw.js {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Service-Worker-Allowed "/";
    }

    # Manifest - short cache
    location = /manifest.json {
        expires 1h;
        add_header Cache-Control "public, must-revalidate";
    }
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name cmind.tech www.cmind.tech;
    return 301 https://cmind.tech$request_uri;
}
```

---

## 📊 Performance Checklist

- [ ] **Lighthouse Score > 90** on all metrics
- [ ] **First Contentful Paint < 1.8s**
- [ ] **Largest Contentful Paint < 2.5s**
- [ ] **Time to Interactive < 3.8s**
- [ ] **Cumulative Layout Shift < 0.1**
- [ ] **Total Blocking Time < 200ms**
- [ ] **Speed Index < 3.4s**

### Optimization Tips
1. **Compress images** using TinyPNG or Squoosh
2. **Enable Brotli compression** (better than gzip)
3. **Use a CDN** (Cloudflare, Fastly, AWS CloudFront)
4. **Preload critical fonts** with `<link rel="preload">`
5. **Self-host fonts** to avoid Google Fonts latency
6. **Minify HTML/CSS/JS** (already done inline)
7. **Use HTTP/2 Server Push** for critical CSS

---

## 🔧 Formspree Configuration

1. Create a form at https://formspree.io
2. Copy the form ID (e.g., `xpwzabcd`)
3. Replace `YOUR_FORM_ID` in the HTML with your actual ID:
   ```javascript
   const FORMSPREE_ID = 'xpwzabcd';
   ```
4. Add `cmind.tech` to allowed domains in Formspree settings
5. Enable reCAPTCHA in Formspree for spam protection

---

## 🧪 Testing Before Launch

### Functional Testing
- [ ] Form submission works and sends email
- [ ] Modal opens/closes correctly
- [ ] Mobile navigation works
- [ ] Theme toggle switches correctly
- [ ] All links scroll to correct sections
- [ ] Founder cards flip correctly
- [ ] Counter animation triggers on scroll

### Cross-Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Chrome Mobile (Android)
- [ ] Safari Mobile (iOS)

### Responsive Testing
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)
- [ ] Mobile landscape

### Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility
- [ ] Color contrast passes WCAG AA
- [ ] Focus indicators visible
- [ ] Alt text on all images

### Performance Testing
- [ ] Lighthouse audit > 90
- [ ] WebPageTest.org audit
- [ ] GTmetrix audit
- [ ] Mobile speed test

---

## 📈 Post-Launch Monitoring

### Setup These Tools
1. **Google Analytics 4** - Track user behavior
2. **Google Search Console** - Monitor SEO performance
3. **Sentry** - Error tracking and performance monitoring
4. **Uptime Robot** - Uptime monitoring (check every 5 minutes)
5. **PageSpeed Insights API** - Automated performance monitoring

### Key Metrics to Track
- Conversion rate (form submissions / page views)
- Bounce rate
- Average session duration
- Top traffic sources
- Mobile vs desktop usage
- Geographic distribution

---

## 🔄 Maintenance Schedule

### Weekly
- Check error logs
- Review form submissions
- Monitor uptime

### Monthly
- Update dependencies
- Review security headers
- Check broken links
- Update content if needed

### Quarterly
- Full security audit
- Performance benchmark
- Accessibility audit
- Content refresh

---

## 🆘 Troubleshooting

### Common Issues

**Form not submitting:**
- Check FORMSPREE_ID is correct
- Verify domain is allowed in Formspree
- Check browser console for CORS errors

**Fonts not loading:**
- Verify Google Fonts URL is correct
- Check CSP header allows fonts.googleapis.com
- Consider self-hosting fonts

**Service Worker not registering:**
- Ensure sw.js is served from root
- Check Service-Worker-Allowed header
- Verify HTTPS is enabled

**Theme toggle not working:**
- Check localStorage is not disabled
- Verify CSS variables are correct
- Test in incognito mode

---

## 📞 Support

For technical support:
- Email: hr@cmind.tech
- Documentation: https://docs.cmind.tech
- Status page: https://status.cmind.tech
