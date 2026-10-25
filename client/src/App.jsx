import { useEffect, useState } from 'react';
import portfolioMarkup from './portfolio-content.html?raw';

const API_BASE = String(import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const blankConfig = {
  contactEmail: '',
  whatsappPhone: '',
  socials: { facebook: '', instagram: '', linkedin: '', github: '' },
  integrations: { gmailConfigured: false, whatsappCloudConfigured: false }
};

function cleanPhone(value = '') {
  return String(value).replace(/[^0-9]/g, '');
}

function appendEnquiryForm(config, setNotice) {
  const aside = document.querySelector('.contact-aside');
  if (!aside || document.getElementById('leadForm')) return;

  const form = document.createElement('form');
  form.id = 'leadForm';
  form.className = 'lead-form';
  form.setAttribute('aria-labelledby', 'leadFormTitle');
  form.innerHTML = `
    <div class="lead-form-heading">
      <span class="section-number">A quick brief</span>
      <h3 id="leadFormTitle">Tell me what you’re making.</h3>
      <p>Share a few details and your enquiry will be routed through the server-side contact service.</p>
    </div>
    <div class="lead-form-grid">
      <label> Your name <input name="name" autocomplete="name" maxlength="100" required placeholder="Your name" /></label>
      <label> Email address <input name="email" type="email" autocomplete="email" maxlength="254" required placeholder="you@example.com" /></label>
      <label> Phone / WhatsApp <input name="phone" type="tel" autocomplete="tel" maxlength="30" placeholder="Optional" /></label>
      <label> What do you need? <select name="projectType" required><option value="" disabled selected>Select a project</option><option>Brand & campaign</option><option>Website / digital experience</option><option>Photography / video</option><option>Hospitality marketing</option><option>AI / creative technology</option><option>Something else</option></select></label>
      <label class="lead-form-wide"> A little about the project <textarea name="message" rows="4" maxlength="4000" required placeholder="What are you trying to make, improve, or launch?"></textarea></label>
    </div>
    <div class="lead-form-actions"><button class="button button-primary" type="submit">Send enquiry <span class="button-arrow">↗</span></button><span class="lead-form-privacy">Your details are used to respond to this enquiry.</span></div>
    <p class="lead-form-status" role="status" aria-live="polite"></p>`;

  // Put the form below the contact copy and before the small placeholder note.
  const note = [...aside.querySelectorAll('p')].find((p) => (p.getAttribute('style') || '').includes('font-size:10px'));
  aside.insertBefore(form, note || null);
  if (note) note.textContent = 'Add your real contact settings in the root .env file before publishing.';

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    const status = form.querySelector('.lead-form-status');
    const originalText = button.innerHTML;
    button.disabled = true;
    button.textContent = 'Sending…';
    status.className = 'lead-form-status';
    status.textContent = 'Sending your enquiry securely…';
    try {
      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());
      const response = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'The contact service is not configured yet.');
      form.reset();
      status.classList.add('is-success');
      status.textContent = data.message || 'Thank you — your enquiry has been received.';
    } catch (error) {
      status.classList.add('is-error');
      const message = error instanceof Error ? error.message : 'Could not send your enquiry.';
      status.textContent = message + (config.whatsappPhone ? ' You can also contact me using the WhatsApp link below.' : ' Please try again after the site owner configures the contact service.');
    } finally {
      button.disabled = false;
      button.innerHTML = originalText;
    }
  });
}

