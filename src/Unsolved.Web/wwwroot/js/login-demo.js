(function () {
    "use strict";

    const cards = Array.from(document.querySelectorAll("[data-demo-profile]"));
    const email = document.querySelector('[name="Email"]');
    const password = document.querySelector('[name="Password"]');
    const selected = document.querySelector("[data-selected-access]");
    const toggle = document.querySelector("[data-password-toggle]");
    if (!cards.length || !email || !password || !selected) return;

    const labels = {
        admin: ["Administrador geral selecionado", "Acesso completo à base demonstrativa."],
        detective: ["Detetive selecionado", "Acesso restrito ao caso Sinal Interrompido."],
        viewer: ["Consulta selecionada", "Navegação em modo somente leitura."],
    };

    function selectProfile(card, focusPassword) {
        cards.forEach(item => {
            const active = item === card;
            item.classList.toggle("is-selected", active);
            item.setAttribute("aria-pressed", String(active));
        });
        email.value = card.dataset.email || "";
        password.value = card.dataset.password || "";
        email.dispatchEvent(new Event("input", { bubbles: true }));
        password.dispatchEvent(new Event("input", { bubbles: true }));
        const copy = labels[card.dataset.profileId] || ["Perfil selecionado", "Credencial pronta para uso."];
        selected.dataset.role = card.dataset.profileId;
        selected.querySelector("b").textContent = copy[0];
        selected.querySelector("small").textContent = copy[1];
        if (focusPassword) password.focus();
    }

    cards.forEach(card => card.addEventListener("click", () => selectProfile(card, false)));
    if (email.value) {
        const matching = cards.find(card => card.dataset.email.toLowerCase() === email.value.toLowerCase());
        if (matching) selectProfile(matching, false);
    }

    toggle?.addEventListener("click", () => {
        const reveal = password.type === "password";
        password.type = reveal ? "text" : "password";
        toggle.textContent = reveal ? "Ocultar" : "Mostrar";
        toggle.setAttribute("aria-label", reveal ? "Ocultar senha" : "Mostrar senha");
    });
})();
