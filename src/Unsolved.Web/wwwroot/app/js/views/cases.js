import { el, clear, fmtDate, fmtDateTime, timeAgo, uid, debounce, initials } from "../dom.js";
import { icon } from "../icons.js";
import { all, get, put, del } from "../db.js";
import { navigate } from "../router.js";
import { STAGES, TERMINAL, CASE_TYPES, PRIORITIES, PERSON_ROLES, isTerminal, stageBadge, stageClass, stageVar, prioBadge, prioClass, progressFor } from "../models.js";
import { pageHead, avatarChip } from "../widgets.js";
import { skeleton, emptyState, toast, modal, confirmDialog, attachContextMenu, contextMenu } from "../ui.js";
import { getFilter, setFilter } from "../store.js";
import { evidencePhoto, personPortrait, portraitStack } from "../media.js";
import { openPersonModal } from "./people.js";
import { openEvModal } from "./evidence.js";
import { canCreateCase, canEditCase, canViewCase, isAdmin, visibleCases } from "../auth.js";

let usersCache = [];
const userName = (id) => usersCache.find(u => u.id === id)?.name || "—";

/* ============================ LISTA ============================ */
export async function renderCases(container) {
    clear(container);
    container.appendChild(pageHead("Casos", "Gerencie investigações de ponta a ponta", [
        el("button.btn", { html: icon("kanban") + "Kanban", onclick: () => navigate("kanban") }),
        canCreateCase() ? el("button.btn.primary", { html: icon("plus") + "Novo caso", onclick: () => openCaseModal() }) : null,
    ]));

    const f = getFilter("cases", { q: "", status: "all", prio: "all", view: "grid", sort: "recent" });
    const body = el("div"); container.appendChild(buildToolbar(f, () => paint()));
    container.appendChild(body);
    const skel = skeleton("cards", 6); body.appendChild(skel);

    const [rawCases, ev, people] = await Promise.all([all("cases"), all("evidence"), all("people")]);
    const cases = visibleCases(rawCases);
    usersCache = await all("users");
    skel.remove();

    function paint() {
        clear(body);
        let list = cases.filter(c => {
            if (f.status !== "all" && c.status !== f.status) return false;
            if (f.prio !== "all" && c.priority !== f.prio) return false;
            if (f.q && !(`${c.code} ${c.title} ${c.city} ${c.description} ${c.type}`.toLowerCase().includes(f.q.toLowerCase()))) return false;
            return true;
        });
        list.sort((a, b) => f.sort === "recent" ? new Date(b.updatedAt) - new Date(a.updatedAt)
            : f.sort === "old" ? new Date(a.openedAt) - new Date(b.openedAt)
            : f.sort === "prio" ? PRIORITIES.indexOf(b.priority) - PRIORITIES.indexOf(a.priority)
            : a.title.localeCompare(b.title));

        if (!list.length) { body.appendChild(emptyState({ icon: "folder", title: "Nenhum caso encontrado", text: "Ajuste os filtros aplicados.", action: canCreateCase() ? { label: "Novo caso", icon: "plus", onClick: () => openCaseModal() } : null })); return; }

        const count = (id) => {
            const current = cases.find(c => c.id === id);
            return {
                ev: ev.filter(e => e.caseId === id),
                people: (current?.people || []).map(link => people.find(p => p.id === link.personId)).filter(Boolean),
            };
        };
        if (f.view === "grid") {
            const grid = el("div.entity-grid");
            list.forEach(c => grid.appendChild(caseCard(c, count(c.id))));
            body.appendChild(grid);
        } else {
            body.appendChild(caseTable(list, count));
        }
    }
    paint();

    // reabre modal se veio de "?new=1"
    if (location.hash.includes("new=1")) { history.replaceState(null, "", "#/casos"); if (canCreateCase()) openCaseModal(); }
}

function buildToolbar(f, onChange) {
    const save = (patch) => { Object.assign(f, patch); setFilter("cases", f); onChange(); };
    const search = el("div.searchbar", { style: { maxWidth: "320px" } }, [
        el("span", { html: icon("search") }),
        el("input", { placeholder: "Buscar casos…", value: f.q, oninput: debounce((e) => save({ q: e.target.value }), 200) }),
    ]);
    const statusChips = el("div", { style: { display: "flex", gap: "6px", flexWrap: "wrap" } },
        [["all", "Todos"], ...STAGES.map(s => [s, s])].map(([v, l]) =>
            el("button.chip" + (f.status === v ? ".active" : ""), { text: l, onclick: () => save({ status: v }) })));
    const prioSel = el("select.input", { style: { width: "auto" }, onchange: (e) => save({ prio: e.target.value }) },
        [el("option", { value: "all", text: "Prioridade" }), ...PRIORITIES.map(p => el("option", { value: p, text: p, selected: f.prio === p }))]);
    const sortSel = el("select.input", { style: { width: "auto" }, onchange: (e) => save({ sort: e.target.value }) },
        [["recent", "Mais recentes"], ["old", "Mais antigos"], ["prio", "Prioridade"], ["az", "A–Z"]].map(([v, l]) => el("option", { value: v, text: l, selected: f.sort === v })));
    const viewToggle = el("div.seg", {}, [
        el("button" + (f.view === "grid" ? ".active" : ""), { html: icon("grid"), onclick: () => save({ view: "grid" }) }),
        el("button" + (f.view === "list" ? ".active" : ""), { html: icon("list"), onclick: () => save({ view: "list" }) }),
    ]);
    return el("div.toolbar", {}, [search, statusChips, el("div.grow"), prioSel, sortSel, viewToggle]);
}

