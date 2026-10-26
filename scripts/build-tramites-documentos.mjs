import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {renderNavbar, syncNavbar} from './navbar-template.mjs';
import {fetchIPC, validateIPC, priceSnapshot, IPC_URL} from './tramites-pricing.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const snapshotPath = path.join(root,'data/tramites-ipc.json');
const previous = JSON.parse(fs.readFileSync(snapshotPath,'utf8'));
let observations = previous.observations;
let verifiedAt = previous.verifiedAt;
if (process.argv.includes('--update')) {
  let publishedMonth = previous.observations.at(-1).month;
  if (process.argv.includes('--published')) {
    // Keep the last deployed month across independent daily Actions runs.
    const response = await fetch('https://tbabogados.com.ar/data/tramites-ipc.json', {signal:AbortSignal.timeout(20000)});
    if (response.ok) {
      const published = await response.json();
      if (published.observations?.[0]?.month === previous.observations[0].month) {
        const rows = validateIPC({status:200,results:[{idVariable:27,detalle:published.observations.map(row=>({fecha:row.month+'-28',valor:row.rate}))}]});
        publishedMonth = rows.at(-1).month;
      }
    } else if (response.status !== 404) throw new Error(`No se pudo verificar el último IPC publicado: HTTP ${response.status}`);
  }
  observations = await fetchIPC();
  if (observations.at(-1).month < publishedMonth) throw new Error('El IPC retrocedió respecto del sitio publicado. Se conserva la versión anterior.');
  if (observations.at(-1).month < previous.observations.at(-1).month) throw new Error('El IPC retrocedió. Se conserva el tarifario anterior.');
  verifiedAt = new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Argentina/Buenos_Aires',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
}
const data = priceSnapshot(observations);
const availability = JSON.parse(fs.readFileSync(path.join(root,'data/tramites-disponibilidad.json'),'utf8'));
const modifiedAt = [verifiedAt, availability.reviewedAt].sort().at(-1);
const esc = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const money = value => '$ '+new Intl.NumberFormat('es-AR',{maximumFractionDigits:0}).format(value);
const url = 'https://tbabogados.com.ar/servicios/tramites-documentos/';
const whatsapp = text => 'https://wa.me/5491122511243?text='+encodeURIComponent(text);
const contact = whatsapp('Hola, quiero consultar por un trámite de documentos.');
// Inline the shared icon paths so they also render when opened through file://.
const iconSprite = fs.readFileSync(path.join(root,'assets/img/navbar-icons.svg'),'utf8');
const icon = name => {
  const symbol = iconSprite.match(new RegExp(`<symbol id="${name}"[^>]*>([\\s\\S]*?)</symbol>`));
  if (!symbol) throw new Error(`No se encontró el ícono ${name}`);
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${symbol[1]}</svg>`;
};
const waIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.5 11.5a8.5 8.5 0 0 1-12.9 7.3L3 20l1.2-4.6A8.5 8.5 0 1 1 20.5 11.5Z"/><path d="M8 7.5c0 4 4.5 8.5 8.5 8.5l.5-2.5-3-1-1 1a10 10 0 0 1-3-3l1-1-1-3Z"/></svg>';
const categoryOrder = ['partidas','apostillas','inmuebles','catastro','escrituras','automotor','judiciales','personas'];
const popular = ['nacimiento-caba','nacimiento-pba','apostilla','dominio-inmueble-caba','dominio-inmueble-pba','matrimonio-caba','defuncion-caba','automotor-dominio'];
const services = [...data.services].sort((a,b) => {
  const aRank = popular.includes(a.id)?popular.indexOf(a.id):100+categoryOrder.indexOf(a.category);
  const bRank = popular.includes(b.id)?popular.indexOf(b.id):100+categoryOrder.indexOf(b.category);
  return aRank-bRank;
});
function card(service) {
  const jurisdiction=data.jurisdictions[service.jurisdiction];
  const cheapest=service.options.filter(o=>o.label!=='Servicio de búsqueda').sort((a,b)=>a.price-b.price)[0];
  const hasSeparateSearch=service.options.some(o=>o.label==='Servicio de búsqueda');
  const price=cheapest?`<span class="doc-price-label">${hasSeparateSearch?'Solicitud de partida':service.options.length>1?'Desde':'Precio base'}</span><strong>${money(cheapest.price)}</strong><span class="doc-price-currency">ARS</span><span class="doc-time">${esc(cheapest.time)}${cheapest.time.includes('días')?' hábiles':''} · ${esc(cheapest.label.toLowerCase())}</span>${hasSeparateSearch?'<span class="doc-time">Búsqueda sin datos: servicio separado</span>':''}`:'<strong class="doc-quote">A cotizar</strong><span class="doc-time">Presupuesto según tu documentación</span>';
  const options=service.options.map(o=>`<div class="doc-option"><span>${esc(o.label)}</span><strong>${money(o.price)}</strong><small>${esc(o.time)}${o.time.includes('días')?' hábiles':''}${o.note?' · '+esc(o.note):''}</small></div>`).join('');
  const extras=service.extras.length?`<p class="doc-extras-heading">Adicionales y condiciones</p><ul class="doc-extras">${service.extras.map(e=>`<li>${esc(e.label)}${e.price===undefined?e.percent?' · '+esc(String(e.percent).replace('.',','))+'%':'':': '+money(e.price)}</li>`).join('')}</ul>`:'';
  const details=(options||extras)?`<details class="doc-options"><summary>Ver ${service.options.length>1?'modalidades y detalles':'plazo y detalles'}</summary>${options}${extras}</details>`:'';
  const message=`Hola, quiero consultar por ${service.title} (${jurisdiction}). ¿Me confirman requisitos, modalidad y presupuesto final?`;
  return `<article class="doc-card" id="${service.id}" data-tramite data-category="${service.category}" data-jurisdiction="${service.jurisdiction}" data-title="${esc(service.title)}" data-price="${cheapest?.price??999999999}" data-search="${esc([service.title,service.description,service.keywords,data.categories[service.category],jurisdiction].join(' '))}">
<div class="doc-card-meta"><span>${esc(data.categories[service.category])}</span><span class="doc-jurisdiction">${esc(jurisdiction)}</span></div>
<h3 tabindex="-1">${esc(service.title)}</h3><p class="doc-card-description">${esc(service.description)}</p><div class="doc-price">${price}</div>${details}
<a class="doc-btn" href="${esc(whatsapp(message))}" target="_blank" rel="noopener noreferrer" aria-label="Consultar por ${esc(service.title)} en ${esc(jurisdiction)}">Consultar este trámite ${waIcon}</a>
</article>`;
}
const catalog = {
  '@type':'OfferCatalog','@id':url+'#catalogo','name':'Trámites de documentos y precios','itemListElement':services.map(service=>({
    '@type':'Service','@id':url+'#'+service.id,name:service.title+' · '+data.jurisdictions[service.jurisdiction],url:url+'#'+service.id,
    description:service.description,serviceType:data.categories[service.category],provider:{'@id':'https://tbabogados.com.ar/#organization'},
    areaServed:{'@type':service.jurisdiction==='nacional'?'Country':'AdministrativeArea',name:service.jurisdiction==='nacional'?'Argentina':data.jurisdictions[service.jurisdiction]},
    ...(service.options.length?{offers:service.options.map(option=>({'@type':'Offer',name:option.label,price:option.price,priceCurrency:'ARS',url:url+'#'+service.id,description:`Precio base orientativo. ${option.time}${option.note?'. '+option.note:''}. Adicionales según la ficha y presupuesto final antes de iniciar.`,seller:{'@id':'https://tbabogados.com.ar/#organization'}}))}:{})
  }))
};
const schema={'@context':'https://schema.org','@graph':[
  {'@type':'LegalService','@id':'https://tbabogados.com.ar/#organization',name:'TB Abogados',url:'https://tbabogados.com.ar/',telephone:'+5491122511243',image:'https://tbabogados.com.ar/assets/img/socios-abogados-og.jpg',address:{'@type':'PostalAddress',streetAddress:'Paraná 439',addressLocality:'Ciudad Autónoma de Buenos Aires',postalCode:'C1017',addressCountry:'AR'}},
  {'@type':'WebPage','@id':url+'#webpage',url,name:'Trámites de documentos, partidas y apostillas | TB Abogados',description:'Gestión de partidas, apostillas, informes de dominio y documentos en toda Argentina. Buscador, precios por modalidad y consulta por WhatsApp.',inLanguage:'es-AR',dateModified:modifiedAt,mainEntity:{'@id':url+'#service'}},
  {'@type':'Service','@id':url+'#service',name:'Gestión de trámites de documentos',url,provider:{'@id':'https://tbabogados.com.ar/#organization'},areaServed:{'@type':'Country',name:'Argentina'},hasOfferCatalog:{'@id':url+'#catalogo'}},
  catalog
]};
// Both service pages share the same depth, so their footer links match.
const footerSource=fs.readFileSync(path.join(root,'servicios/traducciones-publicas/index.html'),'utf8');
const footerMatch=footerSource.match(/<footer\b[^>]*>[\s\S]*?<\/footer>/);
if (!footerMatch) throw new Error('No se encontró el pie de página compartido');
const sharedFooter=footerMatch[0].replace('<footer class="','<footer class="doc-site-footer ');
const title='Trámites de documentos, partidas y apostillas | TB Abogados';
const description='Partidas, apostillas e informes de dominio en toda Argentina. Buscá tu trámite, compará precios y consultá por WhatsApp con TB Abogados.';
let html=`<!DOCTYPE html>
<html lang="es-AR">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title><meta name="description" content="${description}">
<meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${url}">
<meta property="og:type" content="website"><meta property="og:locale" content="es_AR"><meta property="og:site_name" content="TB Abogados">
<meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:url" content="${url}">
<meta property="og:image" content="https://tbabogados.com.ar/assets/img/socios-abogados-og.jpg"><meta property="og:image:alt" content="Equipo de TB Abogados">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${title}"><meta name="twitter:description" content="${description}"><meta name="twitter:image" content="https://tbabogados.com.ar/assets/img/socios-abogados-og.jpg">
<link rel="icon" href="../../assets/img/logotb.ico"><link rel="preload" href="../../assets/fonts/marcas/inter.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="../../assets/fonts/marcas/playfair.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="../../css/tailwind-compiled.css"><link rel="stylesheet" href="../../css/tramites-documentos.css">
<script type="application/ld+json">${JSON.stringify(schema).replaceAll('<','\\u003c')}</script>
<script>window.dataLayer=window.dataLayer||[];window.dataLayer.push({'gtm.start':Date.now(),event:'gtm.js'});(()=>{let loaded=false;function load(){if(loaded)return;loaded=true;let s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtm.js?id=GTM-PWWC3D8D';document.head.append(s)}['pointerdown','touchstart','keydown','scroll'].forEach(e=>window.addEventListener(e,load,{once:true,passive:true}));setTimeout(load,12000)})();</script>
</head>
<body>
<a class="doc-skip" href="#contenido">Ir al contenido</a>
${renderNavbar('servicios/tramites-documentos/index.html')}
<main id="contenido" class="doc-main">
<div class="doc-wrap">
<header class="doc-hero"><p class="doc-eyebrow">Gestión documental · TB Abogados</p><h1>Trámites de documentos</h1><p class="doc-lead">Partidas, apostillas, informes y más. Encontrá el trámite que necesitás y conocé su precio.</p><div class="doc-actions"><a class="doc-btn doc-btn-gold" href="#catalogo">Buscar mi trámite ${icon('document')}</a><a class="doc-btn doc-btn-outline" href="${contact}" target="_blank" rel="noopener noreferrer">Consultar por WhatsApp ${waIcon}</a></div><div class="doc-trust"><span>Toda Argentina</span><span>Precios por modalidad</span><span>Consulta desde donde estés</span></div></header>
<div class="doc-shortcuts"><a class="doc-shortcut" href="#catalogo" data-shortcut="partidas"><span class="doc-symbol">${icon('document')}</span><div><h2>Necesito una partida</h2><p>Nacimiento, matrimonio o defunción</p></div><span class="doc-arrow" aria-hidden="true">↗</span></a><a class="doc-shortcut" href="#catalogo" data-shortcut="apostillas"><span class="doc-symbol">${icon('scales')}</span><div><h2>Un documento para el exterior</h2><p>Apostillas y legalizaciones</p></div><span class="doc-arrow" aria-hidden="true">↗</span></a><a class="doc-shortcut" href="#catalogo" data-shortcut="inmuebles"><span class="doc-symbol">${icon('building')}</span><div><h2>Información de un inmueble</h2><p>Dominio, inhibición y titularidad</p></div><span class="doc-arrow" aria-hidden="true">↗</span></a></div>
<section id="catalogo" aria-labelledby="catalogo-title"><div class="doc-catalog-heading"><div><p class="doc-eyebrow">Encontrá lo que necesitás</p><h2 id="catalogo-title">Trámites y precios</h2><p>Elegí el documento y la jurisdicción donde se realiza el trámite.</p></div></div>
<form id="tramites-filters" class="doc-filters" role="search" aria-label="Buscar trámites de documentos" hidden><div class="doc-filter-row"><div class="doc-field"><label for="tramites-search">¿Qué documento necesitás?</label><div class="doc-search-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg><input type="search" id="tramites-search" name="buscar" placeholder="Ej.: nacimiento, apostilla, dominio…" autocomplete="off" aria-controls="tramites-grid"></div></div><div class="doc-field"><label for="tramites-jurisdiction">Jurisdicción del trámite</label><select id="tramites-jurisdiction" name="jurisdiccion"><option value="">Todas las jurisdicciones</option><option value="caba">CABA</option><option value="pba">Provincia de Buenos Aires</option><option value="nacional">Nacional</option></select></div><div class="doc-field"><label for="tramites-sort">Ordenar por</label><select id="tramites-sort" name="orden"><option value="relevancia">Más consultados</option><option value="precio">Menor precio base</option><option value="nombre">Nombre: A a Z</option></select></div></div>
<fieldset class="doc-categories"><legend>Filtrar por categoría</legend><button class="doc-category" type="button" data-category="todos" aria-pressed="true">Todos</button>${categoryOrder.map(key=>`<button class="doc-category" type="button" data-category="${key}" aria-pressed="false">${esc(data.categories[key])}</button>`).join('')}</fieldset></form>
<noscript><p class="doc-noscript">Podés recorrer el catálogo completo y consultar cualquier trámite por WhatsApp. Para utilizar el buscador, habilitá JavaScript en tu navegador.</p></noscript>
<div class="doc-results-line"><span id="tramites-count" role="status" aria-live="polite" aria-atomic="true">${services.length} trámites disponibles</span><button id="tramites-reset" class="doc-reset" type="button" hidden>Limpiar filtros</button></div>
<div id="tramites-grid" class="doc-grid">${services.map(card).join('\n')}</div>
<div id="tramites-empty" class="doc-empty" hidden><h3>No encontramos ese trámite</h3><p>Probá con otra palabra o consultanos. Te ayudamos a identificar el documento.</p><a class="doc-btn doc-btn-gold" href="${contact}" target="_blank" rel="noopener noreferrer">Consultar por WhatsApp ${waIcon}</a></div>
<div class="doc-more-wrap"><button id="tramites-more" class="doc-btn doc-btn-outline" type="button" hidden>Ver más trámites</button></div>
<aside class="doc-pricing-note" aria-label="Condiciones de los precios"><p><strong>Precios en pesos argentinos (ARS).</strong> Son importes orientativos por modalidad. Revisá los detalles para conocer adicionales, búsquedas o gastos especiales. Antes de iniciar confirmamos el presupuesto final. Los plazos en días son hábiles, estimados y sujetos al organismo.</p></aside>
</section>
<section class="doc-section" aria-labelledby="proceso-title"><p class="doc-eyebrow" style="text-align:center">De la consulta al documento</p><h2 class="doc-section-title" id="proceso-title">Lo resolvemos en tres pasos</h2><p class="doc-section-intro">Una gestión clara desde el primer mensaje.</p><div class="doc-steps"><article class="doc-step"><span class="doc-step-number">01 · ELEGÍ</span><h3>Encontrá tu trámite</h3><p>Buscá por nombre o categoría. Elegí la jurisdicción y revisá las modalidades y sus precios.</p></article><article class="doc-step"><span class="doc-step-number">02 · CONSULTÁ</span><h3>Confirmamos el alcance</h3><p>Contanos qué necesitás. Revisamos los datos y te confirmamos requisitos, presupuesto y forma de entrega.</p></article><article class="doc-step"><span class="doc-step-number">03 · DELEGÁ</span><h3>Nos ocupamos de la gestión</h3><p>Con la documentación y el presupuesto acordados, iniciamos el trámite y te acompañamos hasta su entrega.</p></article></div></section>
<section class="doc-section doc-contact" id="contacto-tramites" aria-labelledby="contacto-title"><div class="doc-contact-copy"><p class="doc-eyebrow">Hablemos de tu trámite</p><h2 id="contacto-title">¿No sabés qué documento pedir?</h2><p>Contanos para qué lo necesitás y dónde vas a presentarlo. Te ayudamos a encontrar el trámite y a definir los próximos pasos.</p><div class="doc-actions"><a class="doc-btn doc-btn-gold" href="${contact}" target="_blank" rel="noopener noreferrer">Escribir por WhatsApp ${waIcon}</a><a class="doc-btn doc-btn-outline" href="tel:+5491122511243">Llamar al estudio</a></div></div><aside class="doc-contact-aside"><h3>Un estudio que te acompaña</h3><p>TB Abogados<br>Paraná 439 · Zona Tribunales, CABA</p><p>Consultas a distancia y atención presencial con coordinación previa.</p><a href="../../nosotros/">Conocé a nuestro equipo →</a></aside></section>
<a class="doc-translation-promo" href="../traducciones-publicas/" aria-labelledby="translation-promo-title"><span class="doc-translation-icon">${icon('language')}</span><span class="doc-translation-copy"><span id="translation-promo-title" class="doc-translation-title">¿Tu documento necesita traducción?</span><span class="doc-translation-description">Conocé nuestras traducciones públicas inglés-español.</span></span><span class="doc-translation-action">Ver traducciones <span aria-hidden="true">→</span></span></a>
</div></main>
${sharedFooter}
<div class="doc-mobile-contact"><a class="doc-btn doc-btn-gold" href="${contact}" target="_blank" rel="noopener noreferrer">Consultar un trámite ${waIcon}</a></div>
<script src="../../js/tramites-documentos.js" defer></script>
</body></html>`;
html = syncNavbar(html,'servicios/tramites-documentos/index.html');
// All validation and rendering finish before any file is changed.
const target = path.join(root,'servicios/tramites-documentos/index.html');
fs.mkdirSync(path.dirname(target),{recursive:true});
fs.writeFileSync(target,html+'\n');
fs.writeFileSync(path.join(root,'data/tramites-documentos.json'),JSON.stringify({...data,verifiedAt},null,2)+'\n');
fs.writeFileSync(snapshotPath,JSON.stringify({source:IPC_URL,verifiedAt,observations},null,2)+'\n');
const sitemapPath=path.join(root,'sitemap.xml');
const sitemap=fs.readFileSync(sitemapPath,'utf8');
const updatedSitemap=sitemap.replace(/(<loc>https:\/\/tbabogados\.com\.ar\/servicios\/tramites-documentos\/<\/loc>\s*<lastmod>)[^<]+(<\/lastmod>)/,`$1${modifiedAt}$2`);
if (updatedSitemap !== sitemap) fs.writeFileSync(sitemapPath,updatedSitemap);

console.log(`${services.length} trámites · IPC ${data.ipcMonth} · factor ${data.factor.toFixed(6)}`);
