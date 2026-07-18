/* =============================================================
   forms.js — Envio dos formulários de contato via AJAX
   Valida no cliente (validation.js), envia com fetch e mostra
   a mensagem de sucesso SEM recarregar a página.
   ============================================================= */
(function () {
    "use strict";

    // Token antifalsificação renderizado no layout (@Html.AntiForgeryToken()).
    function antiForgeryToken() {
        const el = document.querySelector('input[name="__RequestVerificationToken"]');
        return el ? el.value : "";
    }

    function showFeedback(form, type, message) {
        const box = form.querySelector(".form-feedback");
        if (!box) return;
        box.hidden = false;
        box.className = "form-feedback " + (type === "success" ? "is-success" : "is-error");
        box.textContent = message;
    }

    function handleSubmit(form) {
        form.addEventListener("submit", async function (e) {
            e.preventDefault();

            // 1) Validação no cliente.
            const V = window.UnsolvedValidation;
            if (V && !V.validateForm(form)) {
                showFeedback(form, "error", "Verifique os campos destacados.");
                return;
            }

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn ? submitBtn.textContent : "";
            if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Enviando…"; }

            try {
                const data = new FormData(form);
                const res = await fetch(form.action, {
                    method: "POST",
                    headers: {
                        "Accept": "application/json",
                        "RequestVerificationToken": antiForgeryToken()
                    },
                    body: data
                });

                const payload = await res.json().catch(function () { return {}; });

                if (res.ok && payload.success) {
                    // 2) Sucesso: mostra mensagem + protocolo e limpa o formulário.
                    form.reset();
                    showFeedback(form, "success",
                        (payload.message || "Solicitação enviada com sucesso.") +
                        (payload.protocol ? " Protocolo: " + payload.protocol : ""));
                    document.dispatchEvent(new CustomEvent("unsolved:contact-success"));
                } else if (payload.errors) {
                    // 3) Erros de validação do servidor: aplica por campo.
                    Object.keys(payload.errors).forEach(function (key) {
                        const field = form.querySelector('[name="' + key + '"]');
                        if (field && V) V.setFieldError(field, payload.errors[key][0]);
                    });
                    showFeedback(form, "error", "Verifique os campos destacados.");
                } else {
                    showFeedback(form, "error", "Não foi possível enviar. Tente novamente.");
                }
            } catch (err) {
                showFeedback(form, "error", "Erro de conexão. Tente novamente em instantes.");
            } finally {
                if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalText; }
            }
        });
    }

    document.querySelectorAll(".js-contact-form").forEach(handleSubmit);
})();
