import fs from 'node:fs';
import { createHash } from 'node:crypto';

const assetVersion = file => createHash('sha256').update(fs.readFileSync(new URL(file, import.meta.url))).digest('hex').slice(0, 12);
const stylesheetVersion = assetVersion('../css/navbar.css');
const runtimeVersion = assetVersion('../js/main.js');

const languages = {
  es: { code: 'ES', locale: 'es-AR', name: 'Español', flag: 'ar' },
  en: { code: 'EN', locale: 'en', name: 'English', flag: 'us' },
  pt: { code: 'PT', locale: 'pt-BR', name: 'Português', flag: 'br' }
};

const copy = {
  es: {
    home: 'Inicio', services: 'Servicios', calculators: 'Calculadoras', guides: 'Guías Legales',
    about: 'Nosotros', contact: 'Contacto', language: 'Idioma', selectLanguage: 'Seleccionar idioma',
    navigation: 'Navegación principal', openMenu: 'Abrir menú de navegación', closeMenu: 'Cerrar menú de navegación',
    allServices: 'Ver todos los servicios', allCalculators: 'Ver todas las calculadoras',
    consumerSubmenu: 'Mostrar reclamos de consumo',
    fallback: { en: 'Ir al Inicio en inglés', pt: 'Ir al Inicio en portugués' }
  },
  en: {
    home: 'Home', services: 'Services', calculators: 'Calculators', guides: 'Legal Guides',
    about: 'About Us', contact: 'Contact', language: 'Language', selectLanguage: 'Select language',
    navigation: 'Main navigation', openMenu: 'Open navigation menu', closeMenu: 'Close navigation menu',
    allServices: 'View all services', allCalculators: 'View all calculators',
    consumerSubmenu: 'Show consumer claims', fallback: {}
  },
  pt: {
    home: 'Início', services: 'Serviços', calculators: 'Calculadoras', guides: 'Guias Jurídicos',
    about: 'Sobre Nós', contact: 'Contato', language: 'Idioma', selectLanguage: 'Selecionar idioma',
    navigation: 'Navegação principal', openMenu: 'Abrir menu de navegação', closeMenu: 'Fechar menu de navegação',
    allServices: 'Ver todos os serviços', allCalculators: 'Ver todas as calculadoras',
    consumerSubmenu: 'Mostrar reclamações de consumo', fallback: {}
  }
};

// A single ordered list is used for both desktop and mobile, in all three languages.
const services = [
  ['marcas', 'trademark', 'Marcas', 'Trademarks', 'Marcas'],
  ['despidos', 'document', 'Despidos', 'Dismissals', 'Rescisões'],
  ['diferencia-salarial', 'salary', 'Diferencias Salariales', 'Salary Differences', 'Diferenças Salariais'],
  ['sucesiones', 'scales', 'Sucesiones', 'Probate', 'Sucessões'],
  ['divorcios', 'family', 'Divorcios', 'Divorce', 'Divórcios'],
  ['mediaciones', 'handshake', 'Mediaciones', 'Mediation', 'Mediações'],
  ['jubilaciones', 'clock', 'Jubilaciones', 'Retirement', 'Aposentadorias'],
  ['alquileres', 'building', 'Alquileres', 'Leases', 'Locações'],
  ['consumo', 'scales', 'Reclamos de Consumo', 'Consumer Claims', 'Reclamações de Consumo'],
  ['accidente-de-transito', 'car', 'Accidentes de Tránsito', 'Traffic Accidents', 'Acidentes de Trânsito'],
  ['accidente-de-trabajo', 'medical', 'Accidentes de Trabajo', 'Workplace Accidents', 'Acidentes de Trabalho']
];
const consumerServices = [
  ['consumo/aerolineas', 'plane', 'Aerolíneas', 'Airlines', 'Companhias Aéreas'],
  ['consumo/bancos-finanzas', 'bank', 'Bancos y Finanzas', 'Banking and Finance', 'Bancos e Finanças']
];
const calculators = [
  ['calculadora-sueldo-bruto-a-neto', 'calculator', 'Sueldo Bruto a Neto', 'Gross-to-Net Salary', 'Salário Bruto para Líquido'],
  ['aguinaldo-calculadora', 'gift', 'Aguinaldo (SAC)', 'Semiannual Bonus (SAC)', 'Abono Semestral (SAC)'],
  ['simulador-herencia', 'family', 'Simulador de herencia', 'Inheritance Simulator', 'Simulador de herança'],
  ['calculadora-despido', 'calculator', 'Indemnización por Despido', 'Severance Pay', 'Indenização por Demissão'],
  ['accidente-trabajo-calculadora', 'calculator', 'Accidente de Trabajo', 'Workplace Accident', 'Acidente de Trabalho'],
  ['calculadora-alquiler', 'building', 'Calculadora Alquiler', 'Rent Calculator', 'Calculadora de Aluguel'],
  ['calculadora-jubilacion', 'clock', 'Calculadora Jubilación', 'Retirement Calculator', 'Calculadora de Aposentadoria']
];
const localizedSections = ['nosotros', 'contacto', 'dra-bulgheroni', 'dr-bulgheroni', 'dra-tassara'];

