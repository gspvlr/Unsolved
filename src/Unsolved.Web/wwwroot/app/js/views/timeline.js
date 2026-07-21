import { el, clear, fmtDateTime, debounce } from "../dom.js";
import { icon } from "../icons.js";
import { all } from "../db.js";
import { navigate } from "../router.js";
import { pageHead } from "../widgets.js";
import { skeleton, emptyState } from "../ui.js";
import { getFilter, setFilter } from "../store.js";

const KIND_ICON = { case: "folder", stage: "arrowR", evidence: "box", note: "chat", person: "user" };
const KIND_LABEL = { case: "Caso", stage: "Movimentação", evidence: "Evidência", note: "Anotação", person: "Pessoa" };

export default async function renderTimeline(container) {
    clear(container);
    container.appendChild(pageHead("Linha do tempo", "Todos os eventos da operação em ordem cronológica"));

    const f = getFilter("timeline", { q: "", kind: "all", zoom: "month" });
    const body = el("div");
    container.appendChild(toolbar(f, () => paint()));
    container.appendChild(body);
    body.appendChild(skeleton("lines", 8));

    const [events, cases] = await Promise.all([all("events"), all("cases")]);
    // enriquece com movimentações de casos
    cases.forEach(c => (c.activity || []).forEach(a => events.push({ id: a.id, at: a.at, kind: a.kind === "open" ? "case" : a.kind, caseId: c.id, title: `${c.code}: ${a.text}`, text: a.text })));
    clear(body);
    const caseTitle = (id) => cases.find(c => c.id === id)?.title || "";

    function paint() {
        clear(body);
        let list = events.filter(e => {
            if (f.kind !== "all" && e.kind !== f.kind) return false;
            if (f.q && !(`${e.title} ${e.text}`.toLowerCase().includes(f.q.toLowerCase()))) return false;
            return true;
        }).sort((a, b) => new Date(b.at) - new Date(a.at));
        if (!list.length) { body.appendChild(emptyState({ icon: "timeline", title: "Nenhum evento" })); return; }

        // agrupa por período conforme zoom
        const groups = new Map();
        for (const e of list) {
            const d = new Date(e.at);
            const key = f.zoom === "day" ? d.toLocaleDateString("pt-BR")
                : f.zoom === "week" ? weekLabel(d)
                : f.zoom === "year" ? String(d.getFullYear())
                : d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
            (groups.get(key) || groups.set(key, []).get(key)).push(e);
        }
        const tl = el("div.tl");
        for (const [label, evs] of groups) {
            tl.appendChild(el("div.tl-group-label", { text: label[0].toUpperCase() + label.slice(1) }));
            evs.forEach(e => {
                const card = el("div.card.pad-sm.tl-card", {}, [
                    el("div.tl-head", {}, [
                        el("span.badge", { style: { fontSize: ".66rem" }, text: KIND_LABEL[e.kind] || "Evento" }),
                        el("b", { style: { fontSize: ".9rem" }, text: e.title }),
                        el("time", { text: fmtDateTime(e.at) }),
                    ]),
                    el("div.tl-detail", {}, [
                        el("p", { style: { margin: "0 0 8px" }, text: e.text || "" }),
                        el("div", { style: { display: "flex", gap: "7px", flexWrap: "wrap" } }, [
                            e.caseId ? el("button.btn.sm", { html: icon("arrowR") + "Abrir caso", onclick: (ev) => { ev.stopPropagation(); navigate("casos/" + e.caseId); } }) : null,
                            e.caseId ? el("button.btn.sm.ghost", { html: icon("share") + "Ver mural", onclick: (ev) => { ev.stopPropagation(); navigate("mural?case=" + e.caseId); } }) : null,
                            e.evidenceId ? el("button.btn.sm.ghost", { html: icon("box") + "Evidência", onclick: (ev) => { ev.stopPropagation(); navigate("evidencias?focus=" + e.evidenceId); } }) : null,
                        ]),
                    ]),
                ]);
                card.addEventListener("click", () => card.classList.toggle("open"));
                tl.appendChild(el("div.tl-event", {}, [el("div.tl-node", { html: icon(KIND_ICON[e.kind] || "activity") }), card]));
            });
        }
        body.appendChild(tl);
    }
    paint();
}

function toolbar(f, onChange) {
    const save = (p) => { Object.assign(f, p); setFilter("timeline", f); onChange(); };
    const search = el("div.searchbar", { style: { maxWidth: "300px" } }, [el("span", { html: icon("search") }), el("input", { placeholder: "Buscar eventos…", value: f.q, oninput: debounce(e => save({ q: e.target.value }), 180) })]);
    const kinds = el("div", { style: { display: "flex", gap: "6px", flexWrap: "wrap" } }, [["all", "Tudo"], ["case", "Casos"], ["stage", "Movimentações"], ["evidence", "Evidências"], ["note", "Anotações"]].map(([v, l]) => el("button.chip" + (f.kind === v ? ".active" : ""), { text: l, onclick: () => save({ kind: v }) })));
    const zoom = el("div.seg", {}, [["day", "Dia"], ["week", "Semana"], ["month", "Mês"], ["year", "Ano"]].map(([v, l]) => el("button" + (f.zoom === v ? ".active" : ""), { text: l, onclick: () => save({ zoom: v }) })));
    return el("div.toolbar", {}, [search, kinds, el("div.grow"), zoom]);
}

function weekLabel(d) {
    const onejan = new Date(d.getFullYear(), 0, 1);
    const week = Math.ceil((((d - onejan) / 86400000) + onejan.getDay() + 1) / 7);
    return `Semana ${week} · ${d.getFullYear()}`;
}
