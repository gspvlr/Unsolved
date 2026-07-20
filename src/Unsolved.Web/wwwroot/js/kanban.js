/* =============================================================
   kanban.js — Quadro Kanban da área demonstrativa
   - Arrastar cards entre colunas (HTML5 drag-and-drop)
   - Clique no card abre um modal de "tarefa interna"
   ponytail: o arraste é só visual (sem backend, não persiste no reload).
   Ligar ao endpoint de status quando existir a camada MySQL.
   ============================================================= */
(function () {
    "use strict";
    const board = document.getElementById("kanban");
    if (!board) return;

    let dragged = null;
    let didDrag = false;

    /* ---------- Arrastar ---------- */
    board.addEventListener("dragstart", function (e) {
        const card = e.target.closest(".kanban-card");
        if (!card) return;
        dragged = card;
        didDrag = true;
        card.classList.add("is-dragging");
        e.dataTransfer.effectAllowed = "move";
    });
    board.addEventListener("dragend", function () {
        if (dragged) dragged.classList.remove("is-dragging");
        dragged = null;
        recount();
        setTimeout(function () { didDrag = false; }, 50);
    });

    board.querySelectorAll("[data-dropzone]").forEach(function (zone) {
        zone.addEventListener("dragover", function (e) {
            e.preventDefault();
            zone.classList.add("is-over");
            const after = cardAfter(zone, e.clientY);
            if (!dragged) return;
            if (after == null) zone.insertBefore(dragged, zone.querySelector(".kanban-empty"));
            else zone.insertBefore(dragged, after);
        });
        zone.addEventListener("dragleave", function () { zone.classList.remove("is-over"); });
        zone.addEventListener("drop", function (e) {
            e.preventDefault();
            zone.classList.remove("is-over");
            if (!dragged) return;
            const status = zone.closest(".kanban-col").getAttribute("data-status");
            dragged.setAttribute("data-status", status);
        });
    });

    // Encontra o card acima do qual soltar, pela posição vertical do mouse.
    function cardAfter(zone, y) {
        const cards = [].slice.call(zone.querySelectorAll(".kanban-card:not(.is-dragging)"));
        let closest = null, closestOffset = -Infinity;
        cards.forEach(function (card) {
            const box = card.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closestOffset) { closestOffset = offset; closest = card; }
        });
        return closest;
    }

    // Atualiza os contadores e o aviso de coluna vazia.
    function recount() {
        board.querySelectorAll(".kanban-col").forEach(function (col) {
            const cards = col.querySelectorAll(".kanban-card");
            col.querySelector(".kanban-count").textContent = cards.length;
            const empty = col.querySelector(".kanban-empty");
            if (empty) empty.hidden = cards.length !== 0;
        });
    }

    /* ---------- Modal de tarefa ---------- */
    const modal = document.getElementById("task-modal");
    const $ = function (id) { return document.getElementById(id); };

    function openTask(card) {
        const d = card.dataset;
        $("tm-code").textContent = d.code;
        $("tm-title").textContent = d.title;
        const st = $("tm-status");
        st.textContent = d.status; st.className = "status-badge " + d.statusclass;
        const pr = $("tm-prio");
        pr.textContent = d.priority; pr.className = "prio " + d.prioclass;
        $("tm-city").textContent = d.city;
        $("tm-date").textContent = d.date;
        $("tm-lead").textContent = d.lead;
        $("tm-evid").textContent = d.evid;
        $("tm-vict").textContent = d.vict;
        $("tm-susp").textContent = d.susp;
        $("tm-wit").textContent = d.wit;
        $("tm-desc").textContent = d.desc;
        $("tm-open").setAttribute("href", "/sistema/casos/" + d.id);
        modal.hidden = false;
        document.body.style.overflow = "hidden";
    }
    function closeTask() {
        modal.hidden = true;
        document.body.style.overflow = "";
    }

    board.addEventListener("click", function (e) {
        const card = e.target.closest(".kanban-card");
        if (card && !didDrag) openTask(card);
    });
    if (modal) {
        modal.addEventListener("click", function (e) {
            if (e.target.hasAttribute("data-close")) closeTask();
        });
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && !modal.hidden) closeTask();
        });
    }
})();
