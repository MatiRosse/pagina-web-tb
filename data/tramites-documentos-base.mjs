// Importes publicados por Gestoría Uno para octubre de 2026, consultados el
// 07/10/2026. Solo se toman nombres, importes, modalidades y plazos del catálogo.
// La redacción, presentación y contactos pertenecen a TB Abogados.
const option = (label, price, time, note = '') => ({ label, price, time, note });
const common = (price, time, urgent, urgentTime) => [option('Común', price, time), option('Urgente', urgent, urgentTime)];
const single = (price, time, label = 'Estándar') => [option(label, price, time)];
const services = [];
function add(id, title, category, jurisdiction, options, description, keywords = '', extras = []) {
  services.push({ id, title, category, jurisdiction, options, description, keywords, extras });
}
const caba = 'caba', pba = 'pba', nacional = 'nacional';
for (const [j, prices, times] of [[caba, [23000,38000,23000,32000,15000,25000], ['5–6 días','2–3 días','4–5 días','2–3 días']], [pba, [48000,88000,48000,88000,35000,70000], ['10–12 días','4–6 días','8–10 días','3–6 días']]]) {
  add(`dominio-inmueble-${j}`, 'Informe de dominio de inmueble', 'inmuebles', j, common(prices[0],times[0],prices[1],times[1]), 'Consultá la titularidad y las anotaciones registrales de una propiedad.', 'matricula garantía alquiler hipoteca embargo registro propiedad');
  add(`inhibicion-${j}`, 'Informe de inhibición', 'inmuebles', j, common(prices[2],times[0],prices[3],times[1]), 'Verificá las restricciones registrales de una persona para disponer de sus bienes.', 'anotaciones personales garantía alquiler');
  add(`titularidad-${j}`, 'Índice de titularidad de inmuebles', 'inmuebles', j, common(prices[4],times[2],prices[5],times[3]), 'Averiguá si una persona tiene propiedades en la jurisdicción consultada.', 'libre catastro procrear crédito hipotecario informe 3 755');
}
add('busqueda-inmueble-caba','Búsqueda de inscripción de inmueble','inmuebles',caba,single(28000,'10–12 días'),'Localizá los datos de inscripción registral de una propiedad.','matricula informe 4');
add('consorcio-caba','Titularidad de un consorcio','inmuebles',caba,[],'Consultá las titularidades de las unidades de un edificio.','unidades funcionales informe 4b');
for (const j of [caba,pba]) {
  add(`frecuencia-${j}`,'Informe de frecuencia','inmuebles',j,j===caba?single(23000,'2–3 días'):common(48000,'10–12 días',88000,'4–6 días'),'Consultá las solicitudes recientes de informes de dominio.','garantía alquiler');
  add(`garantia-alquiler-${j}`,'Informes para garantía de alquiler','inmuebles',j,[],'Pedí un presupuesto según los informes que exige tu contrato.','dominio inhibicion frecuencia locacion');
  const opts=j===caba?common(145000,'2 meses',205000,'1 mes'):common(135000,'30–40 días',235000,'12–15 días');
  const visado = {label:'Visado por título de otra jurisdicción o inscripción Ley 22.172, cuando corresponda',price:74524};
  add(`inscripcion-testimonio-${j}`,'Inscripción de testimonio o reglamento','inmuebles',j,opts,'Gestioná la inscripción de un segundo o ulterior testimonio o de un reglamento.','escritura propiedad horizontal',j===pba?[visado]:[]);
  add(`inscripcion-cautelar-${j}`,'Inscripción o ampliación de medida cautelar','inmuebles',j,opts,'Tramitá la anotación de un embargo, inhibición u otra medida judicial.','embargo cautelar',j===caba?[{label:'Adicional sobre el monto de la medida',percent:0.1}]:[{label:'Juzgado de otra jurisdicción: visado del 0,4% del capital; mínimo de referencia',price:74524,percent:0.4}]);
  add(`levantamiento-cautelar-${j}`,'Levantamiento de medida cautelar','inmuebles',j,opts,'Gestioná el levantamiento registral de una medida judicial.','embargo inhibicion',j===pba?[{label:'Juzgado de otra jurisdicción: visado del 0,2% del capital; mínimo de referencia',price:74524,percent:0.2}]:[]);
  add(`caducidad-cautelar-${j}`,'Caducidad de asiento de medida cautelar','inmuebles',j,j===caba?common(170000,'2 meses',240000,'1 mes'):common(180000,'30–40 días',280000,'12–15 días'),'Consultá la gestión de caducidad de una anotación registral.','embargo inhibicion litis',j===pba?[{label:'Puede corresponder visado por juzgado de otra jurisdicción; consultar importe.'}]:[]);
  add(`caducidad-hipoteca-${j}`,'Caducidad de asiento de hipoteca','inmuebles',j,j===caba?common(220000,'2 meses',320000,'1 mes'):common(230000,'30–40 días',350000,'12–15 días'),'Consultá la documentación para tramitar la caducidad registral de una hipoteca.','prescripcion',j===pba?[{label:'Puede corresponder visado por juzgado de otra jurisdicción; consultar importe.'}]:[]);
  add(`declaratoria-${j}`,'Inscripción de declaratoria de herederos','inmuebles',j,[],'Solicitá presupuesto según el expediente, los bienes y la jurisdicción.','sucesion testamento');
}
add('cesiones-pba','Informe de cesiones','inmuebles',pba,common(48000,'10–12 días',88000,'4–6 días'),'Consultá las cesiones registradas a nombre de una persona.','anotaciones personales 753');
add('far-pba','Fotocopia de asiento registral (FAR)','inmuebles',pba,common(48000,'10–12 días',88000,'4–6 días'),'Obtené una copia del asiento de una propiedad.','754 dominio');
add('busqueda-dominio-caba','Búsqueda e informe de dominio','inmuebles',caba,single(35000,'10–12 días'),'Localizá la inscripción y obtené el informe de dominio.','matricula informe 6');
const cadastral = [
 ['cedula-caba','Cédula parcelaria',caba,33000,'3–4 días','Datos catastrales para identificar una parcela.'],
 ['plano-caba','Copia de plano de mensura',caba,38000,'2–3 días','Copia del plano solicitado. Precio por lámina.'],
 ['plancheta-caba','Plancheta de la manzana',caba,8000,'2–3 días','Identificación gráfica de los lotes de una manzana.'],
 ['croquis-caba','Croquis de parcela',caba,8000,'2–3 días','Documentación gráfica de la parcela consultada.'],
 ['perimetro-caba','Perímetro de manzana y ancho de calles',caba,8000,'2–3 días','Información catastral de la manzana y sus calles.'],
 ['partida-abl','Número de partida de ABL',caba,9000,'2–3 días','Identificación de la partida del inmueble ante AGIP.'],
 ['valuacion-caba','Certificado de valuación fiscal',caba,10000,'2–3 días','Valuación fiscal del inmueble ante AGIP.'],
 ['deuda-caba','Certificado de inexistencia de deuda',caba,11000,'3–4 días','Solicitud de certificado ante AGIP / ABL.'],
 ['vir-caba','Informe VIR',caba,5000,'2 días','Consulta del valor inmobiliario de referencia.'],
 ['plancheta-pba','Plancheta y partida de ARBA',pba,11000,'2–3 días','Identificación de la manzana y la partida del lote.'],
 ['cedula-pba','Cédula parcelaria',pba,16000,'2–4 días','Solicitud de la documentación catastral de la parcela.'],
 ['plano-pba','Copia de plano de mensura',pba,40000,'3–4 días','Copia de un plano de lote o propiedad horizontal.'],
 ['valuacion-pba','Valuación fiscal ARBA',pba,16000,'2–3 días','Valuación fiscal del año actual o de períodos anteriores.'],
 ['deuda-pba','Certificado de inexistencia de deuda ARBA',pba,10000,'2–3 días','Solicitud del certificado del inmueble.'],
 ['certificado-catastro-pba','Certificado catastral',pba,27000,'2–3 días','Documentación catastral para una inscripción registral.'],
 ['itgb-pba','Liquidación de declaración jurada ITGB',pba,60000,'4–5 días','Gestión de la declaración del impuesto a la transmisión gratuita de bienes.'],
 ['sellos-pba','Liquidación de declaración jurada de Sellos',pba,35000,'4–5 días','Gestión de la declaración del impuesto de Sellos.']
];
for (const [id,title,j,price,time,description] of cadastral) add(id,title,'catastro',j,single(price,time),description,'catastro arba agip abl inmueble',id==='certificado-catastro-pba'?[{label:'La vigencia del estado parcelario debe verificarse antes de solicitarlo.'}]:[]);
for (const j of [caba,pba]) {
  for (const [slug,title,keywords] of [['nacimiento','Partida de nacimiento','acta ciudadania'],['defuncion','Partida de defunción','acta fallecimiento'],['matrimonio','Partida de matrimonio','acta casamiento']]) {
    const opts=j===caba?[...common(20000,'10–15 días',37000,'2–4 días'),option('Con búsqueda',28000,'15–20 días','Para solicitudes sin todos los datos.')]:[option('Solicitar acta',27000,'8–10 días','Con los datos completos.'),option('Servicio de búsqueda',20000,'15–30 días','Solo búsqueda; la solicitud del acta se cotiza por separado.')];
    add(`${slug}-${j}`,title,'partidas',j,opts,'Gestioná la partida según el registro donde está asentada.',keywords);
  }
}
add('divorcio-caba','Inscripción de divorcio','partidas',caba,[option('Oficio de juzgado de CABA',120000,'20–25 días'),option('Oficio de otra jurisdicción',150000,'20–25 días')],'Registrá la sentencia de divorcio en el acta de matrimonio.','anotacion marginal');
for (const [slug,title,prices] of [['pba','Oficio de juzgado bonaerense',[90000,150000,250000]],['otra','Oficio de otra jurisdicción',[120000,180000,280000]]]) add(`divorcio-pba-${slug}`,`Inscripción de divorcio · ${title.toLowerCase()}`,'partidas',pba,[option('Común',prices[0],'75–90 días'),option('Urgente',prices[1],'30–40 días'),option('Express',prices[2],'7–12 días')],'Gestioná la anotación en el Registro Civil de Provincia de Buenos Aires.','matrimonio sentencia anotacion marginal');
add('apostilla','Apostilla de La Haya','apostillas',nacional,common(40000,'15–20 días',75000,'1–2 días'),'Prepará tus documentos para presentarlos en el exterior. Consultá su aptitud antes de iniciar.','legalizacion cancilleria acta caba provincia nacimiento matrimonio titulo');
add('legalizacion','Legalización ante el Ministerio del Interior','apostillas',nacional,single(30000,'10–20 días'),'Consultá si tu documento requiere esta legalización y qué formato corresponde.','partida acta');
for (const j of [caba,pba]) {
  add(`oficio-registro-civil-${j}`,'Oficios al Registro Civil','judiciales',j,[],'Cotizá el diligenciamiento según el oficio y la solicitud judicial.','juzgado');
  add(`sucesiones-${j}`,'Informe sobre sucesiones','judiciales',j,single(30000,j===caba?'7–10 días':'5–10 días'),'Consultá la existencia de actuaciones sucesorias.','juicios universales');
  add(`quiebras-${j}`,'Informe sobre concursos y quiebras','judiciales',j,single(30000,j===caba?'7–10 días':'5–10 días'),'Solicitud de informe de juicios universales comerciales.','juicios universales');
}
add('cedula-ley','Diligenciamiento de cédula Ley 22.172','judiciales',caba,single(12000,'10–12 días'),'Gestioná la notificación de una cédula judicial en CABA.','notificacion');
add('oficios-caba','Diligenciamiento de oficios','judiciales',caba,single(80000,'10–12 días'),'Solicitud de diligenciamiento ante el destinatario del oficio.','juzgado',[{label:'Se adiciona timbrado si corresponde; consultar importe.'}]);
add('renaper','Oficio a RENAPER','judiciales',nacional,single(55000,'10–15 días'),'Gestión por oficio judicial. Precio por persona consultada.','personas domicilio');
for (const j of [caba,pba]) {
  const extras=j===caba?[{label:'Cada bloque de 50 fojas adicionales, a partir de 30: común',price:22700},{label:'Cada bloque de 50 fojas adicionales, a partir de 30: urgente',price:36100},{label:'Protocolo en delegación Chorroarín',price:31600},{label:'Legalización para otra jurisdicción',price:80000}]:[{label:'Cada foja adicional, a partir de 5: común',price:14350},{label:'Cada foja adicional, a partir de 5: urgente',price:27500},{label:'Legalización para otra jurisdicción',price:80000}];
  extras.push({label:'La inscripción registral del testimonio se presupuesta por separado.'});
  add(`testimonio-particular-${j}`,'Segundo testimonio o reglamento · Particular','escrituras',j,j===caba?common(370000,'20 días',510000,'10 días'):common(350000,'45–60 días',550000,'15–20 días'),'Obtené el testimonio a través del archivo de protocolos notariales.','escritura copia ulterior',extras);
  add(`testimonio-judicial-${j}`,'Segundo testimonio o reglamento · Oficio judicial','escrituras',j,j===caba?single(337000,'20 días'):common(320000,'45–60 días',520000,'15–20 días'),'Solicitud al archivo de protocolos mediante oficio judicial.','escritura ulterior',j===caba?extras.filter(e=>!e.label.includes('50 fojas')):extras);
  add(`copia-escritura-${j}`,'Copia simple de escritura o reglamento','escrituras',j,[option('Con todos los datos',160000,j===caba?'10–15 días':'15–20 días'),option('Sin todos los datos',185000,j===caba?'15–20 días':'20–25 días')],'Pedí una copia simple e indicá los datos disponibles de la escritura.','protocolo escribano');
}
add('testamentos-pba','Informe del Registro de Testamentos','escrituras',pba,single(80000,'20–25 días'),'Solicitud de informe ante el registro correspondiente.','sucesion');
for (const [slug,title,price,description] of [['dominio','Informe de dominio automotor',16000,'Consultá el estado registral de un vehículo por su patente.'],['inhibicion','Informe de inhibición automotor',16000,'Consultá las anotaciones personales de una persona.'],['titularidad','Índice de titularidad automotor',16000,'Averiguá si una persona registra vehículos a su nombre.'],['historico','Informe histórico de dominio automotor',17000,'Consultá el historial registral del vehículo.']]) add(`automotor-${slug}`,title,'automotor',nacional,single(price,'2–3 días'),description,'auto moto patente nominal dnrpa');
add('automotor-inscripcion','Inscripción automotor · Declaratoria, divorcio y otras','automotor',nacional,[],'Cotizá la inscripción según el vehículo y la documentación judicial.','auto moto dnrpa');
add('domicilio-cne','Informe de domicilio · Cámara Nacional Electoral','personas',nacional,single(28000,'15–20 días'),'Solicitud de informe de datos personales según los requisitos del organismo.','nacimiento defuncion ultimo domicilio');
add('no-ciudadano','Certificado de no ciudadano argentino','personas',nacional,single(85000,'40–50 días'),'Gestioná el certificado para tu carpeta documental.','ciudadania italiana española cne');
for (const name of ['Nosis','Veraz']) add(name.toLowerCase(),`Informe ${name}`,'personas',nacional,single(27000,'1 día'),'Solicitud de un reporte comercial, sujeto a los requisitos de acceso.','antecedentes comerciales credito');

export default {
  source: { url:'https://www.gestoriauno.com.ar/tarifas/', consultedAt:'2026-10-07', tariffMonth:'2026-10' },
  // Último IPC mensual publicado al capturar las tarifas. No se aplica de nuevo
  // inflación anterior a esta base ni se usan expectativas o inflación interanual.
  baseMonth:'2026-08',
  currency:'ARS', rounding:1,
  categories: {partidas:'Partidas y Registro Civil',apostillas:'Apostillas y legalizaciones',inmuebles:'Informes de inmuebles',catastro:'Catastro, ARBA y AGIP',escrituras:'Escrituras y testamentos',automotor:'Automotor',judiciales:'Cédulas y oficios',personas:'Informes personales'},
  jurisdictions: {caba:'CABA',pba:'Provincia de Buenos Aires',nacional:'Nacional'},
  services
};
