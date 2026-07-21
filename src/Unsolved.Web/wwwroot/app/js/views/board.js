import { el, clear, fmtDate } from "../dom.js";
import { icon } from "../icons.js";
import { all } from "../db.js";
import { navigate } from "../router.js";
import { STAGES, stageBadge, prioBadge } from "../models.js";
import { pageHead } from "../widgets.js";
import { skeleton, emptyState } from "../ui.js";
import { getFilter, setFilter } from "../store.js";
import { evidencePhoto as sharedEvidencePhoto, portraitStyle as sharedPortraitStyle } from "../media.js";
import { openCaseLinks } from "./cases.js";

const BOARD = { width: 1200, height: 720 };
const CASE_POS = { x: 466, y: 252, w: 278, h: 202 };
const CONTEXT_POS = { x: 475, y: 511, w: 246, h: 142 };
const NOTE_POS = { x: 743, y: 505, w: 156, h: 148 };

const PERSON_POSITIONS = [
    { x: 42, y: 68, w: 205, h: 184 },
    { x: 66, y: 426, w: 205, h: 184 },
    { x: 286, y: 515, w: 190, h: 172 },
    { x: 292, y: 42, w: 190, h: 172 },
];

const EVIDENCE_POSITIONS = [
    { x: 934, y: 58, w: 214, h: 174 },
    { x: 957, y: 277, w: 214, h: 174 },
    { x: 918, y: 499, w: 214, h: 174 },
    { x: 723, y: 38, w: 214, h: 174 },
];

const CASE_CONTEXT = {
    c1: { clue: "A mala surgiu 19 minutos depois do último registro da vítima.", question: "Quem possuía a chave da plataforma 4?" },
    c2: { clue: "A assinatura no recibo não corresponde ao traço da vítima.", question: "O documento foi plantado após o crime?" },
    c3: { clue: "Três caixas deixaram o arquivo fora do manifesto oficial.", question: "A retirada irregular motivou o desaparecimento?" },
    c4: { clue: "A fita original termina sete minutos antes do encontro.", question: "Quem substituiu a gravação do Catete?" },
    c5: { clue: "Antenas e câmeras falharam no mesmo intervalo de 11 minutos.", question: "A pane foi coordenada de dentro da central?" },
    c6: { clue: "Acesso eletrônico e DNA apontaram para a mesma janela temporal.", question: "Vínculo confirmado pela perícia." },
    c7: { clue: "O ônibus desviou 4,8 km antes do último contato da motorista.", question: "Quem autorizou a alteração da rota 17?" },
    c8: { clue: "A impressão parcial coincide com a chave codificada recuperada.", question: "Conexão confirmada entre objeto e autor." },
    c9: { clue: "A embarcação retornou com o rádio desligado manualmente.", question: "O que ocorreu antes da mudança da maré?" },
    c10: { clue: "Quadros apagados revelam uma segunda pessoa no elevador.", question: "Quem saiu do prédio pelo acesso técnico?" },
    c11: { clue: "O crachá registrou entrada, mas nenhuma saída correspondente.", question: "Existe uma passagem fora da planta oficial?" },
    c12: { clue: "A entrega foi confirmada por um destinatário inexistente.", question: "Quem criou a ordem do último bilhete?" },
};

const PORTRAIT_CELLS = {
    p1: 9, p2: 21, p3: 5, p4: 17, p5: 1, p6: 4,
    p7: 12, p8: 10, p9: 7, p10: 6, p11: 11, p12: 0,
    p13: 13, p14: 14, p15: 2, p16: 20, p17: 15, p18: 3,
    p19: 19, p20: 8, p21: 18, p22: 23, p23: 16,
};

