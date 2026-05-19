const formatter = new Intl.NumberFormat("ko-KR", {
  maximumFractionDigits: 6
});

async function loadJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`${url} 파일을 불러오지 못했습니다.`);
  }
  return response.json();
}

function formatDate(value) {
  if (!value) return "아직 없음";
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

function componentScore(entry, datasetId) {
  const item = (entry.component_scores || []).find((candidate) => candidate.dataset === datasetId);
  return item ? formatter.format(item.score) : "-";
}

function renderStatus(leaderboard, config) {
  document.getElementById("metric").textContent = "두 ROC AUC 평균";
  document.getElementById("dataset-count").textContent = `${(config.datasets || []).length}종`;
  document.getElementById("daily-limit").textContent = `하루 ${config.daily_submission_limit || 3}회`;
  document.getElementById("score-split").textContent = leaderboard.score_split === "final" ? "최종 평가" : "중간 검증";
  document.getElementById("updated-at").textContent = formatDate(leaderboard.updated_at);
}

function renderLeaderboard(data) {
  const body = document.getElementById("leaderboard-body");
  const entries = data.entries || [];
  if (!entries.length) {
    body.innerHTML = '<tr><td colspan="6">아직 반영된 제출이 없습니다.</td></tr>';
    return;
  }

  body.innerHTML = entries.map((entry) => `
    <tr>
      <td><span class="rank">${entry.rank}</span></td>
      <td><strong>${entry.team}</strong></td>
      <td class="score">${formatter.format(entry.score)}</td>
      <td>${componentScore(entry, "conversion")}</td>
      <td>${componentScore(entry, "credit")}</td>
      <td>${entry.rows}</td>
    </tr>
  `).join("");
}

function renderDatasets(catalog) {
  const grid = document.getElementById("dataset-grid");
  grid.innerHTML = (catalog.datasets || []).map((item) => `
    <article class="dataset-card">
      <div>
        <span class="dataset-id">${item.id}</span>
        <h3>${item.name}</h3>
        <p>${item.notice}</p>
      </div>
      <dl>
        <div><dt>비중</dt><dd>${Math.round(item.weight * 100)}%</dd></div>
        <div><dt>지표</dt><dd>${item.metric}</dd></div>
        <div><dt>규모</dt><dd>${item.rows}</dd></div>
        <div><dt>Feature</dt><dd>${item.features}</dd></div>
      </dl>
    </article>
  `).join("");
}

async function init() {
  const [leaderboard, catalog, config] = await Promise.all([
    loadJson("data/leaderboard.json"),
    loadJson("data/datasets.json"),
    loadJson("data/config.json")
  ]);
  renderStatus(leaderboard, config);
  renderLeaderboard(leaderboard);
  renderDatasets(catalog);
}

init().catch((error) => {
  console.error(error);
  document.getElementById("leaderboard-body").innerHTML = `<tr><td colspan="6">${error.message}</td></tr>`;
});
