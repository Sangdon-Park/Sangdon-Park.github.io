(() => {
  const navConfig = {
    ko: {
      title: "Navigation",
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
          label: "소개",
          icon: "fas fa-user",
          localHref: "#about",
          globalHref: "/about.html"
        },
        {
          key: "research",
          label: "연구",
          icon: "fas fa-flask",
          localHref: "#research",
          globalHref: "/ko.html#research"
        },
        {
          key: "publications",
          label: "논문",
          icon: "fas fa-book",
          localHref: "#publications",
          globalHref: "/publications.html"
        },
        {
          key: "teaching",
          label: "교육",
          icon: "fas fa-chalkboard-teacher",
          localHref: "#teaching",
          globalHref: "/ko.html#teaching"
        },
        {
          key: "news",
          label: "소식",
          icon: "fas fa-bullhorn",
          localHref: "#news",
          globalHref: "/ko.html#news"
        },
        {
          key: "contact",
          label: "연락처",
          icon: "fas fa-address-card",
          localHref: "#contact",
          globalHref: "/ko.html#contact"
        }
      ]
    },
    en: {
      title: "Navigation",
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
})();
