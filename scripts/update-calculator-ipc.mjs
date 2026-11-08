import { readFile, rename, writeFile } from 'node:fs/promises';

const source = 'https://www.indec.gob.ar/ftp/cuadros/economia/serie_ipc_divisiones.csv';
const publishedUrl = 'https://tbabogados.com.ar/data/calculator-ipc.json';
const snapshotPath = new URL('../data/calculator-ipc.json', import.meta.url);
const temporaryPath = new URL(`../data/.calculator-ipc-${process.pid}.tmp`, import.meta.url);
const minimumLatestMonth = '2026-09';
const currentMonth = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit'
}).format(new Date()).slice(0, 7);

function nextMonth(month) {
    const [year, number] = month.split('-').map(Number);
    return number === 12 ? `${year + 1}-01` : `${year}-${String(number + 1).padStart(2, '0')}`;
}

function validate(snapshot) {
    const months = Object.keys(snapshot?.values ?? {}).sort();
    if (snapshot?.source !== source || months[0] !== '2016-12' || months.at(-1) < minimumLatestMonth) {
        throw new Error('Falta la cobertura esperada del IPC nacional.');
    }
    for (const [index, month] of months.entries()) {
        const value = snapshot.values[month];
        if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month) || month >= currentMonth ||
            !Number.isFinite(value) || value <= 0 || (index && month !== nextMonth(months[index - 1]))) {
            throw new Error(`Observación inválida o discontinua del IPC nacional: ${month}.`);
        }
    }
    return months.at(-1);
}

function readNationalIpc(csv) {
    const [header, ...rows] = csv.trim().split(/\r?\n/);
    if (header !== 'Codigo;Descripcion;Clasificador;Periodo;Indice_IPC;v_m_IPC;v_i_a_IPC;Region') {
        throw new Error('El archivo del INDEC cambió de formato.');
    }

    const values = {};
    for (const row of rows) {
        const [code, description, , period, rawValue, , , region] = row.split(';');
        if (code !== '0' || description !== 'NIVEL GENERAL' || region !== 'Nacional') continue;
        const month = `${period.slice(0, 4)}-${period.slice(4)}`;
        if (!/^\d{6}$/.test(period) || !/^\d+(,\d+)?$/.test(rawValue) || Object.hasOwn(values, month)) {
            throw new Error(`Fila inválida o duplicada del IPC nacional: ${period}.`);
        }
        values[month] = Number(rawValue.replace(',', '.'));
    }

    return { source, values: Object.fromEntries(Object.entries(values).sort(([a], [b]) => a.localeCompare(b))) };
}

async function fetchFile(url) {
    const response = await fetch(url, { signal: AbortSignal.timeout(12000), cache: 'no-store' });
    if (!response.ok) throw new Error(`${url} respondió HTTP ${response.status}.`);
    return response;
}

const localFile = process.argv[2];
let snapshot;
try {
    snapshot = JSON.parse(await readFile(snapshotPath, 'utf8'));
} catch (error) {
    if (error.code !== 'ENOENT' || !localFile) throw error;
}
let latest = snapshot ? validate(snapshot) : '';

const [published, refreshed] = await Promise.allSettled([
    localFile ? null : fetchFile(publishedUrl).then(response => response.json()),
    localFile ? readFile(localFile, 'latin1') : fetchFile(source).then(async response => Buffer.from(await response.arrayBuffer()).toString('latin1'))
]);

try {
    if (published.status === 'rejected') throw published.reason;
    if (published.value) {
        const latestPublished = validate(published.value);
        if (latestPublished > latest) {
            snapshot = published.value;
            latest = latestPublished;
        }
    }
} catch (error) {
    console.warn(`No se pudo recuperar el IPC publicado: ${error.message}`);
}

try {
    if (refreshed.status === 'rejected') throw refreshed.reason;
    const candidate = readNationalIpc(refreshed.value);
    const latestCandidate = validate(candidate);
    if (latestCandidate < latest) throw new Error('El IPC nacional retrocedió respecto de la copia disponible.');
    snapshot = candidate;
    latest = latestCandidate;
} catch (error) {
    if (!snapshot) throw error;
    console.warn(`Se conserva el IPC nacional hasta ${latest}: ${error.message}`);
}

await writeFile(temporaryPath, `${JSON.stringify(snapshot, null, 2)}\n`);
await rename(temporaryPath, snapshotPath);
console.log(`IPC nacional del INDEC disponible hasta ${latest}.`);
