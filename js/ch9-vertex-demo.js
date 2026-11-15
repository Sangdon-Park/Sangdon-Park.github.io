(() => {
  const demo = document.querySelector('[data-vertex-demo]');
  if (!demo) return;
  const points = [...demo.querySelectorAll('[data-point]')];
  const lines = [...demo.querySelectorAll('[data-edge]')];
  const status = demo.querySelector('[data-vertex-status]');
  let picked = new Set();

  function draw() {
    points.forEach((button) => {
      const selected = picked.has(Number(button.dataset.point));
      button.setAttribute('aria-pressed', String(selected));
      button.textContent = `${button.dataset.point}번 ${selected ? '고름' : '안 고름'}`;
    });
    const missing = [];
    lines.forEach((line) => {
      const pair = line.dataset.edge.split('-').map(Number);
      const covered = pair.some((point) => picked.has(point));
      line.dataset.covered = String(covered);
      line.textContent = `${pair.join('–')} ${covered ? '통과' : '남음'}`;
      if (!covered) missing.push(pair.join('–'));
    });
    status.textContent = `고른 점 ${picked.size}개. ${missing.length ? `아직 남은 선: ${missing.join(', ')}.` : '세 선 모두 조건을 만족합니다.'}`;
  }

  demo.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button || !demo.contains(button)) return;
    if (button.hasAttribute('data-point')) {
      const point = Number(button.dataset.point);
      if (picked.has(point)) picked.delete(point);
      else picked.add(point);
    } else if (button.hasAttribute('data-preset')) {
      picked = new Set(button.dataset.preset.split(',').filter(Boolean).map(Number));
    } else return;
    draw();
  });
  demo.querySelector('[data-vertex-controls]').hidden = false;
  draw();
})();
