(function () {
    'use strict';
    const E = window.TBHerencia;
    const app = document.getElementById('inheritance-app');
    if (!app || !E) return;
    let sequence = 0;
    let state;
    let basis = 'common';
    let result;
    let drawFrame;
    let zoom = 1;
    let zoomBeforeResult = 1;
    let hasSimulated = false;
    let mobileStep = 'testament';
    let mobileHistory = [];
    let mobileBlock = null;
    const id = () => 'person-' + (++sequence);
    const $ = name => document.getElementById(name);
    const isMobile = () => Boolean(window.matchMedia && window.matchMedia('(max-width: 780px)').matches);
    const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]);
    const pct = value => new Intl.NumberFormat('es-AR', { maximumFractionDigits:2 }).format(value * 100) + ' %';
    const avatar = '<span class="h-avatar" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8" r="3.5"/><path d="M5 21v-3a7 7 0 0 1 14 0v3"/></svg></span>';
    const child = () => ({ id:id(), status:'alive', grandchildren:[] });
    function simplifiedState() {
        const s = E.createState();
        Object.assign(s, { time:'hypothetical', special:'no', complete:true, separation:'together' });
        return s;
    }
    function mobileInitialState() {
        const s = simplifiedState();
        Object.assign(s, { testament:'unknown', special:'no', civil:'unknown', separation:'together', complete:false, mobileWarnings:{} });
        return s;
    }
    function setMobileWarning(key, message) {
        if (!state.mobileWarnings) state.mobileWarnings = {};
        if (message) state.mobileWarnings[key] = 'Supuesto por respuesta incierta: ' + message;
        else delete state.mobileWarnings[key];
    }
    function example(type) {
        const s = simplifiedState();
        Object.assign(s, { testament:'no', civil:'single', otherAscendants:'no', siblingBranches:'no' });
        if (type === 'married') Object.assign(s, { civil:'married', separation:'together', regime:'community', assets:'common', children:[child(), child()] });
        if (type === 'partner') Object.assign(s, { partner:true, children:[child(), child()] });
        if (type === 'parents') Object.assign(s, { civil:'married', separation:'together', regime:'community', assets:'own', parents:['mother', 'father'] });
        if (type === 'grandchildren') {
            const c = child(); c.status = 'before'; c.grandchildren = [{ id:id() }, { id:id() }];
            s.children = [child(), c];
        }
        if (type === 'siblings') s.siblings = [{ id:id() }, { id:id() }];
        return s;
    }
    const option = (value, text, selected) => '<option value="' + value + '"' + (value === selected ? ' selected' : '') + '>' + text + '</option>';
    const remove = (action, key, label) => '<button type="button" class="h-remove" data-action="' + action + '" data-id="' + key + '" aria-label="Quitar ' + escape(label) + '">×</button>';
    const add = (action, label, disabled) => '<button type="button" class="h-add" id="' + action + '" data-action="' + action + '"' + (disabled ? ' disabled' : '') + '>+ ' + label + '</button>';
    function share(key, premortem) {
        if (!hasSimulated) return '<div class="h-share h-share-idle"><strong>?</strong><small>Se calcula al simular</small></div>';
        if (!result.ok) return '<div class="h-share h-share-pending"><strong>—</strong><small>Completá el panel</small></div>';
        if (premortem) return '<div class="h-share h-share-excluded"><strong>0 %</strong><small>Su rama continúa abajo</small></div>';
        const allocation = E.percentage(result, key, basis);
        const category = basis === 'common' ? 'del total ganancial' : (result.community ? 'de los bienes propios' : 'de la herencia');
        let html = '<div class="h-share' + (allocation.total ? '' : ' h-share-excluded') + '" data-share="' + allocation.total + '"><strong>' + pct(allocation.total) + '</strong><small>' + (allocation.total ? category : 'No hereda en este caso') + '</small>';
        if (basis === 'common' && key === 'spouse') html += '<div class="h-share-breakdown"><span>' + pct(allocation.inheritance) + ' por herencia</span><span>' + pct(allocation.liquidation) + ' por liquidación</span></div>';
        return html + '</div>';
    }
    function card(key, name, content, removeButton, premortem) {
        return '<article class="h-person" data-node="' + key + '" aria-label="' + escape(name) + '">' + avatar + '<h3 class="h-person-name">' + escape(name) + '</h3>' + (removeButton || '') + share(key, premortem) + (content || '') + '</article>';
    }
    function mobileChoices(items) {
        return '<div class="h-mobile-choices">' + items.map(item => '<button type="button" class="h-mobile-choice" data-mobile-answer="' + escape(item.value) + '"><strong>' + escape(item.label) + '</strong>' + (item.note ? '<small>' + escape(item.note) + '</small>' : '') + '</button>').join('') + '</div>';
    }
    function mobileQuestion(kicker, title, intro, body) {
        return '<div class="h-mobile-question"><p class="h-mobile-kicker">' + escape(kicker) + '</p><h3 tabindex="-1">' + escape(title) + '</h3>' + (intro ? '<p class="h-mobile-question-intro">' + escape(intro) + '</p>' : '') + body + '</div>';
    }
    function mobileNumberQuestion(kicker, title, intro, label, min, value, kind) {
        return mobileQuestion(kicker, title, intro, '<div class="h-mobile-number-wrap"><label for="mobile-number-input">' + escape(label) + '</label><div class="h-mobile-number-row"><input class="h-mobile-number" id="mobile-number-input" type="number" inputmode="numeric" min="' + min + '" max="20" step="1" value="' + value + '"><button type="button" class="h-mobile-next" data-mobile-number="' + kind + '">Continuar</button></div></div>');
    }
    function renderMobileWizard() {
        const content = $('mobile-wizard-content');
        const bar = $('mobile-progress-bar');
        if (!content || !bar) return;
        const progress = mobileStep === 'result' || mobileStep === 'issues' ? 100 : Math.min(94, 10 + mobileHistory.length * 8);
        bar.style.width = progress + '%';
        bar.parentElement.setAttribute('aria-valuenow', progress);
        const back = app.querySelector('[data-mobile-action="back"]');
        back.hidden = !mobileHistory.length || mobileStep === 'result';
        const questionNumber = 'Pregunta ' + (mobileHistory.length + 1);
        if (mobileStep === 'testament') content.innerHTML = mobileQuestion(questionNumber, '¿Hay testamento?', 'Este simulador calcula sucesiones sin testamento.', mobileChoices([
            { value:'no', label:'No, no hay testamento' },
            { value:'yes', label:'Sí, hay testamento', note:'El reparto puede cambiar y requiere revisión.' },
            { value:'unknown', label:'No lo sé' }
        ]));
        else if (mobileStep === 'civil') content.innerHTML = mobileQuestion(questionNumber, '¿Cuál era el estado civil de la persona fallecida?', 'Elegí la situación existente al momento del fallecimiento.', mobileChoices([
            { value:'married', label:'Casada/o legalmente' },
            { value:'partner', label:'En pareja o unión convivencial', note:'Sin matrimonio vigente entre ambos.' },
            { value:'single', label:'Soltera/o' },
            { value:'divorced', label:'Divorciada/o legalmente' },
            { value:'widowed', label:'Viuda/o' }
        ]));
        else if (mobileStep === 'regime') content.innerHTML = mobileQuestion(questionNumber, '¿Qué régimen patrimonial tenía el matrimonio?', '', mobileChoices([
            { value:'community', label:'Comunidad de ganancias' },
            { value:'separate', label:'Separación de bienes' },
            { value:'unknown', label:'No lo sé' }
        ]));
        else if (mobileStep === 'assets') content.innerHTML = mobileQuestion(questionNumber, '¿Qué tipo de bienes hay?', 'La diferencia modifica la participación del cónyuge.', mobileChoices([
            { value:'own', label:'Sólo bienes propios', note:'Por ejemplo, adquiridos antes del matrimonio o recibidos por herencia.' },
            { value:'common', label:'Sólo bienes gananciales', note:'Adquiridos durante la comunidad de ganancias.' },
            { value:'mixed', label:'Hay bienes propios y gananciales' },
            { value:'unknown', label:'No lo sé' }
        ]));
        else if (mobileStep === 'descendants') content.innerHTML = mobileQuestion(questionNumber, '¿La persona fallecida tuvo hijos?', 'Respondé que sí aunque algún hijo haya fallecido antes. Después podrás indicar si dejó nietos que ocupen su lugar.', mobileChoices([
            { value:'yes', label:'Sí, tuvo uno o más hijos' },
            { value:'no', label:'No tuvo hijos' }
        ]));
        else if (mobileStep === 'children-count') content.innerHTML = mobileNumberQuestion(questionNumber, '¿Cuántos hijos o ramas de hijos dejó?', 'Cada hijo forma una rama. Si falleció antes y dejó descendientes, sigue contando como una rama.', 'Cantidad de ramas', 1, Math.max(1, state.children.length || 1), 'children');
        else if (mobileStep.startsWith('branch-')) {
            const index = Number(mobileStep.split('-')[1]);
            content.innerHTML = mobileQuestion('Hijo/a n.º ' + (index + 1) + ' de ' + state.children.length, '¿El hijo/a n.º ' + (index + 1) + ' vivía cuando falleció la persona?', '', mobileChoices([
                { value:'alive', label:'Sí, vivía' },
                { value:'before', label:'No, había fallecido antes', note:'Después preguntaremos si dejó hijos.' },
                { value:'after', label:'Falleció después' },
                { value:'unknown', label:'No conozco el orden de los fallecimientos' }
            ]));
        } else if (mobileStep.startsWith('grandchildren-')) {
            const index = Number(mobileStep.split('-')[1]);
            const branch = state.children[index];
            content.innerHTML = mobileNumberQuestion('Hijo/a n.º ' + (index + 1) + ' de ' + state.children.length, '¿Cuántos hijos dejó el hijo/a n.º ' + (index + 1) + '?', 'Indicá los nietos que vivían al abrirse esta sucesión y ocupan el lugar de ese hijo/a.', 'Cantidad de nietos/as de este hijo/a', 0, branch.grandchildren.length, 'grandchildren-' + index);
        } else if (mobileStep === 'parents') content.innerHTML = mobileQuestion(questionNumber, '¿Vivía alguno de sus padres?', 'Sólo importa si no hay descendientes con derecho a heredar.', mobileChoices([
            { value:'both', label:'Sí, vivían ambos' },
            { value:'mother', label:'Sólo vivía la madre' },
            { value:'father', label:'Sólo vivía el padre' },
            { value:'none', label:'Ninguno de los dos' }
        ]));
        else if (mobileStep === 'ascendants') content.innerHTML = mobileQuestion(questionNumber, '¿Vivía algún abuelo, bisabuelo u otro ascendiente?', 'Los ascendientes más próximos pueden desplazar a los hermanos.', mobileChoices([
            { value:'no', label:'No, ninguno' },
            { value:'yes', label:'Sí, vivía alguno' },
            { value:'unknown', label:'No lo sé' }
        ]));
        else if (mobileStep === 'siblings-count') content.innerHTML = mobileNumberQuestion(questionNumber, '¿Cuántos hermanos vivían?', 'Contá hermanos o medio hermanos vivos al momento del fallecimiento.', 'Cantidad de hermanos/as vivos', 0, state.siblings.length, 'siblings');
        else if (mobileStep === 'sibling-branches') content.innerHTML = mobileQuestion(questionNumber, '¿Algún hermano fallecido antes dejó hijos?', 'Los sobrinos pueden representar a ese hermano y este simulador no distribuye esa rama automáticamente.', mobileChoices([
            { value:'no', label:'No' },
            { value:'yes', label:'Sí' },
            { value:'unknown', label:'No lo sé' }
        ]));
        else if (mobileStep === 'blocked') content.innerHTML = mobileQuestion('REQUIERE REVISIÓN', mobileBlock ? mobileBlock.title : 'Este caso necesita revisión profesional', '', '<div class="h-mobile-alert"><strong>No es seguro calcular porcentajes automáticamente.</strong>' + escape(mobileBlock ? mobileBlock.message : 'Hay datos que pueden modificar quién hereda o la base del reparto.') + '</div>');
        else if (mobileStep === 'issues') content.innerHTML = mobileQuestion('NO SE PUDO COMPLETAR', 'Necesitamos revisar algunos datos', 'El motor no devuelve porcentajes si una respuesta puede cambiar el resultado.', '<ul class="h-mobile-issue-list">' + result.issues.map(issue => '<li>' + escape(issue.message) + '</li>').join('') + '</ul>');
        else content.innerHTML = '';
    }
    function rememberMobileStep() {
        mobileHistory.push({ step:mobileStep, state:JSON.parse(JSON.stringify(state)), block:mobileBlock });
    }
    function showMobileStep(next, mutate) {
        rememberMobileStep();
        if (mutate) mutate();
        mobileStep = next;
        mobileBlock = null;
        hasSimulated = false;
        refresh();
        window.requestAnimationFrame(() => {
            const heading = $('mobile-wizard-content').querySelector('h3');
            if (heading) heading.focus({ preventScroll:true });
        });
    }
    function blockMobile(title, message, mutate) {
        rememberMobileStep();
        if (mutate) mutate();
        mobileBlock = { title, message };
        mobileStep = 'blocked';
        hasSimulated = false;
        refresh();
    }
    function finishMobile() {
        state.complete = true;
        result = E.calculate(state);
        mobileStep = result.ok ? 'result' : 'issues';
        hasSimulated = true;
        refresh();
        const heading = result.ok ? $('simulation-result-title') : $('mobile-wizard-content').querySelector('h3');
        if (heading) heading.focus({ preventScroll:true });
    }
    function afterMobileBranch(index) {
        if (index + 1 < state.children.length) {
            mobileStep = 'branch-' + (index + 1);
            refresh();
            return;
        }
        if (E.branches(state).length) finishMobile();
        else {
            mobileStep = 'parents';
            refresh();
        }
    }
    function answerMobile(value) {
        if (mobileStep === 'testament') {
            if (value === 'no') showMobileStep('civil', () => { state.testament = 'no'; setMobileWarning('testament', ''); });
            else if (value === 'unknown') showMobileStep('civil', () => { state.testament = 'no'; setMobileWarning('testament', 'se calcula como si no hubiera testamento; si aparece uno, el reparto puede cambiar.'); });
            else blockMobile('Hay que revisar el testamento', 'Sus cláusulas y las porciones legítimas pueden cambiar el reparto.', () => { state.testament = value; });
        } else if (mobileStep === 'civil') {
            showMobileStep(value === 'married' ? 'regime' : 'descendants', () => {
                state.civil = value === 'partner' ? 'single' : value;
                state.partner = value === 'partner';
                state.separation = 'together';
                state.regime = 'unknown';
                state.assets = 'unknown';
                setMobileWarning('separation', value === 'married' ? 'se calcula suponiendo que el matrimonio seguía unido y no existía separación de hecho.' : '');
            });
        } else if (mobileStep === 'regime') {
            if (value === 'community') showMobileStep('assets', () => { state.regime = value; setMobileWarning('regime', ''); });
            else if (value === 'separate') showMobileStep('descendants', () => { state.regime = value; setMobileWarning('regime', ''); });
            else showMobileStep('assets', () => { state.regime = 'community'; setMobileWarning('regime', 'se usa comunidad de ganancias como escenario orientativo.'); });
        } else if (mobileStep === 'assets') {
            if (value !== 'unknown') showMobileStep('descendants', () => { state.assets = value; setMobileWarning('assets', ''); });
            else showMobileStep('descendants', () => { state.assets = 'mixed'; setMobileWarning('assets', 'el informe separa los porcentajes de bienes propios y del total ganancial para poder comparar ambos escenarios.'); });
        } else if (mobileStep === 'descendants') {
            if (value === 'yes') showMobileStep('children-count');
            else showMobileStep('parents', () => { state.children = []; });
        } else if (mobileStep.startsWith('branch-')) {
            const index = Number(mobileStep.split('-')[1]);
            rememberMobileStep();
            state.children[index].status = value === 'unknown' ? 'alive' : value;
            state.children[index].grandchildren = [];
            if (value === 'before') {
                mobileStep = 'grandchildren-' + index;
                refresh();
            } else if (value === 'alive' || value === 'unknown') {
                setMobileWarning('child-' + index, value === 'unknown' ? 'el hijo/a n.º ' + (index + 1) + ' se considera vivo al abrirse la sucesión; el resultado cambia si falleció antes o después.' : '');
                afterMobileBranch(index);
            }
            else {
                mobileBlock = { title:'Hay una sucesión posterior que debe revisarse', message:'Si el hijo/a falleció después, primero heredó su parte y luego esa porción pasó a integrar otra sucesión.' };
                mobileStep = 'blocked';
                refresh();
            }
        } else if (mobileStep === 'parents') {
            if (value !== 'none') {
                showMobileStep('result', () => { state.parents = value === 'both' ? ['mother','father'] : [value]; });
                finishMobile();
            } else showMobileStep('ascendants', () => { state.parents = []; });
        } else if (mobileStep === 'ascendants') {
            if (value === 'no' || value === 'unknown') {
                rememberMobileStep();
                state.otherAscendants = 'no';
                setMobileWarning('ascendants', value === 'unknown' ? 'se calcula suponiendo que no vivían otros ascendientes.' : '');
                if (state.civil === 'married') finishMobile();
                else { mobileStep = 'siblings-count'; refresh(); }
            } else blockMobile('Puede haber ascendientes con prioridad', 'Los abuelos u otros ascendientes vivos deben analizarse antes de calcular la participación del cónyuge o de los hermanos.', () => { state.otherAscendants = value; });
        } else if (mobileStep === 'sibling-branches') {
            if (value === 'no' || value === 'unknown') {
                rememberMobileStep();
                state.siblingBranches = 'no';
                setMobileWarning('siblingBranches', value === 'unknown' ? 'se calcula suponiendo que ningún hermano fallecido dejó hijos que lo representen.' : '');
                finishMobile();
            } else blockMobile('Puede existir representación entre colaterales', 'Los hijos de un hermano fallecido pueden ocupar su lugar y esa rama requiere un cálculo más detallado.', () => { state.siblingBranches = value; });
        }
    }
    function readMobileNumber(kind) {
        const input = $('mobile-number-input');
        const value = Number(input.value);
        if (!Number.isInteger(value) || value < Number(input.min) || value > Number(input.max)) {
            input.setCustomValidity('Ingresá un número entero entre ' + input.min + ' y ' + input.max + '.');
            input.reportValidity();
            input.focus();
            return;
        }
        input.setCustomValidity('');
        rememberMobileStep();
        if (kind === 'children') {
            state.children = Array.from({ length:value }, () => child());
            mobileStep = 'branch-0';
            refresh();
        } else if (kind.startsWith('grandchildren-')) {
            const index = Number(kind.split('-')[1]);
            state.children[index].grandchildren = Array.from({ length:value }, () => ({ id:id() }));
            afterMobileBranch(index);
        } else if (kind === 'siblings') {
            state.siblings = Array.from({ length:value }, () => ({ id:id() }));
            mobileStep = 'sibling-branches';
            refresh();
        }
    }
    function backMobile() {
        const previous = mobileHistory.pop();
        if (!previous) return;
        state = previous.state;
        mobileStep = previous.step;
        mobileBlock = previous.block;
        hasSimulated = false;
        refresh();
    }
    function resetMobile() {
        state = mobileInitialState();
        mobileStep = 'testament';
        mobileHistory = [];
        mobileBlock = null;
        hasSimulated = false;
        refresh();
    }
    function renderTree() {
        const parents = state.parents.map(p => card(p, p === 'mother' ? 'Madre' : 'Padre', '<small>Vivía al abrirse la sucesión</small>', remove('remove-parent', p, p === 'mother' ? 'madre' : 'padre'))).join('');
        let partners = '';
        if (state.civil === 'married') partners += card('spouse', 'Cónyuge', '<small>Matrimonio legal</small>', remove('remove-spouse', '', 'cónyuge; revisar estado civil'));
        if (state.partner) partners += card('partner', 'Pareja conviviente', '<small>Sin matrimonio entre ambos</small>', remove('remove-partner', '', 'pareja conviviente'));
        const children = state.children.map((c, i) => {
            const name = 'Hijo/a ' + (i + 1);
            const control = '<label for="status-' + c.id + '">Al abrirse la sucesión</label><select id="status-' + c.id + '" data-child="' + c.id + '">' + option('alive', 'Vivía', c.status) + option('before', 'Había fallecido antes', c.status) + option('after', 'Falleció después', c.status) + option('unknown', 'No sé el orden', c.status) + '</select>';
            let grandchildren = '';
            if (c.status === 'before') grandchildren = '<div class="h-grandchildren">' + c.grandchildren.map((g, j) => card(g.id, 'Nieto/a ' + (i + 1) + '.' + (j + 1), '<small>Representa esta rama · vivía al abrirse la sucesión</small>', remove('remove-grandchild', g.id, 'nieto/a ' + (i + 1) + '.' + (j + 1)))).join('') + '</div><button type="button" class="h-add" id="add-grandchild-' + c.id + '" data-action="add-grandchild" data-id="' + c.id + '">+ Nieto/a de esta rama</button>';
            return '<div class="h-branch">' + card(c.id, name, control, remove('remove-child', c.id, name + ' y su rama'), c.status === 'before') + grandchildren + '</div>';
        }).join('');
        const siblings = state.siblings.map((p, i) => card(p.id, 'Hermano/a ' + (i + 1), '', remove('remove-sibling', p.id, 'hermano/a ' + (i + 1)))).join('');
        $('family-tree').innerHTML = '<svg id="family-connections" class="h-connections" aria-hidden="true"></svg>' +
            '<section class="h-parents" aria-label="Padres"><p class="h-zone-label">Padres</p><div class="h-parent-cards">' + parents + '</div></section>' +
            '<section class="h-siblings" aria-label="Hermanos"><p class="h-zone-label">Hermanos/as</p><div class="h-side-cards">' + siblings + '</div></section>' +
            '<div class="h-center">' +
                '<div class="h-near-add h-near-add-parents">' + add('add-mother', 'Madre', state.parents.includes('mother')) + add('add-father', 'Padre', state.parents.includes('father')) + '</div>' +
                '<div class="h-near-add h-near-add-partners">' + add('add-spouse', 'Cónyuge', state.civil === 'married' || state.partner) + add('add-partner', 'Pareja', state.civil === 'married' || state.partner) + '</div>' +
                '<article class="h-person h-person-main" data-node="deceased">' + avatar + '<h3 class="h-person-name">Persona fallecida</h3><strong class="h-base-percent">' + (hasSimulated && result.ok ? '100 %' : hasSimulated ? '—' : '?') + '</strong><small>' + (hasSimulated && result.ok ? (basis === 'common' ? 'Base: total ganancial' : 'Base: bienes del fallecido') : hasSimulated ? 'Faltan datos para simular' : 'Armá el árbol y simulá') + '</small><label class="h-civil-field" for="quick-civil"><span>Estado civil</span><select class="h-civil-select" id="quick-civil">' + option('unknown', 'Elegí una opción', state.civil) + option('single', 'Soltera/o', state.civil) + option('married', 'Casada/o legalmente', state.civil) + option('divorced', 'Divorciada/o', state.civil) + option('widowed', 'Viuda/o', state.civil) + '</select></label></article>' +
                '<div class="h-near-add h-near-add-siblings">' + add('add-sibling', 'Hermano/a') + '</div>' +
                '<div class="h-near-add h-near-add-children">' + add('add-child', 'Hijo/a') + '</div>' +
            '</div>' +
            '<section class="h-partners" aria-label="Pareja"><p class="h-zone-label">Cónyuge / pareja</p><div class="h-side-cards">' + partners + '</div></section>' +
            '<section class="h-children" aria-label="Hijos"><p class="h-zone-label h-children-label">Hijos/as</p><div class="h-children-row">' + children + '</div><p class="h-help">Cada nieto/a se agrega debajo de su progenitor. No se presupone un vínculo con la pareja actual.</p></section>';
        scheduleConnections();
    }
    // All endpoints are actual person cards, never action buttons. Siblings use
    // a lateral kinship edge without asking the user to classify the bond.
    function drawConnections() {
        const tree = $('family-tree');
        const svg = $('family-connections');
        if (!svg) return;
        const origin = tree.getBoundingClientRect();
        const renderedScale = Number(tree.offsetWidth) ? origin.width / Number(tree.offsetWidth) : zoom;
        const scale = renderedScale > 0 ? renderedScale : zoom;
        const nodes = new Map(Array.from(tree.querySelectorAll('[data-node]')).map(el => {
            const box = el.getBoundingClientRect();
            return [el.dataset.node, { x:(box.left - origin.left) / scale, y:(box.top - origin.top) / scale, w:box.width / scale, h:box.height / scale }];
        }));
        const paths = [];
        function connect(from, to, relation, direction, route) {
            const a = nodes.get(from), b = nodes.get(to);
            if (!a || !b) return;
            let d;
            if (direction === 'down') {
                const ax = a.x + a.w / 2, ay = a.y + a.h, bx = b.x + b.w / 2, by = b.y;
                const y = route === undefined ? (ay + by) / 2 : route;
                d = 'M ' + ax + ' ' + ay + ' V ' + y + ' H ' + bx + ' V ' + by;
            } else {
                const left = a.x <= b.x ? a : b, right = a.x <= b.x ? b : a;
                const ax = left.x + left.w, ay = left.y + left.h / 2, bx = right.x, by = right.y + right.h / 2;
                const x = (ax + bx) / 2;
                d = 'M ' + ax + ' ' + ay + ' H ' + x + ' V ' + by + ' H ' + bx;
            }
            paths.push('<path class="h-edge h-edge-' + relation + '" data-from="' + from + '" data-to="' + to + '" data-relation="' + relation + '" d="' + d + '"/>');
        }
        const center = nodes.get('deceased');
        state.parents.forEach(p => connect(p, 'deceased', 'filiation', 'down', center ? center.y - 4 : undefined));
        state.siblings.forEach(p => connect(p.id, 'deceased', 'sibling', 'right'));
        if (state.civil === 'married') connect('deceased', 'spouse', 'couple', 'right');
        if (state.partner) connect('deceased', 'partner', 'couple', 'right');
        const firstChild = state.children.length ? nodes.get(state.children[0].id) : null;
        state.children.forEach(c => {
            connect('deceased', c.id, 'filiation', 'down', firstChild ? firstChild.y - 12 : undefined);
            const firstGrandchild = c.grandchildren.length ? nodes.get(c.grandchildren[0].id) : null;
            c.grandchildren.forEach(g => connect(c.id, g.id, 'filiation', 'down', firstGrandchild ? firstGrandchild.y - 25 : undefined));
        });
        svg.setAttribute('width', tree.offsetWidth);
        svg.setAttribute('height', tree.offsetHeight);
        svg.innerHTML = paths.join('');
    }
    function scheduleConnections() {
        if (drawFrame) window.cancelAnimationFrame(drawFrame);
        drawFrame = window.requestAnimationFrame(() => { drawFrame = null; sizeStage(); drawConnections(); });
    }
    function sizeStage() {
        const viewport = $('diagram-viewport');
        const stage = $('diagram-stage');
        const tree = $('family-tree');
        const viewportWidth = Number(viewport.clientWidth) || 0;
        const mobile = window.matchMedia && window.matchMedia('(max-width: 780px)').matches;
        tree.style.minWidth = Math.max(mobile ? 0 : 800, viewportWidth / zoom) + 'px';
        tree.style.transform = 'scale(' + zoom + ')';
        const treeWidth = Math.max(Number(tree.offsetWidth) || 0, Number(tree.scrollWidth) || 0, mobile ? 0 : 800);
        const treeHeight = Math.max(Number(tree.offsetHeight) || 0, Number(tree.scrollHeight) || 0, mobile ? 0 : 600);
        const treeTop = Number(tree.offsetTop) || 0;
        const horizontalGutter = mobile ? 24 : 320;
        const stageWidth = mobile
            ? Math.max(viewportWidth, treeWidth * zoom + horizontalGutter)
            : Math.max(viewportWidth * 1.4, treeWidth * zoom + horizontalGutter);
        stage.style.width = stageWidth + 'px';
        stage.style.height = Math.max(Number(viewport.clientHeight) || 0, treeTop + treeHeight * zoom + (mobile ? 12 : 0)) + 'px';
        tree.style.left = (mobile ? 12 / zoom : Math.max(40, (stageWidth - treeWidth * zoom) / (2 * zoom))) + 'px';
        $('diagram-zoom').textContent = Math.round(zoom * 100) + ' %';
    }
    function positionTree(behavior) {
        const viewport = $('diagram-viewport');
        const deceased = $('family-tree').querySelector('[data-node="deceased"]');
        if (!deceased) return;
        const box = deceased.getBoundingClientRect();
        const frame = viewport.getBoundingClientRect();
        viewport.scrollTo({
            left:Math.max(0, (Number(viewport.scrollLeft) || 0) + box.left - frame.left + box.width / 2 - frame.width / 2),
            top:Math.max(0, (Number(viewport.scrollTop) || 0) + box.top - frame.top - 90),
            behavior:behavior === 'instant' ? 'auto' : (behavior || 'smooth')
        });
    }
    function treeContentBounds() {
        const tree = $('family-tree');
        const origin = tree.getBoundingClientRect();
        const renderedScale = Number(tree.offsetWidth) ? origin.width / Number(tree.offsetWidth) : zoom;
        const scale = renderedScale > 0 ? renderedScale : zoom;
        const boxes = Array.from(tree.querySelectorAll('.h-person, .h-near-add, .h-zone-label')).map(el => {
            const box = el.getBoundingClientRect();
            if (!box.width || !box.height) return null;
            return {
                left:(box.left - origin.left) / scale,
                top:(box.top - origin.top) / scale,
                right:(box.right - origin.left) / scale,
                bottom:(box.bottom - origin.top) / scale
            };
        }).filter(Boolean);
        if (!boxes.length) return { left:0, top:0, right:Number(tree.offsetWidth) || 800, bottom:Number(tree.offsetHeight) || 600 };
        return {
            left:Math.min(...boxes.map(box => box.left)),
            top:Math.min(...boxes.map(box => box.top)),
            right:Math.max(...boxes.map(box => box.right)),
            bottom:Math.max(...boxes.map(box => box.bottom))
        };
    }
    function positionTreeContent(behavior) {
        const viewport = $('diagram-viewport');
        const tree = $('family-tree');
        const bounds = treeContentBounds();
        const safeTop = 106;
        const safeBottom = 24;
        const centerX = (Number(tree.offsetLeft) || 0) + (bounds.left + bounds.right) * zoom / 2;
        const centerY = (Number(tree.offsetTop) || 0) + (bounds.top + bounds.bottom) * zoom / 2;
        const safeCenterY = safeTop + Math.max(0, (Number(viewport.clientHeight) || 0) - safeTop - safeBottom) / 2;
        viewport.scrollTo({
            left:Math.max(0, centerX - (Number(viewport.clientWidth) || 0) / 2),
            top:Math.max(0, centerY - safeCenterY),
            behavior:behavior === 'instant' ? 'auto' : (behavior || 'smooth')
        });
    }
    function positionActiveTree(behavior) {
        if (app.querySelector('.h-builder').classList.contains('h-builder-result')) positionTreeContent(behavior);
        else positionTree(behavior);
    }
    function changeZoom(delta) {
        const viewport = $('diagram-viewport');
        const previous = zoom;
        const centerX = ((Number(viewport.scrollLeft) || 0) + (Number(viewport.clientWidth) || 0) / 2) / previous;
        const centerY = ((Number(viewport.scrollTop) || 0) + (Number(viewport.clientHeight) || 0) / 2) / previous;
        zoom = Math.max(0.5, Math.min(1.3, Math.round((zoom + delta) * 10) / 10));
        sizeStage();
        drawConnections();
        viewport.scrollTo({
            left:centerX * zoom - (Number(viewport.clientWidth) || 0) / 2,
            top:centerY * zoom - (Number(viewport.clientHeight) || 0) / 2,
            behavior:'smooth'
        });
    }
    function setZoom(value, centerFamily) {
        zoom = Math.max(0.5, Math.min(1.3, Math.floor(value * 100) / 100));
        sizeStage();
        drawConnections();
        if (centerFamily) positionTreeContent('instant');
        else positionTree('instant');
    }
    function fitTreeToViewport() {
        if (!window.matchMedia || !window.matchMedia('(min-width: 901px)').matches) return;
        const viewport = $('diagram-viewport');
        const builder = app.querySelector('.h-builder');
        const bounds = treeContentBounds();
        const contentWidth = Math.max(1, bounds.right - bounds.left);
        const contentHeight = Math.max(1, bounds.bottom - bounds.top);
        const targetWidth = builder.classList.contains('h-builder-result') ? (Number(builder.clientWidth) || 0) / 2 : (Number(viewport.clientWidth) || 0);
        const widthRatio = (targetWidth - 56) / contentWidth;
        const heightRatio = ((Number(viewport.clientHeight) || 0) - 130) / contentHeight;
        const target = Math.max(0.5, Math.min(1, widthRatio, heightRatio));
        setZoom(target, true);
    }
    function pan(direction) {
        const distance = 150;
        const moves = { up:[0,-distance], down:[0,distance], left:[-distance,0], right:[distance,0] };
        const move = moves[direction];
        $('diagram-viewport').scrollBy({ left:move[0], top:move[1], behavior:'smooth' });
    }
    function syncFields() {
        app.querySelectorAll('[data-state]').forEach(el => {
            const value = state[el.dataset.state];
            if (el.type === 'checkbox') el.checked = value;
            else el.value = value;
        });
        const married = state.civil === 'married';
        const community = married && state.regime === 'community';
        const noCloserFamily = !E.branches(state).length && !state.parents.length;
        $('side-regime-field').hidden = !married;
        $('side-assets-field').hidden = !community;
        $('side-ascendants-field').hidden = !noCloserFamily;
        $('side-sibling-branches-field').hidden = !noCloserFamily || married;
    }
    function renderResult() {
        const r = result;
        const common = state.civil === 'married' && state.regime === 'community';
        const resultSection = $('simulation-result');
        const questions = $('simulation-questions');
        const questionErrors = $('question-errors');
        const downloadButton = app.querySelector('.h-download');
        app.querySelector('.h-builder').classList.toggle('h-builder-result', Boolean(hasSimulated && r.ok));
        if (!common || state.assets === 'own') basis = 'own';
        if (common && state.assets === 'common') basis = 'common';
        if (!hasSimulated) {
            resultSection.hidden = true;
            questions.hidden = false;
            questionErrors.hidden = true;
            questionErrors.innerHTML = '';
            downloadButton.hidden = true;
            $('basis-controls').innerHTML = '';
            $('basis-description').textContent = '';
            $('result-content').innerHTML = '';
            $('canvas-status').classList.remove('h-status-pending');
            $('canvas-status').hidden = true;
            $('canvas-status').textContent = '';
            $('result-announcement').textContent = '';
            return;
        }
        if (!r.ok) {
            const issues = r.issues.map(issue => '<li><button type="button" class="h-issue-link" data-field="' + issue.field + '">' + escape(issue.message) + '</button></li>').join('');
            resultSection.hidden = true;
            questions.hidden = false;
            questionErrors.hidden = false;
            questionErrors.innerHTML = '<ul class="h-issues">' + issues + '</ul>';
            downloadButton.hidden = true;
            $('basis-controls').innerHTML = '';
            $('basis-description').textContent = '';
            $('result-content').innerHTML = '';
            $('canvas-status').hidden = false;
            $('canvas-status').textContent = 'Faltan datos para completar la simulación.';
            $('canvas-status').classList.add('h-status-pending');
            $('result-announcement').textContent = 'Simulación pendiente. ' + r.issues.length + ' datos por revisar.';
            return;
        }
        resultSection.hidden = false;
        questions.hidden = true;
        questionErrors.hidden = true;
        questionErrors.innerHTML = '';
        const basisButton = (value, label) => '<button type="button" data-basis="' + value + '" class="h-chip" id="basis-' + value + '" aria-pressed="' + (basis === value) + '">' + label + '</button>';
        $('basis-controls').innerHTML = common && state.assets === 'mixed' ? basisButton('own', 'Bienes propios') + basisButton('common', 'Total ganancial') : '<span class="h-basis-label">' + (basis === 'common' ? 'Total ganancial' : common ? 'Bienes propios' : 'Herencia') + '</span>';
        $('basis-description').textContent = basis === 'common' ? '100 % = total ganancial neto de ambos cónyuges.' : '100 % = ' + (common ? 'bienes propios netos del fallecido.' : 'herencia neta del fallecido.');
        downloadButton.hidden = false;
        $('canvas-status').classList.remove('h-status-pending');
        $('canvas-status').hidden = true;
        $('canvas-status').textContent = '';
        const baseName = basis === 'common' ? 'Total ganancial' : common ? 'Bienes propios' : 'Herencia';
        const shares = r.people.map(p => '<li><span>' + escape(p.label) + '</span><strong>' + pct(E.percentage(r, p.id, basis).total) + '</strong></li>').join('') + r.excluded.map(p => '<li><span>' + escape(p.label) + '</span><strong>0 %</strong></li>').join('');
        const shareClass = r.people.length + r.excluded.length > 3 ? ' h-result-shares-grid' : '';
        let html = '<div class="h-result-highlight"><p class="h-eyebrow">Resultado orientativo</p><h3>' + baseName + '</h3><p>Distribución porcentual según los datos cargados</p></div><div class="h-result-body"><ul class="h-result-shares' + shareClass + '">' + shares + '</ul></div>';
        if (r.notes.length) html += '<details><summary>Ver criterio aplicado</summary>' + r.notes.map(note => '<p>' + escape(note) + '</p>').join('') + '</details>';
        $('result-content').innerHTML = html;
        $('result-announcement').textContent = 'Porcentajes actualizados. ' + r.people.map(p => p.label + ': ' + pct(E.percentage(r, p.id, basis).total)).join('; ');
        if (window.TBResultShare && window.TBHerenciaPDF) {
            const rows = r.people.map(p => ({ label:p.label, value:pct(E.percentage(r, p.id, basis).total), reason:p.reason }))
                .concat(r.excluded.map(p => ({ label:p.label, value:'0 %', reason:p.reason })));
            const civilLabels = { single:'Soltera/o', married:'Casada/o', divorced:'Divorciada/o', widowed:'Viuda/o' };
            const regimeLabels = { community:'Comunidad de ganancias', separate:'Separación de bienes' };
            const assetLabels = { own:'Bienes propios', common:'Bienes gananciales', mixed:'Propios y gananciales' };
            const report = {
                baseName,
                basisDescription:$('basis-description').textContent,
                rows,
                notes:r.notes.slice(),
                family:{
                    partner:state.civil === 'married' ? 'Cónyuge' : state.partner ? 'Pareja conviviente' : '',
                    parents:state.parents.map(parent => parent === 'mother' ? 'Madre' : 'Padre'),
                    children:state.children.map((person, index) => ({
                        label:'Hijo/a n.º ' + (index + 1),
                        status:person.status,
                        grandchildren:person.grandchildren.length
                    })),
                    siblings:state.siblings.length
                },
                scenario:[
                    { label:'Estado civil', value:civilLabels[state.civil] || 'Sin definir' },
                    { label:'Régimen matrimonial', value:state.civil === 'married' ? (regimeLabels[state.regime] || 'Sin definir') : 'No corresponde' },
                    { label:'Tipo de bienes', value:common ? (assetLabels[state.assets] || 'Sin definir') : 'Patrimonio del fallecido' },
                    { label:'Familia cargada', value:state.children.length + ' hijo/a(s) · ' + state.parents.length + ' progenitor(es) · ' + state.siblings.length + ' hermano/a(s)' }
                ]
            };
            window.TBResultShare.setData('herencia', {
                target:'#result-content .h-result-highlight',
                filename:'resultado-sucesion',
                downloadFormat:'pdf',
                downloadHandler:() => window.TBHerenciaPDF.download(report),
                title:'Distribución sucesoria estimada',
                amount:'100 %',
                subtitle:baseName,
                breakdownTitle:'DISTRIBUCIÓN ESTIMADA',
                rows:rows.map(row => ({ label:row.label, value:row.value })),
                shareText:'Simulación sucesoria orientativa realizada con TB Abogados.'
            });
        }
    }
    function refresh(focusId) {
        syncFields();
        result = E.calculate(state);
        if (result.ok && state.mobileWarnings) result.notes = Object.values(state.mobileWarnings).filter(Boolean).concat(result.notes);
        renderResult(); renderTree(); renderMobileWizard();
        if (focusId && $(focusId)) $(focusId).focus({ preventScroll:true });
    }
    function customized() {
        $('example-picker').value = 'custom';
    }
    app.addEventListener('change', event => {
        const el = event.target;
        if (el.dataset.exampleSelect !== undefined) {
            if (el.value === 'custom') return;
            state = example(el.value);
            hasSimulated = false;
            refresh();
            setZoom(state.parents.length || state.siblings.length ? 0.9 : 1);
            window.requestAnimationFrame(() => positionTree('instant'));
            return;
        }
        if (el.id === 'quick-civil') {
            if (state.civil !== el.value) {
                state.separation = el.value === 'married' ? 'together' : 'unknown';
                state.regime = 'unknown';
                state.assets = 'unknown';
            }
            state.civil = el.value;
            if (el.value === 'married') state.partner = false;
            customized();
            hasSimulated = false;
            refresh();
            if (el.value === 'married') window.requestAnimationFrame(() => positionTree('instant'));
            return;
        }
        if (el.dataset.state) state[el.dataset.state] = el.type === 'checkbox' ? el.checked : el.value;
        else if (el.dataset.child) {
            const c = state.children.find(c => c.id === el.dataset.child);
            c.status = el.value;
            if (c.status !== 'before') c.grandchildren = [];
        } else return;
        hasSimulated = false; customized(); refresh(el.id);
    });
    app.addEventListener('click', event => {
        const button = event.target.closest('button');
        if (!button) return;
        if (button.dataset.mobileAnswer !== undefined) { answerMobile(button.dataset.mobileAnswer); return; }
        if (button.dataset.mobileNumber !== undefined) { readMobileNumber(button.dataset.mobileNumber); return; }
        if (button.dataset.mobileAction === 'back') { backMobile(); return; }
        if (button.dataset.mobileAction === 'reset') { resetMobile(); return; }
        if (button.dataset.field) {
            if (button.dataset.field === 'civil') $('quick-civil').focus();
            else if (['children','siblings'].includes(button.dataset.field)) $('diagram-viewport').focus();
            else {
                const sideField = { regime:'side-regime', assets:'side-assets', testament:'side-testament', otherAscendants:'side-ascendants', siblingBranches:'side-sibling-branches' }[button.dataset.field];
                if (sideField && $(sideField)) $(sideField).focus();
            }
            return;
        }
        if (button.dataset.basis) { basis = button.dataset.basis; refresh('basis-' + basis); return; }
        const action = button.dataset.action, key = button.dataset.id;
        if (!action) return;
        if (action === 'edit-simulation') {
            if (isMobile()) { backMobile(); return; }
            hasSimulated = false;
            refresh();
            setZoom(zoomBeforeResult);
            const firstField = Array.from(app.querySelectorAll('.h-questions select')).find(field => !field.closest('[hidden]'));
            if (firstField && firstField.focus) firstField.focus({ preventScroll:true });
            return;
        }
        if (action === 'simulate') {
            zoomBeforeResult = zoom;
            hasSimulated = true;
            refresh();
            if (result.ok) {
                window.requestAnimationFrame(fitTreeToViewport);
                const heading = $('simulation-result-title');
                if (heading && heading.focus) heading.focus({ preventScroll:true });
            } else {
                const firstIssue = $('question-errors').querySelector('.h-issue-link');
                if (firstIssue && firstIssue.focus) firstIssue.focus({ preventScroll:true });
            }
            return;
        }
        if (action === 'zoom-in' || action === 'zoom-out') { changeZoom(action === 'zoom-in' ? 0.1 : -0.1); return; }
        if (action === 'pan-center') { positionTree(); return; }
        if (action && action.startsWith('pan-')) { pan(action.slice(4)); return; }
        let focusId = button.id;
        let alignFromLeft = false;
        let compactFamily = false;
        if (action === 'reset') { state = simplifiedState(); hasSimulated = false; refresh(); customized(); setZoom(1); $('quick-civil').focus(); return; }
        if (action === 'add-spouse') { state.civil = 'married'; state.partner = false; state.separation = 'together'; state.regime = 'unknown'; state.assets = 'unknown'; focusId = 'side-regime'; alignFromLeft = true; }
        if (action === 'remove-spouse') { state.civil = 'unknown'; focusId = 'quick-civil'; }
        if (action === 'add-partner') { state.partner = true; alignFromLeft = true; }
        if (action === 'remove-partner') { state.partner = false; focusId = 'add-partner'; }
        if (action === 'add-mother' && !state.parents.includes('mother')) { state.parents.push('mother'); compactFamily = true; }
        if (action === 'add-father' && !state.parents.includes('father')) { state.parents.push('father'); compactFamily = true; }
        if (action === 'remove-parent') { state.parents = state.parents.filter(p => p !== key); focusId = key === 'mother' ? 'add-mother' : 'add-father'; }
        if (action === 'add-child') { const c = child(); state.children.push(c); focusId = 'status-' + c.id; }
        if (action === 'remove-child') { state.children = state.children.filter(c => c.id !== key); focusId = 'add-child'; }
        if (action === 'add-grandchild') state.children.find(c => c.id === key).grandchildren.push({ id:id() });
        if (action === 'remove-grandchild') { const parent = state.children.find(c => c.grandchildren.some(g => g.id === key)); parent.grandchildren = parent.grandchildren.filter(g => g.id !== key); focusId = 'add-grandchild-' + parent.id; }
        if (action === 'add-sibling') { state.siblings.push({ id:id() }); focusId = 'add-sibling'; compactFamily = true; }
        if (action === 'remove-sibling') { state.siblings = state.siblings.filter(p => p.id !== key); focusId = 'add-sibling'; }
        if (action === 'compare') { state.assets = state.assets === 'own' ? 'common' : 'own'; }
        hasSimulated = false; customized(); refresh(focusId);
        if (compactFamily && zoom > 0.9) setZoom(0.9);
        if (alignFromLeft) window.requestAnimationFrame(() => positionTree('instant'));
    });
    $('family-tree').addEventListener('transitionend', event => {
        if (event.propertyName !== 'transform') return;
        drawConnections();
        positionActiveTree('instant');
    });
    app.querySelector('.h-builder').addEventListener('transitionend', event => {
        if (event.propertyName !== 'grid-template-columns') return;
        scheduleConnections();
        window.requestAnimationFrame(() => positionActiveTree('instant'));
    });
    $('diagram-viewport').addEventListener('keydown', event => {
        const direction = { ArrowUp:'up', ArrowDown:'down', ArrowLeft:'left', ArrowRight:'right' }[event.key];
        if (!direction) return;
        event.preventDefault();
        pan(direction);
    });
    window.addEventListener('resize', () => { scheduleConnections(); positionActiveTree('instant'); });
    if (window.ResizeObserver) new window.ResizeObserver(scheduleConnections).observe($('family-tree'));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(scheduleConnections);
    state = isMobile() ? mobileInitialState() : example('married');
    refresh();
    window.requestAnimationFrame(() => { scheduleConnections(); positionTree('instant'); });
})();
