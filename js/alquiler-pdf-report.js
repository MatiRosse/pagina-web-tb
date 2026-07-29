(function () {
    const PAGE_WIDTH = 1240;
    const PAGE_HEIGHT = 1754;
    const COLORS = {
        ink: '#1f2937',
        muted: '#667085',
        line: '#dfe4ea',
        soft: '#f6f7f9',
        navy: '#333333',
        gold: '#c5a059',
        green: '#079669',
        white: '#ffffff'
    };

    function money(value) {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            maximumFractionDigits: 0
        }).format(value).replace('ARS', '$');
    }

    function percent(value, decimals = 1) {
        return `${new Intl.NumberFormat('es-AR', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(value)}%`;
    }

    function number(value, decimals = 4) {
        return new Intl.NumberFormat('es-AR', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(value);
    }

    function date(value, options) {
        const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
        const parsed = dateOnly
            ? new Date(`${value}T00:00:00Z`)
            : new Date(value);
        return new Intl.DateTimeFormat('es-AR', options || {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            timeZone: dateOnly ? 'UTC' : 'America/Argentina/Buenos_Aires'
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

        const visible = maxLines ? lines.slice(0, maxLines) : lines;
        visible.forEach((item, index) => {
            let output = item;
            if (maxLines && index === maxLines - 1 && lines.length > maxLines) output = `${item.replace(/[.,;:]?$/, '')}…`;
            ctx.fillText(output, x, y + (index * lineHeight));
        });
        return y + (visible.length * lineHeight);
    }

    function createPage() {
        const canvas = document.createElement('canvas');
        canvas.width = PAGE_WIDTH;
        canvas.height = PAGE_HEIGHT;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = COLORS.white;
        ctx.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);
        return { canvas, ctx };
    }

    function loadImage(source) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = () => reject(new Error('No se pudo cargar el logo de TB Abogados.'));
            image.src = source;
        });
    }

    function drawHeader(ctx, logo, compact) {
        const height = compact ? 150 : 260;
        ctx.fillStyle = COLORS.navy;
        ctx.fillRect(0, 0, PAGE_WIDTH, height);
        ctx.fillStyle = COLORS.gold;
        ctx.fillRect(0, height - 10, PAGE_WIDTH, 10);

        const logoSize = compact ? 92 : 126;
        const logoY = compact ? 27 : 62;
        ctx.drawImage(logo, 82, logoY, logoSize, logoSize);
        text(ctx, 'Actualización de alquiler', compact ? 200 : 238, compact ? 75 : 125, compact ? 38 : 52, 700, COLORS.white);
        text(ctx, 'Informe orientativo · TB Abogados', compact ? 200 : 240, compact ? 111 : 171, compact ? 20 : 25, 500, '#d8dee9');

        text(ctx, 'tbabogados.com.ar', 1158, compact ? 91 : 139, compact ? 19 : 22, 600, COLORS.white, 'right');
        return height;
    }

    function drawFooter(ctx, page, totalPages) {
        ctx.strokeStyle = COLORS.line;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(82, 1650);
        ctx.lineTo(1158, 1650);
        ctx.stroke();
        text(ctx, 'TB Abogados', 82, 1690, 20, 700, COLORS.gold);
        text(ctx, 'Informe meramente orientativo. No sustituye el asesoramiento profesional.', 82, 1723, 16, 400, COLORS.muted);
        text(ctx, 'tbabogados.com.ar', 1158, 1690, 18, 700, COLORS.gold, 'right');
        text(ctx, `Página ${page} de ${totalPages}`, 1158, 1723, 16, 500, COLORS.muted, 'right');
    }

    function drawMetric(ctx, x, y, width, label, value, accent) {
        roundedRect(ctx, x, y, width, 144, 20, COLORS.white, COLORS.line);
        text(ctx, label.toUpperCase(), x + 26, y + 43, 16, 700, COLORS.muted);
        text(ctx, value, x + 26, y + 100, 31, 700, accent || COLORS.ink);
    }

    function buildChartPoints(report, history) {
        const points = [{ date: report.requestedStart, amount: report.baseAmount }];
        history.rows.forEach((row) => points.push({ date: row.date, amount: row.currentAmount }));
        const last = points[points.length - 1];
        if (last.date !== report.requestedEnd) points.push({ date: report.requestedEnd, amount: last.amount });
        return points;
    }

    function drawChart(ctx, report, history) {
        const points = buildChartPoints(report, history);
        const x = 102;
        const y = 1000;
        const width = 1056;
        const height = 370;
        const plot = { left: x + 112, right: x + width - 20, top: y + 28, bottom: y + height - 66 };
        const start = new Date(`${report.requestedStart}T00:00:00Z`).getTime();
        const requestedEnd = new Date(`${report.requestedEnd}T00:00:00Z`).getTime();
        const end = Math.max(requestedEnd, start + 86400000);
        const maximum = Math.max(...points.map((point) => point.amount), 1) * 1.08;
        const xFor = (value) => plot.left + (((new Date(`${value}T00:00:00Z`).getTime() - start) / (end - start)) * (plot.right - plot.left));
        const yFor = (value) => plot.bottom - ((value / maximum) * (plot.bottom - plot.top));

        for (let index = 0; index <= 4; index += 1) {
            const amount = (maximum / 4) * index;
            const lineY = yFor(amount);
            ctx.strokeStyle = COLORS.line;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(plot.left, lineY);
            ctx.lineTo(plot.right, lineY);
            ctx.stroke();
            text(ctx, money(amount), plot.left - 16, lineY + 6, 15, 600, '#8491a6', 'right');
        }

        ctx.strokeStyle = COLORS.gold;
        ctx.lineWidth = 6;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(xFor(points[0].date), yFor(points[0].amount));
        for (let index = 1; index < points.length; index += 1) {
            ctx.lineTo(xFor(points[index].date), yFor(points[index - 1].amount));
            ctx.lineTo(xFor(points[index].date), yFor(points[index].amount));
        }
        ctx.stroke();

        points.slice(0, -1).forEach((point) => {
            ctx.beginPath();
            ctx.arc(xFor(point.date), yFor(point.amount), 8, 0, Math.PI * 2);
            ctx.fillStyle = COLORS.white;
            ctx.fill();
            ctx.strokeStyle = COLORS.gold;
            ctx.lineWidth = 5;
            ctx.stroke();
        });

        const middleDate = new Date((start + requestedEnd) / 2).toISOString().slice(0, 10);
        [
            [report.requestedStart, 'left'],
            [middleDate, 'center'],
            [report.requestedEnd, 'right']
        ].forEach(([value, alignment]) => {
            const labelX = xFor(value);
            const canvasAlign = alignment === 'center' ? 'center' : alignment;
            text(ctx, date(value, { month: 'short', year: 'numeric', timeZone: 'UTC' }), labelX, plot.bottom + 42, 17, 600, COLORS.muted, canvasAlign);
        });
    }

    function renderSummaryPage(report, history, logo, totalPages) {
        const { canvas, ctx } = createPage();
        drawHeader(ctx, logo, false);

        roundedRect(ctx, 82, 304, 1076, 128, 20, COLORS.soft, COLORS.line);
        const metadata = [
            ['ALQUILER BASE', money(report.baseAmount)],
            ['ÍNDICE', report.indexLabel],
            ['INICIO', date(report.requestedStart, { month: 'long', year: 'numeric', timeZone: 'UTC' })],
            ['ACTUALIZACIÓN', date(report.requestedEnd, { month: 'long', year: 'numeric', timeZone: 'UTC' })]
        ];
        metadata.forEach(([label, value], index) => {
            const itemX = 112 + (index * 258);
            text(ctx, label, itemX, 347, 15, 700, COLORS.muted);
            text(ctx, value, itemX, 390, 21, 700, COLORS.ink);
        });

        roundedRect(ctx, 82, 472, 520, 270, 22, COLORS.white, COLORS.line);
        text(ctx, 'ALQUILER ACTUALIZADO', 112, 522, 18, 700, COLORS.muted);
        text(ctx, money(report.updatedAmount), 112, 598, 48, 700, COLORS.ink);
        text(ctx, `+${percent(report.totalChangePercent)} desde el inicio`, 112, 646, 22, 700, COLORS.green);
        text(ctx, `Vigente desde ${date(report.appliedEnd)}`, 112, 701, 18, 600, COLORS.muted);

        roundedRect(ctx, 634, 472, 524, 270, 22, COLORS.soft, COLORS.line);
        text(ctx, 'DATOS CLAVE', 664, 522, 18, 700, COLORS.muted);
        drawMetric(ctx, 664, 548, 218, 'Incremento', money(report.increase), COLORS.ink);
        drawMetric(ctx, 910, 548, 218, 'Coeficiente', number(report.factor), COLORS.ink);
        text(ctx, `${report.adjustmentCount} ${report.adjustmentCount === 1 ? 'ajuste aplicado' : 'ajustes aplicados'} · ${report.periodLabel}`, 664, 725, 18, 600, COLORS.muted);

        roundedRect(ctx, 82, 782, 1076, 132, 20, COLORS.soft, COLORS.line);
        text(ctx, 'PRÓXIMO AJUSTE', 112, 824, 15, 700, COLORS.muted);
        text(ctx, date(report.nextAdjustment), 112, 871, 25, 700, COLORS.ink);
        text(ctx, 'FUENTE OFICIAL', 620, 824, 15, 700, COLORS.muted);
        ctx.font = '600 20px Inter, Arial, sans-serif';
        ctx.fillStyle = COLORS.ink;
        wrapText(ctx, report.sourceLabel, 620, 866, 500, 25, 2);

        text(ctx, 'Evolución del alquiler', 82, 972, 31, 700, COLORS.ink);
        drawChart(ctx, report, history);

        roundedRect(ctx, 82, 1406, 1076, 182, 20, COLORS.soft, COLORS.line);
        text(ctx, 'CRITERIO DEL CÁLCULO', 112, 1450, 16, 700, COLORS.muted);
        ctx.font = '400 18px Inter, Arial, sans-serif';
        ctx.fillStyle = COLORS.ink;
        wrapText(ctx, report.calculationNote, 112, 1490, 1016, 29, 3);
        drawFooter(ctx, 1, totalPages);
        return canvas;
    }

    function renderHistoryPage(report, rows, logo, pageNumber, totalPages, rowOffset) {
        const { canvas, ctx } = createPage();
        drawHeader(ctx, logo, true);
        text(ctx, 'Historial de ajustes', 82, 235, 38, 700, COLORS.ink);
        text(ctx, `${report.indexLabel} · ${report.periodLabel}`, 82, 274, 20, 500, COLORS.muted);

        const tableX = 82;
        const tableY = 320;
        const tableWidth = 1076;
        const columns = [0, 248, 530, 812, 1076];
        const headers = ['Fecha', 'Valor anterior', 'Valor nuevo', 'Variación'];
        ctx.fillStyle = COLORS.soft;
        ctx.fillRect(tableX, tableY, tableWidth, 70);
        headers.forEach((header, index) => {
            const align = index === 0 ? 'left' : 'right';
            const headerX = index === 0 ? tableX + 24 : tableX + columns[index + 1] - 24;
            text(ctx, header.toUpperCase(), headerX, tableY + 44, 16, 700, COLORS.muted, align);
        });

        const rowHeight = 73;
        rows.forEach((row, index) => {
            const y = tableY + 70 + (index * rowHeight);
            if (index % 2) {
                ctx.fillStyle = '#fafbfc';
                ctx.fillRect(tableX, y, tableWidth, rowHeight);
            }
            ctx.strokeStyle = COLORS.line;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(tableX, y + rowHeight);
            ctx.lineTo(tableX + tableWidth, y + rowHeight);
            ctx.stroke();
            text(ctx, date(row.date, { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }), tableX + 24, y + 46, 19, 500, COLORS.ink);
            text(ctx, money(row.previousAmount), tableX + columns[2] - 24, y + 46, 19, 500, COLORS.muted, 'right');
            text(ctx, money(row.currentAmount), tableX + columns[3] - 24, y + 46, 19, 700, COLORS.ink, 'right');
            text(ctx, `+${percent(row.change * 100)}`, tableX + columns[4] - 24, y + 46, 19, 700, COLORS.green, 'right');
        });

        if (rows.length) {
            text(ctx, `Ajustes ${rowOffset + 1}–${rowOffset + rows.length} de ${report.adjustmentCount}`, 82, 1555, 17, 500, COLORS.muted);
        } else {
            text(ctx, 'Todavía no se cumplió ninguna fecha de ajuste en el período consultado.', 106, 458, 21, 500, COLORS.muted);
        }
        drawFooter(ctx, pageNumber, totalPages);
        return canvas;
    }

    function base64Bytes(dataUrl) {
        const binary = atob(dataUrl.split(',')[1]);
        const bytes = new Uint8Array(binary.length);
        for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
        return bytes;
    }

    function encode(value) {
        return new TextEncoder().encode(value);
    }

    function concat(parts) {
        const length = parts.reduce((total, part) => total + part.length, 0);
        const output = new Uint8Array(length);
        let offset = 0;
        parts.forEach((part) => {
            output.set(part, offset);
            offset += part.length;
        });
        return output;
    }

    function buildPdf(canvases) {
        const objectCount = 2 + (canvases.length * 3);
        const objects = new Array(objectCount + 1);
        const pageIds = canvases.map((_, index) => 3 + (index * 3));
        objects[1] = encode('<< /Type /Catalog /Pages 2 0 R >>');
        objects[2] = encode(`<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${canvases.length} >>`);

        canvases.forEach((canvas, index) => {
            const pageId = pageIds[index];
            const contentId = pageId + 1;
            const imageId = pageId + 2;
            const imageName = `Im${index + 1}`;
            const image = base64Bytes(canvas.toDataURL('image/jpeg', 0.9));
            const stream = `q\n595.28 0 0 841.89 0 0 cm\n/${imageName} Do\nQ`;
            objects[pageId] = encode(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /${imageName} ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>`);
            objects[contentId] = concat([encode(`<< /Length ${stream.length} >>\nstream\n`), encode(stream), encode('\nendstream')]);
            objects[imageId] = concat([
                encode(`<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.length} >>\nstream\n`),
                image,
                encode('\nendstream')
            ]);
        });

        const parts = [encode('%PDF-1.4\n%TBPDF\n')];
        const offsets = new Array(objectCount + 1).fill(0);
        let position = parts[0].length;
        for (let id = 1; id <= objectCount; id += 1) {
            offsets[id] = position;
            const object = concat([encode(`${id} 0 obj\n`), objects[id], encode('\nendobj\n')]);
            parts.push(object);
            position += object.length;
        }

        const xrefOffset = position;
        let xref = `xref\n0 ${objectCount + 1}\n0000000000 65535 f \n`;
        for (let id = 1; id <= objectCount; id += 1) xref += `${String(offsets[id]).padStart(10, '0')} 00000 n \n`;
        xref += `trailer\n<< /Size ${objectCount + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
        parts.push(encode(xref));
        return new Blob(parts, { type: 'application/pdf' });
    }

    function triggerDownload(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1500);
    }

    async function download(report) {
        if (!report || typeof report.loadHistory !== 'function') throw new Error('Calculá el resultado antes de generar el informe.');
        const embeddedLogo = window.TB_PDF_LOGO_DATA || window.TB_ALQUILER_PDF_LOGO_DATA;
        if (!embeddedLogo) throw new Error('No se pudo preparar el logo de TB Abogados.');
        const [logo, history] = await Promise.all([
            loadImage(embeddedLogo),
            report.loadHistory()
        ]);
        const rowsPerPage = 16;
        const historyChunks = [];
        for (let index = 0; index < history.rows.length; index += rowsPerPage) historyChunks.push(history.rows.slice(index, index + rowsPerPage));
        if (!historyChunks.length) historyChunks.push([]);
        const totalPages = 1 + historyChunks.length;
        const canvases = [renderSummaryPage(report, history, logo, totalPages)];
        historyChunks.forEach((rows, index) => {
            canvases.push(renderHistoryPage(report, rows, logo, index + 2, totalPages, index * rowsPerPage));
        });
        const blob = buildPdf(canvases);
        const filenameDate = new Intl.DateTimeFormat('en-CA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            timeZone: 'America/Argentina/Buenos_Aires'
        }).format(new Date());
        triggerDownload(blob, `informe-actualizacion-alquiler-${filenameDate}.pdf`);
    }

    window.TBAlquilerPDF = { download };
})();
