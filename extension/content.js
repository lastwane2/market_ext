// Content script - extracts page data for CRO analysis

function extractPageSnapshot() {
  // Basic page info
  const snapshot = {
    url: window.location.href,
    title: document.title,
    timestamp: new Date().toISOString()
  };

  // Meta tags
  snapshot.meta = {
    description: document.querySelector('meta[name="description"]')?.content || '',
    keywords: document.querySelector('meta[name="keywords"]')?.content || '',
    ogTitle: document.querySelector('meta[property="og:title"]')?.content || '',
    ogDescription: document.querySelector('meta[property="og:description"]')?.content || ''
  };

  // Headings hierarchy
  snapshot.headings = {
    h1: Array.from(document.querySelectorAll('h1')).map(el => el.textContent.trim()).filter(Boolean),
    h2: Array.from(document.querySelectorAll('h2')).map(el => el.textContent.trim()).filter(Boolean),
    h3: Array.from(document.querySelectorAll('h3')).map(el => el.textContent.trim()).filter(Boolean)
  };

  // CTAs (buttons and links that look like CTAs)
  const ctaSelectors = [
    'button',
    'a[href*="signup"]',
    'a[href*="register"]',
    'a[href*="demo"]',
    'a[href*="trial"]',
    'a[href*="start"]',
    'a[href*="get-started"]',
    'a[href*="contact"]',
    'a[href*="buy"]',
    'a[href*="pricing"]',
    '[class*="cta"]',
    '[class*="btn"]',
    '[class*="button"]'
  ];

  const ctaElements = document.querySelectorAll(ctaSelectors.join(', '));
  snapshot.ctas = Array.from(ctaElements)
    .map(el => ({
      text: el.textContent.trim(),
      tag: el.tagName.toLowerCase(),
      href: el.href || null,
      isAboveFold: isAboveFold(el),
      classes: el.className
    }))
    .filter(cta => cta.text && cta.text.length < 100)
    .slice(0, 20);

  // Forms
  snapshot.forms = Array.from(document.querySelectorAll('form')).map(form => ({
    id: form.id,
    action: form.action,
    method: form.method,
    fields: Array.from(form.querySelectorAll('input, select, textarea')).map(field => ({
      type: field.type || field.tagName.toLowerCase(),
      name: field.name,
      placeholder: field.placeholder,
      required: field.required
    }))
  })).slice(0, 5);

  // Images (hero, social proof, etc.)
  snapshot.images = Array.from(document.querySelectorAll('img'))
    .filter(img => img.width > 50 && img.height > 50)
    .map(img => ({
      alt: img.alt,
      src: img.src,
      isAboveFold: isAboveFold(img),
      width: img.width,
      height: img.height
    }))
    .slice(0, 30);

  // Social proof elements
  snapshot.socialProof = {
    testimonials: findTestimonials(),
    logos: findClientLogos(),
    stats: findStats(),
    reviews: findReviews()
  };

  // Trust signals
  snapshot.trustSignals = {
    securityBadges: findSecurityBadges(),
    certifications: findCertifications(),
    guarantees: findGuarantees()
  };

  // Navigation
  snapshot.navigation = {
    mainNav: Array.from(document.querySelectorAll('nav a, header a'))
      .map(a => ({ text: a.textContent.trim(), href: a.href }))
      .filter(link => link.text)
      .slice(0, 15),
    hasContactInfo: !!(
      document.body.textContent.match(/[\w.-]+@[\w.-]+\.\w+/) ||
      document.body.textContent.match(/\+?[\d\s()-]{10,}/) ||
      document.querySelector('a[href^="tel:"]') ||
      document.querySelector('a[href^="mailto:"]')
    )
  };

  // Above fold content (first screen)
  snapshot.aboveFold = {
    mainHeadline: document.querySelector('h1')?.textContent.trim() || '',
    subheadline: getSubheadline(),
    hasCTA: snapshot.ctas.some(cta => cta.isAboveFold),
    hasImage: snapshot.images.some(img => img.isAboveFold),
    hasVideo: !!document.querySelector('video, iframe[src*="youtube"], iframe[src*="vimeo"]')
  };

  // Page structure (sections)
  snapshot.sections = analyzeSections();

  // Urgency elements
  snapshot.urgency = {
    hasCountdown: !!document.querySelector('[class*="countdown"], [class*="timer"]'),
    hasLimitedOffer: checkForText(['limited', 'only', 'left', 'hurry', 'ending', 'expires']),
    hasScarcity: checkForText(['spots', 'seats', 'available', 'remaining'])
  };

  // Main content text (for AI analysis)
  snapshot.mainContent = extractMainContent();

  return snapshot;
}

function isAboveFold(element) {
  const rect = element.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0;
}

