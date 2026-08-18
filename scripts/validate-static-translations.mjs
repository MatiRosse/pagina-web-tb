import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const pages = [
  'nosotros/index.html',
  'dra-bulgheroni/index.html',
  'dr-bulgheroni/index.html',
  'dra-tassara/index.html',
  'servicios/marcas/index.html',
  'contacto/index.html'
];

const errors = [];

function tagSequence(html) {
  return [...html.matchAll(/<\/?([a-z][a-z0-9-]*)\b[^>]*>/gi)]
    .filter(match => !['meta', 'link'].includes(match[1].toLowerCase()))
    .map(match => `${match[0].startsWith('</') ? '/' : ''}${match[1].toLowerCase()}`);
}

function idSequence(html) {
  return [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
}

function normalizeLanguageOptions(html) {
  return html.replace(
    /<a[^>]*>(?:🇦🇷 Español|🇬🇧 English|🇧🇷 Português)<\/a>/g,
    '<a class="LANGUAGE_OPTION">LANGUAGE</a>'
  );
}

function attributeSequence(html, attribute) {
  const normalized = normalizeLanguageOptions(html);
  const expression = new RegExp(`\\b${attribute}="([^"]*)"`, 'g');
  return [...normalized.matchAll(expression)].map(match => match[1]);
}

function normalizeLocalizedMarkup(html, file) {
  if (file !== 'servicios/marcas/index.html' && !file.match(/^servicios\/marcas\/(?:en|pt)\/index\.html$/)) return html;
  return html
    .replace(/\s*<!-- Pricing Section -->[\s\S]*?(?=\s*<!-- FAQs -->)/, '')
    .replace(/^\s*"priceRange":\s*"\$\$",?\r?\n/m, '');
}

function localReferences(file, html) {
  return [...html.matchAll(/\b(?:href|src)="([^"]+)"/g)]
    .map(match => match[1])
    .filter(value => value && !/^(?:[a-z]+:|#|data:)/i.test(value))
    .map(value => value.split(/[?#]/)[0])
    .filter(Boolean)
    .map(value => {
      const pathname = value.startsWith('/')
        ? path.join(root, value)
        : path.resolve(root, path.dirname(file), value);
      return value.endsWith('/') ? path.join(pathname, 'index.html') : pathname;
    });
}

function validateJsonLd(file, html) {
  for (const [index, match] of [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].entries()) {
    try {
      JSON.parse(match[1]);
    } catch (error) {
      errors.push(`${file}: JSON-LD ${index + 1} inválido (${error.message})`);
    }
  }
}

function validateLocalizedLinks(file, html, lang) {
  const localizablePaths = new Set([
    'nosotros',
    'contacto',
    'dra-bulgheroni',
    'dr-bulgheroni',
    'dra-tassara',
    'servicios/marcas'
  ]);

  for (const match of html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)) {
    const value = match[1];
    const label = match[2].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');
    if (/^(?:🇦🇷 Español|🇬🇧 English|🇧🇷 Português)$/.test(label)) continue;
    if (!value || /^(?:[a-z]+:|\/|#|data:)/i.test(value)) continue;

    const pathname = value.split(/[?#]/)[0];
    const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(file), pathname)).replace(/\/$/, '');
    if (localizablePaths.has(resolved)) {
      errors.push(`${file}: el enlace a ${resolved} no conserva el idioma ${lang}`);
    }
  }
}

for (const sourceFile of pages) {
  const source = fs.readFileSync(path.join(root, sourceFile), 'utf8');
  const expectedMarkup = normalizeLocalizedMarkup(source, sourceFile);
  const expectedTags = tagSequence(expectedMarkup);
  const expectedIds = idSequence(expectedMarkup);
  const expectedClasses = attributeSequence(expectedMarkup, 'class');
  const expectedStyles = attributeSequence(expectedMarkup, 'style');

  for (const lang of ['en', 'pt']) {
    const file = path.posix.join(path.posix.dirname(sourceFile), lang, 'index.html');
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    const localizedMarkup = normalizeLocalizedMarkup(html, file);
    const tags = tagSequence(localizedMarkup);
    const ids = idSequence(localizedMarkup);
    const classes = attributeSequence(localizedMarkup, 'class');
    const styles = attributeSequence(localizedMarkup, 'style');

    if (JSON.stringify(tags) !== JSON.stringify(expectedTags)) {
      errors.push(`${file}: la secuencia de etiquetas no coincide con ${sourceFile}`);
    }
    if (JSON.stringify(ids) !== JSON.stringify(expectedIds)) {
      errors.push(`${file}: la secuencia de IDs no coincide con ${sourceFile}`);
    }
    if (JSON.stringify(classes) !== JSON.stringify(expectedClasses)) {
      errors.push(`${file}: la secuencia de clases no coincide con ${sourceFile}`);
    }
    if (JSON.stringify(styles) !== JSON.stringify(expectedStyles)) {
      errors.push(`${file}: los estilos inline no coinciden con ${sourceFile}`);
    }

    const required = [
      'id="mob-languages"',
      'id="whatsapp-widget"',
      'js/main.js',
      'js/whatsapp-widget.js',
      'rel="canonical"',
      'hreflang="es-AR"',
      'hreflang="en"',
      'hreflang="pt-BR"',
      'hreflang="x-default"'
    ];
    for (const token of required) {
      if (!html.includes(token)) errors.push(`${file}: falta ${token}`);
    }

    const expectedLang = lang === 'en' ? 'en' : 'pt-BR';
    if (!html.includes(`<html lang="${expectedLang}"`)) errors.push(`${file}: lang incorrecto`);
    if (!html.includes(`/${lang}/" rel="canonical"`)) errors.push(`${file}: canonical incorrecto`);
    if (!html.includes('aria-current="page"')) errors.push(`${file}: idioma activo sin aria-current`);

    for (const reference of localReferences(file, html)) {
      if (!fs.existsSync(reference)) errors.push(`${file}: referencia local inexistente ${path.relative(root, reference)}`);
    }
    validateJsonLd(file, html);
    validateLocalizedLinks(file, html, lang);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`OK: ${pages.length * 2} traducciones consistentes con sus originales; rutas y JSON-LD válidos.`);
}
