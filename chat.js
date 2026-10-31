/* =========================================================================
   Portfolio assistant (about.html)
   -------------------------------------------------------------------------
   Two modes:
   1. Remote (preferred): streams answers from the RAG backend in backend/
      (FastAPI + GPT-4o). Set API_BASE_PROD to the deployed API URL with no
      trailing slash, e.g. 'https://simran-portfolio-api.onrender.com'.
      On localhost the page talks to http://localhost:8000, or to the same
      origin when the FastAPI dev server is serving the site itself.
   2. Browser fallback: if the API is unreachable (not deployed yet, asleep
      on a free tier, offline), questions are matched against the KNOWLEDGE
      list below, written from Simran's resume, so the chat always answers.
   ========================================================================= */
(function () {
  const API_BASE_PROD = 'https://simran-portfolio-api.onrender.com';

  const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  const API_BASE = isLocal
    ? (window.location.port === '8000' ? '' : 'http://localhost:8000')
    : API_BASE_PROD;
  const API_ENABLED = Boolean(API_BASE) || isLocal;

  // Free-tier hosts sleep when idle and can take up to a minute to wake.
  const WAKE_ATTEMPTS = 12;
  const WAKE_INTERVAL_MS = 5000;

  const shell = document.getElementById('chatShell');
  if (!shell) return;

  const messagesEl = document.getElementById('chatMessages');
  const form = document.getElementById('chatForm');
  const input = document.getElementById('chatInput');
  const sendBtn = document.getElementById('chatSend');
  const statusEl = document.getElementById('chatStatus');
  const chipsEl = document.getElementById('chatChips');
  const modelTagEl = document.getElementById('chatModelTag');

  const EMAIL = 'simrannkapoor60@gmail.com';
  const LINKEDIN = 'https://linkedin.com/in/simran-kapoor-5996b737a';
  const GITHUB = 'https://github.com/simrann-kapoor';

  /* ---------- knowledge base (from the resume) ----------
     Order matters for ties: specific entries come before general ones. */
  const KNOWLEDGE = [
    {
      source: 'Projects > NL-to-SQL Reporting Assistant',
      keywords: ['nl-to-sql', 'nl to sql', 'nlsql', 'text to sql', 't-sql', 'sql', 'ollama', 'sqlglot', 'reporting assistant',
        'natural language', 'plain english', 'llm project', 'local llm', 'sql assistant', 'golden question'],
      answer:
        '**NL-to-SQL Reporting Assistant** is a full-stack app that converts plain-English business questions into T-SQL using a locally hosted LLM (Ollama), with a React UI showing the results table and the generated SQL.\n\n' +
        '- A schema-aware prompting layer gives the model a curated catalog of reporting views, column descriptions, join rules and few-shot examples, so it only sees approved data.\n' +
        '- Safe execution is enforced with sqlglot-based SQL validation (single SELECT, view whitelist), input guardrails, a read-only SQL Server login, query timeouts and row limits.\n' +
        '- Every request is logged to MongoDB for auditing, and accuracy and latency are measured on a golden question set to tune the prompts.\n\n' +
        'Full write-up: [the NL-to-SQL project page](nlsql.html)'
    },
    {
      source: 'Projects > AURELIS',
      keywords: ['aurelis', 'expense', 'anomaly', 'z-score', 'z score', 'spending', 'tracker', 'budget', 'bcrypt', 'jwt',
        'team of 3', 'team of three', 'mvc', 'localstorage'],
      answer:
        '**AURELIS** is a full-stack expense tracker, built in a team of 3, that flags unusual spending with per-category z-score analysis, using each user\'s own past spending as the baseline.\n\n' +
        '- Simran moved the app from browser localStorage to a REST API (Node.js, Express, MongoDB Atlas) with an MVC structure, keeping the existing frontend working without a redesign.\n' +
        '- She added secure accounts with bcrypt-hashed passwords and JWT login, and made sure users can only see or change their own data.'
    },
    {
      source: 'Projects > Smart IoT Heartbeat Monitoring System',
      keywords: ['iot', 'heartbeat', 'heart rate', 'heart', 'arduino', 'max30102', 'esp01', 'esp-01', 'thingspeak', 'spo2',
        'sensor', 'hardware', 'vitals', 'health monitor', 'embedded', 'wifi module'],
      answer:
        'The **Smart IoT Heartbeat Monitoring System** is an IoT health monitor built with an Arduino UNO, a MAX30102 sensor and an ESP01 WiFi module to capture heart rate and SpO2 in real time.\n\n' +
        '- It implements concurrent data acquisition and streams live vitals to ThingSpeak for remote monitoring and visualization.'
    },
    {
      source: 'Projects > EziLang',
      keywords: ['ezilang', 'language learning', 'flashcard', 'netlify', 'spanish', 'vocabulary'],
      answer:
        '**EziLang** is a language learning platform built with HTML, CSS and JavaScript, live on Netlify. It features interactive flashcards with pronunciation. It\'s on the portfolio home page under Projects.'
    },
    {
      source: 'Experience > Dagar.io',
      keywords: ['intern', 'internship', 'experience', 'work experience', 'dagar', 'shopify', 'storefront', 'liquid', 'employer',
        'company', 'worked at', 'job history', 'figma', 'qa'],
      answer:
        'Simran was a **Frontend Shopify Developer Intern at Dagar.io** (remote) from June 2026 to October 2026.\n\n' +
        '- Developed and customized Shopify storefronts using Liquid, HTML, CSS, JavaScript and JSON, converting Figma designs into pixel-perfect, responsive pages.\n' +
        '- Performed QA testing across layouts, links and responsiveness while collaborating with designers and developers to optimize storefront performance.\n\n' +
        'See the project page: [Shopify Storefronts](shopify.html)'
    },
    {
      source: 'Certifications',
      keywords: ['certif', 'certified', 'credential', 'exam', 'ai-900', 'az-900', 'dp-900', 'pl-300', 'ai-103', 'power bi',
        'microsoft certified', 'badge'],
      answer:
        'Simran holds **five Microsoft certifications**:\n\n' +
        '- Azure AI Apps and Agents Developer Associate (AI-103)\n' +
        '- Power BI Data Analyst Associate (PL-300)\n' +
        '- Azure AI Fundamentals (AI-900)\n' +
        '- Azure Fundamentals (AZ-900)\n' +
        '- Azure Data Fundamentals (DP-900)\n\n' +
        'Two are Associate level and three are Fundamentals.'
    },
    {
      source: 'Education',
      keywords: ['education', 'university', 'college', 'degree', 'cgpa', 'gpa', 'grade', 'studying', 'student', 'chitkara',
        'coursework', 'courses', 'graduat', 'batch', 'semester', 'major', 'bachelor'],
      answer:
        'Simran is pursuing a **Bachelor in Computer Science at Chitkara University**, expected to graduate in 2028, with a CGPA of 9.03.\n\n' +
        'Coursework: Data Structures & Algorithms, Operating Systems, Computer Networks, DBMS, OOPS, Machine Learning, Cloud Computing.'
    },
    {
      source: 'Leadership',
      keywords: ['leader', 'leadership', 'geeksforgeeks', 'gfg', 'chapter', 'club', 'society', 'event', 'workshop', 'community',
        'volunteer', 'extracurricular', 'organiz', 'organis', 'executive'],
      answer:
        'Simran is an **Events Team Executive at the GeeksforGeeks Student Chapter** on her campus. She coordinates technical and non-technical events and organizes coding workshops and competitions with student teams, promoting peer learning on campus.'
    },
    {
      source: 'Skills',
      keywords: ['skill', 'stack', 'tech', 'technolog', 'language', 'framework', 'tool', 'proficient', 'good at', 'work with',
        'know', 'c++', 'python', 'java', 'javascript', 'html', 'css', 'sql', 'node', 'express', 'django', 'flask', 'fastapi',
        'azure', 'docker', 'mongodb', 'sql server', 'postman', 'jupyter', 'github', 'shopify cli', 'react', 'cloud', 'database',
        'backend', 'frontend', 'full-stack', 'full stack'],
      answer:
        'From Simran\'s resume:\n\n' +
        '- **Languages:** C++, Python, Java, JavaScript, HTML5, CSS3, SQL\n' +
        '- **Frameworks & technologies:** Node.js, Express.js, Django, Flask, FastAPI, Shopify Liquid\n' +
        '- **Cloud & data:** Microsoft Azure, SQL Server, Data Analysis, Docker, MongoDB\n' +
        '- **Tools:** GitHub, Shopify CLI, Power BI, Postman, Jupyter Notebook\n\n' +
        'Her projects also use React, a locally hosted LLM (Ollama), sqlglot, MongoDB Atlas, JWT and bcrypt, and Arduino hardware with ThingSpeak.'
    },
    {
      source: 'Projects',
      keywords: ['project', 'built', 'build', 'portfolio', 'made', 'shipped', 'show me', 'what has', 'created', 'developed'],
      answer:
        'Simran\'s main projects:\n\n' +
        '- **NL-to-SQL Reporting Assistant:** plain-English questions to validated T-SQL on a locally hosted LLM, with a React UI and a sqlglot safety layer.\n' +
        '- **AURELIS:** an expense tracker that flags unusual spending with per-category z-scores, moved from localStorage to a Node.js, Express and MongoDB Atlas API, built in a team of 3.\n' +
        '- **Smart IoT Heartbeat Monitor:** Arduino UNO, MAX30102 and ESP01 streaming heart rate and SpO2 to ThingSpeak.\n' +
        '- **EziLang:** a language learning site live on Netlify.\n\n' +
        'Plus Shopify storefronts built during her internship at Dagar.io. Ask about any one of them by name.'
    },
    {
      source: 'Availability',
      keywords: ['hire', 'hiring', 'open to', 'available', 'availability', 'looking for', 'opportunit', 'role', 'position',
        'vacancy', 'freelance', 'contract', 'full-time', 'full time', 'part-time', 'remote', 'relocat', 'join', 'recruit',
        'interested in', 'next'],
      answer:
        'Yes. Simran is open to **internships, full-time roles and Shopify storefront contracts**, especially frontend, full-stack and AI work. She is a full-time student graduating in 2028 and has already completed a remote internship at Dagar.io.\n\n' +
        'The best way to reach her is email: ' + EMAIL + '. LinkedIn works too: ' + LINKEDIN
    },
    {
      source: 'Contact',
      keywords: ['contact', 'email', 'mail', 'reach', 'phone', 'call', 'number', 'linkedin', 'github', 'connect', 'message',
        'get in touch', 'social', 'link'],
      answer:
        'You can reach Simran at:\n\n' +
        '- Email: ' + EMAIL + '\n' +
        '- LinkedIn: ' + LINKEDIN + '\n' +
        '- GitHub: ' + GITHUB + '\n' +
        '- Phone: +91 72060 89479\n\n' +
        'Email is the most reliable option.'
    },
    {
      source: 'Resume',
      keywords: ['resume', 'cv', 'download', 'pdf'],
      answer:
        'Her resume is available as a PDF: [open the resume](resume.html). You can also use the Resume link in the top navigation.'
    },
    {
      source: 'Location',
      keywords: ['where', 'located', 'location', 'based', 'city', 'live', 'from', 'india', 'haryana', 'panipat', 'timezone',
        'time zone', 'country'],
      answer:
        'Simran is based in **Panipat, Haryana, India** (IST, UTC+5:30), and studies at Chitkara University. Her internship at Dagar.io was remote.'
    },
    {
      source: 'Interests',
      keywords: ['ai', 'llm', 'machine learning', 'ml', 'interest', 'passion', 'learning', 'exploring', 'focus', 'goal',
        'future', 'direction', 'currently'],
      answer:
        'Simran is currently exploring how to build **LLM-driven products with real commercial value**. The NL-to-SQL Reporting Assistant is her main project in that direction, backed by the Azure AI Apps and Agents Developer Associate (AI-103) and Azure AI Fundamentals (AI-900) certifications, and Machine Learning and Cloud Computing coursework.'
    },
    {
      source: 'Snapshot',
      keywords: ['who is', 'who are', 'introduce', 'yourself', 'herself', 'background', 'summary', 'overview', 'bio',
        'profile', 'about simran', 'about her'],
      answer:
        '**Simran Kapoor** is a Computer Science student at Chitkara University (expected 2028, CGPA 9.03) based in Panipat, Haryana. She describes herself as "Leader • Builder • Forever Student".\n\n' +
        '- Frontend Shopify Developer Intern at Dagar.io (June to October 2026, remote)\n' +
        '- Projects: NL-to-SQL Reporting Assistant, AURELIS expense anomaly detector, Smart IoT Heartbeat Monitor, EziLang\n' +
        '- Five Microsoft certifications, including the Azure AI Apps and Agents Developer Associate (AI-103)\n' +
        '- Events Team Executive, GeeksforGeeks Student Chapter'
    }
  ];

  const FALLBACK =
    'I can only answer from Simran\'s profile, and I couldn\'t match that question to it. Try asking about her **skills**, **projects**, **internship**, **certifications**, **education**, **leadership**, or **how to contact her**.';

  /* ---------- matching ---------- */
  function normalise(text) {
    return ' ' + text.toLowerCase().replace(/[^\w+#.\-\s]/g, ' ').replace(/\s+/g, ' ').trim() + ' ';
  }

  function findAnswer(question) {
    const q = normalise(question);

    if (/^\s(hi|hello|hey|yo|hola|namaste|good (morning|afternoon|evening))\b/.test(q)) {
      return { source: null, answer: 'Hello! Ask me anything about Simran\'s skills, projects, certifications or availability.' };
    }
    if (/\bthank/.test(q)) {
      return { source: null, answer: 'You\'re welcome. If you want to take it further, email Simran at ' + EMAIL + '.' };
    }

    let best = null;
    let bestScore = 0;

    KNOWLEDGE.forEach(entry => {
      let score = 0;
      entry.keywords.forEach(kw => {
        if (q.includes(kw)) {
          score += kw.length >= 6 || kw.includes(' ') ? 2 : 1;
        }
      });
      if (score > bestScore) {
        bestScore = score;
        best = entry;
      }
    });

    return best ? { source: best.source, answer: best.answer } : { source: null, answer: FALLBACK };
  }

  /* ---------- rendering ---------- */
  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // Minimal safe renderer: escape, **bold**, [label](url), bare URLs, emails, "- " lists.
  function render(text) {
    const inline = (s) => {
      s = escapeHtml(s);
      s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      // [label](url): absolute URLs open in a new tab, relative page links open in place.
      s = s.replace(/\[([^\]]+)\]\(((?:https?:\/\/[^\s)]+)|(?:[\w][\w./#?=-]*))\)/g, (_, label, url) => {
        const external = /^https?:\/\//.test(url);
        return '<a href="' + url + '"' + (external ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' + label + '</a>';
      });
      s = s.replace(/(^|[\s(])(https?:\/\/[^\s<)]+[^\s<).,;:!?])/g, '$1<a href="$2" target="_blank" rel="noopener noreferrer">$2</a>');
      s = s.replace(/(^|[\s(])([\w.+-]+@[\w-]+\.[\w.]+)/g, '$1<a href="mailto:$2">$2</a>');
      return s;
    };

    let html = '';
    let inList = false;
    text.split(/\r?\n/).forEach(raw => {
      const line = raw.trim();
      const m = line.match(/^(?:[-*•]|\d+[.)])\s+(.*)$/);
      if (m) {
        if (!inList) { html += '<ul>'; inList = true; }
        html += '<li>' + inline(m[1]) + '</li>';
      } else {
        if (inList) { html += '</ul>'; inList = false; }
        if (line) html += '<p>' + inline(line) + '</p>';
      }
    });
    if (inList) html += '</ul>';
    return html;
  }

  function scrollToBottom() {
    messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: 'smooth' });
  }

  function addMessage(role, text, opts = {}) {
    const wrap = document.createElement('div');
    wrap.className = 'chat-msg ' + role + (opts.error ? ' error' : '');
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    if (role === 'user') bubble.textContent = text;
    else bubble.innerHTML = render(text);
    wrap.appendChild(bubble);
    messagesEl.appendChild(wrap);
    scrollToBottom();
    return wrap;
  }

  function addSource(wrap, source) {
    const el = document.createElement('div');
    el.className = 'chat-sources';
    const list = Array.isArray(source) ? source.join(' · ') : source;
    el.textContent = 'From the profile: ' + list;
    wrap.appendChild(el);
  }

  function addTyping() {
    const wrap = document.createElement('div');
    wrap.className = 'chat-msg bot typing';
    wrap.innerHTML = '<div class="chat-bubble"><span class="chat-typing"><i></i><i></i><i></i></span></div>';
    messagesEl.appendChild(wrap);
    scrollToBottom();
    return wrap;
  }

  function setStatus(text, state) {
    statusEl.innerHTML = '<span class="chat-dot"></span>' + text;
    statusEl.dataset.state = state;
  }

  /* ---------- connection state ----------
     mode: 'remote' (API online) or 'local' (browser fallback). */
  let mode = 'local';
  let remoteModel = 'GPT-4o';
  let wakeAttempt = 0;
  let wakeTimer = null;
  let pending = false;

  function idleLabel() {
    return mode === 'remote' ? 'Online · ' + remoteModel : 'Browser mode · keyword answers';
  }

  function setMode(next, label, state) {
    mode = next;
    shell.classList.toggle('is-remote', next === 'remote');
    if (modelTagEl) modelTagEl.textContent = next === 'remote' ? remoteModel + ' · RAG' : 'Browser fallback · no API';
    setStatus(label || idleLabel(), state || 'online');
  }

  function setPending(v) {
    pending = v;
    sendBtn.disabled = v;
    input.disabled = v;
    setStatus(v ? 'Thinking…' : idleLabel(), v ? 'thinking' : 'online');
  }

  async function checkHealth() {
    if (!API_ENABLED) {
      setMode('local');
      return;
    }
    try {
      const res = await fetch(API_BASE + '/api/health', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok && data.llm_configured) {
        wakeAttempt = 0;
        remoteModel = (data.model || 'GPT-4o').replace(/^gpt-4o.*$/i, 'GPT-4o');
        setMode('remote');
        return;
      }
      // Server is up but the model isn't configured: retrying won't help.
      setMode('local');
    } catch (_) {
      // Network error: the host is probably asleep. Keep trying in the background.
      wakeAttempt++;
      if (wakeAttempt < WAKE_ATTEMPTS) {
        setMode('local', 'Waking up the assistant…', 'thinking');
        clearTimeout(wakeTimer);
        wakeTimer = setTimeout(checkHealth, WAKE_INTERVAL_MS);
      } else {
        setMode('local');
      }
    }
  }

  function restartWake() {
    if (!API_ENABLED) return;
    wakeAttempt = 0;
    clearTimeout(wakeTimer);
    checkHealth();
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reveal the answer word by word so it reads like a stream.
  function streamAnswer(wrap, text) {
    return new Promise(resolve => {
      const bubble = wrap.querySelector('.chat-bubble');
      if (reduceMotion) {
        bubble.innerHTML = render(text);
        scrollToBottom();
        resolve();
        return;
      }
      const words = text.split(/(\s+)/);
      let i = 0;
      const step = () => {
        i = Math.min(i + 2, words.length);
        bubble.innerHTML = render(words.slice(0, i).join(''));
        scrollToBottom();
        if (i < words.length) setTimeout(step, 18);
        else resolve();
      };
      step();
    });
  }

  /* ---------- remote (RAG backend) ----------
     Conversation history sent back to the API so follow-ups make sense. */
  const history = [];

  function historyPayload() {
    return history.slice(-8);
  }

  // Returns true when the streaming endpoint handled the question (even with an
  // in-stream error); false means "use the plain endpoint instead".
  async function askStreaming(question, typing) {
    const res = await fetch(API_BASE + '/api/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: question, history: historyPayload() })
    });

    const type = res.headers.get('content-type') || '';
    if (!res.ok || !type.includes('text/event-stream') || !res.body) {
      if (res.status === 404 || res.status === 405) return false;
      const data = await res.json().catch(() => ({}));
      typing.remove();
      addMessage('bot', typeof data.detail === 'string' ? data.detail : 'Something went wrong. Please try again.', { error: true });
      if (res.status === 503) setMode('local');
      return true;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = '', acc = '', sources = [], wrap = null, bubble = null, failed = false;

    const handle = (ev) => {
      if (ev.type === 'sources') { sources = ev.sources || []; return; }
      if (ev.type === 'delta') {
        acc += ev.text;
        if (!wrap) {
          typing.remove();
          wrap = addMessage('bot', '');
          bubble = wrap.querySelector('.chat-bubble');
        }
        bubble.innerHTML = render(acc);
        scrollToBottom();
        return;
      }
      if (ev.type === 'error') {
        failed = true;
        if (wrap) wrap.classList.add('error');
        else { typing.remove(); addMessage('bot', ev.detail || 'Something went wrong. Please try again.', { error: true }); }
      }
    };

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      let idx;
      while ((idx = buf.indexOf('\n\n')) !== -1) {
        const frame = buf.slice(0, idx);
        buf = buf.slice(idx + 2);
        frame.split('\n').forEach(line => {
          if (line.startsWith('data: ')) {
            try { handle(JSON.parse(line.slice(6))); } catch (_) { /* skip malformed frame */ }
          }
        });
      }
    }

    if (failed || !acc) return true;
    if (wrap && sources.length) addSource(wrap, sources);
    history.push({ role: 'user', content: question }, { role: 'assistant', content: acc });
    return true;
  }

  async function askPlain(question, typing) {
    const res = await fetch(API_BASE + '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: question, history: historyPayload() })
    });
    const data = await res.json().catch(() => ({}));
    typing.remove();
    if (!res.ok) {
      addMessage('bot', typeof data.detail === 'string' ? data.detail : 'Something went wrong. Please try again.', { error: true });
      if (res.status === 503) setMode('local');
      return;
    }
    const wrap = addMessage('bot', data.reply || '');
    if (data.sources && data.sources.length) addSource(wrap, data.sources);
    history.push({ role: 'user', content: question }, { role: 'assistant', content: data.reply || '' });
  }

  /* ---------- local (browser fallback) ---------- */
  async function askLocal(question, typing) {
    const { source, answer } = findAnswer(question);
    await new Promise(r => setTimeout(r, reduceMotion ? 0 : 450 + Math.random() * 350));
    typing.remove();
    const wrap = addMessage('bot', '');
    await streamAnswer(wrap, answer);
    if (source) addSource(wrap, source);
  }

  async function ask(question) {
    question = (question || '').trim();
    if (pending || !question) return;

    addMessage('user', question);
    input.value = '';
    setPending(true);
    const typing = addTyping();

    try {
      if (mode === 'remote') {
        const handled = await askStreaming(question, typing);
        if (!handled) await askPlain(question, typing);
      } else {
        await askLocal(question, typing);
      }
    } catch (_) {
      // The API vanished mid-conversation: answer from the browser and start waking it again.
      setMode('local');
      restartWake();
      if (typing.isConnected) await askLocal(question, typing);
    } finally {
      setPending(false);
      if (window.matchMedia('(min-width: 769px)').matches) input.focus();
    }
  }

  /* ---------- wiring ---------- */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    ask(input.value);
  });

  chipsEl.addEventListener('click', (e) => {
    const chip = e.target.closest('.chat-chip');
    if (chip) ask(chip.dataset.q);
  });

  if (API_ENABLED) {
    setStatus('Connecting…', 'thinking');
    checkHealth();
  } else {
    setMode('local');
  }
})();
