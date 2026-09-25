const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createState, calculate } = require('../js/herencia-engine.js');
const child = (id, grandchildren) => ({ id, status:grandchildren ? 'before' : 'alive', grandchildren:(grandchildren || []).map(id => ({ id })) });
const sibling = id => ({ id });
const base = changes => ({ ...createState(), civil:'single', testament:'no', special:'no', complete:true, otherAscendants:'no', siblingBranches:'no', ...changes });
const married = changes => base({ civil:'married', separation:'together', regime:'community', assets:'mixed', ...changes });
function good(s) { const r = calculate(s); assert.equal(r.ok, true, JSON.stringify(r.issues)); return r; }
function blocked(s, field) { const r = calculate(s); assert.equal(r.ok, false); assert.ok(r.issues.some(i => i.field === field), JSON.stringify(r)); assert.equal(r.people, undefined); }
function near(a, b) { assert.ok(Math.abs(a - b) < 1e-8, a + ' != ' + b); }
const person = (r, id) => r.people.find(p => p.id === id);

test('dos hijos heredan por mitades; excluyen padres y hermanos', () => {
    const r = good(base({ children:[child('a'), child('b')], parents:['mother'], siblings:[sibling('s')] }));
    near(person(r,'a').own, .5); near(person(r,'b').own,.5); assert.equal(r.excluded.length,2);
});
test('cónyuge y dos hijos: tercios propios; ganancial hereditario solo para hijos', () => {
    const r = good(married({ children:[child('a'),child('b')] }));
    near(person(r,'spouse').own,1/3); near(person(r,'spouse').common,0); near(person(r,'a').common,.5);
});
test('120 millones gananciales: cónyuge 60 por liquidación e hijos 30 cada uno', () => {
    const r = good(married({ assets:'common', amounts:true, common:120000000, own:999, children:[child('a'),child('b')] }));
    near(r.estate,60000000); near(r.retained,60000000);
    assert.deepEqual(r.totals.map(p => [p.inheritance,p.retained]),[[0,60000000],[30000000,0],[30000000,0]]);
});
test('120 millones propios: cónyuge y dos hijos 40 cada uno', () => {
    const r = good(married({ assets:'own', amounts:true, own:120000000, common:999, children:[child('a'),child('b')] }));
    assert.deepEqual(r.totals.map(p=>p.inheritance),[40000000,40000000,40000000]); near(r.retained,0);
});
test('mixtos: propios 90 y comunidad 120, cónyuge hereda 30 y retiene 60; hijos 60 cada uno', () => {
    const r=good(married({ amounts:true, own:90000000, common:120000000, children:[child('a'),child('b')] }));
    assert.deepEqual(r.totals.map(p=>[p.inheritance,p.retained]),[[30000000,60000000],[60000000,0],[60000000,0]]);
});
test('cónyuge y dos progenitores: herencia 1/2, 1/4, 1/4', () => {
    const r=good(married({ parents:['mother','father'] }));
    near(person(r,'spouse').own,.5); near(person(r,'mother').common,.25); near(person(r,'father').own,.25);
});
test('120 gananciales con cónyuge y padres: cónyuge 60+30, padres 15 cada uno', () => {
    const r=good(married({ assets:'common', amounts:true, common:120000000, parents:['mother','father'] }));
    assert.deepEqual(r.totals.map(p=>[p.inheritance,p.retained]),[[30000000,60000000],[15000000,0],[15000000,0]]);
});
test('un progenitor y cónyuge: mitad de herencia para cada uno', () => {
    const r=good(married({ parents:['mother'] })); near(person(r,'mother').own,.5);
});
test('padres solos por mitades; un progenitor solo recibe todo', () => {
    near(person(good(base({parents:['mother','father']})),'mother').own,.5);
    near(person(good(base({parents:['father']})),'father').own,1);
});
test('cónyuge sin ascendientes ni descendientes desplaza hermanos', () => {
    const r=good(married({siblings:[sibling('s')]})); near(person(r,'spouse').common,1); assert.equal(r.excluded.length,1);
});
test('nietos representan su rama: hijo 1/2, dos nietos 1/4 cada uno', () => {
    const r=good(base({children:[child('a'),child('b',['g1','g2'])]}));
    near(person(r,'a').own,.5); near(person(r,'g1').own,.25); near(person(r,'g2').own,.25);
});
test('solo nietos: ramas de distinto tamaño no se reparten por cabeza', () => {
    const r=good(base({children:[child('a',['g1']),child('b',['g2','g3','g4'])]}));
    near(person(r,'g1').own,.5); near(person(r,'g2').own,1/6);
});
test('cónyuge y nietos: cuota de un hijo, no cuota de un nieto', () => {
    const r=good(married({children:[child('a'),child('b',['g1','g2'])]}));
    near(person(r,'spouse').own,1/3); near(person(r,'g1').own,1/6); near(person(r,'g1').common,.25);
});
test('hijo premuerto sin descendientes no crea una cuota vacía', () => {
    const r=good(base({children:[child('a'),child('b',[])]})); near(person(r,'a').own,1);
});
test('conviviente con hijos no hereda, aunque se haya incorporado al árbol', () => {
    const r=good(base({partner:true,children:[child('a')]})); near(person(r,'a').own,1); assert.equal(r.excluded[0].label,'Pareja sin matrimonio');
});
test('divorciado con pareja: solo hijos; patrimonio neto previamente liquidado', () => {
    const r=good(base({civil:'divorced',partner:true,children:[child('a')],amounts:true,own:100,common:999})); near(r.estate,100); near(r.retained,0); assert.equal(r.people.length,1);
});
test('separación de bienes: no se deduce mitad conyugal', () => {
    const r=good(married({regime:'separate',amounts:true,own:120,common:999,children:[child('a')]})); near(r.estate,120); near(r.retained,0); near(r.totals[0].inheritance,60);
});
test('tres hermanos se reparten por partes iguales sin clasificar el vínculo', () => {
    const r=good(base({siblings:[sibling('a'),sibling('b'),sibling('c')]}));
    near(person(r,'a').own,1/3); near(person(r,'b').own,1/3); near(person(r,'c').own,1/3);
});
test('dos hermanos sin datos adicionales reciben mitades', () => {
    const r=good(base({siblings:[sibling('a'),sibling('b')]})); near(person(r,'a').own,.5); near(person(r,'b').own,.5);
});
test('testamento, circunstancias especiales y dudas no producen porcentajes', () => {
    for(const field of ['testament','special']) for(const value of ['yes','unknown']) blocked(base({children:[child('a')],[field]:value}),field);
});
test('fecha anterior o desconocida, estado civil desconocido y familia incompleta', () => {
    for(const time of ['before','unknown']) blocked(base({children:[child('a')],time}),'time');
    blocked(base({children:[child('a')],civil:'unknown'}),'civil'); blocked(base({children:[child('a')],complete:false}),'complete');
});
test('abuelos posibles bloquean incluso con cónyuge o hermanos', () => {
    for(const otherAscendants of ['yes','unknown']) {
        blocked(married({otherAscendants}),'otherAscendants');
        blocked(base({siblings:[sibling('a')],otherAscendants}),'otherAscendants');
    }
});
test('sobrinos posibles bloquean el reparto entre hermanos', () => {
    for(const siblingBranches of ['yes','unknown']) blocked(base({siblings:[sibling('a')],siblingBranches}),'siblingBranches');
});
test('familia fuera de alcance nunca se declara vacante', () => {
    blocked(base(),'siblings'); blocked(base({partner:true}),'siblings');
});
test('separación conyugal o situación ambigua requieren revisión', () => {
    for(const separation of ['separated','unknown']) blocked(married({children:[child('a')],separation}),'separation');
    blocked(married({partner:true,children:[child('a')]}),'civil');
});
test('orden de fallecimientos, régimen y naturaleza desconocidos', () => {
    for(const status of ['after','unknown']) blocked(base({children:[{...child('a'),status}]}),'children');
    blocked(married({regime:'unknown',children:[child('a')]}),'regime');
    blocked(married({assets:'unknown',children:[child('a')]}),'assets');
});
test('montos inválidos se rechazan; ceros se aceptan y valores ocultos se ignoran', () => {
    for(const own of ['',-1,'NaN','abc',Infinity,1e15]) blocked(base({amounts:true,own,children:[child('a')]}),'own');
    near(good(base({amounts:true,own:0,children:[child('a')]})).estate,0);
    good(married({assets:'own',amounts:true,own:100,common:'invalid',children:[child('a')]}));
});
test('controles irrelevantes no bloquean cuando hay familiares con prioridad', () => {
    good(base({children:[child('a')],otherAscendants:'unknown',siblingBranches:'unknown',siblings:[sibling('s')]}));
});
test('matriz de familias: cuotas suman 100% y se conserva todo el patrimonio', () => {
    for(let children=0;children<=5;children++) for(let parents=0;parents<=2;parents++) for(const isMarried of [false,true]) for(const regime of ['community','separate']) {
        const s=(isMarried?married:base)({regime,amounts:true,own:9132.48,common:45678.32,children:Array.from({length:children},(_,i)=>child('c'+i,i%2?['g'+i+'a','g'+i+'b']:undefined)),parents:['mother','father'].slice(0,parents),siblings:[sibling('s1'),sibling('s2')]});
        const r=good(s); near(r.people.reduce((v,p)=>v+p.own,0),1); near(r.people.reduce((v,p)=>v+p.common,0),1);
        near(r.totals.reduce((v,p)=>v+p.inheritance,0),r.estate);
        near(r.totals.reduce((v,p)=>v+p.inheritance+p.retained,0),9132.48+(isMarried&&regime==='community'?45678.32:0));
    }
});

