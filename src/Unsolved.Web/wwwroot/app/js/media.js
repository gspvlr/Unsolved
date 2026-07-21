import { el } from "./dom.js";

// Uma única tabela mantém a identidade visual da pessoa em todas as telas.
export const PORTRAIT_CELLS = {
    p1: 9, p2: 21, p3: 5, p4: 17, p5: 1, p6: 4,
    p7: 12, p8: 10, p9: 7, p10: 6, p11: 11, p12: 0,
    p13: 13, p14: 14, p15: 2, p16: 20, p17: 15, p18: 3,
    p19: 19, p20: 8, p21: 18, p22: 23, p23: 16,
};

export function portraitStyle(personOrId) {
    const person = typeof personOrId === "object" ? personOrId : null;
    const id = person?.id || personOrId;
    if (person?.photoDataUrl) {
        return {
            backgroundImage: `url(${JSON.stringify(person.photoDataUrl)})`,
            backgroundSize: "cover",
            backgroundPosition: person.photoPosition || "center 24%",
        };
    }
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

export function evidenceAtlasStyle(id) {
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

export function personPortrait(person, className = "person-photo", extra = {}) {
    return el(`div.${className}`, {
        ...extra,
        style: { ...portraitStyle(person), ...(extra.style || {}) },
        role: extra.role || "img",
        "aria-label": extra["aria-label"] || `Retrato ilustrado de ${person?.name || "pessoa não identificada"}`,
    });
}

export function evidencePhoto(evidence, className = "evidence-photo", extra = {}) {
    const frame = el(`div.${className}`, {
        ...extra,
        style: { ...evidenceAtlasStyle(evidence?.id), ...(extra.style || {}) },
    });
    if (evidence?.mediaDataUrl && String(evidence.mediaType || "").startsWith("image/")) {
        frame.appendChild(el("img", {
            src: evidence.mediaDataUrl,
            alt: `Foto anexada à evidência ${evidence.code || evidence.title || "sem código"}`,
            loading: "lazy",
        }));
        frame.classList.add("has-upload");
        return frame;
    }
    if (!evidence?.code) return frame;
    frame.appendChild(el("img", {
        src: `/images/evidence/${evidence.code}.svg`,
        alt: `Ilustração da evidência ${evidence.code}`,
        loading: "lazy",
        onerror: event => {
            frame.classList.add("uses-atlas");
            event.currentTarget.remove();
        },
    }));
    return frame;
}

export function portraitStack(people, limit = 3, className = "portrait-stack") {
    const visible = (people || []).filter(Boolean).slice(0, limit);
    const stack = el(`div.${className}`, { "aria-label": `${people?.length || 0} pessoas vinculadas` });
    visible.forEach(person => stack.appendChild(personPortrait(person, "mini-person-photo")));
    if ((people?.length || 0) > limit) stack.appendChild(el("span", { text: `+${people.length - limit}` }));
    return stack;
}
