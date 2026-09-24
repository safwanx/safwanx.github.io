const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".site-nav");
const year = document.querySelector("#year");

if (year) {
  year.textContent = new Date().getFullYear();
}


/* Header hairline once the page has moved */

if (header) {
  const markScrolled = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };

  markScrolled();
  window.addEventListener("scroll", markScrolled, { passive: true });
}

/* Mobile navigation */

if (menuButton && nav) {
  const setMenuState = (isOpen) => {
    nav.classList.toggle("open", isOpen);
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute(
      "aria-label",
      isOpen ? "Close navigation" : "Open navigation",
    );
  };

  menuButton.addEventListener("click", () => {
    setMenuState(!nav.classList.contains("open"));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      setMenuState(false);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("open")) {
      setMenuState(false);
      menuButton.focus();
    }
  });
}

/* Highlight the section being read */

const spyLinks = [...document.querySelectorAll("[data-spy]")];

if (spyLinks.length && "IntersectionObserver" in window) {
  const linkFor = new Map();

  spyLinks.forEach((link) => {
    const section = document.querySelector(link.getAttribute("href"));
    if (section) {
      linkFor.set(section, link);
    }
  });

  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        spyLinks.forEach((link) => link.removeAttribute("aria-current"));
        linkFor.get(entry.target).setAttribute("aria-current", "true");
      });
    },
    { rootMargin: "-40% 0px -55% 0px" },
  );

  linkFor.forEach((_, section) => spy.observe(section));

  window.addEventListener(
    "scroll",
    () => {
      if (window.scrollY < 200) {
        spyLinks.forEach((link) => link.removeAttribute("aria-current"));
      }
    },
    { passive: true },
  );
}

/* Reveal blocks as they arrive. Without this script, or with reduced motion, everything is simply visible. */

const revealTargets = [...document.querySelectorAll("[data-reveal]")];

if (revealTargets.length) {
  if ("IntersectionObserver" in window) {
    const reveal = new IntersectionObserver(
      (entries) => {
        entries
          .filter((entry) => entry.isIntersecting)
          .forEach((entry, index) => {
            entry.target.style.transitionDelay = `${Math.min(index, 4) * 70}ms`;
            entry.target.classList.add("is-in");
            reveal.unobserve(entry.target);
          });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    revealTargets.forEach((target) => reveal.observe(target));
  } else {
    revealTargets.forEach((target) => target.classList.add("is-in"));
  }
}

/* Copy the email address */

document.querySelectorAll("[data-copy]").forEach((button) => {
  const label = button.querySelector("[data-copy-label]");
  const status = document.querySelector("[data-copy-status]");
  const idleText = label ? label.textContent : "";

  const announce = (text) => {
    if (label) {
      label.textContent = text;
    }
    if (status) {
      status.textContent = text;
    }
    button.classList.add("is-copied");
    window.setTimeout(() => {
      if (label) {
        label.textContent = idleText;
      }
      button.classList.remove("is-copied");
    }, 2200);
  };

  button.addEventListener("click", async () => {
    const value = button.dataset.copy;

    try {
      await navigator.clipboard.writeText(value);
      announce("Copied");
    } catch (error) {
      const field = document.createElement("textarea");
      field.value = value;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.append(field);
      field.select();
      const worked = document.execCommand("copy");
      field.remove();
      announce(worked ? "Copied" : "Press Ctrl+C to copy");
    }
  });
});
