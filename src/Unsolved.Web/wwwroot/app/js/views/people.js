import { el, clear, fmtDate, uid, debounce } from "../dom.js";
import { icon } from "../icons.js";
import { all, get, put, del } from "../db.js";
import { navigate } from "../router.js";
import { PERSON_ROLES } from "../models.js";
import { pageHead } from "../widgets.js";
import { skeleton, emptyState, toast, modal, confirmDialog, attachContextMenu } from "../ui.js";
import { getFilter, setFilter } from "../store.js";
import { evidencePhoto, personPortrait, portraitStyle } from "../media.js";
import { prepareImage } from "../uploads.js";

export async function renderPeople(container) {
    clear(container);
    container.appendChild(pageHead("Pessoas", "Cadastro único reutilizado em vítimas, suspeitos e testemunhas", [
        el("button.btn.primary", { html: icon("plus") + "Cadastrar pessoa", onclick: () => openPersonModal() }),
    ]));
    const f = getFilter("people", { q: "" });
    const body = el("div");
    container.appendChild(el("div.toolbar", {}, [
        el("div.searchbar", { style: { maxWidth: "340px" } }, [el("span", { html: icon("search") }), el("input", { placeholder: "Buscar por nome, profissão, cidade…", value: f.q, oninput: debounce(e => { f.q = e.target.value; setFilter("people", f); paint(); }, 180) })]),
    ]));
    container.appendChild(body);
    body.appendChild(skeleton("cards", 8));

    let people, cases;
    [people, cases] = await Promise.all([all("people"), all("cases")]);
    clear(body);
    const caseLinks = (pid) => cases.filter(c => (c.people || []).some(p => p.personId === pid));

    function paint() {
        clear(body);
        const list = people.filter(p => !f.q || `${p.name} ${p.profession} ${p.city} ${p.cpf}`.toLowerCase().includes(f.q.toLowerCase()))
            .sort((a, b) => a.name.localeCompare(b.name));
        if (!list.length) { body.appendChild(emptyState({ icon: "users", title: "Nenhuma pessoa", action: { label: "Cadastrar", icon: "plus", onClick: () => openPersonModal() } })); return; }
        const grid = el("div.entity-grid");
        list.forEach(p => {
            const linked = caseLinks(p.id);
            const roles = [...new Set(linked.map(c => c.people.find(x => x.personId === p.id)?.role).filter(Boolean))];
            const node = el("div.card.glow.clickable.person-card.person-record", { onclick: () => navigate("pessoas/" + p.id) }, [
                personPortrait(p, "person-list-photo"),
                el("div.p-main", { style: { flex: 1 } }, [
                    el("span.record-label", { text: `CADASTRO ${p.id.toUpperCase()}` }),
                    el("b", { text: p.name }),
                    el("span", { text: `${p.profession || "—"} · ${p.city || "Local não informado"}` }),
                    el("div.person-role-row", {}, roles.slice(0, 2).map(role => el("span.tag", { text: role }))),
                    el("div.person-record-foot", {}, [
                        el("span", { html: icon("folder") + `${linked.length} ${linked.length === 1 ? "caso" : "casos"}` }),
                        el("span", { text: linked[0]?.code || "Sem vínculo ativo" }),
                    ]),
                ]),
            ]);
            attachContextMenu(node, () => [
                { label: "Abrir perfil", icon: "eye", action: () => navigate("pessoas/" + p.id) },
                { label: "Editar", icon: "edit", action: () => openPersonModal(p) },
                "-", { label: "Excluir", icon: "trash", danger: true, action: () => removePerson(p) },
            ]);
            grid.appendChild(node);
        });
        body.appendChild(grid);
    }
    paint();
    window.__pplRepaint = () => all("people").then(x => { people = x; paint(); });
}

