(function () {
    const results = {};
    let stylesInjected = false;

    function injectStyles() {
        if (stylesInjected) return;
        stylesInjected = true;

        const style = document.createElement('style');
        style.textContent = `
            .tb-share-host {
                position: relative;
            }

            .tb-result-actions {
                display: flex;
                gap: 8px;
                position: absolute;
                top: 14px;
                right: 14px;
                z-index: 2;
            }

            .tb-result-action-button {
                width: 34px;
                height: 34px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                border-radius: 999px;
                border: 1px solid rgba(255, 255, 255, .55);
                background: rgba(255, 255, 255, .14);
                color: #fff;
                box-shadow: 0 8px 18px rgba(17, 24, 39, .10);
                transition: transform .2s ease, box-shadow .2s ease, background-color .2s ease;
            }

            .tb-result-action-button svg {
                width: 18px;
                height: 18px;
                display: block;
                stroke: currentColor;
                stroke-width: 2;
                stroke-linecap: round;
                stroke-linejoin: round;
                fill: none;
            }

            .tb-result-action-button:hover,
            .tb-result-action-button:focus-visible {
                background: rgba(255, 255, 255, .24);
                box-shadow: 0 10px 24px rgba(17, 24, 39, .16);
                transform: translateY(-1px);
                outline: none;
            }
        `;
        document.head.appendChild(style);
    }

    function downloadIcon() {
        return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12"></path><path d="m7 10 5 5 5-5"></path><path d="M5 21h14"></path></svg>';
    }

    function shareIcon() {
        return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><path d="m8.6 10.7 6.8-4.4"></path><path d="m8.6 13.3 6.8 4.4"></path></svg>';
    }

    function mount(id, targetSelector) {
        injectStyles();

        const target = document.querySelector(targetSelector);
        if (!target || target.querySelector('.tb-result-actions')) return;

        target.classList.add('tb-share-host');

        const actions = document.createElement('div');
        actions.className = 'tb-result-actions';
        actions.setAttribute('aria-label', 'Acciones del resultado');

        const downloadButton = document.createElement('button');
        downloadButton.type = 'button';
        downloadButton.className = 'tb-result-action-button';
        downloadButton.setAttribute('aria-label', 'Descargar resultado como imagen');
        downloadButton.setAttribute('title', 'Descargar resultado');
        downloadButton.innerHTML = downloadIcon();
        downloadButton.addEventListener('click', () => download(id));

        const shareButton = document.createElement('button');
        shareButton.type = 'button';
        shareButton.className = 'tb-result-action-button';
        shareButton.setAttribute('aria-label', 'Compartir resultado como imagen');
        shareButton.setAttribute('title', 'Compartir resultado');
        shareButton.innerHTML = shareIcon();
        shareButton.addEventListener('click', () => share(id));

        actions.append(downloadButton, shareButton);
        target.prepend(actions);
    }

    function drawRoundRect(ctx, x, y, width, height, radius) {
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
    }

    function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = String(text || '').split(/\s+/);
        let line = '';
        let currentY = y;

        words.forEach((word) => {
            const testLine = line ? `${line} ${word}` : word;
            if (ctx.measureText(testLine).width > maxWidth && line) {
                ctx.fillText(line, x, currentY);
                line = word;
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        });

        if (line) ctx.fillText(line, x, currentY);
        return currentY;
    }

    function createCanvas(data) {
        const rows = Array.isArray(data.rows) ? data.rows : [];
        const footer = data.footer || 'TB Abogados | Calculo orientativo';
        const width = 1080;
        const rowHeight = 76;
        const headerHeight = data.source ? 292 : 260;
        const cardHeight = 138 + (rows.length * rowHeight) + (data.total ? 88 : 24);
        const height = 48 + headerHeight + 52 + cardHeight + 96;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = width;
        canvas.height = height;

        ctx.fillStyle = '#f5f6f8';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#c5a059';
        drawRoundRect(ctx, 48, 48, width - 96, headerHeight, 24);
        ctx.fill();

        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.font = '600 34px Inter, Arial, sans-serif';
        ctx.fillText(data.title || 'Resultado estimado', width / 2, 112);
        ctx.font = '700 78px Inter, Arial, sans-serif';
        ctx.fillText(data.amount || '-', width / 2, 192);

        if (data.subtitle) {
            ctx.font = '400 28px Inter, Arial, sans-serif';
            ctx.fillText(data.subtitle, width / 2, 246);
        }

        if (data.source) {
            ctx.font = '400 20px Inter, Arial, sans-serif';
            ctx.fillText(data.source, width / 2, 282);
        }

        const cardX = 48;
        const cardY = 48 + headerHeight + 52;
        const cardW = width - 96;

        ctx.fillStyle = '#ffffff';
        drawRoundRect(ctx, cardX, cardY, cardW, cardHeight, 22);
        ctx.fill();

        ctx.textAlign = 'left';
        ctx.fillStyle = '#333333';
        ctx.font = '700 30px Georgia, serif';
        ctx.fillText(data.breakdownTitle || 'DETALLE DEL CALCULO', cardX + 50, cardY + 76);

        let y = cardY + 130;
        rows.forEach((row) => {
            ctx.fillStyle = '#eef0f3';
            ctx.fillRect(cardX + 50, y + rowHeight - 1, cardW - 100, 1);

            ctx.fillStyle = '#6b7280';
            ctx.font = '400 26px Inter, Arial, sans-serif';
            ctx.textAlign = 'left';
            wrapText(ctx, row.label, cardX + 50, y + 46, 610, 28);

            ctx.textAlign = 'right';
            ctx.fillStyle = row.accent ? '#ef4444' : '#333333';
            ctx.font = '700 26px Inter, Arial, sans-serif';
            ctx.fillText(row.value || '-', cardX + cardW - 50, y + 46);

            y += rowHeight;
        });

        if (data.total) {
            ctx.fillStyle = '#333333';
            ctx.font = '700 31px Inter, Arial, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(data.total.label || 'Total', cardX + 50, y + 58);

            ctx.textAlign = 'right';
            ctx.fillStyle = data.total.accent ? '#ef4444' : '#c5a059';
            ctx.font = '700 31px Inter, Arial, sans-serif';
            ctx.fillText(data.total.value || '-', cardX + cardW - 50, y + 58);
        }

        ctx.textAlign = 'center';
        ctx.fillStyle = '#6b7280';
        ctx.font = '500 21px Inter, Arial, sans-serif';
        ctx.fillText(footer, width / 2, height - 46);

        return canvas;
    }

    function canvasToBlob(canvas) {
        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('No se pudo generar la imagen del resultado.'));
                }
            }, 'image/png');
        });
    }

    function canvasToFile(canvas, filename) {
        const dataUrl = canvas.toDataURL('image/png');
        const parts = dataUrl.split(',');
        const binary = atob(parts[1]);
        const bytes = new Uint8Array(binary.length);

        for (let i = 0; i < binary.length; i += 1) {
            bytes[i] = binary.charCodeAt(i);
        }

        return new File([bytes], filename, { type: 'image/png' });
    }

    function filenameFor(id) {
        const date = new Date().toISOString().slice(0, 10);
        const slug = (results[id] && results[id].filename) || `resultado-${id}`;
        return `${slug}-${date}.png`;
    }

    async function download(id) {
        const data = results[id];
        if (!data) {
            alert('Calculá el resultado primero.');
            return;
        }

        const canvas = createCanvas(data);
        const blob = await canvasToBlob(canvas);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = filenameFor(id);
        link.click();

        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    async function share(id) {
        const data = results[id];
        if (!data) {
            alert('Calculá el resultado primero.');
            return;
        }

        const canvas = createCanvas(data);
        const file = canvasToFile(canvas, filenameFor(id));
        const text = data.shareText || data.title || 'Resultado de calculadora';

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    title: data.title || 'Resultado de calculadora',
                    text,
                    files: [file]
                });
                return;
            } catch (error) {
                if (error.name === 'AbortError') return;
                alert('No se pudo compartir la imagen. Proba descargarla y enviarla por WhatsApp.');
                return;
            }
        }

        const url = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
        alert('Tu navegador no permite compartir imagenes directamente. Descargue la imagen para que puedas adjuntarla en WhatsApp.');
    }

    function setData(id, data) {
        if (!id || !data) return;
        results[id] = data;
        if (data.target) mount(id, data.target);
    }

    window.TBResultShare = {
        setData,
        mount,
        download,
        share
    };
})();
