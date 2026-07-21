(function () {
    "use strict";

    const root = document.querySelector("[data-demo-preview]");
    if (!root) return;
    const cases = Array.from(root.querySelectorAll("[data-preview-case]"));
    const code = root.querySelector("[data-preview-code]");
    const title = root.querySelector("[data-preview-title]");
    const status = root.querySelector("[data-preview-status]");
    const range = root.querySelector("[data-preview-range]");
    const progress = root.querySelector("[data-preview-progress]");
    const average = root.querySelector("[data-preview-average]");
    let active = cases[0];

    function recalculateAverage() {
        const values = cases.map(item => Number(item.dataset.progress || 0));
        const value = Math.round(values.reduce((sum, current) => sum + current, 0) / Math.max(values.length, 1));
        average.textContent = value + "%";
    }

    function renderSelection(card) {
        active = card;
        cases.forEach(item => item.classList.toggle("is-active", item === card));
        code.textContent = card.dataset.code;
        title.textContent = card.dataset.title;
        status.value = card.dataset.status;
        range.value = card.dataset.progress;
        progress.textContent = card.dataset.progress + "%";
    }

    cases.forEach(card => card.addEventListener("click", () => renderSelection(card)));
    status.addEventListener("change", () => {
        active.dataset.status = status.value;
        active.querySelector("em").textContent = status.value;
        active.classList.add("was-edited");
    });
    range.addEventListener("input", () => {
        active.dataset.progress = range.value;
        progress.textContent = range.value + "%";
        active.classList.add("was-edited");
        recalculateAverage();
    });
    if (active) renderSelection(active);
})();