export async function openPersonModal(existing, options = {}) {
    const cases = await all("cases");
    const p = existing ? { ...existing } : { sex: "M", maritalStatus: "Solteiro(a)" };
    let photoDataUrl = p.photoDataUrl || "";
    let photoName = p.photoName || "";
    let photos = Array.isArray(p.photos) ? p.photos.map(photo => ({ ...photo })) : [];
    if (photoDataUrl && !photos.some(photo => photo.dataUrl === photoDataUrl)) photos.unshift({ id: uid("ph"), dataUrl: photoDataUrl, name: photoName || "Foto principal", createdAt: p.updatedAt || new Date().toISOString() });
    const F = {};
    const field = (l, n) => el("div.field", {}, [el("label", { text: l }), n]);
    const inp = (k, ph) => (F[k] = el("input.input", { value: p[k] || "", placeholder: ph }));
    const photoPreview = el("div.person-editor-photo", { style: portraitStyle({ ...p, photoDataUrl }), role: "img", "aria-label": "Prévia da foto da pessoa" });
    const photoGallery = el("div.person-photo-gallery");
    const fileInput = el("input", { type: "file", accept: "image/*", multiple: true, style: { display: "none" }, onchange: async event => {
        const files = [...(event.target.files || [])]; if (!files.length) return;
        try {
            for (const file of files) {
                const prepared = await prepareImage(file, { maxWidth: 1200, maxHeight: 1200, quality: .88 });
                const photo = { id: uid("ph"), dataUrl: prepared.dataUrl, name: prepared.name, createdAt: new Date().toISOString() };
                photos.push(photo);
                if (!photoDataUrl) { photoDataUrl = photo.dataUrl; photoName = photo.name; }
            }
            paintPhotoGallery();
        } catch (error) { toast(error.message, { type: "error", title: "Foto não adicionada" }); }
        event.target.value = "";
    } });
    const removePhoto = el("button.btn.sm.ghost", { text: "Remover principal", style: { display: photoDataUrl ? "inline-flex" : "none" }, onclick: () => {
        photos = photos.filter(photo => photo.dataUrl !== photoDataUrl);
        photoDataUrl = photos[0]?.dataUrl || ""; photoName = photos[0]?.name || "";
        paintPhotoGallery();
    } });
    const photoStatus = el("small", { text: photoName || (photoDataUrl ? "Foto personalizada salva" : "JPG ou PNG · até 10 MB") });
    function paintPhotoGallery() {
        Object.assign(photoPreview.style, portraitStyle(photoDataUrl ? { ...p, photoDataUrl } : { ...p, photoDataUrl: "" }));
        clear(photoGallery);
        photos.forEach(photo => photoGallery.appendChild(el("div.person-photo-thumb" + (photo.dataUrl === photoDataUrl ? ".active" : ""), {}, [
            el("button", { type: "button", style: { backgroundImage: `url(${JSON.stringify(photo.dataUrl)})` }, "aria-label": `Usar ${photo.name} como foto principal`, onclick: () => { photoDataUrl = photo.dataUrl; photoName = photo.name; paintPhotoGallery(); } }),
            el("button", { type: "button", html: icon("x"), "aria-label": `Excluir ${photo.name}`, onclick: () => { photos = photos.filter(item => item.id !== photo.id); if (photo.dataUrl === photoDataUrl) { photoDataUrl = photos[0]?.dataUrl || ""; photoName = photos[0]?.name || ""; } paintPhotoGallery(); } }),
        ])));
        removePhoto.style.display = photoDataUrl ? "inline-flex" : "none";
        photoStatus.textContent = photos.length ? `${photos.length} ${photos.length === 1 ? "foto no arquivo" : "fotos no arquivo"} · clique para definir a principal` : "JPG ou PNG · até 10 MB por imagem";
    }
    const selectedCaseId = options.caseId || "";
    const linkFields = el("div.person-case-fields", {}, [
        field("Vincular ao caso", F.caseId = el("select.input", {}, [el("option", { value: "", text: "— salvar sem vínculo —" }), ...cases.map(c => el("option", { value: c.id, text: `${c.code} · ${c.title}`, selected: c.id === selectedCaseId }))])),
        field("Papel no caso", F.caseRole = el("select.input", {}, PERSON_ROLES.map(role => el("option", { value: role, text: role, selected: role === (options.role || "Testemunha") })))),
        el("p.link-auto-note", { html: icon("share") + "Ao selecionar um caso, esta pessoa aparecerá automaticamente no mural." }),
    ]);
    const fields = el("div.person-editor-fields", {}, [
        field("Nome completo", inp("name", "Nome e sobrenome")),
        el("div.form-row", {}, [field("CPF", inp("cpf")), field("RG", inp("rg")), field("Nascimento (ano)", inp("birthYear"))]),
        el("div.form-row", {}, [field("Sexo", F.sex = sel(p, "sex", ["M", "F", "Outro"])), field("Estado civil", F.maritalStatus = sel(p, "maritalStatus", ["Solteiro(a)", "Casado(a)", "Divorciado(a)", "Viúvo(a)"])), field("Profissão", inp("profession"))]),
        el("div.form-row", {}, [field("Cidade", inp("city")), field("Telefone", F.phone = el("input.input", { value: (p.phones || [])[0] || "" }))]),
        field("E-mail", F.email = el("input.input", { value: (p.emails || [])[0] || "" })),
        field("Endereço", inp("address")),
        field("Observações", F.notes = el("textarea.input", { text: p.notes || "" })),
    ]);
    const form = el("div.person-editor-layout", {}, [
        el("aside.person-photo-editor", {}, [
            el("span.record-label", { text: "FOTO DO ARQUIVO" }), photoPreview,
            fileInput,
            el("button.btn.sm", { html: icon("upload") + "Adicionar foto", onclick: () => fileInput.click() }),
            removePhoto, photoStatus, photoGallery,
        ]),
        el("div", {}, [fields, linkFields]),
    ]);
    const m = modal({ title: existing ? "Editar pessoa" : "Cadastrar pessoa", body: form, wide: true, footer: [
        el("button.btn.ghost", { text: "Cancelar", onclick: () => m.close() }),
        el("button.btn.primary", { html: icon("check") + "Salvar", onclick: save }),
    ] });
    async function save() {
        if (!F.name.value.trim()) { toast("Informe o nome", { type: "error" }); return; }
        const rec = { id: p.id || uid("p"), name: F.name.value.trim(), cpf: F.cpf.value, rg: F.rg.value, birthYear: F.birthYear.value, sex: F.sex.value, maritalStatus: F.maritalStatus.value, profession: F.profession.value, city: F.city.value, phones: F.phone.value ? [F.phone.value] : [], emails: F.email.value ? [F.email.value] : [], address: F.address.value, notes: F.notes.value, relations: p.relations || [], photoDataUrl, photoName, photos, createdAt: p.createdAt };
        await put("people", rec);
        if (F.caseId.value) {
            const linkedCase = await get("cases", F.caseId.value);
            if (linkedCase) {
                linkedCase.people = linkedCase.people || [];
                const currentLink = linkedCase.people.find(link => link.personId === rec.id);
                if (currentLink) currentLink.role = F.caseRole.value;
                else linkedCase.people.push({ personId: rec.id, role: F.caseRole.value });
                await put("cases", linkedCase);
            }
        }
        m.close(); toast(F.caseId.value ? "Pessoa salva e vinculada ao mural" : (existing ? "Pessoa atualizada" : "Pessoa cadastrada"), { type: "success" });
        window.__pplRepaint?.(); window.__personDetailReload?.(); await options.onSaved?.(rec);
    }
    paintPhotoGallery();
    setTimeout(() => F.name.focus(), 50);
}
function sel(obj, k, opts) { return el("select.input", {}, opts.map(o => el("option", { value: o, text: o, selected: obj[k] === o }))); }

