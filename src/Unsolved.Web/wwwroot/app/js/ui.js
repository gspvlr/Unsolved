// Biblioteca de UI: toasts, modais, confirmação, menu de contexto, tooltips,
// command palette, skeleton e estados (empty/error/loading).
import { el, clear, $, $$ } from "./dom.js";
import { icon } from "./icons.js";

/* ============================ TOASTS ================================= */
let toastRoot;
export function toast(message, { type = "success", title, timeout = 3600 } = {}) {
    if (!toastRoot) { toastRoot = el("div.toasts"); document.body.appendChild(toastRoot); }
    const t = el("div.toast." + type, {}, [
        el("div.t-ico", { html: icon(type === "success" ? "check" : type === "error" ? "alert" : type === "warning" ? "alert" : "bell") }),
        el("div.t-body", {}, [title ? el("b", { text: title }) : null, el("span", { text: message })]),
        el("button.t-close", { html: icon("x"), onclick: () => dismiss() }),
    ]);
    const dismiss = () => { t.classList.add("out"); setTimeout(() => t.remove(), 220); };
    toastRoot.appendChild(t);
    if (timeout) setTimeout(dismiss, timeout);
    return dismiss;
}

/* ============================ OVERLAY BASE ========================== */
function overlay(child, { onClose } = {}) {
    const ov = el("div.overlay", {
        onclick: (e) => { if (e.target === ov) close(); },
    }, [child]);
    const close = () => { ov.style.animation = "fade var(--t) reverse forwards"; setTimeout(() => ov.remove(), 180); onClose?.(); document.removeEventListener("keydown", esc); };
    const esc = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", esc);
    document.body.appendChild(ov);
    return { ov, close };
}

/* ============================ MODAL ================================ */
export function modal({ title, body, footer, wide = false, onClose }) {
    const bodyEl = el("div.modal-body");
    if (typeof body === "string") bodyEl.innerHTML = body; else if (body) bodyEl.appendChild(body);
    const footEl = footer ? el("div.modal-foot", {}, footer) : null;
    const box = el("div.modal" + (wide ? ".wide" : ""), {}, [
        el("div.modal-head", {}, [el("h2", { text: title }), el("button.icon-btn", { html: icon("x"), onclick: () => api.close() })]),
        bodyEl, footEl,
    ]);
    const { close } = overlay(box, { onClose });
    const api = { close, body: bodyEl };
    return api;
}

/* ============================ CONFIRM ============================= */
export function confirmDialog({ title = "Confirmar ação", message, confirmText = "Confirmar", danger = true } = {}) {
    return new Promise((resolve) => {
        const box = el("div.modal.confirm", {}, [
            el("div.c-ico", { html: icon(danger ? "alert" : "check"), style: danger ? {} : { background: "rgba(52,211,153,.14)", color: "var(--success)" } }),
            el("h3", { text: title }),
            el("p", { text: message }),
            el("div.row", {}, [
                el("button.btn.ghost", { text: "Cancelar", onclick: () => { resolve(false); close(); } }),
                el("button.btn" + (danger ? ".danger" : ".primary"), { text: confirmText, onclick: () => { resolve(true); close(); } }),
            ]),
        ]);
        const { close } = overlay(box, { onClose: () => resolve(false) });
    });
}

/* ============================ CONTEXT MENU ======================== */
let ctxEl;
export function contextMenu(x, y, items) {
    closeCtx();
    ctxEl = el("div.ctx");
    for (const it of items) {
        if (it === "-") { ctxEl.appendChild(el("div.sep")); continue; }
        ctxEl.appendChild(el("button" + (it.danger ? ".danger" : ""), {
            html: (it.icon ? icon(it.icon) : "") + `<span>${it.label}</span>`,
            onclick: () => { closeCtx(); it.action?.(); },
        }));
    }
    document.body.appendChild(ctxEl);
    const rect = ctxEl.getBoundingClientRect();
    ctxEl.style.left = Math.min(x, innerWidth - rect.width - 8) + "px";
    ctxEl.style.top = Math.min(y, innerHeight - rect.height - 8) + "px";
    setTimeout(() => document.addEventListener("click", closeCtx, { once: true }), 0);
}
export function closeCtx() { ctxEl?.remove(); ctxEl = null; }

/** liga um menu de contexto (botão direito) a um elemento */
export function attachContextMenu(node, itemsFn) {
    node.addEventListener("contextmenu", (e) => { e.preventDefault(); contextMenu(e.clientX, e.clientY, itemsFn()); });
}

