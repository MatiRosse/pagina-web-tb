import base from '../data/tramites-documentos-base.mjs';
import fs from 'node:fs';

// Keep the commercial selection independent from the original tariff reference.
const availability = JSON.parse(fs.readFileSync(new URL('../data/tramites-disponibilidad.json', import.meta.url), 'utf8'));
const excluded = new Set(availability.excludedServiceIds);
const knownIds = new Set(base.services.map(service => service.id));
for (const id of [...excluded, ...availability.pendingServiceIds]) {
  if (!knownIds.has(id)) throw new Error(`Trámite desconocido en la selección: ${id}`);
}
// A blank decision preserves the existing listing until the user decides.
const services = base.services.filter(service => !excluded.has(service.id));

export const IPC_URL = 'https://api.bcra.gob.ar/estadisticas/v4.0/Monetarias/27';
export function nextMonth(month) {
  const [year, value] = month.split('-').map(Number);
  return `${year + (value === 12 ? 1 : 0)}-${String(value === 12 ? 1 : value + 1).padStart(2, '0')}`;
}
export function validateIPC(payload, now = new Date()) {
  if (![0, 200].includes(payload?.status) || !Array.isArray(payload.results)) throw new Error('Respuesta IPC inválida');
  const series = payload.results.find(row => row.idVariable === 27);
  if (!series || !Array.isArray(series.detalle) || !series.detalle.length) throw new Error('Falta la serie de inflación mensual 27');
  const currentMonth = new Intl.DateTimeFormat('sv-SE', {timeZone:'America/Argentina/Buenos_Aires',year:'numeric',month:'2-digit'}).format(now);
  const months = new Map();
  for (const row of series.detalle) {
    if (!/^\d{4}-(0[1-9]|1[0-2])-\d{2}$/.test(row.fecha) || !Number.isFinite(row.valor) || row.valor <= -100 || row.valor > 100) throw new Error('Observación IPC inválida');
    const month = row.fecha.slice(0,7);
    if (month >= currentMonth) throw new Error('El IPC contiene un período futuro o no cerrado');
    if (month < base.baseMonth) continue;
    if (months.has(month)) throw new Error(`IPC duplicado: ${month}`);
    months.set(month, {month, rate:row.valor});
  }
  const rows = [...months.values()].sort((a,b) => a.month.localeCompare(b.month));
  if (rows[0]?.month !== base.baseMonth) throw new Error('Falta el período base del IPC');
  for (let i=1;i<rows.length;i++) if (rows[i].month !== nextMonth(rows[i-1].month)) throw new Error('Hay un salto en la serie mensual del IPC');
  return rows;
}
export function priceSnapshot(ipc) {
  if (!Array.isArray(ipc) || ipc[0]?.month !== base.baseMonth) throw new Error('Base IPC inválida');
  let factor = 1;
  for (let i=0;i<ipc.length;i++) {
    if (!Number.isFinite(ipc[i].rate) || ipc[i].rate <= -100 || ipc[i].rate > 100 || (i>0 && ipc[i].month !== nextMonth(ipc[i-1].month))) throw new Error('IPC incompleto o inválido');
    if (i>0) factor *= 1 + ipc[i].rate/100;
  }
  const amount = price => Math.round(price * factor / base.rounding) * base.rounding;
  return {...base, factor, ipcMonth:ipc.at(-1).month, services:services.map(service => ({...service, options:service.options.map(o=>({...o,price:amount(o.price)})), extras:service.extras.map(e=>({...e,...(e.price===undefined?{}:{price:amount(e.price)})}))}))};
}
export async function fetchIPC(fetcher = fetch) {
  const url = `${IPC_URL}?Desde=${base.baseMonth}-01&Limit=1000`;
  let lastError;
  for (let attempt=0;attempt<3;attempt++) {
    try {
      const response = await fetcher(url, {headers:{'Accept-Language':'es-AR'},signal:AbortSignal.timeout(20000)});
      if (!response.ok) throw new Error(`BCRA HTTP ${response.status}`);
      return validateIPC(await response.json());
    } catch (error) { lastError = error; }
  }
  throw lastError;
}
