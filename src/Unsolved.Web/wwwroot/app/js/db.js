// Camada de persistência sobre IndexedDB. Tudo sobrevive ao F5.
// Stores: cases, people, evidence, events, posts, users.
// Emite "data:changed" (detail.store) após cada mutação — as views recarregam.

const DB_NAME = "unsolved-os";
const DB_VER = 1;
export const STORES = ["cases", "people", "evidence", "events", "posts", "users"];

let _db = null;

export function openDB() {
    if (_db) return Promise.resolve(_db);
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VER);
        req.onupgradeneeded = (e) => {
            const db = e.target.result;
            for (const s of STORES) {
                if (!db.objectStoreNames.contains(s)) db.createObjectStore(s, { keyPath: "id" });
            }
        };
        req.onsuccess = () => { _db = req.result; resolve(_db); };
        req.onerror = () => reject(req.error);
    });
}

function tx(store, mode) {
    return _db.transaction(store, mode).objectStore(store);
}
function wrap(request) {
    return new Promise((res, rej) => { request.onsuccess = () => res(request.result); request.onerror = () => rej(request.error); });
}
function emit(store) { window.dispatchEvent(new CustomEvent("data:changed", { detail: { store } })); }

export async function all(store) { await openDB(); return wrap(tx(store, "readonly").getAll()); }
export async function get(store, id) { await openDB(); return wrap(tx(store, "readonly").get(id)); }
export async function count(store) { await openDB(); return wrap(tx(store, "readonly").count()); }

export async function put(store, obj, { silent = false } = {}) {
    await openDB();
    obj.updatedAt = new Date().toISOString();
    if (!obj.createdAt) obj.createdAt = obj.updatedAt;
    await wrap(tx(store, "readwrite").put(obj));
    if (!silent) emit(store);
    return obj;
}

export async function bulkPut(store, arr) {
    await openDB();
    const t = _db.transaction(store, "readwrite");
    const s = t.objectStore(store);
    const now = new Date().toISOString();
    for (const o of arr) { o.updatedAt ||= now; o.createdAt ||= now; s.put(o); }
    return new Promise((res, rej) => {
        t.oncomplete = () => { emit(store); res(); };
        t.onerror = () => rej(t.error);
    });
}

export async function del(store, id) { await openDB(); await wrap(tx(store, "readwrite").delete(id)); emit(store); }

export async function clearAll() {
    await openDB();
    await Promise.all(STORES.map(s => wrap(tx(s, "readwrite").clear())));
    STORES.forEach(emit);
}

export async function isEmpty() {
    await openDB();
    return (await count("cases")) === 0;
}

/** Exporta todo o banco como objeto (para backup/JSON). */
export async function exportAll() {
    const out = {};
    for (const s of STORES) out[s] = await all(s);
    return out;
}
/** Importa (substitui) todo o banco. */
export async function importAll(data) {
    await clearAll();
    for (const s of STORES) if (Array.isArray(data[s])) for (const o of data[s]) await put(s, o, { silent: true });
    STORES.forEach(emit);
}
