(() => {
  const en = UI_EN;
  const $ = id => document.getElementById(id);
  if (en) {
    document.documentElement.lang = 'en';
    document.title = 'Chapter 2 Python and C examples | Algorithm Lab';
    const labels = {
      'guide-title': 'Brute force with Python and C',
      'guide-intro': 'Lecture examples linked to all 24 chapter-two exercises. Try each exercise first, then compare your solution.',
      'practice-link': 'Practice chapter 2', 'deck-link': 'Python & C PPTX (Korean)',
      'zip-link': 'Download 26 runnable C examples', 'run-title': 'Running the C examples',
      'run-note': 'Each .c file in the ZIP contains a function and main. Compile one file at a time. In the browser, submit only the function and any helpers, without main.',
      'input-note': 'On Windows run find_pairs.exe. input_grid.c and blackjack_input.c read input with scanf; the other files run the first public example.',
      'correction-note': 'Corrections: the knapsack example has maximum value 13. Fixing the starting city leaves (n−1)! TSP orders. Distinguish 2ⁿ subsets from O(n·2ⁿ) time to inspect or copy their elements.',
      'code-label': 'Example language', 'guide-status': 'Loading examples…'
    };
    for (const [id, value] of Object.entries(labels)) $(id).textContent = value;
    $('practice-link').href = '/algorithm-lab/?chapter=2&lang=en';
  }
  $('practice-link').href='/algorithm-lab/?chapter=2&lang='+UI_LOCALE;
  fetch('chapter-02.json?v=20260915-ch2').then(r => { if (!r.ok) throw Error(); return r.json(); }).then(problems => {
    const render = () => {
      const open = new Set([...document.querySelectorAll('details[open]')].map(d => d.id));
      $('guide-problems').replaceChildren();
      for (const p of problems) {
        const data = localizeProblem(p);
        const view = $('guide-code').value === 'c' ? data.c : data;
        const details = document.createElement('details'); details.id = p.id; details.open = open.has(p.id);
        const summary = document.createElement('summary'); summary.textContent = `${p.id} · ${data.title}`;
        const ref = document.createElement('p'); ref.className = 'reference'; ref.textContent = `${en ? 'Original slide' : T('원본 슬라이드')} ${p.slides}`;
        const description = document.createElement('p'); description.className = 'description'; description.textContent = view.statement;
        const pre = document.createElement('pre'), code = document.createElement('code');
        code.textContent = $('guide-code').value === 'c' ? p.c.solution : p.solution; pre.append(code);
        const hint = document.createElement('p'); hint.textContent = view.hint;
        const links = document.createElement('div'); links.className = 'links';
        const practice = document.createElement('a'); practice.textContent = en ? 'Practice this problem' : T('이 문제 연습하기');
        practice.href = `/algorithm-lab/?chapter=2&problem=${p.id}&code=${$('guide-code').value}&lang=${UI_LOCALE}`;
        const download = document.createElement('a'); download.textContent = en ? 'Download complete .c' : T('main 포함 .c 내려받기');
        download.href = (T("/data/알고리즘/chapter-02-c/")+(p.function)+T(".c")); download.download = p.function + '.c';
        links.append(practice, download); details.append(summary, ref, description, pre, hint, links); $('guide-problems').append(details);
      }
    };
    $('guide-status').textContent = en ? '24 examples · expand a title to view code' : T('24개 예제 · 제목을 펼치면 코드가 보입니다.');
    $('guide-code').onchange = render; render();
  }).catch(() => { $('guide-status').textContent = en ? 'Could not load examples. Please reload.' : T('예제를 불러오지 못했습니다. 새로고침해 주세요.'); });
})();
