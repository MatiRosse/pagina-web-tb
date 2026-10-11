# Traducciones públicas: contenido y SEO

Fecha de investigación e implementación: 7 de octubre de 2026.

## Página y enfoque

URL prevista: https://tbabogados.com.ar/servicios/traducciones-publicas/

El servicio conserva la marca del estudio y presenta a Daniel Bulgheroni como abogado y traductor público de inglés con atención a clientes de toda Argentina. El enfoque principal de contenido y SEO es nacional; Buenos Aires se conserva como ubicación real de la sede y búsqueda local secundaria. La página responde a consultas comerciales concretas: documento, idiomas, lugar de presentación, presupuesto y plazo. El listado general lo presenta como servicio complementario del estudio.

La investigación de resultados públicos sirve para identificar intención y terminología. No se contó con Search Console, Keyword Planner ni una herramienta de volúmenes; no se atribuyen volúmenes, dificultad ni posiciones a estas búsquedas.

| Grupo de búsquedas | Contenido que responde |
| --- | --- |
| traductor público inglés Argentina / traducciones públicas en Argentina | Título, encabezado, atención a distancia en todo el país, presentación y matrícula de Daniel |
| traductor público inglés CABA / Buenos Aires | Dirección real de la sede y atención presencial, como contexto local secundario |
| traducciones públicas inglés español | Direcciones de traducción, alcance y preguntas frecuentes |
| traducción de contratos y poderes | Sección de documentación jurídica y valor de la formación de abogado |
| traducción de estatutos / documentación societaria | Sección para empresas |
| traducción de partidas / certificados / títulos | Secciones para particulares y documentación académica |
| presupuesto / precio de traducción pública | Explicación de los factores de cotización y formulario de consulta |
| traducción pública legalizada / apostilla | Distinción de formalidades con enlaces a CTPCBA y Cancillería |

No se crearon páginas repetidas por barrio, idioma ni tipo de documento. Una página sustancial concentra la información del servicio.

## Implementado

- HTML estático y contenido accesible sin depender de JavaScript para el rastreo.
- Título de 54 caracteres, descripción de 152 caracteres, H1 único, encabezados descriptivos y canonical a la URL definitiva.
- Metadatos Open Graph y Twitter con fotografía local de Daniel.
- JSON-LD conectado: `WebPage`, `Service`, `Person` y `LegalService`. La ruta de navegación visible y su marcado `BreadcrumbList` se retiraron por preferencia editorial.
- Se reutilizan los identificadores del estudio y de Daniel. El proveedor del servicio es Daniel; se vincula su relación con TB Abogados.
- Nombre, dirección y teléfono coherentes con el sitio; idiomas y atención en toda Argentina descritos en el contenido visible. El servicio declara `areaServed: Country (Argentina)`; la dirección física del estudio se mantiene en CABA.
- Formación, matrículas y referencias verificables. El registro de juras del CTPCBA del 14/06/2023 publica 9562, tomo XXIII, folio 472 para Daniel Leonardo Bulgheroni, en inglés.
- Enlaces desde el menú compartido, las tres versiones del inicio, el índice de servicios y los tres perfiles de Daniel.
- Enlaces contextuales a servicios relacionados y fuentes oficiales, y un enlace desde la página de registro de marcas en Argentina desde el exterior.
- Entrada en sitemap y actualización de fechas solo para páginas con cambios sustanciales. `robots.txt` ya permite el rastreo.
- Fuentes locales, fotografía WebP, dimensiones explícitas de imágenes y estilos compilados para la página; navbar compartido externo.
- Preguntas frecuentes con `details` nativo y un formulario que prepara la consulta por WhatsApp para que el visitante la revise y la envíe.
- Sin reseñas, precios, plazos, firma digital ni resultados garantizados inventados.

Las preguntas frecuentes se incluyen por su utilidad. Google retiró su resultado enriquecido de FAQ en 2026; no se incorporó `FAQPage` como supuesto beneficio de visibilidad. `Service` describe el servicio, pero no es por sí solo un formato de resultado enriquecido garantizado. Los datos estructurados tampoco aseguran posiciones.

## Verificación local

Se verificaron JSON-LD, referencias entre entidades, H1, metadatos, canonical, sitemap, rutas locales, anclas, iconos y enlaces de entrada. Se comprobó la página en navegador de escritorio y móvil, el menú y el formulario. Se ejecutaron la compilación de Tailwind y los controles de sincronización del navbar y las traducciones del inicio.

