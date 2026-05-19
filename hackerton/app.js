const state = {
  datasets: [],
  filter: "all"
};

const formatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 6
});

async function loadJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Could not load ${url}`);
  }
  return response.json();
}

function formatDate(value) {
  if (!value) return "Not published";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function renderStatus(leaderboard, config) {
  document.getElementById("metric").textContent = leaderboard.metric || config.metric || "roc_auc";
  document.getElementById("submission-count").textContent = String((leaderboard.entries || []).length);
  document.getElementById("updated-at").textContent = formatDate(leaderboard.updated_at);
  document.getElementById("daily-limit").textContent = `${config.daily_submission_limit || 3} / team`;
}

function renderLeaderboard(data) {
  document.getElementById("submission-count").textContent = String((data.entries || []).length);

  const body = document.getElementById("leaderboard-body");
  const entries = data.entries || [];
  if (!entries.length) {
    body.innerHTML = '<tr><td colspan="5">No accepted submissions yet.</td></tr>';
    return;
  }

  body.innerHTML = entries.map((entry) => `
    <tr>
      <td><span class="rank">${entry.rank}</span></td>
      <td><strong>${entry.team}</strong></td>
      <td>${formatter.format(entry.score)}</td>
      <td>${entry.rows}</td>
      <td><code>${entry.submission_file}</code></td>
    </tr>
  `).join("");
}

function matchesFilter(item) {
  if (state.filter === "all") return true;
  if (state.filter === "recommended") return item.recommended;
  return item.task.includes(state.filter);
}

function renderDatasets() {
  const grid = document.getElementById("dataset-grid");
  const items = state.datasets.filter(matchesFilter);
  grid.innerHTML = items.map((item) => `
    <article class="dataset-card">
      <div>
        <div class="meta-row">
          <span class="tag">${item.source}</span>
          <span class="tag">${item.task}</span>
          ${item.recommended ? '<span class="tag hot">Recommended</span>' : ""}
        </div>
        <h3>${item.name}</h3>
        <p>${item.why}</p>
      </div>
      <div>
        <div class="meta-row">
          <span class="tag">${item.rows} rows</span>
          <span class="tag">${item.features} features</span>
          <span class="tag">${item.metric}</span>
        </div>
        <p class="body-copy"><a href="${item.url}" target="_blank" rel="noreferrer">Open source page</a></p>
      </div>
    </article>
  `).join("");
}

function bindFilters() {
  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.filter = button.dataset.filter;
      document.querySelectorAll("[data-filter]").forEach((candidate) => {
        candidate.classList.toggle("active", candidate === button);
      });
      renderDatasets();
    });
  });
}

async function init() {
  bindFilters();
  const [leaderboard, catalog, config] = await Promise.all([
    loadJson("data/leaderboard.json"),
    loadJson("data/datasets.json"),
    loadJson("data/config.json")
  ]);
  state.datasets = catalog.datasets || [];
  renderStatus(leaderboard, config);
  renderLeaderboard(leaderboard);
  renderDatasets();
}

init().catch((error) => {
  console.error(error);
  document.getElementById("leaderboard-body").innerHTML = `<tr><td colspan="5">${error.message}</td></tr>`;
});