async function removePerson(p) {
    if (!(await confirmDialog({ title: "Excluir pessoa", message: `"${p.name}" será removida do cadastro.`, confirmText: "Excluir" }))) return;
    await del("people", p.id); toast("Pessoa excluída", { type: "success" }); window.__pplRepaint?.();
    if (location.hash.startsWith("#/pessoas/")) navigate("pessoas");
}

/* ============================ DETALHE ============================ */
export async function renderPersonDetail(container, params) {
    clear(container);
    const [p, people, cases, evidence] = await Promise.all([get("people", params.id), all("people"), all("cases"), all("evidence")]);
    if (!p) { container.appendChild(emptyState({ icon: "users", title: "Pessoa não encontrada", action: { label: "Voltar", onClick: () => navigate("pessoas") } })); return; }
    const relatedCases = cases.filter(c => (c.people || []).some(x => x.personId === p.id));
    const relatedEv = evidence.filter(e => (e.personIds || []).includes(p.id));
    const photoArchive = (p.photos || (p.photoDataUrl ? [{ id: "main", dataUrl: p.photoDataUrl, name: p.photoName || "Foto principal" }] : []));
    const personName = (id) => people.find(x => x.id === id)?.name || "—";
    window.__personDetailReload = () => renderPersonDetail(container, params);

    container.appendChild(el("div.page-head", {}, [
        el("div", {}, [el("a.crumbs", { href: "#/pessoas", style: { cursor: "pointer" }, html: `<span>${icon("chevronL")}</span><span>Pessoas</span>` })]),
        el("div.actions", {}, [el("button.btn", { html: icon("edit") + "Editar", onclick: () => openPersonModal(p) }), el("button.btn.danger", { html: icon("trash"), onclick: () => removePerson(p) })]),
    ]));

    // Hero
    container.appendChild(el("div.card.person-profile-hero", {}, [
        personPortrait(p, "person-profile-photo"),
        el("div.person-profile-copy", {}, [
            el("span.record-label", { text: `ARQUIVO INDIVIDUAL · ${p.id.toUpperCase()}` }),
            el("h1", { style: { margin: "0 0 4px" }, text: p.name }),
            el("div.muted", { text: `${p.profession || "—"} · ${p.city || ""} · ${p.birthYear ? (new Date().getFullYear() - p.birthYear) + " anos" : ""}` }),
            el("div", { style: { marginTop: "10px", display: "flex", gap: "8px", flexWrap: "wrap" } }, [
                el("span.tag", { html: icon("folder") + relatedCases.length + " casos" }),
                el("span.tag", { html: icon("box") + relatedEv.length + " evidências" }),
                el("span.tag", { html: icon("link") + (p.relations?.length || 0) + " vínculos" }),
                el("span.tag", { html: icon("eye") + photoArchive.length + " fotos" }),
            ]),
        ]),
        relatedCases.length ? el("div.person-profile-case", {}, [
            el("span.record-label", { text: "VÍNCULO MAIS RECENTE" }),
            el("b", { text: relatedCases[0].title }),
            el("small", { text: `${relatedCases[0].code} · ${(relatedCases[0].people.find(x => x.personId === p.id) || {}).role || "Envolvido"}` }),
            el("div", {}, [
                el("button.btn.sm", { html: icon("folder") + "Abrir caso", onclick: () => navigate("casos/" + relatedCases[0].id) }),
                el("button.btn.sm.ghost", { html: icon("share") + "Mural", onclick: () => navigate("mural?case=" + relatedCases[0].id) }),
            ]),
        ]) : null,
    ]));

    const TABS = ["Dados", "Relacionamentos", "Casos", "Evidências", "Rede de conexões", "Linha do tempo"];
    let active = "Dados";
    const tabsEl = el("div.tabs"); const tabBody = el("div.tab-body");
    TABS.forEach(t => tabsEl.appendChild(el("button" + (t === active ? ".active" : ""), { text: t, onclick: () => { active = t; [...tabsEl.children].forEach(b => b.classList.toggle("active", b.textContent === t)); paint(); } })));
    container.append(tabsEl, tabBody);

    function paint() {
        clear(tabBody);
        if (active === "Dados") tabBody.appendChild(el("div.person-data-stack", {}, [
            el("div.two-col", {}, [
                el("div.card", {}, [el("div.card-head", {}, [el("h3", { text: "Dados pessoais" })]), el("dl.def-list", {}, [
                    di("CPF", p.cpf), di("RG", p.rg), di("Nascimento", p.birthYear), di("Sexo", p.sex), di("Estado civil", p.maritalStatus), di("Profissão", p.profession),
                ])]),
                el("div.card", {}, [el("div.card-head", {}, [el("h3", { text: "Contato" })]), el("dl.def-list", {}, [
                    di("Telefone", (p.phones || [])[0]), di("E-mail", (p.emails || [])[0]), di("Cidade", p.city), di("Endereço", p.address), di("Observações", p.notes),
                ])]),
            ]),
            photoArchive.length ? el("div.card.person-photo-archive", {}, [
                el("div.card-head", {}, [el("h3", { text: "Arquivo fotográfico" }), el("span.tag", { text: `${photoArchive.length} imagens` })]),
                el("div", {}, photoArchive.map(photo => el("figure", {}, [el("img", { src: photo.dataUrl, alt: photo.name || `Foto de ${p.name}` }), el("figcaption", { text: photo.name || "Imagem arquivada" })]))),
            ]) : null,
        ]));
        else if (active === "Relacionamentos") tabBody.appendChild(relTab(p, people, personName));
        else if (active === "Casos") tabBody.appendChild(relatedCases.length ? el("div.entity-grid", {}, relatedCases.map(c => el("div.card.person-case-link", {}, [
            el("div", {}, [el("b.mono", { text: c.code }), el("span.tag", { text: (c.people.find(x => x.personId === p.id) || {}).role || "Envolvido" })]),
            el("h3", { text: c.title }),
            el("p", { text: c.description }),
            el("div.person-link-actions", {}, [
                el("button.btn.sm", { html: icon("folder") + "Abrir caso", onclick: () => navigate("casos/" + c.id) }),
                el("button.btn.sm.ghost", { html: icon("share") + "Ver conexões", onclick: () => navigate("mural?case=" + c.id) }),
            ]),
        ]))) : emptyState({ icon: "folder", title: "Sem casos vinculados" }));
        else if (active === "Evidências") tabBody.appendChild(relatedEv.length ? el("div.entity-grid", {}, relatedEv.map(e => el("div.card.clickable.person-evidence-link", { onclick: () => navigate("evidencias?focus=" + e.id) }, [
            evidencePhoto(e, "evidence-card-photo"),
            el("div", {}, [el("b.mono", { text: e.code }), el("h3", { text: e.title }), el("span.tag", { text: e.type })]),
        ]))) : emptyState({ icon: "box", title: "Sem evidências vinculadas" }));
        else if (active === "Rede de conexões") tabBody.appendChild(networkTab(p, people, relatedCases));
        else if (active === "Linha do tempo") tabBody.appendChild(relatedCases.length ? el("div.tl", {}, relatedCases.sort((a, b) => new Date(a.openedAt) - new Date(b.openedAt)).map(c => el("div.tl-event", {}, [el("div.tl-node", { html: icon("folder") }), el("div.card.pad-sm", { onclick: () => navigate("casos/" + c.id), style: { cursor: "pointer" } }, [el("b", { text: c.title }), el("div.muted", { style: { fontSize: ".8rem" }, text: fmtDate(c.openedAt) + " · " + c.code })])]))) : emptyState({ icon: "timeline", title: "Sem eventos" }));
    }
    paint();
}
function di(k, v) { return el("div.di", {}, [el("dt", { text: k }), el("dd", { text: v || "—" })]); }

