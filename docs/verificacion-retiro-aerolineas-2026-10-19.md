# Retiro temporal de Aerolíneas: resultado local

Fecha: 19 de octubre de 2026. Implementación local completada; publicación pendiente.

## Cambios realizados

- Landing íntegra archivada en `.borradores/servicios/consumo/aerolineas/index.html`, con README de restauración. SHA-256 de la copia verificada: `2c7a0291c3f85dbce9e3a14b5638ce1b40bee0cc68771bc1ca07edfcc724706f`.
- Copias de los originales y sus hashes en `.borradores/retiro-aerolineas-2026-10-19/antes/` y `manifest.json`. Conservan los cambios locales que ya existían antes del retiro. La carpeta está ignorada por Git y no contiene archivos versionados.
- Retirada la landing de `servicios/consumo/aerolineas/` y su entrada del sitemap.
- Retirado Aerolíneas de la fuente compartida del navbar y de ambos menús, escritorio y móvil, en las 70 páginas versionadas restantes. Revisados y actualizados también los tres HTML no versionados del inventario, que permanecen sin publicar.
- Actualizados Inicio, Servicios, Consumo y perfil de la Dra. Bulgheroni en los idiomas correspondientes. Actualizados diccionarios de traducción y listado del constructor de estilos secundarios para evitar reintroducir el servicio.
- Conservada la guía del pasajero como artículo informativo con nota de suspensión. Retirados su oferta de gestión, enlaces al servicio, tarjeta comercial y ambos WhatsApp específicos. Quitada la recomendación de esa guía desde la página comercial de Consumo.
- Centrada la tarjeta restante de Bancos y Finanzas; ajustado el salto del correo del pie de Consumo para evitar un desborde a 768 px. Reconstruidos Tailwind y el CSS incrustado de Consumo.
- El sincronizador de navbar omite archivos retirados todavía presentes en el índice de Git, por lo que funciona antes y después de registrar la eliminación.

## Verificaciones realizadas

| Control | Resultado |
| --- | --- |
| `node scripts/sync-navbars.mjs --check` | Correcto: 70 páginas, cero actualizaciones pendientes. |
| `node scripts/sync-home-translations.mjs --check` | Correcto: originales y traducciones de Inicio consistentes. |
| Barrido de 73 HTML, incluidos los tres borradores adicionales | Cero enlaces a la landing retirada; ambos submenús conservan Bancos y Finanzas. |
| JSON-LD y sitemap | 153 bloques JSON-LD parseados correctamente; XML válido, sin la URL de Aerolíneas. |
| Generadores | Sin referencias comerciales a Aerolíneas en los scripts revisados. |
| Integridad del borrador | Coincide byte a byte con la landing anterior. |
| Exclusión del borrador | `git check-ignore` correcto; `git ls-files .borradores` vacío. |
| Sintaxis y espacios | `node --check` correcto en los cinco scripts afectados; `git diff --check` correcto. |
| Traducciones estáticas generales | Mismos avisos que en la línea base, comparación exacta de la salida. Sin avisos nuevos. |
| Navbar ES/EN/PT en navegador | Apertura y cierre de submenús en escritorio y móvil; únicamente Bancos y Finanzas. Escape cierra el submenú de escritorio; Tab permite llegar al enlace bancario en móvil. |
| Página de mayor profundidad | Comprobado el menú en Bancos y Finanzas, sin acceso al servicio suspendido. |
| Consumo responsive | 375, 768, 1279, 1280 y 1440 px: una tarjeta, sin desborde horizontal. Navbar móvil hasta 1279 px y escritorio desde 1280 px. |
| Guía en navegador | Nota de suspensión presente; cero enlaces al servicio retirado y cero WhatsApp de captación. |

La validación general de traducciones ya reportaba diferencias de enlaces de idioma y estructura de otras páginas antes de este pedido. No se declara ese control como aprobado ni se modificaron esas otras áreas para corregirlo.

## Respuestas HTTP de la vista previa local

| Ruta | Estado |
| --- | --- |
| `/servicios/consumo/aerolineas/` | 404 |
| `/servicios/consumo/aerolineas/index.html` | 404 |
| `/servicios/consumo/aerolineas` | 404 |
| `/.borradores/servicios/consumo/aerolineas/index.html` | 404, acceso bloqueado por el servidor de vista previa |
| `/servicios/consumo/` | 200 |
| `/servicios/consumo/bancos-finanzas/` | 200 |

El bloqueo de la carpeta oculta en la vista previa es una configuración local del servidor de prueba. Para producción, la protección consiste en mantener el borrador ignorado y fuera de los archivos de despliegue; no depende de ese servidor local.

## Evidencia y publicación pendiente

Capturas locales: `outputs/retiro-aerolineas-2026-10-19/navbar-desktop.png` y `outputs/retiro-aerolineas-2026-10-19/navbar-mobile.png`.

No se creó commit, no se enviaron cambios remotos y no se desplegó el sitio. Antes de publicar, revisar el diff y el método activo de GitHub Pages, seleccionar los cambios de este retiro sin arrastrar los numerosos cambios previos ajenos y comprobar que el artefacto no incluya borradores. Después del despliegue, repetir las comprobaciones públicas previstas en el plan. Las respuestas HTTP documentadas aquí corresponden a la vista previa local.

La reactivación requiere una indicación del usuario y la revisión de vigencia del contenido. Seguir `docs/plan-retiro-temporal-aerolineas.md` y el README del borrador.
