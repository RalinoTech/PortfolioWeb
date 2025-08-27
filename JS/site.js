(() => {
  // Année courante (si l’élément existe)
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Éléments UI
  const root = document.documentElement;
  const btn  = document.getElementById('themeToggle');
  const sun  = document.getElementById('sun');
  const moon = document.getElementById('moon');

  // Applique l'état initial à partir du stockage ou du système
  const applyInitialTheme = () => {
    const saved = localStorage.getItem('theme');
    const isDark = saved
      ? saved === 'dark'
      : (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

    root.classList.toggle('dark', isDark);
    updateIconsAndAria();
  };

  const updateIconsAndAria = () => {
    const isDark = root.classList.contains('dark');
    if (sun && moon) {
      sun.classList.toggle('hidden', isDark);
      moon.classList.toggle('hidden', !isDark);
    }
    if (btn) {
      btn.setAttribute('aria-pressed', String(isDark));
      btn.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
    }
  };

  applyInitialTheme();

  if (btn) {
    btn.addEventListener('click', () => {
      const willBeDark = !root.classList.contains('dark');
      root.classList.toggle('dark', willBeDark);
      localStorage.setItem('theme', willBeDark ? 'dark' : 'light');
      updateIconsAndAria();
    });
  }

  // Suit les changements du thème système si l'utilisateur n'a PAS fait de choix
  const mql = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
  if (mql && mql.addEventListener) {
    mql.addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        root.classList.toggle('dark', e.matches);
        updateIconsAndAria();
      }
    });
  }
})();