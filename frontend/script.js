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
    const response = await fetch("https://petpal-usd4.onrender.com/chat", {
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
  if (input) {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleSend();
    });
  }
  suggests.forEach((b) => {
    b.addEventListener("click", () => {
      input.value = b.textContent;
      handleSend();
    });
  });

  /* ---------- 7. Complete Live Registration Handler ---------- */
  const registerForm =
    document.querySelector("#register-form") || document.querySelector("form");

  if (
    registerForm &&
    registerForm.querySelector("input[placeholder*='Name']")
  ) {
    registerForm.removeAttribute("data-frontend-only");

    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const fullnameInput =
        registerForm.querySelector("input[type='text']") ||
        registerForm.querySelector("input[placeholder*='Name']");
      const emailInput = registerForm.querySelector("input[type='email']");
      const passwordInput = registerForm.querySelector(
        "input[type='password']",
      );
      const roleSelect = registerForm.querySelector("select");

      const fullname = fullnameInput.value.trim();
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      const role = roleSelect ? roleSelect.value : "user";

      const submitBtn =
        registerForm.querySelector("button[type='submit']") ||
        registerForm.querySelector(".btn-primary");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Processing...";
      }

      try {
        const response = await fetch(
          "https://petpal-usd4.onrender.com/register",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ fullname, email, password, role }),
          },
        );

        const data = await response.json();

        if (data.success) {
          window.showToast("Registration Successful! Redirecting...");
          setTimeout(() => {
            window.location.href = "login.html";
          }, 2000);
        } else {
          window.showToast("Registration failed: " + data.message);
        }
      } catch (err) {
        window.showToast(
          "Could not connect to server. Ensure Render is awake.",
        );
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Create Account";
        }
      }
    });
  }
})();

/* ---------- 8. Live Dashboard Data Synchronization ---------- */
// It checks if the current browser window viewport is on dashboard.html
if (location.pathname.includes("dashboard.html")) {
  const initializeDashboard = async () => {
    // 1. Get logged-in user record metadata from local memory cache
    const userString = localStorage.getItem("user");
    if (!userString) {
      window.location.href = "./login.html";
      return;
    }
    const user = JSON.parse(userString);

    // Update welcome layout strings dynamically
    const welcomeHeading =
      document.querySelector("#welcome-user") ||
      document.querySelector(".welcome-msg h1") ||
      document.querySelector("h1");
    if (welcomeHeading)
      welcomeHeading.textContent = `Welcome Back, ${user.fullname || "User"}!`;

    try {
      // 2. Query your live active Render cloud service endpoint
      const response = await fetch(
        `https://petpal-usd4.onrender.com/my_pets/${user.id}`,
      );
      const pets = await response.json();

      // Target counter cells and grid container elements safely
      const petContainer =
        document.querySelector("#my-pets-grid") ||
        document.querySelector(".pets-list") ||
        document.querySelector(".🐾.My.Pets") ||
        document.body;
      const petCountBadge =
        document.querySelector("[data-counter='pet_count']") ||
        document.querySelector(".Registered.Pets p") ||
        document.querySelector("h4 + div");

      if (petCountBadge && Array.isArray(pets)) {
        petCountBadge.textContent = pets.length;
      }

      if (petContainer && Array.isArray(pets)) {
        // Clean out fake hardcoded placeholder rows or alert components
        const existingCards = petContainer.querySelectorAll(".pet-card, .card");
        existingCards.forEach((c) => c.remove());

        if (pets.length === 0) {
          const emptyMsg = document.createElement("p");
          emptyMsg.className = "empty-state";
          emptyMsg.style.padding = "1rem";
          emptyMsg.textContent =
            "No registered pets found. Click '+ Add Pet' to initialize your database tracking profiles!";
          petContainer.appendChild(emptyMsg);
          return;
        }

        // Loop through real database entries dynamically to build components
        pets.forEach((pet) => {
          const card = document.createElement("div");
          card.className = "pet-card card reveal in";
          card.style.margin = "1rem 0";
          card.style.padding = "1.5rem";
          card.style.background = "white";
          card.style.borderRadius = "8px";
          card.innerHTML = `
                  <h3 style="color: #1e293b; margin-bottom: 0.5rem;">${pet.pet_name} <span style="font-size: 0.9rem; color: #64748b;">(${pet.pet_type})</span></h3>
                  <p style="color: #475569; font-size: 0.95rem; margin: 0.2rem 0;"><strong>Breed:</strong> ${pet.breed} | <strong>Gender:</strong> ${pet.gender}</p>
                  <p style="color: #475569; font-size: 0.95rem; margin: 0.2rem 0;"><strong>Weight:</strong> ${pet.weight} kg | <strong>Age:</strong> ${pet.age} years</p>
                  <div class="vaccine-badge" style="display: inline-block; background: #e0f2fe; color: #0369a1; padding: 0.25rem 0.6rem; border-radius: 4px; font-size: 0.85rem; font-weight: 600; margin-top: 0.5rem;">Next Vaccine: ${pet.next_vaccination_date || "Not Scheduled"}</div>
                  <p class="notes" style="color: #64748b; font-size: 0.9rem; margin-top: 0.5rem; font-style: italic;">Notes: ${pet.medical_notes || "No custom conditions logged."}</p>
              `;
          petContainer.appendChild(card);
        });
      }
    } catch (error) {
      console.error(
        "Database pipeline failed to map incoming user pets context:",
        error,
      );
    }
  };

  initializeDashboard();
}

  /* ---------- 9. Professional Interactive Logout Process ---------- */
  const logoutBtn = document.querySelector("#logout-btn-trigger");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      
      const overlay = document.querySelector("#logout-overlay-screen");
      if (overlay) {
        overlay.style.display = "flex"; // Activate full screen screen loader overlay layout
      }

      // Simulate secure session data clearing delay parameters
      setTimeout(() => {
        localStorage.removeItem("user"); // Wipe matching auth row data from memory cache
        window.location.href = "./login.html"; // Safe redirect path to sign-in portal page
      }, 2000);
    });
  }