export default async function renderBoard(container) {
    clear(container);
    container.appendChild(skeleton("cards", 6));

    const [cases, people, evidence, users] = await Promise.all([
        all("cases"), all("people"), all("evidence"), all("users"),
    ]);
    clear(container);

    const query = new URLSearchParams((location.hash.split("?")[1] || ""));
    const selected = cases.find(c => c.id === query.get("case"));
    if (selected) {
        renderCaseBoard(container, selected, cases, people, evidence, users);
        return;
    }

    renderCaseIndex(container, cases, people, evidence, users);
}

function renderCaseIndex(container, cases, people, evidence, users) {
    container.appendChild(pageHead(
        "Mural investigativo",
        "Escolha um caso para visualizar pessoas, evidências, locais e vínculos em um único quadro",
    ));

    const filter = getFilter("investigationBoard", { q: "", stage: "all" });
    const body = el("section");
    const search = el("div.searchbar.board-search", {}, [
        el("span", { html: icon("search") }),
        el("input", {
            placeholder: "Buscar por caso, código ou cidade…",
            value: filter.q,
            "aria-label": "Buscar casos no mural",
            oninput: e => { filter.q = e.target.value; setFilter("investigationBoard", filter); paint(); },
        }),
    ]);
    const stages = el("div.board-filters", {}, [
        ["all", "Todos"],
        ...STAGES.map(stage => [stage, stage]),
    ].map(([value, label]) => el("button.chip" + (filter.stage === value ? ".active" : ""), {
        text: label,
        onclick: () => {
            filter.stage = value;
            setFilter("investigationBoard", filter);
            paint();
        },
    })));

    container.append(
        el("div.board-index-toolbar", {}, [search, stages]),
        el("div.board-index-intro", {}, [
            el("div", {}, [el("b", { text: String(cases.length) }), el("span", { text: "casos catalogados" })]),
            el("div", {}, [el("b", { text: String(people.length) }), el("span", { text: "pessoas relacionadas" })]),
            el("div", {}, [el("b", { text: String(evidence.length) }), el("span", { text: "evidências vinculadas" })]),
            el("p", { text: "Linhas vermelhas indicam vínculos diretos. Linhas douradas mostram cruzamentos entre pessoa e evidência." }),
        ]),
        body,
    );

    function paint() {
        clear(body);
        const term = filter.q.trim().toLowerCase();
        const list = cases
            .filter(c => filter.stage === "all" || c.status === filter.stage)
            .filter(c => !term || `${c.code} ${c.title} ${c.city} ${c.type}`.toLowerCase().includes(term))
            .sort((a, b) => new Date(b.openedAt) - new Date(a.openedAt));

        stages.querySelectorAll("button").forEach(button => {
            button.classList.toggle("active", button.textContent === (filter.stage === "all" ? "Todos" : filter.stage));
        });

        if (!list.length) {
            body.appendChild(emptyState({ icon: "board", title: "Nenhum caso encontrado", text: "Ajuste a busca ou o estágio selecionado." }));
            return;
        }

        const grid = el("div.investigation-index");
        list.forEach(c => {
            const linkedPeople = casePeople(c, people);
            const linkedEvidence = evidence.filter(e => e.caseId === c.id);
            grid.appendChild(caseWallCard(c, linkedPeople, linkedEvidence, users));
        });
        body.appendChild(grid);
    }

    paint();
}

