// Seed inicial (gravado no IndexedDB apenas na primeira execução).
import { bulkPut, isEmpty } from "./db.js";
import { uid } from "./dom.js";

const iso = (y, m, d, h = 9) => new Date(y, m - 1, d, h, 0).toISOString();
const daysAgo = (n) => new Date(Date.now() - n * 864e5).toISOString();
const pick = (a) => a[Math.floor(Math.random() * a.length)];

export async function ensureSeed() {
    if (!(await isEmpty())) return;

    const users = [
        { id: "u1", name: "Marina Duarte", role: "Supervisor", dept: "Inteligência", specialty: "Análise comportamental", avail: "Disponível", productivity: 92, lastAccess: daysAgo(0), badge: "INV-1042", email: "m.duarte@unsolved.gov", phone: "(51) 99120-4410" },
        { id: "u2", name: "Rafael Nunes", role: "Detetive", dept: "Perícia digital", specialty: "Forense computacional", avail: "Ocupado", productivity: 88, lastAccess: daysAgo(0), badge: "INV-1178", email: "r.nunes@unsolved.gov", phone: "(11) 99833-2201" },
        { id: "u3", name: "Camila Torres", role: "Investigador", dept: "Crimes contra a pessoa", specialty: "Homicídios", avail: "Disponível", productivity: 95, lastAccess: daysAgo(1), badge: "INV-0981", email: "c.torres@unsolved.gov", phone: "(21) 99777-1180" },
        { id: "u4", name: "Diego Martins", role: "Analista", dept: "Inteligência", specialty: "Vínculos e redes", avail: "Ausente", productivity: 79, lastAccess: daysAgo(3), badge: "INV-1255", email: "d.martins@unsolved.gov", phone: "(41) 99500-7788" },
        { id: "u5", name: "Lívia Araújo", role: "Detetive", dept: "Genética forense", specialty: "DNA", avail: "Disponível", productivity: 90, lastAccess: daysAgo(0), badge: "INV-1310", email: "l.araujo@unsolved.gov", phone: "(71) 99321-6655" },
        { id: "u6", name: "A. Marques", role: "Administrador", dept: "Coordenação", specialty: "Gestão de casos", avail: "Disponível", productivity: 84, lastAccess: daysAgo(0), badge: "INV-1001", email: "a.marques@unsolved.gov", phone: "(11) 99000-0001" },
    ];

    const cityData = [
        ["São Paulo", "SP"], ["Rio de Janeiro", "RJ"], ["Porto Alegre", "RS"], ["Recife", "PE"],
        ["Manaus", "AM"], ["Belo Horizonte", "MG"], ["Curitiba", "PR"], ["Salvador", "BA"],
    ];

    const personSeed = [
        ["Ana Beatriz Lima", 1969, "F", "Fotógrafa", "Vítima principal do caso da estação."],
        ["Paulo Henrique Reis", 1966, "M", "Comerciante", "Comerciante conhecido no centro antigo."],
        ["Clara Menezes", 1977, "F", "Pesquisadora", "Ligada ao arquivo portuário."],
        ["Renato Alves", 1963, "M", "Jornalista", "Investigava contratos públicos."],
        ["Joana Silva Prado", 1981, "F", "Técnica de telecom", "Acesso aos equipamentos de sinal."],
        ["Eduardo Campos Luz", 1974, "M", "Representante", "Hóspede do quarto 312."],
        ["Márcia Oliveira", 1982, "F", "Motorista", "Linha intermunicipal."],
        ["Daniel Kato", 1987, "M", "Arquiteto", "Colecionador de chaves antigas."],
        ["Sônia Batista", 1990, "F", "Pescadora", "Comunidade costeira local."],
        ["Leandro Gomes", 1992, "M", "Manutenção", "Operador predial."],
        ["Patrícia Rosa", 1988, "F", "Analista", "Contratos internos."],
        ["Carlos Viana", 1995, "M", "Mensageiro", "Entregas sob demanda."],
        ["Mauro Tavares", 1968, "M", "Sem ocupação fixa", "Pessoa de interesse recorrente."],
        ["Lúcia Farias", 1972, "F", "Ex-administradora", "Acesso ao arquivo portuário."],
        ["Gilberto Mota", 1961, "M", "Intermediário", "Falsificação de documentos (1994)."],
        ["Paula Montenegro", 1984, "F", "Técnica de redes", "Acesso a comunicação interna."],
        ["Vitor Salgado", 1979, "M", "Empresário", "Empresa de transporte."],
        ["Nádia Ferraz", 1989, "F", "Consultora", "Credencial de acesso ao prédio."],
        ["Bruno Seixas", 1991, "M", "Especialista digital", "Clonagem de dispositivos."],
        ["Elias Moura", 1983, "M", "Ex-prestador", "Conhecia acessos secundários."],
        ["Helena Costa", 1958, "F", "Aposentada", "Testemunha em inquéritos antigos."],
        ["Roberto Assis", 1970, "M", "Vigia aposentado", "Vigia noturno."],
        ["Irene Lopes", 1985, "F", "Moradora", "Próxima ao local do crime."],
        ["Tiago Freire", 1993, "M", "Motorista app", "Rotas variáveis."],
    ];

    const people = personSeed.map((p, i) => ({
        id: "p" + (i + 1), name: p[0], birthYear: p[1], sex: p[2], profession: p[3], notes: p[4],
        cpf: `${100 + i}.${200 + i}.${300 + i}-0${i % 9}`, rg: `${10 + i}.${200 + i}.${300 + i}`,
        maritalStatus: pick(["Solteiro(a)", "Casado(a)", "Divorciado(a)", "Viúvo(a)"]),
        city: pick(cityData)[0], phones: [`(${11 + i % 80}) 9${1000 + i}-${2000 + i}`], emails: [p[0].split(" ")[0].toLowerCase() + i + "@mail.com"],
        address: `Rua ${p[0].split(" ")[0]}, ${100 + i} — Centro`, relations: [], createdAt: daysAgo(400 - i * 5),
    }));
    // Alguns vínculos entre pessoas (rede de relacionamentos)
    people[12].relations = [{ personId: "p14", type: "Associado" }, { personId: "p15", type: "Associado" }];
    people[13].relations = [{ personId: "p3", type: "Contato" }];
    people[0].relations = [{ personId: "p21", type: "Conhecido" }];

    const caseSeed = [
        ["UNS-1998-001", "A Mala da Estação", "Desaparecimento", "Arquivado", "Alta", 3, "u1", ["u4"], 1998, 8, 14, "Desaparecimento seguido da localização de objetos pessoais numa mala abandonada na estação central.", ["p1", "p13", "p21"]],
        ["UNS-2001-014", "Ecos do Viaduto", "Homicídio", "Arquivado", "Crítica", 1, "u3", ["u4"], 2001, 4, 21, "Homicídio sem autoria definida sob um viaduto, com documentos possivelmente adulterados.", ["p2", "p13", "p15"]],
        ["UNS-2003-022", "Arquivo do Porto", "Desaparecimento", "Perícia", "Crítica", 4, "u4", ["u3", "u5"], 2003, 11, 2, "Desaparecimento de pesquisadora e retirada irregular de caixas do arquivo portuário.", ["p3", "p14", "p15", "p22"]],
        ["UNS-2004-031", "Noite no Catete", "Homicídio", "Arquivado", "Alta", 2, "u1", [], 2004, 7, 19, "Morte de jornalista após encontro não identificado; gravações originais não localizadas.", ["p4", "p13"]],
        ["UNS-2009-008", "Sinal Interrompido", "Desaparecimento", "Investigação", "Alta", 5, "u2", ["u4"], 2009, 1, 30, "Desaparecimento durante pane simultânea em antenas e câmeras de uma central de telecom.", ["p5", "p16"]],
        ["UNS-2012-019", "Quarto 312", "Homicídio", "Resolvido", "Média", 6, "u3", ["u5"], 2012, 5, 11, "Homicídio em hotel esclarecido após confronto de registros de acesso e perfil genético.", ["p6", "p18"]],
        ["UNS-2015-027", "Rota 17", "Desaparecimento", "Arquivado", "Alta", 1, "u4", [], 2015, 9, 3, "Desaparecimento de motorista durante trajeto alterado sem autorização.", ["p7", "p13", "p17"]],
        ["UNS-2018-042", "A Chave Azul", "Roubo", "Resolvido", "Média", 7, "u3", ["u2"], 2018, 12, 17, "Invasão seguida de homicídio solucionada por impressão digital e chave codificada.", ["p8", "p19"]],
        ["UNS-2021-011", "Maré Baixa", "Desaparecimento", "Perícia", "Alta", 8, "u3", [], 2021, 3, 22, "Desaparecimento de pescadora após embarcação retornar sem tripulação.", ["p9", "p20"]],
        ["UNS-2023-006", "Linha de Cinza", "Homicídio", "Revisão", "Crítica", 2, "u2", ["u1"], 2023, 6, 9, "Morte suspeita em prédio comercial reaberta após recuperação de imagens apagadas.", ["p10", "p19"]],
        ["UNS-2024-018", "Sala Sem Janela", "Desaparecimento", "Arquivado", "Alta", 1, "u1", [], 2024, 10, 12, "Desaparecimento em escritório com acesso controlado e sem registro de saída.", ["p11", "p18"]],
        ["UNS-2026-004", "Último Bilhete", "Desaparecimento", "Triagem", "Crítica", 4, "u4", ["u2"], 2026, 2, 15, "Mensageiro desaparecido após registrar uma entrega sem destinatário confirmado.", ["p12", "p20"]],
    ];

    const cases = caseSeed.map((c, i) => {
        const [code, title, type, status, priority, cityIdx, leadId, team, y, m, d, description, personIds] = c;
        const [city, state] = cityData[cityIdx - 1];
        const openedAt = iso(y, m, d);
        return {
            id: "c" + (i + 1), code, title, type, status, priority, description,
            summary: description.slice(0, 90) + "…", city, state, leadId, team,
            tags: [type, priority === "Crítica" ? "urgente" : "rotina"],
            people: personIds.map((pid, k) => ({ personId: pid, role: k === 0 ? "Vítima" : k === 1 ? "Suspeito" : "Testemunha" })),
            openedAt, notes: [], createdAt: openedAt,
            activity: [{ id: uid("ev"), kind: "open", at: openedAt, by: leadId, text: "Caso registrado no sistema." }],
        };
    });

    // Evidências (2-4 por caso)
    const evidence = [];
    let en = 1;
    for (const c of cases) {
        const nEv = 2 + Math.floor(Math.random() * 3);
        for (let j = 0; j < nEv; j++) {
            const type = pick(["Documento", "Imagem", "Objeto", "Arquivo digital", "Vídeo", "Arma", "Veículo", "Local"]);
            evidence.push({
                id: "e" + en, code: `EV-${c.code.slice(4)}-${String.fromCharCode(65 + j)}`,
                title: `${type} relacionado a ${c.title}`, type, category: type,
                caseId: c.id, personIds: c.people.slice(0, 1).map(p => p.personId),
                origin: pick(["Local do crime", "Apreensão", "Doação de testemunha", "Perícia"]),
                custody: pick(["Coletada", "Em análise", "Armazenada"]),
                date: iso(new Date(c.openedAt).getFullYear(), new Date(c.openedAt).getMonth() + 1, 15 + j),
                location: c.city + "/" + c.state, responsible: c.leadId,
                hash: "sha256:" + Math.random().toString(16).slice(2, 14),
                integrity: Math.random() > 0.15 ? "Íntegra" : "Verificar",
                tags: [type.toLowerCase()], notes: "", createdAt: c.openedAt,
            });
            en++;
        }
    }

    // Eventos de timeline (aberturas + algumas movimentações)
    const events = [];
    for (const c of cases) {
        events.push({ id: uid("t"), at: c.openedAt, kind: "case", caseId: c.id, title: `Caso aberto: ${c.title}`, text: c.description, by: c.leadId });
        if (["Perícia", "Revisão", "Resolvido", "Investigação"].includes(c.status)) {
            events.push({ id: uid("t"), at: daysAgo(30 + Math.floor(Math.random() * 300)), kind: "stage", caseId: c.id, title: `${c.title} → ${c.status}`, text: `Movido para ${c.status}.`, by: c.leadId });
        }
    }
    for (const e of evidence.slice(0, 10)) {
        events.push({ id: uid("t"), at: e.date, kind: "evidence", caseId: e.caseId, evidenceId: e.id, title: `Evidência registrada: ${e.code}`, text: e.title, by: e.responsible });
    }

    const posts = [
        { id: uid("po"), authorId: "u1", category: "Aviso", at: daysAgo(1), pinned: true, body: "Nova política de cadeia de custódia entra em vigor nesta semana. Registrem todas as movimentações de evidência no sistema.", likes: 8, likedByMe: false, comments: [{ id: uid("cm"), authorId: "u3", at: daysAgo(1), text: "Alinhado. Já atualizamos os fluxos da equipe." }] },
        { id: uid("po"), authorId: "u2", category: "Operacional", at: daysAgo(2), pinned: false, body: "Laboratório de perícia digital com fila reduzida. Aproveitem para submeter mídias pendentes.", likes: 5, likedByMe: false, comments: [] },
        { id: uid("po"), authorId: "u3", category: "Caso", at: daysAgo(3), pinned: false, body: "Avanço no caso Arquivo do Porto: índice digital recuperado cruza três cargas e dois nomes abreviados.", likes: 12, likedByMe: true, comments: [{ id: uid("cm"), authorId: "u5", at: daysAgo(3), text: "Excelente. Vou priorizar a análise genética." }] },
        { id: uid("po"), authorId: "u6", category: "Institucional", at: daysAgo(5), pinned: false, body: "Bem-vindos à nova plataforma Unsolved OS. Feedbacks são bem-vindos no canal de suporte.", likes: 20, likedByMe: false, comments: [] },
    ];

    await bulkPut("users", users);
    await bulkPut("people", people);
    await bulkPut("cases", cases);
    await bulkPut("evidence", evidence);
    await bulkPut("events", events);
    await bulkPut("posts", posts);
}
