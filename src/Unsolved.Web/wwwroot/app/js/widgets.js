// Widgets reutilizáveis (page head, KPI, sparkline, avatar, contador animado).
import { el, initials } from "./dom.js";
import { icon } from "./icons.js";

export function pageHead(title, sub, actions = []) {
    return el("div.page-head", {}, [
        el("div", {}, [
            el("div.page-kicker", { text: "Arquivo de investigação · acesso restrito" }),
            el("h1", { text: title }),
            sub ? el("div.sub", { text: sub }) : null,
        ]),
        actions.length ? el("div.actions", {}, actions) : null,
    ]);
}

export function kpiCard({ icon: ic = "activity", label, value, foot, spark, accent }) {
    const num = el("div.kpi-num", { text: "0" });
    const card = el("div.card.kpi.clickable.glow", {}, [
        el("div.kpi-top", {}, [
            el("div.kpi-ico", { html: icon(ic), style: accent ? { background: `color-mix(in srgb, ${accent} 16%, transparent)`, color: accent } : {} }),
            el("div", {}, [el("div.kpi-label", { text: label })]),
        ]),
        num,
        foot ? el("div.kpi-foot", {}, foot) : null,
        spark ? sparkline(spark, accent) : null,
    ]);
    animateCount(num, value);
    return card;
}

export function animateCount(node, target, dur = 900) {
    target = Number(target) || 0;
    if (document.hidden || matchMedia("(prefers-reduced-motion: reduce)").matches) { node.textContent = target; return; }
    const start = performance.now();
    let done = false;
    function tick(now) {
        const p = Math.max(0, Math.min((now - start) / dur, 1));
        node.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick); else done = true;
    }
    requestAnimationFrame(tick);
    // fallback: garante o valor final mesmo se o rAF for suspenso (aba oculta)
    setTimeout(() => { if (!done) node.textContent = target; }, dur + 400);
}

export function sparkline(values, color) {
    const w = 200, h = 34, max = Math.max(...values, 1), min = Math.min(...values, 0);
    const range = max - min || 1;
    const pts = values.map((v, i) => [i / (values.length - 1) * w, h - ((v - min) / range) * (h - 4) - 2]);
    const d = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
    const area = d + ` L${w} ${h} L0 ${h} Z`;
    const c = color || "var(--accent)";
    const id = "g" + Math.random().toString(36).slice(2, 7);
    return el("svg.spark", { viewBox: `0 0 ${w} ${h}`, preserveAspectRatio: "none", html:
        `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c}" stop-opacity=".35"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></linearGradient></defs>
         <path d="${area}" fill="url(#${id})"/><path d="${d}" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>` });
}

export function avatarChip(nameOrUser, size = "sm") {
    const name = typeof nameOrUser === "string" ? nameOrUser : (nameOrUser?.name || "—");
    return el("div.avatar." + size, { text: initials(name), "data-tip": name });
}

export function donut(segments, size = 120) {
    // segments: [{value, color, label}]
    const total = segments.reduce((s, x) => s + x.value, 0) || 1;
    let acc = 0, r = 52, cx = 60, cy = 60, circ = 2 * Math.PI * r;
    const rings = segments.map(s => {
        const len = (s.value / total) * circ;
        const seg = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${s.color}" stroke-width="14" stroke-dasharray="${len} ${circ - len}" stroke-dashoffset="${-acc}" transform="rotate(-90 ${cx} ${cy})" stroke-linecap="butt"/>`;
        acc += len; return seg;
    }).join("");
    return el("svg", { viewBox: "0 0 120 120", width: size, height: size, html: `<circle cx="60" cy="60" r="52" fill="none" stroke="var(--surface-3)" stroke-width="14"/>${rings}` });
}

export function bars(data, color = "var(--accent)") {
    // data: [{label, value}]
    const max = Math.max(...data.map(d => d.value), 1);
    return el("div.grid", { style: { gap: "10px" } }, data.map(d => el("div", {}, [
        el("div", { style: { display: "flex", justifyContent: "space-between", fontSize: ".78rem", marginBottom: "4px" } }, [
            el("span.muted", { text: d.label }), el("b", { text: String(d.value) }),
        ]),
        el("div.bar", {}, [el("span", { style: { width: (d.value / max * 100) + "%", background: d.color || color } })]),
    ])));
}