El validador general `scripts/validate-static-translations.mjs` devuelve 28 errores que también existen en HEAD, con el mismo texto: enlaces de idiomas tratados incorrectamente por el validador y diferencias previas entre las páginas de marcas. No se modificaron esas otras traducciones para esta implementación.

## Después de publicar

1. Verificar que la URL definitiva devuelve HTTP 200 y que el sitemap publicado contiene la página.
2. Validar la URL con [Schema Markup Validator](https://validator.schema.org/) y [Rich Results Test](https://search.google.com/test/rich-results). Se validó la estructura localmente; no se presentó esta implementación a esos validadores externos.
3. Inspeccionar la URL en Google Search Console y solicitar indexación. Revisar el sitemap existente; si ya está enviado, comprobar que Google procesa la nueva entrada.
4. En el Perfil de Empresa de Google existente, agregar el servicio y enlazar esta página cuando la cuenta y las categorías lo permitan. Mantener el nombre real del estudio y sus datos; evitar agregar palabras clave al nombre comercial. Esta cuenta no se modificó.
5. Revisar el perfil de Daniel en el CTPCBA y, si permite actualizar el sitio profesional, vincular el servicio desde ese perfil. No se modificó el directorio externo.
6. Medir impresiones, clics, consultas y conversiones reales de esta URL. Ajustar el contenido con las consultas que aparezcan; no fijar como éxito únicamente una posición aislada.

Publicación autorizada por el usuario: envío de los cambios a la rama `main` para desplegar en GitHub Pages. La URL pública se verifica después de enviar los cambios al repositorio.

## Versión en inglés — 11 de octubre de 2026

- Página preparada en `servicios/traducciones-publicas/en/index.html`, con el diseño de la versión española y traducción completa de contenido, formulario, referencias, pie y metadatos. Se usa “sworn translation” y se explica el término argentino “traductor público”.
- Canonical propio, enlaces `hreflang` recíprocos y entrada en sitemap. El selector de idioma conecta español e inglés; portugués conserva el destino del inicio en portugués.
- Menús compartidos, tarjeta del inicio en inglés y enlace del perfil inglés de Daniel apuntan al servicio traducido. Los generadores del inicio y de páginas estáticas conservan esos destinos al regenerar.
- El formulario compartido prepara el mensaje de WhatsApp en el idioma de la página, incluidas las fechas y la opción sin fecha.
- Verificados escritorio y móvil de 390 px, fotografía, ausencia de desbordamiento horizontal, selector de idiomas, recursos locales, anclas, JSON-LD, sitemap y generación de mensajes en español e inglés. Controles de sincronización de navbar e inicio correctos. El validador general mantiene los mismos 28 errores ya documentados arriba.
- Publicación autorizada por el usuario el 11 de octubre de 2026 para desplegar esta versión en GitHub Pages.

## Fuentes

- [Google: guía básica de SEO](https://developers.google.com/search/docs/fundamentals/seo-starter-guide).
- [Google: datos estructurados de negocios locales](https://developers.google.com/search/docs/appearance/structured-data/local-business).
- [Google: actualizaciones de Search Central; retirada del resultado FAQ](https://developers.google.com/search/updates).
- [Schema.org: Service](https://schema.org/Service).
- [CTPCBA: juras y matrícula de Daniel](https://www.traductores.org.ar/matriculados/juras/).
- [CTPCBA: perfil profesional de Daniel](https://www.traductores.org.ar/traductor/bulgheroni-daniel-leonardo/) — enlazado desde el sitio; la herramienta de consulta no pudo abrirlo. La referencia registral se corroboró en la publicación de juras.
- [CTPCBA: reglamento de legalizaciones](https://www.traductores.org.ar/matriculados/legalizaciones/).
- [Cancillería: apostilla y legalización a través de TAD](https://www.argentina.gob.ar/servicio/legalizar-o-apostillar-un-documento-traves-de-tad).
- Muestra de resultados comerciales consultada para terminología e intención, sin copiar contenido: [FDR Traducciones](https://www.fdrtraducciones.com.ar/), [Iván Ovejero](https://traductorpublico.com.ar/) y [Rocío Matrero](https://www.bridgesformeaning.com/).
