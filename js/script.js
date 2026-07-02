/* ================================================
   Bibek Portfolio - interactions & microinteractions
   ================================================ */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ---------- Click spark (vanilla adaptation of react-bits ClickSpark) ---------- */
if (!prefersReducedMotion) {
  const sparkColor = '#d4a24e';
  const sparkSize = 10;
  const sparkRadius = 18;
  const sparkCount = 8;
  const sparkDuration = 420;

  const canvas = document.createElement('canvas');
  canvas.id = 'click-spark-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let sparks = [];

  const resizeSparkCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resizeSparkCanvas();
  window.addEventListener('resize', resizeSparkCanvas);

  const easeOut = (t) => t * (2 - t);

  const drawSparks = (timestamp) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    sparks = sparks.filter((spark) => {
      const elapsed = timestamp - spark.startTime;
      if (elapsed >= sparkDuration) return false;

      const eased = easeOut(elapsed / sparkDuration);
      const distance = eased * sparkRadius;
      const lineLength = sparkSize * (1 - eased);

      const x1 = spark.x + distance * Math.cos(spark.angle);
      const y1 = spark.y + distance * Math.sin(spark.angle);
      const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
      const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);

      ctx.strokeStyle = sparkColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      return true;
    });
    requestAnimationFrame(drawSparks);
  };
  requestAnimationFrame(drawSparks);

  window.addEventListener('click', (e) => {
    const now = performance.now();
    for (let i = 0; i < sparkCount; i += 1) {
      sparks.push({
        x: e.clientX,
        y: e.clientY,
        angle: (2 * Math.PI * i) / sparkCount,
        startTime: now
      });
    }
  });
}

/* ---------- Magnetic elements ---------- */
if (finePointer && !prefersReducedMotion) {
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    const strength = 14;
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - 0.5) * strength;
      const y = ((e.clientY - r.top) / r.height - 0.5) * strength;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transition = 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)';
      el.style.transform = '';
      setTimeout(() => (el.style.transition = ''), 400);
    });
  });
}

/* ---------- Subtle 3D tilt on framed media ---------- */
if (finePointer && !prefersReducedMotion) {
  document.querySelectorAll('.tilt').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const rx = ((e.clientY - r.top) / r.height - 0.5) * -4;
      const ry = ((e.clientX - r.left) / r.width - 0.5) * 4;
      el.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
}

/* ---------- Scroll reveal ---------- */
// Kick in the circular gallery module on pages that have it
const revealEls = document.querySelectorAll('[data-reveal]');
if (revealEls.length) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
  );
  revealEls.forEach((el) => io.observe(el));
}

/* ---------- Animated counters ---------- */
const counters = document.querySelectorAll('[data-count]');
if (counters.length) {
  const cio = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const duration = 1400;
        const start = performance.now();

        const tick = (now) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
          el.textContent = Math.round(target * eased);
          if (p < 1) requestAnimationFrame(tick);
        };
        prefersReducedMotion ? (el.textContent = target) : requestAnimationFrame(tick);
        cio.unobserve(el);
      });
    },
    { threshold: 0.6 }
  );
  counters.forEach((el) => cio.observe(el));
}

/* ---------- Header hide on scroll down ---------- */
const header = document.querySelector('.site-header');
let lastY = window.scrollY;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (y > lastY && y > 140) header.classList.add('hide');
  else header.classList.remove('hide');
  lastY = y;
}, { passive: true });

/* ---------- Mobile navigation ---------- */
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

/* ---------- Portfolio filtering (animated) ---------- */
const filterButtons = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.g-item');

filterButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;

    galleryItems.forEach((item) => {
      const match = filter === 'all' || item.dataset.category === filter;
      if (match) {
        item.classList.remove('hidden');
        requestAnimationFrame(() => item.classList.remove('is-hiding'));
      } else {
        item.classList.add('is-hiding');
        setTimeout(() => item.classList.add('hidden'), 260);
      }
    });
  });
});

/* ---------- Lightbox ---------- */
const lightbox = document.getElementById('lightbox');
if (lightbox) {
  const lbImg = document.getElementById('lightbox-img');
  const lbCaption = document.getElementById('lightbox-caption');
  const lbClose = lightbox.querySelector('.lightbox-close');

  galleryItems.forEach((item) => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      const title = item.querySelector('h3');
      const meta = item.querySelector('figcaption p');
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lbCaption.textContent = `${title ? title.textContent : ''}${meta ? ' - ' + meta.textContent : ''}`;
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  });

  const closeLightbox = () => {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  lbClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
  });
}

/* ---------- Contact form ---------- */
const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

if (contactForm && formStatus) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = contactForm.name.value.trim();
    const email = contactForm.email.value.trim();
    const message = contactForm.message.value.trim();

    if (!name || !email || !message) {
      formStatus.textContent = 'Please fill in your name, email, and message.';
      return;
    }

    formStatus.textContent = `Thanks, ${name}! Your message has been noted. I'll get back to you soon.`;
    contactForm.reset();
  });
}
