const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { parseHTML } = require(process.env.TB_HERENCIA_DOM_MODULE || 'linkedom');
const root = require('node:path').resolve(__dirname, '..') + '/';
const { window, document } = parseHTML(fs.readFileSync(root + 'servicios/calculadoras/simulador-herencia/index.html', 'utf8'));
const styles = fs.readFileSync(root + 'css/herencia.css', 'utf8');
const uiSource = fs.readFileSync(root + 'js/herencia-ui.js', 'utf8');

const descriptor = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value');
Object.defineProperty(window.HTMLSelectElement.prototype, 'value', { get:descriptor.get, set(value) {
    for (const option of this.options) option.removeAttribute('selected');
    const match = Array.from(this.options).find(option => option.value === String(value));
    if (match) match.setAttribute('selected', '');
}, configurable:true });

const frames = new Map();
let frameId = 0;
window.requestAnimationFrame = fn => { frames.set(++frameId, fn); return frameId; };
window.cancelAnimationFrame = key => frames.delete(key);
const flush = () => { for (const [key, fn] of frames) { frames.delete(key); fn(); } };
const viewport = document.getElementById('diagram-viewport');
const movements = [];
viewport.scrollTo = move => movements.push({ type:'to', ...move });
viewport.scrollBy = move => movements.push({ type:'by', ...move });

const context = vm.createContext({ window, document, Intl, console });
for (const script of ['js/herencia-engine.js', 'js/herencia-ui.js']) vm.runInContext(fs.readFileSync(root + script, 'utf8'), context);
flush();

const result = () => document.getElementById('result-content').textContent;
const node = key => document.querySelector('[data-node="' + key + '"]');
const share = key => node(key).querySelector('.h-share').textContent;
const click = selector => {
    const element = document.querySelector(selector);
    assert.ok(element, selector);
    element.dispatchEvent(new window.Event('click', { bubbles:true }));
    flush();
};
const change = (key, value) => {
    const element = document.querySelector('[data-state="' + key + '"]');
    assert.ok(element, key);
    element.value = value;
    element.dispatchEvent(new window.Event('change', { bubbles:true }));
    flush();
};
const example = value => {
    const element = document.getElementById('example-picker');
    element.value = value;
    element.dispatchEvent(new window.Event('change', { bubbles:true }));
    flush();
};
const simulate = () => click('[data-action="simulate"]');
const edge = (from, to, relation) => document.querySelector('path[data-from="' + from + '"][data-to="' + to + '"][data-relation="' + relation + '"]');

assert.equal(document.querySelectorAll('input[type=number], [data-state=amounts], [data-state=currency]').length, 0);
assert.match(document.querySelector('.h-hero').textContent, /Simulador de Sucesión/);
assert.match(document.querySelector('.h-benefits').textContent, /Informe descargable/);
assert.ok(document.querySelector('.h-builder #diagram-workspace'));
assert.ok(document.querySelector('.h-builder .h-questions [data-state="testament"]'));
assert.ok(document.querySelector('.h-builder [data-action="simulate"]'));
assert.ok(document.querySelector('.h-builder .h-side-panel .h-results'));
assert.doesNotMatch(document.body.textContent, /Solo preguntamos lo necesario|Revisá el árbol y los datos/);
assert.ok(document.querySelector('script[src*="herencia-pdf-report.js"]'));
assert.match(styles, /\.h-wrap\s*\{[^}]*1120px/);
assert.match(styles, /\.h-builder\s*\{[^}]*grid-template-columns:minmax\(0,7fr\) minmax\(300px,3fr\)/);
assert.match(styles, /\.h-builder\.h-builder-result\s*\{[^}]*grid-template-columns:minmax\(0,1fr\) minmax\(0,1fr\)/);
assert.match(styles, /\.h-builder\s*\{[^}]*transition:grid-template-columns/);
assert.match(styles, /\.h-fields\s*\{[^}]*auto-fit/);
assert.match(uiSource, /box\.width \/ 2 - frame\.width \/ 2/);
assert.match(uiSource, /function fitTreeToViewport/);
assert.match(uiSource, /function treeContentBounds/);
assert.match(uiSource, /setZoom\(target, true\)/);
assert.match(uiSource, /origin\.width \/ Number\(tree\.offsetWidth\)/);
assert.match(uiSource, /propertyName !== 'transform'/);
assert.equal(document.getElementById('simulation-result').hidden, true);
assert.equal(document.getElementById('simulation-questions').hidden, false);
assert.equal(document.querySelector('.h-builder').classList.contains('h-builder-result'), false);
assert.match(share('spouse'), /Se calcula al simular/);

