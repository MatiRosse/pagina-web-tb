# Trámites de documentos

Página: `/servicios/tramites-documentos/`. Catálogo estático de 57 trámites,
con buscador local, filtros, orden por precio y consulta contextual por formulario.
El HTML completo y los precios están disponibles sin JavaScript.

## Consultas de trámites

Cada botón «Consultar este trámite» abre `/contacto/` en la misma pestaña, con
`tramite` y `jurisdiccion` en la URL y el ancla `#consulta`. El script
`js/contacto-tramites.js` precarga un asunto específico y un mensaje editable.
El visitante completa su nombre y al menos un teléfono o correo, y envía desde
el formulario existente. Sin JavaScript, puede completar esos datos manualmente.

Se reutiliza el endpoint de Formspree `https://formspree.io/f/xdawoyea` que ya
utilizan Contacto y el widget. El destinatario se administra en la cuenta de
Formspree. El usuario confirmó el 31/10/2026 que las consultas del formulario
actual llegan a `consultas@tbabogados.com.ar`. El destinatario no se cambia
desde el HTML ni agregando campos al formulario. Las pruebas locales no envían
consultas reales ni confirman por sí mismas la entrega al buzón.
Los enlaces identificados expresamente como WhatsApp siguen disponibles.

## Selección comercial

Selección recibida el 26/10/2026 en `tramites-documentos-tb-abogados.xlsm`, hoja
`Trámites`, columna H «¿Lo trabajamos?» (H8:H87). Se cotejaron los 80 registros
por nombre y jurisdicción: 57 Sí, 22 No y una decisión vacía.

`data/tramites-disponibilidad.json` conserva los 23 identificadores descartados.
El cálculo y el generador los excluyen del HTML, del JSON público y del Schema,
incluso después de actualizar el IPC. La referencia tarifaria completa permanece
intacta en `data/tramites-documentos-base.mjs`.

La celda H78 estaba vacía: «Inscripción de testimonio o reglamento», Provincia de
Buenos Aires (`inscripcion-testimonio-pba`). El usuario confirmó en el chat que
también debe quitarse. Resultado: 57 trámites activos y 23 retirados.

## Tarifas y fuente

`data/tramites-documentos-base.mjs` contiene los nombres, modalidades, importes,
plazos y adicionales publicados en https://www.gestoriauno.com.ar/tarifas/
para octubre de 2026, consultados el 7 de octubre de 2026. La presentación y
descripciones son originales. No se usan los contactos ni el diseño de la fuente.
Los trámites sin importe siguen como «A cotizar». La búsqueda de actas en PBA es
un servicio separado: no se presenta como precio de obtención de la partida.

Todos los importes monetarios del tarifario comercial (incluidos adicionales)
se ajustan desde esta base; los porcentajes permanecen constantes. Las tasas
oficiales reales deben confirmarse al cotizar. El IPC no sustituye una revisión
de los aranceles del organismo ni determina sus importes oficiales.

## IPC

Se usa la API pública actual del BCRA v4, variable 27, inflación mensual:
https://api.bcra.gob.ar/estadisticas/v4.0/Monetarias/27
Documentación oficial: https://www.bcra.gob.ar/apis-banco-central/

Al capturar el tarifario, el último período publicado era agosto de 2026.
Por eso se conserva ese mes como base. Los precios iniciales son exactamente
los de referencia; septiembre y siguientes se aplicarán cuando se publiquen.
Fórmula: `precio original × producto(1 + variación mensual / 100)` para meses
posteriores a la base, con redondeo final al peso. No se aplica inflación anual,
expectativas, CER o ICL. Nunca se vuelve a ajustar un precio ya redondeado.

La fecha de captura comercial, la verificación del IPC y el criterio de ajuste
son información interna, conservada en los datos y en esta documentación.
No se muestran en la página pública.
Una respuesta inválida, serie incompleta, mes duplicado, período futuro o
regresión del último mes detiene la generación. La versión publicada anterior
permanece intacta si falla el proceso de actualización o despliegue.

## Generación y verificación

```sh
node scripts/build-tramites-documentos.mjs
node scripts/build-tramites-documentos.mjs --update
node --test tests/tramites-pricing.test.mjs
node scripts/sync-navbars.mjs
node scripts/sync-home-translations.mjs
node scripts/sync-navbars.mjs --check
node scripts/sync-home-translations.mjs --check
```

El generador es la fuente de la página: editar `scripts/build-tramites-documentos.mjs`,
no el HTML generado. El CSS y el buscador tienen sus archivos independientes.
El pie de página se toma de `servicios/traducciones-publicas/index.html` para
mantener la misma estructura, enlaces y contenido de las páginas de servicios.
El generador actualiza HTML, JSON público y snapshot de IPC con los mismos valores.
Schema: LegalService, WebPage, Service, OfferCatalog y Offer; no se inventan
reseñas ni calificaciones. Los datos estructurados no garantizan resultados enriquecidos ni posición.

## Publicación y actualización diaria

`.github/workflows/tramites-documentos-pages.yml` prepara el sitio completo y lo
publica con las acciones oficiales de GitHub Pages, al cambiar main y diariamente
a las 12:15 UTC (09:15 de Buenos Aires). El proceso no necesita claves del BCRA
ni un servidor propio. El JSON generado vive en el artefacto publicado; no se
crean commits automáticos ni se altera la base comercial del repositorio.

Para activarlo después de incorporar los cambios, seleccionar **GitHub Actions**
en **Settings → Pages → Build and deployment → Source** del repositorio. En el
entorno `github-pages`, permitir despliegues desde main. Mantener `tbabogados.com.ar`
como dominio personalizado. No se modificó la configuración remota ni se desplegó
desde la sesión de desarrollo.

El artefacto incluye los directorios públicos del sitio, CNAME, robots y sitemap.
No publica `.git`, fuentes de automatización, dependencias locales o pruebas.
Una base comercial nueva requiere actualizar la fecha, los precios originales
y `baseMonth` juntos, con el último período publicado del IPC como nueva base.
