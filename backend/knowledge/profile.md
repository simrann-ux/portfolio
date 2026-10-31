# Simran Kapoor — Profile for the portfolio assistant

This file is the only thing the assistant knows. Every answer must be grounded in the facts written here, so keep it accurate and keep it in sync with resume.pdf. Each `##` heading becomes one retrieval chunk; keep related facts under one heading.

## Snapshot

Simran Kapoor is a Computer Science student at Chitkara University, India (Bachelor in Computer Science, expected graduation 2028, CGPA 9.03), based in Panipat, Haryana, India. She describes herself as "Leader • Builder • Forever Student".

She builds full-stack products: Shopify storefronts, REST APIs on Node.js and Express, an LLM-powered reporting assistant, and an IoT health monitor. She is currently exploring how to build LLM-driven products with real commercial value, and her working motto is "Building for production, not just for the demo."

Highlights: a remote Frontend Shopify Developer internship at Dagar.io (June to October 2026); three resume projects (NL-to-SQL Reporting Assistant, AURELIS expense anomaly detector, Smart IoT Heartbeat Monitoring System) plus EziLang, a language-learning site live on Netlify; five Microsoft certifications including the Azure AI Apps and Agents Developer Associate (AI-103) and Power BI Data Analyst Associate (PL-300); Events Team Executive of the GeeksforGeeks Student Chapter.

## Contact and links

- Email: simrannkapoor60@gmail.com (the preferred way to reach her)
- Phone: +91 72060 89479
- LinkedIn: https://linkedin.com/in/simran-kapoor-5996b737a
- GitHub: https://github.com/simrann-kapoor
- Resume: available as a PDF from the "Resume" link on the portfolio (resume.html)
- Location: Panipat, Haryana, India (time zone IST, UTC+5:30)

## What Simran is looking for

Simran is open to internships, full-time roles and Shopify storefront contracts, especially frontend, full-stack and AI work. She is a full-time student graduating in 2028, so internships, part-time, remote and project-based roles fit now, with full-time roles from graduation. She has already completed one remote internship (Dagar.io). Recruiters and hiring managers are welcome to reach out by email at simrannkapoor60@gmail.com or on LinkedIn.

## Experience: Frontend Shopify Developer Intern at Dagar.io

Role: Frontend Shopify Developer Intern at Dagar.io (remote), June 2026 to October 2026. This internship is her industry work experience to date; Dagar.io is the company/employer she has worked at (her only job so far).

- Developed and customized Shopify storefronts using Liquid, HTML, CSS, JavaScript and JSON.
- Converted Figma designs into pixel-perfect, responsive pages.
- Performed QA testing across layouts, links and responsiveness.
- Collaborated with designers and developers to optimize storefront performance.
- Built reusable sections and page templates and customized navigation, collections and blogs.

The portfolio page for this work is shopify.html, which includes a live "customizer" demo showing the kind of merchant-editable section she built.

## Project: NL-to-SQL Reporting Assistant

A full-stack app that converts plain-English business questions into T-SQL using a locally hosted LLM (Ollama), with a React UI that shows the results table next to the generated SQL.

- Schema-aware prompting layer: a curated catalog of reporting views, column descriptions, join rules and few-shot examples, so the model only sees approved data.
- Safe execution: sqlglot-based SQL validation (single SELECT statement, view whitelist), input guardrails, a read-only SQL Server login, query timeouts and row limits.
- Auditing and evaluation: every request is logged to MongoDB; accuracy and latency are measured on a golden question set and used to tune the prompts.
- Stack: React, Ollama (local LLM), sqlglot, SQL Server / T-SQL, MongoDB.

Portfolio page: nlsql.html. This is her main LLM / AI project.

## Project: AURELIS — Expense Anomaly Detector

A full-stack expense tracker, built in a team of 3, that flags unusual spending with per-category z-score analysis, using each user's own past spending as the baseline (so there are no global thresholds).

- Simran moved the app from browser localStorage to a REST API on Node.js, Express and MongoDB Atlas with an MVC structure, while keeping the existing frontend working without a redesign.
- She added secure accounts with bcrypt-hashed passwords and JWT login, and made sure users can only see or change their own data.
- Stack: Node.js, Express.js, MongoDB Atlas, JWT, bcrypt, REST / MVC.

