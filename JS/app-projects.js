/* ===== Projects (loaded from JSON) ===== */
(async function (cfg = {}) {
  // Elements
  const grid        = document.getElementById('grid');
  const loadMoreBtn = document.getElementById('loadMore');
  const counts      = document.getElementById('counts');
  const searchInput = document.getElementById('search');
  const sortSelect  = document.getElementById('sort');
  const tagChips    = document.getElementById('tagChips');

  // --- Mode selection (priority: global config > data-attr > pathname heuristic)
  const mode =
    cfg.mode ||
    (grid && grid.dataset.mode) ||
    (location.pathname.endsWith('/projects.html') ? 'all' : 'featured');

  // limit only for featured mode
  const featuredLimit = Number(
    cfg.featuredLimit ?? (grid && grid.dataset.featuredLimit) ?? 3
  );

  // Load JSON (adjust path as needed)
  let PROJECTS = [];
  try {
    const res = await fetch(new URL('../Data/projects.json', import.meta.url), { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load projects.json');
    PROJECTS = await res.json();
  } catch (err) {
    console.error(err);
    if (counts) counts.textContent = 'Failed to load projects.';
    return;
  }

  // --- Card renderer (same everywhere)
  function projectCard(p) {
    const year = `<span class="text-xs text-slate-500">${p.year ?? ''}</span>`;
    let coverSrc = p.cover ? `${p.cover}` : '';
    if (mode === 'all' && coverSrc) {
      coverSrc = `../${coverSrc}`;
    }

    const img = coverSrc
      ? `<img src="${coverSrc}" alt="Cover — ${p.title ?? ''}"
          class="w-full h-44 object-contain bg-slate-200 dark:bg-slate-800"
          onerror="this.style.display='none'; this.parentElement.classList.add('bg-slate-200','dark:bg-slate-800');">`
      : '';
    const tags = (p.tags || []).map(t => `<span class="px-2 py-1 rounded-full border text-xs">${t}</span>`).join('');
    const links = Object.entries(p.links || {})
      .filter(([, v]) => v)
      .map(([k, v]) => {
        const label = k==='code' ? 'Code' : k==='code on demand' ? 'Code on demand' : k==='demo' ? 'Demo' : k==='paper' ? 'Paper' : k==='site' ? 'Site' : 'Link';
        return `<a href="${v}" target="_blank" rel="noopener" class="text-brand text-sm hover:underline">${label}</a>`;
      })
      .join('<span class="text-slate-300 dark:text-slate-700">·</span>');

    return `
      <article class="group border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white/80 dark:bg-slate-900/80 hover:shadow-lg transition">
        <div>${img}</div>
        <div class="p-4">
          <div class="flex items-baseline justify-between gap-3">
            <h3 class="font-semibold text-lg">${p.title}</h3>
            ${year}
          </div>
          <p class="mt-1 text-sm text-slate-600 dark:text-slate-300 clamp-4">${p.summary || ''}</p>
          <div class="mt-3 flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-300">${tags}</div>
          <div class="mt-4 flex flex-wrap gap-3">${links}</div>
        </div>
      </article>`;
  }

  // --- FEATURED MODE: only show featured, optional limit, no UI wiring
  if (mode === 'featured') {
    const featured = PROJECTS
      .filter(p => p.featured)
      .sort((a, b) => (b.year || 0) - (a.year || 0))
      .slice(0, featuredLimit);

    if (grid) grid.innerHTML = featured.map(projectCard).join('');
    // Hide/ignore UI if present
    if (counts) counts.textContent = '';
    if (tagChips) tagChips.innerHTML = '';
    if (loadMoreBtn) loadMoreBtn.classList.add('hidden');
    return; // stop here
  }
  if (mode === 'all'){
  // --- ALL MODE: full UI (search/sort/tags/pagination)
  let SHOW = 9;
  let selectedTags = new Set();
  let searchTerm = '';

  const ALL_TAGS = Array.from(new Set(PROJECTS.flatMap(p => p.tags || [])))
    .sort((a, b) => a.localeCompare(b));

  function chipTemplate(label) {
    const id = `tag-${label.replace(/[^a-z0-9]/gi, '').toLowerCase()}`;
    return `<button data-tag="${label}" id="${id}" class="px-3 py-1 rounded-full border border-slate-300 dark:border-slate-700 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 data-[active=true]:bg-brand data-[active=true]:text-white data-[active=true]:border-brand" aria-pressed="false">${label}</button>`;
  }
  function renderChips() {
    if (tagChips) tagChips.innerHTML = ALL_TAGS.map(chipTemplate).join('');
  }

  function matches(p) {
    const q = searchTerm.trim().toLowerCase();
    const hay = [p.title, p.summary, ...(p.tags || [])].join(' ').toLowerCase();
    if (q && !hay.includes(q)) return false;
    if (selectedTags.size && !(p.tags || []).some(t => selectedTags.has(t))) return false;
    return true;
  }
  function sortProjects(list) {
    const mode = sortSelect ? sortSelect.value : 'year-desc';
    return list.slice().sort((a, b) => {
      if (mode === 'year-desc') return (b.year || 0) - (a.year || 0);
      if (mode === 'year-asc')  return (a.year || 0) - (b.year || 0);
      if (mode === 'title-asc') return a.title.localeCompare(b.title);
      if (mode === 'title-desc')return b.title.localeCompare(a.title);
      return 0;
    });
  }
  function render() {
    const filtered = PROJECTS.filter(matches);
    const sorted = sortProjects(filtered);
    const visible = sorted.slice(0, SHOW);
    if (grid) grid.innerHTML = visible.map(projectCard).join('');
    if (counts) {
      counts.textContent = `${visible.length} / ${filtered.length} projects shown${selectedTags.size ? ` — filters: ${Array.from(selectedTags).join(', ')}` : ''}`;
    }
    if (loadMoreBtn) {
      loadMoreBtn.classList.toggle('hidden', visible.length >= filtered.length);
    }
  }

  renderChips();

  if (tagChips) {
    tagChips.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-tag]');
      if (!btn) return;
      const tag = btn.dataset.tag;
      if (selectedTags.has(tag)) selectedTags.delete(tag); else selectedTags.add(tag);
      const active = selectedTags.has(tag);
      btn.dataset.active = active;
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      SHOW = 9;
      render();
    });
  }
  if (searchInput)  searchInput.addEventListener('input', (e) => { searchTerm = e.target.value; SHOW = 9; render(); });
  if (sortSelect)   sortSelect.addEventListener('change', () => { SHOW = 9; render(); });
  if (loadMoreBtn)  loadMoreBtn.addEventListener('click', () => { SHOW += 9; render(); });
  render(); // First paint
  }
})(window.PROJECTS_WIDGET || {});