// Leonida Trophy Atlas: checklist, tracker and guide for the 55 GTA VI trophies.
// Progress lives in localStorage; the trophy data lives in data/trophies.json
// and is fetched from this app's own files, so the guide works fully offline.
import { renderRoadmap } from './roadmap.js';

const PROGRESS_KEY = 'gta6-trophy-checklist';
const SETTINGS_KEY = 'gta6-trophy-settings';
const KIND_LABELS = { story: 'Story', missable: 'Missable', collectibles: 'Collectibles', activities: 'Activities', online: 'Online', meta: 'Platinum path' };

const params = new URLSearchParams(location.search);
const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const byId = new Map(trophies.map((t) => [t.id, t]));
const byName = new Map(trophies.map((t) => [t.name, t]));

// --- saved progress: an array of trophy ids (the starter saved names; read both) ---
function loadEarned() {
  try {
    const raw = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? '[]');
    const ids = (Array.isArray(raw) ? raw : raw.earned ?? []).map((v) => (typeof v === 'number' ? v : byName.get(v)?.id)).filter((v) => byId.has(v));
    return new Set(ids);
  } catch {
    return new Set();
  }
}
let earned = loadEarned();
function saveProgress() {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

// --- settings: the spoiler toggle, saved so it survives a reload ---
function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}');
  } catch {
    return {};
  }
}
const settings = loadSettings();
let spoilersOn = params.get('spoilers') ? params.get('spoilers') !== 'off' : (settings.spoilers ?? true);
let view = ['checklist', 'roadmap', 'missable'].includes(params.get('view')) ? params.get('view') : 'checklist';
let kindFilter = params.get('filter') ?? 'all';
let gradeFilter = params.get('grade') ?? 'all';
let query = params.get('q') ?? '';
let selectedId = Number(params.get('trophy')) || 28;

const $ = (id) => document.getElementById(id);
const listEl = $('trophyList');
const detailEl = $('detailPanel');

function isSpoiled(t) {
  return spoilersOn && t.kind === 'story' && !earned.has(t.id);
}
function gradeLabel(g) {
  return g[0].toUpperCase() + g.slice(1);
}
function syncUrl() {
  const p = new URLSearchParams();
  if (view !== 'checklist') p.set('view', view);
  if (selectedId) p.set('trophy', String(selectedId));
  if (kindFilter !== 'all') p.set('filter', kindFilter);
  if (gradeFilter !== 'all') p.set('grade', gradeFilter);
  if (query) p.set('q', query);
  p.set('spoilers', spoilersOn ? 'on' : 'off');
  history.replaceState(null, '', p.size ? '?' + p.toString() : location.pathname);
}

function chip(text, cls) {
  const s = document.createElement('span');
  s.className = 'chip' + (cls ? ' ' + cls : '');
  s.textContent = text;
  return s;
}

function trophyMeta(t, spoiled) {
  const meta = document.createElement('div');
  meta.className = 'trophy-meta';
  meta.append(chip(gradeLabel(t.grade), t.grade));
  if (t.kind !== 'missable') meta.append(chip(KIND_LABELS[t.kind] ?? t.kind));
  if (t.count) meta.append(chip('Target: ' + t.count.toLocaleString('en-US')));
  if (!spoiled && t.chapter) meta.append(chip(t.chapter));
  if (t.hidden) meta.append(chip('Hidden on PlayStation', 'hidden-flag'));
  if (t.missable) meta.append(chip('⚠ MISSABLE', 'missable'));
  if (earned.has(t.id)) meta.append(chip('✓ Earned'));
  return meta;
}

function sourceLine(t) {
  const p = document.createElement('p');
  p.className = 'trophy-source';
  p.textContent = 'Source: ';
  const a = document.createElement('a');
  a.href = t.source.url;
  a.target = '_blank';
  a.rel = 'noopener';
  a.textContent = t.source.name;
  p.append(a);
  return p;
}

function matches(t) {
  if (kindFilter === 'online') return false; // GTA VI has no online trophies.
  if (kindFilter !== 'all' && t.kind !== kindFilter) return false;
  if (gradeFilter !== 'all' && t.grade !== gradeFilter) return false;
  if (query) {
    const hay = (t.name + ' ' + t.description + ' ' + t.guide + ' ' + (t.chapter ?? '')).toLowerCase();
    if (!hay.includes(query.toLowerCase())) return false;
  }
  return true;
}