Portfolio page: aurelis.html.

## Project: Smart IoT Heartbeat Monitoring System with Cloud Integration

An IoT health monitor built with an Arduino UNO, a MAX30102 pulse-oximetry sensor and an ESP01 WiFi module that captures heart rate and SpO2 (blood oxygen) in real time.

- Implements concurrent data acquisition on the Arduino.
- Streams live vitals to ThingSpeak for remote monitoring and visualization, so a caregiver can watch trends from any browser.
- Stack: Arduino UNO, MAX30102, ESP01, ThingSpeak, embedded C++.

Portfolio page: iot.html, which includes a simulated live ECG demo.

## Project: EziLang

A responsive language-learning platform built with HTML, CSS and JavaScript and deployed on Netlify with continuous deployment. It has interactive 3D flip flashcards with phonetic guides and example sentences, and native pronunciation through the browser's Web Speech API. Portfolio page: ezilang.html.

## Skills

Taken directly from her resume:

- Languages: C++, Python, Java, JavaScript, HTML5, CSS3, SQL
- Frameworks and technologies: Node.js, Express.js, Django, Flask, FastAPI, Shopify Liquid
- Cloud and data: Microsoft Azure, SQL Server, Data Analysis, Docker, MongoDB
- Tools: GitHub, Shopify CLI, Power BI, Postman, Jupyter Notebook

Also used in her work and projects: React (NL-to-SQL UI), Ollama for locally hosted LLMs, sqlglot for SQL validation, MongoDB Atlas, JWT and bcrypt for authentication, Figma (converting designs to code), Arduino hardware with the MAX30102 sensor and ESP01 WiFi module, ThingSpeak, and schema-aware prompt engineering.

Strongest areas: frontend and Shopify development (Liquid, HTML, CSS, JavaScript), Node.js / Express REST APIs with MongoDB, and LLM application work (prompting, validation and guardrails). Skills she does NOT list: she has not claimed Kubernetes, AWS, Go, Rust, or mobile development.

## Education

Bachelor in Computer Science, Chitkara University, India. Expected graduation 2028. CGPA 9.03.

Coursework: Data Structures & Algorithms, Operating Systems, Computer Networks, DBMS (Database Management Systems), OOPS (Object-Oriented Programming), Machine Learning, Cloud Computing.

## Certifications

Five Microsoft certifications:

- Microsoft Certified: Azure AI Apps and Agents Developer Associate (exam AI-103) — Associate level
- Microsoft Certified: Power BI Data Analyst Associate (exam PL-300) — Associate level
- Microsoft Certified: Azure AI Fundamentals (exam AI-900) — Fundamentals
- Microsoft Certified: Azure Fundamentals (exam AZ-900) — Fundamentals
- Microsoft Certified: Azure Data Fundamentals (exam DP-900) — Fundamentals

Two are Associate level and three are Fundamentals. Issue dates are not listed in the profile, so do not state them.

## Leadership

Events Team Executive, GeeksforGeeks Student Chapter (campus chapter at Chitkara University). She coordinates technical and non-technical events and organizes coding workshops and competitions with student teams, promoting peer learning on campus.

## Interests and direction

Simran is currently exploring how to build LLM-driven products with real commercial value. The NL-to-SQL Reporting Assistant is her main project in that direction, backed by the AI-103 and AI-900 certifications and Machine Learning and Cloud Computing coursework. Outside of AI she enjoys frontend craft: converting designs into pixel-accurate, responsive interfaces.

## Guidance for the assistant

- Answer only from this profile. If something is not here (salary expectations, specific dates not listed, opinions, personal life), say it is not in the profile and suggest emailing simrannkapoor60@gmail.com.
- Refer to Simran in the third person ("she", "her").
- Keep answers short: two to five sentences, or a short bullet list. Use **bold** sparingly and plain "- " bullets for lists.
- When a project page exists, mention its file name (for example nlsql.html) so the visitor can open it.
- Do not invent companies, awards, hackathon wins, metrics or dates.
