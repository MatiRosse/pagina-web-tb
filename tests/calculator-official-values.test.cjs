const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const snapshotUrl = 'https://example.com/tb/data/calculator-ipc.json';
const ipcSource = 'https://www.indec.gob.ar/ftp/cuadros/economia/serie_ipc_divisiones.csv';
const source = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'calculator-official-values.js'),
    'utf8'
);

function loadCalculatorValues(fetchImplementation, storage = new Map()) {
    const sandbox = {
        AbortController,
        Date,
        Intl,
        URL,
        clearTimeout,
        console,
        document: { currentScript: { src: 'https://example.com/tb/js/calculator-official-values.js' } },
        fetch: fetchImplementation,
        setTimeout,
        localStorage: {
            getItem: (key) => storage.get(key) || null,
            setItem: (key, value) => storage.set(key, value)
        }
    };
    sandbox.window = sandbox;
    vm.runInNewContext(source, sandbox);
    return sandbox.TBOfficialCalculatorValues;
}

test('usa los topes oficiales conocidos como respaldo', () => {
    const values = loadCalculatorValues(async () => { throw new Error('offline'); });

    assert.equal(
        values.initialContributionCap(new Date('2026-09-15T12:00:00Z')).value,
        4691748.47
    );
    assert.equal(
        values.initialContributionCap(new Date('2026-10-15T12:00:00Z')).value,
        4769631.49
    );
    assert.equal(
        values.initialArtFloor(new Date('2026-09-15T12:00:00Z')).value,
        114354110
    );
});

test('prioriza el tope de noviembre publicado por ANSES frente a una proyección en caché', async () => {
    const storage = new Map([
        ['tb-contribution-cap:2026-11', JSON.stringify({
            savedAt: Date.now(),
            value: { value: 4865024.12, source: 'official-api-ipc' }
        })]
    ]);
    let requests = 0;
    const values = loadCalculatorValues(async () => { requests += 1; }, storage);
    const date = new Date('2026-11-15T12:00:00Z');

    assert.equal(values.initialContributionCap(date).value, 4861685.38);
    const result = await values.getContributionCap(date);
    assert.equal(result.value, 4861685.38);
    assert.equal(result.effectiveMonth, '2026-11');
    assert.equal(result.source, 'official-fallback');
    assert.equal(requests, 0);
});

test('proyecta diciembre con la serie pública cuando falta el mes en la copia del INDEC', async () => {
    const storage = new Map([
        ['tb-contribution-cap:2026-12', JSON.stringify({
            savedAt: Date.now(),
            value: { value: 4962324.60, source: 'official-api-ipc' }
        })]
    ]);
    const urls = [];
    const values = loadCalculatorValues(async (url) => {
        urls.push(url);
        return {
            ok: true,
            json: async () => url === snapshotUrl
                ? { source: ipcSource, values: { '2026-09': 1800 } }
                : { data: [['2026-10-01', 102], ['2026-09-01', 100]] }
        };
    }, storage);

    const result = await values.getContributionCap(new Date('2026-12-15T12:00:00Z'));
    assert.equal(result.value, 4958919.09);
    assert.equal(result.effectiveMonth, '2026-12');
    assert.equal(result.source, 'estimated-ipc');
    assert.equal(urls[0], snapshotUrl);
    assert.match(urls[1], /apis\.datos\.gob\.ar.*148\.3_INIVELNAL_DICI_M_26/);
});

test('usa la copia del INDEC sin consultar la API si cubre todos los meses', async () => {
    const urls = [];
    const values = loadCalculatorValues(async (url) => {
        urls.push(url);
        return {
            ok: true,
            json: async () => ({ source: ipcSource, values: { '2026-09': 100, '2026-10': 103 } })
        };
    });

    const result = await values.getContributionCap(new Date('2026-12-15T12:00:00Z'));
    assert.equal(result.value, 5007535.94);
    assert.deepEqual(urls, [snapshotUrl]);
});

test('conserva la serie continua más reciente sin unir fuentes ni saltar un mes', async () => {
    const values = loadCalculatorValues(async (url) => ({
        ok: true,
        json: async () => url === snapshotUrl
            ? { source: ipcSource, values: { '2026-09': 100, '2026-10': 102, '2026-12': 106 } }
            : { data: [['2026-12-01', 1600], ['2026-11-01', 1550]] }
    }));

    const range = await values.getNationalIpc('2026-09', '2026-12');
    assert.deepEqual(Object.entries(range), [['2026-09', 100], ['2026-10', 102]]);
});

test('actualiza semestralmente el piso ART con RIPTE', async () => {
    const values = loadCalculatorValues(async () => ({
        ok: true,
        json: async () => ({
            data: [
                ['2026-12-01', 2100],
                ['2026-06-01', 2000]
            ]
        })
    }));

    const result = await values.getArtFloor(new Date('2027-03-15T12:00:00Z'));
    assert.equal(result.value, 120071816);
    assert.equal(result.periodStart, '2027-03');
    assert.equal(result.periodEnd, '2027-08');
    assert.equal(result.periodEndDay, 31);
    assert.equal(result.source, 'official-api-ripte');
});

test('mantiene el valor oficial de respaldo cuando la API falla', async () => {
    const values = loadCalculatorValues(async () => { throw new Error('offline'); });

    const contributionCap = await values.getContributionCap(new Date('2026-12-15T12:00:00Z'));
    const artFloor = await values.getArtFloor(new Date('2026-09-15T12:00:00Z'));

    assert.equal(contributionCap.value, 4861685.38);
    assert.equal(contributionCap.effectiveMonth, '2026-11');
    assert.equal(contributionCap.source, 'official-fallback');
    assert.equal(artFloor.value, 114354110);
    assert.equal(artFloor.source, 'official-fallback');
});