function renderProgress() {
  const n = earned.size;
  $('progressText').textContent = n + ' of ' + trophies.length + ' earned';
  $('progressPct').textContent = Math.round((n / trophies.length) * 100) + '% to Platinum';
  $('progressFill').style.width = (n / trophies.length) * 100 + '%';
  $('gradeCounts').textContent = ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => gradeLabel(g) + ' ' + trophies.filter((t) => t.grade === g && earned.has(t.id)).length + '/' + trophies.filter((t) => t.grade === g).length)
    .join(' · ');
}

function renderList() {
  const shown = trophies.filter(matches);
  listEl.replaceChildren();
  for (const t of shown) {
    const spoiled = isSpoiled(t);
    const li = document.createElement('li');
    li.className = 'trophy' + (earned.has(t.id) ? ' earned' : '') + (t.id === selectedId ? ' selected' : '');
    li.addEventListener('click', () => selectTrophy(t.id));

    const top = document.createElement('div');
    top.className = 'trophy-top';
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.id);
    box.setAttribute('aria-label', 'Mark ' + (spoiled ? 'hidden story trophy' : t.name) + ' earned');
    box.addEventListener('change', (e) => {
      e.stopPropagation();
      toggleEarned(t.id, box.checked);
    });
    const head = document.createElement('div');
    const name = document.createElement('p');
    name.className = 'trophy-name';
    name.textContent = spoiled ? 'Hidden story trophy — earn it to reveal' : t.name;
    const desc = document.createElement('p');
    desc.className = 'trophy-desc';
    desc.textContent = spoiled ? 'A story trophy, hidden on PlayStation until earned.' : t.description;
    head.append(name, desc);
    top.append(box, head);

    li.append(top, trophyMeta(t, spoiled));
    if (spoiled) {
      const s = document.createElement('p');
      s.className = 'trophy-guide spoiled';
      s.textContent = 'Guide hidden by the spoiler setting. Tick it earned — or turn spoilers off — to reveal it.';
      li.append(s);
    } else {
      const g = document.createElement('p');
      g.className = 'trophy-guide';
      g.textContent = t.guide;
      li.append(g, sourceLine(t));
    }
    listEl.append(li);
  }
  $('resultCount').textContent = 'Showing ' + shown.length + ' of ' + trophies.length + ' trophies — ' + earned.size + ' earned';
  const empty = $('emptyState');
  empty.hidden = shown.length > 0;
  empty.textContent = kindFilter === 'online'
    ? 'No online trophies: GTA VI has none — all 55 trophies are offline, single-player, and earnable in one playthrough.'
    : 'No trophies match these filters. Try clearing the search or choosing another kind or grade.';
}

function renderDetail() {
  const t = byId.get(selectedId) ?? byId.get(28);
  selectedId = t.id;
  const spoiled = isSpoiled(t);
  detailEl.replaceChildren();
  const h = document.createElement('h2');
  h.textContent = spoiled ? 'Hidden story trophy' : t.name;
  detailEl.append(h, trophyMeta(t, spoiled));
  const off = document.createElement('p');
  off.className = 'official';
  off.textContent = spoiled ? '“Hidden on PlayStation until earned.”' : '“' + t.description + '” — the official description.';
  detailEl.append(off);
  if (t.missable) {
    const w = document.createElement('p');
    w.className = 'warn';
    w.textContent = '⚠ Possibly missable — the only one. Do Lucia’s balcony meditation in Chapter 1, right after the mission Down to Earth, before the chapter ends.';
    detailEl.append(w);
  }
  if (spoiled) {
    const s = document.createElement('p');
    s.className = 'guide spoiled';
    s.textContent = 'This story trophy’s name, description and guide are hidden until you earn it. Turn the spoiler setting off to reveal it now.';
    detailEl.append(s);
  } else {
    const g = document.createElement('p');
    g.className = 'guide';
    g.textContent = t.guide;
    detailEl.append(g);
    if (t.unconfirmed) {
      const u = document.createElement('p');
      u.className = 'unconfirmed';
      u.textContent = 'Unconfirmed: guide writers have not pinned down the exact trigger yet. The description above is the official one; the steps are the best current reading of it.';
      detailEl.append(u);
    }
    detailEl.append(sourceLine(t));
  }
  const actions = document.createElement('div');
  actions.className = 'actions';
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.textContent = earned.has(t.id) ? '✓ Earned — unmark' : 'Mark earned';
  toggle.addEventListener('click', () => toggleEarned(t.id, !earned.has(t.id)));
  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'quiet';
  prev.textContent = '← Previous';
  prev.addEventListener('click', () => selectTrophy(t.id > 1 ? t.id - 1 : trophies.length));
  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'quiet';
  next.textContent = 'Next →';
  next.addEventListener('click', () => selectTrophy(t.id < trophies.length ? t.id + 1 : 1));
  actions.append(toggle, prev, next);
  detailEl.append(actions);
}