function caseCard(c, counts) {
    const node = el("div.card.glow.clickable.case-card", { onclick: () => navigate("casos/" + c.id) }, [
        el("div.cc-top", {}, [el("span.cc-code", { text: c.code }), el("span", { style: { marginLeft: "auto" } }, [prioBadge(c.priority)])]),
        el("h3", { text: c.title }),
        el("div.cc-desc", { text: c.description }),
        el("div", {}, [stageBadge(c.status), el("span.tag", { text: c.type, style: { marginLeft: "6px" } })]),
        el("div.case-card-links", {}, [
            portraitStack(counts.people),
            counts.ev[0] ? evidencePhoto(counts.ev[0], "case-card-evidence") : el("span.muted", { text: "Sem imagem pericial" }),
        ]),
        el("div.cc-meta", {}, [
            metaItem("box", counts.ev.length + " evid."),
            metaItem("users", (c.people?.length || 0) + " pessoas"),
            metaItem("clock", timeAgo(c.updatedAt)),
        ]),
        el("div.cc-foot", {}, [avatarChip(userName(c.leadId), "sm"), el("span.muted", { style: { fontSize: ".8rem" }, text: userName(c.leadId) }), el("span", { style: { marginLeft: "auto" }, class: "muted", html: `${c.city}/${c.state}` })]),
    ]);
    attachContextMenu(node, () => caseMenu(c));
    return node;
}
function metaItem(ic, text) { return el("span.mi", { html: icon(ic) + `<span>${text}</span>` }); }

function caseTable(list, count) {
    const rows = list.map(c => el("tr", { onclick: () => navigate("casos/" + c.id), oncontextmenu: (e) => { e.preventDefault(); contextMenu(e.clientX, e.clientY, caseMenu(c)); } }, [
        el("td", { html: `<b class='mono' style='color:var(--accent)'>${c.code}</b>` }),
        el("td", { text: c.title }),
        el("td", { text: c.type }),
        el("td", {}, [stageBadge(c.status)]),
        el("td", {}, [prioBadge(c.priority)]),
        el("td", { text: `${c.city}/${c.state}` }),
        el("td", { text: userName(c.leadId) }),
        el("td", { text: count(c.id).ev.length }),
        el("td", { text: fmtDate(c.updatedAt) }),
    ]));
    const thead = el("tr", {}, ["Código", "Título", "Tipo", "Estágio", "Prioridade", "Local", "Responsável", "Evid.", "Atualizado"].map(h => el("th.sortable", { text: h })));
    const table = el("table.tbl", {}, [el("thead", {}, [thead]), el("tbody", {}, rows)]);
    enableSort(table);
    return el("div.card", { style: { padding: "6px" } }, [table]);
}

export function caseMenu(c, { onChanged } = {}) {
    return [
        { label: "Abrir", icon: "eye", action: () => navigate("casos/" + c.id) },
        canEditCase(c) ? { label: "Editar", icon: "edit", action: () => openCaseModal(c, { onSaved: onChanged }) } : null,
        canEditCase(c) ? { label: "Avançar estágio", icon: "arrowR", action: async () => { await advanceStage(c); await onChanged?.(); } } : null,
        isAdmin() ? "-" : null,
        isAdmin() ? { label: "Excluir", icon: "trash", danger: true, action: () => deleteCase(c, onChanged) } : null,
    ].filter(Boolean);
}

async function advanceStage(c) {
    const idx = STAGES.indexOf(c.status);
    const next = STAGES[Math.min(idx + 1, STAGES.length - 1)];
    if (next === c.status) return;
    await moveStage(c.id, next);
}
export async function moveStage(id, next, silentToast) {
    const c = await get("cases", id);
    if (!c || c.status === next || !canEditCase(c)) return;
    c.activity = c.activity || [];
    c.activity.push({ id: uid("ev"), kind: "stage", at: new Date().toISOString(), by: c.leadId, text: `${c.status} → ${next}` });
    const prev = c.status; c.status = next;
    await put("cases", c);
    if (!silentToast) toast(`${c.code}: ${prev} → ${next}`, { type: "info", title: "Estágio atualizado" });
}

