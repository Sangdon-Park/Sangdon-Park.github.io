(() => {
  const navConfig = {
    ko: {
      items: [
        {
          key: "home",
          label: "홈",
          icon: "fas fa-house",
          localHref: "#home",
          globalHref: "/ko.html#home"
        },
        {
          key: "teaching",
          label: "\uAD50\uC721",
          icon: "fas fa-chalkboard-teacher",
          localHref: "#teaching",
          globalHref: "/courses-2026-fall.html"
        },
        {
          key: "research",
          label: "\uC5F0\uAD6C",
          icon: "fas fa-flask",
          localHref: "#research",
          globalHref: "/ko.html#research"
        },
        {
          key: "games",
          label: "\uAC8C\uC784",
          icon: "fas fa-gamepad",
          localHref: "#projects",
          globalHref: "/games.html"
        },
        {
          key: "publications",
          label: "\uB17C\uBB38",
          icon: "fas fa-book",
          localHref: "#publications",
          globalHref: "/publications.html"
        },
        {
          key: "about",
          label: "\uC18C\uAC1C",
          icon: "fas fa-user",
          localHref: "#about",
          globalHref: "/about.html"
        },
        {
          key: "news",
          label: "\uAE00",
          icon: "fas fa-pen-nib",
          localHref: "#news",
          globalHref: "/ko.html#news"
        },
        {
          key: "contact",
          label: "\uC5F0\uB77D\uCC98",
          icon: "fas fa-address-card",
          localHref: "#contact",
          globalHref: "/ko.html#contact"
        }
      ]
    },
    en: {
      items: [
        {
          key: "home",
          label: "Home",
          icon: "fas fa-house",
          localHref: "#home",
          globalHref: "/en.html#home"
        },
        {
          key: "teaching",
          label: "Teaching",
          icon: "fas fa-chalkboard-teacher",
          localHref: "#teaching",
          globalHref: "/courses-2026-fall-en.html"
        },
        {
          key: "research",
          label: "Research",
          icon: "fas fa-flask",
          localHref: "#research",
          globalHref: "/en.html#research"
        },
        {
          key: "games",
          label: "Games",
          icon: "fas fa-gamepad",
          localHref: "#projects",
          globalHref: "/games-en.html"
        },
        {
          key: "publications",
          label: "Publications",
          icon: "fas fa-book",
          localHref: "#publications",
          globalHref: "/publications-en.html"
        },
        {
          key: "about",
          label: "About",
          icon: "fas fa-user",
          localHref: "#about",
          globalHref: "/about-en.html"
        },
        {
          key: "news",
          label: "Writing",
          icon: "fas fa-pen-nib",
          localHref: "#news",
          globalHref: "/en.html#news"
        },
        {
          key: "contact",
          label: "Contact",
          icon: "fas fa-address-card",
          localHref: "#contact",
          globalHref: "/en.html#contact"
        }
      ]
    }
  };

  const navLists = document.querySelectorAll(".nav-list[data-site-nav]");
  if (!navLists.length) return;

  navLists.forEach((list) => {
    const lang = (list.dataset.lang || "ko").toLowerCase();
    const mode = (list.dataset.context || "global").toLowerCase();
    const active = (list.dataset.active || "").toLowerCase();
    const config = navConfig[lang] || navConfig.ko;
    const useLocal = mode === "local";

    list.innerHTML = config.items
      .map((item) => {
        const href = useLocal ? item.localHref : item.globalHref;
        const activeClass = item.key === active ? " active" : "";
        return (
          `<li class="nav-item">` +
          `<a href="${href}" class="nav-link${activeClass}" data-nav-key="${item.key}"${activeClass ? ' aria-current="page"' : ""}>` +
          `<i class="${item.icon}" aria-hidden="true"></i> ${item.label}</a></li>`
        );
      })
      .join("");
  });

  const profileSections = document.querySelectorAll(".profile-section");
  profileSections.forEach((section) => {
    if (section.querySelector(".lab-logo-link")) return;

    const isEn = (document.documentElement.lang || "").toLowerCase().startsWith("en");
    const homeHref = isEn ? "/en.html#home" : "/ko.html#home";

    const logoLink = document.createElement("a");
    logoLink.className = "lab-logo-link";
    logoLink.href = homeHref;
    logoLink.setAttribute("aria-label", "AxGS Lab");

    const logoImg = document.createElement("img");
    logoImg.className = "lab-logo-image";
    logoImg.src = "/images/AxGS-logo-960.png";
    logoImg.alt = "AxGS Lab Logo";
    logoImg.loading = "lazy";
    logoImg.decoding = "async";

    logoLink.appendChild(logoImg);

    const socialLinks = section.querySelector(".social-links");
    if (socialLinks) {
      section.insertBefore(logoLink, socialLinks);
    } else {
      section.appendChild(logoLink);
    }
  });

  const main = document.querySelector("main");
  if (main) {
    if (!main.id) main.id = "main-content";
    if (!main.hasAttribute("tabindex")) main.setAttribute("tabindex", "-1");
    if (!document.querySelector(".skip-link")) {
      const skip = document.createElement("a");
      skip.className = "skip-link";
      skip.href = "#" + main.id;
      skip.textContent = document.documentElement.lang.startsWith("en") ? "Skip to content" : "본문 바로가기";
      document.body.prepend(skip);
    }
  }

  const brand = document.createElement("a");
  brand.className = "mobile-brand";
  brand.href = document.documentElement.lang.startsWith("en") ? "/en.html" : "/ko.html";
  brand.innerHTML = "<strong>AxGS Lab<span aria-hidden=\"true\">.</span></strong><span>DAEJEON UNIVERSITY</span>";
  document.body.prepend(brand);

  const sidebar = document.getElementById("sidebar");
  const mobileToggle = document.getElementById("mobile-toggle");

  if (sidebar && mobileToggle) {
    const isEn = (document.documentElement.lang || "").toLowerCase().startsWith("en");
    const openLabel = isEn ? "Open menu" : "메뉴 열기";
    const closeLabel = isEn ? "Close menu" : "메뉴 닫기";
    const mobile = matchMedia("(max-width: 980px)");
    const backdrop = document.createElement("button");
    backdrop.className = "menu-backdrop";
    backdrop.type = "button";
    backdrop.tabIndex = -1;
    backdrop.setAttribute("aria-label", closeLabel);
    document.body.appendChild(backdrop);
    mobileToggle.setAttribute("aria-controls", "sidebar");

    const syncState = () => {
      const open = mobile.matches && sidebar.classList.contains("open");
      mobileToggle.setAttribute("aria-expanded", String(open));
      mobileToggle.setAttribute("aria-label", open ? closeLabel : openLabel);
      document.body.classList.toggle("menu-open", open);
      if (main) main.inert = open;
      sidebar.inert = mobile.matches && !open;
    };
    const close = (restoreFocus = false) => {
      sidebar.classList.remove("open");
      syncState();
      if (restoreFocus) mobileToggle.focus();
    };
    mobileToggle.addEventListener("click", event => {
      // Older page scripts also bind this button. Keep one owner for the menu.
      event.stopImmediatePropagation();
      const opening = !sidebar.classList.contains("open");
      sidebar.classList.toggle("open", opening);
      syncState();
      if (opening) sidebar.querySelector(".nav-link")?.focus();
    }, true);
    backdrop.addEventListener("click", () => close(true));
    sidebar.addEventListener("click", event => {
      if (event.target.closest("a") && mobile.matches) {
        close();
        main?.focus({ preventScroll: true });
      }
    });
    document.addEventListener("keydown", event => {
      if (!mobile.matches || !sidebar.classList.contains("open")) return;
      if (event.key === "Escape") {
        event.preventDefault();
        close(true);
      }
      if (event.key === "Tab") {
        const controls = [...sidebar.querySelectorAll('a[href], button:not([disabled])'), mobileToggle]
          .filter(node => node.getClientRects().length && !node.closest("[inert]"));
        const index = controls.indexOf(document.activeElement);
        event.preventDefault();
        const nextIndex = index < 0 ? 0 : (index + (event.shiftKey ? -1 : 1) + controls.length) % controls.length;
        controls[nextIndex]?.focus();
      }
    });
    mobile.addEventListener("change", () => close());
    new MutationObserver(syncState).observe(sidebar, { attributes: true, attributeFilter: ["class"] });
    syncState();
  }
})();
