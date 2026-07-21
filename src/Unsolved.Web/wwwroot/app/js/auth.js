import { setWritePolicy } from "./db.js";

let session = null;

export async function loadSession() {
    const response = await fetch("/account/session", { credentials: "same-origin", cache: "no-store" });
    if (!response.ok) {
        const target = encodeURIComponent(location.pathname + location.search + location.hash);
        location.replace(`/account/login?returnUrl=${target}`);
        throw new Error("Sessão demonstrativa não encontrada.");
    }
    session = await response.json();
    document.documentElement.dataset.accessRole = session.role;
    return session;
}

export function activateWritePolicy() {
    setWritePolicy(writePolicy);
}

function writePolicy(store, value, operation) {
    if (!session) return true;
    if (session.role === "admin") return true;
    if (session.role === "viewer") return false;
    if (operation === "delete" || operation === "clearAll" || operation === "bulkPut") return false;
    if (store === "cases") return value?.id === session.assignedCaseId;
    if (store === "evidence") return value?.caseId === session.assignedCaseId;
    if (store === "events") return value?.caseId === session.assignedCaseId;
    if (store === "people") return operation === "put";
    return false;
}

export const currentUser = () => session;
export const isAdmin = () => session?.role === "admin";
export const isDetective = () => session?.role === "detective";
export const isViewer = () => session?.role === "viewer";
export const canCreateCase = () => isAdmin();
export const canManageUsers = () => isAdmin();
export const canManageData = () => isAdmin();

export function canViewCase(recordOrId) {
    if (!session || session.role !== "detective") return true;
    const id = typeof recordOrId === "string" ? recordOrId : recordOrId?.id;
    return id === session.assignedCaseId;
}

export function canEditCase(recordOrId) {
    if (isAdmin()) return true;
    return isDetective() && canViewCase(recordOrId);
}

export function canEditEvidence(record) {
    if (isAdmin()) return true;
    return isDetective() && record?.caseId === session.assignedCaseId;
}

export function canCreateEvidence(caseId = "") {
    if (isAdmin()) return true;
    return isDetective() && (!caseId || caseId === session.assignedCaseId);
}

export function canCreatePerson(caseId = "") {
    if (isAdmin()) return true;
    return isDetective() && (!caseId || caseId === session.assignedCaseId);
}

export function canEditPerson(person, cases = []) {
    if (isAdmin()) return true;
    if (!isDetective() || !person) return false;
    const assigned = cases.find(item => item.id === session.assignedCaseId);
    return (assigned?.people || []).some(link => link.personId === person.id);
}

export function visibleCases(items) {
    return isDetective() ? items.filter(item => item.id === session.assignedCaseId) : items;
}

export function visibleEvidence(items) {
    return isDetective() ? items.filter(item => item.caseId === session.assignedCaseId) : items;
}

export function visibleEvents(items) {
    return isDetective() ? items.filter(item => !item.caseId || item.caseId === session.assignedCaseId) : items;
}

export function visiblePeople(items, cases) {
    if (!isDetective()) return items;
    const assigned = cases.find(item => item.id === session.assignedCaseId);
    const ids = new Set((assigned?.people || []).map(link => link.personId));
    return items.filter(item => ids.has(item.id));
}

export function accessCopy() {
    if (isAdmin()) return { label: "Administrador geral", level: "Nível 03 · Total", mode: "Acesso completo" };
    if (isDetective()) return { label: "Detetive responsável", level: "Nível 02 · Caso atribuído", mode: session.assignedCaseCode };
    return { label: "Usuário de consulta", level: "Nível 01 · Somente leitura", mode: "Visualização protegida" };
}