function relTab(p, people, personName) {
    const wrap = el("div");
    const list = el("div.grid", { style: { gap: "10px", marginBottom: "16px" } });
    function paint() {
        clear(list);
        (p.relations || []).forEach((r, i) => list.appendChild(el("div.card.pad-sm", { style: { display: "flex", alignItems: "center", gap: "12px" } }, [
            personPortrait(people.find(x => x.id === r.personId), "mini-person-photo"), el("div", { style: { flex: 1 } }, [el("b", { text: personName(r.personId) }), el("div.muted", { style: { fontSize: ".78rem" }, text: r.type })]),
            el("button.btn.sm.ghost", { text: "Abrir", onclick: () => navigate("pessoas/" + r.personId) }),
            el("button.icon-btn", { style: { width: "34px", height: "34px" }, html: icon("trash"), onclick: async () => { p.relations.splice(i, 1); await put("people", p); paint(); toast("Vínculo removido", { type: "info" }); } }),
        ])));
        if (!(p.relations || []).length) list.appendChild(emptyState({ icon: "link", title: "Nenhum vínculo" }));
    }
    paint();
    const selP = el("select.input", {}, [el("option", { value: "", text: "Selecionar pessoa…" }), ...people.filter(x => x.id !== p.id).map(x => el("option", { value: x.id, text: x.name }))]);
    const selT = el("select.input", {}, ["Associado", "Familiar", "Contato", "Conhecido", "Cúmplice", "Suspeito de vínculo"].map(t => el("option", { value: t, text: t })));
    const addBtn = el("button.btn.primary", { html: icon("plus") + "Vincular", onclick: async () => { if (!selP.value) return; p.relations = p.relations || []; p.relations.push({ personId: selP.value, type: selT.value }); await put("people", p); paint(); toast("Vínculo criado", { type: "success" }); } });
    wrap.append(list, el("div.card", {}, [el("div.card-head", {}, [el("h3", { text: "Adicionar vínculo" })]), el("div.form-row", {}, [el("div.field", {}, [el("label", { text: "Pessoa" }), selP]), el("div.field", {}, [el("label", { text: "Tipo" }), selT])]), addBtn]));
    return wrap;
}