function getSubheadline() {
  const h1 = document.querySelector('h1');
  if (!h1) return '';

  // Look for text right after h1
  const nextEl = h1.nextElementSibling;
  if (nextEl && ['P', 'H2', 'DIV', 'SPAN'].includes(nextEl.tagName)) {
    const text = nextEl.textContent.trim();
    if (text.length > 10 && text.length < 300) return text;
  }

  return '';
}

function findTestimonials() {
  const selectors = [
    '[class*="testimonial"]',
    '[class*="review"]',
    '[class*="quote"]',
    'blockquote'
  ];

  return Array.from(document.querySelectorAll(selectors.join(', ')))
    .map(el => ({
      text: el.textContent.trim().substring(0, 300),
      hasImage: !!el.querySelector('img')
    }))
    .slice(0, 5);
}

function findClientLogos() {
  const selectors = [
    '[class*="logo"]',
    '[class*="client"]',
    '[class*="partner"]',
    '[class*="trusted"]',
    '[class*="company"]'
  ];

  const containers = document.querySelectorAll(selectors.join(', '));
  let logos = [];

  containers.forEach(container => {
    const imgs = container.querySelectorAll('img');
    imgs.forEach(img => {
      if (img.alt && img.width > 30 && img.width < 300) {
        logos.push({ alt: img.alt, src: img.src });
      }
    });
  });

  return logos.slice(0, 10);
}

function findStats() {
  const statPatterns = [
    /\d+[%+]?\s*(customers?|users?|clients?|companies)/gi,
    /\d+[km]?\+?\s*(downloads?|installs?)/gi,
    /\$?\d+[kmb]?\+?\s*(saved|revenue|growth)/gi,
    /\d+\s*(years?|countries|integrations?)/gi
  ];

  const text = document.body.textContent;
  const stats = [];

  statPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      stats.push(...matches.slice(0, 3));
    }
  });

  return [...new Set(stats)].slice(0, 10);
}

function findReviews() {
  // Look for star ratings, review scores
  const hasStars = !!document.querySelector('[class*="star"], [class*="rating"]');
  const scores = document.body.textContent.match(/\d\.\d\s*\/\s*5|\d\.\d\s*stars?/gi) || [];

  return {
    hasStarRatings: hasStars,
    scores: scores.slice(0, 3)
  };
}

function findSecurityBadges() {
  const keywords = ['ssl', 'secure', 'encrypted', 'gdpr', 'hipaa', 'soc2', 'pci'];
  const found = [];

  document.querySelectorAll('img').forEach(img => {
    const alt = (img.alt || '').toLowerCase();
    const src = (img.src || '').toLowerCase();
    keywords.forEach(kw => {
      if (alt.includes(kw) || src.includes(kw)) {
        found.push(kw.toUpperCase());
      }
    });
  });

  return [...new Set(found)];
}

function findCertifications() {
  const keywords = ['certified', 'accredited', 'verified', 'approved', 'award'];
  return keywords.filter(kw =>
    document.body.textContent.toLowerCase().includes(kw)
  );
}

function findGuarantees() {
  const keywords = [
    'money back', 'guarantee', 'refund', 'risk-free', 'no risk',
    'free trial', 'cancel anytime', 'no credit card'
  ];
  return keywords.filter(kw =>
    document.body.textContent.toLowerCase().includes(kw)
  );
}

function analyzeSections() {
  const sections = [];
  const sectionElements = document.querySelectorAll('section, [class*="section"], main > div');

  sectionElements.forEach((section, index) => {
    if (index > 10) return;

    const heading = section.querySelector('h1, h2, h3');
    sections.push({
      index,
      heading: heading?.textContent.trim() || '',
      hasForm: !!section.querySelector('form'),
      hasCTA: !!section.querySelector('button, a[class*="btn"], a[class*="cta"]'),
      hasImage: !!section.querySelector('img'),
      hasVideo: !!section.querySelector('video, iframe')
    });
  });

  return sections;
}

function checkForText(keywords) {
  const text = document.body.textContent.toLowerCase();
  return keywords.some(kw => text.includes(kw));
}

function extractMainContent() {
  // Get main content area
  const main = document.querySelector('main') || document.querySelector('article') || document.body;

  // Remove scripts, styles, nav, footer
  const clone = main.cloneNode(true);
  clone.querySelectorAll('script, style, nav, footer, header, aside').forEach(el => el.remove());

  // Get text, clean it up
  let text = clone.textContent
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 5000);

  return text;
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSnapshot') {
    try {
      const snapshot = extractPageSnapshot();
      sendResponse(snapshot);
    } catch (error) {
      sendResponse({ error: error.message });
    }
  }
  return true;
});
