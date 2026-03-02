(() => {
  window.GISCUS_CONFIG = Object.assign(
    {
      // Core repository settings
      repo: "Sangdon-Park/Sangdon-Park.github.io",
      repoId: "R_kgDOOHzHWw",

      // Set these after enabling GitHub Discussions
      category: "General",
      categoryId: "",

      // Display behavior
      mapping: "pathname",
      strict: "0",
      reactionsEnabled: "1",
      emitMetadata: "0",
      inputPosition: "top",
      loading: "lazy",
      theme: "preferred_color_scheme"
    },
    window.GISCUS_CONFIG || {}
  );
})();
