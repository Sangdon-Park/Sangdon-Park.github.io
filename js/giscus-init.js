(() => {
  const getLang = () => {
    const lang = (document.documentElement.lang || "ko").toLowerCase();
    return lang.startsWith("en") ? "en" : "ko";
  };

  const mountGiscus = () => {
    const host = document.getElementById("giscus-thread");
    if (!host) return;

    const cfg = window.GISCUS_CONFIG || {};
    if (!cfg.repo || !cfg.repoId || !cfg.category || !cfg.categoryId) {
      const notice = document.createElement("p");
      notice.className = "giscus-pending";
      notice.textContent =
        getLang() === "ko"
          ? "Comments are not enabled yet."
          : "Comments are not enabled yet.";
      host.appendChild(notice);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";

    script.setAttribute("data-repo", cfg.repo);
    script.setAttribute("data-repo-id", cfg.repoId);
    script.setAttribute("data-category", cfg.category);
    script.setAttribute("data-category-id", cfg.categoryId);
    script.setAttribute("data-mapping", cfg.mapping || "pathname");
    script.setAttribute("data-strict", cfg.strict || "0");
    script.setAttribute("data-reactions-enabled", cfg.reactionsEnabled || "1");
    script.setAttribute("data-emit-metadata", cfg.emitMetadata || "0");
    script.setAttribute("data-input-position", cfg.inputPosition || "top");
    script.setAttribute("data-theme", cfg.theme || "preferred_color_scheme");
    script.setAttribute("data-lang", cfg.lang || getLang());
    script.setAttribute("data-loading", cfg.loading || "lazy");

    host.appendChild(script);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountGiscus);
  } else {
    mountGiscus();
  }
})();
