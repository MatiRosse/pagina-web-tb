# Registrar una marca en Argentina siendo extranjero

Versión editorial preparada para publicación el **2 de noviembre de 2026**, por indicación del usuario. HTML indexable, canonical propio, fecha de publicación, tarjeta en el índice, ItemList y entrada de sitemap incorporados. El despliegue debe verificarse por separado; este documento no acredita que la URL pública ya sirva la versión nueva.

El usuario solicitó una guía más breve: se retiraron las explicaciones de domicilios, presentación/representación, presupuesto, prioridad internacional y titularidad frente al distribuidor. Se mantienen el panorama del registro, los datos para consultar y el CTA al servicio existente. Lectura estimada: **2 minutos**.

## Autoría y fuentes

Florencia Bulgheroni figura como autora. La bio se limita a **Agente de la Propiedad Industrial · matrícula INPI 2971**, corroborada en su perfil institucional. No se declara `reviewedBy` ni una revisión efectuada por otra persona.

Fuentes consultadas el 2/11/2026:

| Afirmación | Fuente primaria | Alcance |
| --- | --- | --- |
| Solicitudes desde el exterior, territorialidad y diferencia entre trámite y concesión | [INPI: preguntas frecuentes](https://www.argentina.gob.ar/inpi/marcas/preguntas-frecuentes-de-marcas-0) | Se omiten pasajes de esa página que aún describen procedimientos anteriores de oposiciones. |
| Titulares, selección de productos/servicios, presentación y seguimiento | [INPI: registrar una marca](https://www.argentina.gob.ar/inpi/marcas/registrar-una-marca) | No se promete un plazo fijo ni se publica un listado exhaustivo de requisitos. |
| Examen antes de publicación y posibles oposiciones | [Resolución INPI 583/2025](https://www.argentina.gob.ar/normativa/nacional/resoluci%C3%B3n-583-2025-421168/texto) | Arts. 1 a 4; secuencia vigente desde el 1/3/2026. |

Se retiraron del HTML y del JSON-LD las fuentes específicas sobre prioridad y domicilios, cuyos desarrollos se eliminaron. Las sugerencias prácticas no se presentan como transcripciones normativas.

## Portada

Generada con la herramienta integrada **imagegen**. Referencia: logo oficial `assets/img/logotb_fondoblanco.png`. Imagen generada revisada visualmente y exportada en Pillow (solo conversión y ajuste de tamaño, sin editar contenido):

- `assets/img/portadas-guias/registrar-marca-argentina-siendo-extranjero.jpg`: 1200 × 800, redes.
- `assets/img/portadas-guias/registrar-marca-argentina-siendo-extranjero.webp`: 1200 × 800.
- `assets/img/portadas-guias/registrar-marca-argentina-siendo-extranjero-640.webp`: 640 × 427.

Prompt: “Create a polished editorial cover illustration for TB Abogados legal guide on registering a foreign company's trademark in Argentina. Landscape 3:2 composition. Black charcoal, ivory and muted gold palette. Elegant premium minimal 3D scene: a refined gold globe with thin meridians on left, connected by a delicate arc to a simple upright ivory card bearing a large generic registered-trademark symbol ® on right; subtle Argentina sky-blue accent, no flags or official documents. Text at upper left EXACT 'TU MARCA EN ARGENTINA', smaller subtitle 'Registro desde el exterior'. Place provided official TB Abogados circular logo visibly in lower right on ivory unobtrusive area, preserving the exact logo artwork and lettering. Keep generous safe margins, sophisticated legal editorial style, crisp readable text, no other text, no decorative clutter. The input image is the logo reference to incorporate.”

## Implementación y validaciones

- Conserva la plantilla optimizada de `quien-hereda-sin-testamento-argentina`, con navbar, footer, GTM y widget completos.
- CSS de la guía regenerado después de los cambios. No se agregaron utilidades Tailwind nuevas ni se alteraron estilos globales.
- La tarjeta conserva las clases de las existentes y se ubica después de la única guía destacada. ItemList renumerado; sitemap XML válido y fecha del índice actualizada.
- JSON-LD validado; robots `index, follow`; sin etiquetas editoriales de preparación o revisión pendiente en HTML.
- Enlaces y recursos locales comprobados; menú móvil, submenú de servicios y WhatsApp funcionales. Foto de autoría lazy carga al desplazarse.
- Revisión responsive de guía y plantilla: 360, 390, 428 y 1440 px, sin desborde horizontal. `git diff --check` correcto.
- El validador de la skill exige una clase antigua de navbar también ausente en la plantilla actual. La equivalencia con la navbar vigente se comprobó por separado; no se modificó el validador compartido.

Medición previa a la edición abreviada, **Lighthouse local 13.5.0**, Chrome headless: móvil rendimiento 95, accesibilidad 100, buenas prácticas 100, LCP 2,9 s; escritorio 100/100/100, LCP 0,7 s. El SEO previo era 69 por la restricción de indexación entonces vigente; esa restricción se retiró y esa puntuación no describe la versión final. No son métricas públicas de PageSpeed ni CrUX. Tras desplegar corresponde verificar la URL y volver a medir.

Informes y capturas locales: `/private/tmp/tb-foreign-qa/`. Los temporales pueden borrarse. URL final: https://tbabogados.com.ar/guias-legales/registrar-marca-argentina-siendo-extranjero/.

## Traducciones — 2/11/2026

Versiones completas EN y PT-BR en `en/` y `pt/`, conservando el contenido abreviado aprobado. Canonical propio, hreflang recíproco ES/EN/PT y x-default, banderas, sitemap y enlaces desde índice y servicios localizados. Portada internacional sin texto editorial, generada a partir de la original con imagegen, conserva ilustración y logo. Autoría INPI 2971 y enlaces al perfil correspondiente; CTA, WhatsApp, footer y fuentes traducidos.

CSS regenerado para ambas rutas; builder ampliado a subrutas de idiomas. JSON-LD, XML, enlaces locales y navbar validados. Responsive 360/390/428/1440 sin desbordes. Publicación y mediciones públicas se verifican al desplegar.

## Índices y URLs por idioma — 2/11/2026

La guía en inglés pasa a `/en/legal-guides/register-trademark-argentina/` y la portuguesa a `/pt/guias-juridicos/registrar-marca-argentina/`. Cada idioma dispone de índice propio, con solo sus traducciones publicadas. Se actualizaron canonical, hreflang, datos estructurados, sitemap, banderas y enlaces.

Las dos URLs anteriores permanecen como páginas mínimas de redirección inmediata mediante meta refresh, con canonical al destino y noindex. GitHub Pages no ofrece configuración de redirecciones HTTP 301 por ruta; no se presentan estas páginas como respuestas 301. Las páginas de redirección quedan excluidas de la sincronización de navbars.

Validación automatizada: `node --test tests/legal-guide-locales.test.mjs`. Cubre idioma, canonical/hreflang recíproco, navbar, recursos locales, concordancia tarjetas/ItemList y destinos anteriores.
