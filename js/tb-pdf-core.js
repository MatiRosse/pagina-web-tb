(function () {
    function loadImage(source) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = () => reject(new Error('No se pudo cargar el logo de TB Abogados.'));
            image.src = source;
        });
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

    function downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1500);
    }

    function localDateSlug() {
        return new Intl.DateTimeFormat('en-CA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            timeZone: 'America/Argentina/Buenos_Aires'
        }).format(new Date());
    }

    window.TBPDFCore = { loadImage, buildPdf, downloadBlob, localDateSlug };
})();