function caseWallCard(c, linkedPeople, linkedEvidence, users) {
    const lead = users.find(u => u.id === c.leadId)?.name || "Não atribuído";
    const firstPerson = linkedPeople[0]?.person;
    const firstEvidence = linkedEvidence[0];
    const connections = linkedPeople.length + linkedEvidence.length + linkedEvidence.reduce((sum, ev) => sum + (ev.personIds?.length || 0), 0);

    return el("button.case-wall-card", {
        type: "button",
        onclick: () => { location.hash = `#/mural?case=${encodeURIComponent(c.id)}`; },
        "aria-label": `Abrir mural do caso ${c.code}: ${c.title}`,
    }, [
        el("div.case-wall-preview", {}, [
            el("span.preview-thread.thread-a"),
            el("span.preview-thread.thread-b"),
            firstPerson ? el("div.preview-portrait", { style: sharedPortraitStyle(firstPerson.id), role: "img", "aria-label": `Retrato ilustrado de ${firstPerson.name}` }) : null,
            firstEvidence ? sharedEvidencePhoto(firstEvidence, "preview-evidence") : el("div.preview-evidence.missing"),
            el("span.preview-pin.pin-a"),
            el("span.preview-pin.pin-b"),
            el("span.preview-stamp", { text: c.status }),
        ]),
        el("div.case-wall-body", {}, [
            el("div.case-wall-code", {}, [el("span.mono", { text: c.code }), prioBadge(c.priority)]),
            el("h2", { text: c.title }),
            el("p", { text: c.description }),
            el("div.case-wall-counts", {}, [
                summaryItem("users", `${linkedPeople.length} pessoas`),
                summaryItem("box", `${linkedEvidence.length} evidências`),
                summaryItem("link", `${connections} conexões`),
            ]),
            el("div.case-wall-foot", {}, [
                el("span", { html: icon("shield") + lead }),
                el("span", { html: icon("map") + `${c.city}/${c.state}` }),
            ]),
        ]),
    ]);
}

function renderCaseBoard(container, c, cases, people, evidence, users) {
    const allLinkedPeople = casePeople(c, people);
    const allLinkedEvidence = evidence.filter(e => e.caseId === c.id);
    const linkedPeople = allLinkedPeople.slice(0, PERSON_POSITIONS.length);
    const linkedEvidence = allLinkedEvidence.slice(0, EVIDENCE_POSITIONS.length);
    const lead = users.find(u => u.id === c.leadId)?.name || "Não atribuído";
    const context = CASE_CONTEXT[c.id] || { clue: c.description, question: "Qual ligação ainda falta confirmar?" };
    const manageLinks = () => openCaseLinks(c, people, evidence, { onChanged: () => renderBoard(container) });

    container.appendChild(pageHead(c.title, `${c.code} · Quadro de vínculos da investigação`, [
        el("button.btn", { html: icon("chevronL") + "Todos os casos", onclick: () => { location.hash = "#/mural"; } }),
        el("button.btn", { html: icon("link") + "Gerenciar vínculos", onclick: manageLinks }),
        el("button.btn.primary", { html: icon("folder") + "Abrir dossiê", onclick: () => navigate(`casos/${c.id}`) }),
    ]));

    const currentIndex = cases.findIndex(item => item.id === c.id);
    const previous = cases[(currentIndex - 1 + cases.length) % cases.length];
    const next = cases[(currentIndex + 1) % cases.length];
    const stats = el("div.board-case-strip", {}, [
        el("div.board-case-status", {}, [stageBadge(c.status), prioBadge(c.priority)]),
        boardMeta("calendar", "Abertura", fmtDate(c.openedAt)),
        boardMeta("users", "Pessoas", String(allLinkedPeople.length)),
        boardMeta("box", "Evidências", String(allLinkedEvidence.length)),
        boardMeta("shield", "Responsável", lead),
        el("div.board-case-nav", {}, [
            el("button.icon-btn", { "aria-label": `Caso anterior: ${previous.title}`, html: icon("chevronL"), onclick: () => { location.hash = `#/mural?case=${previous.id}`; } }),
            el("span.mono", { text: `${currentIndex + 1}/${cases.length}` }),
            el("button.icon-btn", { "aria-label": `Próximo caso: ${next.title}`, html: icon("chevronR"), onclick: () => { location.hash = `#/mural?case=${next.id}`; } }),
        ]),
    ]);

    const board = buildInvestigationBoard(c, linkedPeople, linkedEvidence, lead, context);
    container.append(
        stats,
        el("div.board-legend", {}, [
            el("span", { html: "<i class='legend-line direct'></i> vínculo com o caso" }),
            el("span", { html: "<i class='legend-line cross'></i> cruzamento confirmado" }),
            el("span", { html: "<i class='legend-line pending'></i> hipótese em análise" }),
            el("small", { text: "Passe o cursor sobre uma ficha para destacar suas conexões" }),
        ]),
        el("div.investigation-board-shell", {}, [board]),
        buildLinkedArchive(allLinkedPeople, allLinkedEvidence, manageLinks),
        el("div.board-caption", {}, [
            el("span.mono", { text: "LEITURA DO QUADRO" }),
            el("p", { text: "O caso ocupa o centro. Pessoas aparecem à esquerda; evidências, à direita. Todos os registros permanecem acessíveis no arquivo de vínculos abaixo e são atualizados automaticamente." }),
        ]),
    );
}