export function pageLanguage(html) {
  const language = html.match(/<html\b[^>]*\blang="([^"]+)"/i)?.[1].toLowerCase() || 'es';
  return language.startsWith('en') ? 'en' : language.startsWith('pt') ? 'pt' : 'es';
}

function languageRoutes(page) {
  const route = page.replace(/index\.html$/, '');
  const home = { es: '', en: 'en/', pt: 'pt/' };
  if (['', 'en/', 'pt/'].includes(route)) return home;
  for (const section of localizedSections) {
    if ([`${section}/`, `${section}/en/`, `${section}/pt/`].includes(route)) {
      return { es: `${section}/`, en: `${section}/en/`, pt: `${section}/pt/` };
    }
  }
  const trademarks = { es: 'servicios/marcas/', en: 'servicios/marcas/en/', pt: 'servicios/marcas/pt/' };
  if (route === trademarks.es) return trademarks;
  if ([trademarks.en, trademarks.pt, 'servicios/marcas/registro-en-argentina-desde-el-exterior/'].includes(route)) {
    return { ...trademarks, es: 'servicios/marcas/registro-en-argentina-desde-el-exterior/' };
  }
  if (['servicios/marcas/en/foreign-associates/', 'servicios/marcas/pt/correspondentes/'].includes(route)) {
    return { ...trademarks, en: 'servicios/marcas/en/foreign-associates/', pt: 'servicios/marcas/pt/correspondentes/' };
  }
  // Spanish-only articles and tools keep their Spanish URL; the other flags lead to the translated home.
  return { ...home, es: route, fallback: true };
}

