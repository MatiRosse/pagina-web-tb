(function () {
    'use strict';
    const WIDTH = 1240;
    const HEIGHT = 1754;
    const ROWS_PER_PAGE = 7;
    const COLORS = {
        ink:'#2f3331',
        charcoal:'#333333',
        muted:'#667085',
        line:'#dedede',
        soft:'#f7f6f3',
        green:'#344d3e',
        gold:'#c5a059',
        white:'#ffffff'
    };

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
        ctx.font = String(weight || 400) + ' ' + size + 'px Inter, Arial, sans-serif';
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
            const candidate = line ? line + ' ' + word : word;
            if (line && ctx.measureText(candidate).width > maxWidth) {
                lines.push(line);
                line = word;
            } else {
                line = candidate;
            }
        });
        if (line) lines.push(line);
        lines.slice(0, maxLines || lines.length).forEach((item, index) => {
            const truncated = maxLines && index === maxLines - 1 && lines.length > maxLines ? item + '…' : item;
            ctx.fillText(truncated, x, y + index * lineHeight);
        });
    }

    function localDate() {
        return new Intl.DateTimeFormat('es-AR', {
            day:'numeric',
            month:'long',
            year:'numeric',
            timeZone:'America/Argentina/Buenos_Aires'
        }).format(new Date());
    }

    function drawHeader(ctx, logo, pageNumber, pageCount) {
        ctx.fillStyle = COLORS.charcoal;
        ctx.fillRect(0, 0, WIDTH, 244);
        ctx.fillStyle = COLORS.gold;
        ctx.fillRect(0, 234, WIDTH, 10);
        ctx.drawImage(logo, 82, 54, 132, 127);
        text(ctx, 'Informe de simulación sucesoria', 246, 108, 43, 700, COLORS.white);
        text(ctx, 'Distribución orientativa · Derecho argentino', 248, 153, 23, 500, '#dddddd');
        text(ctx, 'tbabogados.com.ar', 1158, 116, 21, 600, COLORS.white, 'right');
        if (pageCount > 1) text(ctx, 'Página ' + pageNumber + ' de ' + pageCount, 1158, 157, 16, 500, '#d4d4d4', 'right');
    }

    function drawScenario(ctx, report) {
        roundedRect(ctx, 82, 286, 1076, 218, 20, COLORS.soft, COLORS.line);
        text(ctx, 'DATOS DEL ESCENARIO', 112, 329, 16, 700, COLORS.muted);
        (report.scenario || []).slice(0, 4).forEach((field, index) => {
            const column = index % 2;
            const row = Math.floor(index / 2);
            const x = 112 + column * 520;
            const y = 374 + row * 71;
            text(ctx, String(field.label || '').toUpperCase(), x, y, 13, 700, COLORS.gold);
            ctx.font = '600 20px Inter, Arial, sans-serif';
            ctx.fillStyle = COLORS.ink;
            wrapText(ctx, field.value, x, y + 28, 460, 23, 2);
        });
    }

    function drawFamilyNode(ctx, x, y, width, label, detail, emphasis) {
        roundedRect(ctx, x, y, width, 54, 12, emphasis ? COLORS.green : COLORS.white, emphasis ? COLORS.green : COLORS.line);
        text(ctx, label, x + width / 2, y + 23, 15, 700, emphasis ? COLORS.white : COLORS.ink, 'center');
        if (detail) text(ctx, detail, x + width / 2, y + 42, 11, 500, emphasis ? '#dce5dc' : COLORS.muted, 'center');
    }

    function drawFamilyGraph(ctx, report) {
        const family = report.family || {};
        const cardX = 82;
        const cardY = 522;
        const cardWidth = 1076;
        roundedRect(ctx, cardX, cardY, cardWidth, 246, 20, '#fbfcfa', COLORS.line);
        text(ctx, 'MAPA FAMILIAR DEL CASO', cardX + 30, cardY + 35, 15, 700, COLORS.muted);

        const centerX = 512;
        const centerY = 614;
        const centerWidth = 216;
        const nodeMidX = centerX + centerWidth / 2;
        ctx.strokeStyle = '#9cac96';
        ctx.lineWidth = 3;
        if ((family.parents || []).length) {
            ctx.beginPath(); ctx.moveTo(nodeMidX, centerY); ctx.lineTo(nodeMidX, 591); ctx.stroke();
            drawFamilyNode(ctx, centerX, 544, centerWidth, (family.parents || []).join(' y '), 'Ascendientes cargados', false);
        }
        if (family.partner) {
            ctx.beginPath(); ctx.moveTo(centerX, centerY + 27); ctx.lineTo(342, centerY + 27); ctx.stroke();
            drawFamilyNode(ctx, 122, centerY, 220, family.partner, family.partner === 'Cónyuge' ? 'Vínculo matrimonial' : 'No hereda sin testamento', false);
        }
        if (Number(family.siblings)) {
            ctx.beginPath(); ctx.moveTo(centerX + centerWidth, centerY + 27); ctx.lineTo(898, centerY + 27); ctx.stroke();
            drawFamilyNode(ctx, 898, centerY, 220, String(family.siblings) + (Number(family.siblings) === 1 ? ' hermano/a' : ' hermanos/as'), 'Colaterales cargados', false);
        }
        const children = family.children || [];
        if (children.length) {
            const grandchildren = children.reduce((total, person) => total + Number(person.grandchildren || 0), 0);
            ctx.beginPath(); ctx.moveTo(nodeMidX, centerY + 54); ctx.lineTo(nodeMidX, 700); ctx.stroke();
            const detail = grandchildren ? grandchildren + (grandchildren === 1 ? ' nieto/a por representación' : ' nietos/as por representación') : 'Sin nietos por representación cargados';
            drawFamilyNode(ctx, 440, 700, 360, children.length + (children.length === 1 ? ' hijo/a o rama' : ' hijos/as o ramas'), detail, false);
        }
        drawFamilyNode(ctx, centerX, centerY, centerWidth, 'Persona fallecida', 'Base del reparto: 100 %', true);
    }

    function percentageValue(value) {
        const match = String(value || '').replace(',', '.').match(/\d+(?:\.\d+)?/);
        return match ? Math.max(0, Math.min(100, Number(match[0]))) : 0;
    }

    function drawDistribution(ctx, report, rows) {
        text(ctx, 'Distribución estimada', 82, 822, 34, 700, COLORS.ink);
        text(ctx, report.baseName || 'Herencia', 1158, 822, 24, 700, COLORS.gold, 'right');
        const tableX = 82;
        const tableY = 850;
        const tableWidth = 1076;
        const rowHeight = 64;
        ctx.fillStyle = '#edf2e9';
        ctx.fillRect(tableX, tableY, tableWidth, 54);
        text(ctx, 'PERSONA', tableX + 28, tableY + 35, 15, 700, COLORS.muted);
        text(ctx, 'PARTICIPACIÓN GRÁFICA', tableX + 520, tableY + 35, 15, 700, COLORS.muted);
        text(ctx, 'PORCENTAJE', tableX + tableWidth - 28, tableY + 35, 15, 700, COLORS.muted, 'right');
        rows.forEach((row, index) => {
            const y = tableY + 54 + index * rowHeight;
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
            text(ctx, row.label, tableX + 28, y + 41, 19, 500, COLORS.ink);
            const barX = tableX + 520;
            const barY = y + 24;
            const barWidth = 370;
            roundedRect(ctx, barX, barY, barWidth, 16, 8, '#e5e9e3');
            const filledWidth = barWidth * percentageValue(row.value) / 100;
            if (filledWidth > 0) roundedRect(ctx, barX, barY, Math.max(16, filledWidth), 16, 8, COLORS.gold);
            text(ctx, row.value, tableX + tableWidth - 28, y + 41, 21, 700, COLORS.green, 'right');
        });
    }

    function drawNotice(ctx, report) {
        roundedRect(ctx, 82, 1382, 1076, 180, 18, COLORS.soft, COLORS.line);
        text(ctx, 'ALCANCE DEL INFORME', 112, 1424, 15, 700, COLORS.muted);
        ctx.font = '400 17px Inter, Arial, sans-serif';
        ctx.fillStyle = COLORS.ink;
        const assumptions = (report.notes || []).filter(note => String(note).indexOf('Supuesto por respuesta incierta:') === 0);
        const notice = assumptions.length
            ? assumptions.join(' ')
            : 'Esta simulación es orientativa y parte de los datos cargados. No reemplaza el análisis de documentación, titularidad de bienes, testamentos, donaciones, deudas ni circunstancias particulares del caso.';
        wrapText(ctx, notice, 112, 1464, 1010, 25, 3);
        text(ctx, report.basisDescription || '', 112, 1542, 15, 600, COLORS.gold);
    }

    function drawFooter(ctx) {
        ctx.strokeStyle = COLORS.line;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(82, 1632);
        ctx.lineTo(1158, 1632);
        ctx.stroke();
        text(ctx, 'TB Abogados', 82, 1675, 20, 700, COLORS.gold);
        text(ctx, 'Estudio Tassara & Bulgheroni · Sucesiones', 82, 1705, 16, 400, COLORS.muted);
        text(ctx, 'Generado el ' + localDate(), 1158, 1675, 17, 600, COLORS.muted, 'right');
    }

    function renderPage(report, logo, rows, pageNumber, pageCount) {
        const canvas = document.createElement('canvas');
        canvas.width = WIDTH;
        canvas.height = HEIGHT;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = COLORS.white;
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        drawHeader(ctx, logo, pageNumber, pageCount);
        drawScenario(ctx, report);
        drawFamilyGraph(ctx, report);
        drawDistribution(ctx, report, rows);
        drawNotice(ctx, report);
        drawFooter(ctx);
        return canvas;
    }

    async function download(report) {
        if (!report || !Array.isArray(report.rows) || !report.rows.length) throw new Error('Simulá la sucesión antes de generar el informe.');
        if (!window.TBPDFCore) throw new Error('No se pudo iniciar el generador del informe.');
        const embeddedLogo = window.TB_PDF_LOGO_DATA || window.TB_ALQUILER_PDF_LOGO_DATA;
        if (!embeddedLogo) throw new Error('No se pudo preparar el logo de TB Abogados.');
        const logo = await window.TBPDFCore.loadImage(embeddedLogo);
        const chunks = [];
        for (let index = 0; index < report.rows.length; index += ROWS_PER_PAGE) chunks.push(report.rows.slice(index, index + ROWS_PER_PAGE));
        const canvases = chunks.map((rows, index) => renderPage(report, logo, rows, index + 1, chunks.length));
        const blob = window.TBPDFCore.buildPdf(canvases);
        window.TBPDFCore.downloadBlob(blob, 'informe-simulacion-sucesion-' + window.TBPDFCore.localDateSlug() + '.pdf');
    }

    window.TBHerenciaPDF = { download };
})();