async function deleteCase(c, onChanged) {
    if (!isAdmin()) return toast("Somente o administrador pode excluir casos", { type: "warning", title: "Ação bloqueada" });
    if (!(await confirmDialog({ title: "Excluir caso", message: `O caso "${c.title}" e suas movimentações serão removidos. Esta ação não pode ser desfeita.`, confirmText: "Excluir" }))) return;
    await del("cases", c.id);
    toast("Caso excluído", { type: "success" });
    if (onChanged) await onChanged();
    else if (location.hash.startsWith("#/casos/")) navigate("casos");
    else renderCasesRefresh();
}
function renderCasesRefresh() { const v = document.querySelector(".view-inner"); if (v && location.hash.startsWith("#/casos")) renderCases(v); }

/* ============================ CREATE / EDIT ============================ */
export async function openCaseModal(existing, options = {}) {
    const persisted = existing?.id ? existing : null;
    if ((persisted && !canEditCase(persisted)) || (!persisted && !canCreateCase())) {
        toast("Seu perfil não permite alterar este caso", { type: "warning", title: "Somente leitura" });
        return;
    }
    if (!usersCache.length) usersCache = await all("users");
    const defaults = options.defaults || (!persisted && existing ? existing : {});
    const c = persisted ? { ...persisted } : { status: "Registro", priority: "Média", type: "Homicídio", tags: [], ...defaults };
    const F = {};
    const field = (label, node) => el("div.field", {}, [el("label", { text: label }), node]);
    const input = (k, ph) => (F[k] = el("input.input", { value: c[k] || "", placeholder: ph || "" }));
    const sel = (k, opts) => (F[k] = el("select.input", {}, opts.map(o => el("option", { value: o, text: o, selected: c[k] === o }))));

    const cities = [...new Set([["São Paulo", "SP"], ["Rio de Janeiro", "RJ"], ["Porto Alegre", "RS"], ["Recife", "PE"], ["Manaus", "AM"], ["Belo Horizonte", "MG"], ["Curitiba", "PR"], ["Salvador", "BA"]].map(x => x.join("|")))];

    const form = el("div", {}, [
        field("Título", input("title", "Ex.: O caso da doca norte")),
        el("div.form-row", {}, [
            field("Tipo", sel("type", CASE_TYPES)),
            field("Estágio", sel("status", STAGES)),
            field("Prioridade", sel("priority", PRIORITIES)),
        ]),
        el("div.form-row", {}, [
            field("Cidade/UF", F.city = el("select.input", {}, cities.map(cc => { const [city, uf] = cc.split("|"); return el("option", { value: cc, text: `${city}/${uf}`, selected: c.city === city }); }))),
            field("Responsável", F.leadId = el("select.input", { disabled: !isAdmin() }, [el("option", { value: "", text: "— não atribuído —" }), ...usersCache.map(u => el("option", { value: u.id, text: u.name, selected: c.leadId === u.id }))])),
        ]),
        field("Descrição", F.description = el("textarea.input", { text: c.description || "", placeholder: "Resumo dos fatos conhecidos…" })),
        field("Tags (separadas por vírgula)", F.tags = el("input.input", { value: (c.tags || []).join(", ") })),
    ]);

    const m = modal({
        title: persisted ? "Editar caso" : "Novo caso", body: form, wide: true,
        footer: [
            el("button.btn.ghost", { text: "Cancelar", onclick: () => m.close() }),
            el("button.btn.primary", { html: icon("check") + "Salvar", onclick: save }),
        ],
    });

    async function save() {
        const title = F.title.value.trim();
        if (title.length < 3) { F.title.parentElement.classList.add("err"); toast("Informe um título válido", { type: "error" }); return; }
        const [city, state] = (F.city.value || "São Paulo|SP").split("|");
        const isNew = !persisted;
        const rec = {
            id: c.id || uid("c"),
            code: c.code || nextCode(city),
            title, type: F.type.value, status: F.status.value, priority: F.priority.value,
            description: F.description.value.trim(), summary: F.description.value.trim().slice(0, 90),
            city, state, leadId: F.leadId.value, team: c.team || [],
            tags: F.tags.value.split(",").map(t => t.trim()).filter(Boolean),
            people: c.people || [], notes: c.notes || [], openedAt: c.openedAt || new Date().toISOString(),
            createdAt: c.createdAt, activity: c.activity || [{ id: uid("ev"), kind: "open", at: new Date().toISOString(), by: F.leadId.value, text: "Caso registrado no sistema." }],
        };
        await put("cases", rec);
        m.close();
        toast(isNew ? `Caso ${rec.code} criado` : "Caso atualizado", { type: "success", title: isNew ? "Novo caso" : "Salvo" });
        await options.onSaved?.(rec, { isNew });
        if (isNew && options.navigateAfterSave !== false) navigate("casos/" + rec.id);
        else if (!options.onSaved) renderCasesRefresh();
    }
    setTimeout(() => F.title.focus(), 50);
}
function nextCode(city) { const y = new Date().getFullYear(); return `UNS-${y}-${String(Math.floor(100 + Math.random() * 899))}`; }

