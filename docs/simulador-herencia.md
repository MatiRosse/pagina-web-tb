# Simulador de herencia

Página: `servicios/calculadoras/simulador-herencia/index.html`.
Motor puro: `js/herencia-engine.js`. Interfaz: `js/herencia-ui.js`.
Estilos aislados: `css/herencia.css`. Informe PDF: `js/herencia-pdf-report.js`.

## Alcance jurídico

Sucesiones intestadas sujetas al derecho argentino, para fallecimientos desde
el 1/8/2015 o ejemplos hipotéticos con la normativa consultada. No determina
titularidades, validez de vínculos, herederos judicialmente declarados ni
adjudicación de bienes. No calcula impuestos, honorarios, deudas ni recompensas.

Fuentes oficiales consultadas el 18/9/2026:

- [CCyC actualizado](https://www.argentina.gob.ar/normativa/nacional/ley-26994-235975/actualizacion).
- [Ley 27.077, vigencia](https://www.argentina.gob.ar/normativa/nacional/ley-27077-239773/texto).
- [Guía oficial del proceso sucesorio](https://www.argentina.gob.ar/justicia/derechofacil/leysimple/proceso-sucesorio).

No se atribuye a integrantes del estudio una revisión que no hayan efectuado.
La página expone fecha de consulta y referencias, no una certificación jurídica.

## Reglas y decisiones

| Situación | Tratamiento | Fundamento CCyC |
| --- | --- | --- |
| Hijos vivos | Cuotas iguales | 2426, 2430 |
| Hijo premuerto con nietos vivos | Una rama por hijo; subdivisión igual dentro de la rama | 2427–2429 |
| Hijo premuerto sin descendientes | Sin rama hereditaria | 2427–2429 |
| Cónyuge con descendientes | Cuota de una rama de hijo sobre propios; cero sobre gananciales hereditarios | 2433 |
| Padres sin descendientes | Por partes iguales entre progenitores vivos | 2431 |
| Cónyuge con padres | Mitad de la herencia para el cónyuge, mitad para progenitores | 2434 |
| Cónyuge sin descendientes ni ascendientes | Toda la herencia; desplaza hermanos | 2435 |
| Hermanos sin familiares prioritarios | Reparto igualitario entre los hermanos cargados, sin pedir clasificación del vínculo | 2438–2440; alcance simplificado |
| Pareja sin matrimonio | No recibe herencia intestada por la convivencia | 2424 |
| Divorcio | Excónyuge excluido; solo patrimonio neto ya determinado | 2437 |
| Separación de hecho sin voluntad de unirse / decisión judicial de cese | Explica exclusión y deriva la liquidación patrimonial; no calcula | 2437, 480 |
| Comunidad | Mitad del total ganancial neto al sobreviviente por liquidación; otra mitad al acervo | 488–498 |
| Separación de bienes | Se introduce solo patrimonio neto del fallecido; sin mitad automática | 505–508 |
| Vivienda | Información separada, no se representa como cuota hereditaria | 527, 2383 |

Los controles de abuelos/ascendientes solo se exigen si no hay descendientes ni
progenitores vivos cargados. El control de descendientes de hermanos se exige
solo al llegar al orden de los colaterales. Si esos familiares existen o su
existencia es desconocida, se detiene el cálculo. No se agregan al árbol.
Nunca se deduce vacancia de una familia vacía o fuera de alcance.

La experiencia simplificada presupone que la familia cargada está completa,
que no existía separación de hecho sin voluntad de volver a unirse y que no
hay circunstancias especiales. Esos supuestos se explican en el panel derecho
y los casos que no los cumplen se derivan a revisión profesional. Los nietos
cargados deben haber vivido a la apertura de la sucesión; otras ramas o
bisnietos requieren revisión. Los hijos de distintas relaciones y los adoptivos se tratan igual.
La adopción simple del propio causante se deriva por las excepciones del art.
2432 y el alcance del parentesco. Los hijos fallecidos después generan otra
sucesión y no se confunden con representación por premoriencia.

El testamento o la duda sobre su existencia detienen el cálculo desde el panel
derecho. También quedan fuera del alcance: fecha anterior o desconocida;
renuncias, indignidad, donaciones previas, cesiones, filiación controvertida,
personas por nacer, internacionalidad, nulidad, matrimonio del art. 2436,
deudas/recompensas y liquidaciones pendientes.

## Diagrama y bases de porcentajes

La interfaz trabaja exclusivamente con porcentajes: no pide importes ni moneda.
El árbol funciona como constructor del escenario. Los porcentajes y el resumen
se muestran recién al presionar «Simular sucesión», reemplazando las preguntas
dentro del mismo panel lateral. Con cuatro o más personas, el resultado usa dos
columnas diferenciadas en pantallas con ancho suficiente y una sola en móvil.

- Vista propios: 100 % = patrimonio propio neto del fallecido.
- Vista ganancial: 100 % = comunidad neta de ambos cónyuges. La mitad corresponde
  al sobreviviente por liquidación; la mitad restante se reparte por herencia.
- Cada tarjeta ganancial muestra `cuotaGanancialesHereditarios / 2`; la del
  cónyuge agrega 50 % por liquidación y detalla ambos conceptos separadamente.
- Ejemplo con cónyuge y dos hijos: 50 % cónyuge por liquidación, 25 % cada hijo
  por herencia. Con cónyuge y dos padres: 75 % cónyuge (50 % liquidación + 25 %
  herencia) y 12,5 % cada padre. Todos usan el mismo denominador.
- En patrimonios mixtos, dos vistas alternables, cada una con su 100 %. Nunca se
  infiere un porcentaje global sin conocer la composición del patrimonio.
- Una persona excluida muestra 0 %; si el escenario tiene información pendiente,
  todas las tarjetas muestran «—», sin conservar porcentajes anteriores.

`percentage(result, id, basis)` realiza la conversión de base para las tarjetas.
El motor conserva sus funciones internas de la primera versión y sus pruebas
monetarias de regresión; ninguna está expuesta en la interfaz actual.

## Relaciones y navegación

- Padres encima; cónyuge/conviviente a la izquierda; hermanos a la derecha;
  hijos debajo y nietos debajo de su propio progenitor.
- Filiación: línea continua vertical entre progenitor y descendiente. Los
  hermanos tienen una arista lateral discontinua de parentesco y se agregan sin
  preguntar cuántos progenitores comparten con la persona fallecida.
- Pareja: línea lateral dorada. Los hijos se conectan solo con el fallecido;
  no se presupone que sean hijos de su pareja actual.
- Solo se conectan tarjetas de personas, nunca botones de agregar. Los SVG
  recalculan sus extremos después de cambios, redimensionado y carga de fuentes.
- Los controles de agregar pertenecen a su respectiva zona. Nietos por rama.
- En escritorio, el formulario usa una distribución 70/30: el árbol ocupa el
  70 % y el panel de preguntas el 30 %. Al simular correctamente, la tarjeta
  pasa a 50/50, el árbol reduce su zoom solo si lo necesita y el resultado
  compacto reemplaza las preguntas en la mitad derecha; «Modificar datos»
  permite volver. El cambio de proporciones y el ajuste del árbol tienen una
  transición breve. En pantallas angostas ambos sectores se apilan. Las tarjetas
  miden 136 px y el lienzo conserva desplazamiento y zoom para familias extensas.
- El selector de ejemplos y el reinicio están a la derecha del título “Árbol
  familiar”, dentro del mismo encabezado.
- El zoom comienza en 100 %, admite de 50 % a 130 % y conserva visible el núcleo
  familiar. Al agregar padres o hermanos pasa automáticamente a 90 % para dar
  espacio a las ramas laterales. Al simular en escritorio, mide las personas y
  controles realmente visibles, aplica el mayor zoom entre 50 % y 100 % que
  entra en la mitad izquierda y centra el grupo familiar completo.
- Flechas y zoom forman una barra compacta superpuesta en la esquina superior
  derecha del lienzo. Las teclas de dirección también lo desplazan y el botón
  central vuelve a centrar a la persona fallecida.
- Todas las altas se agrupan alrededor de la tarjeta central: padres arriba,
  cónyuge o pareja a la izquierda, hermanos a la derecha e hijos abajo. Los
  botones ya usados se ocultan para conservar el núcleo compacto.
- Cónyuge y pareja conviviente son alternativas en el caso simplificado: al
  cargar una relación se ocultan ambos botones y elegir matrimonio elimina una
  pareja conviviente previamente cargada.
- Los hermanos se agregan en una única fila que crece hacia la derecha. El rótulo
  breve “Hijos/as” queda a la izquierda de su línea vertical, sin superponerse.
- La tarjeta de la persona fallecida contiene un desplegable directo dedicado
  únicamente a su estado civil.
- Todas las demás preguntas necesarias para el escenario visible están debajo
  del árbol. Se eliminaron el diálogo jurídico adicional y las preguntas
  sobre situación explorada, integridad de la familia, separación de hecho y
  circunstancias especiales. El panel explica el alcance simplificado y deriva
  las excepciones a revisión profesional.
- No se piden nombres, DNI ni importes. Los datos no se persisten ni se envían.
  La infraestructura común del sitio conserva su etiquetado de visitas.
- La consulta abre WhatsApp sin adjuntar datos del escenario. Un botón separado
  genera un informe PDF con el escenario y la distribución estimada; el archivo
  se crea localmente en el navegador.

## Verificación

```sh
node --check js/herencia-engine.js
node --check js/herencia-ui.js
node --check js/herencia-pdf-report.js
node --test tests/herencia-engine.test.cjs tests/herencia-pdf-report.test.cjs
npx tailwindcss -i ./css/tailwind-input.css -o ./css/tailwind-compiled.css --minify
```

33 pruebas del motor y 2 del informe PDF. El motor incluye una matriz de 72 combinaciones que verifica
cuotas y conservación del patrimonio. Cubre ejemplos monetarios independientes,
representación, concurrencias, exclusiones, datos incompletos, límites de alcance
y valores inválidos. La verificación visual requiere un navegador disponible.


Comprobación adicional de interacción sobre DOM (no representa una revisión
visual): se ejecutó `scripts/check-herencia-ui.cjs` con LinkeDOM instalado en un
directorio temporal. Valida los cinco ejemplos, altas/bajas de personas,
comparación, cambio de vínculos, reinicio, porcentajes por tarjeta, aristas de
parentesco, catorce hijos, selector de ejemplo, cambio de base, desplegable
directo de estado civil, panel simplificado, supuestos de alcance y suspensión del
resultado. No se agregaron dependencias de ejecución al sitio.

Para repetirla con una instalación externa de LinkeDOM:

```sh
TB_HERENCIA_DOM_MODULE=/ruta/node_modules/linkedom node scripts/check-herencia-ui.cjs
```

El adaptador provee las APIs DOM estándar que LinkeDOM no implementa. Se prueban
las relaciones entre nodos, pero no el layout físico: LinkeDOM no es un motor de
renderizado. No se modifica el comportamiento de la página real.
