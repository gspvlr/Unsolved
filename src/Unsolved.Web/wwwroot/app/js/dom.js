// Utilitários DOM mínimos (sem framework).

/** Cria elemento: el('div.card', {onclick}, [children|string]) */
export function el(tag, props = {}, children = []) {
    const parts = tag.split(/(?=[.#])/);
    const node = document.createElement(parts[0] || "div");
    parts.slice(1).forEach(p => {
        if (p.length < 2) return; // ignora "." ou "#" soltos (classe/id vazios)
        if (p[0] === ".") node.classList.add(p.slice(1));
        else if (p[0] === "#") node.id = p.slice(1);
    });
    for (const [k, v] of Object.entries(props || {})) {
        if (v == null || v === false) continue;
        if (k === "html") node.innerHTML = v;
        else if (k === "text") node.textContent = v;
        else if (k === "class") node.className += " " + v;
        else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2).toLowerCase(), v);
        else if (k === "dataset") Object.assign(node.dataset, v);
        else if (k === "style" && typeof v === "object") Object.assign(node.style, v);
        else node.setAttribute(k, v === true ? "" : v);
    }
    append(node, children);
    return node;
}

export function append(node, children) {
    if (children == null) return node;
    const list = Array.isArray(children) ? children : [children];
    for (const c of list) {
        if (c == null || c === false) continue;
        node.appendChild(typeof c === "string" || typeof c === "number" ? document.createTextNode(String(c)) : c);
    }
    return node;
}

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
export const clear = (node) => { while (node.firstChild) node.removeChild(node.firstChild); return node; };

export function initials(name = "") {
    const p = name.trim().split(/\s+/);
    return ((p[0]?.[0] || "") + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase();
}

export function fmtDate(d) {
    if (!d) return "—";
    const dt = typeof d === "string" ? new Date(d) : d;
    return dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}
export function fmtDateTime(d) {
    if (!d) return "—";
    const dt = typeof d === "string" ? new Date(d) : d;
    return dt.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
export function timeAgo(d) {
    const s = (Date.now() - new Date(d).getTime()) / 1000;
    if (s < 60) return "agora";
    if (s < 3600) return `${Math.floor(s / 60)} min`;
    if (s < 86400) return `${Math.floor(s / 3600)} h`;
    if (s < 604800) return `${Math.floor(s / 86400)} d`;
    return fmtDate(d);
}
export const uid = (p = "id") => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
export const debounce = (fn, ms = 200) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
export const escapeHtml = (s) => { const d = document.createElement("div"); d.textContent = s == null ? "" : s; return d.innerHTML; };
