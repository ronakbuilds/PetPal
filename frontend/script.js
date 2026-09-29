(function () {
  "use strict";

  /* ---------- 1. Navbar: scroll shrink, mobile toggle, active link ---------- */
  const navbar = document.querySelector(".navbar");
  const navLinks = document.querySelector(".nav-links");
  const hamburger = document.querySelector(".hamburger");

  if (navbar) {
    const onScroll = () =>
      navbar.classList.toggle("scrolled", window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () =>
      navLinks.classList.toggle("open"),
    );
    navLinks
      .querySelectorAll("a")
      .forEach((a) =>
        a.addEventListener("click", () => navLinks.classList.remove("open")),
      );
  }
  // Highlight the current page's nav link.
  const here = (
    location.pathname.split("/").pop() || "index.html"
  ).toLowerCase();
  document.querySelectorAll(".nav-links a").forEach((a) => {
    const href = (a.getAttribute("href") || "").toLowerCase();
    if (href === here) a.classList.add("active");
  });

  /* ---------- 2. Reveal on scroll ---------- */
  const revealables = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealables.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    revealables.forEach((el) => io.observe(el));
  } else {
    revealables.forEach((el) => el.classList.add("in"));
  }

  /* ---------- 3. Animated counters ---------- */
  const counters = document.querySelectorAll("[data-counter]");
  if (counters.length && "IntersectionObserver" in window) {
    const co = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseFloat(el.dataset.counter || "0");
          const suffix = el.dataset.suffix || "";
          const duration = 1400;
          const start = performance.now();
          const step = (now) => {
            const p = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            const val = target * eased;
            el.textContent =
              (target % 1 === 0
                ? Math.round(val).toLocaleString()
                : val.toFixed(1)) + suffix;
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          co.unobserve(el);
        });
      },
      { threshold: 0.4 },
    );
    counters.forEach((el) => co.observe(el));
  }

  /* ---------- 4. Toast helper ---------- */
  function ensureToast() {
    let t = document.querySelector(".toast");
    if (!t) {
      t = document.createElement("div");
      t.className = "toast";
      document.body.appendChild(t);
    }
    return t;
  }
  window.showToast = function (message) {
    const t = ensureToast();
    t.textContent = message;
    t.classList.add("show");
    clearTimeout(t._h);
    t._h = setTimeout(() => t.classList.remove("show"), 2600);
  };

  /* ---------- 5. Frontend-only form handlers ---------- */
  document.querySelectorAll("form[data-frontend-only]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const msg =
        form.dataset.successMessage || "Saved! (Backend not connected yet)";
      showToast(msg);
      if (form.dataset.reset !== "false") form.reset();
    });
  });

  /* ---------- 6. Floating AI Assistant ---------- */
  const fab = document.querySelector(".ai-fab");
  const panel = document.querySelector(".ai-panel");
  const closeBtn = document.querySelector(".ai-panel .close");
  const body = document.querySelector(".ai-panel .ai-body");
  const input = document.querySelector(".ai-panel .ai-input input");
  const sendBtn = document.querySelector(".ai-panel .ai-input button");
  const suggests = document.querySelectorAll(".ai-panel .ai-suggest button");

  function togglePanel(open) {
    if (!panel) return;
    const willOpen =
      open === undefined ? !panel.classList.contains("open") : open;
    panel.classList.toggle("open", willOpen);
    if (willOpen && input) setTimeout(() => input.focus(), 100);
  }

  if (fab) fab.addEventListener("click", () => togglePanel());
  if (closeBtn) closeBtn.addEventListener("click", () => togglePanel(false));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") togglePanel(false);
  });

  function appendMsg(text, who) {
    const el = document.createElement("div");
    el.className = "msg " + who;
    el.textContent = text;
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
    return el;
  }
  function appendTyping() {
    const el = document.createElement("div");
    el.className = "msg bot typing";
    el.innerHTML = "<span></span><span></span><span></span>";
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
    return el;
  }

  async function sendToAI(message) {
    // Explicitly targets your unique active Render web service path
    const response = await fetch("https://petpal-usd4.onrender.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: message,
      }),
    });

    const data = await response.json();

    if (data.success) {
      return data.reply;
    } else {
      return "Error: " + data.reply;
    }
  }

  async function handleSend() {
    const value = (input.value || "").trim();
    if (!value) return;
    appendMsg(value, "user");
    input.value = "";
    const typing = appendTyping();
    try {
      const reply = await sendToAI(value);
      typing.remove();
      appendMsg(reply, "bot");
    } catch {
      typing.remove();
      appendMsg("Sorry, I couldn't reach the assistant right now.", "bot");
    }
  }

  if (sendBtn) sendBtn.addEventListener("click", handleSend);
  if (input)
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleSend();
    });
  suggests.forEach((b) =>
    b.addEventListener("click", () => {
      input.value = b.textContent;
      handleSend();
    }),
  );
})();
