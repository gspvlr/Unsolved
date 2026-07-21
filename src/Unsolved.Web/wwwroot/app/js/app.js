// Bootstrap do Unsolved OS: shell, navegação, atalhos, busca global, tema.
import { el, $, clear, initials } from "./dom.js";
import { icon } from "./icons.js";
import { openDB, all } from "./db.js";
import { ensureSeed } from "./seed.js";
import { prefs, applyTheme, toggleTheme, recordView } from "./store.js";
import { initTooltips, commandPalette, toast } from "./ui.js";
import { defineRoutes, startRouter, navigate } from "./router.js";

import renderDashboard from "./views/dashboard.js";
import { renderCases, renderCaseDetail } from "./views/cases.js";
import renderEvidence from "./views/evidence.js";
import { renderPeople, renderPersonDetail } from "./views/people.js";
import renderTimeline from "./views/timeline.js";
import renderKanban from "./views/kanban.js";
import renderBoard from "./views/board.js";
import renderUsers from "./views/users.js";
import renderSettings from "./views/settings.js";

const NAV = [
    { section: "Arquivo ativo" },
    { route: "painel", label: "Painel", icon: "dashboard" },
    { route: "casos", label: "Casos", icon: "folder" },
    { route: "evidencias", label: "Evidências", icon: "box" },
    { route: "pessoas", label: "Pessoas", icon: "users" },
    { section: "Investigação" },
    { route: "timeline", label: "Linha do tempo", icon: "timeline" },
    { route: "kanban", label: "Kanban", icon: "kanban" },
    { route: "mural", label: "Mural", icon: "board" },
    { section: "Administração" },
    { route: "usuarios", label: "Usuários", icon: "user" },
    { route: "config", label: "Configurações", icon: "settings" },
];

const ROUTES = [
    { path: "painel", title: "Painel", nav: "painel", render: renderDashboard },
    { path: "casos", title: "Casos", nav: "casos", render: renderCases },
    { path: "casos/:id", title: "Caso", nav: "casos", render: renderCaseDetail },
    { path: "evidencias", title: "Evidências", nav: "evidencias", render: renderEvidence },
    { path: "pessoas", title: "Pessoas", nav: "pessoas", render: renderPeople },
    { path: "pessoas/:id", title: "Pessoa", nav: "pessoas", render: renderPersonDetail },
    { path: "timeline", title: "Linha do tempo", nav: "timeline", render: renderTimeline },
    { path: "kanban", title: "Kanban", nav: "kanban", render: renderKanban },
    { path: "mural", title: "Mural", nav: "mural", render: renderBoard },
    { path: "usuarios", title: "Usuários", nav: "usuarios", render: renderUsers },
    { path: "config", title: "Configurações", nav: "config", render: renderSettings },
];

let navEls = {};

function buildShell() {
    const app = el("div.app" + (prefs.get("sidebarCollapsed") ? ".sb-collapsed" : ""), { id: "shell" });

    // Sidebar
    const nav = el("nav.nav");
    for (const item of NAV) {
        if (item.section) { nav.appendChild(el("div.nav-section", { text: item.section })); continue; }
        const node = el("a.nav-item", {
            href: "#/" + item.route,
            "data-nav": item.route,
        }, [el("span", { html: icon(item.icon) }), el("span.nav-label", { text: item.label }), el("span.nav-badge", { id: "badge-" + item.route })]);
        navEls[item.route] = node;
        nav.appendChild(node);
    }
    const sidebar = el("aside.sidebar", {}, [
        el("a.brand", { href: "#/painel", "aria-label": "Unsolved — Central investigativa" }, [
            el("div.brand-mark", {}, [el("img", { src: "/images/logo-transparent.png", alt: "" })]),
            el("div.brand-copy", {}, [
                el("div.brand-name", { text: "Unsolved" }),
                el("span.brand-kicker", { text: "Central investigativa" }),
            ]),
        ]),
        nav,
        el("div.sb-foot", {}, [
            el("div.clearance", {}, [
                el("span", { text: "Acesso autorizado" }),
                el("b", { text: "Nível 03 · Operacional" }),
            ]),
            el("a.nav-item", { href: "/", }, [el("span", { html: icon("logout") }), el("span.nav-label", { text: "Sair do sistema" })]),
        ]),
    ]);

    // Topbar
    const search = el("div.searchbar", { onclick: openPalette }, [
        el("span", { html: icon("search") }),
        el("input", { placeholder: "Buscar caso, pessoa ou evidência…", readonly: true, "aria-label": "Busca global" }),
        el("kbd", { text: "Ctrl K" }),
    ]);
    const crumbs = el("div.crumbs", { id: "crumbs" });
    const themeBtn = el("button.icon-btn", { "data-tip": "Alternar tema", html: icon(prefs.get("theme") === "dark" ? "sun" : "moon"), onclick: () => { const t = toggleTheme(); themeBtn.innerHTML = icon(t === "dark" ? "sun" : "moon"); } });
    const topbar = el("header.topbar", {}, [
        el("button.icon-btn.menu-toggle", { html: icon("kanban"), onclick: () => app.classList.toggle("sb-open") }),
        el("button.icon-btn", { "data-tip": "Recolher menu", html: icon("chevronL"), onclick: toggleSidebar }),
        search,
        el("div.topbar-spacer"),
        el("div.docket-status", {}, [el("i"), el("span", { text: "Plantão ativo" })]),
        crumbs,
        el("div.topbar-spacer"),
        themeBtn,
        el("button.icon-btn", { "data-tip": "Notificações", html: icon("bell") + (prefs.get("notifRead") ? "" : "<span class='dot'></span>"), onclick: (e) => { e.currentTarget.querySelector(".dot")?.remove(); prefs.set("notifRead", true); toast("Sem novas notificações", { type: "info", title: "Notificações" }); } }),
        el("button.icon-btn", { "data-tip": "Novo caso", html: icon("plus"), onclick: () => location.hash = "#/casos?new=1" }),
        el("div.userchip", { onclick: () => navigate("config") }, [
            el("div.avatar.sm", { text: "AM" }),
            el("div.who", {}, [el("b", { text: "A. Marques" }), el("span", { text: "Administrador" })]),
        ]),
    ]);

    const view = el("main.view", { id: "view" });
    const scrim = el("div.sb-scrim", { onclick: () => app.classList.remove("sb-open") });
    const main = el("div.main", {}, [topbar, view]);
    app.append(sidebar, main, scrim);
    return { app, view };
}

