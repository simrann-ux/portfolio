/**
 * SIMRAN KAPOOR — PORTFOLIO JAVASCRIPT
 * Interactive Systems:
 * 0. Hero reveal
 * 1. Header: scroll state, active-section indicator, mobile menu
 * 2. Theme Toggle (Dark / Light) with LocalStorage
 * 3. Work index cursor-following preview
 * 4. Lab horizontal track & deep links into demos
 * 5. Shopify Section Customizer Simulator (Live Reactive Preview)
 * 6. IoT Biometric Telemetry & Real-Time ECG Waveform Canvas
 * 7. EziLang Interactive Flashcard Deck with Web Speech Synthesis
 * 8. Project Case Study Modal Data & Interactive Dialogs
 * 9. Clipboard Copy & Toast Feedback
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================
     0. HERO REVEAL (single orchestrated load moment)
     ========================================================== */
  requestAnimationFrame(() => document.body.classList.add('is-loaded'));

  /* ==========================================================
     1. HEADER
     ========================================================== */
  const siteHeader = document.getElementById('siteHeader');
  const navIndicator = document.getElementById('navIndicator');
  const navLinks = document.querySelectorAll('.nav-link');

  const updateHeaderState = () => {
    if (siteHeader) siteHeader.classList.toggle('is-scrolled', window.scrollY > 24);
  };
  window.addEventListener('scroll', updateHeaderState, { passive: true });
  updateHeaderState();

  function moveIndicatorTo(link) {
    if (!navIndicator) return;
    if (!link) {
      navIndicator.style.opacity = '0';
      return;
    }
    navIndicator.style.width = `${link.offsetWidth}px`;
    navIndicator.style.transform = `translateX(${link.offsetLeft}px)`;
    navIndicator.style.opacity = '1';
  }

  function setActiveLink(id) {
    let activeLink = null;
    navLinks.forEach(link => {
      const isMatch = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('is-active', isMatch);
      if (isMatch) activeLink = link;
    });
    moveIndicatorTo(activeLink);
  }

  // Highlight whichever section crosses the upper third of the viewport
  const trackedSections = ['work', 'experience', 'lab', 'about', 'contact']
    .map(id => document.getElementById(id))
    .filter(Boolean);

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) setActiveLink(entry.target.id);
    });
  }, { rootMargin: '-35% 0px -60% 0px' });

  trackedSections.forEach(section => sectionObserver.observe(section));

  window.addEventListener('scroll', () => {
    if (window.scrollY < window.innerHeight * 0.5) setActiveLink(null);
  }, { passive: true });

  window.addEventListener('resize', () => {
    moveIndicatorTo(document.querySelector('.nav-link.is-active'));
  });

  // Mobile menu
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  function setMenuOpen(isOpen) {
    if (!mobileMenu || !menuToggle) return;
    mobileMenu.classList.toggle('is-open', isOpen);
    mobileMenu.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    const icon = menuToggle.querySelector('i');
    if (icon) icon.className = isOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      setMenuOpen(!mobileMenu.classList.contains('is-open'));
    });
  }

  if (mobileMenu) {
    mobileMenu.querySelectorAll('a, button').forEach(el => {
      el.addEventListener('click', () => setMenuOpen(false));
    });
  }

  /* ==========================================================
     2. THEME TOGGLE (Dark / Light)
     ========================================================== */
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeIcon = themeToggleBtn ? themeToggleBtn.querySelector('i') : null;

  function applyTheme(theme) {
    const activeTheme = theme === 'light' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', activeTheme);
    try { localStorage.setItem('simran_theme', activeTheme); } catch (e) { /* storage unavailable */ }
    if (themeIcon) themeIcon.className = activeTheme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    if (themeToggleBtn) {
      themeToggleBtn.setAttribute('aria-label', activeTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }

  applyTheme(document.documentElement.getAttribute('data-theme'));

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  /* ==========================================================
     3. WORK INDEX — CURSOR-FOLLOWING PREVIEW
     ========================================================== */
  const workList = document.getElementById('workList');
  const workPreview = document.getElementById('workPreview');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (workList && workPreview && finePointer) {
    const previews = workPreview.querySelectorAll('.pv');
    let pointerX = 0;
    let pointerY = 0;
    let currentX = 0;
    let currentY = 0;
    let followId = null;

    const follow = () => {
      currentX += (pointerX - currentX) * 0.16;
      currentY += (pointerY - currentY) * 0.16;
      workPreview.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      followId = requestAnimationFrame(follow);
    };

    workList.querySelectorAll('.work-row').forEach(row => {
      row.addEventListener('mouseenter', (e) => {
        previews.forEach(pv => pv.classList.toggle('is-active', pv.dataset.key === row.dataset.preview));
        if (!workPreview.classList.contains('is-visible')) {
          currentX = pointerX = e.clientX;
          currentY = pointerY = e.clientY;
        }
        workPreview.classList.add('is-visible');
        if (!followId) follow();
      });
      row.addEventListener('mousemove', (e) => {
        pointerX = e.clientX;
        pointerY = e.clientY;
      });
    });

    workList.addEventListener('mouseleave', () => {
      workPreview.classList.remove('is-visible');
      cancelAnimationFrame(followId);
      followId = null;
    });
  }

  /* ==========================================================
     4. LAB — HORIZONTAL TRACK
     ========================================================== */
  const labTrack = document.getElementById('labTrack');
  const labPrev = document.getElementById('labPrev');
  const labNext = document.getElementById('labNext');

  function labStep() {
    const panel = labTrack ? labTrack.querySelector('.lab-panel') : null;
    return panel ? panel.offsetWidth + 20 : 600;
  }

  function updateLabButtons() {
    if (!labTrack) return;
    const maxScroll = labTrack.scrollWidth - labTrack.clientWidth - 4;
    if (labPrev) labPrev.disabled = labTrack.scrollLeft <= 4;
    if (labNext) labNext.disabled = labTrack.scrollLeft >= maxScroll;
  }

  if (labTrack) {
    if (labPrev) labPrev.addEventListener('click', () => labTrack.scrollBy({ left: -labStep(), behavior: 'smooth' }));
    if (labNext) labNext.addEventListener('click', () => labTrack.scrollBy({ left: labStep(), behavior: 'smooth' }));
    labTrack.addEventListener('scroll', updateLabButtons, { passive: true });
    window.addEventListener('resize', updateLabButtons);
    updateLabButtons();
  }

  // Buttons elsewhere on the page that jump straight to a demo
  const demoPanels = { shopify: 'labShopify', ecg: 'labEcg', flashcard: 'labFlash' };

  document.querySelectorAll('.switch-to-play').forEach(btn => {
    btn.addEventListener('click', () => {
      const panel = document.getElementById(demoPanels[btn.dataset.demo]);
      if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
    });
  });

  // Start the ECG canvas once the lab scrolls into view
  const ecgCanvasEl = document.getElementById('ecgCanvas');
  if (ecgCanvasEl) {
    const ecgObserver = new IntersectionObserver((entries) => {
      if (entries.some(entry => entry.isIntersecting)) {
        ecgObserver.disconnect();
        initEcgCanvas();
      }
    }, { threshold: 0.1 });
    ecgObserver.observe(ecgCanvasEl);
  }

  // Resume buttons (header, hero, mobile menu)
  document.querySelectorAll('.open-resume').forEach(btn => {
    btn.addEventListener('click', () => openModal(document.getElementById('resumeModal')));
  });

  /* ==========================================================
     5. SHOPIFY SECTION CUSTOMIZER SIMULATOR (Live Reactive)
     ========================================================== */
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
        renderBadge.style.backgroundColor = hexToRgba(selectedColor, 0.12);
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

  function hexToRgba(hex, alpha = 1) {
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

  [shopHeading, shopSubtitle, shopBtnText, shopBadge, shopThemeColor, shopLayoutAlign, shopShowPrice].forEach(input => {
    if (input) {
      input.addEventListener('input', updateShopifyPreview);
      input.addEventListener('change', updateShopifyPreview);
    }
  });

  updateShopifyPreview();

  /* ==========================================================
     6. REAL-TIME ECG MONITOR & TELEMETRY SIMULATOR
     ========================================================== */
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

    // Make canvas sharp on Retina displays
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
      
      // Dynamic simulated SpO2 calculation
      if (liveSpo2Display) {
        const spo2 = currentBpm > 115 ? 96 : (currentBpm < 60 ? 99 : 98);
        liveSpo2Display.textContent = spo2;
      }
    });
  }

  if (togglePulseStateBtn) {
    togglePulseStateBtn.addEventListener('click', () => {
      isEcgPaused = !isEcgPaused;
      const icon = togglePulseStateBtn.querySelector('i');
      const text = togglePulseStateBtn.querySelector('span');
      if (isEcgPaused) {
        if (icon) { icon.classList.remove('fa-pause'); icon.classList.add('fa-play'); }
        if (text) text.textContent = 'Resume Stream';
      } else {
        if (icon) { icon.classList.remove('fa-play'); icon.classList.add('fa-pause'); }
        if (text) text.textContent = 'Pause Stream';
      }
    });
  }

  // Generate realistic P-Q-R-S-T wave point
  function getEcgY(t, bpm) {
    const period = 60 / bpm; // seconds per beat
    const phase = (t % period) / period; // 0.0 to 1.0

    // baseline
    let y = 0;

    // P-wave (at 0.1 to 0.2)
    if (phase >= 0.12 && phase <= 0.20) {
      const p = (phase - 0.12) / 0.08;
      y = Math.sin(p * Math.PI) * 12;
    }
    // Q-wave (dip at 0.24)
    else if (phase > 0.20 && phase <= 0.24) {
      const q = (phase - 0.20) / 0.04;
      y = -Math.sin(q * Math.PI) * 10;
    }
    // R-wave (huge spike at 0.24 to 0.30)
    else if (phase > 0.24 && phase <= 0.30) {
      const r = (phase - 0.24) / 0.06;
      y = Math.sin(r * Math.PI) * 70;
    }
    // S-wave (sharp dip at 0.30 to 0.34)
    else if (phase > 0.30 && phase <= 0.34) {
      const s = (phase - 0.30) / 0.04;
      y = -Math.sin(s * Math.PI) * 22;
    }
    // T-wave (at 0.44 to 0.58)
    else if (phase >= 0.44 && phase <= 0.58) {
      const tw = (phase - 0.44) / 0.14;
      y = Math.sin(tw * Math.PI) * 18;
    }

    // Add tiny realistic sensor noise
    y += (Math.random() - 0.5) * 1.5;

    return y;
  }

  function renderEcg() {
    if (!ecgCtx || !ecgCanvas) return;

    const width = ecgCanvas.clientWidth || 700;
    const height = 180;
    const midY = height / 2;

    if (!isEcgPaused) {
      ecgTime += 0.016; // approx 60fps delta
      const waveY = midY - getEcgY(ecgTime, currentBpm);
      ecgDataPoints.push(waveY);

      // Keep width number of points
      if (ecgDataPoints.length > width) {
        ecgDataPoints.shift();
      }
    }

    // Clear canvas
    ecgCtx.fillStyle = '#090a0f';
    ecgCtx.fillRect(0, 0, width, height);

    // Draw ECG glowing trace
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

      // Leading pulse dot
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

  /* ==========================================================
     7. EZILANG INTERACTIVE FLASHCARD DECK
     ========================================================== */
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
        showToast(`Speech synthesis not supported in this browser.`);
      }
    });
  }

  /* ==========================================================
     8. MODALS SYSTEM (Resume, Contact & Case Study)
     ========================================================== */
  const resumeModal = document.getElementById('resumeModal');
  const contactModal = document.getElementById('contactModal');
  const caseStudyModal = document.getElementById('caseStudyModal');

  // Trigger buttons
  const viewResumeBtn = document.getElementById('viewResumeBtn');
  const openContactBtn = document.getElementById('openContactBtn');
  const printResumeBtn = document.getElementById('printResumeBtn');

  if (viewResumeBtn) {
    viewResumeBtn.addEventListener('click', () => openModal(resumeModal));
  }

  if (openContactBtn) {
    openContactBtn.addEventListener('click', () => openModal(contactModal));
  }

  if (printResumeBtn) {
    printResumeBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // Close buttons
  document.querySelectorAll('.modal-close-btn, .modal-backdrop').forEach(element => {
    element.addEventListener('click', (e) => {
      if (e.target === element || element.classList.contains('modal-close-btn')) {
        const modalId = element.dataset.close || element.id;
        const targetModal = document.getElementById(modalId) || element.closest('.modal-backdrop');
        if (targetModal) closeModal(targetModal);
      }
    });
  });

  document.querySelectorAll('.modal-dialog').forEach(dialog => {
    dialog.addEventListener('click', e => e.stopPropagation());
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      [resumeModal, contactModal, caseStudyModal].forEach(m => {
        if (m && m.classList.contains('is-open')) closeModal(m);
      });
    }
  });

  function openModal(modal) {
    if (!modal) return;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Case Study Details Data & Loader
  const caseStudies = {
    shopify: {
      title: 'Production Shopify Storefronts & Theme Architecture',
      content: `
        <div style="line-height: 1.7; color: var(--text-secondary);">
          <div style="margin-bottom: 24px;">
            <img src="assets/shopify_mockup.jpg" style="border-radius: var(--radius-lg); width: 100%; max-height: 320px; object-fit: cover;" alt="Shopify Architecture">
          </div>
          <h4 style="font-size: 1.2rem; color: var(--text-primary); margin-bottom: 8px;">Role & Overview</h4>
          <p style="margin-bottom: 16px;">
            As a <strong>Frontend Shopify Developer Intern at Dagar.io</strong> (June – October 2026), I translated Figma designs into pixel-perfect, responsive Shopify storefronts using Liquid, HTML, CSS, JavaScript, and JSON.
          </p>

          <h4 style="font-size: 1.2rem; color: var(--text-primary); margin-bottom: 8px;">Technical Contributions</h4>
          <ul style="padding-left: 20px; margin-bottom: 20px; display: flex; flex-direction: column; gap: 8px;">
            <li>Built reusable Online Store 2.0 sections and page templates with configurable {% schema %} settings, so merchants can rearrange layouts without code.</li>
            <li>Customized navigation, collections, and blog templates to speed up future theme development.</li>
            <li>Performed QA testing across layouts, links, and responsiveness on desktop and mobile.</li>
            <li>Collaborated with designers and developers to optimize storefront performance, using Shopify CLI for local development.</li>
          </ul>

          <h4 style="font-size: 1.2rem; color: var(--text-primary); margin-bottom: 8px;">Key Technologies</h4>
          <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px;">
            <span class="tech-pill">Shopify Liquid</span>
            <span class="tech-pill">Online Store 2.0</span>
            <span class="tech-pill">Figma-to-Liquid</span>
            <span class="tech-pill">JSON Schemas</span>
            <span class="tech-pill">Shopify CLI</span>
            <span class="tech-pill">Responsive CSS</span>
          </div>
        </div>
      `
    },
    nlsql: {
      title: 'NL-to-SQL Reporting Assistant',
      content: `
        <div style="line-height: 1.7; color: var(--text-secondary);">
          <h4 style="font-size: 1.2rem; color: var(--text-primary); margin-bottom: 8px;">Overview</h4>
          <p style="margin-bottom: 16px;">
            A full-stack app that turns plain-English business questions into <strong>T-SQL</strong> using a <strong>locally hosted LLM (Ollama)</strong>. The React UI shows the results table alongside the generated SQL, so every answer is transparent and checkable.
          </p>

          <h4 style="font-size: 1.2rem; color: var(--text-primary); margin-bottom: 8px;">How It Works</h4>
          <ul style="padding-left: 20px; margin-bottom: 20px; display: flex; flex-direction: column; gap: 8px;">
            <li><strong>Schema-aware prompting:</strong> a curated catalog of reporting views, column descriptions, join rules and few-shot examples, so the model only ever sees approved data.</li>
            <li><strong>Safe execution:</strong> sqlglot-based validation (single SELECT only, view whitelist), input guardrails, a read-only SQL Server login, query timeouts and row limits.</li>
            <li><strong>Auditing:</strong> every request is logged to MongoDB.</li>
            <li><strong>Evaluation:</strong> accuracy and latency measured on a golden question set to tune prompts.</li>
          </ul>

          <h4 style="font-size: 1.2rem; color: var(--text-primary); margin-bottom: 8px;">Stack</h4>
          <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px;">
            <span class="tech-pill">React</span>
            <span class="tech-pill">Ollama (Local LLM)</span>
            <span class="tech-pill">sqlglot</span>
            <span class="tech-pill">SQL Server / T-SQL</span>
            <span class="tech-pill">MongoDB</span>
            <span class="tech-pill">Prompt Engineering</span>
          </div>
        </div>
      `
    },
    aurelis: {
      title: 'AURELIS — Expense Anomaly Detector',
      content: `
        <div style="line-height: 1.7; color: var(--text-secondary);">
          <h4 style="font-size: 1.2rem; color: var(--text-primary); margin-bottom: 8px;">Overview</h4>
          <p style="margin-bottom: 16px;">
            A full-stack expense tracker, built in a <strong>team of 3</strong>, that flags unusual spending using <strong>per-category z-score analysis</strong> — each user's own past spending is the baseline, so "unusual" means unusual for <em>you</em>.
          </p>

          <h4 style="font-size: 1.2rem; color: var(--text-primary); margin-bottom: 8px;">Engineering Highlights</h4>
          <ul style="padding-left: 20px; margin-bottom: 20px; display: flex; flex-direction: column; gap: 8px;">
            <li>Migrated the app from browser localStorage to a <strong>REST API (Node.js, Express, MongoDB Atlas)</strong> with an MVC structure.</li>
            <li>Kept the existing frontend working throughout — no redesign needed.</li>
            <li>Added secure accounts with <strong>bcrypt-hashed passwords</strong> and <strong>JWT login</strong>, with authorization so users can only see or change their own data.</li>
          </ul>

          <h4 style="font-size: 1.2rem; color: var(--text-primary); margin-bottom: 8px;">Stack</h4>
          <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px;">
            <span class="tech-pill">Node.js</span>
            <span class="tech-pill">Express.js</span>
            <span class="tech-pill">MongoDB Atlas</span>
            <span class="tech-pill">JWT</span>
            <span class="tech-pill">bcrypt</span>
            <span class="tech-pill">REST / MVC</span>
          </div>
        </div>
      `
    },
    ezilang: {
      title: 'EziLang — Responsive Language Learning Web Platform',
      content: `
        <div style="line-height: 1.7; color: var(--text-secondary);">
          <div style="margin-bottom: 24px;">
            <img src="assets/ezilang_mockup.jpg" style="border-radius: var(--radius-lg); width: 100%; max-height: 320px; object-fit: cover;" alt="EziLang App">
          </div>
          <h4 style="font-size: 1.2rem; color: var(--text-primary); margin-bottom: 8px;">Project Overview</h4>
          <p style="margin-bottom: 16px;">
            EziLang is a responsive language learning platform built to make daily vocabulary practice engaging, fast, and accessible. Deployed live with continuous deployment on Netlify.
          </p>

          <h4 style="font-size: 1.2rem; color: var(--text-primary); margin-bottom: 8px;">Key Capabilities</h4>
          <ul style="padding-left: 20px; margin-bottom: 20px; display: flex; flex-direction: column; gap: 8px;">
            <li>3D CSS perspective card flips with phonetic guides and example sentences.</li>
            <li>Browser Web Speech synthesis for native pronunciation playback.</li>
            <li>Interactive UI components built with clean, semantic HTML5 and vanilla JavaScript.</li>
            <li>Fully responsive layout engineered from scratch.</li>
          </ul>

          <h4 style="font-size: 1.2rem; color: var(--text-primary); margin-bottom: 8px;">Stack & Deployment</h4>
          <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px;">
            <span class="tech-pill">HTML5</span>
            <span class="tech-pill">CSS3 Animations</span>
            <span class="tech-pill">Modern JavaScript (ES6+)</span>
            <span class="tech-pill">Web Speech API</span>
            <span class="tech-pill">Netlify</span>
          </div>
        </div>
      `
    },
    iot: {
      title: 'Smart IoT Heartbeat Monitoring with Cloud Integration',
      content: `
        <div style="line-height: 1.7; color: var(--text-secondary);">
          <div style="margin-bottom: 24px;">
            <img src="assets/iot_mockup.jpg" style="border-radius: var(--radius-lg); width: 100%; max-height: 320px; object-fit: cover;" alt="IoT Health Telemetry">
          </div>
          <h4 style="font-size: 1.2rem; color: var(--text-primary); margin-bottom: 8px;">Hardware & Cloud Architecture</h4>
          <p style="margin-bottom: 16px;">
            Engineered a complete biometric acquisition and cloud streaming solution using an <strong>Arduino UNO</strong> microcontroller paired with a <strong>MAX30102</strong> optical pulse oximetry sensor and an <strong>ESP01 Wi-Fi</strong> transceiving module.
          </p>

          <h4 style="font-size: 1.2rem; color: var(--text-primary); margin-bottom: 8px;">System Highlights</h4>
          <ul style="padding-left: 20px; margin-bottom: 20px; display: flex; flex-direction: column; gap: 8px;">
            <li>Concurrent acquisition of red and infrared photoplethysmogram (PPG) signals to calculate real-time beats per minute (BPM) and blood oxygen saturation (SpO2).</li>
            <li>Programmed AT commands and HTTP/MQTT telemetry packets to stream real-time sensor payloads to <strong>ThingSpeak Cloud</strong>.</li>
            <li>Constructed responsive remote visualization charts allowing clinical or caregiver telemetry monitoring from any browser.</li>
          </ul>

          <h4 style="font-size: 1.2rem; color: var(--text-primary); margin-bottom: 8px;">Engineering Toolbox</h4>
          <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px;">
            <span class="tech-pill">Arduino UNO</span>
            <span class="tech-pill">MAX30102 Optical Sensor</span>
            <span class="tech-pill">ESP01 Wi-Fi Module</span>
            <span class="tech-pill">ThingSpeak Cloud API</span>
            <span class="tech-pill">Embedded C++</span>
            <span class="tech-pill">Biometric Telemetry</span>
          </div>
        </div>
      `
    }
  };

  document.querySelectorAll('.open-case-study').forEach(btn => {
    btn.addEventListener('click', () => {
      const projKey = btn.dataset.project;
      const data = caseStudies[projKey];
      if (data && caseStudyModal) {
        document.getElementById('csModalTitle').textContent = data.title;
        document.getElementById('csModalBody').innerHTML = data.content;
        openModal(caseStudyModal);
      }
    });
  });

  /* ==========================================================
     9. CLIPBOARD COPY & TOAST NOTIFICATIONS
     ========================================================== */
  const toastNotification = document.getElementById('toastNotification');
  const toastMessage = document.getElementById('toastMessage');
  let toastTimer = null;

  function showToast(message) {
    if (!toastNotification || !toastMessage) return;
    toastMessage.textContent = message;
    toastNotification.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastNotification.classList.remove('show');
    }, 2800);
  }

  function copyToClipboard(text, successMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(successMsg);
      }).catch(() => {
        fallbackCopy(text, successMsg);
      });
    } else {
      fallbackCopy(text, successMsg);
    }
  }

  function fallbackCopy(text, successMsg) {
    const tempInput = document.createElement('input');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    try {
      document.execCommand('copy');
      showToast(successMsg);
    } catch (err) {
      showToast('Could not copy text.');
    }
    document.body.removeChild(tempInput);
  }

  // Copy email buttons
  document.querySelectorAll('[data-email]').forEach(btn => {
    btn.addEventListener('click', () => {
      const email = btn.dataset.email || 'simrannkapoor60@gmail.com';
      copyToClipboard(email, `Copied ${email} to clipboard!`);
    });
  });

  // Contact form quick submit handler
  window.handleContactSubmit = function() {
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const message = document.getElementById('contactMessage').value;

    // Hand off to the visitor's mail client so the note actually reaches the inbox
    const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
    const bodyText = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:simrannkapoor60@gmail.com?subject=${subject}&body=${bodyText}`;

    showToast(`Thank you, ${name}! Opening your email app...`);
    setTimeout(() => {
      closeModal(contactModal);
      document.getElementById('contactForm').reset();
    }, 1200);
  };

});
