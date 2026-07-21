import { el, clear, fmtDateTime, timeAgo, uid, debounce, initials } from "../dom.js";
import { icon } from "../icons.js";
import { all, put, del } from "../db.js";
import { ROLES, AVAIL } from "../models.js";
import { pageHead, donut } from "../widgets.js";
import { skeleton, emptyState, toast, modal, confirmDialog, attachContextMenu } from "../ui.js";
import { getFilter, setFilter } from "../store.js";
import { navigate } from "../router.js";

let cases = [];
const availClass = (a) => a === "Disponível" ? "" : a === "Ocupado" ? "busy" : "off";

export default async function renderUsers(container) {
    clear(container);
    container.appendChild(pageHead("Usuários", "Equipe, perfis, permissões e produtividade", [
        el("button.btn.primary", { html: icon("plus") + "Novo usuário", onclick: () => openUserModal() }),
    ]));
    const f = getFilter("users", { q: "", role: "all" });
    const body = el("div");
    container.appendChild(el("div.toolbar", {}, [
        el("div.searchbar", { style: { maxWidth: "300px" } }, [el("span", { html: icon("search") }), el("input", { placeholder: "Buscar…", value: f.q, oninput: debounce(e => { f.q = e.target.value; setFilter("users", f); paint(); }, 180) })]),
        el("div", { style: { display: "flex", gap: "6px", flexWrap: "wrap" } }, [["all", "Todos"], ...ROLES.map(r => [r, r])].map(([v, l]) => el("button.chip" + (f.role === v ? ".active" : ""), { text: l, onclick: () => { f.role = v; setFilter("users", f); paint(); } }))),
    ]));
    container.appendChild(body);
    body.appendChild(skeleton("cards", 6));

    let users;
    [users, cases] = await Promise.all([all("users"), all("cases")]);
    clear(body);

    function stat(id) { return { active: cases.filter(c => c.leadId === id && !["Arquivado", "Resolvido"].includes(c.status)).length, closed: cases.filter(c => c.leadId === id && ["Arquivado", "Resolvido"].includes(c.status)).length }; }
    const assigned = (id) => cases.filter(c => c.leadId === id);

    function paint() {
        clear(body);
        const list = users.filter(u => (f.role === "all" || u.role === f.role) && (!f.q || `${u.name} ${u.specialty} ${u.dept}`.toLowerCase().includes(f.q.toLowerCase())));
        if (!list.length) { body.appendChild(emptyState({ icon: "user", title: "Nenhum usuário" })); return; }
        const grid = el("div.entity-grid");
        list.forEach(u => {
            const s = stat(u.id);
            const workload = assigned(u.id);
            const node = el("div.card.glow.clickable.user-card", { onclick: () => openUserDetail(u, s) }, [
                el("div.user-credential-head", {}, [
                    credentialSeal(u),
                    el("div.user-identity", {}, [
                        el("span.record-label", { text: `CREDENCIAL ${u.badge || u.id.toUpperCase()}` }),
                        el("b", { text: u.name }),
                        el("small", { text: u.role + " · " + u.dept }),
                    ]),
                    el("span.avail" + (availClass(u.avail) ? "." + availClass(u.avail) : ""), { text: u.avail }),
                ]),
                el("div.user-specialty", {}, [el("span.tag", { text: u.specialty }), el("small", { text: `${workload.length} dossiês sob responsabilidade` })]),
                el("div.u-stats", {}, [
                    statBox(s.active, "Ativos"), statBox(s.closed, "Encerrados"), statBox(u.productivity + "%", "Produt."),
                ]),
                el("div.user-case-trail", {}, workload.slice(0, 2).map(c => el("button", { onclick: ev => { ev.stopPropagation(); navigate("casos/" + c.id); } }, [
                    el("span.mono", { text: c.code }), el("b", { text: c.title }), el("span", { html: icon("chevronR") }),
                ]))),
            ]);
            attachContextMenu(node, () => [
                { label: "Ver perfil", icon: "eye", action: () => openUserDetail(u, s) },
                { label: "Editar", icon: "edit", action: () => openUserModal(u) },
                "-", { label: "Excluir", icon: "trash", danger: true, action: async () => { if (await confirmDialog({ title: "Excluir usuário", message: `"${u.name}" será removido.` })) { await del("users", u.id); toast("Usuário removido", { type: "success" }); reload(); } } },
            ]);
            grid.appendChild(node);
        });
        body.appendChild(grid);
    }
    async function reload() { users = await all("users"); paint(); }
    paint();
    window.__usersReload = reload;
}
function statBox(v, l) { return el("div", {}, [el("b", { text: String(v) }), el("span", { text: l })]); }
function credentialSeal(u, size = "md") {
    return el(`div.credential-seal.${size}`, {}, [
        el("b", { text: initials(u.name) }),
        el("small", { text: (u.role || "EQUIPE").slice(0, 3).toUpperCase() }),
    ]);
}

