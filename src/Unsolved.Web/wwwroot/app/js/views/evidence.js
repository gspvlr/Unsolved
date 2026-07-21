import { el, clear, fmtDate, uid, debounce } from "../dom.js";
import { icon } from "../icons.js";
import { all, get, put, del } from "../db.js";
import { navigate } from "../router.js";
import { EVIDENCE_TYPES, CUSTODY } from "../models.js";
import { pageHead } from "../widgets.js";
import { skeleton, emptyState, toast, modal, confirmDialog, attachContextMenu } from "../ui.js";
import { getFilter, setFilter, isFav, toggleFav } from "../store.js";
import { evidencePhoto, personPortrait } from "../media.js";
import { prepareImage } from "../uploads.js";
import { canCreateEvidence, canEditEvidence, currentUser, isAdmin, isDetective, visibleCases, visibleEvidence, visiblePeople } from "../auth.js";

let cases = [], users = [], people = [];
const caseCode = (id) => cases.find(c => c.id === id)?.code || "—";
const caseTitle = (id) => cases.find(c => c.id === id)?.title || "";

export default async function renderEvidence(container) {
    clear(container);
    container.appendChild(pageHead("Evidências", "Cadeia de custódia, categorização e integridade", [
        canCreateEvidence() ? el("button.btn.primary", { html: icon("plus") + "Nova evidência", onclick: () => openEvModal() }) : null,
    ]));

    const f = getFilter("evidence", { q: "", type: "all", custody: "all", favOnly: false });
    container.appendChild(evidenceIntake(canCreateEvidence()));
    const body = el("div");
    container.appendChild(toolbar(f, () => paint()));
    container.appendChild(body);
    body.appendChild(skeleton("cards", 8));

    let items;
    const [rawItems, rawCases, loadedUsers, rawPeople] = await Promise.all([all("evidence"), all("cases"), all("users"), all("people")]);
    items = visibleEvidence(rawItems); cases = visibleCases(rawCases); users = loadedUsers; people = visiblePeople(rawPeople, rawCases);
    clear(body);

    function paint() {
        clear(body);
        let list = items.filter(e => {
            if (f.type !== "all" && e.type !== f.type) return false;
            if (f.custody !== "all" && e.custody !== f.custody) return false;
            if (f.favOnly && !isFav("evidence", e.id)) return false;
            if (f.q && !(`${e.code} ${e.title} ${e.type} ${caseCode(e.caseId)}`.toLowerCase().includes(f.q.toLowerCase()))) return false;
            return true;
        }).sort((a, b) => new Date(b.date) - new Date(a.date));
        if (!list.length) { body.appendChild(emptyState({ icon: "box", title: "Nenhuma evidência", text: "Ajuste os filtros aplicados.", action: canCreateEvidence() ? { label: "Nova evidência", icon: "plus", onClick: () => openEvModal() } : null })); return; }
        const grid = el("div.entity-grid");
        list.forEach(e => grid.appendChild(evCard(e)));
        body.appendChild(grid);
    }
    paint();
    const focusId = new URLSearchParams((location.hash.split("?")[1] || "")).get("focus");
    const focused = items.find(item => item.id === focusId);
    if (focused) setTimeout(() => openEvDetail(focused), 60);
    window.__evRepaint = () => { all("evidence").then(x => { items = visibleEvidence(x); paint(); }); };
}

function toolbar(f, onChange) {
    const save = (p) => { Object.assign(f, p); setFilter("evidence", f); onChange(); };
    const search = el("div.searchbar", { style: { maxWidth: "300px" } }, [el("span", { html: icon("search") }), el("input", { placeholder: "Buscar evidências…", value: f.q, oninput: debounce(e => save({ q: e.target.value }), 180) })]);
    const typeChips = el("div", { style: { display: "flex", gap: "6px", flexWrap: "wrap" } }, [["all", "Todas"], ...EVIDENCE_TYPES.map(t => [t, t])].map(([v, l]) => el("button.chip" + (f.type === v ? ".active" : ""), { text: l, onclick: () => save({ type: v }) })));
    const custSel = el("select.input", { style: { width: "auto" }, onchange: e => save({ custody: e.target.value }) }, [el("option", { value: "all", text: "Custódia" }), ...CUSTODY.map(c => el("option", { value: c, text: c, selected: f.custody === c }))]);
    const fav = el("button.chip" + (f.favOnly ? ".active" : ""), { html: icon("star") + "Favoritos", onclick: () => save({ favOnly: !f.favOnly }) });
    return el("div.toolbar", {}, [search, typeChips, el("div.grow"), custSel, fav]);
}

