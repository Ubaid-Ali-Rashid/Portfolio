/* ==========================================================
   UBAID ALI — PORTFOLIO
   public/js/script.js
   ========================================================== */

'use strict';

/* ─── NAVBAR: scroll effect + mobile toggle ─────────────── */
(function initNavbar() {
  const navbar   = document.getElementById('navbar');
  const toggle   = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const allLinks = navLinks.querySelectorAll('a');

  function onScroll() {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toggle.addEventListener('click', function () {
    const isOpen = navLinks.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen);
    const bars = toggle.querySelectorAll('span');
    if (isOpen) {
      bars[0].style.transform = 'translateY(7px) rotate(45deg)';
      bars[1].style.opacity   = '0';
      bars[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      bars[0].style.transform = '';
      bars[1].style.opacity   = '';
      bars[2].style.transform = '';
    }
  });

  allLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      const bars = toggle.querySelectorAll('span');
      bars[0].style.transform = '';
      bars[1].style.opacity   = '';
      bars[2].style.transform = '';
    });
  });
})();


/* ─── SCROLL REVEAL ─────────────────────────────────────── */
function initReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          const siblings = entry.target.parentElement.querySelectorAll('.reveal');
          siblings.forEach(function (sib, i) {
            sib.style.transitionDelay = (i * 0.08) + 's';
          });
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  elements.forEach(function (el) { observer.observe(el); });
}


/* ─── ACTIVE NAV LINK (scroll spy) ─────────────────────── */
(function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('#navLinks a');
  if (!sections.length || !navItems.length) return;

  function updateActive() {
    let current = '';
    sections.forEach(function (section) {
      const top = section.offsetTop - 120;
      if (window.scrollY >= top) current = section.getAttribute('id');
    });
    navItems.forEach(function (link) {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateActive, { passive: true });
  updateActive();
})();


/* ─── TYPED EFFECT (hero title) ────────────────────────── */
(function initTyped() {
  const target = document.querySelector('.hero-title');
  if (!target) return;

  const roles = [
    'Computer Engineering Student — <strong>UET Lahore</strong>',
    'Web Administrator — <strong>UET Science Society</strong>',
    'Full-Stack Developer — <strong>HTML · CSS · JS</strong>',
    'Systems Programmer — <strong>C · C++ · Assembly</strong>',
  ];

  let roleIndex  = 0;
  let charIndex  = 0;
  let isDeleting = false;
  let isPaused   = false;

  function type() {
    const currentRole = roles[roleIndex];
    if (isPaused) { isPaused = false; setTimeout(type, 1800); return; }
    if (isDeleting) { charIndex--; } else { charIndex++; }

    const plain = currentRole.replace(/<[^>]+>/g, '');
    const splitAt = plain.indexOf('\u2014');
    let html;
    if (charIndex > splitAt + 1) {
      const beforeDash = plain.substring(0, splitAt + 2);
      const afterDash  = plain.substring(splitAt + 2, charIndex);
      html = beforeDash + '<strong>' + afterDash + '</strong>';
    } else {
      html = plain.substring(0, charIndex);
    }

    target.innerHTML = html;

    let speed = isDeleting ? 30 : 55;
    if (!isDeleting && charIndex === plain.length) {
      isPaused = true; isDeleting = true; speed = 1800;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      speed = 300;
    }
    setTimeout(type, speed);
  }

  setTimeout(type, 1400);
})();


/* ─── SMOOTH SCROLL ─────────────────────────────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 68;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });
})();


/* ─── PROJECT CARDS: tilt on mousemove ──────────────────── */
function initTilt() {
  document.querySelectorAll('.project-card').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      const rect    = card.getBoundingClientRect();
      const rotateX = ((e.clientY - rect.top  - rect.height / 2) / (rect.height / 2)) * -4;
      const rotateY = ((e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2)) *  4;
      card.style.transform = 'perspective(600px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-4px)';
    });
    card.addEventListener('mouseleave', function () {
      card.style.transform = '';
    });
  });
}


