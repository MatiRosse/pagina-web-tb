# Plan de retiro temporal del servicio de aerolíneas

Fecha: 19 de octubre de 2026.
Estado: implementación local autorizada y completada el 19 de octubre de 2026; publicación y comprobación pública pendientes. Resultado detallado en `docs/verificacion-retiro-aerolineas-2026-10-19.md`.

## Objetivo y alcance

Dejar de ofrecer y promocionar el servicio de reclamos a aerolíneas hasta nuevo aviso. Conservar la página completa como borrador recuperable, retirar sus accesos y sus menciones comerciales del sitio y evitar que una regeneración de menús o traducciones vuelva a introducirlas.

URL actual: https://tbabogados.com.ar/servicios/consumo/aerolineas/
La consulta pública realizada en esta revisión todavía muestra la página y sus llamadas a consulta.

Mantener disponibles Reclamos de Consumo y Bancos y Finanzas, con textos ajustados al servicio efectivamente ofrecido.

## Inventario verificado

| Ubicación | Hallazgo | Acción propuesta |
| --- | --- | --- |
| `servicios/consumo/aerolineas/index.html` | Landing completa: presentación, casos, FAQ, contactos y datos estructurados de servicio. | Guardar copia íntegra como borrador y retirar el archivo de la ruta pública. |
| `scripts/navbar-template.mjs`, lista `consumerServices` | Fuente compartida del acceso Aerolíneas en español, inglés y portugués. | Retirar la entrada y regenerar menús de escritorio y móvil. Conservar Consumo y Bancos y Finanzas. |
| 71 HTML versionados | Incluyen enlaces del navbar a Aerolíneas. El total incluye la landing que se retirará. | Sincronizar todos los HTML publicados restantes y verificar que no conserven el enlace. |
| `index.html`, `en/index.html`, `pt/index.html` | La tarjeta del carrusel de Consumo menciona aerolíneas. | Ajustar el original español y las traducciones para mencionar servicios bancarios o financieros. Revisar también las vistas por hash y las plantillas diferidas. |
| `servicios/index.html` | La tarjeta de Consumo ofrece asesoramiento por problemas con aerolíneas. | Sustituir la descripción manteniendo el acceso a Consumo. |
| `servicios/consumo/index.html` | Tarjeta de Aerolíneas; menciones a vuelos en descripción SEO, Open Graph, JSON-LD y FAQ; recomendación de la guía del pasajero. | Retirar la tarjeta, ajustar textos y FAQ visibles y estructuradas; quitar la recomendación de esa guía desde esta página comercial. Reacomodar la tarjeta de Bancos y Finanzas. |
| `dra-bulgheroni/index.html`, `dra-bulgheroni/en/index.html`, `dra-bulgheroni/pt/index.html` | La descripción de Derecho del Consumidor incluye atención de conflictos con aerolíneas. | Retirar esa mención comercial en los tres idiomas, conservando la especialidad y el resto de los servicios. |
| `guias-legales/derechos-pasajeros-avion/index.html` | Párrafo que ofrece gestionar reclamos, dos enlaces al servicio, tarjeta lateral comercial y WhatsApp con mensaje específico del pasajero, también flotante. | Conservar el artículo informativo; retirar el párrafo comercial, la tarjeta de captación y los WhatsApp específicos. Añadir una nota breve de que el estudio no está tomando estos reclamos por el momento. |
| `guias-legales/index.html` y `sitemap.xml` | La guía informativa tiene tarjeta y entrada propias. | Conservarlas bajo el criterio editorial anterior. La existencia de la guía no debe presentar el servicio como disponible. |
| `sitemap.xml` | Incluye la URL de la landing de Aerolíneas. | Eliminar únicamente esa entrada de servicio. |
| `scripts/sync-home-translations.mjs` | Diccionario con la descripción comercial de Consumo y sus traducciones. | Ajustar las entradas utilizadas para que la regeneración no restaure la oferta. |
| `scripts/sync-static-translations.mjs` | Diccionario del perfil profesional con menciones a aerolíneas en los tres idiomas. | Actualizar el texto de origen y sus equivalentes; revisar el diff si se regeneran las páginas. |
| `scripts/build-secondary-page-styles.cjs` | Lista predeterminada de páginas que incluye la landing. | Retirar esa ruta del listado activo para no intentar reconstruir un archivo ausente. |
| `servicios/marcas/registro-en-el-exterior/index.html` | Borrador local no versionado, con enlace de menú antiguo a Aerolíneas. | Limpiar el enlace dentro de ese borrador, sin publicarlo. |
| `servicios/tramites-documentos/index.html`, `guias-legales/registrar-nombre-logo-o-ambos/index.html` | Otros dos HTML locales no versionados con enlace de navbar a Aerolíneas. | Sincronizar explícitamente sus menús, sin publicarlos. El sincronizador general los excluye. |

