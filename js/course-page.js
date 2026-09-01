(() => {
  const sidebar = document.getElementById("sidebar");
  const mobileToggle = document.getElementById("mobile-toggle");
  const backToTop = document.getElementById("back-to-top");
  const sectionLinks = document.querySelectorAll(
    '.nav-list:not([data-site-nav]) .nav-link[href^="#"]'
  );
  const sections = document.querySelectorAll("main section[id]");

  if (sidebar && mobileToggle) {
    mobileToggle.addEventListener("click", () => sidebar.classList.toggle("open"));
  }

  sectionLinks.forEach((link) => {
    const href = link.getAttribute("href");
    const target = href ? document.querySelector(href) : null;
    if (!target) return;

    link.addEventListener("click", (event) => {
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      if (window.innerWidth <= 1140 && sidebar) sidebar.classList.remove("open");
    });
  });

  const updateActiveSection = () => {
    const scrollY = window.scrollY + 140;
    let activeId = sections[0]?.id || "";

    sections.forEach((section) => {
      if (scrollY >= section.offsetTop) activeId = section.id;
    });

    const isAtBottom =
      Math.ceil(window.innerHeight + window.scrollY) >=
      document.documentElement.scrollHeight - 2;
    if (isAtBottom && sections.length) activeId = sections[sections.length - 1].id;

    sectionLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${activeId}`);
    });

    if (backToTop) backToTop.classList.toggle("visible", window.scrollY > 400);
  };

  window.addEventListener("scroll", updateActiveSection, { passive: true });
  window.addEventListener("load", updateActiveSection);

  if (backToTop) {
    backToTop.addEventListener("click", (event) => {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
})();
