// Preferências e estado leve — persistidos em localStorage (tema, sidebar,
// filtros, estado do kanban, favoritos, histórico de navegação).

const KEY = "unsolved-prefs";

const DEFAULTS = {
    theme: "dark",
    accent: "#F0D86D",
    sidebarCollapsed: false,
    density: "comfortable",
    filters: {},          // por módulo: { cases: {...}, evidence: {...} }
    kanban: {},           // { collapsedCols: [], order: {status:[ids]} }
    favorites: { evidence: [], people: [], cases: [] },
    recent: [],           // histórico de navegação [{route,title,at}]
    notifRead: false,
};

let _prefs = load();

function load() {
    try { return { ...structuredClone(DEFAULTS), ...JSON.parse(localStorage.getItem(KEY) || "{}") }; }
    catch { return structuredClone(DEFAULTS); }
}
function persist() { localStorage.setItem(KEY, JSON.stringify(_prefs)); }

export const prefs = {
    get: (k) => _prefs[k],
    set: (k, v) => { _prefs[k] = v; persist(); },
    all: () => _prefs,
    save: persist,
};

/* ---- Tema / acento ---- */
export function applyTheme() {
    document.documentElement.setAttribute("data-theme", _prefs.theme);
    const approvedAccents = ["#F0D86D", "#B0863A", "#B5CDDA"];
    if (!approvedAccents.includes(_prefs.accent)) {
        _prefs.accent = DEFAULTS.accent;
        persist();
    }
    if (_prefs.accent) {
        const r = document.documentElement.style;
        const lightAccents = { "#F0D86D": "#9a6f14", "#B0863A": "#8B6220", "#B5CDDA": "#4f7d92" };
        r.setProperty("--accent", _prefs.theme === "light" ? lightAccents[_prefs.accent] : _prefs.accent);
    }
}
export function toggleTheme() {
    _prefs.theme = _prefs.theme === "dark" ? "light" : "dark";
    persist(); applyTheme();
    return _prefs.theme;
}

/* ---- Filtros por módulo ---- */
export function getFilter(mod, def = {}) { return { ...def, ..._prefs.filters[mod] }; }
export function setFilter(mod, patch) { _prefs.filters[mod] = { ...(_prefs.filters[mod] || {}), ...patch }; persist(); }

/* ---- Favoritos ---- */
export function isFav(kind, id) { return (_prefs.favorites[kind] || []).includes(id); }
export function toggleFav(kind, id) {
    const arr = _prefs.favorites[kind] || (_prefs.favorites[kind] = []);
    const i = arr.indexOf(id);
    if (i >= 0) arr.splice(i, 1); else arr.push(id);
    persist(); return i < 0;
}

/* ---- Kanban ---- */
export function kanbanState() { return _prefs.kanban; }
export function setColCollapsed(status, collapsed) {
    const set = new Set(_prefs.kanban.collapsedCols || []);
    collapsed ? set.add(status) : set.delete(status);
    _prefs.kanban.collapsedCols = [...set]; persist();
}
export function setColOrder(status, ids) {
    _prefs.kanban.order = _prefs.kanban.order || {};
    _prefs.kanban.order[status] = ids; persist();
}

/* ---- Histórico de navegação ---- */
export function recordView(route, title) {
    const list = _prefs.recent.filter(r => r.route !== route);
    list.unshift({ route, title, at: Date.now() });
    _prefs.recent = list.slice(0, 12); persist();
}
export function recentViews() { return _prefs.recent; }
