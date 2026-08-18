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
        white: '#ffffff'
    };

    function money(value) {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            maximumFractionDigits: 0
        }).format(value).replace('ARS', '$');
    }

    function number(value, decimals) {
        return new Intl.NumberFormat('es-AR', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(value);
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
        lines.slice(0, maxLines || lines.length).forEach((item, index) => {
            const output = maxLines && index === maxLines - 1 && lines.length > maxLines ? `${item}…` : item;
            ctx.fillText(output, x, y + (index * lineHeight));
        });
    }

    function drawHeader(ctx, logo) {
        ctx.fillStyle = COLORS.charcoal;
        ctx.fillRect(0, 0, WIDTH, 250);
        ctx.fillStyle = COLORS.gold;
        ctx.fillRect(0, 240, WIDTH, 10);
        ctx.drawImage(logo, 82, 57, 132, 127);
        text(ctx, 'Indemnización por accidente', 246, 112, 45, 700, COLORS.white);
        text(ctx, 'Accidente laboral · estimación orientativa', 248, 158, 24, 500, '#dddddd');
        text(ctx, 'tbabogados.com.ar', 1158, 136, 22, 600, COLORS.white, 'right');
    }

    function drawMetadata(ctx, report) {
        roundedRect(ctx, 82, 296, 1076, 148, 20, COLORS.soft, COLORS.line);
        const fields = [
            ['VIB MENSUAL ACTUALIZADO', money(report.salary)],
            ['EDAD A LA PMI', `${number(report.age, 0)} años`],
            ['INCAPACIDAD', `${number(report.disability, 1)}%`],
            ['TIPO DE ACCIDENTE', report.accidentTypeLabel]
        ];
        fields.forEach(([label, value], index) => {
            const x = 112 + (index * 258);
            text(ctx, label, x, 342, 15, 700, COLORS.muted);
            ctx.font = '700 21px Inter, Arial, sans-serif';
            ctx.fillStyle = COLORS.ink;
            wrapText(ctx, value, x, 386, 225, 26, 2);
        });
    }

    function drawSummary(ctx, report) {
        roundedRect(ctx, 82, 486, 650, 238, 22, COLORS.white, COLORS.line);
        text(ctx, 'INDEMNIZACIÓN ESTIMADA', 116, 535, 18, 700, COLORS.muted);
        text(ctx, money(report.total), 116, 616, 51, 700, COLORS.ink);
        text(ctx, 'Valor orientativo sujeto a revisión profesional.', 116, 675, 19, 500, COLORS.muted);

        roundedRect(ctx, 764, 486, 394, 238, 22, COLORS.soft, COLORS.line);
        text(ctx, 'COMPONENTES', 794, 535, 17, 700, COLORS.muted);
        text(ctx, 'Prestación base', 794, 588, 18, 500, COLORS.muted);
        text(ctx, money(report.baseAmount), 1128, 588, 21, 700, COLORS.ink, 'right');
        text(ctx, 'Adicional 20%', 794, 642, 18, 500, COLORS.muted);
        text(ctx, money(report.additionalAmount), 1128, 642, 21, 700, COLORS.ink, 'right');
        text(ctx, report.appliesAdditional ? 'Aplicado por accidente laboral' : 'No corresponde para in itinere', 794, 687, 16, 500, COLORS.muted);
    }

    function drawCalculation(ctx, report) {
        text(ctx, 'Desglose del cálculo', 82, 790, 34, 700, COLORS.ink);
        const tableX = 82;
        const tableY = 828;
        const tableWidth = 1076;
        const rows = [
            ['Fórmula legal', report.formulaAmount],
            ['Piso SRT del período', report.floorAmount],
            ['Prestación base aplicada (el mayor)', report.baseAmount],
            ['Adicional del 20% según tipo de accidente', report.additionalAmount],
            ['Total estimado', report.total]
        ];
        ctx.fillStyle = COLORS.soft;
        ctx.fillRect(tableX, tableY, tableWidth, 68);
        text(ctx, 'CONCEPTO', tableX + 28, tableY + 43, 16, 700, COLORS.muted);
        text(ctx, 'IMPORTE', tableX + tableWidth - 28, tableY + 43, 16, 700, COLORS.muted, 'right');
        rows.forEach(([label, value], index) => {
            const rowHeight = 56;
            const y = tableY + 68 + (index * rowHeight);
            if (index === rows.length - 1) ctx.fillStyle = '#f4efe5';
            else ctx.fillStyle = index % 2 ? '#fbfbfa' : COLORS.white;
            ctx.fillRect(tableX, y, tableWidth, rowHeight);
            ctx.strokeStyle = COLORS.line;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(tableX, y + rowHeight);
            ctx.lineTo(tableX + tableWidth, y + rowHeight);
            ctx.stroke();
            text(ctx, label, tableX + 28, y + 37, 18, index === rows.length - 1 ? 700 : 500, COLORS.ink);
            text(ctx, money(value), tableX + tableWidth - 28, y + 37, 19, 700, index === rows.length - 1 ? COLORS.gold : COLORS.ink, 'right');
        });

        roundedRect(ctx, 82, 1180, 1076, 142, 18, COLORS.soft, COLORS.line);
        text(ctx, 'FÓRMULA APLICADA', 112, 1223, 16, 700, COLORS.muted);
        text(ctx, 'Mayor entre: VIB × 53 × incapacidad × (65 ÷ edad) y piso SRT × incapacidad', 112, 1273, 21, 700, COLORS.ink);
    }

    function drawDisclaimer(ctx) {
        roundedRect(ctx, 82, 1360, 1076, 212, 18, COLORS.soft, COLORS.line);
        text(ctx, 'ALCANCE DEL INFORME', 112, 1404, 16, 700, COLORS.muted);
        ctx.font = '400 17px Inter, Arial, sans-serif';
        ctx.fillStyle = COLORS.ink;
        wrapText(ctx, 'Esta estimación se limita a incapacidad permanente parcial de hasta el 50% y aplica el piso SRT vigente del 1/3/2026 al 31/8/2026. El VIB debe estar actualizado con RIPTE e intereses. El monto real puede variar por fecha de primera manifestación invalidante, prestaciones adicionales, dictamen de Comisión Médica e instancia judicial.', 112, 1445, 1010, 28, 4);
    }

    function drawFooter(ctx) {
        ctx.strokeStyle = COLORS.line;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(82, 1650);
        ctx.lineTo(1158, 1650);
        ctx.stroke();
        text(ctx, 'TB Abogados', 82, 1692, 20, 700, COLORS.gold);
        text(ctx, 'Estudio Tassara & Bulgheroni · Riesgos del trabajo', 82, 1723, 16, 400, COLORS.muted);
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
        drawCalculation(ctx, report);
        drawDisclaimer(ctx);
        drawFooter(ctx);
        return canvas;
    }

    async function download(report) {
        if (!report || !Number.isFinite(report.total)) throw new Error('Calculá el resultado antes de generar el informe.');
        if (!window.TBPDFCore) throw new Error('No se pudo iniciar el generador del informe.');
        const embeddedLogo = window.TB_PDF_LOGO_DATA || window.TB_ALQUILER_PDF_LOGO_DATA;
        if (!embeddedLogo) throw new Error('No se pudo preparar el logo de TB Abogados.');
        const logo = await window.TBPDFCore.loadImage(embeddedLogo);
        const canvas = render(report, logo);
        const blob = window.TBPDFCore.buildPdf([canvas]);
        window.TBPDFCore.downloadBlob(blob, `informe-accidente-trabajo-${window.TBPDFCore.localDateSlug()}.pdf`);
    }

    window.TBAccidenteTrabajoPDF = { download };
})();
