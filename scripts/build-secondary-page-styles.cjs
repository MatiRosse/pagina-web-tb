// Run after changing utility classes or custom styles on these standalone pages:
// node scripts/build-secondary-page-styles.cjs
// To rebuild only the legal-guides index, pass guias-legales/index.html.
// Published guides and drafts can also be rebuilt individually with their HTML path.
// The shared stylesheets and the individual legal guides are left untouched.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const defaults = ['contacto', 'nosotros', 'dr-bulgheroni', 'dra-bulgheroni', 'dra-tassara']
    .flatMap(slug => ['', '/en', '/pt'].map(language => `${slug}${language}/index.html`))
    .concat(['servicios', 'servicios/accidente-de-trabajo', 'servicios/accidente-de-transito',
        'servicios/consumo', 'servicios/consumo/aerolineas', 'servicios/consumo/bancos-finanzas',
        'politica-privacidad', 'terminos-y-condiciones'].map(slug => `${slug}/index.html`));
const pages = process.argv.length > 2 ? process.argv.slice(2) : defaults;
for (const page of pages) {
    if (![...defaults, 'guias-legales/index.html'].includes(page)
        && !/^guias-legales\/[a-z0-9-]+\/index\.html$/.test(page)) {
        throw new Error(`Unsupported standalone page: ${page}`);
    }
}
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'tb-secondary-css-'));
const cli = path.join(root, 'node_modules/tailwindcss/lib/cli.js');
function compile(input, output, content) {
    execFileSync(process.execPath, [cli, '-i', input, '-o', output, '--minify', '--content', content],
        { cwd: root, stdio: 'pipe' });
    return fs.readFileSync(output, 'utf8');
}
function block(name, css) {
    return `<!-- TB page CSS: ${name} -->\n<style>${css}</style>\n<!-- /TB page CSS: ${name} -->`;
}
try {
    const custom = compile('css/styles.css', path.join(temp, 'custom.css'), 'js/**/*.js');
    for (const file of pages) {
        const target = path.join(root, file);
        let html = fs.readFileSync(target, 'utf8');
        const prefix = '../'.repeat(file.split('/').length - 1);
        const source = path.join(temp, 'content.html');
        fs.writeFileSync(source, html.replace(/<style\b[^>]*>[\s\S]*?<\/style>/g, ''));
        const scripts = [...html.matchAll(/<script\b[^>]*src="([^"]+)"/g)]
            .map(match => match[1]).filter(src => !src.startsWith('http'))
            .map(src => path.resolve(path.dirname(target), src));
        const utilities = compile('css/tailwind-input.css', path.join(temp, 'utilities.css'),
            [source, ...scripts].join(','));
        let customLocal = custom.replaceAll('../assets/', prefix + 'assets/')
            + fs.readFileSync(path.join(root, 'css/secondary-page-icons.css'), 'utf8');
        for (const [kind, weight] of [['solid', 900], ['regular', 400], ['brands', 400]]) {
            const fontDirectory = file.startsWith('guias-legales/') && kind !== 'brands'
                ? (file !== 'guias-legales/index.html' && kind === 'solid' ? 'guias-legales' : 'guias-index')
                : 'secondary-pages';
            customLocal = customLocal.replace(new RegExp(`src:url\\([^}]*?fa-${kind}-${weight}\\.woff2[^}]+`),
                `src:url("${prefix}assets/fonts/${fontDirectory}/fa-${kind}.woff2") format("woff2")`);
        }
        const sheets = { 'styles.css': customLocal, 'tailwind-compiled.css': utilities };
        html = html.replace(/<noscript>\s*<link\b[^>]*>\s*<\/noscript>/g, '');
        html = html.replace(/<link\b[^>]*(?:https:\/\/fonts\.(?:googleapis|gstatic)\.com|https:\/\/cdnjs\.cloudflare\.com|https:\/\/i\.postimg\.cc)[^>]*>/g, '');
        html = html.replace(/<!-- TB page CSS: ([\w.-]+) -->[\s\S]*?<!-- \/TB page CSS: \1 -->/g,
            (match, name) => block(name, sheets[name] || fs.readFileSync(path.join(root, 'css', name), 'utf8')
                .replaceAll('../assets/', prefix + 'assets/')));
        html = html.replace(/<link\b[^>]*href="([^"]+\.css(?:\?[^"]*)?)"[^>]*>/g, (match, href) => {
            if (href.startsWith('http')) return match;
            href = href.split('?')[0];
            const name = path.basename(href);
            return block(name, sheets[name] || fs.readFileSync(path.resolve(path.dirname(target), href), 'utf8')
                .replaceAll('../assets/', prefix + 'assets/'));
        });
        if (!html.includes('<!-- TB local fonts -->')) {
            const fonts = `\n<!-- TB local fonts -->
<link rel="preload" href="${prefix}assets/fonts/marcas/inter.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${prefix}assets/fonts/marcas/playfair.woff2" as="font" type="font/woff2" crossorigin>
<style>
@font-face{font-family:'Inter';font-style:normal;font-weight:300 700;font-display:swap;src:url('${prefix}assets/fonts/marcas/inter.woff2') format('woff2')}
@font-face{font-family:'Playfair Display';font-style:normal;font-weight:400 700;font-display:swap;src:url('${prefix}assets/fonts/marcas/playfair.woff2') format('woff2')}
</style>\n`;
            html = html.replace('</head>', fonts + '</head>');
        }
        html = html.replaceAll('assets/img/logo-tb-blanco.svg', 'assets/img/logo-tb-marcas-96.webp');
        fs.writeFileSync(target, html.split('\n').map(line => line.trimEnd()).join('\n'));
        console.log(file);
    }
} finally {
    fs.rmSync(temp, { recursive: true, force: true });
}
