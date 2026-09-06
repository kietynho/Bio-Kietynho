/* ============================================
   Botanical Personal Bio — script.js
   Clean • Subtle • Premium interactions
   ============================================ */

(function () {
  "use strict";

  /* ---------- Helpers ---------- */
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouchDevice = window.matchMedia("(hover: none), (pointer: coarse)").matches;

  /* ---------- Theme ---------- */
  function initTheme() {
    const toggle = document.getElementById("themeToggle");
    if (!toggle) return;

    const stored = localStorage.getItem("theme");
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = stored || (systemDark ? "dark" : "light");

    setTheme(initial);

    toggle.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") || "light";
      const next = current === "dark" ? "light" : "dark";
      setTheme(next);
      localStorage.setItem("theme", next);
    });
  }

  function setTheme(theme) {
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }

  /* ---------- Scroll Reveal ---------- */
  function initScrollReveal() {
    const elements = document.querySelectorAll(".reveal");
    if (!elements.length) return;

    if (prefersReducedMotion) {
      elements.forEach((el) => el.classList.add("visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            // Optional: unobserve after reveal for performance
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    elements.forEach((el) => observer.observe(el));
  }

  /* ---------- Custom Cursor ---------- */
  function initCursor() {
    if (isTouchDevice || prefersReducedMotion) return;

    const cursor = document.querySelector(".cursor");
    const follower = document.querySelector(".cursor-follower");
    if (!cursor || !follower) return;

    document.body.classList.add("cursor-active");

    let mouseX = 0;
    let mouseY = 0;
    let followerX = 0;
    let followerY = 0;

    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      cursor.style.left = mouseX + "px";
      cursor.style.top = mouseY + "px";
    });

    // Smooth follower
    function animateFollower() {
      followerX += (mouseX - followerX) * 0.18;
      followerY += (mouseY - followerY) * 0.18;

      follower.style.left = followerX + "px";
      follower.style.top = followerY + "px";

      requestAnimationFrame(animateFollower);
    }
    animateFollower();

    // Hover states
    const hoverTargets = document.querySelectorAll(
      "a, button, .interest-card, .mood-item, .social-btn, .theme-toggle"
    );

    hoverTargets.forEach((el) => {
      el.addEventListener("mouseenter", () => {
        document.body.classList.add("cursor-hover");
      });
      el.addEventListener("mouseleave", () => {
        document.body.classList.remove("cursor-hover");
      });
    });

    // Hide when leaving window
    document.addEventListener("mouseleave", () => {
      cursor.style.opacity = "0";
      follower.style.opacity = "0";
    });
    document.addEventListener("mouseenter", () => {
      cursor.style.opacity = "1";
      follower.style.opacity = "1";
    });
  }

  /* ---------- Subtle Parallax for floating leaves ---------- */
  function initParallax() {
    if (prefersReducedMotion || isTouchDevice) return;

    const leaves = document.querySelectorAll(".leaf");
    if (!leaves.length) return;

    let ticking = false;

    window.addEventListener("scroll", () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrolled = window.scrollY;
          leaves.forEach((leaf, i) => {
            const speed = 0.03 + i * 0.015;
            const y = scrolled * speed;
            leaf.style.transform = `translateY(${y}px) rotate(var(--rot, 0deg))`;
          });
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  /* ---------- Soft button / card interactions ---------- */
  function initInteractions() {
    // Add a very subtle scale on active for social buttons
    const socialBtns = document.querySelectorAll(".social-btn");
    socialBtns.forEach((btn) => {
      btn.addEventListener("mousedown", () => {
        btn.style.transform = "translateY(-1px) scale(0.98)";
      });
      btn.addEventListener("mouseup", () => {
        btn.style.transform = "";
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "";
      });
    });
  }

  /* ---------- Keyboard accessibility polish ---------- */
  function initA11y() {
    // Ensure theme toggle is keyboard friendly (already is)
    // Optional: trap focus not needed here
  }

  /* ---------- Init everything ---------- */
  function init() {
    initTheme();
    initScrollReveal();
    initCursor();
    initParallax();
    initInteractions();
    initA11y();
  }

  // Run when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