const { percentage } = require('../js/herencia-engine.js');
test('diagrama ganancial: base única 100%, cónyuge 50% liquidación y dos hijos 25% cada uno', () => {
    const r=good(married({assets:'common',children:[child('a'),child('b')]}));
    assert.deepEqual(percentage(r,'spouse','common'),{inheritance:0,liquidation:.5,total:.5});
    assert.deepEqual(percentage(r,'a','common'),{inheritance:.25,liquidation:0,total:.25});
    near(percentage(r,'b','common').total,.25);
});
test('diagrama ganancial con padres: cónyuge 75%, padres 12,5% cada uno, sin mezclar bases', () => {
    const r=good(married({parents:['mother','father']}));
    assert.deepEqual(percentage(r,'spouse','common'),{inheritance:.25,liquidation:.5,total:.75});
    near(percentage(r,'mother','common').total,.125);near(percentage(r,'father','common').total,.125);
    near(percentage(r,'spouse','own').total,.5);
});
test('diagrama: excluidos 0%, incertidumbre sin porcentajes y nietos sobre la base correcta', () => {
    const r=good(married({children:[child('a'),child('b',['g1','g2'])],parents:['mother']}));
    near(percentage(r,'mother','common').total,0);near(percentage(r,'b','common').total,0);
    near(percentage(r,'g1','common').total,.125);near(percentage(r,'g1','own').total,1/6);
    assert.equal(percentage(calculate(createState()),'spouse','common'),null);
});
test('diagrama: ambas vistas del patrimonio mixto suman 100% por separado', () => {
    for(let n=0;n<5;n++) for(let parents=0;parents<3;parents++) {
        const r=good(married({children:Array.from({length:n},(_,i)=>child('c'+i)),parents:['mother','father'].slice(0,parents)}));
        for(const basis of ['own','common']) near(r.people.reduce((sum,p)=>sum+percentage(r,p.id,basis).total,0),1);
    }
});
