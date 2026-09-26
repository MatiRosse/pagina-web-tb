const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const source = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'calculator-official-values.js'),
    'utf8'
);

function loadCalculatorValues(fetchImplementation) {
    const storage = new Map();
    const sandbox = {
        AbortController,
        Date,
        Intl,
        clearTimeout,
        console,
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

test('actualiza el tope de aportes con el IPC de dos meses antes', async () => {
    const values = loadCalculatorValues(async () => ({
        ok: true,
        json: async () => ({
            data: [
                ['2026-09-01', 102],
                ['2026-08-01', 100]
            ]
        })
    }));

    const result = await values.getContributionCap(new Date('2026-11-15T12:00:00Z'));
    assert.equal(result.value, 4865024.12);
    assert.equal(result.effectiveMonth, '2026-11');
    assert.equal(result.source, 'official-api-ipc');
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

    const contributionCap = await values.getContributionCap(new Date('2026-10-15T12:00:00Z'));
    const artFloor = await values.getArtFloor(new Date('2026-09-15T12:00:00Z'));

    assert.equal(contributionCap.value, 4769631.49);
    assert.equal(contributionCap.source, 'official-fallback');
    assert.equal(artFloor.value, 114354110);
    assert.equal(artFloor.source, 'official-fallback');
});
