const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function trackedCanvas() {
    const filledPaths = [];
    let currentPath = [];
    const ctx = {
        fillStyle: '',
        beginPath() { currentPath = []; },
        moveTo(x, y) { currentPath.push({ x, y }); },
        lineTo(x, y) { currentPath.push({ x, y }); },
        quadraticCurveTo(cpx, cpy, x, y) {
            currentPath.push({ x: cpx, y: cpy }, { x, y });
        },
        closePath() {},
        fill() { filledPaths.push({ color: this.fillStyle, points: [...currentPath] }); },
        stroke() {},
        fillRect() {},
        drawImage() {},
        fillText() {},
        measureText(value) { return { width: String(value).length * 10 }; }
    };
    return {
        width: 0,
        height: 0,
        filledPaths,
        getContext() { return ctx; }
    };
}

test('reserva espacio entre el total estimado y el alcance del informe', async () => {
    const canvas = trackedCanvas();
    const window = {
        TB_PDF_LOGO_DATA: 'data:image/png;base64,logo',
        TBPDFCore: {
            async loadImage() { return {}; },
            buildPdf() { return { type: 'application/pdf' }; },
            downloadBlob() {},
            localDateSlug() { return '2026-09-21'; }
        }
    };
    const document = { createElement(name) { assert.equal(name, 'canvas'); return canvas; } };
    const context = vm.createContext({ window, document, Intl, Date, String, Error });
    const source = fs.readFileSync(path.resolve(__dirname, '../js/despido-pdf-report.js'), 'utf8');
    vm.runInContext(source, context);

    await window.TBDespidoPDF.download({
        entryDate: '1998-01-01',
        dismissalDate: '2026-09-21',
        salary: 20000000,
        tenureLabel: '28 años y 8 meses',
        trialMonths: 6,
        preNoticeGranted: false,
        inTrial: false,
        concepts: [
            { label: 'Indemnización por antigüedad', value: 540000000 },
            { label: 'Integración mes de despido', value: 6666667 },
            { label: 'SAC proporcional', value: 4456522 },
            { label: 'Vacaciones no gozadas', value: 20175342 },
            { label: 'Días trabajados del mes', value: 13333333 },
            { label: 'Indemnización sustitutiva de preaviso', value: 40000000 },
            { label: 'SAC sobre preaviso e integración', value: 3888889 }
        ],
        total: 628520753
    });

    const totalBox = canvas.filledPaths.find(({ color }) => color === '#f4efe5');
    const softBoxes = canvas.filledPaths.filter(({ color }) => color === '#f7f6f3');
    const disclaimerBox = softBoxes.at(-1);
    assert.ok(totalBox, 'no se dibujó el bloque de total');
    assert.ok(disclaimerBox, 'no se dibujó el bloque de alcance');

    const totalBottom = Math.max(...totalBox.points.map(({ y }) => y));
    const disclaimerTop = Math.min(...disclaimerBox.points.map(({ y }) => y));
    assert.ok(totalBottom < disclaimerTop, `los bloques se superponen: ${totalBottom} >= ${disclaimerTop}`);
    assert.equal(totalBottom, 1422);
    assert.equal(disclaimerTop, 1440);
});
