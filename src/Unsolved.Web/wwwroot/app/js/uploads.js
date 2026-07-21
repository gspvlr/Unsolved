const MAX_FILE_SIZE = 10 * 1024 * 1024;

function readAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error || new Error("Não foi possível ler o arquivo."));
        reader.readAsDataURL(file);
    });
}

export async function prepareImage(file, { maxWidth = 1400, maxHeight = 1400, quality = .86 } = {}) {
    if (!file?.type?.startsWith("image/")) throw new Error("Selecione um arquivo de imagem.");
    if (file.size > MAX_FILE_SIZE) throw new Error("A imagem deve ter no máximo 10 MB.");

    const source = await readAsDataUrl(file);
    const image = await new Promise((resolve, reject) => {
        const node = new Image();
        node.onload = () => resolve(node);
        node.onerror = () => reject(new Error("A imagem selecionada não pôde ser aberta."));
        node.src = source;
    });

    const ratio = Math.min(1, maxWidth / image.width, maxHeight / image.height);
    const width = Math.max(1, Math.round(image.width * ratio));
    const height = Math.max(1, Math.round(image.height * ratio));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { alpha: false });
    context.fillStyle = "#e9dfc4";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);
    return {
        dataUrl: canvas.toDataURL("image/jpeg", quality),
        name: file.name,
        type: "image/jpeg",
        width,
        height,
    };
}