function buildInvestigationBoard(c, linkedPeople, linkedEvidence, lead, context) {
    const nodes = [];
    const positions = new Map();
    const edges = [];

    positions.set("case", center(CASE_POS));
    positions.set("context", center(CONTEXT_POS));
    positions.set("note", center(NOTE_POS));

    linkedPeople.forEach((entry, index) => positions.set(entry.person.id, center(PERSON_POSITIONS[index])));
    linkedEvidence.forEach((ev, index) => positions.set(ev.id, center(EVIDENCE_POSITIONS[index])));

    const connect = (a, b, kind, label) => {
        if (positions.has(a) && positions.has(b)) edges.push({ a, b, kind, label });
    };

    linkedPeople.forEach(entry => connect("case", entry.person.id, "direct", `${entry.role} relacionada ao caso`));
    linkedEvidence.forEach(ev => connect("case", ev.id, "direct", `${ev.code} vinculada ao caso`));
    connect("case", "context", "pending", "Contexto territorial e temporal");
    connect("case", "note", "pending", "Hipótese prioritária");

    linkedEvidence.forEach(ev => {
        (ev.personIds || []).forEach(personId => connect(personId, ev.id, "cross", `${ev.code} associada à pessoa`));
    });
    linkedPeople.forEach(({ person }) => {
        (person.relations || []).forEach(relation => connect(person.id, relation.personId, "cross", relation.type));
    });

    const svg = createLinksSvg(edges, positions);

    nodes.push(caseNode(c, CASE_POS));
    linkedPeople.forEach((entry, index) => nodes.push(personNode(entry, PERSON_POSITIONS[index])));
    linkedEvidence.forEach((ev, index) => nodes.push(evidenceNode(ev, EVIDENCE_POSITIONS[index])));
    nodes.push(contextNode(c, lead, CONTEXT_POS));
    nodes.push(noteNode(context, NOTE_POS));

    const board = el("section.investigation-board", { "aria-label": `Mural de vínculos do caso ${c.title}` }, [
        el("div.board-cork-label", {}, [el("span", { text: "ARQUIVO DE VÍNCULOS" }), el("b.mono", { text: c.code })]),
        svg,
        ...nodes,
    ]);

    board.querySelectorAll("[data-node]").forEach(node => {
        node.addEventListener("mouseenter", () => highlightConnections(board, node.dataset.node));
        node.addEventListener("focus", () => highlightConnections(board, node.dataset.node));
        node.addEventListener("mouseleave", () => clearConnections(board));
        node.addEventListener("blur", () => clearConnections(board));
    });
    return board;
}

function createLinksSvg(edges, positions) {
    const namespace = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(namespace, "svg");
    svg.classList.add("board-links");
    svg.setAttribute("viewBox", `0 0 ${BOARD.width} ${BOARD.height}`);
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("aria-hidden", "true");

    edges.forEach(edge => {
        const a = positions.get(edge.a);
        const b = positions.get(edge.b);
        const line = document.createElementNS(namespace, "line");
        line.classList.add("board-link", edge.kind);
        line.dataset.a = edge.a;
        line.dataset.b = edge.b;
        line.setAttribute("x1", String(a.x));
        line.setAttribute("y1", String(a.y));
        line.setAttribute("x2", String(b.x));
        line.setAttribute("y2", String(b.y));
        const title = document.createElementNS(namespace, "title");
        title.textContent = edge.label;
        line.appendChild(title);
        svg.appendChild(line);
    });
    return svg;
}