export function renderNavbar(page, language = 'es') {
  const t = copy[language];
  const current = languages[language];
  const index = ['es', 'en', 'pt'].indexOf(language) + 2;
  const prefix = '../'.repeat(page.split('/').length - 1) || './';
  const href = route => prefix + route;
  const localized = route => route + (language === 'es' ? '' : `${language}/`);
  const homeRoute = language === 'es' ? '' : `${language}/`;
  const activeRoute = page.replace(/index\.html$/, '');
  const currentAttribute = route => route === activeRoute ? ' aria-current="page"' : '';
  const icon = (name, id = '') => `<svg class="tb-nav-icon" viewBox="0 0 24 24"${id ? ` id="${id}"` : ''} aria-hidden="true" focusable="false"><use href="${prefix}assets/img/navbar-icons.svg#${name}"></use></svg>`;
  const flag = lang => `<img class="tb-nav-flag" src="${prefix}assets/img/flags/${languages[lang].flag}.svg" width="22" height="15" alt="" aria-hidden="true">`;
  const serviceRoute = item => `servicios/${item[0]}/` + (item[0] === 'marcas' && language !== 'es' ? `${language}/` : '');
  const link = (route, text, classes, iconName = '') => `<a href="${href(route)}" class="${classes}"${currentAttribute(route)}>${iconName ? icon(iconName) : ''}<span>${text}</span></a>`;
  const routes = languageRoutes(page);
  const languageLinks = mobile => Object.keys(languages).map(lang => {
    const option = languages[lang];
    const title = routes.fallback && lang !== 'es' ? ` title="${t.fallback[lang]}"` : '';
    return `<a data-language="${lang}" href="${href(routes[lang])}" hreflang="${option.locale}" lang="${option.locale}" class="${mobile ? 'tb-nav-mobile-language' : 'tb-nav-option'}"${lang === language ? ' aria-current="page"' : ''}${title}>${flag(lang)}<span>${option.name}</span></a>`;
  }).join('\n');
  const desktopServices = services.map(item => {
    const anchor = link(serviceRoute(item), item[index], 'tb-nav-option', item[1]);
    if (item[0] !== 'consumo') return anchor;
    return `<div class="tb-nav-dropdown tb-nav-consumer" data-nav-dropdown>
      <div class="tb-nav-consumer-row">${anchor}<button type="button" class="tb-nav-consumer-toggle" data-nav-trigger aria-label="${t.consumerSubmenu}" aria-expanded="false" aria-controls="nav-consumo">${icon('chevron')}</button></div>
      <div id="nav-consumo" class="tb-nav-panel tb-nav-consumer-panel" inert>${consumerServices.map(child => link(serviceRoute(child), child[index], 'tb-nav-option', child[1])).join('\n')}</div>
    </div>`;
  }).join('\n');
  const mobileServices = services.map(item => {
    const anchor = link(serviceRoute(item), item[index], 'tb-nav-mobile-option', item[1]);
    if (item[0] !== 'consumo') return anchor;
    return `<div class="tb-nav-mobile-consumer">
      <div class="tb-nav-consumer-row">${anchor}<button id="mob-consumo-btn" type="button" onclick="toggleMobSubmenu('mob-consumo')" class="tb-nav-consumer-toggle" aria-label="${t.consumerSubmenu}" aria-expanded="false" aria-controls="mob-consumo">${icon('chevron', 'mob-consumo-icon')}</button></div>
      <div id="mob-consumo" class="tb-nav-mobile-consumer-submenu hidden">${consumerServices.map(child => link(serviceRoute(child), child[index], 'tb-nav-mobile-option', child[1])).join('\n')}</div>
    </div>`;
  }).join('\n');
  const desktopCalculators = calculators.map(item => link(`servicios/calculadoras/${item[0]}/`, item[index], 'tb-nav-option', item[1])).join('\n');
  const mobileCalculators = calculators.map(item => link(`servicios/calculadoras/${item[0]}/`, item[index], 'tb-nav-mobile-option', item[1])).join('\n');
  const desktopButton = (label, id) => `<button type="button" class="tb-nav-link" data-nav-trigger aria-expanded="false" aria-controls="${id}"><span>${label}</span>${icon('chevron')}</button>`;
  const mobileButton = (label, id, iconName) => `<button id="${id}-btn" type="button" onclick="toggleMobSubmenu('${id}')" class="tb-nav-mobile-link" aria-expanded="false" aria-controls="${id}">${icon(iconName)}<span>${label}</span>${icon('chevron', `${id}-icon`)}</button>`;

  return `<nav class="tb-navbar" aria-label="${t.navigation}" data-language="${language}">
  <div class="tb-nav-container">
    <div class="tb-nav-row">
      <a href="${href(homeRoute)}" class="tb-nav-brand" aria-label="TB Abogados — ${t.home}">
        <span class="tb-nav-logo-frame"><img src="${prefix}assets/img/logo-tb-marcas-96.webp" alt="" width="48" height="48" loading="eager" fetchpriority="high" decoding="async" class="tb-nav-logo"></span>
        <span class="tb-nav-brand-name">TB ABOGADOS</span>
      </a>
      <div class="tb-nav-desktop">
        ${link(homeRoute, t.home, 'tb-nav-link')}
        <div class="tb-nav-dropdown" data-nav-dropdown>
          ${desktopButton(t.services, 'nav-servicios')}
          <div id="nav-servicios" class="tb-nav-panel" inert>${desktopServices}
            ${link('servicios/', t.allServices, 'tb-nav-option tb-nav-all')}
          </div>
        </div>
        <div class="tb-nav-dropdown" data-nav-dropdown>
          ${desktopButton(t.calculators, 'nav-calculadoras')}
          <div id="nav-calculadoras" class="tb-nav-panel tb-nav-calculators-panel" inert>${desktopCalculators}
            ${link('servicios/calculadoras/', t.allCalculators, 'tb-nav-option tb-nav-all')}
          </div>
        </div>
        ${link('guias-legales/', t.guides, 'tb-nav-link')}
        ${link(localized('nosotros/'), t.about, 'tb-nav-link')}
        ${link(localized('contacto/'), t.contact, 'tb-nav-link tb-nav-contact')}
        <div class="tb-nav-dropdown" data-nav-dropdown>
          <button type="button" class="tb-nav-link tb-nav-language-button" data-nav-trigger aria-label="${t.selectLanguage}" aria-expanded="false" aria-controls="nav-languages">${flag(language)}<span>${current.code}</span>${icon('chevron')}</button>
          <div id="nav-languages" class="tb-nav-panel tb-nav-languages-panel" inert>${languageLinks(false)}</div>
        </div>
      </div>
      <button id="mob-menu-btn" type="button" onclick="toggleMobileMenu()" class="tb-nav-menu-button" aria-label="${t.openMenu}" data-open-label="${t.openMenu}" data-close-label="${t.closeMenu}" aria-expanded="false" aria-controls="mob-menu">${icon('menu')}</button>
    </div>
  </div>
  <div id="mob-menu" class="tb-nav-mobile-menu hidden">
    <div class="tb-nav-mobile-inner">
      ${link(homeRoute, t.home, 'tb-nav-mobile-link', 'home')}
      <div class="tb-nav-mobile-group">
        ${mobileButton(t.services, 'mob-servicios', 'briefcase')}
        <div id="mob-servicios" class="tb-nav-mobile-services hidden">${mobileServices}
          ${link('servicios/', t.allServices, 'tb-nav-mobile-option tb-nav-all')}
        </div>
      </div>
      <div class="tb-nav-mobile-group">
        ${mobileButton(t.calculators, 'mob-calculadoras', 'calculator')}
        <div id="mob-calculadoras" class="tb-nav-mobile-submenu hidden">${mobileCalculators}
          ${link('servicios/calculadoras/', t.allCalculators, 'tb-nav-mobile-option tb-nav-all')}
        </div>
      </div>
      ${link('guias-legales/', t.guides, 'tb-nav-mobile-link', 'book')}
      ${link(localized('nosotros/'), t.about, 'tb-nav-mobile-link', 'users')}
      ${link(localized('contacto/'), t.contact, 'tb-nav-mobile-link', 'mail')}
      <div class="tb-nav-mobile-group">
        <button id="mob-languages-btn" type="button" onclick="toggleMobSubmenu('mob-languages')" class="tb-nav-mobile-link" aria-expanded="false" aria-controls="mob-languages">${flag(language)}<span>${t.language}</span>${icon('chevron', 'mob-languages-icon')}</button>
        <div id="mob-languages" class="tb-nav-mobile-submenu hidden">${languageLinks(true)}</div>
      </div>
    </div>
  </div>
</nav>`;
}

