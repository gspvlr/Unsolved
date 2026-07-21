// Roteador por hash (#/rota/param). Back/forward do navegador funcionam de
// graça; a rota sobrevive ao F5. Transições suaves entre páginas.
import { clear, el } from "./dom.js";

let routes = [];
let mountEl, onNavigate;
let current = null;

export function defineRoutes(list) {
    // list: [{ path:"casos/:id", title, nav, render(container, params) }]
    routes = list.map(r => ({ ...r, segs: r.path.split("/") }));
}

function match(hash) {
    const path = hash.replace(/^#\/?/, "").split("?")[0];
    const parts = path === "" ? ["painel"] : path.split("/");
    for (const r of routes) {
        if (r.segs.length !== parts.length) continue;
        const params = {};
        let ok = true;
        for (let i = 0; i < r.segs.length; i++) {
            if (r.segs[i].startsWith(":")) params[r.segs[i].slice(1)] = decodeURIComponent(parts[i]);
            else if (r.segs[i] !== parts[i]) { ok = false; break; }
        }
        if (ok) return { route: r, params, path };
    }
    return { route: routes[0], params: {}, path: "painel" };
}

async function handle() {
    const { route, params, path } = match(location.hash);
    current = { route, params, path };
    const container = el("div.view-inner.page-enter");
    clear(mountEl);
    mountEl.appendChild(container);
    mountEl.scrollTop = 0;
    onNavigate?.(route, params, path);
    try {
        await route.render(container, params);
    } catch (err) {
        console.error(err);
        container.innerHTML = "";
        const { errorState } = await import("./ui.js");
        container.appendChild(errorState(() => handle()));
    }
}

export function startRouter(mount, navCb) {
    mountEl = mount; onNavigate = navCb;
    window.addEventListener("hashchange", handle);
    handle();
}

export function navigate(route) {
    if (location.hash === "#/" + route) handle();
    else location.hash = "#/" + route;
}
export const currentRoute = () => current;