function configureContactLinks(config) {
  const emailCta = document.getElementById('emailCta');
  const contactLinks = document.getElementById('contactLinks');
  if (emailCta) {
    if (config.contactEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.contactEmail)) {
      emailCta.href = `mailto:${config.contactEmail}`;
      emailCta.setAttribute('aria-label', `Email Satyaprasad Naik at ${config.contactEmail}`);
    } else {
      emailCta.href = '#leadForm';
      emailCta.addEventListener('click', (event) => {
        event.preventDefault();
        document.getElementById('leadForm')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        document.querySelector('#leadForm input[name="name"]')?.focus({ preventScroll: true });
      });
    }
  }
  if (!contactLinks) return;
  const external = [];
  const whatsapp = cleanPhone(config.whatsappPhone);
  if (whatsapp.length >= 10 && whatsapp.length <= 15) {
    const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent('Hi Satyaprasad, I would like to discuss a project.')}`;
    external.push({ label: 'WhatsApp ↗', url, className: 'social-link whatsapp-link' });
  }
  const socials = config.socials || {};
  if (socials.instagram) external.push({ label: 'Instagram ↗', url: socials.instagram, className: 'social-link' });
  if (socials.facebook) external.push({ label: 'Facebook ↗', url: socials.facebook, className: 'social-link' });
  if (socials.linkedin) external.push({ label: 'LinkedIn ↗', url: socials.linkedin, className: 'social-link' });
  if (socials.github) external.push({ label: 'GitHub ↗', url: socials.github, className: 'social-link' });
  external.forEach((item) => {
    try {
      const parsed = new URL(item.url);
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return;
      const link = document.createElement('a');
      link.className = item.className;
      link.href = parsed.href;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = item.label;
      contactLinks.appendChild(link);
    } catch { /* Ignore invalid/unconfigured social links. */ }
  });
}

function bindPortfolioInteractions() {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  const nav = $('#siteNav');
  const menuToggle = $('#menuToggle');
  if (nav && menuToggle) {
    menuToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
      menuToggle.textContent = isOpen ? '×' : '☰';
    });
    $$('#siteNav a').forEach((link) => link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open navigation');
      menuToggle.textContent = '☰';
    }));
  }

  const filterButtons = $$('.filter');
  const projects = $$('.project');
  filterButtons.forEach((button) => button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    projects.forEach((project) => {
      const categories = (project.dataset.category || '').split(' ');
      project.hidden = filter !== 'all' && !categories.includes(filter);
    });
  }));

  const projectInfo = {
    pumerai: { kicker: '01 / Hospitality · Honnavar', title: 'Hotel Pumerai', description: 'A hospitality brand with several experiences to bring together: stays, restaurants, poolside moments, bakery and events. The opportunity is to make each touchpoint feel like part of one considered guest journey.', detail: 'Before publication, confirm the personal role, approved website and campaign assets, client permission, and any verified booking or engagement outcomes. This concept uses abstract artwork until real assets are added.' },
    kamats: { kicker: '02 / Product & campaign', title: 'Kamat’s Tea', description: 'A product-storytelling direction built around a family of tea variants. Clear visual distinctions, consistent packaging cues and campaign creative can help each blend keep its own character while belonging to one range.', detail: 'Before publication, confirm deliverables, personally created assets, approved product photography and any substantiated campaign results. No performance figures are claimed here.' },
    greenpark: { kicker: '03 / Hospitality & food · Honnavar', title: 'Greenpark Riverview', description: 'A river-view restaurant with plenty of reasons to visit. The creative challenge is to turn food, setting and seasonal offers into a recognisable stream of stories.', detail: 'Confirm selected campaign dates, final designs and reels, your role, and permission to show the restaurant’s identity and materials.' },
    joynjoy: { kicker: '04 / Destination storytelling · Honnavar', title: 'Joy N Joy Waterpark', description: 'A destination-led content direction that helps visitors picture the day before they arrive. Activities, family experiences and nearby places can become useful stories rather than disconnected promotions.', detail: 'Confirm approved campaign creative, exact scope, final image/video assets and permission for public portfolio use.' },
    ani: { kicker: '05 / Digital presence', title: 'AniClicks Photography', description: 'A portfolio direction for a photography brand, with emphasis on the work itself, restrained typography and a footer that feels like part of the visual identity.', detail: 'Confirm the final approved page or site, what was designed or developed, responsive screenshots and permission to publish.' },
    hospitality: { kicker: '06 / Hospitality systems', title: 'Hospitality, made easier', description: 'A systems-minded view of the guest journey: property discovery, room information, enquiries, booking touchpoints and on-property information should feel connected rather than fragmented.', detail: 'This is a practice area, not a claim about a single shipped product. Document only specific integrations, workflows and results that have been delivered and verified.' }
  };
  const modal = $('#projectModal');
  const modalClose = $('#modalClose');
  let lastFocus = null;
  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lastFocus?.focus();
  };
  const openModal = (key) => {
    const data = projectInfo[key];
    if (!data || !modal) return;
    lastFocus = document.activeElement;
    $('#modalKicker').textContent = data.kicker;
    $('#modalTitle').textContent = data.title;
    $('#modalDescription').textContent = data.description;
    $('#modalDetail').textContent = data.detail;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    modalClose?.focus();
  };
  $$('.project-open').forEach((button) => button.addEventListener('click', () => openModal(button.dataset.project)));
  modalClose?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
  $('#modalContact')?.addEventListener('click', closeModal);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal?.classList.contains('open')) closeModal();
    if (event.key === 'Tab' && modal?.classList.contains('open')) {
      const focusables = $$('button, a[href], input, textarea, select, [tabindex]:not([tabindex="-1"])', modal).filter((el) => !el.disabled);
      if (!focusables.length) return;
      const first = focusables[0]; const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });

  const revealItems = $$('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
    revealItems.forEach((item, index) => { item.style.transitionDelay = `${Math.min(index % 4, 3) * 55}ms`; observer.observe(item); });
  } else revealItems.forEach((item) => item.classList.add('visible'));
}

export default function App() {
  const [apiOnline, setApiOnline] = useState(false);
  const [deliveryConfigured, setDeliveryConfigured] = useState(false);

  useEffect(() => {
    let active = true;
    bindPortfolioInteractions();
    const initialise = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/config`, { headers: { Accept: 'application/json' } });
        if (!response.ok) throw new Error('API not available');
        const next = await response.json();
        if (!active) return;
        const safeConfig = {
          ...blankConfig,
          ...next,
          socials: { ...blankConfig.socials, ...(next.socials || {}) },
          integrations: { ...blankConfig.integrations, ...(next.integrations || {}) }
        };
        setApiOnline(true);
        setDeliveryConfigured(Boolean(safeConfig.integrations.gmailConfigured || safeConfig.integrations.whatsappCloudConfigured));
        configureContactLinks(safeConfig);
        appendEnquiryForm(safeConfig, () => {});
      } catch {
        if (!active) return;
        configureContactLinks(blankConfig);
        appendEnquiryForm(blankConfig, () => {});
      }
    };
    initialise();
    return () => { active = false; };
  }, []);

  return (
    <>
      <div className="portfolio-host" dangerouslySetInnerHTML={{ __html: portfolioMarkup }} />
      <div className="connection-indicator" aria-label={!apiOnline ? 'Contact server offline' : deliveryConfigured ? 'Contact delivery configured' : 'Contact API online but delivery is not configured'}>
        <span className={`connection-led${apiOnline && deliveryConfigured ? ' online' : apiOnline ? ' needs-setup' : ''}`} />
        <span>{!apiOnline ? 'API offline' : deliveryConfigured ? 'Contact ready' : 'Add contact setup'}</span>
      </div>
    </>
  );
}
