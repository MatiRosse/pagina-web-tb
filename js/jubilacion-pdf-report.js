(function () {
    const WIDTH = 1240;
    const HEIGHT = 1754;
    const COLORS = {
        ink: '#272727',
        charcoal: '#333333',
        muted: '#667085',
        line: '#dedede',
        soft: '#f7f6f3',
        gold: '#c5a059',
        green: '#079669',
        orange: '#c26a16',
        white: '#ffffff'
    };

    function money(value) {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            maximumFractionDigits: 0
        }).format(value).replace('ARS', '$');
    }

    function years(value) {
        return `${value} ${value === 1 ? 'año' : 'años'}`;
    }

    function roundedRect(ctx, x, y, width, height, radius, fill, stroke) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        if (fill) {
            ctx.fillStyle = fill;
            ctx.fill();
        }
        if (stroke) {
            ctx.strokeStyle = stroke;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    function text(ctx, value, x, y, size, weight, color, align) {
        ctx.font = `${weight || 400} ${size}px Inter, Arial, sans-serif`;
        ctx.fillStyle = color || COLORS.ink;
        ctx.textAlign = align || 'left';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(String(value), x, y);
    }

    function wrapText(ctx, value, x, y, maxWidth, lineHeight, maxLines) {
        const words = String(value || '').split(/\s+/);
        const lines = [];
        let line = '';

        words.forEach((word) => {
            const candidate = line ? `${line} ${word}` : word;
            if (line && ctx.measureText(candidate).width > maxWidth) {
                lines.push(line);
                line = word;
            } else {
                line = candidate;
            }
        });
        if (line) lines.push(line);

        const visible = maxLines ? lines.slice(0, maxLines) : lines;
        visible.forEach((item, index) => {
            const truncated = maxLines && index === maxLines - 1 && lines.length > maxLines
                ? `${item.replace(/[.,;:]?$/, '')}…`
                : item;
            ctx.fillText(truncated, x, y + (index * lineHeight));
        });
    }

    function drawHeader(ctx, logo) {
        ctx.fillStyle = COLORS.charcoal;
        ctx.fillRect(0, 0, WIDTH, 250);
        ctx.fillStyle = COLORS.gold;
        ctx.fillRect(0, 240, WIDTH, 10);
        ctx.drawImage(logo, 82, 57, 132, 127);
        text(ctx, 'Informe previsional', 246, 112, 48, 700, COLORS.white);
        text(ctx, 'Jubilación ordinaria · estimación orientativa', 248, 158, 24, 500, '#dddddd');
        text(ctx, 'tbabogados.com.ar', 1158, 136, 22, 600, COLORS.white, 'right');
    }

    function drawMetadata(ctx, report) {
        roundedRect(ctx, 82, 296, 1076, 148, 20, COLORS.soft, COLORS.line);
        const fields = [
            ['RÉGIMEN GENERAL', report.regimen],
            ['EDAD ACTUAL', years(report.age)],
            ['APORTES REGISTRADOS', years(report.aportes)],
            ['EDAD REQUERIDA', years(report.requiredAge)]
        ];
        fields.forEach(([label, value], index) => {
            const x = 112 + (index * 258);
            text(ctx, label, x, 342, 15, 700, COLORS.muted);
            text(ctx, value, x, 389, 22, 700, COLORS.ink);
        });
    }

    function drawSummary(ctx, report) {
        const accent = report.qualifies ? COLORS.green : COLORS.orange;
        roundedRect(ctx, 82, 486, 690, 270, 22, COLORS.white, COLORS.line);
        text(ctx, 'RESULTADO PREVISIONAL', 116, 535, 18, 700, COLORS.muted);
        ctx.font = '700 38px Inter, Arial, sans-serif';
        ctx.fillStyle = accent;
        wrapText(ctx, report.title, 116, 598, 620, 45, 2);
        text(ctx, 'Según los datos ingresados y las reglas generales.', 116, 682, 18, 500, COLORS.muted);

        roundedRect(ctx, 804, 486, 354, 270, 22, COLORS.soft, COLORS.line);
        text(ctx, 'APORTES FALTANTES', 834, 535, 17, 700, COLORS.muted);
        text(ctx, report.missingAportes ? years(report.missingAportes) : 'Ninguno', 834, 605, 37, 700, report.missingAportes ? COLORS.orange : COLORS.green);
        text(ctx, 'APORTES COMPUTABLES', 834, 653, 14, 700, COLORS.muted);
        text(ctx, `${years(report.computableAportes)} de 30`, 834, 683, 19, 700, COLORS.ink);
        text(ctx, 'COMPENSACIÓN POR EDAD', 834, 718, 14, 700, COLORS.muted);
        text(ctx, report.compensationYears ? years(report.compensationYears) : 'No aplica', 834, 740, 19, 700, COLORS.ink);
    }

    function drawRequirements(ctx, report) {
        text(ctx, 'Requisitos considerados', 82, 820, 34, 700, COLORS.ink);
        const rows = [
            ['Edad mínima del régimen general', years(report.requiredAge), report.age >= report.requiredAge],
            ['Aportes computables estimados', `${years(report.computableAportes)} de 30`, report.computableAportes >= 30]
        ];
        rows.forEach(([label, value, ok], index) => {
            const y = 852 + (index * 82);
            roundedRect(ctx, 82, y, 1076, 72, 14, index % 2 ? COLORS.soft : COLORS.white, COLORS.line);
            text(ctx, ok ? '✓' : '!', 112, y + 47, 25, 700, ok ? COLORS.green : COLORS.orange);
            text(ctx, label, 154, y + 45, 20, 500, COLORS.ink);
            text(ctx, value, 1128, y + 45, 21, 700, COLORS.ink, 'right');
        });
    }

    function drawHaber(ctx, report) {
        const haber = report.haber;
        if (!haber) {
            roundedRect(ctx, 82, 1050, 1076, 288, 20, COLORS.soft, COLORS.line);
            text(ctx, 'ESTIMACIÓN DEL HABER', 112, 1098, 17, 700, COLORS.muted);
            text(ctx, 'No calculada', 112, 1162, 34, 700, COLORS.ink);
            ctx.font = '400 20px Inter, Arial, sans-serif';
            ctx.fillStyle = COLORS.muted;
            wrapText(ctx, 'Para estimar el haber mensual inicial, completá en la calculadora el sueldo bruto promedio actualizado de los últimos 10 años.', 112, 1212, 1000, 31, 3);
            return;
        }

        roundedRect(ctx, 82, 1050, 1076, 288, 20, COLORS.white, COLORS.line);
        text(ctx, 'HABER MENSUAL ESTIMADO', 112, 1098, 17, 700, COLORS.muted);
        text(ctx, money(haber.haberFinal), 112, 1164, 45, 700, COLORS.gold);
        text(ctx, `Sueldo promedio informado: ${money(report.sueldoPromedio)}`, 112, 1205, 18, 500, COLORS.muted);

        const adjustment = haber.haberFinal - haber.haberBruto;
        const rows = [
            ['Prestación Básica Universal (PBU)', money(report.haberesVigentes.pbu)],
            [`Prestación Compensatoria (${years(haber.aniosPc)})`, money(haber.pc)],
            [`Prestación Adicional por Permanencia (${years(haber.aniosPap)})`, money(haber.pap)],
            [adjustment > 0 ? 'Garantía de haber mínimo' : adjustment < 0 ? 'Aplicación del haber máximo' : 'Ajuste por mínimo o máximo', adjustment ? `${adjustment > 0 ? '+' : '−'}${money(Math.abs(adjustment))}` : 'No aplica']
        ];
        rows.forEach(([label, value], index) => {
            const x = index % 2 === 0 ? 112 : 640;
            const y = index < 2 ? 1260 : 1310;
            text(ctx, label, x, y, 15, 500, COLORS.muted);
            text(ctx, value, x + 466, y, 17, 700, COLORS.ink, 'right');
        });
    }

    function drawDisclaimer(ctx, report) {
        roundedRect(ctx, 82, 1380, 1076, 210, 18, COLORS.soft, COLORS.line);
        text(ctx, 'ALCANCE DEL INFORME', 112, 1425, 16, 700, COLORS.muted);
        ctx.font = '400 17px Inter, Arial, sans-serif';
        ctx.fillStyle = COLORS.ink;
        wrapText(ctx, report.note, 112, 1465, 1010, 26, 3);
        ctx.fillStyle = COLORS.muted;
        wrapText(ctx, 'Es una orientación inicial basada en los datos ingresados. No reemplaza el análisis de la historia laboral, la documentación, los regímenes especiales ni la liquidación que realice ANSES.', 112, 1550, 1010, 25, 2);
    }

    function drawFooter(ctx) {
        ctx.strokeStyle = COLORS.line;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(82, 1650);
        ctx.lineTo(1158, 1650);
        ctx.stroke();
        text(ctx, 'TB Abogados', 82, 1692, 20, 700, COLORS.gold);
        text(ctx, 'Estudio Tassara & Bulgheroni · Derecho previsional', 82, 1723, 16, 400, COLORS.muted);
        text(ctx, 'tbabogados.com.ar', 1158, 1692, 18, 700, COLORS.gold, 'right');
    }

    function render(report, logo) {
        const canvas = document.createElement('canvas');
        canvas.width = WIDTH;
        canvas.height = HEIGHT;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = COLORS.white;
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        drawHeader(ctx, logo);
        drawMetadata(ctx, report);
        drawSummary(ctx, report);
        drawRequirements(ctx, report);
        drawHaber(ctx, report);
        drawDisclaimer(ctx, report);
        drawFooter(ctx);
        return canvas;
    }

    async function download(report) {
        if (!report || typeof report.age !== 'number') throw new Error('Calculá el resultado antes de generar el informe.');
        if (!window.TBPDFCore) throw new Error('No se pudo iniciar el generador del informe.');
        const embeddedLogo = window.TB_PDF_LOGO_DATA || window.TB_ALQUILER_PDF_LOGO_DATA;
        if (!embeddedLogo) throw new Error('No se pudo preparar el logo de TB Abogados.');
        const logo = await window.TBPDFCore.loadImage(embeddedLogo);
        const canvas = render(report, logo);
        const blob = window.TBPDFCore.buildPdf([canvas]);
        window.TBPDFCore.downloadBlob(blob, `informe-jubilacion-${window.TBPDFCore.localDateSlug()}.pdf`);
    }

    window.TBJubilacionPDF = { download };
})();
