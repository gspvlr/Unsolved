// Constantes de domínio + helpers de exibição.
import { el } from "./dom.js";

export const STAGES = ["Registro", "Triagem", "Investigação", "Perícia", "Revisão", "Arquivado", "Resolvido"];
export const TERMINAL = ["Arquivado", "Resolvido"];
export const isTerminal = (s) => TERMINAL.includes(s);
export const stageIndex = (s) => STAGES.indexOf(s);

const STAGE_CLASS = {
    "Registro": "b-registro", "Triagem": "b-triagem", "Investigação": "b-investigacao",
    "Perícia": "b-pericia", "Revisão": "b-revisao", "Arquivado": "b-arquivado", "Resolvido": "b-resolvido",
};
export const stageClass = (s) => STAGE_CLASS[s] || "b-registro";
export const stageVar = (s) => `var(--stage-${(STAGE_CLASS[s] || "b-registro").slice(2)})`;

export const PRIORITIES = ["Baixa", "Média", "Alta", "Crítica"];
export const prioClass = (p) => "prio-" + ({ "Crítica": "critica", "Alta": "alta", "Média": "media", "Baixa": "baixa" }[p] || "media");

export const CASE_TYPES = ["Homicídio", "Desaparecimento", "Fraude", "Roubo", "Corrupção", "Cibernético", "Tráfico", "Outro"];

export const EVIDENCE_TYPES = ["Imagem", "Vídeo", "Áudio", "Documento", "Objeto", "Arma", "Veículo", "Arquivo digital", "Local"];
export const EVIDENCE_ICON = {
    "Imagem": "eye", "Vídeo": "eye", "Áudio": "activity", "Documento": "doc", "Objeto": "box",
    "Arma": "alert", "Veículo": "map", "Arquivo digital": "layers", "Local": "pin",
};

export const ROLES = ["Administrador", "Supervisor", "Detetive", "Investigador", "Analista"];
export const AVAIL = ["Disponível", "Ocupado", "Ausente"];

export const CUSTODY = ["Coletada", "Em análise", "Armazenada", "Devolvida"];
export const PERSON_ROLES = ["Vítima", "Suspeito", "Testemunha", "Envolvido"];

export const progressFor = (stage) => ({
    "Registro": 10, "Triagem": 30, "Investigação": 50, "Perícia": 70, "Revisão": 85, "Resolvido": 100, "Arquivado": 100,
}[stage] ?? 10);

// Componentes de badge reutilizáveis
export function stageBadge(stage) {
    return el("span.badge." + stageClass(stage), {}, [el("span.dot"), stage]);
}
export function prioBadge(p) {
    return el("span.prio." + prioClass(p), { text: p });
}
