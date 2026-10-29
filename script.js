/**
 * SIMRAN KAPOOR — PORTFOLIO JAVASCRIPT (shared by all pages)
 * 0. Hamburger menu
 * 1. Theme toggle (dark / light) with localStorage
 * 2. Scroll reveal animations
 * 3. Dark container scroll scaling
 * 4. Typewriter effect
 * 5. Wavy skills marquee
 * 6. Ambient gradient orbs canvas
 * 7. Projects canvas particles + arrow navigation
 * 8. Image lightbox
 * 9. Project-page timeline step highlighting
 * 10. Demos: Shopify customizer, ECG monitor, EziLang flashcards
 */

document.addEventListener('DOMContentLoaded', () => {

  /* =========================================================================
     0. Hamburger Menu Toggle
     ========================================================================= */
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('open');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* =========================================================================
     1. Theme Toggle (dark default)
     ========================================================================= */
  const themeToggle = document.getElementById('themeToggle');
  const sunIcon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>';
  const moonIcon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

  function applyTheme(theme) {
    const active = theme === 'light' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', active);
    try { localStorage.setItem('simran_theme', active); } catch (e) { /* storage unavailable */ }
    if (themeToggle) {
      themeToggle.innerHTML = active === 'dark' ? sunIcon : moonIcon;
      themeToggle.setAttribute('aria-label', active === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
    document.dispatchEvent(new CustomEvent('themechange'));
  }

  applyTheme(document.documentElement.getAttribute('data-theme'));

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  /* =========================================================================
     2. Scroll Reveal Animations
     ========================================================================= */
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.animate-up').forEach(el => revealObserver.observe(el));

  /* =========================================================================
     3. Dark Container Scroll Scaling
     ========================================================================= */
  const darkContainer = document.querySelector('.dark-container');
  if (darkContainer) {
    let ticking = false;
    const updateDarkContainer = () => {
      const rect = darkContainer.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      let progress = (windowHeight - rect.top) / (windowHeight * 0.7);
      progress = Math.max(0, Math.min(1, progress));

      const scale = 0.7 + (0.35 * progress);
      const opacity = 0.3 + (0.7 * progress);

      darkContainer.style.transform = `scale(${scale})`;
      darkContainer.style.opacity = opacity;

      if (progress > 0.5) {
        darkContainer.style.boxShadow = '0 0 0 1px rgba(255,255,255,0.1), 0 40px 80px rgba(0,0,0,0.2), 0 0 120px rgba(16, 185, 129, 0.15)';
      } else {
        darkContainer.style.boxShadow = '0 0 0 1px rgba(255,255,255,0.06), 0 30px 60px rgba(0,0,0,0.1), 0 0 100px rgba(16, 185, 129, 0.1)';
      }
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateDarkContainer);
        ticking = true;
      }
    }, { passive: true });

    updateDarkContainer();
  }

  /* =========================================================================
     4. Typewriter Effect
     ========================================================================= */
  const typewriterElements = document.querySelectorAll('.typewriter');

  typewriterElements.forEach(el => {
    const textNode = Array.from(el.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
    if (!textNode) return;

    const fullText = textNode.textContent.trim();
    textNode.textContent = '';
    el.dataset.fullText = fullText;
  });

  const typewriterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const textToType = el.dataset.fullText;
        if (!textToType) return;

        const cursor = el.querySelector('.gradient-cursor');
        if (cursor) cursor.classList.add('active');

        let textNode = Array.from(el.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
        if (!textNode) {
          textNode = document.createTextNode('');
          el.insertBefore(textNode, el.firstChild);
        }

        let i = 0;
        function typeChar() {
          if (i < textToType.length) {
            textNode.textContent += textToType.charAt(i);
            i++;
            setTimeout(typeChar, 30 + Math.random() * 30);
          }
        }

        typeChar();
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  typewriterElements.forEach(el => typewriterObserver.observe(el));

  /* =========================================================================
     5. Wavy Skills Marquee
     ========================================================================= */
  const marqueeTrack = document.getElementById('marqueeTrack');
  const SKILLS_DATA = [
    { class: 'devicon-python-plain colored', url: 'https://www.python.org/', name: 'Python' },
    { class: 'devicon-cplusplus-plain colored', url: 'https://isocpp.org/', name: 'C++' },
    { class: 'devicon-javascript-plain colored', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', name: 'JavaScript' },
    { class: 'devicon-java-plain colored', url: 'https://www.java.com/', name: 'Java' },
    { class: 'devicon-react-original colored', url: 'https://react.dev/', name: 'React' },
    { class: 'devicon-nodejs-plain colored', url: 'https://nodejs.org/', name: 'Node.js' },
    { class: 'devicon-express-original', url: 'https://expressjs.com/', name: 'Express.js' },
    { class: 'devicon-django-plain colored', url: 'https://www.djangoproject.com/', name: 'Django' },
    { class: 'devicon-fastapi-plain colored', url: 'https://fastapi.tiangolo.com/', name: 'FastAPI' },
    { class: 'devicon-html5-plain colored', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML', name: 'HTML5' },
    { class: 'devicon-css3-plain colored', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS', name: 'CSS3' },
    { class: 'devicon-mongodb-plain colored', url: 'https://www.mongodb.com/', name: 'MongoDB' },
    { class: 'devicon-microsoftsqlserver-plain colored', url: 'https://www.microsoft.com/sql-server', name: 'SQL Server' },
    { class: 'devicon-mysql-plain colored', url: 'https://www.mysql.com/', name: 'MySQL' },
    { class: 'devicon-azure-plain colored', url: 'https://azure.microsoft.com/', name: 'Azure' },
    { class: 'devicon-docker-plain colored', url: 'https://www.docker.com/', name: 'Docker' },
    { class: 'devicon-git-plain colored', url: 'https://git-scm.com/', name: 'Git' },
    { class: 'devicon-github-original colored', url: 'https://github.com/', name: 'GitHub' },
    { class: 'devicon-postman-plain colored', url: 'https://www.postman.com/', name: 'Postman' },
    { class: 'devicon-jupyter-plain colored', url: 'https://jupyter.org/', name: 'Jupyter' },
    { class: 'devicon-vscode-plain colored', url: 'https://code.visualstudio.com/', name: 'VS Code' },
    { class: 'devicon-figma-plain colored', url: 'https://www.figma.com/', name: 'Figma' },
    { class: 'devicon-arduino-plain colored', url: 'https://www.arduino.cc/', name: 'Arduino' },
    { class: 'devicon-firebase-plain colored', url: 'https://firebase.google.com/', name: 'Firebase' }
  ];

  if (marqueeTrack) {
    const FULL_SKILLS = [...SKILLS_DATA, ...SKILLS_DATA];

    FULL_SKILLS.forEach(skill => {
      const icon = document.createElement('a');
      icon.className = 'marquee-icon';
      icon.href = skill.url;
      icon.target = '_blank';
      icon.rel = 'noopener noreferrer';
      icon.innerHTML = `<i class="${skill.class}"></i>`;
      icon.title = skill.name;
      icon.setAttribute('aria-label', skill.name);
      marqueeTrack.appendChild(icon);
    });

    const icons = document.querySelectorAll('.marquee-icon');

    function animateMarquee(time) {
      icons.forEach((icon, index) => {
        const y = Math.sin(time * 0.0012 + index * 0.5) * 35;
        icon.style.transform = `translateY(${y}px)`;
      });
      requestAnimationFrame(animateMarquee);
    }
    requestAnimationFrame(animateMarquee);
  }

  /* =========================================================================
     6. Ambient Gradient Orbs Canvas
     ========================================================================= */
  const mainCanvas = document.getElementById('particleCanvas');
  let targetMouseX = 0, targetMouseY = 0;
  let currentMouseX = 0, currentMouseY = 0;

  window.addEventListener('mousemove', (e) => {
    targetMouseX = (e.clientX - window.innerWidth / 2) * 0.15;
    targetMouseY = (e.clientY - window.innerHeight / 2) * 0.15;
  });

  if (mainCanvas) {
    const ctx = mainCanvas.getContext('2d');
    let width, height;

    function resizeMain() {
      width = mainCanvas.width = window.innerWidth;
      height = mainCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeMain);
    resizeMain();

    mainCanvas.style.filter = 'blur(100px)';
    mainCanvas.style.transform = 'scale(1.2)';

    const setOrbOpacity = () => {
      const styles = getComputedStyle(document.documentElement);
      mainCanvas.style.opacity = styles.getPropertyValue('--orb-opacity').trim() || '0.15';
    };
    setOrbOpacity();
    document.addEventListener('themechange', setOrbOpacity);

    const orbs = [
      { x: width * 0.2, y: height * 0.3, vx: 0.5, vy: 0.3, size: 400, color: '#10b981' },
      { x: width * 0.8, y: height * 0.7, vx: -0.4, vy: 0.5, size: 500, color: '#2563eb' },
      { x: width * 0.5, y: height * 0.5, vx: 0.6, vy: -0.4, size: 350, color: '#34d399' },
      { x: width * 0.2, y: height * 0.8, vx: 0.3, vy: -0.6, size: 450, color: '#7c3aed' }
    ];

    function drawMainCanvas() {
      ctx.clearRect(0, 0, width, height);
      currentMouseX += (targetMouseX - currentMouseX) * 0.05;
      currentMouseY += (targetMouseY - currentMouseY) * 0.05;

      for (let i = 0; i < orbs.length; i++) {
        const orb = orbs[i];

        orb.x += orb.vx;
        orb.y += orb.vy;

        if (orb.x < -orb.size || orb.x > width + orb.size) orb.vx *= -1;
        if (orb.y < -orb.size || orb.y > height + orb.size) orb.vy *= -1;

        const drawX = orb.x - currentMouseX * (i * 0.5 + 1);
        const drawY = orb.y - currentMouseY * (i * 0.5 + 1);

        ctx.fillStyle = orb.color;
        ctx.beginPath();
        ctx.arc(drawX, drawY, orb.size, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(drawMainCanvas);
    }
    drawMainCanvas();
  }

  /* =========================================================================
     7. Projects Canvas Particles + Arrow Navigation
     ========================================================================= */
  const pCanvas = document.getElementById('projectsCanvas');
  const scrollContainer = document.querySelector('.projects-scroll-container');

  if (pCanvas && scrollContainer) {
    const pCtx = pCanvas.getContext('2d');
    let cw, ch;
    let particles = [];

    let pTargetX = 0, pTargetY = 0;
    let pCurrentX = 0, pCurrentY = 0;

    const section = pCanvas.parentElement;
    section.addEventListener('mousemove', (e) => {
      const rect = section.getBoundingClientRect();
      pTargetX = ((e.clientX - rect.left) / section.offsetWidth - 0.5) * 2;
      pTargetY = ((e.clientY - rect.top) / section.offsetHeight - 0.5) * 2;
    });
    section.addEventListener('mouseleave', () => {
      pTargetX = 0;
      pTargetY = 0;
    });

    function initProjectsCanvas() {
      cw = window.innerWidth;
      ch = scrollContainer.offsetHeight;
      pCanvas.width = cw;
      pCanvas.height = ch;

      const virtualWidth = scrollContainer.scrollWidth || cw * 5;

      particles = [];
      for (let i = 0; i < 250; i++) {
        particles.push({
          x: Math.random() * virtualWidth,
          y: Math.random() * ch,
          speed: Math.random() * 0.015 + 0.005,
          size: Math.random() * 2 + 1,
          baseY: Math.random() * ch,
          wobbleSpeed: Math.random() * 0.0005 + 0.0001,
          wobbleDistance: Math.random() * 80 + 20,
          parallaxDepth: Math.random() * 40 + 10
        });
      }
    }

    window.addEventListener('resize', () => {
      clearTimeout(window.pResizeTimer);
      window.pResizeTimer = setTimeout(initProjectsCanvas, 200);
    });

    initProjectsCanvas();
    setTimeout(initProjectsCanvas, 500);

    function lerpColor(a, b, amount) {
      const ah = parseInt(a.replace(/#/g, ''), 16),
        ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
        bh = parseInt(b.replace(/#/g, ''), 16),
        br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
        rr = ar + amount * (br - ar),
        rg = ag + amount * (bg - ag),
        rb = ab + amount * (bb - ab);
      return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
    }

    const hexToRgba = (hex, alpha) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    function drawProjects() {
      pCtx.clearRect(0, 0, cw, ch);

      pCurrentX += (pTargetX - pCurrentX) * 0.05;
      pCurrentY += (pTargetY - pCurrentY) * 0.05;

      const virtualWidth = scrollContainer.scrollWidth || cw * 5;
      const scrollOffset = scrollContainer.scrollLeft;

      pCtx.globalAlpha = 0.5;

      for (let p of particles) {
        p.x += p.speed;
        if (p.x > virtualWidth + 50) {
          p.x = -50;
          p.baseY = Math.random() * ch;
        }

        p.y = p.baseY + Math.sin(Date.now() * p.wobbleSpeed + p.x) * p.wobbleDistance;

        const parallaxX = pCurrentX * p.parallaxDepth;
        const parallaxY = pCurrentY * p.parallaxDepth;

        const screenX = (p.x - scrollOffset) - parallaxX;
        const screenY = p.y - parallaxY;

        if (screenX > -20 && screenX < cw + 20 && screenY > -20 && screenY < ch + 20) {
          const progress = p.x / virtualWidth;
          let color;

          if (progress < 0.25) color = lerpColor('#10b981', '#2563eb', progress / 0.25);
          else if (progress < 0.5) color = lerpColor('#2563eb', '#7c3aed', (progress - 0.25) / 0.25);
          else if (progress < 0.75) color = lerpColor('#7c3aed', '#34d399', (progress - 0.5) / 0.25);
          else color = lerpColor('#34d399', '#10b981', (progress - 0.75) / 0.25);

          const grad = pCtx.createRadialGradient(screenX, screenY, 0, screenX, screenY, p.size * 2);
          grad.addColorStop(0, hexToRgba(color, 1));
          grad.addColorStop(1, hexToRgba(color, 0));

          pCtx.beginPath();
          pCtx.arc(screenX, screenY, p.size * 2, 0, Math.PI * 2);
          pCtx.fillStyle = grad;
          pCtx.fill();
        }
      }
      requestAnimationFrame(drawProjects);
    }
    drawProjects();
  }

  // Projects arrow navigation
  const projPrevBtn = document.getElementById('projPrevBtn');
  const projNextBtn = document.getElementById('projNextBtn');

  if (projPrevBtn && projNextBtn && scrollContainer) {
    const cardStep = () => {
      const card = scrollContainer.querySelector('.project-card');
      return card ? card.offsetWidth + 32 : 600;
    };
    projPrevBtn.addEventListener('click', () => scrollContainer.scrollBy({ left: -cardStep(), behavior: 'smooth' }));
    projNextBtn.addEventListener('click', () => scrollContainer.scrollBy({ left: cardStep(), behavior: 'smooth' }));
  }

  /* =========================================================================
     8. Image Lightbox
     ========================================================================= */
  const imageModal = document.getElementById('imageModal');
  const modalImage = document.getElementById('modalImage');
  const closeImageModalBtn = document.querySelector('.close-modal');
  const zoomImages = document.querySelectorAll('.cp-img-wrapper img');

  if (imageModal && modalImage) {
    zoomImages.forEach(img => {
      img.parentElement.addEventListener('click', function () {
        imageModal.style.display = 'flex';
        setTimeout(() => imageModal.classList.add('show'), 10);
        modalImage.src = img.src;
        modalImage.alt = img.alt || 'Zoomed view';
        document.body.style.overflow = 'hidden';
      });
    });

    const closeImageModal = () => {
      imageModal.classList.remove('show');
      setTimeout(() => {
        imageModal.style.display = 'none';
        document.body.style.overflow = '';
      }, 300);
    };

    if (closeImageModalBtn) closeImageModalBtn.addEventListener('click', closeImageModal);

    imageModal.addEventListener('click', (e) => {
      if (e.target !== modalImage) closeImageModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && imageModal.style.display === 'flex') closeImageModal();
    });
  }

  /* =========================================================================
     9. Timeline Step Highlighting (project pages)
     ========================================================================= */
  const stepNumbers = document.querySelectorAll('.cp-step-number');

  if (stepNumbers.length > 0) {
    const updateTimelineScroll = () => {
      const triggerPoint = window.innerHeight * 0.45;

      let activeIndex = -1;
      let minDistance = Infinity;

      stepNumbers.forEach((num, index) => {
        const stepCard = num.closest('.cp-step');
        if (!stepCard) return;
        const rect = stepCard.getBoundingClientRect();
        if (rect.top <= triggerPoint && rect.bottom >= triggerPoint) {
          activeIndex = index;
        } else {
          const distance = Math.abs((rect.top + rect.height / 2) - triggerPoint);
          if (activeIndex === -1 && distance < minDistance) {
            minDistance = distance;
            activeIndex = index;
          }
        }
      });

      stepNumbers.forEach((num, index) => {
        num.classList.toggle('active', index === activeIndex);
      });
    };

    window.addEventListener('scroll', () => {
      requestAnimationFrame(updateTimelineScroll);
    }, { passive: true });

    updateTimelineScroll();
  }

  /* =========================================================================
     10a. Toast (used by demos)
     ========================================================================= */
  const toastNotification = document.getElementById('toastNotification');
  const toastMessage = document.getElementById('toastMessage');
  let toastTimer = null;

  function showToast(message) {
    if (!toastNotification || !toastMessage) return;
    toastMessage.textContent = message;
    toastNotification.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastNotification.classList.remove('show'), 2800);
  }

  /* =========================================================================
     10b. Shopify Section Customizer (shopify.html)
     ========================================================================= */
  const shopHeading = document.getElementById('shopHeading');
  const shopSubtitle = document.getElementById('shopSubtitle');
  const shopBtnText = document.getElementById('shopBtnText');
  const shopBadge = document.getElementById('shopBadge');
  const shopThemeColor = document.getElementById('shopThemeColor');
  const colorValHex = document.getElementById('colorValHex');
  const shopLayoutAlign = document.getElementById('shopLayoutAlign');
  const shopShowPrice = document.getElementById('shopShowPrice');

  const liveShopifySection = document.getElementById('liveShopifySection');
  const renderHeading = document.getElementById('renderHeading');
  const renderSubtitle = document.getElementById('renderSubtitle');
  const renderBtnLabel = document.getElementById('renderBtnLabel');
  const renderBtn = document.getElementById('renderBtn');
  const renderBadge = document.getElementById('renderBadge');
  const renderPrice = document.getElementById('renderPrice');

  function hexToRgbaColor(hex, alpha = 1) {
    let c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
      c = hex.substring(1).split('');
      if (c.length === 3) {
        c = [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      c = '0x' + c.join('');
      return `rgba(${[(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',')},${alpha})`;
    }
    return hex;
  }

  function updateShopifyPreview() {
    if (!liveShopifySection) return;

    if (renderHeading && shopHeading) renderHeading.textContent = shopHeading.value || 'Curated Drops';
    if (renderSubtitle && shopSubtitle) renderSubtitle.textContent = shopSubtitle.value || '';
    if (renderBtnLabel && shopBtnText) renderBtnLabel.textContent = shopBtnText.value || 'Shop Now';
    if (renderBadge && shopBadge) renderBadge.textContent = shopBadge.value || 'FEATURED';

    if (shopThemeColor) {
      const selectedColor = shopThemeColor.value;
      if (colorValHex) colorValHex.textContent = selectedColor;
      if (renderBtn) renderBtn.style.backgroundColor = selectedColor;
      if (renderBadge) {
        renderBadge.style.color = selectedColor;
        renderBadge.style.backgroundColor = hexToRgbaColor(selectedColor, 0.12);
      }
      if (renderPrice) renderPrice.style.color = selectedColor;
    }

    if (shopLayoutAlign) {
      liveShopifySection.classList.remove('align-center', 'align-left', 'align-right');
      liveShopifySection.classList.add(`align-${shopLayoutAlign.value}`);
    }

    if (shopShowPrice && renderPrice) {
      renderPrice.style.display = shopShowPrice.checked ? 'inline-block' : 'none';
    }
  }

  [shopHeading, shopSubtitle, shopBtnText, shopBadge, shopThemeColor, shopLayoutAlign, shopShowPrice].forEach(input => {
    if (input) {
      input.addEventListener('input', updateShopifyPreview);
      input.addEventListener('change', updateShopifyPreview);
    }
  });

  updateShopifyPreview();

  /* =========================================================================
     10c. Real-Time ECG Monitor (iot.html)
     ========================================================================= */
  const ecgCanvas = document.getElementById('ecgCanvas');
  const liveBpmDisplay = document.getElementById('liveBpmDisplay');
  const liveSpo2Display = document.getElementById('liveSpo2Display');
  const bpmSlider = document.getElementById('bpmSlider');
  const bpmSliderVal = document.getElementById('bpmSliderVal');
  const togglePulseStateBtn = document.getElementById('togglePulseState');

  let ecgCtx = null;
  let ecgAnimationId = null;
  let isEcgPaused = false;
  let currentBpm = 78;
  let ecgDataPoints = [];
  let ecgTime = 0;

  function initEcgCanvas() {
    if (!ecgCanvas) return;
    ecgCtx = ecgCanvas.getContext('2d');

    const dpr = window.devicePixelRatio || 1;
    const rect = ecgCanvas.getBoundingClientRect();
    const targetWidth = rect.width || 700;
    const targetHeight = 180;

    ecgCanvas.width = targetWidth * dpr;
    ecgCanvas.height = targetHeight * dpr;
    ecgCtx.scale(dpr, dpr);

    if (!ecgAnimationId) {
      renderEcg();
    }
  }

  if (bpmSlider) {
    bpmSlider.addEventListener('input', (e) => {
      currentBpm = parseInt(e.target.value, 10);
      if (bpmSliderVal) bpmSliderVal.textContent = `${currentBpm} BPM`;
      if (liveBpmDisplay) liveBpmDisplay.textContent = currentBpm;

      if (liveSpo2Display) {
        const spo2 = currentBpm > 115 ? 96 : (currentBpm < 60 ? 99 : 98);
        liveSpo2Display.textContent = spo2;
      }
    });
  }

  if (togglePulseStateBtn) {
    togglePulseStateBtn.addEventListener('click', () => {
      isEcgPaused = !isEcgPaused;
      const text = togglePulseStateBtn.querySelector('span');
      if (text) text.textContent = isEcgPaused ? 'Resume stream' : 'Pause stream';
    });
  }

  // Realistic P-Q-R-S-T waveform
  function getEcgY(t, bpm) {
    const period = 60 / bpm;
    const phase = (t % period) / period;

    let y = 0;

    if (phase >= 0.12 && phase <= 0.20) {
      const p = (phase - 0.12) / 0.08;
      y = Math.sin(p * Math.PI) * 12;
    } else if (phase > 0.20 && phase <= 0.24) {
      const q = (phase - 0.20) / 0.04;
      y = -Math.sin(q * Math.PI) * 10;
    } else if (phase > 0.24 && phase <= 0.30) {
      const r = (phase - 0.24) / 0.06;
      y = Math.sin(r * Math.PI) * 70;
    } else if (phase > 0.30 && phase <= 0.34) {
      const s = (phase - 0.30) / 0.04;
      y = -Math.sin(s * Math.PI) * 22;
    } else if (phase >= 0.44 && phase <= 0.58) {
      const tw = (phase - 0.44) / 0.14;
      y = Math.sin(tw * Math.PI) * 18;
    }

    y += (Math.random() - 0.5) * 1.5;
    return y;
  }

  function renderEcg() {
    if (!ecgCtx || !ecgCanvas) return;

    const width = ecgCanvas.clientWidth || 700;
    const height = 180;
    const midY = height / 2;

    if (!isEcgPaused) {
      ecgTime += 0.016;
      const waveY = midY - getEcgY(ecgTime, currentBpm);
      ecgDataPoints.push(waveY);

      if (ecgDataPoints.length > width) {
        ecgDataPoints.shift();
      }
    }

    ecgCtx.fillStyle = '#090a0f';
    ecgCtx.fillRect(0, 0, width, height);

    if (ecgDataPoints.length > 1) {
      ecgCtx.beginPath();
      ecgCtx.strokeStyle = '#10b981';
      ecgCtx.lineWidth = 2.5;
      ecgCtx.shadowColor = '#10b981';
      ecgCtx.shadowBlur = 10;
      ecgCtx.lineJoin = 'round';
      ecgCtx.lineCap = 'round';

      for (let x = 0; x < ecgDataPoints.length; x++) {
        const y = ecgDataPoints[x];
        if (x === 0) {
          ecgCtx.moveTo(x, y);
        } else {
          ecgCtx.lineTo(x, y);
        }
      }
      ecgCtx.stroke();

      const lastX = ecgDataPoints.length - 1;
      const lastY = ecgDataPoints[lastX];
      ecgCtx.beginPath();
      ecgCtx.fillStyle = '#34d399';
      ecgCtx.shadowColor = '#34d399';
      ecgCtx.shadowBlur = 14;
      ecgCtx.arc(lastX, lastY, 4, 0, Math.PI * 2);
      ecgCtx.fill();
    }

    ecgAnimationId = requestAnimationFrame(renderEcg);
  }

  if (ecgCanvas) {
    const ecgObserver = new IntersectionObserver((entries) => {
      if (entries.some(entry => entry.isIntersecting)) {
        ecgObserver.disconnect();
        initEcgCanvas();
      }
    }, { threshold: 0.1 });
    ecgObserver.observe(ecgCanvas);
  }

  /* =========================================================================
     10d. EziLang Flashcards (ezilang.html)
     ========================================================================= */
  const flashcardElement = document.getElementById('flashcardElement');
  const fcSpanishWord = document.getElementById('fcSpanishWord');
  const fcPhonetic = document.getElementById('fcPhonetic');
  const fcEnglishWord = document.getElementById('fcEnglishWord');
  const fcSentence = document.getElementById('fcSentence');
  const currentCardIdx = document.getElementById('currentCardIdx');
  const prevCardBtn = document.getElementById('prevCardBtn');
  const nextCardBtn = document.getElementById('nextCardBtn');
  const audioSpeakBtn = document.getElementById('audioSpeakBtn');

  const flashcardData = [
    {
      spanish: 'manzana',
      phonetic: '[manˈθana]',
      english: 'Apple',
      sentence: '"Me gusta comer una manzana roja." (I like to eat a red apple.)'
    },
    {
      spanish: 'escuchar',
      phonetic: '[eskuˈtʃar]',
      english: 'To listen',
      sentence: '"Siempre es bueno escuchar con atención." (It is always good to listen carefully.)'
    },
    {
      spanish: 'viaje',
      phonetic: '[ˈbja.xe]',
      english: 'Journey / Trip',
      sentence: '"El viaje en tren por las montañas fue inolvidable." (The train trip was unforgettable.)'
    },
    {
      spanish: 'desarrollar',
      phonetic: '[desaroˈʎar]',
      english: 'To develop / build',
      sentence: '"Ella quiere desarrollar aplicaciones web modernas." (She wants to build modern web apps.)'
    }
  ];

  let currentCard = 0;

  if (flashcardElement) {
    flashcardElement.addEventListener('click', () => {
      flashcardElement.classList.toggle('is-flipped');
    });
    flashcardElement.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        flashcardElement.classList.toggle('is-flipped');
      }
    });
  }

  function displayCard(index) {
    if (flashcardElement) flashcardElement.classList.remove('is-flipped');
    setTimeout(() => {
      const item = flashcardData[index];
      if (fcSpanishWord) fcSpanishWord.textContent = item.spanish;
      if (fcPhonetic) fcPhonetic.textContent = item.phonetic;
      if (fcEnglishWord) fcEnglishWord.textContent = item.english;
      if (fcSentence) fcSentence.textContent = item.sentence;
      if (currentCardIdx) currentCardIdx.textContent = (index + 1);
    }, 180);
  }

  if (prevCardBtn) {
    prevCardBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      currentCard = (currentCard - 1 + flashcardData.length) % flashcardData.length;
      displayCard(currentCard);
    });
  }

  if (nextCardBtn) {
    nextCardBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      currentCard = (currentCard + 1) % flashcardData.length;
      displayCard(currentCard);
    });
  }

  if (audioSpeakBtn) {
    audioSpeakBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const word = flashcardData[currentCard].spanish;
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'es-ES';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
        showToast(`Pronouncing "${word}"...`);
      } else {
        showToast('Speech synthesis is not supported in this browser.');
      }
    });
  }

});
