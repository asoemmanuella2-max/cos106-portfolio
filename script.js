(() => {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const store = {
    get(key, fallback = null) {
      try {
        const raw = localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        /* storage unavailable – the app still works for this visit */
      }
    },
  };

  let toastRegion = null;
  function toast(message, type = "success") {
    if (!toastRegion) {
      toastRegion = document.createElement("div");
      toastRegion.className = "toast-region";
      toastRegion.setAttribute("role", "status");
      toastRegion.setAttribute("aria-live", "polite");
      document.body.append(toastRegion);
    }
    const item = document.createElement("div");
    item.className = `toast ${type}`;
    item.append(makeIcon(type === "error" ? "alert" : "check-circle"), document.createTextNode(message));
    toastRegion.append(item);
    setTimeout(() => {
      item.classList.add("out");
      item.addEventListener("animationend", () => item.remove(), { once: true });
    }, 2600);
  }

  const ICONS = {
    home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    briefcase: '<rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    tasks: '<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>',
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
    code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
    gamepad: '<line x1="6" x2="10" y1="12" y2="12"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="15" x2="15.01" y1="13" y2="13"/><line x1="18" x2="18.01" y1="11" y2="11"/><rect width="20" height="12" x="2" y="6" rx="2"/>',
    cap: '<path d="M21.42 10.92a1 1 0 0 0-.02-1.84L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    "arrow-right": '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    "arrow-up": '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
    external: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    play: '<polygon points="6 3 20 12 6 21 6 3"/>',
    pause: '<rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    "check-circle": '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    github: '<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S8.93 17.38 9 18v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>',
    book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    palette: '<circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.65-.75 1.65-1.69 0-.44-.18-.84-.44-1.13-.29-.29-.44-.65-.44-1.13a1.64 1.64 0 0 1 1.67-1.67h2A5.55 5.55 0 0 0 22 11c0-5-4.5-9-10-9z"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
    phone2: '<rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/>',
    bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
    file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>',
    rocket: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
    calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
    inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
    alert: '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    bulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
    headphones: '<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>',
    layers: '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
    spark: '<path d="M9.94 14.06 3 12l6.94-2.06L12 3l2.06 6.94L21 12l-6.94 2.06L12 21z"/>',
  };

  function makeIcon(name, extraClass = "") {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    svg.setAttribute("class", `icon ${extraClass}`.trim());
    svg.innerHTML = ICONS[name] || ICONS.spark;
    return svg;
  }

  // Replace every <i data-icon="name" class="extra"></i> with an inline SVG.
  function renderIcons(scope = document) {
    $$("[data-icon]", scope).forEach((el) => {
      el.replaceWith(makeIcon(el.dataset.icon, el.className));
    });
  }

  function initTheme() {
    const root = document.documentElement;
    const button = $(".theme-toggle");
    const meta = $('meta[name="theme-color"]');
    const apply = (theme) => {
      root.dataset.theme = theme;
      if (meta) meta.content = theme === "light" ? "#f5f6fd" : "#0a0c1b";
      if (button) {
        button.setAttribute("aria-label", theme === "light" ? "Switch to dark theme" : "Switch to light theme");
      }
    };
    apply(root.dataset.theme || "dark");
    button?.addEventListener("click", () => {
      const next = root.dataset.theme === "light" ? "dark" : "light";
      apply(next);
      store.set("theme", next);
    });
  }

  function initNavigation() {
    const header = $(".site-header");
    const links = $(".nav-links");
    const toggle = $(".menu-toggle");
    const progress = $(".scroll-progress");
    const toTop = $(".to-top");

    $$("a", links).forEach((link, i) => link.style.setProperty("--i", i));

    const setMenu = (open) => {
      if (!links || !toggle) return;
      links.classList.toggle("open", open);
      header.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };

    toggle?.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
    links?.addEventListener("click", (e) => e.target.closest("a") && setMenu(false));
    document.addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".site-header")) setMenu(false);
    });

    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      header?.classList.toggle("scrolled", y > 10);
      if (progress) progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
      toTop?.classList.toggle("show", y > 600);
      ticking = false;
    };
    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    update();

    toTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));
  }

  function initReveal() {
    const items = $$(".reveal");
    if (!items.length) return;
    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("in-view"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    items.forEach((el) => observer.observe(el));
  }

  function initCounters() {
    const counters = $$("[data-count]");
    if (!counters.length) return;
    const run = (el) => {
      const target = Number(el.dataset.count);
      const suffix = el.dataset.suffix || "";
      if (reduceMotion) {
        el.textContent = target + suffix;
        return;
      }
      const duration = 1400;
      const start = performance.now();
      const step = (now) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 4);
        el.textContent = Math.round(target * eased) + suffix;
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          run(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => observer.observe(el));
  }

  function initTyped() {
    const el = $("[data-typed]");
    if (!el) return;
    const words = el.dataset.typed.split("|");
    if (reduceMotion) {
      el.textContent = words[0];
      return;
    }
    let word = 0;
    let char = 0;
    let deleting = false;
    const tick = () => {
      const current = words[word];
      char += deleting ? -1 : 1;
      el.textContent = current.slice(0, char);
      let delay = deleting ? 40 : 85;
      if (!deleting && char === current.length) {
        deleting = true;
        delay = 1600;
      } else if (deleting && char === 0) {
        deleting = false;
        word = (word + 1) % words.length;
        delay = 350;
      }
      setTimeout(tick, delay);
    };
    tick();
  }

  function initSpotlight() {
    if (!window.matchMedia("(hover: hover)").matches) return;
    $$(".card").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
        card.style.setProperty("--my", `${e.clientY - rect.top}px`);
      });
    });
  }

  function initAudio() {
    const card = $("[data-audio-player]");
    const audio = $("#intro-audio");
    if (!card || !audio) return;

    const playBtn = $(".play-btn", card);
    const seek = $(".seek", card);
    const current = $(".t-current", card);
    const total = $(".t-total", card);
    const wave = $(".wave", card);
    const status = $(".audio-status", card);

    card.hidden = false;
    audio.removeAttribute("controls");
    audio.hidden = true;

    const BARS = 56;
    const heights = Array.from({ length: BARS }, (_, i) =>
      Math.round(28 + 62 * Math.abs(Math.sin(i * 0.55) * Math.cos(i * 0.21 + 1))));
    heights.forEach((h, i) => {
      const bar = document.createElement("span");
      bar.style.setProperty("--h", h);
      bar.style.setProperty("--i", i);
      wave.append(bar);
    });
    const bars = [...wave.children];

    const format = (s) => {
      if (!Number.isFinite(s)) return "0:00";
      const m = Math.floor(s / 60);
      return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
    };
    const paint = () => {
      const ratio = audio.duration ? audio.currentTime / audio.duration : 0;
      seek.value = Math.round(ratio * 1000);
      seek.style.setProperty("--pct", `${ratio * 100}%`);
      current.textContent = format(audio.currentTime);
      const lit = Math.round(ratio * BARS);
      bars.forEach((bar, i) => bar.classList.toggle("on", i < lit));
    };

    playBtn.addEventListener("click", () => {
      if (audio.paused) {
        audio.play().catch(() => {
          status.textContent = "Sorry, the audio could not be played.";
        });
      } else {
        audio.pause();
      }
    });
    audio.addEventListener("play", () => {
      card.classList.add("is-playing");
      playBtn.setAttribute("aria-label", "Pause introduction");
    });
    const stopped = () => {
      card.classList.remove("is-playing");
      playBtn.setAttribute("aria-label", "Play introduction");
    };
    audio.addEventListener("pause", stopped);
    audio.addEventListener("ended", () => {
      stopped();
      audio.currentTime = 0;
      paint();
    });
    audio.addEventListener("timeupdate", paint);
    audio.addEventListener("loadedmetadata", () => {
      total.textContent = format(audio.duration);
      paint();
    });
    audio.addEventListener("error", () => {
      status.textContent = "Audio file not found. Check the media folder.";
    });
    seek.addEventListener("input", () => {
      if (audio.duration) audio.currentTime = (seek.value / 1000) * audio.duration;
      paint();
    });
    if (audio.readyState >= 1) total.textContent = format(audio.duration);
  }

  function initProjects() {
    const grid = $(".projects-grid");
    if (!grid) return;

    const cards = $$(".project-card", grid);
    const chips = $$("[data-filter]");
    const countEl = $("#project-count");

    function applyFilter(filter) {
      let visible = 0;
      cards.forEach((card) => {
        const categories = card.dataset.category.split(" ");
        const show = filter === "all" || categories.includes(filter);
        card.classList.toggle("is-hidden", !show);
        if (show) {
          visible += 1;
          card.classList.remove("fade-in");
          void card.offsetWidth; // restart the animation
          card.classList.add("fade-in");
        }
      });
      chips.forEach((chip) => chip.setAttribute("aria-pressed", String(chip.dataset.filter === filter)));
      if (countEl) countEl.textContent = `Showing ${visible} of ${cards.length} projects`;
    }
    chips.forEach((chip) => chip.addEventListener("click", () => applyFilter(chip.dataset.filter)));

    // Details dialog – fills itself from the card that was clicked.
    const dialog = $("#project-dialog");
    if (!dialog) return;
    const fill = {
      title: $("#dialog-title", dialog),
      text: $("#dialog-text", dialog),
      tags: $("#dialog-tags", dialog),
      img: $("#dialog-img", dialog),
      actions: $("#dialog-actions", dialog),
      note: $("#dialog-note", dialog),
    };

    $$("[data-open-project]").forEach((button) => {
      button.addEventListener("click", () => {
        const card = button.closest(".project-card");
        const link = $("[data-live]", card);
        const image = $("img", card);

        fill.title.textContent = $("h3", card).textContent;
        fill.text.textContent = card.dataset.details;
        fill.img.src = image.src;
        fill.img.alt = image.alt;
        fill.tags.replaceChildren(...$$(".tag", card).map((t) => t.cloneNode(true)));

        fill.actions.replaceChildren();
        if (link) {
          const a = document.createElement("a");
          a.className = "btn btn-primary btn-sm";
          a.href = link.href;
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          a.append("Open live project ", makeIcon("external"));
          fill.actions.append(a);
        }
        fill.note.hidden = Boolean(link);
        dialog.showModal();
      });
    });
    $$("[data-close-dialog]", dialog).forEach((b) => b.addEventListener("click", () => dialog.close()));
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) dialog.close(); // click on the backdrop
    });
  }

  function initPlanner() {
    const form = $("#task-form");
    if (!form) return;

    const input = $("#task-input");
    const priority = $("#task-priority");
    const field = $("#task-field");
    const error = $("#task-error");
    const list = $("#task-list");
    const status = $("#planner-message");
    const filterButtons = $$("[data-task-filter]");
    const clearBtn = $("#clear-completed");
    const ringBar = $(".ring .bar");
    const ringLabel = $("#ring-label");
    const counters = {
      total: $("#total-count"),
      done: $("#completed-count"),
      pending: $("#pending-count"),
    };

    const STORAGE_KEY = "aso-planner-tasks-v1";
    const CIRCUMFERENCE = 2 * Math.PI * 50;
    const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

    /** @type {{id:string,text:string,priority:string,completed:boolean,created:number}[]} */
    let tasks = store.get(STORAGE_KEY, []);
    if (!Array.isArray(tasks)) tasks = [];
    let filter = "all";
    let freshId = null;
    let firstRender = true;

    const save = () => store.set(STORAGE_KEY, tasks);
    const announce = (message) => { status.textContent = message; };

    function showError(message) {
      field.classList.toggle("invalid", Boolean(message));
      error.querySelector("span").textContent = message || "";
      if (message) {
        input.setAttribute("aria-invalid", "true");
      } else {
        input.removeAttribute("aria-invalid");
      }
    }

    function addTask(text, level) {
      const task = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        text,
        priority: level,
        completed: false,
        created: Date.now(),
      };
      tasks.unshift(task);
      freshId = task.id;
      save();
      render();
      announce(`Task added: ${text}`);
      toast("Task added");
    }

    function toggleTask(id, checked, row) {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;
      task.completed = checked;
      save();
      row.classList.toggle("done", checked);
      updateStats();
      announce(checked ? `Completed: ${task.text}` : `Marked pending: ${task.text}`);
      // If the current filter would now hide this task, animate it away.
      if ((filter === "pending" && checked) || (filter === "completed" && !checked)) {
        setTimeout(() => render(), 450);
      }
    }

    function removeTask(id, row) {
      const finish = () => {
        tasks = tasks.filter((t) => t.id !== id);
        save();
        render();
        toast("Task deleted");
      };
      if (reduceMotion) return finish();
      row.classList.add("removing");
      row.addEventListener("animationend", finish, { once: true });
    }

    function clearCompleted() {
      const rows = $$(".task.done", list);
      const done = () => {
        tasks = tasks.filter((t) => !t.completed);
        save();
        render();
        toast("Completed tasks cleared");
      };
      if (!rows.length) return;
      rows.forEach((r) => r.classList.add("removing"));
      setTimeout(done, reduceMotion ? 0 : 360);
    }

    function visibleTasks() {
      const filtered = tasks.filter((t) =>
        filter === "all" ? true : filter === "completed" ? t.completed : !t.completed);
      // Pending first, then by priority, then newest first.
      return filtered.sort((a, b) =>
        Number(a.completed) - Number(b.completed) ||
        PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] ||
        b.created - a.created);
    }

    function buildRow(task, index) {
      const row = document.createElement("li");
      row.className = "task";
      row.dataset.id = task.id;
      if (task.completed) row.classList.add("done");
      if (firstRender || task.id === freshId) {
        row.classList.add("enter");
        row.style.setProperty("--i", firstRender ? index : 0);
      }

      const check = document.createElement("label");
      check.className = "task-check";
      const box = document.createElement("input");
      box.type = "checkbox";
      box.checked = task.completed;
      box.setAttribute("aria-label", `Mark "${task.text}" as completed`);
      const visual = document.createElement("span");
      visual.className = "box";
      visual.append(makeIcon("check"));
      check.append(box, visual);
      box.addEventListener("change", () => toggleTask(task.id, box.checked, row));

      const body = document.createElement("div");
      body.className = "task-text";
      const title = document.createElement("span");
      title.className = "task-title";
      title.textContent = task.text; // textContent keeps user input safe from HTML injection
      const meta = document.createElement("div");
      meta.className = "task-meta";
      const level = document.createElement("span");
      level.className = `prio prio-${task.priority}`;
      level.textContent = `${task.priority[0].toUpperCase()}${task.priority.slice(1)} priority`;
      const added = document.createElement("span");
      added.textContent = new Date(task.created).toLocaleDateString(undefined, { day: "numeric", month: "short" });
      meta.append(level, added);
      body.append(title, meta);

      const del = document.createElement("button");
      del.type = "button";
      del.className = "icon-btn task-del";
      del.setAttribute("aria-label", `Delete task: ${task.text}`);
      del.append(makeIcon("trash"));
      del.addEventListener("click", () => removeTask(task.id, row));

      row.append(check, body, del);
      return row;
    }

    function emptyState() {
      const messages = {
        all: ["Nothing planned yet", "Add your first task and start the week with a clear plan."],
        pending: ["All caught up", "No pending tasks. Enjoy the break or add something new."],
        completed: ["No completed tasks yet", "Tick a task off and it will show up here."],
      };
      const [heading, text] = messages[filter];
      const wrap = document.createElement("li");
      wrap.className = "empty";
      const tile = document.createElement("span");
      tile.className = "tile";
      tile.append(makeIcon(filter === "completed" ? "check-circle" : "inbox"));
      const h = document.createElement("h3");
      h.textContent = heading;
      const p = document.createElement("p");
      p.textContent = text;
      wrap.append(tile, h, p);
      return wrap;
    }

    function setCount(el, value) {
      if (el.textContent !== String(value)) {
        el.textContent = value;
        el.classList.remove("bump");
        void el.offsetWidth;
        el.classList.add("bump");
      }
    }

    function updateStats() {
      const total = tasks.length;
      const done = tasks.filter((t) => t.completed).length;
      setCount(counters.total, total);
      setCount(counters.done, done);
      setCount(counters.pending, total - done);
      const pct = total === 0 ? 0 : Math.round((done / total) * 100);
      ringLabel.textContent = `${pct}%`;
      ringBar.style.strokeDashoffset = CIRCUMFERENCE * (1 - pct / 100);
      clearBtn.disabled = done === 0;
    }

    function render() {
      const items = visibleTasks();
      list.replaceChildren(...(items.length ? items.map(buildRow) : [emptyState()]));
      filterButtons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.taskFilter === filter)));
      updateStats();
      freshId = null;
      firstRender = false;
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const text = input.value.trim();
      if (text === "") {
        showError("Please enter a task before adding it.");
        input.focus();
        return;
      }
      if (tasks.some((t) => t.text.toLowerCase() === text.toLowerCase() && !t.completed)) {
        showError("That task is already on your list.");
        input.focus();
        return;
      }
      showError("");
      addTask(text, priority.value);
      form.reset();
      input.focus();
    });
    input.addEventListener("input", () => showError(""));
    filterButtons.forEach((button) => button.addEventListener("click", () => {
      filter = button.dataset.taskFilter;
      render();
    }));
    clearBtn.addEventListener("click", clearCompleted);

    render();
  }

  function initContact() {
    const form = $("#contact-form");
    if (!form) return;

    const card = $(".form-card");
    const submitBtn = $("button[type='submit']", form);
    const message = $("#contact-message-text");
    const counter = $("#message-count");
    const successName = $("#success-name");

    const rules = {
      "contact-name": (v) => (v ? "" : "Please enter your name."),
      "contact-email": (v) => {
        if (!v) return "Please enter your email address.";
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? "" : "Enter a valid email, like name@example.com.";
      },
      "contact-phone": (v) => {
        if (!v) return "Please enter your phone number.";
        return /^\d+$/.test(v) ? "" : "Use digits only: no spaces, dashes or + sign.";
      },
      "contact-message-text": (v) => (v ? "" : "Please write a message."),
    };

    function validate(input, show = true) {
      const wrap = input.closest(".field");
      const problem = rules[input.id](input.value.trim());
      if (show) {
        wrap.classList.toggle("invalid", Boolean(problem));
        wrap.classList.toggle("valid", !problem);
        $(".field-error span", wrap).textContent = problem;
        input.setAttribute("aria-invalid", String(Boolean(problem)));
      }
      return !problem;
    }

    const inputs = $$("input, textarea", form);
    inputs.forEach((input) => {
      input.addEventListener("blur", () => input.value !== "" && validate(input));
      input.addEventListener("input", () => {
        if (input.closest(".field").classList.contains("invalid")) validate(input);
      });
    });
    message.addEventListener("input", () => {
      counter.textContent = `${message.value.length} / ${message.maxLength}`;
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const results = inputs.map((input) => validate(input)); // validate every field, don't stop at the first
      const firstBad = inputs[results.indexOf(false)];
      if (firstBad) {
        firstBad.focus();
        toast("Please fix the highlighted fields.", "error");
        return;
      }

      submitBtn.disabled = true;
      submitBtn.firstChild.textContent = "Sending… ";
      setTimeout(() => {
        successName.textContent = $("#contact-name").value.trim();
        card.classList.add("sent");
        $(".success", card).classList.add("show");
        $(".success h2", card).focus();
        form.reset();
        inputs.forEach((i) => i.closest(".field").classList.remove("valid", "invalid"));
        counter.textContent = `0 / ${message.maxLength}`;
        submitBtn.disabled = false;
        submitBtn.firstChild.textContent = "Send message ";
        toast("Form submitted successfully");
      }, reduceMotion ? 0 : 900);
    });

    $("#send-another")?.addEventListener("click", () => {
      card.classList.remove("sent");
      $(".success", card).classList.remove("show");
      $("#contact-name").focus();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderIcons();
    initTheme();
    initNavigation();
    initReveal();
    initCounters();
    initTyped();
    initSpotlight();
    initAudio();
    initProjects();
    initPlanner();
    initContact();
  });
})();