function enableSort(table) {
    const ths = Array.from(table.tHead.rows[0].cells);
    ths.forEach((th, i) => th.addEventListener("click", () => {
        const asc = th.getAttribute("aria-sort") !== "ascending";
        const body = table.tBodies[0]; const rows = Array.from(body.rows);
        rows.sort((a, b) => { const x = a.cells[i].textContent.trim(), y = b.cells[i].textContent.trim(); const nx = parseFloat(x), ny = parseFloat(y); const c = (!isNaN(nx) && !isNaN(ny)) ? nx - ny : x.localeCompare(y, "pt-BR"); return asc ? c : -c; });
        rows.forEach(r => body.appendChild(r));
        ths.forEach(o => o.removeAttribute("aria-sort")); th.setAttribute("aria-sort", asc ? "ascending" : "descending");
    }));
}

/* ============================ DETALHE ============================ */
export async function renderCaseDetail(container, params) {
    clear(container);
    const [c, users, allPeople, allEv, events] = await Promise.all([get("cases", params.id), all("users"), all("people"), all("evidence"), all("events")]);
    usersCache = users;
    if (!c) { container.appendChild(emptyState({ icon: "folder", title: "Caso não encontrado", text: "Ele pode ter sido removido.", action: { label: "Voltar aos casos", onClick: () => navigate("casos") } })); return; }
    if (!canViewCase(c)) { container.appendChild(emptyState({ icon: "lock", title: "Caso fora da sua atribuição", text: "O perfil de detetive acessa somente o caso em que está atuando.", action: { label: "Abrir meu caso", onClick: () => navigate("casos") } })); return; }
    const evOfCase = allEv.filter(e => e.caseId === c.id);
    const peopleOfCase = (c.people || []).map(pr => ({ ...pr, person: allPeople.find(p => p.id === pr.personId) })).filter(x => x.person);

    // Header + ações
    container.appendChild(el("div.page-head", {}, [
        el("div", {}, [
            el("a.crumbs", { href: "#/casos", style: { cursor: "pointer" }, html: `<span>${icon("chevronL")}</span><span>Casos</span>` }),
            el("h1", { text: c.title }),
            el("div.sub", { html: `<span class="mono" style="color:var(--accent)">${c.code}</span> · ${c.type} · ${c.city}/${c.state}` }),
        ]),
        el("div.actions", {}, [
            canEditCase(c) ? el("button.btn", { html: icon("link") + "Gerenciar vínculos", onclick: () => openCaseLinks(c, isAdmin() ? allPeople : peopleOfCase.map(link => link.person), isAdmin() ? allEv : evOfCase, { onChanged: () => renderCaseDetail(container, params) }) }) : null,
            el("button.btn.primary", { html: icon("share") + "Abrir mural", onclick: () => navigate("mural?case=" + c.id) }),
            canEditCase(c) ? el("button.btn", { html: icon("edit") + "Editar", onclick: () => openCaseModal(c) }) : null,
            el("button.btn.ghost.icon-only", { html: icon("dots"), onclick: (e) => contextMenu(e.clientX, e.clientY, caseMenu(c)) }),
        ]),
    ]));

    // Pipeline bar
    container.appendChild(pipelineBar(c));

    // Stats hero
    const stats = [
        ["Evidências", evOfCase.length, "box"], ["Pessoas", peopleOfCase.length, "users"],
        ["Documentos", (c.documents?.length || evOfCase.filter(e => e.type === "Documento").length), "doc"],
        ["Movimentações", (c.activity?.length || 0), "activity"], ["Equipe", (c.team?.length || 0) + 1, "shield"],
        ["Progresso", progressFor(c.status) + "%", "trending"],
    ];
    container.appendChild(el("div.kpis.case-kpis", { style: { marginBottom: "22px" } }, stats.map(([l, v, ic]) =>
        el("div.card.pad-sm", {}, [el("div.kpi-top", {}, [el("div.kpi-ico", { html: icon(ic) }), el("div.kpi-label", { text: l })]), el("div.kpi-num", { style: { fontSize: "1.5rem" }, text: String(v) })]))));

    // Tabs
    const TABS = ["Resumo", "Pessoas", "Evidências", "Linha do tempo", "Documentos", "Anotações", "Histórico", "Permissões", "Auditoria"];
    const tabBody = el("div.tab-body");
    const tabsEl = el("div.tabs");
    let activeTab = "Resumo";
    TABS.forEach(t => tabsEl.appendChild(el("button" + (t === activeTab ? ".active" : ""), { text: t, onclick: () => { activeTab = t; [...tabsEl.children].forEach(b => b.classList.toggle("active", b.textContent === t)); renderTab(); } })));
    container.appendChild(tabsEl); container.appendChild(tabBody);

    function renderTab() {
        clear(tabBody);
        if (activeTab === "Resumo") tabBody.appendChild(tabResumo(c, peopleOfCase, evOfCase));
        else if (activeTab === "Pessoas") tabBody.appendChild(tabPeople(c, peopleOfCase));
        else if (activeTab === "Evidências") tabBody.appendChild(tabEvidence(c, evOfCase));
        else if (activeTab === "Linha do tempo") tabBody.appendChild(tabTimeline(c));
        else if (activeTab === "Documentos") tabBody.appendChild(tabDocs(c, evOfCase));
        else if (activeTab === "Anotações") tabBody.appendChild(tabNotes(c, canEditCase(c)));
        else if (activeTab === "Histórico") tabBody.appendChild(tabHistory(c));
        else if (activeTab === "Permissões") tabBody.appendChild(tabPerms(c));
        else if (activeTab === "Auditoria") tabBody.appendChild(tabAudit(c));
    }
    renderTab();
}