function toggleSidebar() {
    const app = $("#shell");
    if (innerWidth <= 900) { app.classList.toggle("sb-open"); return; }
    const c = !prefs.get("sidebarCollapsed");
    prefs.set("sidebarCollapsed", c);
    app.classList.toggle("sb-collapsed", c);
}

function onNavigate(route, params, path) {
    Object.entries(navEls).forEach(([r, node]) => node.classList.toggle("active", r === route.nav));
    const crumbs = $("#crumbs"); clear(crumbs);
    crumbs.append(el("span", { text: "Central" }), el("span.sep", { text: "/" }), el("b", { text: route.title }));
    recordView("#/" + path, route.title);
    $("#shell")?.classList.remove("sb-open");
}

async function refreshBadges() {
    const [cases, ev, people] = await Promise.all([all("cases"), all("evidence"), all("people")]);
    const open = cases.filter(c => !["Arquivado", "Resolvido"].includes(c.status)).length;
    setBadge("casos", open); setBadge("evidencias", ev.length); setBadge("pessoas", people.length);
}
function setBadge(route, n) { const b = $("#badge-" + route); if (b) b.textContent = n; }

async function openPalette() {
    const [cases, people] = await Promise.all([all("cases"), all("people")]);
    const cmds = [
        ...NAV.filter(n => n.route).map(n => ({ group: "Navegação", title: n.label, icon: n.icon, action: () => navigate(n.route) })),
        { group: "Ações", title: "Novo caso", icon: "plus", action: () => location.hash = "#/casos?new=1" },
        { group: "Ações", title: "Alternar tema", icon: "sun", action: () => { toggleTheme(); $(".topbar .icon-btn[data-tip='Alternar tema']").innerHTML = icon(prefs.get("theme") === "dark" ? "sun" : "moon"); } },
        ...cases.map(c => ({ group: "Casos", title: c.title, sub: c.code + " · " + c.city, icon: "folder", hint: c.status, action: () => navigate("casos/" + c.id) })),
        ...people.map(p => ({ group: "Pessoas", title: p.name, sub: p.profession || "", icon: "user", action: () => navigate("pessoas/" + p.id) })),
    ];
    commandPalette(cmds);
}

function initShortcuts() {
    document.addEventListener("keydown", (e) => {
        const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openPalette(); return; }
        if (typing) return;
        if (e.key === "/") { e.preventDefault(); openPalette(); }
        if (e.key === "g") { window._g = true; setTimeout(() => window._g = false, 700); return; }
        if (window._g) {
            const map = { d: "painel", c: "casos", e: "evidencias", p: "pessoas", t: "timeline", k: "kanban", m: "mural", u: "usuarios", s: "config" };
            if (map[e.key]) { navigate(map[e.key]); window._g = false; }
        }
    });
}

async function boot() {
    applyTheme();
    await openDB();
    await ensureSeed();
    const { app, view } = buildShell();
    const root = $("#app"); clear(root); root.appendChild(app);
    defineRoutes(ROUTES);
    startRouter(view, onNavigate);
    initTooltips(); initShortcuts();
    await refreshBadges();
    window.addEventListener("data:changed", refreshBadges);
    window.__nav = navigate;
}

boot();