La búsqueda también devuelve «pasajeros» en Accidentes de Tránsito: corresponde a accidentes terrestres y no requiere retirar contenido.

## Conservación del borrador y URL anterior

1. Antes de editar, copiar el estado actual de la landing a `.borradores/servicios/consumo/aerolineas/index.html` y verificar que la copia sea idéntica. Esto conserva también los cambios locales todavía no incorporados a Git.
2. Guardar junto al borrador un README con fecha, ruta pública original, estado «suspendido hasta nuevo aviso», recursos utilizados y pasos de restauración. Guardar también los fragmentos comerciales que se retiren de las otras páginas y sus ubicaciones para facilitar su recuperación.
3. Excluir `.borradores/` de Git mediante una regla específica en `.gitignore`; comprobarlo con `git check-ignore` y revisar que ningún archivo del borrador entre en el commit ni en el artefacto de publicación. El borrador permanecerá disponible localmente; el historial Git conserva además las versiones anteriores ya confirmadas.
4. Retirar `servicios/consumo/aerolineas/index.html` del árbol público. La propuesta es que la URL anterior responda 404 tras desplegar, sin redirigir a Bancos y Finanzas ni mostrar la oferta anterior. Verificar tanto la ruta con barra como `/index.html` y la variante sin barra, siguiendo sus posibles redirecciones.
5. No usar solamente CSS, eliminación de enlaces, `noindex` ni `robots.txt` como mecanismo de retiro: el contenido original debe quedar fuera de los archivos servidos. Los resultados y vistas previas ya almacenados por buscadores o redes pueden tardar en actualizarse.

El workflow local `.github/workflows/tramites-documentos-pages.yml` copia carpetas públicas a `_site` y usa `.nojekyll`; no incluye una carpeta raíz `.borradores`. Ese workflow está actualmente sin versionar y la documentación indica que su activación remota está pendiente. Antes de publicar, comprobar qué método usa realmente GitHub Pages y revisar sus archivos de salida. No asumir exclusiones automáticas por el prefijo de una carpeta.

## Orden de ejecución

1. Registrar el estado previo y preservar los cambios locales existentes. Hay modificaciones ajenas a este pedido en numerosas páginas y scripts; editar sobre ellas sin revertirlas ni incluirlas indiscriminadamente en una publicación.
2. Crear y comprobar el borrador y su exclusión. Conservar el registro de textos retirados.
3. Modificar la fuente del navbar y los textos originales: home, Servicios, Consumo y perfil profesional. Actualizar diccionarios. Ajustar la guía según el criterio informativo propuesto.
4. Quitar la landing pública, su entrada de sitemap y su ruta del constructor de estilos secundarios.
5. Regenerar las traducciones afectadas y los navbars. Para el perfil, actualizar los HTML y sus diccionarios; si se usa el regenerador estático completo, revisar los cambios de las otras familias y preservar las modificaciones previas. Orden final de sincronización:

   ```bash
   node scripts/sync-navbars.mjs
   node scripts/sync-home-translations.mjs
   node scripts/sync-navbars.mjs
   node scripts/sync-navbars.mjs --check
   node scripts/sync-home-translations.mjs --check
   ```

6. Actualizar por separado los tres borradores HTML no versionados del inventario usando la fuente compartida cuando corresponda. No agregarlos a la publicación por este pedido.
7. Si se incorporan clases nuevas, recompilar Tailwind según `AGENTS.md`; reconstruir el CSS incrustado de las páginas secundarias afectadas cuando corresponda. Revisar que el cambio de Consumo a una sola tarjeta conserve una composición centrada y adaptable.
8. Completar la verificación local, presentar el resultado y publicar cuando el usuario indique avanzar con la publicación. Inspeccionar el diff y seleccionar únicamente los cambios de este retiro; resolver cualquier dependencia con cambios locales ajenos antes de desplegar.
9. Tras el despliegue, comprobar el sitio público y registrar resultado, fecha y versión publicada. No dar el retiro público por completado con una comprobación local.

## Plan de verificación y criterios de aceptación