function networkTab(p, people, relatedCases) {
    // Rede v1: nó central + pessoas vinculadas diretas + co-envolvidos em casos.
    const personName = (id) => people.find(x => x.id === id)?.name || "—";
    const connectedIds = new Set();
    (p.relations || []).forEach(r => connectedIds.add(r.personId));
    relatedCases.forEach(c => (c.people || []).forEach(x => { if (x.personId !== p.id) connectedIds.add(x.personId); }));
    const nodes = [...connectedIds].slice(0, 8);
    const graph = el("div.rel-graph.card", { style: { minHeight: "360px" } });
    const center = el("div.rel-node", { style: { left: "50%", top: "50%", transform: "translate(-50%,-50%)", zIndex: 2 } }, [personPortrait(p, "network-person-photo", { style: { boxShadow: "var(--glow)" } }), el("span", { text: p.name })]);
    graph.appendChild(center);
    const R = 140;
    nodes.forEach((id, i) => {
        const a = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
        const x = 50 + Math.cos(a) * 34, y = 50 + Math.sin(a) * 40;
        const line = el("div.rel-line", { style: { left: "50%", top: "50%", width: R + "px", transform: `rotate(${a}rad)` } });
        graph.appendChild(line);
        graph.appendChild(el("div.rel-node", { style: { left: x + "%", top: y + "%", transform: "translate(-50%,-50%)", cursor: "pointer" }, onclick: () => navigate("pessoas/" + id) }, [personPortrait(people.find(x => x.id === id), "network-person-photo"), el("span", { text: personName(id) })]));
    });
    if (!nodes.length) return emptyState({ icon: "share", title: "Sem conexões mapeadas", text: "Adicione vínculos ou relacione a pessoa a casos." });
    return el("div", {}, [el("p.muted", { style: { marginBottom: "12px" }, text: "Vínculos diretos e co-envolvimentos em casos (v1)." }), graph]);
}
