/* =============================================================
   validation.js — Validação no cliente
   Espelha as regras do servidor (ViewModels com DataAnnotations).
   Exposto em window.UnsolvedValidation para o forms.js reutilizar.
   ============================================================= */
(function () {
    "use strict";

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRe = /^[\d\s()+\-.]{8,20}$/;

    // Regras por atributo name. Retorna mensagem de erro ou "" se válido.
    const rules = {
        Name: function (v) {
            if (!v.trim()) return "Informe seu nome.";
            if (v.trim().length < 2) return "O nome deve ter ao menos 2 caracteres.";
            return "";
        },
        Organization: function (v) {
            if (!v.trim()) return "Informe a instituição ou empresa.";
            return "";
        },
        Email: function (v) {
            if (!v.trim()) return "Informe um e-mail.";
            if (!emailRe.test(v.trim())) return "Informe um e-mail válido.";
            return "";
        },
        Password: function (v) {
            if (!v) return "Informe sua senha.";
            return "";
        },
        Phone: function (v) {
            if (v && v.trim() && !phoneRe.test(v.trim())) return "Informe um telefone válido.";
            return "";
        },
        Message: function (v) {
            if (v && v.length > 2000) return "Máximo de 2000 caracteres.";
            return "";
        }
    };

    // Mostra/limpa o erro de um campo.
    function setFieldError(field, message) {
        const wrap = field.closest(".field") || field.parentElement;
        let holder = wrap ? wrap.querySelector('[data-error-for="' + field.name + '"]') : null;
        if (!holder && wrap) holder = wrap.querySelector(".field-error");
        if (message) {
            if (wrap) wrap.classList.add("has-error");
            if (holder) holder.textContent = message;
            field.setAttribute("aria-invalid", "true");
        } else {
            if (wrap) wrap.classList.remove("has-error");
            if (holder) holder.textContent = "";
            field.removeAttribute("aria-invalid");
        }
    }

    // Valida um único campo (se houver regra para o name dele).
    function validateField(field) {
        const rule = rules[field.name];
        if (!rule) return true;
        const msg = rule(field.value || "");
        setFieldError(field, msg);
        return !msg;
    }

    // Valida o formulário inteiro. Foca o primeiro campo inválido.
    function validateForm(form) {
        let ok = true;
        let firstInvalid = null;
        form.querySelectorAll("input, select, textarea").forEach(function (field) {
            if (!field.name || field.type === "hidden" || field.disabled) return;
            const valid = validateField(field);
            if (!valid && !firstInvalid) firstInvalid = field;
            if (!valid) ok = false;
        });
        if (firstInvalid) firstInvalid.focus();
        return ok;
    }

    // Validação "ao vivo": valida no blur e limpa erro ao digitar.
    function attachLiveValidation(form) {
        form.querySelectorAll("input, select, textarea").forEach(function (field) {
            if (!field.name || !rules[field.name]) return;
            field.addEventListener("blur", function () { validateField(field); });
            field.addEventListener("input", function () {
                const wrap = field.closest(".field");
                if (wrap && wrap.classList.contains("has-error")) validateField(field);
            });
        });
    }

    // Anexa validação a formulários marcados (contato + login).
    document.querySelectorAll(".js-contact-form, .js-validate").forEach(attachLiveValidation);

    // Login (form comum, sem AJAX): bloqueia envio se inválido.
    document.querySelectorAll(".js-validate").forEach(function (form) {
        form.addEventListener("submit", function (e) {
            if (!validateForm(form)) e.preventDefault();
        });
    });

    window.UnsolvedValidation = { validateForm: validateForm, setFieldError: setFieldError };
})();
