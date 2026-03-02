(function () {
  const widgets = document.querySelectorAll("[data-traffic-widget]");
  if (!widgets.length) return;

  function formatNumber(value) {
    return Number(value || 0).toLocaleString();
  }

  function formatSyncedAt(isoString, lang) {
    if (!isoString) return "--";
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return "--";
    const locale = lang === "ko" ? "ko-KR" : "en-US";
    return date.toLocaleString(locale, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });
  }

  function applyData(widget, data) {
    const lang = widget.getAttribute("data-lang") || "en";
    const viewsEl = widget.querySelector("[data-traffic-views]");
    const uniquesEl = widget.querySelector("[data-traffic-uniques]");
    const syncedEl = widget.querySelector("[data-traffic-updated]");

    if (viewsEl) {
      viewsEl.textContent = formatNumber(data?.views?.count);
    }
    if (uniquesEl) {
      uniquesEl.textContent = formatNumber(data?.views?.uniques);
    }
    if (syncedEl) {
      syncedEl.textContent = formatSyncedAt(data?.synced_at, lang);
    }
  }

  fetch("/data/github-traffic-latest.json", { cache: "no-store" })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to load traffic data");
      }
      return response.json();
    })
    .then((data) => {
      widgets.forEach((widget) => applyData(widget, data));
    })
    .catch(() => {
      widgets.forEach((widget) => {
        const syncedEl = widget.querySelector("[data-traffic-updated]");
        if (syncedEl && syncedEl.textContent.trim() === "--") {
          syncedEl.textContent = "Unavailable";
        }
      });
    });
})();
