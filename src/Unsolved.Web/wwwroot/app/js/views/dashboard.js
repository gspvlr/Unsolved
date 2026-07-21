import { el, clear, fmtDate, timeAgo } from "../dom.js";
import { icon } from "../icons.js";
import { all } from "../db.js";
import { navigate } from "../router.js";
import { STAGES, TERMINAL, stageBadge, stageVar, prioBadge, isTerminal } from "../models.js";
import { pageHead, kpiCard, sparkline, avatarChip, bars, donut } from "../widgets.js";
import { skeleton, toast } from "../ui.js";
import { evidencePhoto, personPortrait } from "../media.js";
import { canCreateCase, canManageUsers, visibleCases, visibleEvidence, visibleEvents, visiblePeople } from "../auth.js";

export default async function renderDashboard(container) {
    container.appendChild(pageHead("Central de investigação", "Casos, evidências e movimentações que exigem atenção", [
        canCreateCase() ? el("button.btn.primary", { html: icon("plus") + "Novo caso", onclick: () => location.hash = "#/casos?new=1" }) : null,
    ]));
    const skel = skeleton("kpis", 6); container.appendChild(skel);

    const [rawCases, rawEvidence, rawPeople, rawEvents, users] = await Promise.all(
        ["cases", "evidence", "people", "events", "users"].map(all));
    const cases = visibleCases(rawCases);
    const evidence = visibleEvidence(rawEvidence);
    const people = visiblePeople(rawPeople, rawCases);
    const events = visibleEvents(rawEvents);
    skel.remove();

    const open = cases.filter(c => !isTerminal(c.status));
    const solved = cases.filter(c => c.status === "Resolvido");
    const critical = cases.filter(c => c.priority === "Crítica" && !isTerminal(c.status));
    const latestEvent = events.slice().sort((a, b) => new Date(b.at) - new Date(a.at))[0];

    container.appendChild(el("section.briefing-strip", { "aria-label": "Resumo do plantão" }, [
        el("div.briefing-index", {}, [
            el("span", { text: "Dossiê diário" }),
            el("b.mono", { text: new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase() }),
        ]),
        el("div.briefing-copy", {}, [
            el("span", { text: "Situação operacional" }),
            el("strong", { text: `${open.length} frentes de investigação em andamento` }),
            el("p", { text: critical.length ? `${critical.length} casos críticos pedem revisão prioritária.` : "Nenhum caso crítico aguarda revisão." }),
        ]),
        el("div.briefing-last", {}, [
            el("span", { text: "Último registro" }),
            el("b", { text: latestEvent?.title || "Sem movimentações" }),
            el("small.mono", { text: latestEvent ? timeAgo(latestEvent.at) : "—" }),
        ]),
        el("span.classified-stamp", { text: "Uso interno" }),
    ]));

    // ---- KPIs ----
    const kpis = el("div.kpis");
    const K = [
        { icon: "folder", label: "Casos catalogados", value: cases.length, foot: [el("span.muted", { text: "arquivo geral" })], route: "casos" },
        { icon: "flame", label: "Em andamento", value: open.length, accent: "var(--warning)", foot: [el("span.muted", { text: `${critical.length} críticos` })], route: "kanban" },
        { icon: "check", label: "Resolvidos", value: solved.length, accent: "var(--success)", foot: [el("span.muted", { text: "taxa " + Math.round(solved.length / Math.max(cases.length, 1) * 100) + "%" })], route: "casos" },
        { icon: "box", label: "Evidências", value: evidence.length, accent: "var(--accent-2)", foot: [el("span.muted", { text: "sob custódia" })], route: "evidencias" },
        { icon: "users", label: "Pessoas vinculadas", value: people.length, accent: "var(--accent-3)", foot: [el("span.muted", { text: "registros ativos" })], route: "pessoas" },
        { icon: "shield", label: "Investigadores", value: users.length, foot: [el("span.muted", { text: "equipe autorizada" })], route: canManageUsers() ? "usuarios" : null },
    ];
    for (const k of K) { const c = kpiCard(k); if (k.route) c.onclick = () => navigate(k.route); kpis.appendChild(c); }
    container.appendChild(kpis);

    // ---- Grid principal ----
    const dash = el("div.dash", { style: { marginTop: "18px" } });

    // Distribuição por estágio (donut + legenda) — clicável p/ kanban
    const stageCounts = STAGES.map(s => ({ label: s, value: cases.filter(c => c.status === s).length, color: stageVar(s) })).filter(s => s.value);
    dash.appendChild(card("col-4", "Distribuição por estágio", "kanban", "kanban", el("div", { style: { display: "flex", gap: "18px", alignItems: "center" } }, [
        el("div", { style: { position: "relative", display: "grid", placeItems: "center" } }, [
            donut(stageCounts, 130),
            el("div", { style: { position: "absolute", textAlign: "center" } }, [el("div", { style: { fontSize: "1.6rem", fontWeight: "800" } , text: String(cases.length) }), el("div.muted", { style: { fontSize: ".72rem" }, text: "casos" })]),
        ]),
        el("div.grid", { style: { gap: "8px", flex: "1" } }, stageCounts.map(s => el("div", { style: { display: "flex", alignItems: "center", gap: "8px", fontSize: ".82rem" } }, [
            el("span", { style: { width: "10px", height: "10px", borderRadius: "3px", background: s.color } }), el("span", { text: s.label }), el("b", { style: { marginLeft: "auto" }, text: String(s.value) }),
        ]))),
    ])));

    // Casos críticos
    const critList = el("div.mini-list");
    (critical.length ? critical : cases.slice(0, 4)).slice(0, 5).forEach(c => {
        critList.appendChild(el("div.mini-row", { onclick: () => navigate("casos/" + c.id) }, [
            el("div.avatar.sm", { html: icon("flame"), style: { background: "color-mix(in srgb, var(--danger) 24%, transparent)", color: "var(--danger)" } }),
            el("div.m-main", {}, [el("b", { text: c.title }), el("span", { text: c.code + " · " + c.city })]),
            el("div.m-side", {}, [prioBadge(c.priority)]),
        ]));
    });
    dash.appendChild(card("col-4", "Casos críticos", "flame", "casos", critical.length ? critList : emptyMini("Nenhum caso crítico em aberto")));

    // Ranking investigadores
    const rank = users.map(u => ({ u, resolved: cases.filter(c => c.leadId === u.id && c.status === "Resolvido").length, active: cases.filter(c => c.leadId === u.id && !isTerminal(c.status)).length }))
        .sort((a, b) => (b.resolved * 3 + b.u.productivity) - (a.resolved * 3 + a.u.productivity)).slice(0, 5);
    const rankEl = el("div", {}, rank.map((r, i) => el("div.rank-row" + (i < 3 ? ".top" + (i + 1) : ""), { onclick: canManageUsers() ? () => navigate("usuarios") : null, style: { cursor: canManageUsers() ? "pointer" : "default" } }, [
        el("div.pos", { text: "#" + (i + 1) }),
        avatarChip(r.u.name, "sm"),
        el("div", { style: { minWidth: 0, flex: "1" } }, [el("b", { style: { fontSize: ".85rem", display: "block" }, text: r.u.name }), el("span.muted", { style: { fontSize: ".74rem" }, text: r.u.specialty })]),
        el("div", { style: { textAlign: "right", fontSize: ".8rem" } }, [el("b", { text: r.resolved + " ✓" }), el("div.muted", { style: { fontSize: ".72rem" }, text: r.active + " ativos" })]),
    ])));
    dash.appendChild(card("col-4", "Ranking de investigadores", "trending", canManageUsers() ? "usuarios" : null, rankEl));

    // Atividade recente (timeline) — col-6
    const feed = el("div");
    events.slice().sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 7).forEach(e => {
        feed.appendChild(el("div.feed-line", { onclick: () => e.caseId && navigate("casos/" + e.caseId), style: { cursor: "pointer" } }, [
            el("div.fl-dot", { style: { background: e.kind === "evidence" ? "var(--accent-2)" : e.kind === "stage" ? "var(--accent-3)" : "var(--accent)" } }),
            el("div.fl-body", {}, [el("b", { text: e.title }), el("time", { text: timeAgo(e.at) })]),
        ]));
    });
    dash.appendChild(card("col-6", "Atividade recente", "activity", "timeline", feed));

    // Kanban resumido (bars) — col-6
    dash.appendChild(card("col-6", "Kanban resumido", "kanban", "kanban",
        bars(STAGES.filter(s => !TERMINAL.includes(s)).map(s => ({ label: s, value: cases.filter(c => c.status === s).length, color: stageVar(s) })))));

    // Evidências recentes — col-6
    const evList = el("div.mini-list");
    evidence.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5).forEach(e => {
        evList.appendChild(el("div.mini-row", { onclick: () => navigate("evidencias?focus=" + e.id) }, [
            evidencePhoto(e, "dashboard-evidence-thumb"),
            el("div.m-main", {}, [el("b", { text: e.title }), el("span", { text: e.code + " · " + e.type })]),
            el("div.m-side", { text: fmtDate(e.date) }),
        ]));
    });
    dash.appendChild(card("col-6", "Evidências recentes", "box", "evidencias", evList));

    // Pessoas recentes — col-6
    const pplList = el("div.mini-list");
    people.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5).forEach(p => {
        pplList.appendChild(el("div.mini-row", { onclick: () => navigate("pessoas/" + p.id) }, [
            personPortrait(p, "mini-person-photo"),
            el("div.m-main", {}, [el("b", { text: p.name }), el("span", { text: p.profession || "—" })]),
            el("div.m-side", { text: p.city || "" }),
        ]));
    });
    dash.appendChild(card("col-6", "Pessoas recentes", "users", "pessoas", pplList));

    container.appendChild(dash);
}

function card(col, title, ic, route, content) {
    return el("div.card.glow." + col, {}, [
        el("div.card-head", {}, [el("span", { html: icon(ic), style: { color: "var(--accent)" } }), el("h2", { text: title }), route ? el("span.link", { text: "ver tudo", onclick: () => navigate(route) }) : null]),
        content,
    ]);
}
function emptyMini(text) { return el("div.muted", { style: { padding: "20px 4px", fontSize: ".85rem" }, text }); }
