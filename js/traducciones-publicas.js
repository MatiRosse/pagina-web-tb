// Build the inquiry in the browser; the user sends it from WhatsApp.
(() => {
    const form = document.getElementById('translation-quote-form');
    if (!form) return;

    form.addEventListener('submit', () => {
        const direction = document.getElementById('translation-direction').value;
        const documentType = document.getElementById('translation-document').value;
        const destination = document.getElementById('translation-destination').value.trim();
        const date = document.getElementById('translation-date').value;
        const dateLabel = date ? date.split('-').reverse().join('/') : 'A coordinar';
        form.elements.text.value = [
            'Hola, quiero solicitar un presupuesto de traducción con el Dr. Daniel Bulgheroni.',
            `Idiomas: ${direction}.`,
            `Documento: ${documentType}.`,
            `País y organismo destinatario: ${destination}.`,
            `Fecha en que lo necesito: ${dateLabel}.`
        ].join('\n');
    });
})();
