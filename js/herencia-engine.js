/* Sucesión intestada argentina. Reglas verificadas el 18/09/2026.
 * Fuente: CCyC, arts. 498, 2424–2440. Ver docs/simulador-herencia.md.
 * Funciones puras: los porcentajes de la herencia nunca incluyen la mitad
 * ganancial del sobreviviente. Sin red, almacenamiento ni datos personales.
 */
(function (root) {
    'use strict';
    function createState() {
        return {
            time: 'hypothetical', testament: 'unknown', special: 'unknown',
            civil: 'unknown', separation: 'unknown', partner: false,
            regime: 'unknown', assets: 'unknown', amounts: false,
            own: '', common: '', currency: 'ARS',
            children: [], parents: [], siblings: [],
            otherAscendants: 'unknown', siblingBranches: 'unknown', complete: false
        };
    }
    function branches(s) {
        return s.children.filter(c => c.status === 'alive' || (c.status === 'before' && c.grandchildren.length));
    }
    function calculate(s) {
        const issues = [];
        const add = (field, message) => issues.push({ field, message });
        if (!['hypothetical', 'current'].includes(s.time)) add('time', 'Esta versión aplica el Código vigente a fallecimientos desde el 1 de agosto de 2015. Confirmá la fecha o consultá por el régimen anterior.');
        if (s.testament !== 'no') add('testament', 'Confirmá que no hay testamento. Si existe o no lo sabés, sus disposiciones deben revisarse antes de calcular.');
        if (s.special !== 'no') add('special', 'Revisá las circunstancias especiales: pueden cambiar los herederos o la base del reparto.');
        if (!['single', 'married', 'divorced', 'widowed'].includes(s.civil)) add('civil', 'Elegí el estado civil al momento del fallecimiento.');
        const married = s.civil === 'married';
        if (married && s.separation !== 'together') add('separation', s.separation === 'separated'
            ? 'La separación de hecho sin voluntad de unirse excluye al cónyuge de la herencia (art. 2437). La liquidación patrimonial requiere revisión; esta versión no calcula ese caso.'
            : 'Confirmá si existía separación de hecho o una decisión judicial que implicara el cese de la convivencia.');
        if (married && s.partner) add('civil', 'Hay un matrimonio y otra pareja cargados. Necesitamos revisar la situación conyugal y patrimonial antes de distribuir.');
        if (!s.complete) add('complete', 'Confirmá que cargaste toda la familia indicada, considerando quiénes vivían al fallecer la persona.');
        for (const c of s.children) {
            if (!['alive', 'before'].includes(c.status)) add('children', 'Un hijo fallecido después genera otra sucesión. Si no conocés el orden de los fallecimientos, hace falta revisarlo.');
            if (c.status === 'alive' && c.grandchildren.length) add('children', 'Los nietos de una persona viva no se calculan por representación en este escenario.');
        }
        const descendants = branches(s);
        if (!descendants.length && !s.parents.length && s.otherAscendants !== 'no') add('otherAscendants', 'Antes de calcular para el cónyuge o los hermanos, hay que descartar abuelos u otros ascendientes vivos. Su cálculo está fuera de esta versión.');
        if (!descendants.length && !s.parents.length && !married) {
            if (s.siblingBranches !== 'no') add('siblingBranches', 'Los descendientes de hermanos pueden heredar por representación. Este árbol no los calcula; hay que revisar esa rama antes de repartir.');
            if (!s.siblings.length) add('siblings', 'No hay herederos calculables cargados. Pueden existir otros familiares con derecho: no se presume una herencia vacante.');
        }
        if (married && !['community', 'separate'].includes(s.regime)) add('regime', 'Elegí el régimen patrimonial del matrimonio. Si no lo conocés, no podemos presumirlo.');
        const community = married && s.regime === 'community';
        if (community && !['own', 'common', 'mixed'].includes(s.assets)) add('assets', 'Indicá si hay bienes propios, gananciales o ambos.');
        const ownActive = !community || ['own', 'mixed'].includes(s.assets);
        const commonActive = community && ['common', 'mixed'].includes(s.assets);
        const validMoney = v => String(v).trim() !== '' && Number.isFinite(Number(v)) && Number(v) >= 0 && Number(v) <= 1e14;
        if (s.amounts) {
            if (ownActive && !validMoney(s.own)) add('own', 'Ingresá un valor neto válido para los bienes del fallecido, entre 0 y 100 billones.');
            if (commonActive && !validMoney(s.common)) add('common', 'Ingresá un valor neto válido para el total ganancial de ambos cónyuges, entre 0 y 100 billones.');
        }
        if (issues.length) return { ok: false, issues };

        const people = [];
        const excluded = [];
        const notes = [];
        const put = (id, label, own, common, reason) => people.push({ id, label, own, common, reason });
        if (descendants.length) {
            const ownBranch = 1 / (descendants.length + (married ? 1 : 0));
            const commonBranch = 1 / descendants.length;
            if (married) put('spouse', 'Cónyuge', ownBranch, 0, 'En bienes propios recibe la cuota de un hijo; con descendientes no hereda la mitad ganancial del fallecido (art. 2433).');
            descendants.forEach(c => {
                const index = s.children.indexOf(c) + 1;
                if (c.status === 'alive') put(c.id, 'Hijo/a ' + index, ownBranch, commonBranch, 'Heredero por derecho propio. Los hijos tienen iguales derechos (arts. 2426 y 2430).');
                else c.grandchildren.forEach((g, i) => put(g.id, 'Nieto/a ' + index + '.' + (i + 1), ownBranch / c.grandchildren.length, commonBranch / c.grandchildren.length, 'Comparte la rama de Hijo/a ' + index + ', fallecido/a antes (arts. 2427–2429).'));
            });
            notes.push('La herencia se divide por ramas de hijos. Dentro de una rama representada, los nietos cargados reciben partes iguales.');
            s.parents.forEach(p => excluded.push({ label: p === 'mother' ? 'Madre' : 'Padre', reason: 'Hay descendientes con prioridad (art. 2431).' }));
        } else if (s.parents.length) {
            if (married) put('spouse', 'Cónyuge', 0.5, 0.5, 'Con ascendientes recibe la mitad de la herencia (art. 2434).');
            const part = (married ? 0.5 : 1) / s.parents.length;
            s.parents.forEach(p => put(p, p === 'mother' ? 'Madre' : 'Padre', part, part, 'Ascendiente de grado más próximo; reparto igualitario entre los progenitores cargados (art. 2431).'));
            notes.push('Sin descendientes, los progenitores cargados heredan. Si hay cónyuge, comparten la mitad de la herencia.');
        } else if (married) {
            put('spouse', 'Cónyuge', 1, 1, 'Sin descendientes ni ascendientes, recibe toda la herencia y excluye a los hermanos (art. 2435).');
        } else {
            const part = 1 / s.siblings.length;
            s.siblings.forEach((p, i) => put(p.id, 'Hermano/a ' + (i + 1), part, part, 'Participa del reparto igualitario entre los hermanos cargados.'));
            notes.push('Los hermanos cargados reciben partes iguales en esta simulación.');
        }
        if (descendants.length || s.parents.length || married) s.siblings.forEach((p, i) => excluded.push({ label: 'Hermano/a ' + (i + 1), reason: 'Hay descendientes, ascendientes o cónyuge con prioridad (arts. 2435 y 2438).' }));
        if (s.partner) excluded.push({ label: 'Pareja sin matrimonio', reason: 'La convivencia, registrada o no, no otorga vocación hereditaria intestada. Los bienes propios de la pareja quedan fuera de esta cuenta (art. 2424).' });
        if (s.civil === 'divorced') notes.push('El excónyuge no hereda (art. 2437). Solo se incluyen los bienes netos del fallecido después de liquidar el matrimonio anterior.');
        if (s.civil === 'widowed') notes.push('Los bienes de una sucesión anterior deben estar determinados antes de incluirlos en este patrimonio.');
        const ownValue = ownActive ? Number(s.own) : 0;
        const commonValue = commonActive ? Number(s.common) : 0;
        const estate = ownValue + commonValue / 2;
        const retained = commonValue / 2;
        const totals = s.amounts ? people.map(p => ({ ...p, inheritance: p.own * ownValue + p.common * commonValue / 2, retained: p.id === 'spouse' ? retained : 0 })) : [];
        return { ok: true, people, excluded, notes, community, ownActive, commonActive, estate, retained, totals };
    }
    // Diagram percentages share one explicit denominator per view. In the
    // community view, inheritance and liquidation add to the full net community.
    function percentage(result, id, basis) {
        if (!result.ok) return null;
        const p = result.people.find(person => person.id === id);
        const inheritance = basis === 'common' ? (p ? p.common / 2 : 0) : (p ? p.own : 0);
        const liquidation = basis === 'common' && result.community && id === 'spouse' ? 0.5 : 0;
        return { inheritance, liquidation, total: inheritance + liquidation };
    }
    const api = { createState, calculate, branches, percentage };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.TBHerencia = api;
})(typeof window !== 'undefined' ? window : this);