/* ============================ TOOLTIP ============================ */
let tipEl;
function showTip(target) {
    const text = target.getAttribute("data-tip"); if (!text) return;
    tipEl = el("div.tip", { text });
    document.body.appendChild(tipEl);
    const r = target.getBoundingClientRect(), t = tipEl.getBoundingClientRect();
    tipEl.style.left = Math.max(6, r.left + r.width / 2 - t.width / 2) + "px";
    tipEl.style.top = (r.top - t.height - 8) + "px";
}
function hideTip() { tipEl?.remove(); tipEl = null; }
export function initTooltips() {
    document.addEventListener("mouseover", (e) => { const t = e.target.closest("[data-tip]"); if (t) showTip(t); });
    document.addEventListener("mouseout", (e) => { if (e.target.closest("[data-tip]")) hideTip(); });
    document.addEventListener("click", hideTip);
}

/* ============================ SKELETON / ESTADOS ================ */
export function skeleton(kind = "cards", n = 6) {
    const wrap = el("div.grid");
    if (kind === "cards") {
        const g = el("div.entity-grid");
        for (let i = 0; i < n; i++) g.appendChild(el("div.sk.sk-card"));
        wrap.appendChild(g);
    } else if (kind === "kpis") {
        const g = el("div.kpis");
        for (let i = 0; i < n; i++) g.appendChild(el("div.sk.sk-card", { style: { height: "120px" } }));
        wrap.appendChild(g);
    } else {
        for (let i = 0; i < n; i++) wrap.appendChild(el("div.sk.sk-line", { style: { width: (60 + Math.random() * 40) + "%" } }));
    }
    return wrap;
}
export function emptyState({ icon: ic = "empty", title = "Nada por aqui", text = "", action } = {}) {
    return el("div.state", {}, [
        el("div.ico", { html: icon(ic) }),
        el("h3", { text: title }),
        text ? el("p", { text }) : null,
        action ? el("button.btn.primary", { html: (action.icon ? icon(action.icon) : "") + action.label, onclick: action.onClick }) : null,
    ]);
}
export function errorState(retry) {
    return el("div.state.error", {}, [
        el("div.ico", { html: icon("alert") }),
        el("h3", { text: "Algo deu errado" }),
        el("p", { text: "Não foi possível carregar os dados." }),
        retry ? el("button.btn", { text: "Tentar novamente", onclick: retry }) : null,
    ]);
}

/* ============================ COMMAND PALETTE =================== */
let paletteOpen = false;
export function commandPalette(commands) {
    if (paletteOpen) return;
    paletteOpen = true;
    let items = commands, sel = 0;
    const input = el("input", { type: "text", placeholder: "Buscar comandos, casos, pessoas…", autofocus: true });
    const results = el("div.cmdk-results");
    const box = el("div.cmdk-box", {}, [
        el("div.cmdk-search", { html: icon("search") }),
        results,
    ]);
    box.querySelector(".cmdk-search").appendChild(input);
    box.querySelector(".cmdk-search").appendChild(el("kbd", { class: "tag", text: "ESC", style: { marginLeft: "auto" } }));
    const root = el("div.cmdk", { onclick: (e) => { if (e.target === root) close(); } }, [box]);

    function render() {
        clear(results);
        let group = "";
        items.forEach((c, i) => {
            if (c.group !== group) { results.appendChild(el("div.cmdk-group", { text: c.group })); group = c.group; }
            results.appendChild(el("div.cmdk-item" + (i === sel ? ".sel" : ""), {
                onmouseenter: () => { sel = i; markSel(); },
                onclick: () => { close(); c.action(); },
            }, [
                el("div.c-ic", { html: icon(c.icon || "arrowR") }),
                el("div", {}, [el("b", { text: c.title }), c.sub ? el("span", { text: c.sub }) : null]),
                c.hint ? el("span.tag.meta", { text: c.hint }) : null,
            ]));
        });
        if (!items.length) results.appendChild(el("div.cmdk-group", { text: "Nenhum resultado" }));
    }
    function markSel() { $$(".cmdk-item", results).forEach((n, i) => n.classList.toggle("sel", i === sel)); }
    function filter(q) {
        q = q.trim().toLowerCase();
        items = !q ? commands : commands.filter(c => (c.title + " " + (c.sub || "") + " " + c.group).toLowerCase().includes(q));
        sel = 0; render();
    }
    input.addEventListener("input", () => filter(input.value));
    root.addEventListener("keydown", (e) => {
        if (e.key === "Escape") return close();
        if (e.key === "ArrowDown") { e.preventDefault(); sel = Math.min(sel + 1, items.length - 1); markSel(); scrollSel(); }
        if (e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(sel - 1, 0); markSel(); scrollSel(); }
        if (e.key === "Enter") { e.preventDefault(); const c = items[sel]; if (c) { close(); c.action(); } }
    });
    function scrollSel() { $$(".cmdk-item", results)[sel]?.scrollIntoView({ block: "nearest" }); }
    function close() { paletteOpen = false; root.remove(); }
    render();
    document.body.appendChild(root);
    input.focus();
}