export function openCaseLinks(caseInput, peopleInput, evidenceInput, { onChanged } = {}) {
    if (!canEditCase(caseInput)) {
        toast("Seu perfil pode visualizar este mural, mas não alterar seus vínculos", { type: "warning", title: "Somente leitura" });
        return;
    }
    let caseRecord = caseInput;
    let people = peopleInput;
    let evidence = evidenceInput;
    const body = el("div.case-link-manager");
    const personSelect = el("select.input");
    const roleSelect = el("select.input", {}, [...PERSON_ROLES, "Relacionado à evidência"].map(role => el("option", { value: role, text: role })));
    const evidenceSelect = el("select.input");

    const finish = () => m.close();
    const m = modal({ title: `Vínculos · ${caseRecord.code}`, body, wide: true, footer: [
        el("button.btn.ghost", { html: icon("user") + "Nova pessoa", onclick: () => { m.close(); openPersonModal(null, { caseId: caseRecord.id, role: roleSelect.value, onSaved: onChanged }); } }),
        el("button.btn.ghost", { html: icon("box") + "Nova evidência", onclick: () => { m.close(); openEvModal(null, { caseId: caseRecord.id, onSaved: onChanged }); } }),
        el("button.btn.primary", { html: icon("check") + "Concluir", onclick: finish }),
    ] });

    async function refresh() {
        [caseRecord, people, evidence] = await Promise.all([get("cases", caseRecord.id), all("people"), all("evidence")]);
        paint();
    }

    async function syncView() {
        await refresh();
        await onChanged?.();
    }

    function paint() {
        clear(body);
        const linkedPeople = (caseRecord.people || []).map(link => ({ ...link, person: people.find(person => person.id === link.personId) })).filter(link => link.person);
        const linkedEvidence = evidence.filter(item => item.caseId === caseRecord.id);
        const availablePeople = people.filter(person => !linkedPeople.some(link => link.person.id === person.id));
        const availableEvidence = evidence.filter(item => item.caseId !== caseRecord.id);

        clear(personSelect);
        personSelect.append(el("option", { value: "", text: availablePeople.length ? "Selecione uma pessoa…" : "Todas as pessoas já estão vinculadas" }), ...availablePeople.map(person => el("option", { value: person.id, text: `${person.name} · ${person.profession || "sem profissão"}` })));
        clear(evidenceSelect);
        evidenceSelect.append(el("option", { value: "", text: availableEvidence.length ? "Selecione uma evidência…" : "Todas as evidências já estão vinculadas" }), ...availableEvidence.map(item => el("option", { value: item.id, text: `${item.code} · ${item.title}` })));

        body.append(
            el("div.link-manager-status", {}, [el("span", { html: icon("share") }), el("div", {}, [el("b", { text: "Sincronização automática com o mural" }), el("small", { text: "Qualquer vínculo criado aqui aparece imediatamente no quadro investigativo deste caso." })])]),
            el("div.link-manager-grid", {}, [
                el("section", {}, [
                    el("div.link-manager-head", {}, [el("div", {}, [el("span.record-label", { text: "PESSOAS" }), el("h3", { text: "Envolvidos no caso" })]), el("b", { text: String(linkedPeople.length) })]),
                    el("div.link-manager-list", {}, linkedPeople.length ? linkedPeople.map(link => el("div.link-manager-row", {}, [
                        personPortrait(link.person, "mini-person-photo"),
                        el("div", {}, [el("b", { text: link.person.name }), el("small", { text: link.role })]),
                        el("button.icon-btn", { "data-tip": "Editar pessoa e fotos", html: icon("edit"), onclick: () => { m.close(); openPersonModal(link.person, { onSaved: onChanged }); } }),
                        el("button.icon-btn", { "data-tip": "Retirar do caso", html: icon("x"), onclick: async () => { caseRecord.people = caseRecord.people.filter(item => item.personId !== link.person.id); await put("cases", caseRecord); toast("Pessoa retirada do mural", { type: "info" }); await syncView(); } }),
                    ])) : [el("p.muted", { text: "Nenhuma pessoa vinculada." })]),
                    el("div.link-manager-add", {}, [
                        personSelect, roleSelect,
                        el("button.btn", { html: icon("plus") + "Vincular pessoa", onclick: async () => { if (!personSelect.value) return; caseRecord.people = caseRecord.people || []; caseRecord.people.push({ personId: personSelect.value, role: roleSelect.value }); await put("cases", caseRecord); toast("Pessoa adicionada ao mural", { type: "success" }); await syncView(); } }),
                    ]),
                ]),
                el("section", {}, [
                    el("div.link-manager-head", {}, [el("div", {}, [el("span.record-label", { text: "EVIDÊNCIAS" }), el("h3", { text: "Registros periciais" })]), el("b", { text: String(linkedEvidence.length) })]),
                    el("div.link-manager-list", {}, linkedEvidence.length ? linkedEvidence.map(item => el("div.link-manager-row", {}, [
                        evidencePhoto(item, "link-manager-evidence"),
                        el("div", {}, [el("b", { text: item.title }), el("small.mono", { text: `${item.code} · ${item.type}` })]),
                        el("button.icon-btn", { "data-tip": "Editar evidência e fotos", html: icon("edit"), onclick: () => { m.close(); openEvModal(item, { onSaved: onChanged }); } }),
                        el("button.icon-btn", { "data-tip": "Retirar do caso", html: icon("x"), onclick: async () => { item.caseId = ""; await put("evidence", item); toast("Evidência retirada do mural", { type: "info" }); await syncView(); } }),
                    ])) : [el("p.muted", { text: "Nenhuma evidência vinculada." })]),
                    el("div.link-manager-add", {}, [
                        evidenceSelect,
                        el("button.btn", { html: icon("plus") + "Vincular evidência", onclick: async () => {
                            const item = evidence.find(record => record.id === evidenceSelect.value); if (!item) return;
                            item.caseId = caseRecord.id; await put("evidence", item);
                            caseRecord.people = caseRecord.people || [];
                            (item.personIds || []).forEach(personId => { if (!caseRecord.people.some(link => link.personId === personId)) caseRecord.people.push({ personId, role: "Relacionado à evidência" }); });
                            await put("cases", caseRecord); toast("Evidência adicionada ao mural", { type: "success" }); await syncView();
                        } }),
                    ]),
                ]),
            ]),
        );
    }
    paint();
    return m;
}

