(() => {
  const links = [...document.querySelectorAll('[data-site-nav] .nav-link')];
  const sections = [...document.querySelectorAll('main section[id]')];
  const topButton = document.getElementById('back-to-top');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let scheduled = false;

  const activeSection = () => {
    let current = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= 150) current = section;
    }
    if (Math.ceil(innerHeight + scrollY) >= document.documentElement.scrollHeight - 2) {
      current = sections[sections.length - 1];
    }
    return current;
  };

  const update = () => {
    const section = activeSection();
    const key = section?.dataset.navKey || section?.id;
    for (const link of links) {
      const active = link.dataset.navKey === key;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
    topButton?.classList.toggle('visible', scrollY > 400);
    scheduled = false;
  };

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      const id = decodeURIComponent(link.hash.slice(1));
      const target = id && document.getElementById(id);
      if (!target) return;
      event.preventDefault();
      history.replaceState(null, '', '#' + encodeURIComponent(id));
      target.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
      if (link.classList.contains('skip-link')) target.focus({ preventScroll: true });
    });
  });

  document.querySelectorAll('.language-toggle a').forEach(link => {
    link.addEventListener('click', () => {
      const id = activeSection()?.id;
      if (id && id !== 'home') link.href = link.getAttribute('href').split('#')[0] + '#' + id;
    });
  });

  topButton?.addEventListener('click', event => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    history.replaceState(null, '', location.pathname);
  });
  window.addEventListener('scroll', () => {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  window.addEventListener('load', update);
  update();
})();
