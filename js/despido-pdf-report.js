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
        orange: '#f5901f',
        white: '#ffffff'
    };

    function money(value) {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            maximumFractionDigits: 0
        }).format(value).replace('ARS', '$');
    }

    function date(value) {
        const parsed = new Date(`${value}T00:00:00Z`);
        return new Intl.DateTimeFormat('es-AR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            timeZone: 'UTC'
        }).format(parsed);
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
            const truncated = maxLines && index === maxLines - 1 && lines.length > maxLines ? `${item}…` : item;
            ctx.fillText(truncated, x, y + (index * lineHeight));
        });
    }

    function drawHeader(ctx, logo) {
        ctx.fillStyle = COLORS.charcoal;
        ctx.fillRect(0, 0, WIDTH, 250);
        ctx.fillStyle = COLORS.gold;
        ctx.fillRect(0, 240, WIDTH, 10);
        ctx.drawImage(logo, 82, 57, 132, 127);
        text(ctx, 'Informe de indemnización', 246, 112, 48, 700, COLORS.white);
        text(ctx, 'Despido sin causa · estimación orientativa', 248, 158, 24, 500, '#dddddd');
        text(ctx, 'tbabogados.com.ar', 1158, 136, 22, 600, COLORS.white, 'right');
    }

    function drawMetadata(ctx, report) {
        roundedRect(ctx, 82, 296, 1076, 148, 20, COLORS.soft, COLORS.line);
        const fields = [
            ['FECHA DE INGRESO', date(report.entryDate)],
            ['FECHA DE DESPIDO', date(report.dismissalDate)],
            ['MEJOR SUELDO BRUTO', money(report.salary)],
            ['ANTIGÜEDAD', report.tenureLabel]
        ];
        fields.forEach(([label, value], index) => {
            const x = 112 + (index * 258);
            text(ctx, label, x, 342, 15, 700, COLORS.muted);
            ctx.font = '700 20px Inter, Arial, sans-serif';
            ctx.fillStyle = COLORS.ink;
            wrapText(ctx, value, x, 384, 225, 25, 2);
        });
    }

    function drawSummary(ctx, report) {
        roundedRect(ctx, 82, 486, 650, 238, 22, COLORS.white, COLORS.line);
        text(ctx, 'TOTAL ESTIMADO BRUTO', 116, 535, 18, 700, COLORS.muted);
        text(ctx, money(report.total), 116, 616, 51, 700, COLORS.ink);
        text(ctx, 'Sujeto a revisión documental y legal.', 116, 675, 19, 500, COLORS.muted);

        roundedRect(ctx, 764, 486, 394, 238, 22, COLORS.soft, COLORS.line);
        text(ctx, 'DATOS DEL CÁLCULO', 794, 535, 17, 700, COLORS.muted);
        text(ctx, 'Preaviso', 794, 581, 17, 500, COLORS.muted);
        text(ctx, report.preNoticeGranted ? 'Otorgado' : 'No otorgado', 1128, 581, 18, 700, COLORS.ink, 'right');
        text(ctx, 'Período de prueba', 794, 625, 17, 500, COLORS.muted);
        text(ctx, `${report.trialMonths} meses`, 1128, 625, 18, 700, COLORS.ink, 'right');
        text(ctx, 'Situación estimada', 794, 669, 17, 500, COLORS.muted);
        text(ctx, report.inTrial ? 'Dentro del período' : 'Fuera del período', 1128, 669, 18, 700, report.inTrial ? COLORS.orange : COLORS.ink, 'right');
    }

    function drawConcepts(ctx, report) {
        text(ctx, 'Conceptos incluidos', 82, 790, 34, 700, COLORS.ink);
        const tableX = 82;
        const tableY = 828;
        const tableWidth = 1076;
        const rowHeight = 68;
        ctx.fillStyle = COLORS.soft;
        ctx.fillRect(tableX, tableY, tableWidth, 68);
        text(ctx, 'CONCEPTO', tableX + 28, tableY + 43, 16, 700, COLORS.muted);
        text(ctx, 'IMPORTE', tableX + tableWidth - 28, tableY + 43, 16, 700, COLORS.muted, 'right');

        report.concepts.forEach((concept, index) => {
            const y = tableY + 68 + (index * rowHeight);
            if (index % 2) {
                ctx.fillStyle = '#fbfbfa';
                ctx.fillRect(tableX, y, tableWidth, rowHeight);
            }
            ctx.strokeStyle = COLORS.line;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(tableX, y + rowHeight);
            ctx.lineTo(tableX + tableWidth, y + rowHeight);
            ctx.stroke();
            text(ctx, concept.label, tableX + 28, y + 43, 20, 500, COLORS.ink);
            text(ctx, money(concept.value), tableX + tableWidth - 28, y + 43, 21, 700, COLORS.ink, 'right');
        });

        const totalY = tableY + 68 + (report.concepts.length * rowHeight) + 18;
        roundedRect(ctx, tableX, totalY, tableWidth, 88, 14, '#f4efe5', '#dfcfae');
        text(ctx, 'TOTAL ESTIMADO', tableX + 28, totalY + 56, 20, 700, COLORS.ink);
        text(ctx, money(report.total), tableX + tableWidth - 28, totalY + 56, 25, 700, COLORS.gold, 'right');
    }

    function drawDisclaimer(ctx) {
        roundedRect(ctx, 82, 1440, 1076, 152, 18, COLORS.soft, COLORS.line);
        text(ctx, 'ALCANCE DEL INFORME', 112, 1482, 16, 700, COLORS.muted);
        ctx.font = '400 17px Inter, Arial, sans-serif';
        ctx.fillStyle = COLORS.ink;
        wrapText(ctx, 'Esta estimación no reemplaza una liquidación profesional. El resultado puede variar por convenio colectivo, remuneraciones variables, topes legales, registración, multas, acuerdos, categoría laboral, documentación y circunstancias particulares del caso.', 112, 1522, 1010, 27, 3);
    }

    function drawFooter(ctx) {
        ctx.strokeStyle = COLORS.line;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(82, 1650);
        ctx.lineTo(1158, 1650);
        ctx.stroke();
        text(ctx, 'TB Abogados', 82, 1692, 20, 700, COLORS.gold);
        text(ctx, 'Estudio Tassara & Bulgheroni · Derecho laboral', 82, 1723, 16, 400, COLORS.muted);
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
        drawConcepts(ctx, report);
        drawDisclaimer(ctx);
        drawFooter(ctx);
        return canvas;
    }

    async function download(report) {
        if (!report || !Array.isArray(report.concepts)) throw new Error('Calculá el resultado antes de generar el informe.');
        if (!window.TBPDFCore) throw new Error('No se pudo iniciar el generador del informe.');
        const embeddedLogo = window.TB_PDF_LOGO_DATA || window.TB_ALQUILER_PDF_LOGO_DATA;
        if (!embeddedLogo) throw new Error('No se pudo preparar el logo de TB Abogados.');
        const logo = await window.TBPDFCore.loadImage(embeddedLogo);
        const canvas = render(report, logo);
        const blob = window.TBPDFCore.buildPdf([canvas]);
        window.TBPDFCore.downloadBlob(blob, `informe-indemnizacion-despido-${window.TBPDFCore.localDateSlug()}.pdf`);
    }

    window.TBDespidoPDF = { download };
})();
