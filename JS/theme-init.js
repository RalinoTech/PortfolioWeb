// Applique le thème le plus tôt possible (persistance + préférence système)
(function () {
  try {
    var saved = localStorage.getItem('theme');
    var dark = saved ? (saved === 'dark')
                     : (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.classList.add('dark');
  } catch (_) {
    // Si localStorage est indisponible, on retombe sur le thème système (CSS gèrera)
  }
})();