/* ─── YEAR: footer copyright ────────────────────────────── */
(function updateYear() {
  const yearEl = document.querySelector('.footer-copy');
  if (yearEl) {
    yearEl.innerHTML = '&copy; ' + new Date().getFullYear() + ' Ubaid Ali &mdash; Computer Engineer, UET Lahore';
  }
})();


/* ─── FETCH PROJECTS FROM API ───────────────────────────── */
async function fetchProjects() {
  const res = await fetch('/api/projects');
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}


/* ─── RENDER: index.html project cards ─────────────────── */
function renderIndexCards(projects) {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;

  grid.innerHTML = projects.map(function (p, i) {
    const num    = String(i + 1).padStart(2, '0');
    const techs  = [p.tech1, p.tech2, p.tech3]
                    .filter(Boolean)
                    .map(function (t) { return '<span>' + t + '</span>'; })
                    .join('');

    return `
      <a href="projects.html#proj-${p.order}" class="project-card reveal">
        <div class="project-number">${num}</div>
        <div class="project-title">${p.name}</div>
        <p class="project-desc">${p.description}</p>
        <div class="project-techs">${techs}</div>
      </a>
    `;
  }).join('');

  initReveal();
  initTilt();
}


/* ─── RENDER: projects.html detail articles ─────────────── */
function renderProjectsPage(projects) {
  const main = document.getElementById('projectsMain');
  if (!main) return;

  main.innerHTML = projects.map(function (p, i) {
    const num   = String(i + 1).padStart(2, '0');
    const techs = [p.tech1, p.tech2, p.tech3].filter(Boolean);

    const videoBlock = p.videoUrl
      ? `<div class="proj-video-wrap">
           <video class="proj-video" controls playsinline>
             <source src="${p.videoUrl}" type="video/mp4">
           </video>
         </div>`
      : `<div class="proj-video-wrap">
           <div class="proj-video-placeholder">
             <svg viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
               <polygon points="5 3 19 12 5 21 5 3"/>
             </svg>
             <p>Demo video coming soon</p>
             <small>A walkthrough of this project will be added here.</small>
           </div>
         </div>`;

    const divider = i > 0
      ? '<div class="proj-divider"></div>'
      : '';

    return `
      ${divider}
      <article class="proj-detail" id="proj-${p.order}">
        <div class="proj-meta">
          <div class="proj-meta-number">${num}</div>
          <div class="proj-meta-tags">
            ${techs.map(function (t) { return '<span>' + t + '</span>'; }).join('')}
          </div>
        </div>

        <div class="proj-body">
          <h2 class="proj-title">${p.name}</h2>
          <p class="proj-summary">${p.description}</p>

          ${videoBlock}

          <div class="proj-details-grid">
            <div class="proj-detail-block">
              <div class="proj-detail-label">Key Concept</div>
              <p>${p.keyConcept || '—'}</p>
            </div>
            <div class="proj-detail-block">
              <div class="proj-detail-label">What It Does</div>
              <p>${p.whatItDoes || '—'}</p>
            </div>
          </div>

          <div class="proj-links">
            <a href="#" class="proj-btn-github">
              <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
              </svg>
              View on GitHub
            </a>
            <a href="#" class="proj-btn-live">
              <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              Live Demo
            </a>
          </div>
        </div>
      </article>
    `;
  }).join('');

  // Scroll to anchor if URL has #proj-X
  if (window.location.hash) {
    setTimeout(function () {
      const target = document.querySelector(window.location.hash);
      if (target) {
        const top = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    }, 100);
  }
}


/* ─── INIT: load projects on whichever page we're on ────── */
(async function init() {
  try {
    const projects = await fetchProjects();

    if (document.getElementById('projectsGrid')) {
      renderIndexCards(projects);
    }

    if (document.getElementById('projectsMain')) {
      renderProjectsPage(projects);
    }

  } catch (err) {
    const grid = document.getElementById('projectsGrid');
    const main = document.getElementById('projectsMain');
    const msg  = '<p style="color:#8A8680;font-size:14px;">Could not load projects. Make sure the server is running.</p>';
    if (grid) grid.innerHTML = msg;
    if (main) main.innerHTML = msg;
  }
})();