function pipelineBar(c) {
    const cur = STAGES.indexOf(c.status);
    const wrap = el("div.card", { style: { padding: "8px", marginBottom: "22px", overflowX: "auto" } });
    const row = el("div", { style: { display: "flex", gap: "4px", minWidth: "min-content" } });
    STAGES.forEach((s, i) => {
        const state = i < cur ? "done" : i === cur ? "current" : "future";
        const bg = state === "current" ? stageVar(s) : state === "done" ? "color-mix(in srgb, " + stageVar(s) + " 55%, transparent)" : "var(--surface-2)";
        const col = state === "future" ? "var(--ink-3)" : "#08122b";
        row.appendChild(el("button", {
            disabled: !canEditCase(c),
            style: { flex: "1 1 0", minWidth: "96px", border: "0", cursor: !canEditCase(c) || state === "current" ? "default" : "pointer", padding: "11px 10px", fontSize: ".8rem", fontWeight: "700", color: col, background: bg,
                clipPath: i === 0 ? "polygon(0 0,calc(100% - 13px) 0,100% 50%,calc(100% - 13px) 100%,0 100%)" : i === STAGES.length - 1 ? "polygon(0 0,100% 0,100% 100%,0 100%,13px 50%)" : "polygon(0 0,calc(100% - 13px) 0,100% 50%,calc(100% - 13px) 100%,0 100%,13px 50%)" },
            text: s, onclick: async () => { if (s !== c.status) { await moveStage(c.id, s); navigate("casos/" + c.id); } },
        }));
    });
    wrap.appendChild(row);
    return wrap;
}