export function syncNavbar(html, page) {
  const nav = renderNavbar(page, pageLanguage(html));
  const primaryNavbar = /<nav\b[^>]*class="(?:nav-glass\b|tb-navbar\b)[^"]*"[\s\S]*?<\/nav>/g;
  if ((html.match(primaryNavbar) || []).length !== 1) throw new Error(`Expected one primary navbar in ${page}`);
  html = html.replace(primaryNavbar, nav);
  const prefix = '../'.repeat(page.split('/').length - 1) || './';
  const stylesheet = `<link rel="stylesheet" href="${prefix}css/navbar.css?v=${stylesheetVersion}">`;
  html = html.replace(/\s*<link\b[^>]*href="[^"]*css\/navbar\.css(?:\?[^"]*)?"[^>]*>/g, '');
  html = html.replace('</head>', `${stylesheet}\n</head>`);
  if (/<script\b[^>]*src="[^"]*\/js\/main\.js(?:\?[^"]*)?"/.test(html)) {
    html = html.replace(/(<script\b[^>]*src=")[^"]*\/js\/main\.js(?:\?[^"]*)?"/g,
      `$1${prefix}js/main.js?v=${runtimeVersion}"`);
  } else {
    html = html.replace('</body>', `<script src="${prefix}js/main.js?v=${runtimeVersion}" defer></script>\n</body>`);
  }
  return html;
}