- [ ] **Borrador recuperable:** copia íntegra comprobada antes de retirar la landing, README y fragmentos archivados; archivos ignorados y ausentes del despliegue.
- [ ] **Barrido de referencias:** buscar en HTML, JS, scripts, metadatos y sitemap la ruta `consumo/aerolineas`, rutas relativas como `./aerolineas/`, las etiquetas «Aerolíneas», «Airlines» y «Companhias Aéreas», y ofertas sobre vuelos, equipaje, demoras y cancelaciones. Revisar también URL codificadas de WhatsApp y JSON-LD. Las coincidencias informativas de la guía se admiten; ofertas comerciales o enlaces al servicio retirado, no. Excluir del criterio de cero coincidencias el plan, el archivo de borrador y el historial.
- [ ] **Cobertura completa:** ningún HTML publicado enlaza a la landing ni ofrece el servicio; los tres borradores locales restantes tampoco conservan el acceso.
- [ ] **Navbar:** pasan los dos controles `--check`; comprobar escritorio, móvil, teclado y apertura/cierre del submenú Consumo en páginas de distinta profundidad y en ES/EN/PT.
- [ ] **Home y Servicios:** carrusel, tarjetas, vistas por hash y traducciones sin menciones comerciales a aerolíneas; sin huecos o enlaces rotos.
- [ ] **Consumo:** Bancos y Finanzas sigue visible y operativo; FAQ, descripción, Open Graph y JSON-LD coinciden con el alcance vigente.
- [ ] **Perfil profesional:** las versiones ES/EN/PT conservan la información restante y no ofrecen atención de estos reclamos.
- [ ] **Guía:** conserva artículo, fuentes, autoría y enlaces oficiales; no ofrece gestionar casos ni incorpora WhatsApp de captación por vuelos. Su nota de disponibilidad es clara. La tarjeta del índice enlaza al artículo y no al servicio retirado.
- [ ] **SEO y enlaces:** sitemap XML válido sin la landing, bloques JSON-LD válidos, sin enlaces internos que apunten a la ruta retirada; idiomas y rutas relativas correctos.
- [ ] **Prueba visual:** revisar 375 px, 768 px, 1279 px, 1280 px y 1440 px, incluyendo menús y Consumo con una sola tarjeta; sin desbordes ni espacios vacíos anómalos.
- [ ] **Artefacto público:** ausentes la landing original y `.borradores/`; presentes las páginas y recursos de Consumo/Bancos y Finanzas. Revisar también las salidas de cualquier generación automática activa.
- [ ] **Sitio desplegado:** verificar home ES/EN/PT, Servicios, Consumo, perfil y guía; la URL antigua deja de mostrar la landing y responde 404 al terminar las redirecciones. Confirmar con recarga sin caché.
- [ ] **Revisión del cambio:** `git diff --check` sin errores nuevos; diff de alcance revisado y sin alteraciones ajenas incorporadas accidentalmente.

## Línea base de controles tomada al preparar el plan

- `node scripts/sync-navbars.mjs --check`: correcto, 71 navbars comprobados, sin modificaciones.
- `node scripts/sync-home-translations.mjs --check`: correcto en ambas traducciones.
- `node scripts/validate-static-translations.mjs`: ya falla antes de este retiro. Reporta enlaces de idioma en páginas institucionales y diferencias de estructura, IDs, clases y estilos entre Marcas y sus traducciones. Conservar esta línea base; distinguir esos avisos de regresiones nuevas y comprobar específicamente las traducciones modificadas por este pedido. No declarar que este control pasa ni ampliar el retiro para reparar todo ese conjunto sin necesidad.

## Reactivación cuando el usuario lo indique

Restaurar la landing desde el borrador a su ruta original; recuperar los textos comerciales desde el registro guardado; reponer la entrada del navbar y la de sitemap; actualizar diccionarios y listado de estilos; retirar la nota de suspensión de la guía y restaurar sus llamadas comerciales. Revisar la vigencia del contenido antes de republicar y repetir las verificaciones locales y públicas. No establecer fecha ni tarea automática de reactivación.

## Estado de ejecución

La preparación inicial se limitó al plan. Tras la indicación «Dale avanza», se creó y verificó el borrador, se retiró la landing del árbol público y se actualizaron ambos navbars, textos, traducciones, metadatos, sitemap y generadores. Se completaron las verificaciones locales y las pruebas de navegador. Consultar los resultados y capturas en `docs/verificacion-retiro-aerolineas-2026-10-19.md`.

La lista anterior conserva los criterios de aceptación de todo el proceso, incluidos los de publicación. No se marca el retiro público como completado: no hubo commit, push ni despliegue. La revisión del artefacto efectivo y las comprobaciones contra el dominio público siguen pendientes de publicación.