function caseNode(c, pos) {
    return el("button.board-node.case-board-node", {
        type: "button",
        "data-node": "case",
        style: nodePosition(pos),
        onclick: () => navigate(`casos/${c.id}`),
        "aria-label": `Abrir dossiê do caso ${c.title}`,
    }, [
        el("span.board-node-label", { text: "Caso central" }),
        el("span.mono.case-board-code", { text: c.code }),
        el("h2", { text: c.title }),
        el("p", { text: c.description }),
        el("div.case-board-badges", {}, [stageBadge(c.status), prioBadge(c.priority)]),
    ]);
}

function personNode({ person, role }, pos) {
    const age = new Date().getFullYear() - Number(person.birthYear || new Date().getFullYear());
    return el("button.board-node.person-board-node", {
        type: "button",
        "data-node": person.id,
        style: nodePosition(pos),
        onclick: () => navigate(`pessoas/${person.id}`),
        "aria-label": `Abrir ficha de ${person.name}, ${role}`,
    }, [
        el("div.person-board-photo", { style: sharedPortraitStyle(person), role: "img", "aria-label": `Retrato de ${person.name}` }),
        el("div.person-board-copy", {}, [
            el("span.person-role", { text: role }),
            el("b", { text: person.name }),
            el("small", { text: `${person.profession || "Ocupação não informada"} · ${age} anos` }),
            el("em", { text: person.city || "Local não informado" }),
        ]),
    ]);
}

function evidenceNode(ev, pos) {
    return el("button.board-node.evidence-board-node", {
        type: "button",
        "data-node": ev.id,
        style: nodePosition(pos),
        onclick: () => navigate(`evidencias?focus=${ev.id}`),
        "aria-label": `Abrir módulo de evidências para ${ev.code}`,
    }, [
        sharedEvidencePhoto(ev, "evidence-board-photo"),
        el("div.evidence-board-copy", {}, [
            el("span.mono", { text: ev.code }),
            el("b", { text: ev.type }),
            el("small", { text: `${ev.origin} · ${ev.custody}` }),
            el("em", { text: `${ev.integrity} · ${fmtDate(ev.date)}` }),
        ]),
    ]);
}

function buildLinkedArchive(linkedPeople, linkedEvidence, manageLinks) {
    return el("section.board-linked-archive", {}, [
        el("div.board-linked-head", {}, [
            el("div", {}, [el("span.record-label", { text: "ARQUIVO VINCULADO" }), el("h3", { text: "Tudo que compõe este mural" })]),
            el("span.board-sync-state", { html: icon("check") + "Sincronizado automaticamente" }),
        ]),
        el("div.board-linked-grid", {}, [
            el("div", {}, [
                el("b", { text: `${linkedPeople.length} pessoas` }),
                el("div.board-linked-list", {}, linkedPeople.map(({ person, role }) => el("button", { onclick: () => navigate(`pessoas/${person.id}`) }, [
                    el("div.mini-person-photo", { style: sharedPortraitStyle(person), role: "img", "aria-label": `Retrato de ${person.name}` }),
                    el("span", {}, [el("b", { text: person.name }), el("small", { text: role })]), iconNode("chevronR"),
                ]))),
            ]),
            el("div", {}, [
                el("b", { text: `${linkedEvidence.length} evidências` }),
                el("div.board-linked-list", {}, linkedEvidence.map(item => el("button", { onclick: () => navigate(`evidencias?focus=${item.id}`) }, [
                    sharedEvidencePhoto(item, "board-archive-evidence"),
                    el("span", {}, [el("b", { text: item.title }), el("small.mono", { text: `${item.code} · ${item.type}` })]), iconNode("chevronR"),
                ]))),
            ]),
        ]),
        el("button.btn.board-manage-cta", { html: icon("plus") + "Adicionar ou editar vínculos", onclick: manageLinks }),
    ]);
}

