/* =============================================================
   mystery.js — Caça aos segredos (easter eggs em MISSÕES encadeadas)
   10 segredos divididos em 3 missões. Concluir uma missão revela a
   dica da próxima. Um HUD (🔍 x/10) mostra o progresso.
   Estado persiste na sessão. Respeita prefers-reduced-motion.
   ============================================================= */
(function () {
    "use strict";

    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

    function toast(msg) {
        if (window.Unsolved && window.Unsolved.toast) window.Unsolved.toast(msg);
        else console.log("[Unsolved]", msg);
    }

    /* ---------- Registro dos 10 segredos ---------- */
    const SECRETS = {
        // Missão 1 — Reúna as pistas
        clueA: { m: 1, label: "Pista: carimbo Confidencial" },
        clueB: { m: 1, label: "Pista: carimbo Caso Aberto" },
        clueC: { m: 1, label: "Pista: código do rodapé" },
        // Missão 2 — Códigos secretos
        pista: { m: 2, label: 'Comando digitado: "pista"' },
        sherlock: { m: 2, label: 'Comando digitado: "sherlock"' },
        konami: { m: 2, label: "Código Konami: Modo Cold Case" },
        // Missão 3 — O que está oculto
        ink: { m: 3, label: "Tinta invisível no rodapé" },
        logo: { m: 3, label: "Logo clicada 5 vezes" },
        fingerprint: { m: 3, label: "Impressão digital escondida" },
        master: { m: 3, label: "CASO ENCERRADO — Detetive Mestre", auto: true }
    };
    const MISSIONS = {
        1: { name: "Reúna as pistas", next: 'Missão 2 liberada: detetives falam por código. Experimente digitar "sherlock" — ou o clássico ↑ ↑ ↓ ↓ ← → ← → B A.' },
        2: { name: "Códigos secretos", next: "Missão 3 liberada: alguns segredos se escondem à vista. Passe o mouse pelo rodapé e clique 5× na logo." },
        3: { name: "O que está oculto", next: "Você encontrou tudo. Caso encerrado, Detetive Mestre." }
    };
    const ALL_IDS = Object.keys(SECRETS);
    const NON_AUTO = ALL_IDS.filter(id => !SECRETS[id].auto);

    /* ---------- Estado (sessionStorage) ---------- */
    function load(key) { try { return JSON.parse(sessionStorage.getItem(key) || "[]"); } catch (e) { return []; } }
    function save(key, a) { try { sessionStorage.setItem(key, JSON.stringify(a)); } catch (e) { } }
    let found = load("uns_secrets").filter(id => SECRETS[id]);
    let announced = load("uns_missions");

    function has(id) { return found.indexOf(id) !== -1; }
    function missionIds(n) { return NON_AUTO.filter(id => SECRETS[id].m === n); }
    function missionDone(n) { return missionIds(n).every(has); }

    /* ---------- API central: registrar um segredo ---------- */
    function foundSecret(id, msg) {
        if (!SECRETS[id] || has(id)) return;
        found.push(id); save("uns_secrets", found);
        toast("🔎 Segredo " + found.length + "/10 — " + (msg || SECRETS[id].label));
        showHud(); updateHud();
        if (hud && !reduceMotion) { hud.classList.remove("flash"); void hud.offsetWidth; hud.classList.add("flash"); }
        checkMissions();
    }
    window.Unsolved = window.Unsolved || {};
    window.Unsolved.foundSecret = foundSecret;

    function checkMissions() {
        // Missões 1 e 2: ao concluir, anuncia e dá a dica da próxima.
        [1, 2].forEach(function (n) {
            if (missionDone(n) && announced.indexOf(n) === -1) {
                announced.push(n); save("uns_missions", announced);
                setTimeout(function () { toast("✅ Missão " + n + " concluída! " + MISSIONS[n].next); }, 1200);
            }
        });
        // Missão 3: quando os 9 segredos "manuais" estão achados, libera o final.
        if (NON_AUTO.every(has) && !has("master")) {
            setTimeout(function () {
                foundSecret("master", "CASO ENCERRADO — todos os 10 segredos! Você é um Detetive Mestre. 🕵");
                if (window.Unsolved.showStamp) window.Unsolved.showStamp();
            }, 1400);
        }
    }

    /* ---------- 1) Mensagem no console (ambiente) ---------- */
    try {
        console.log("%c🕵  ARQUIVO CONFIDENCIAL — UNSOLVED",
            "color:#F0D86D;background:#201D12;font:700 16px Georgia;padding:8px 14px;border-radius:6px");
        console.log("%cHá 10 segredos escondidos, em 3 missões. Cada missão concluída revela a próxima.\n" +
            'Comece pelas 3 pistas (carimbos + código do rodapé). Dica: digite "pista".',
            "color:#B5CDDA;font:13px monospace");
    } catch (e) { }

    /* ---------- 2) Missão 1: as 3 pistas (elementos decorativos) ---------- */
    const CLUES = [
        { sel: ".stamp-hero", id: "clueA" },
        { sel: ".cta-band .stamp-mini", id: "clueB" },
        { sel: ".footer-casecode", id: "clueC" }   // linha inteira clicável (alvo maior)
    ];
    const clueEls = [];
    CLUES.forEach(function (c) {
        const el = document.querySelector(c.sel);
        if (!el) return;
        el.classList.add("mystery-clue");
        el.title = "Pista?";
        if (has(c.id)) el.classList.add("clue-found");
        clueEls.push(el);
        el.addEventListener("click", function () {
            el.classList.add("clue-found"); pulse(el);
            foundSecret(c.id);
        });
    });

    function pulse(el) {
        if (reduceMotion || !el) return;
        el.classList.remove("clue-pulse"); void el.offsetWidth; el.classList.add("clue-pulse");
    }

    /* ---------- 3) Missão 2: comandos de teclado ---------- */
    let buffer = "";
    document.addEventListener("keydown", function (e) {
        if (e.target && /^(input|textarea|select)$/i.test(e.target.tagName)) return;
        if (e.key.length !== 1) return;
        buffer = (buffer + e.key.toLowerCase()).slice(-8);
        if (buffer.indexOf("pista") !== -1) {
            if (clueEls.length) { clueEls.forEach(pulse); }
            foundSecret("pista", clueEls.length ? "digitou \"pista\" — pistas destacadas" : "digitou \"pista\"");
        }
        if (buffer.indexOf("sherlock") !== -1) {
            foundSecret("sherlock", "digitou \"sherlock\" — elementar!");
        }
    });

    /* ---------- 3b) Missão 2: código Konami -> Modo Cold Case ---------- */
    const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
        "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    let kpos = 0;
    document.addEventListener("keydown", function (e) {
        const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
        kpos = (k === KONAMI[kpos]) ? kpos + 1 : (k === KONAMI[0] ? 1 : 0);
        if (kpos === KONAMI.length) {
            kpos = 0;
            const on = document.body.classList.toggle("modo-investigacao");
            foundSecret("konami", "Modo Cold Case " + (on ? "ativado" : "desativado"));
        }
    });

    /* ---------- 4) Missão 3: tinta invisível (rodapé) ---------- */
    (function invisibleInk() {
        const anchor = document.querySelector(".footer-bottom");
        if (!anchor) return;
        const ink = document.createElement("span");
        ink.className = "invisible-ink";
        ink.textContent = "🔍 221B — tinta invisível: bom trabalho, detetive.";
        ink.addEventListener("mouseenter", function () { foundSecret("ink"); });
        // Toque: revela e registra (celulares não têm hover).
        ink.addEventListener("click", function () { ink.classList.add("ink-shown"); foundSecret("ink"); });
        anchor.appendChild(ink);
    })();

    /* ---------- 4b) Missão 3: impressão digital escondida (rodapé) ---------- */
    (function fingerprint() {
        const anchor = document.querySelector(".footer-brand");
        if (!anchor) return;
        const fp = document.createElement("button");
        fp.className = "hidden-fingerprint";
        fp.setAttribute("aria-label", "Impressão digital");
        fp.title = "…";
        fp.innerHTML =
            "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.3'>" +
            "<path d='M12 4a8 8 0 0 0-8 8c0 2 .5 4 1 5'/><path d='M12 7a5 5 0 0 0-5 5c0 2 .3 4 1 6'/>" +
            "<path d='M12 10a2 2 0 0 0-2 2c0 3 .5 5 1 7'/><path d='M16 6a8 8 0 0 1 2 6c0 3-.5 5-1 7'/></svg>";
        fp.addEventListener("click", function () { fp.classList.add("found"); foundSecret("fingerprint"); });
        anchor.appendChild(fp);
    })();

    /* ---------- 5) HUD de progresso (🔍 x/10) ---------- */
    let hud, panel;
    function buildHud() {
        hud = document.createElement("button");
        hud.className = "quest-hud"; hud.id = "quest-hud";  // sempre visível: convida à caça
        hud.setAttribute("aria-expanded", "false");
        hud.title = "Caça aos segredos";
        hud.innerHTML = "🔍 <span class='quest-count'>0</span>/10";

        panel = document.createElement("div");
        panel.className = "quest-panel"; panel.hidden = true;

        hud.addEventListener("click", function () {
            const open = panel.hidden;
            panel.hidden = !open; hud.setAttribute("aria-expanded", String(open));
            if (open) updateHud();
        });
        document.body.appendChild(hud);
        document.body.appendChild(panel);
    }
    function showHud() { if (hud) hud.hidden = false; }
    function updateHud() {
        if (!hud) return;
        hud.querySelector(".quest-count").textContent = found.length;
        let html = "<h4>Caça aos segredos</h4>";
        [1, 2, 3].forEach(function (n) {
            const ids = missionIds(n);
            const done = ids.filter(has).length;
            const complete = missionDone(n);
            html += "<div class='quest-mission" + (complete ? " done" : "") + "'>" +
                "<strong>" + (complete ? "✅" : "◍") + " Missão " + n + " — " + MISSIONS[n].name + " (" + done + "/" + ids.length + ")</strong><ul>";
            ids.forEach(function (id) {
                html += "<li>" + (has(id) ? "🔓 " + SECRETS[id].label : "🔒 ???") + "</li>";
            });
            html += "</ul></div>";
        });
        html += "<p class='quest-master'>" + (has("master") ? "🏅 " + SECRETS.master.label : "🔒 Segredo final: conclua as 3 missões") + "</p>";
        panel.innerHTML = html;
    }
    buildHud();
    updateHud();

    /* ---------- 6) Alternativas por GESTO em telas de toque ----------
       No celular não dá para digitar comandos nem usar hover. Os mesmos
       segredos (pista / sherlock / konami) são obtidos por gestos. */
    const isTouch = matchMedia("(hover: none), (pointer: coarse)").matches || ("ontouchstart" in window);
    if (isTouch) {
        document.body.classList.add("is-touch");

        // pista — toque longo (600ms) na lupa do HUD.
        bindLongPress(hud, function () {
            if (clueEls.length) clueEls.forEach(pulse);
            foundSecret("pista", clueEls.length ? "toque longo — pistas destacadas" : "toque longo na lupa");
        });

        // sherlock — toque duplo na mascote do herói.
        const mascot = document.querySelector(".hero-logo");
        if (mascot) bindDoubleTap(mascot, function () {
            foundSecret("sherlock", "toque duplo na mascote — elementar!");
        });

        // konami — sequência de deslizes ↑ ↑ ↓ ↓ ← → ← →.
        bindSwipeSequence(["up", "up", "down", "down", "left", "right", "left", "right"], function () {
            const on = document.body.classList.toggle("modo-investigacao");
            foundSecret("konami", "Modo Cold Case " + (on ? "ativado" : "desativado"));
        });
    }

    /* ---------- Helpers de gesto ---------- */
    function bindLongPress(el, cb, ms) {
        if (!el) return;
        ms = ms || 600;
        let timer = null, fired = false;
        function start() { fired = false; clearTimeout(timer); timer = setTimeout(function () { fired = true; cb(); }, ms); }
        function cancel() { clearTimeout(timer); }
        el.addEventListener("pointerdown", start);
        el.addEventListener("pointerup", cancel);
        el.addEventListener("pointerleave", cancel);
        el.addEventListener("pointercancel", cancel);
        // Suprime o clique (abrir painel) que segue o toque longo.
        el.addEventListener("click", function (e) { if (fired) { e.stopImmediatePropagation(); e.preventDefault(); fired = false; } }, true);
    }

    function bindDoubleTap(el, cb, gap) {
        if (!el) return;
        gap = gap || 320;
        let last = 0;
        el.addEventListener("pointerup", function () {
            const now = performance.now();
            if (now - last < gap) { cb(); last = 0; } else { last = now; }
        });
    }

    function bindSwipeSequence(seq, cb) {
        let pos = 0, sx = 0, sy = 0, resetTimer = null;
        const MIN = 24; // deslocamento mínimo em px
        document.addEventListener("touchstart", function (e) {
            const t = e.changedTouches[0]; sx = t.clientX; sy = t.clientY;
        }, { passive: true });
        document.addEventListener("touchend", function (e) {
            const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
            if (Math.abs(dx) < MIN && Math.abs(dy) < MIN) return;
            const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up");
            pos = (dir === seq[pos]) ? pos + 1 : (dir === seq[0] ? 1 : 0);
            clearTimeout(resetTimer); resetTimer = setTimeout(function () { pos = 0; }, 1500);
            if (pos === seq.length) { pos = 0; cb(); }
        }, { passive: true });
    }
})();