function tabResumo(c, people, ev) {
    const lead = usersCache.find(u => u.id === c.leadId);
    return el("div.case-summary-grid", {}, [
        el("div.card.case-narrative", {}, [
            el("div.card-head", {}, [el("h3", { text: "Síntese operacional" }), el("span.record-label", { text: c.code })]),
            el("p.case-description", { text: c.description || "—" }),
            el("div.case-hypothesis", {}, [
                el("span", { text: "LEITURA DO ARQUIVO" }),
                el("b", { text: ev.length ? `${ev.length} evidências cruzadas com ${people.length} pessoas vinculadas.` : "Aguardando coleta de evidências para consolidar a hipótese." }),
            ]),
            el("div", { class: "case-tag-row" }, (c.tags || []).map(t => el("span.tag", { html: icon("tag") + t }))),
            el("div.case-linkage-preview", {}, [
                el("section", {}, [
                    el("div.case-linkage-head", {}, [el("span", { text: "Pessoas relacionadas" }), el("b", { text: String(people.length) })]),
                    people.length ? el("div.case-people-preview", {}, people.slice(0, 4).map(link => el("button", { onclick: () => navigate("pessoas/" + link.person.id) }, [personPortrait(link.person, "case-person-photo"), el("span", {}, [el("b", { text: link.person.name }), el("small", { text: link.role })])])) ) : el("p.muted", { text: "Nenhuma pessoa vinculada." }),
                ]),
                el("section", {}, [
                    el("div.case-linkage-head", {}, [el("span", { text: "Registros periciais" }), el("b", { text: String(ev.length) })]),
                    ev.length ? el("div.case-evidence-preview", {}, ev.slice(0, 3).map(item => el("button", { onclick: () => navigate("evidencias?focus=" + item.id) }, [evidencePhoto(item, "case-evidence-photo"), el("span", {}, [el("b.mono", { text: item.code }), el("small", { text: item.type })])])) ) : el("p.muted", { text: "Sem registros periciais." }),
                ]),
            ]),
            el("button.btn.primary.case-board-cta", { html: icon("share") + "Visualizar todos os vínculos no mural", onclick: () => navigate("mural?case=" + c.id) }),
        ]),
        el("div.case-summary-side", {}, [
          el("div.card", {}, [el("div.card-head", {}, [el("h3", { text: "Dados do caso" })]),
            el("dl.def-list", {}, [
                di("Estágio", stageBadge(c.status)), di("Prioridade", prioBadge(c.priority)),
                di("Responsável", el("span", { text: userName(c.leadId) })),
                di("Aberto em", el("span", { text: fmtDate(c.openedAt) })),
                di("Última atualização", el("span", { text: fmtDateTime(c.updatedAt) })),
                di("Local", el("span", { text: `${c.city}/${c.state}` })),
            ]),
          ]),
          el("div.card.case-lead-card", {}, [
              el("span.record-label", { text: "RESPONSÁVEL PELO CASO" }),
              avatarChip(lead?.name || "Não atribuído", "md"),
              el("div", {}, [el("b", { text: lead?.name || "Não atribuído" }), el("small", { text: lead ? `${lead.role} · ${lead.specialty}` : "Defina um responsável" })]),
          ]),
        ]),
    ]);
}
function di(k, v) { return el("div.di", {}, [el("dt", { text: k }), el("dd", {}, [v])]); }