function iconNode(name) { return el("span", { html: icon(name) }); }

function contextNode(c, lead, pos) {
    return el("article.board-node.context-board-node", { "data-node": "context", style: nodePosition(pos), tabindex: "0" }, [
        el("span.board-node-label", { text: "Contexto do caso" }),
        el("div", { html: icon("map") + `<b>${c.city}/${c.state}</b>` }),
        el("p", { text: `${c.type} registrado em ${fmtDate(c.openedAt)}.` }),
        el("small", { text: `Responsável: ${lead}` }),
    ]);
}

function noteNode(context, pos) {
    return el("aside.board-node.hypothesis-note", { "data-node": "note", style: nodePosition(pos), tabindex: "0" }, [
        el("span", { text: "Pista-chave" }),
        el("p", { text: context.clue }),
        el("b", { text: context.question }),
    ]);
}

function evidencePhoto(ev, className) {
    return el(`div.${className}`, { style: evidenceAtlasStyle(ev.id) }, [el("img", {
        src: `/images/evidence/${ev.code}.svg`,
        alt: `Ilustração da evidência ${ev.code}`,
        loading: "lazy",
        onerror: event => {
            const frame = event.currentTarget.parentElement;
            frame.classList.add("uses-atlas");
            event.currentTarget.remove();
        },
    })]);
}

function portraitStyle(id) {
    if (id === "p24") {
        return {
            backgroundImage: "url('/app/assets/portrait-p24.png')",
            backgroundSize: "cover",
            backgroundPosition: "center 28%",
        };
    }
    const index = PORTRAIT_CELLS[id] ?? 22;
    const column = index % 6;
    const row = Math.floor(index / 6);
    return {
        backgroundImage: "url('/app/assets/portrait-atlas.png')",
        backgroundSize: "600% 400%",
        backgroundPosition: `${column * 20}% ${row * (100 / 3)}%`,
    };
}

function evidenceAtlasStyle(id) {
    const numericId = Number(String(id).replace(/\D/g, "")) || 1;
    const index = (numericId - 1) % 24;
    const column = index % 6;
    const row = Math.floor(index / 6);
    return {
        backgroundImage: "url('/app/assets/evidence-atlas.png')",
        backgroundSize: "600% 400%",
        backgroundPosition: `${column * 20}% ${row * (100 / 3)}%`,
    };
}

function casePeople(c, people) {
    return (c.people || []).map(link => ({
        ...link,
        person: people.find(person => person.id === link.personId),
    })).filter(link => link.person);
}

function nodePosition(pos) {
    return { left: `${pos.x}px`, top: `${pos.y}px`, width: `${pos.w}px`, height: `${pos.h}px` };
}

function center(pos) {
    return { x: pos.x + pos.w / 2, y: pos.y + pos.h / 2 };
}

function summaryItem(ic, text) {
    return el("span", { html: icon(ic) + text });
}

function boardMeta(ic, label, value) {
    return el("div.board-meta", {}, [
        el("span", { html: icon(ic) }),
        el("div", {}, [el("small", { text: label }), el("b", { text: value })]),
    ]);
}

function highlightConnections(board, nodeId) {
    const lines = board.querySelectorAll(".board-link");
    lines.forEach(line => {
        const related = line.dataset.a === nodeId || line.dataset.b === nodeId;
        line.classList.toggle("is-active", related);
        line.classList.toggle("is-muted", !related);
    });
}

function clearConnections(board) {
    board.querySelectorAll(".board-link").forEach(line => line.classList.remove("is-active", "is-muted"));
}