simulate();
assert.equal(document.getElementById('simulation-result').hidden, false);
assert.equal(document.getElementById('simulation-questions').hidden, true);
assert.equal(document.querySelector('.h-builder').classList.contains('h-builder-result'), true);
assert.match(result(), /Cónyuge.*50 %/);
assert.match(share('spouse'), /50 %/);
assert.equal(document.querySelector('.h-download').hidden, false);

change('testament', 'yes');
assert.equal(document.getElementById('simulation-result').hidden, true);
assert.equal(document.querySelector('.h-builder').classList.contains('h-builder-result'), false);
assert.match(share('spouse'), /Se calcula al simular/);
simulate();
assert.equal(document.getElementById('simulation-result').hidden, true);
assert.equal(document.getElementById('simulation-questions').hidden, false);
assert.match(document.getElementById('question-errors').textContent, /testamento/);
assert.equal(document.querySelector('.h-download').hidden, true);
change('testament', 'no');
simulate();
assert.equal(document.getElementById('simulation-result').hidden, false);
click('[data-action="edit-simulation"]');
assert.equal(document.getElementById('simulation-result').hidden, true);
assert.equal(document.getElementById('simulation-questions').hidden, false);
assert.equal(document.querySelector('.h-builder').classList.contains('h-builder-result'), false);

for (const type of ['partner', 'parents', 'grandchildren', 'siblings', 'married']) {
    example(type);
    assert.equal(document.getElementById('simulation-result').hidden, true);
    simulate();
    const sum = Array.from(document.querySelectorAll('[data-share]')).reduce((total, element) => total + Number(element.dataset.share), 0);
    assert.ok(Math.abs(sum - 1) < 1e-9, type);
}

example('siblings');
assert.equal(document.querySelectorAll('.h-siblings select, .h-siblings [data-sibling]').length, 0);
simulate();
const siblings = Array.from(document.querySelectorAll('.h-siblings [data-node]')).map(element => element.dataset.node);
assert.equal(siblings.length, 2);
for (const key of siblings) assert.ok(edge(key, 'deceased', 'sibling'));

example('grandchildren');
simulate();
const descendants = document.querySelectorAll('.h-grandchildren [data-node]');
assert.equal(descendants.length, 2);
const parentId = descendants[0].closest('.h-branch').querySelector('[data-child]').dataset.child;
for (const grandchild of descendants) assert.ok(edge(parentId, grandchild.dataset.node, 'filiation'));

click('[data-action="zoom-out"]');
assert.equal(document.getElementById('diagram-zoom').textContent, '90 %');
click('[data-action="zoom-in"]');
assert.equal(document.getElementById('diagram-zoom').textContent, '100 %');
for (const direction of ['up', 'down', 'left', 'right']) click('[data-action="pan-' + direction + '"]');
click('[data-action="pan-center"]');
assert.equal(movements.filter(move => move.type === 'by').length, 4);
assert.ok(movements.some(move => move.type === 'to'));

example('married');
for (let index = 0; index < 12; index += 1) click('[data-action="add-child"]');
assert.equal(document.querySelectorAll('[data-child]').length, 14);
assert.equal(document.querySelectorAll('path[data-relation=filiation]').length, 14);
simulate();
assert.ok(document.querySelector('.h-result-shares-grid'));
assert.doesNotMatch(result(), /porcentajes están redondeados/i);
const ids = Array.from(document.querySelectorAll('[id]')).map(element => element.id);
assert.equal(new Set(ids).size, ids.length);

console.log('OK: layout 70/30 para preguntas y 50/50 para resultado, panel alternado, autozoom, descarga PDF, relaciones y 14 hijos.');