function openUserDetail(u, s) {
    const assignedCases = cases.filter(c => c.leadId === u.id);
    const body = el("div", {}, [
        el("div.user-detail-hero", {}, [
            credentialSeal(u, "lg"),
            el("div", {}, [el("span.record-label", { text: `IDENTIFICAÇÃO FUNCIONAL · ${u.badge}` }), el("h2", { text: u.name }), el("div.muted", { text: u.role + " · " + u.dept }), el("div", { style: { marginTop: "8px" } }, [el("span.avail" + (availClass(u.avail) ? "." + availClass(u.avail) : ""), { text: u.avail })])]),
            el("div", { style: { marginLeft: "auto", position: "relative", display: "grid", placeItems: "center" } }, [donut([{ value: u.productivity, color: "var(--accent)" }, { value: 100 - u.productivity, color: "var(--surface-3)" }], 90), el("b", { style: { position: "absolute" }, text: u.productivity + "%" })]),
        ]),
        el("div.two-col", {}, [
            el("div.card", {}, [el("div.card-head", {}, [el("h3", { text: "Perfil" })]), el("dl.def-list", {}, [
                di("Cargo", u.role), di("Departamento", u.dept), di("Especialidade", u.specialty), di("Distintivo", u.badge), di("Nível de acesso", u.role === "Administrador" ? "Total" : u.role === "Supervisor" ? "Elevado" : "Padrão"),
            ])]),
            el("div.card", {}, [el("div.card-head", {}, [el("h3", { text: "Atividade" })]), el("dl.def-list", {}, [
                di("Casos ativos", s.active), di("Casos encerrados", s.closed), di("Produtividade", u.productivity + "%"), di("Contato", u.email), di("Telefone", u.phone), di("Último acesso", timeAgo(u.lastAccess)),
            ])]),
        ]),
        el("div.card.user-assignment-card", {}, [
            el("div.card-head", {}, [el("h3", { text: "Casos sob responsabilidade" }), el("span.tag", { text: String(assignedCases.length) })]),
            assignedCases.length ? el("div.assignment-list", {}, assignedCases.map(c => el("div", {}, [
                el("div", {}, [el("span.mono", { text: c.code }), el("b", { text: c.title }), el("small", { text: `${c.status} · ${c.city}/${c.state}` })]),
                el("button.btn.sm", { html: icon("folder") + "Caso", onclick: () => { m.close(); navigate("casos/" + c.id); } }),
                el("button.btn.sm.ghost", { html: icon("share") + "Mural", onclick: () => { m.close(); navigate("mural?case=" + c.id); } }),
            ]))) : el("p.muted", { text: "Nenhum caso atribuído a este usuário." }),
        ]),
    ]);
    const edit = el("button.btn", { html: icon("edit") + "Editar" });
    const m = modal({ title: "Perfil do usuário", body, wide: true, footer: [edit] });
    edit.addEventListener("click", () => { m.close(); openUserModal(u); });
}
function di(k, v) { return el("div.di", {}, [el("dt", { text: k }), el("dd", { text: v == null ? "—" : String(v) })]); }

async function openUserModal(existing) {
    const u = existing ? { ...existing } : { role: "Investigador", avail: "Disponível", productivity: 80 };
    const F = {};
    const field = (l, n) => el("div.field", {}, [el("label", { text: l }), n]);
    const inp = (k, ph) => (F[k] = el("input.input", { value: u[k] || "", placeholder: ph }));
    const sel = (k, opts) => (F[k] = el("select.input", {}, opts.map(o => el("option", { value: o, text: o, selected: u[k] === o }))));
    const form = el("div", {}, [
        field("Nome", inp("name")),
        el("div.form-row", {}, [field("Cargo", sel("role", ROLES)), field("Disponibilidade", sel("avail", AVAIL))]),
        el("div.form-row", {}, [field("Departamento", inp("dept")), field("Especialidade", inp("specialty"))]),
        el("div.form-row", {}, [field("Distintivo", inp("badge")), field("Produtividade (%)", F.productivity = el("input.input", { type: "number", value: u.productivity ?? 80 }))]),
        el("div.form-row", {}, [field("E-mail", inp("email")), field("Telefone", inp("phone"))]),
    ]);
    const m = modal({ title: existing ? "Editar usuário" : "Novo usuário", body: form, wide: true, footer: [
        el("button.btn.ghost", { text: "Cancelar", onclick: () => m.close() }),
        el("button.btn.primary", { html: icon("check") + "Salvar", onclick: async () => {
            if (!F.name.value.trim()) { toast("Informe o nome", { type: "error" }); return; }
            const rec = { id: u.id || uid("u"), name: F.name.value.trim(), role: F.role.value, avail: F.avail.value, dept: F.dept.value, specialty: F.specialty.value, badge: F.badge.value, productivity: +F.productivity.value || 0, email: F.email.value, phone: F.phone.value, lastAccess: u.lastAccess || new Date().toISOString(), createdAt: u.createdAt };
            await put("users", rec); m.close(); toast(existing ? "Usuário atualizado" : "Usuário criado", { type: "success" }); window.__usersReload?.();
        } }),
    ] });
    setTimeout(() => F.name.focus(), 50);
}
