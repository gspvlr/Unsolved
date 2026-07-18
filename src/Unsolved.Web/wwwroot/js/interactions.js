/* =============================================================
   interactions.js — Interações visuais das páginas públicas
   - Revelar ao rolar        - Contadores animados
   - FAQ accordion           - Voltar ao topo
   - Modal de demonstração   - Lupa que segue o cursor (easter egg)
   - Linha de pistas no scroll (easter egg)
   Todas respeitam prefers-reduced-motion.
   ============================================================= */
(function () {
    "use strict";

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---------- 1. Revelar elementos ao entrar na tela ---------- */
    (function reveal() {
        const items = document.querySelectorAll(".reveal");
        if (!items.length) return;
        if (reduceMotion || !("IntersectionObserver" in window)) {
            items.forEach(function (el) { el.classList.add("is-visible"); });
            return;
        }
        const io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });
        items.forEach(function (el) { io.observe(el); });
    })();

    /* ---------- 2. Contadores animados ---------- */
    (function counters() {
        const nums = document.querySelectorAll("[data-counter]");
        if (!nums.length) return;

        function animate(el) {
            const target = parseInt(el.getAttribute("data-counter"), 10) || 0;
            const suffix = el.getAttribute("data-suffix") || "";
            if (reduceMotion) { el.textContent = target + suffix; return; }
            const duration = 1400;
            const start = performance.now();
            function tick(now) {
                const p = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
                el.textContent = Math.round(target * eased) + suffix;
                if (p < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
        }

        if (!("IntersectionObserver" in window)) { nums.forEach(animate); return; }
        const io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) { animate(entry.target); io.unobserve(entry.target); }
            });
        }, { threshold: 0.6 });
        nums.forEach(function (el) { io.observe(el); });
    })();

    /* ---------- 3. FAQ accordion ---------- */
    (function faq() {
        const questions = document.querySelectorAll(".faq-question");
        questions.forEach(function (btn) {
            btn.addEventListener("click", function () {
                const expanded = btn.getAttribute("aria-expanded") === "true";
                const answer = document.getElementById(btn.getAttribute("aria-controls"));
                // Fecha os demais (comportamento accordion clássico).
                questions.forEach(function (other) {
                    if (other !== btn) {
                        other.setAttribute("aria-expanded", "false");
                        const a = document.getElementById(other.getAttribute("aria-controls"));
                        if (a) a.hidden = true;
                    }
                });
                btn.setAttribute("aria-expanded", String(!expanded));
                if (answer) answer.hidden = expanded;
            });
        });
    })();

    /* ---------- 4. Voltar ao topo ---------- */
    (function backToTop() {
        const btn = document.getElementById("back-to-top");
        if (!btn) return;
        window.addEventListener("scroll", function () {
            const show = window.scrollY > 600;
            btn.hidden = false;
            btn.classList.toggle("show", show);
        }, { passive: true });
        btn.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
        });
    })();

    /* ---------- 5. Modal "Solicitar demonstração" ---------- */
    (function modal() {
        const overlay = document.getElementById("demo-modal");
        if (!overlay) return;
        let lastFocus = null;

        function open() {
            lastFocus = document.activeElement;
            overlay.hidden = false;
            document.body.style.overflow = "hidden";
            const first = overlay.querySelector("input, select, textarea, button");
            if (first) setTimeout(function () { first.focus(); }, 40);
        }
        function close() {
            overlay.hidden = true;
            document.body.style.overflow = "";
            if (lastFocus) lastFocus.focus();
        }

        document.querySelectorAll("[data-open-demo]").forEach(function (t) {
            t.addEventListener("click", function (e) { e.preventDefault(); open(); });
        });
        overlay.querySelectorAll("[data-close-demo]").forEach(function (t) {
            t.addEventListener("click", close);
        });
        overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && !overlay.hidden) close();
        });
        // Fecha automaticamente após um envio bem-sucedido dentro do modal.
        document.addEventListener("unsolved:contact-success", function () {
            if (!overlay.hidden) setTimeout(close, 2200);
        });
    })();

    /* ---------- 6. Lupa que segue o cursor (easter egg) ---------- */
    (function cursorLens() {
        const lens = document.getElementById("cursor-lens");
        if (!lens || reduceMotion || window.matchMedia("(hover: none)").matches) return;
        let active = false;

        document.addEventListener("mousemove", function (e) {
            lens.style.left = e.clientX + "px";
            lens.style.top = e.clientY + "px";
        }, { passive: true });

        // Ativa somente sobre elementos marcados com [data-lens].
        document.querySelectorAll("[data-lens]").forEach(function (el) {
            el.addEventListener("mouseenter", function () { active = true; lens.classList.add("active"); });
            el.addEventListener("mouseleave", function () { active = false; lens.classList.remove("active"); });
        });
    })();

    /* ---------- 7. Linha de pistas no scroll (easter egg) ---------- */
    (function scrollThread() {
        if (reduceMotion) return;
        const line = document.createElement("div");
        line.className = "thread-scroll";
        document.body.appendChild(line);
        window.addEventListener("scroll", function () {
            const h = document.documentElement.scrollHeight - window.innerHeight;
            const pct = h > 0 ? (window.scrollY / h) : 0;
            line.style.height = (pct * window.innerHeight) + "px";
        }, { passive: true });
    })();

    /* ---------- Carimbo "Confidencial" (exposto para o site.js) ---------- */
    window.Unsolved = window.Unsolved || {};
    window.Unsolved.showStamp = function () {
        const stamp = document.getElementById("stamp-confidential");
        if (!stamp || reduceMotion) return;
        stamp.classList.remove("show");
        void stamp.offsetWidth; // reinicia a animação
        stamp.classList.add("show");
    };
})();
