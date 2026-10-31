// Keep document inquiries on the existing email form, with their context ready to review.
(() => {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const params = new URLSearchParams(window.location.search);
    const tramite = (params.get('tramite') || '').trim().slice(0, 160);
    const jurisdiccion = (params.get('jurisdiccion') || '').trim();
    if (!tramite || !['CABA', 'Provincia de Buenos Aires', 'Nacional'].includes(jurisdiccion)) return;

    const context = `${tramite} (${jurisdiccion})`;
    const subject = form.elements.namedItem('subject');
    const message = form.elements.namedItem('message');
    const inquiry = `Hola, quiero consultar por ${context}. ¿Me confirman requisitos, modalidad y presupuesto final?`;

    // Defaults preserve the selected document if the visitor sends another inquiry after reset.
    subject.add(new Option(`Consulta por ${context}`, `Consulta por ${context}`, true, true));
    if (!message.value) {
        message.defaultValue = inquiry;
        message.value = inquiry;
    }
})();
