import test from 'node:test';
import assert from 'node:assert/strict';
import {fetchIPC,validateIPC,priceSnapshot,nextMonth} from '../scripts/tramites-pricing.mjs';
import base from '../data/tramites-documentos-base.mjs';
import fs from 'node:fs';

const availability=JSON.parse(fs.readFileSync(new URL('../data/tramites-disponibilidad.json',import.meta.url),'utf8'));
const available=base.services.filter(service=>!availability.excludedServiceIds.includes(service.id));

const payload = rows => ({status:200,results:[{idVariable:27,detalle:rows.map(([month,rate])=>({fecha:month+'-28',valor:rate}))}]});
const today=new Date('2026-12-07T12:00:00Z');
test('conserva exactamente todas las tarifas base sin volver a aplicar el IPC base',()=>{
  const data=priceSnapshot(validateIPC(payload([['2026-08',1.7]]),today));
  assert.equal(data.factor,1);
  assert.deepEqual(data.services,available);
  assert.equal(data.services.find(s=>s.id==='dominio-inmueble-caba').options[0].price,23000);
});
test('compone variaciones mensuales una sola vez y redondea desde la tarifa original',()=>{
  const ipc=validateIPC(payload([['2026-10',3],['2026-08',1.7],['2026-09',2]]),today);
  const first=priceSnapshot(ipc),repeat=priceSnapshot(ipc);
  assert.equal(first.services.find(s=>s.id==='dominio-inmueble-caba').options[0].price,24164);
  assert.deepEqual(first,repeat);
  assert.equal(first.services.find(s=>s.id==='inscripcion-cautelar-caba').extras[0].percent,0.1);
  assert.equal(first.services.find(s=>s.id==='testimonio-particular-caba').extras[0].price,23849);
});
test('rechaza meses faltantes, repetidos y datos de otra variable',()=>{
  assert.throws(()=>validateIPC(payload([['2026-08',1.7],['2026-10',3]]),today),/salto/);
  assert.throws(()=>validateIPC(payload([['2026-08',1.7],['2026-08',2]]),today),/duplicado/);
  assert.throws(()=>validateIPC({status:200,results:[{idVariable:28,detalle:[]}]},today),/serie/);
  assert.throws(()=>validateIPC(payload([['2026-09',2]]),today),/base/);
});
test('rechaza IPC futuro, no numérico o de un mes sin cerrar',()=>{
  for(const rate of [NaN,Infinity,'2',null,-100,101]) assert.throws(()=>validateIPC(payload([['2026-08',rate]]),today),/inválida/);
  assert.throws(()=>validateIPC(payload([['2026-08',1.7],['2026-12',2]]),today),/futuro/);
  assert.throws(()=>validateIPC({status:500,results:[]},today),/inválida/);
});
test('maneja deflación y el cambio de año sin sustituir por inflación anual',()=>{
  assert.equal(nextMonth('2026-12'),'2027-01');
  const data=priceSnapshot(validateIPC(payload([['2026-08',1.7],['2026-09',-1]]),today));
  assert.equal(data.services.find(s=>s.id==='dominio-inmueble-caba').options[0].price,22770);
});
test('la búsqueda de actas en PBA queda separada de su solicitud y las cotizaciones no se convierten en cero',()=>{
  const acta=base.services.find(s=>s.id==='nacimiento-pba');
  assert.equal(acta.options.find(o=>o.label==='Solicitar acta').price,27000);
  assert.equal(acta.options.find(o=>o.label==='Servicio de búsqueda').price,20000);
  assert.match(acta.options[1].note,/por separado/);
  assert.deepEqual(base.services.find(s=>s.id==='declaratoria-pba').options,[]);
  assert.equal(new Set(base.services.map(s=>s.id)).size,base.services.length);
  for(const s of base.services){assert.ok(base.categories[s.category]);assert.ok(base.jurisdictions[s.jurisdiction]);for(const o of s.options)assert.ok(o.price>0);}
});
test('ante caída de la API reintenta y falla sin devolver tarifas ficticias',async()=>{
  let calls=0;
  await assert.rejects(fetchIPC(async()=>{calls++;throw new Error('offline');}),/offline/);
  assert.equal(calls,3);
});
test('el HTML indexable mantiene las tres jurisdicciones y los precios del Schema coinciden con el catálogo',()=>{
  const html=fs.readFileSync(new URL('../servicios/tramites-documentos/index.html',import.meta.url),'utf8');
  const select=html.match(/<select id="tramites-jurisdiction"[^>]*>(.*?)<\/select>/s)[1];
  for(const jurisdiction of ['caba','pba','nacional']) assert.match(select,new RegExp(`<option value="${jurisdiction}">`));
  assert.equal((html.match(/<article class="doc-card"/g)||[]).length,available.length);
  const schema=JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  const data=JSON.parse(fs.readFileSync(new URL('../data/tramites-documentos.json',import.meta.url),'utf8'));
  const catalog=schema['@graph'].find(item=>item['@type']==='OfferCatalog');
  assert.equal(catalog.itemListElement.length,data.services.length);
  for(const item of catalog.itemListElement){
    const service=data.services.find(s=>item['@id'].endsWith('#'+s.id));
    assert.deepEqual((item.offers||[]).map(o=>o.price),service.options.map(o=>o.price));
    assert.ok(html.includes(`id="${service.id}"`));
  }
});

test('los trámites descartados no reaparecen en el catálogo, el JSON ni el Schema al actualizar el IPC',()=>{
  const html=fs.readFileSync(new URL('../servicios/tramites-documentos/index.html',import.meta.url),'utf8');
  const schema=JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  const catalog=schema['@graph'].find(item=>item['@type']==='OfferCatalog');
  const data=JSON.parse(fs.readFileSync(new URL('../data/tramites-documentos.json',import.meta.url),'utf8'));
  const updated=priceSnapshot(validateIPC(payload([['2026-08',1.7],['2026-09',2]]),today));
  assert.equal(availability.excludedServiceIds.length,23);
  assert.equal(available.length,57);
  assert.deepEqual(new Set(data.services.map(s=>s.id)),new Set(available.map(s=>s.id)));
  for (const id of availability.excludedServiceIds) {
    assert.ok(!html.includes(`id="${id}"`),id);
    assert.ok(!catalog.itemListElement.some(item=>item['@id'].endsWith('#'+id)),id);
    assert.ok(!updated.services.some(service=>service.id===id),id);
  }
  for (const id of availability.pendingServiceIds) assert.ok(data.services.some(service=>service.id===id),id);
});
