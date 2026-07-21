import { el, clear, fmtDate, debounce } from "../dom.js";
import { icon } from "../icons.js";
import { all } from "../db.js";
import { navigate } from "../router.js";
import { STAGES, TERMINAL, stageVar, prioClass, PRIORITIES } from "../models.js";
import { pageHead, avatarChip } from "../widgets.js";
import { toast, attachContextMenu } from "../ui.js";
import { getFilter, setFilter, kanbanState, setColCollapsed, setColOrder } from "../store.js";
import { moveStage, caseMenu, openCaseModal } from "./cases.js";
import { portraitStack } from "../media.js";
import { canCreateCase, canEditCase, isViewer, visibleCases, visibleEvidence, visiblePeople } from "../auth.js";

let users = [], people = [], evidence = [];
const userName = (id) => users.find(u => u.id === id)?.name || "";

export default async function renderKanban(container) {
    clear(container);
    container.appendChild(pageHead("Kanban", isViewer() ? "Acompanhe a distribuição dos casos em modo somente leitura" : "Arraste os casos autorizados entre estágios — tudo salvo automaticamente", [
        canCreateCase() ? el("button.btn.primary", { html: icon("plus") + "Novo caso", onclick: () => openCaseModal(null, { onSaved: reload, navigateAfterSave: false }) }) : null,
    ]));

    const f = getFilter("kanban", { q: "", prio: "all", lead: "all" });
    const board = el("div.kanban-system");
    let cases, rawCases;
    const [loadedCases, loadedUsers, loadedPeople, loadedEvidence] = await Promise.all([all("cases"), all("users"), all("people"), all("evidence")]);
    rawCases = loadedCases; cases = visibleCases(rawCases); users = loadedUsers; people = visiblePeople(loadedPeople, rawCases); evidence = visibleEvidence(loadedEvidence);
    container.appendChild(toolbar(f, users, () => paint()));
    const wrap = el("div.kanban-wrap", {}, [board]);
    container.appendChild(wrap);

    function visible() {
        return cases.filter(c => {
            if (f.prio !== "all" && c.priority !== f.prio) return false;
            if (f.lead !== "all" && c.leadId !== f.lead) return false;
            if (f.q && !(`${c.code} ${c.title} ${c.city}`.toLowerCase().includes(f.q.toLowerCase()))) return false;
            return true;
        });
    }

    function paint() {
        clear(board);
        const st = kanbanState();
        const collapsed = new Set(st.collapsedCols || []);
        const list = visible();
        const activeBoard = el("div.kanban.kanban-active");
        const archiveGrid = el("div.kanban.kanban-archive-grid");
        const activeStages = STAGES.filter(stage => !TERMINAL.includes(stage));
        const archiveStages = STAGES.filter(stage => TERMINAL.includes(stage));

        function addColumn(target, stage, archived = false) {
            let items = list.filter(c => c.status === stage);
            const order = st.order?.[stage];
            if (order) items.sort((a, b) => { const ia = order.indexOf(a.id), ib = order.indexOf(b.id); return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib); });
            const isCol = collapsed.has(stage);
            const col = el("div.kcol" + (isCol ? ".collapsed" : "") + (archived ? ".archive-col" : ""), { dataset: { status: stage } });
            const head = el("div.kcol-head", {}, [
                el("span.kdot", { style: { background: stageVar(stage) } }),
                el("b", { text: stage }),
                el("span.kcount", { text: String(items.length) }),
                el("button.kcol-toggle", { html: icon(isCol ? "chevronR" : "chevronL"), onclick: () => { setColCollapsed(stage, !isCol); paint(); } }),
            ]);
            col.appendChild(head);
            const bodyEl = el("div.kcol-body", { dataset: { drop: stage } });
            items.forEach(c => bodyEl.appendChild(kcard(c)));
            bodyEl.appendChild(el("div.kcol-drophint", { text: "Solte aqui", style: { display: "none" } }));
            col.appendChild(bodyEl);
            if (canCreateCase()) col.appendChild(el("div.kcol-add", {}, [el("button.btn.sm.ghost", { style: { width: "100%" }, html: icon("plus") + "Adicionar", onclick: () => openCaseModal(null, { defaults: { status: stage, priority: "Média", type: "Homicídio" }, onSaved: reload, navigateAfterSave: false }) })]));
            if (!isViewer()) enableDrop(bodyEl, stage);
            target.appendChild(col);
        }

        activeStages.forEach(stage => addColumn(activeBoard, stage));
        archiveStages.forEach(stage => addColumn(archiveGrid, stage, true));
        board.append(
            el("div.kanban-section-head", {}, [
                el("div", {}, [el("span.record-label", { text: "FLUXO OPERACIONAL" }), el("b", { text: "Casos em andamento" })]),
                el("small", { text: `${list.filter(c => !TERMINAL.includes(c.status)).length} casos distribuídos em ${activeStages.length} etapas` }),
            ]),
            activeBoard,
            el("section.kanban-archive", {}, [
                el("div.kanban-section-head", {}, [el("div", {}, [el("span.record-label", { text: "ARQUIVO FINAL" }), el("b", { text: "Encerrados" })]), el("small", { text: "Casos resolvidos ou arquivados permanecem acessíveis sem ocupar o fluxo ativo." })]),
                archiveGrid,
            ]),
        );
    }
    paint();

    async function reload() { rawCases = await all("cases"); cases = visibleCases(rawCases); paint(); }
    window.__kanbanReload = reload;

    function kcard(c) {
        const linkedPeople = (c.people || []).map(link => people.find(person => person.id === link.personId)).filter(Boolean);
        const evidenceCount = evidence.filter(item => item.caseId === c.id).length;
        const writable = canEditCase(c);
        const card = el("div.kcard", { draggable: writable ? "true" : "false", dataset: { id: c.id }, onclick: () => navigate("casos/" + c.id) }, [
            el("span.kc-prio", { style: { background: `var(--pr-${prioClass(c.priority).slice(5)})` } }),
            el("span.kc-code", { text: c.code }),
            el("h4", { text: c.title }),
            el("div.kc-tags", {}, [el("span.tag", { text: c.type }), c.priority === "Crítica" ? el("span.badge.b-triagem", { style: { fontSize: ".64rem" }, html: icon("flame") + "Crítico" }) : null]),
            el("div.kc-links", {}, [
                portraitStack(linkedPeople, 3, "kanban-portrait-stack"),
                el("span", { html: icon("users") + `${linkedPeople.length}` }),
                el("span", { html: icon("box") + `${evidenceCount}` }),
                el("button", { "data-tip": "Abrir mural do caso", html: icon("share"), onclick: ev => { ev.stopPropagation(); navigate("mural?case=" + c.id); } }),
            ]),
            el("div.kc-foot", {}, [
                avatarChip(userName(c.leadId), "sm"),
                el("span", { text: c.city }),
                el("span.right", {}, [el("span", { html: icon("clock") }), fmtDate(c.updatedAt)]),
            ]),
        ]);
        if (writable) {
            card.addEventListener("dragstart", (e) => { card.classList.add("dragging"); e.dataTransfer.setData("text/plain", c.id); e.dataTransfer.effectAllowed = "move"; });
            card.addEventListener("dragend", () => card.classList.remove("dragging"));
        }
        attachContextMenu(card, () => caseMenu(c, { onChanged: reload }));
        return card;
    }

    function enableDrop(zone, stage) {
        zone.addEventListener("dragover", (e) => { e.preventDefault(); zone.closest(".kcol").classList.add("drop-active"); const after = cardAfter(zone, e.clientY); const dragging = board.querySelector(".dragging"); if (!dragging) return; if (after) zone.insertBefore(dragging, after); else zone.insertBefore(dragging, zone.querySelector(".kcol-drophint")); });
        zone.addEventListener("dragleave", () => zone.closest(".kcol").classList.remove("drop-active"));
        zone.addEventListener("drop", async (e) => {
            e.preventDefault(); zone.closest(".kcol").classList.remove("drop-active");
            const id = e.dataTransfer.getData("text/plain");
            const ids = Array.from(zone.querySelectorAll(".kcard")).map(n => n.dataset.id);
            setColOrder(stage, ids);
            const c = cases.find(x => x.id === id);
            if (c && canEditCase(c) && c.status !== stage) { await moveStage(id, stage, true); c.status = stage; toast(`${c.code} → ${stage}`, { type: "info", title: "Estágio atualizado" }); }
            paint();
        });
    }
    function cardAfter(zone, y) {
        const els = [...zone.querySelectorAll(".kcard:not(.dragging)")];
        return els.reduce((closest, child) => { const box = child.getBoundingClientRect(); const off = y - box.top - box.height / 2; return off < 0 && off > closest.offset ? { offset: off, el: child } : closest; }, { offset: -Infinity }).el;
    }
}

function toolbar(f, users, onChange) {
    const save = (p) => { Object.assign(f, p); setFilter("kanban", f); onChange(); };
    const search = el("div.searchbar", { style: { maxWidth: "280px" } }, [el("span", { html: icon("search") }), el("input", { placeholder: "Buscar casos…", value: f.q, oninput: debounce(e => save({ q: e.target.value }), 180) })]);
    const prio = el("select.input", { style: { width: "auto" }, onchange: e => save({ prio: e.target.value }) }, [el("option", { value: "all", text: "Prioridade" }), ...PRIORITIES.map(p => el("option", { value: p, text: p, selected: f.prio === p }))]);
    const lead = el("select.input", { style: { width: "auto" }, onchange: e => save({ lead: e.target.value }) }, [el("option", { value: "all", text: "Responsável" }), ...users.map(u => el("option", { value: u.id, text: u.name, selected: f.lead === u.id }))]);
    return el("div.toolbar", {}, [search, el("div.grow"), prio, lead]);
}