function renderMissable() {
  const t = byId.get(28);
  const card = $('missableCard');
  card.replaceChildren();
  const div = document.createElement('div');
  div.className = 'stage';
  const h = document.createElement('h3');
  h.textContent = t.name + ' · ' + gradeLabel(t.grade);
  const w = document.createElement('p');
  w.className = 'warn';
  w.textContent = '⚠ Possibly missable — the only one of 55. One meditation spot is Lucia’s balcony at Jason’s house in Chapter 1, and guides report it may disappear once Chapter 1 ends.';
  const g = document.createElement('p');
  g.textContent = t.guide;
  div.append(h, w, g, sourceLine(t));
  card.append(div);
}

function renderRoadmapView() {
  renderRoadmap($('roadmapStages'), trophies, earned, (id) => {
    setView('checklist');
    selectTrophy(id);
    document.querySelector('.layout').scrollIntoView();
  });
}

function renderAll() {
  renderProgress();
  renderList();
  renderDetail();
  renderMissable();
  renderRoadmapView();
  syncUrl();
}

function toggleEarned(id, on) {
  if (on) earned.add(id);
  else earned.delete(id);
  saveProgress();
  renderAll();
}

function selectTrophy(id) {
  selectedId = id;
  renderList();
  renderDetail();
  syncUrl();
}

function setView(v) {
  view = v;
  for (const b of document.querySelectorAll('.tab')) b.classList.toggle('active', b.dataset.view === v);
  $('checklistView').hidden = v !== 'checklist';
  $('roadmapView').hidden = v !== 'roadmap';
  $('missableView').hidden = v !== 'missable';
  syncUrl();
}

// --- controls ---
for (const b of document.querySelectorAll('.tab')) b.addEventListener('click', () => setView(b.dataset.view));
$('search').value = query;
$('search').addEventListener('input', (e) => { query = e.target.value; renderList(); syncUrl(); });
if (!['missable', 'story', 'collectibles', 'activities', 'online'].includes(kindFilter)) kindFilter = 'all';
$('kindFilter').value = kindFilter;
$('kindFilter').addEventListener('change', (e) => { kindFilter = e.target.value; renderList(); syncUrl(); });
if (!['platinum', 'gold', 'silver', 'bronze'].includes(gradeFilter)) gradeFilter = 'all';
$('gradeFilter').value = gradeFilter;
$('gradeFilter').addEventListener('change', (e) => { gradeFilter = e.target.value; renderList(); syncUrl(); });
$('spoilerToggle').checked = spoilersOn;
$('spoilerToggle').addEventListener('change', (e) => {
  spoilersOn = e.target.checked;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({ spoilers: spoilersOn }));
  renderList();
  renderDetail();
  syncUrl();
});
$('exportBtn').addEventListener('click', () => {
  const data = { app: 'leonida-trophy-atlas', game: 'Grand Theft Auto VI', exportedAt: new Date().toISOString(), earned: [...earned].sort((a, b) => a - b) };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  a.download = 'leonida-trophy-atlas-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
$('importFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const raw = JSON.parse(await file.text());
    const list = Array.isArray(raw) ? raw : raw.earned ?? [];
    const ids = list.map((v) => (typeof v === 'number' ? v : byName.get(v)?.id)).filter((v) => byId.has(v));
    earned = new Set(ids);
    saveProgress();
    renderAll();
  } catch {
    alert('That file is not a valid progress export.');
  }
  e.target.value = '';
});
$('resetBtn').addEventListener('click', () => {
  if (confirm('Clear all earned trophies? This cannot be undone.')) {
    earned = new Set();
    saveProgress();
    renderAll();
  }
});

setView(view);
renderAll();