function evCard(e) {
    const fav = isFav("evidence", e.id);
    const linkedPeople = (e.personIds || []).map(id => people.find(p => p.id === id)).filter(Boolean);
    const node = el("div.card.glow.clickable.evidence-record", { onclick: () => openEvDetail(e) }, [
        evidencePhoto(e, "evidence-record-photo"),
        el("div.evidence-record-body", {}, [
          el("div", { style: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" } }, [
            el("div", { style: { minWidth: 0 } }, [el("b", { style: { fontFamily: "var(--font-mono)", color: "var(--accent)", fontSize: ".8rem", display: "block" }, text: e.code }), el("span.muted", { style: { fontSize: ".76rem" }, text: e.type })]),
            el("button.icon-btn", { style: { width: "34px", height: "34px", marginLeft: "auto", color: fav ? "var(--warning)" : "" }, html: icon("star"), onclick: (ev) => { ev.stopPropagation(); const on = toggleFav("evidence", e.id); ev.currentTarget.style.color = on ? "var(--warning)" : ""; toast(on ? "Adicionado aos favoritos" : "Removido", { type: "info" }); } }),
          ]),
          el("div", { style: { fontWeight: "600", marginBottom: "6px" }, text: e.title }),
          el("button.evidence-case-link", { onclick: ev => { ev.stopPropagation(); navigate("casos/" + e.caseId); }, html: icon("folder") + `<span>${caseCode(e.caseId)} · ${caseTitle(e.caseId)}</span>` }),
          linkedPeople.length ? el("div.evidence-people", {}, linkedPeople.map(person => el("span", {}, [personPortrait(person, "mini-person-photo"), el("small", { text: person.name })]))) : null,
          el("div", { style: { display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" } }, [
            el("span.tag", { text: e.custody }),
            el("span.badge", { class: e.integrity === "Íntegra" ? "b-resolvido" : "b-triagem", style: { fontSize: ".68rem" }, html: (e.integrity === "Íntegra" ? icon("shield") : icon("alert")) + e.integrity }),
            el("span.muted", { style: { marginLeft: "auto", fontSize: ".76rem" }, text: fmtDate(e.date) }),
          ]),
        ]),
    ]);
    attachContextMenu(node, () => [
        { label: "Ver detalhes", icon: "eye", action: () => openEvDetail(e) },
        canEditEvidence(e) ? { label: "Editar", icon: "edit", action: () => openEvModal(e) } : null,
        { label: isFav("evidence", e.id) ? "Remover favorito" : "Favoritar", icon: "star", action: () => { toggleFav("evidence", e.id); window.__evRepaint?.(); } },
        isAdmin() ? "-" : null, isAdmin() ? { label: "Excluir", icon: "trash", danger: true, action: () => removeEv(e) } : null,
    ].filter(Boolean));
    return node;
}

function openEvDetail(e) {
    const linkedPeople = (e.personIds || []).map(id => people.find(p => p.id === id)).filter(Boolean);
    const caseRecord = cases.find(c => c.id === e.caseId);
    const openCase = el("button.btn", { html: icon("folder") + "Abrir caso" });
    const openBoard = el("button.btn.primary", { html: icon("share") + "Ver no mural" });
    const body = el("div", {}, [
        el("div.evidence-detail-hero", {}, [
            evidencePhoto(e, "evidence-detail-photo"),
            el("div.evidence-detail-copy", {}, [
                el("span.record-label", { text: "REGISTRO DE CADEIA DE CUSTÓDIA" }),
                el("b.mono", { text: e.code }), el("h2", { text: e.title }),
                el("div", {}, [el("span.tag", { text: e.type }), el("span.tag", { text: e.custody })]),
                el("p", { text: e.notes || e.title }),
            ]),
        ]),
        (e.mediaFiles || []).length > 1 ? el("div.evidence-detail-gallery", {}, (e.mediaFiles || []).map(file => el("figure", {}, [el("img", { src: file.dataUrl, alt: file.name || `Imagem adicional de ${e.code}` }), el("figcaption", { text: file.name || "Imagem anexada" })]))) : null,
        el("div.evidence-detail-grid", {}, [
          el("div.card", {}, [el("div.card-head", {}, [el("h3", { text: "Rastreabilidade" })]), el("dl.def-list", {}, [
              row("Categoria", e.category || e.type), row("Origem", e.origin), row("Integridade", e.integrity), row("Localização", e.location),
              row("Data", fmtDate(e.date)), row("Hash", e.hash), row("Responsável", users.find(u => u.id === e.responsible)?.name || "—"),
          ])]),
          el("div.card.evidence-links-card", {}, [
              el("div.card-head", {}, [el("h3", { text: "Vínculos do registro" })]),
              caseRecord ? el("button.linked-case-row", { onclick: () => openCase.click() }, [el("span", { html: icon("folder") }), el("div", {}, [el("b", { text: caseRecord.title }), el("small.mono", { text: caseRecord.code })]), iconNode("chevronR")]) : null,
              linkedPeople.length ? el("div.linked-person-list", {}, linkedPeople.map(person => el("button", { onclick: () => { m.close(); navigate("pessoas/" + person.id); } }, [personPortrait(person, "mini-person-photo"), el("span", { text: person.name }), iconNode("chevronR")]))) : el("p.muted", { text: "Nenhuma pessoa diretamente vinculada." }),
          ]),
        ]),
    ]);
    const editBtn = canEditEvidence(e) ? el("button.btn", { html: icon("edit") + "Editar" }) : null;
    const m = modal({ title: "Evidência", body, wide: true, footer: [openCase, openBoard, editBtn] });
    openCase.addEventListener("click", () => { m.close(); if (e.caseId) navigate("casos/" + e.caseId); });
    openBoard.addEventListener("click", () => { m.close(); if (e.caseId) navigate("mural?case=" + e.caseId); });
    editBtn?.addEventListener("click", () => { m.close(); openEvModal(e); });
}
function iconNode(name) { return el("span", { html: icon(name) }); }
function row(k, v) { return el("div.di", {}, [el("dt", { text: k }), el("dd", { text: v || "—" })]); }

export async function openEvModal(existing, options = {}) {
    if ((existing && !canEditEvidence(existing)) || (!existing && !canCreateEvidence(options.caseId))) {
        toast("Seu perfil não permite alterar esta evidência", { type: "warning", title: "Somente leitura" });
        return;
    }
    if (!cases.length) {
        const [rawCases, loadedUsers, rawPeople] = await Promise.all([all("cases"), all("users"), all("people")]);
        cases = visibleCases(rawCases); users = loadedUsers; people = visiblePeople(rawPeople, rawCases);
    }
    const defaultCaseId = options.caseId || (isDetective() ? currentUser().assignedCaseId : "");
    const e = existing ? { ...existing } : { type: "Documento", custody: "Coletada", integrity: "Íntegra", caseId: defaultCaseId, personIds: options.personId ? [options.personId] : [] };
    let mediaDataUrl = e.mediaDataUrl || "";
    let mediaName = e.mediaName || "";
    let mediaType = e.mediaType || "";
    let mediaFiles = Array.isArray(e.mediaFiles) ? e.mediaFiles.map(file => ({ ...file })) : [];
    if (mediaDataUrl && !mediaFiles.some(file => file.dataUrl === mediaDataUrl)) mediaFiles.unshift({ id: uid("mf"), dataUrl: mediaDataUrl, name: mediaName || "Imagem principal", type: mediaType || "image/jpeg", createdAt: e.updatedAt || new Date().toISOString() });
    const F = {};
    const field = (l, n) => el("div.field", {}, [el("label", { text: l }), n]);
    const inp = (k, ph) => (F[k] = el("input.input", { value: e[k] || "", placeholder: ph }));
    const sel = (k, opts) => (F[k] = el("select.input", {}, opts.map(o => el("option", { value: o, text: o, selected: e[k] === o }))));
    const fields = el("div.evidence-form-fields", {}, [
        field("Título", inp("title", "Ex.: Registro de acesso")),
        el("div.form-row", {}, [field("Tipo", sel("type", EVIDENCE_TYPES)), field("Custódia", sel("custody", CUSTODY)), field("Integridade", sel("integrity", ["Íntegra", "Verificar"]))]),
        el("div.form-row", {}, [
            field("Caso", F.caseId = el("select.input", { disabled: isDetective() }, [el("option", { value: "", text: "—" }), ...cases.map(c => el("option", { value: c.id, text: c.code + " · " + c.title, selected: e.caseId === c.id }))])),
            field("Responsável", F.responsible = el("select.input", {}, [el("option", { value: "", text: "—" }), ...users.map(u => el("option", { value: u.id, text: u.name, selected: e.responsible === u.id }))])),
        ]),
        field("Pessoa diretamente relacionada", F.personId = el("select.input", {}, [el("option", { value: "", text: "— nenhuma —" }), ...people.map(p => el("option", { value: p.id, text: p.name, selected: (e.personIds || []).includes(p.id) }))])),
        el("div.form-row", {}, [field("Origem", inp("origin", "Local do crime")), field("Localização", inp("location", "Cidade/UF"))]),
        field("Observações", F.notes = el("textarea.input", { text: e.notes || "" })),
    ]);
    const mediaPreview = evidencePhoto({ ...e, mediaDataUrl, mediaType }, "evidence-upload-preview");
    const mediaGallery = el("div.evidence-media-gallery");
    const mediaStatus = el("small.evidence-media-status");
    const fileInput = el("input", { type: "file", accept: "image/*", multiple: true, style: { display: "none" }, onchange: async event => {
        const files = [...(event.target.files || [])]; if (!files.length) return;
        try {
            for (const file of files) {
                const prepared = await prepareImage(file, { maxWidth: 1600, maxHeight: 1600, quality: .9 });
                const media = { id: uid("mf"), dataUrl: prepared.dataUrl, name: prepared.name, type: prepared.type, createdAt: new Date().toISOString() };
                mediaFiles.push(media);
                if (!mediaDataUrl) { mediaDataUrl = media.dataUrl; mediaName = media.name; mediaType = media.type; }
            }
            paintMediaGallery();
        } catch (error) { toast(error.message, { type: "error", title: "Arquivo não adicionado" }); }
        event.target.value = "";
    } });
    const uploadTrigger = el("div.dropzone.compact-dropzone", { role: "button", tabindex: "0", html: `<span class="dropzone-icon">${icon("upload")}</span><b>Adicionar fotos</b><small>Seleção múltipla · JPG ou PNG</small>`, onclick: () => fileInput.click(), onkeydown: event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); fileInput.click(); } } });
    function paintMediaGallery() {
        clear(mediaPreview);
        if (mediaDataUrl) mediaPreview.appendChild(el("img", { src: mediaDataUrl, alt: `Foto principal da evidência ${e.code || "nova"}` }));
        clear(mediaGallery);
        mediaFiles.forEach(file => mediaGallery.appendChild(el("div.evidence-media-thumb" + (file.dataUrl === mediaDataUrl ? ".active" : ""), {}, [
            el("button", { type: "button", style: { backgroundImage: `url(${JSON.stringify(file.dataUrl)})` }, "aria-label": `Usar ${file.name} como imagem principal`, onclick: () => { mediaDataUrl = file.dataUrl; mediaName = file.name; mediaType = file.type; paintMediaGallery(); } }),
            el("button", { type: "button", html: icon("x"), "aria-label": `Excluir ${file.name}`, onclick: () => { mediaFiles = mediaFiles.filter(item => item.id !== file.id); if (file.dataUrl === mediaDataUrl) { const next = mediaFiles[0]; mediaDataUrl = next?.dataUrl || ""; mediaName = next?.name || ""; mediaType = next?.type || ""; } paintMediaGallery(); } }),
        ])));
        mediaStatus.textContent = mediaFiles.length ? `${mediaFiles.length} ${mediaFiles.length === 1 ? "imagem anexada" : "imagens anexadas"} · clique para definir a principal` : "Sem foto própria: a ilustração do arquivo será utilizada.";
    }
    const upload = el("div.evidence-upload-panel", {}, [
        el("span.record-label", { text: existing ? "IMAGEM VINCULADA" : "PRÉVIA DO REGISTRO" }),
        mediaPreview, fileInput, uploadTrigger, mediaStatus, mediaGallery,
        el("p", { text: "A imagem principal aparece no dossiê e no mural. As demais permanecem disponíveis no registro da evidência." }),
    ]);
    const form = el("div.evidence-form-layout", {}, [fields, upload]);
    const m = modal({ title: existing ? "Editar evidência" : "Nova evidência", body: form, wide: true, footer: [
        el("button.btn.ghost", { text: "Cancelar", onclick: () => m.close() }),
        el("button.btn.primary", { html: icon("check") + "Salvar", onclick: save }),
    ] });
    async function save() {
        if (!F.title.value.trim()) { toast("Informe o título", { type: "error" }); return; }
        const rec = {
            id: e.id || uid("e"), code: e.code || ("EV-" + Date.now().toString().slice(-6)),
            title: F.title.value.trim(), type: F.type.value, category: F.type.value, custody: F.custody.value, integrity: F.integrity.value,
            caseId: F.caseId.value, responsible: F.responsible.value, origin: F.origin.value, location: F.location.value,
            notes: F.notes.value, date: e.date || new Date().toISOString(), hash: e.hash || "sha256:" + Math.random().toString(16).slice(2, 14),
            personIds: F.personId.value ? [F.personId.value] : [], mediaDataUrl, mediaName, mediaType, mediaFiles, tags: e.tags || [F.type.value.toLowerCase()], createdAt: e.createdAt,
        };
        await put("evidence", rec);
        if (rec.caseId && rec.personIds[0]) {
            const linkedCase = await get("cases", rec.caseId);
            if (linkedCase && !(linkedCase.people || []).some(link => link.personId === rec.personIds[0])) {
                linkedCase.people = linkedCase.people || [];
                linkedCase.people.push({ personId: rec.personIds[0], role: "Relacionado à evidência" });
                await put("cases", linkedCase);
            }
        }
        m.close(); toast(rec.caseId ? "Evidência salva e vinculada ao mural" : (existing ? "Evidência atualizada" : "Evidência cadastrada"), { type: "success" }); window.__evRepaint?.(); await options.onSaved?.(rec);
    }
    paintMediaGallery();
    setTimeout(() => F.title.focus(), 50);
}
async function removeEv(e) {
    if (!isAdmin()) return toast("Somente o administrador pode excluir evidências", { type: "warning", title: "Ação bloqueada" });
    if (!(await confirmDialog({ title: "Excluir evidência", message: `"${e.title}" será removida da cadeia de custódia.`, confirmText: "Excluir" }))) return;
    await del("evidence", e.id); toast("Evidência excluída", { type: "success" }); window.__evRepaint?.();
}

function evidenceIntake(writable) {
    return el("div.evidence-intake", {}, [
        el("span.evidence-intake-icon", { html: icon("upload") }),
        el("div", {}, [el("b", { text: writable ? "Central de entrada pericial" : "Arquivo pericial em consulta" }), el("small", { text: writable ? "Registre a mídia, atribua o caso e vincule as pessoas relacionadas no mesmo fluxo." : "Seu perfil pode consultar a cadeia de custódia, sem alterar os registros." })]),
        writable ? el("button.btn", { html: icon("plus") + "Cadastrar arquivo", onclick: () => openEvModal() }) : el("span.tag", { html: icon("lock") + "Somente leitura" }),
    ]);
}
