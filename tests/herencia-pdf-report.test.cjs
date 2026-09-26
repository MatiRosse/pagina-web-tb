const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function canvas() {
    const events = [];
    const ctx = {
        beginPath() {}, moveTo(x, y) { events.push(['moveTo', x, y]); }, lineTo(x, y) { events.push(['lineTo', x, y]); }, quadraticCurveTo() {}, closePath() {},
        fill() {}, stroke() {}, fillRect(x, y, width, height) { events.push(['fillRect', x, y, width, height]); }, drawImage() {}, fillText(value) { events.push(['text', String(value)]); },
        measureText(value) { return { width:String(value).length * 10 }; }
    };
    return { width:0, height:0, events, getContext() { return ctx; } };
}

test('genera un PDF paginado con nombre de informe sucesorio', async () => {
    const downloads = [];
    const window = {
        TB_PDF_LOGO_DATA:'data:image/png;base64,logo',
        TBPDFCore:{
            async loadImage() { return {}; },
            buildPdf(canvases) {
                assert.equal(canvases.length, 2);
                assert.ok(canvases.every(item => item.width === 1240 && item.height === 1754));
                const labels = canvases[0].events.filter(event => event[0] === 'text').map(event => event[1]);
                assert.ok(labels.includes('MAPA FAMILIAR DEL CASO'));
                assert.ok(labels.includes('PARTICIPACIÓN GRÁFICA'));
                assert.ok(labels.includes('Persona fallecida'));
                return { type:'application/pdf' };
            },
            downloadBlob(blob, filename) { downloads.push({ blob, filename }); },
            localDateSlug() { return '2026-09-20'; }
        }
    };
    const document = { createElement(name) { assert.equal(name, 'canvas'); return canvas(); } };
    const context = vm.createContext({ window, document, Intl, Date, String, Error });
    const source = fs.readFileSync(path.resolve(__dirname, '../js/herencia-pdf-report.js'), 'utf8');
    vm.runInContext(source, context);
    await window.TBHerenciaPDF.download({
        baseName:'Herencia',
        basisDescription:'100 % = herencia neta.',
        family:{
            partner:'Cónyuge',
            parents:['Madre','Padre'],
            children:[{ label:'Hijo/a n.º 1', status:'alive', grandchildren:0 }],
            siblings:2
        },
        scenario:[
            { label:'Estado civil', value:'Soltera/o' },
            { label:'Régimen matrimonial', value:'No corresponde' },
            { label:'Tipo de bienes', value:'Patrimonio del fallecido' },
            { label:'Familia cargada', value:'11 hijo/a(s)' }
        ],
        rows:Array.from({ length:11 }, (_, index) => ({ label:'Hijo/a ' + (index + 1), value:'9,09 %' }))
    });
    assert.deepEqual(downloads, [{
        blob:{ type:'application/pdf' },
        filename:'informe-simulacion-sucesion-2026-09-20.pdf'
    }]);
});

test('no genera un informe sin resultado', async () => {
    const window = { TBPDFCore:{}, TB_PDF_LOGO_DATA:'data:image/png;base64,logo' };
    const context = vm.createContext({ window, document:{}, Intl, Date, String, Error });
    const source = fs.readFileSync(path.resolve(__dirname, '../js/herencia-pdf-report.js'), 'utf8');
    vm.runInContext(source, context);
    await assert.rejects(() => window.TBHerenciaPDF.download({ rows:[] }), /Simulá la sucesión/);
});