function tabPeople(c, people) {
    if (!people.length) return emptyState({ icon: "users", title: "Nenhuma pessoa vinculada" });
    return el("div.entity-grid", {}, people.map(pr => el("div.card.clickable.person-card", { onclick: () => navigate("pessoas/" + pr.person.id) }, [
        personPortrait(pr.person, "person-list-photo"),
        el("div.p-main", {}, [el("b", { text: pr.person.name }), el("span", { text: pr.person.profession || "—" })]),
        el("span.tag", { text: pr.role, style: { marginLeft: "auto" } }),
    ])));
}
function tabEvidence(c, ev) {
    if (!ev.length) return emptyState({ icon: "box", title: "Sem evidências", text: "Cadastre no módulo de Evidências." });
    return el("div.entity-grid", {}, ev.map(e => el("div.card.clickable.case-evidence-card", { onclick: () => navigate("evidencias?focus=" + e.id) }, [
        evidencePhoto(e, "evidence-card-photo"),
        el("div", {}, [el("b", { text: e.code, style: { fontFamily: "var(--font-mono)", color: "var(--accent)" } }), el("span.tag", { text: e.type, style: { marginLeft: "auto" } }),
        el("h3", { text: e.title }), el("div.muted", { style: { fontSize: ".8rem", marginTop: "6px" }, text: `${e.custody} · ${fmtDate(e.date)}` })]),
    ])));
}
function tabTimeline(c) {
    const acts = (c.activity || []).slice().sort((a, b) => new Date(b.at) - new Date(a.at));
    if (!acts.length) return emptyState({ icon: "timeline", title: "Sem movimentações" });
    return el("div.tl", {}, acts.map(a => el("div.tl-event", {}, [
        el("div.tl-node", { html: icon(a.kind === "stage" ? "arrowR" : a.kind === "note" ? "chat" : "activity") }),
        el("div.card.pad-sm", {}, [el("div", { style: { display: "flex", gap: "10px", alignItems: "center" } }, [el("b", { text: a.text }), el("time", { class: "muted mono", style: { marginLeft: "auto", fontSize: ".74rem" }, text: fmtDateTime(a.at) })]), el("div.muted", { style: { fontSize: ".8rem", marginTop: "4px" }, text: "por " + userName(a.by) })]),
    ])));
}
function tabDocs(c, ev) {
    const docs = ev.filter(e => e.type === "Documento");
    if (!docs.length) return emptyState({ icon: "doc", title: "Sem documentos", text: "Documentos vinculados aparecerão aqui." });
    return el("div.card", { style: { padding: "6px" } }, [el("table.tbl", {}, [el("thead", {}, [el("tr", {}, ["Código", "Título", "Origem", "Data"].map(h => el("th", { text: h })))]), el("tbody", {}, docs.map(d => el("tr", {}, [el("td", { html: `<b class='mono'>${d.code}</b>` }), el("td", { text: d.title }), el("td", { text: d.origin }), el("td", { text: fmtDate(d.date) })])))])]);
}
function tabNotes(c, writable) {
    const wrap = el("div");
    const list = el("div.grid", { style: { gap: "10px", marginTop: "14px" } });
    const ta = el("textarea.input", { placeholder: "Escreva uma anotação… (salva automaticamente)", style: { minHeight: "70px" } });
    const add = el("button.btn.primary", { html: icon("plus") + "Adicionar anotação", onclick: async () => {
        if (!ta.value.trim()) return;
        c.notes = c.notes || []; c.notes.unshift({ id: uid("n"), text: ta.value.trim(), at: new Date().toISOString(), by: c.leadId });
        c.activity = c.activity || []; c.activity.push({ id: uid("ev"), kind: "note", at: new Date().toISOString(), by: c.leadId, text: "Anotação adicionada" });
        await put("cases", c); ta.value = ""; paintNotes(); toast("Anotação salva", { type: "success" });
    } });
    if (writable) wrap.append(el("div.card", {}, [ta, el("div", { style: { marginTop: "10px" } }, [add])]));
    else wrap.append(el("div.read-only-note", { html: icon("lock") + "Este perfil pode consultar as anotações, mas não adicionar novas entradas." }));
    wrap.append(list);
    function paintNotes() {
        clear(list);
        (c.notes || []).forEach(n => list.appendChild(el("div.card.pad-sm", {}, [
            el("div", { style: { display: "flex", gap: "10px" } }, [el("b", { text: userName(n.by) }), el("time.muted", { style: { marginLeft: "auto", fontSize: ".74rem" }, text: fmtDateTime(n.at) })]),
            el("p", { style: { margin: "6px 0 0", color: "var(--ink-2)" }, text: n.text }),
        ])));
        if (!(c.notes || []).length) list.appendChild(emptyState({ icon: "chat", title: "Nenhuma anotação ainda" }));
    }
    paintNotes();
    return wrap;
}
function tabHistory(c) { return tabTimeline(c); }
function tabPerms(c) {
    const rows = [["Administrador geral", "Acesso total"], ["Detetive", "Editar somente o caso atribuído"], ["Usuário comum", "Somente visualização"]];
    return el("div.card", {}, [el("div.card-head", {}, [el("h3", { text: "Permissões por perfil" })]), el("dl.def-list", {}, rows.map(([r, p]) => di(r, el("span.tag", { text: p }))))]);
}
function tabAudit(c) {
    const acts = (c.activity || []).slice().reverse();
    return el("div.card", { style: { padding: "6px" } }, [el("table.tbl", {}, [el("thead", {}, [el("tr", {}, ["Quando", "Evento", "Usuário"].map(h => el("th", { text: h })))]), el("tbody", {}, acts.map(a => el("tr", {}, [el("td", { text: fmtDateTime(a.at) }), el("td", { text: a.text }), el("td", { text: userName(a.by) })])))])]);
}
