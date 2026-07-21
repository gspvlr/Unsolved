import { el, clear, fmtDateTime } from "../dom.js";
import { icon } from "../icons.js";
import { exportAll, importAll, clearAll } from "../db.js";
import { ensureSeed } from "../seed.js";
import { navigate } from "../router.js";
import { pageHead } from "../widgets.js";
import { toast, confirmDialog } from "../ui.js";
import { prefs, applyTheme, toggleTheme, recentViews } from "../store.js";
import { accessCopy, canManageData, currentUser } from "../auth.js";

const ACCENTS = ["#F0D86D", "#B0863A", "#B5CDDA"];

export default async function renderSettings(container) {
    clear(container);
    container.appendChild(pageHead("Configurações", "Personalize a plataforma e gerencie seus dados"));

    const grid = el("div.dash");

    // Aparência
    grid.appendChild(section("col-6", "Aparência", "sun", [
        settingRow("Tema escuro", "Alterna entre claro e escuro", toggle(prefs.get("theme") === "dark", () => { toggleTheme(); toast("Tema atualizado", { type: "info" }); })),
        el("div.set-row", {}, [el("div.s-main", {}, [el("b", { text: "Realce institucional" }), el("span", { text: "Variações aprovadas da paleta Unsolved" })]),
            el("div.swatch-row", {}, ACCENTS.map(c => el("div.swatch" + (prefs.get("accent") === c ? ".active" : ""), { style: { background: c }, onclick: (e) => { prefs.set("accent", c); applyTheme(); [...e.currentTarget.parentElement.children].forEach(s => s.classList.remove("active")); e.currentTarget.classList.add("active"); toast("Cor aplicada", { type: "success" }); } })))]),
        settingRow("Densidade compacta", "Reduz espaçamentos das listas", toggle(prefs.get("density") === "compact", (on) => { prefs.set("density", on ? "compact" : "comfortable"); document.body.classList.toggle("compact", on); toast("Preferência salva", { type: "info" }); })),
    ]));

    // Notificações
    grid.appendChild(section("col-6", "Notificações", "bell", [
        settingRow("Alertas de casos críticos", "Avisar quando um caso crítico for aberto", toggle(true, () => toast("Preferência salva", { type: "info" }))),
        settingRow("Menções no mural", "Notificar quando eu for mencionado", toggle(true, () => toast("Preferência salva", { type: "info" }))),
        settingRow("Resumo diário por e-mail", "Enviar um resumo às 8h", toggle(false, () => toast("Preferência salva", { type: "info" }))),
    ]));

    // Dados & Backup
    if (canManageData()) grid.appendChild(section("col-6", "Dados e backup", "layers", [
        el("div.set-row", {}, [el("div.s-main", {}, [el("b", { text: "Exportar dados" }), el("span", { text: "Baixa um backup JSON de tudo (casos, pessoas, evidências…)" })]),
            el("button.btn", { html: icon("download") + "Exportar", onclick: doExport })]),
        el("div.set-row", {}, [el("div.s-main", {}, [el("b", { text: "Importar dados" }), el("span", { text: "Restaura de um backup JSON (substitui os dados atuais)" })]),
            el("button.btn", { html: icon("upload") + "Importar", onclick: doImport })]),
        el("div.set-row", {}, [el("div.s-main", {}, [el("b", { text: "Restaurar dados de exemplo" }), el("span", { text: "Apaga tudo e recria o conjunto inicial" })]),
            el("button.btn.danger", { html: icon("trash") + "Redefinir", onclick: doReset })]),
    ]));
    else {
        const access = accessCopy(), user = currentUser();
        grid.appendChild(section("col-6", "Permissões desta sessão", "lock", [
            el("div.permission-session-card", {}, [
                el("span.tag", { text: access.label }),
                el("b", { text: access.level }),
                el("p", { text: user.assignedCaseCode ? `Você pode editar somente ${user.assignedCaseCode} — ${user.assignedCaseTitle}.` : "Você pode navegar e consultar os registros, sem alterar a base demonstrativa." }),
            ]),
        ]));
    }

    // Integrações (preparado)
    if (canManageData()) grid.appendChild(section("col-6", "Integrações", "link", [
        integ("Banco de dados MySQL", "Sincronização quando o backend estiver ativo", "Em breve"),
        integ("Bitrix24", "Importar/exportar casos", "Em breve"),
        integ("Armazenamento de mídia", "Upload de evidências", "Em breve"),
    ]));

    // Logs / histórico
    const logs = recentViews();
    grid.appendChild(section("col-12", "Histórico de navegação", "clock", [
        logs.length ? el("div.card", { style: { padding: "6px" } }, [el("table.tbl", {}, [el("thead", {}, [el("tr", {}, ["Tela", "Quando"].map(h => el("th", { text: h })))]), el("tbody", {}, logs.map(l => el("tr", { onclick: () => location.hash = l.route }, [el("td", { text: l.title }), el("td", { text: fmtDateTime(l.at) })])))])]) : el("p.muted", { text: "Sem histórico ainda." }),
    ]));

    container.appendChild(grid);

    async function doExport() {
        const data = await exportAll();
        const blob = new Blob([JSON.stringify({ app: "unsolved-os", exportedAt: new Date().toISOString(), data }, null, 2)], { type: "application/json" });
        const a = el("a", { href: URL.createObjectURL(blob), download: `unsolved-backup-${Date.now()}.json` });
        document.body.appendChild(a); a.click(); a.remove();
        toast("Backup exportado", { type: "success" });
    }
    function doImport() {
        const inp = el("input", { type: "file", accept: "application/json", style: { display: "none" }, onchange: async (e) => {
            const file = e.target.files[0]; if (!file) return;
            try { const parsed = JSON.parse(await file.text()); await importAll(parsed.data || parsed); toast("Dados importados", { type: "success", title: "Backup restaurado" }); navigate("painel"); }
            catch { toast("Arquivo inválido", { type: "error" }); }
        } });
        document.body.appendChild(inp); inp.click(); inp.remove();
    }
    async function doReset() {
        if (!(await confirmDialog({ title: "Redefinir dados", message: "Todos os dados atuais serão apagados e o conjunto de exemplo recriado. Esta ação não pode ser desfeita.", confirmText: "Redefinir" }))) return;
        await clearAll(); await ensureSeed(); toast("Dados redefinidos", { type: "success" }); navigate("painel");
    }
}

function section(col, title, ic, rows) {
    return el("div.card.glow." + col, {}, [el("div.card-head", {}, [el("span", { html: icon(ic), style: { color: "var(--accent)" } }), el("h2", { text: title })]), el("div", {}, rows)]);
}
function settingRow(title, sub, control) {
    return el("div.set-row", {}, [el("div.s-main", {}, [el("b", { text: title }), el("span", { text: sub })]), control]);
}
function toggle(on, cb) {
    const input = el("input", { type: "checkbox", checked: on });
    input.addEventListener("change", () => cb(input.checked));
    return el("label.switch", {}, [input, el("span.track")]);
}
function integ(name, desc, status) {
    return el("div.set-row", {}, [el("div.s-main", {}, [el("b", { text: name }), el("span", { text: desc })]), el("span.tag", { text: status })]);
}
