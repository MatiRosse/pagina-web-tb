// Build the inquiry in the browser; the user sends it from WhatsApp.
(() => {
    const form = document.getElementById('translation-quote-form');
    if (!form) return;
    const english = document.documentElement.lang.toLowerCase().startsWith('en');

    form.addEventListener('submit', () => {
        const direction = document.getElementById('translation-direction').value;
        const documentType = document.getElementById('translation-document').value;
        const destination = document.getElementById('translation-destination').value.trim();
        const date = document.getElementById('translation-date').value;
        const dateLabel = date ? (english ? date : date.split('-').reverse().join('/')) : (english ? 'To be arranged' : 'A coordinar');
        form.elements.text.value = (english ? [
            'Hello, I would like a translation quote from Dr. Daniel Bulgheroni.',
            `Languages: ${direction}.`,
            `Document: ${documentType}.`,
            `Destination country and receiving authority: ${destination}.`,
            `Date needed: ${dateLabel}.`
        ] : [
            'Hola, quiero solicitar un presupuesto de traducción con el Dr. Daniel Bulgheroni.',
            `Idiomas: ${direction}.`,
            `Documento: ${documentType}.`,
            `País y organismo destinatario: ${destination}.`,
            `Fecha en que lo necesito: ${dateLabel}.`
        ]).join('\n');
    });
})();
