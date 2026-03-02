(() => {
  const navConfig = {
    ko: {
      items: [
        {
          key: "home",
          label: "Home",
          icon: "fas fa-house",
          localHref: "#home",
          globalHref: "/ko.html#home"
        },
        {
          key: "about",
          label: "\uC18C\uAC1C",
          icon: "fas fa-user",
          localHref: "#about",
          globalHref: "/about.html"
        },
        {
          key: "research",
          label: "\uC5F0\uAD6C",
          icon: "fas fa-flask",
          localHref: "#research",
          globalHref: "/ko.html#research"
        },
        {
          key: "publications",
          label: "\uB17C\uBB38",
          icon: "fas fa-book",
          localHref: "#publications",
          globalHref: "/publications.html"
        },
        {
          key: "teaching",
          label: "\uAD50\uC721",
          icon: "fas fa-chalkboard-teacher",
          localHref: "#teaching",
          globalHref: "/ko.html#teaching"
        },
        {
          key: "news",
          label: "\uC18C\uC2DD",
          icon: "fas fa-bullhorn",
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
          key: "about",
          label: "About",
          icon: "fas fa-user",
          localHref: "#about",
          globalHref: "/about-en.html"
        },
        {
          key: "research",
          label: "Research",
          icon: "fas fa-flask",
          localHref: "#research",
          globalHref: "/en.html#research"
        },
        {
          key: "publications",
          label: "Publications",
          icon: "fas fa-book",
          localHref: "#publications",
          globalHref: "/publications.html"
        },
        {
          key: "teaching",
          label: "Teaching",
          icon: "fas fa-chalkboard-teacher",
          localHref: "#teaching",
          globalHref: "/en.html#teaching"
        },
        {
          key: "news",
          label: "News",
          icon: "fas fa-bullhorn",
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
          `<a href="${href}" class="nav-link${activeClass}">` +
          `<i class="${item.icon}"></i> ${item.label}</a></li>`
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
})();
