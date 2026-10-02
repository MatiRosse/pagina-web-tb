// Regenerate the English and Portuguese homepages from the Spanish home view.
// Run after rebuilding the homepage's scoped CSS when utility classes change.
// --check verifies that the published copies still match the source and translations.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const translations = {
  'Inicio': ['Home', 'Início'],
  'Servicios': ['Services', 'Serviços'],
  'Marcas': ['Trademarks', 'Marcas'],
  'Despidos': ['Dismissals', 'Demissões'],
  'Diferencias Salariales': ['Salary Differences', 'Diferenças Salariais'],
  'Sucesiones': ['Probate', 'Sucessões'],
  'Divorcios': ['Divorce', 'Divórcios'],
  'Mediaciones': ['Mediation', 'Mediações'],
  'Jubilaciones': ['Retirement', 'Aposentadorias'],
  'Alquileres': ['Leases', 'Locações'],
  'Reclamos de Consumo': ['Consumer Claims', 'Reclamações de Consumo'],
  'Aerolíneas': ['Airlines', 'Companhias Aéreas'],
  'Bancos y Finanzas': ['Banking and Finance', 'Bancos e Finanças'],
  'Accidentes de Tránsito': ['Traffic Accidents', 'Acidentes de Trânsito'],
  'Accidentes de Trabajo': ['Workplace Accidents', 'Acidentes de Trabalho'],
  'Calculadoras': ['Calculators', 'Calculadoras'],
  'Sueldo Bruto a Neto': ['Gross-to-Net Salary', 'Salário Bruto para Líquido'],
  'Aguinaldo (SAC)': ['Annual Bonus (SAC)', 'Gratificação (SAC)'],
  'Simulador de herencia': ['Inheritance simulator', 'Simulador de herança'],
  'Indemnización por Despido': ['Severance Pay', 'Indenização por Demissão'],
  'Accidente de Trabajo': ['Workplace Accident', 'Acidente de Trabalho'],
  'Calculadora Alquiler': ['Rent Calculator', 'Calculadora de Aluguel'],
  'Calculadora Jubilación': ['Retirement Calculator', 'Calculadora de Aposentadoria'],
  'Guías Legales': ['Legal Guides', 'Guias Jurídicos'],
  'Nosotros': ['About Us', 'Sobre Nós'],
  'Contacto': ['Contact', 'Contato'],
  'Dif. Salariales': ['Salary Differences', 'Dif. Salariais'],
  'Reclamos de consumo': ['Consumer claims', 'Reclamações de consumo'],
  'Bancos y finanzas': ['Banking and finance', 'Bancos e finanças'],
  'Accidente tránsito': ['Traffic accident', 'Acidente de trânsito'],
  'Accidente trabajo': ['Workplace accident', 'Acidente de trabalho'],
  'Ver todos los servicios...': ['View all services...', 'Ver todos os serviços...'],
  'Idioma': ['Language', 'Idioma'],
  'ES': ['EN', 'PT'],
  'Más de 30 años de experiencia': ['More than 30 years of experience', 'Mais de 30 anos de experiência'],
  'Estudio Jurídico': ['Law Firm', 'Escritório de Advocacia'],
  'Somos un estudio jurídico ubicado en zona Tribunales (CABA). Brindamos asesoramiento legal con abogados especialistas en distintas áreas del derecho.': [
    'We are a law firm located in the Tribunales district of Buenos Aires City (CABA). We provide legal advice through attorneys specializing in different areas of law.',
    'Somos um escritório de advocacia localizado na região de Tribunales, na Cidade Autônoma de Buenos Aires (CABA). Oferecemos assessoria jurídica com advogados especializados em diferentes áreas do direito.'
  ],
  'Atención presencial y consultas virtuales en todo el país.': ['In-person service and virtual consultations throughout the country.', 'Atendimento presencial e consultas virtuais em todo o país.'],
  'Consultar por WhatsApp': ['Consult via WhatsApp', 'Consultar pelo WhatsApp'],
  'Ver Especialidades': ['View Specialties', 'Ver Especialidades'],
  'Derecho Laboral': ['Labor Law', 'Direito do Trabalho'],
  'Defendemos tus derechos': ['We defend your rights', 'Defendemos seus direitos'],
  'Reclamos laborales, Despidos, diferencias salariales y accidentes.': ['Labor claims, dismissals, salary differences and accidents.', 'Reclamações trabalhistas, demissões, diferenças salariais e acidentes.'],
  'Ver área Laboral': ['View Labor Law', 'Ver Área Trabalhista'],
  'Familia y Sucesiones': ['Family Law and Probate', 'Família e Sucessões'],
  'Tranquilidad familiar': ['Peace of mind for your family', 'Tranquilidade familiar'],
  'Gestionamos sucesiones de forma rápida. Asesoramiento en divorcios, alimentos y otros asuntos de familia.': [
    'We handle probate proceedings promptly. Advice on divorce, support payments and other family matters.',
    'Cuidamos de processos sucessórios com rapidez. Assessoria em divórcios, pensão alimentícia e outros assuntos de família.'
  ],
  'Ver Familia y Sucesiones': ['View Family Law and Probate', 'Ver Família e Sucessões'],
  'Registro y protección de marcas': ['Trademark registration and protection', 'Registro e proteção de marcas'],
  'Asesoramiento en registro de marcas ante el INPI, oposiciones, transferencias y defensa de derechos marcarios.': [
    'Advice on trademark registration before INPI, oppositions, transfers and the defense of trademark rights.',
    'Assessoria em registro de marcas perante o INPI, oposições, transferências e defesa de direitos de marca.'
  ],
  'Ver Marcas': ['View Trademarks', 'Ver Marcas'],
  'Civil y Comercial': ['Civil and Commercial Law', 'Civil e Comercial'],
  'Asesoramiento y representación': ['Advice and representation', 'Assessoria e representação'],
  'Alquileres, accidentes de tránsito, incumplimientos contractuales y reclamos por daños y perjuicios.': [
    'Leases, traffic accidents, breaches of contract and claims for damages.',
    'Locações, acidentes de trânsito, descumprimentos contratuais e pedidos de indenização por perdas e danos.'
  ],
  'Ver Civil y Comercial': ['View Civil and Commercial Law', 'Ver Civil e Comercial'],
  'Jubilaciones y pensiones': ['Retirement and pensions', 'Aposentadorias e pensões'],
  'Asesoramiento previsional': ['Pension advice', 'Assessoria previdenciária'],
  'Gestión de jubilaciones, pensiones, reajustes y asesoramiento en trámites ante ANSES.': [
    'Handling retirement and pension applications, benefit adjustments and advice on proceedings before ANSES.',
    'Gestão de aposentadorias, pensões, reajustes e assessoria em procedimentos perante a ANSES.'
  ],
  'Ver Jubilaciones': ['View Retirement', 'Ver Aposentadorias'],
  'Resolución rápida': ['Prompt resolution', 'Resolução rápida'],
  'Mediación pre-judicial obligatoria. Acuerdos extrajudiciales ágiles y efectivos.': [
    'Mandatory pre-litigation mediation. Prompt and effective out-of-court agreements.',
    'Mediação pré-judicial obrigatória. Acordos extrajudiciais ágeis e eficazes.'
  ],
  'Ver Mediaciones': ['View Mediation', 'Ver Mediações'],
  'Años Litigando': ['Years of Litigation', 'Anos de Atuação em Litígios'],
  'QUÉ HACEMOS': ['WHAT WE DO', 'O QUE FAZEMOS'],
  'Asesoramiento legal': ['Legal advice', 'Assessoria jurídica'],
  'personalizado': ['personalized', 'personalizada'],
  'y compromiso en': ['and commitment to', 'e compromisso com'],
  'cada caso': ['every case', 'cada caso'],
  'Nuestro equipo combina trayectoria y nuevas generaciones de abogados para ofrecer soluciones jurídicas claras y eficaces.': [
    'Our team combines experience with new generations of attorneys to offer clear and effective legal solutions.',
    'Nossa equipe combina experiência e novas gerações de advogados para oferecer soluções jurídicas claras e eficazes.'
  ],
  'Intervenimos en asuntos laborales, sucesiones, derecho civil y comercial, jubilaciones y pensiones, mediaciones y registro de marcas.': [
    'We handle labor matters, probate, civil and commercial law, retirement and pensions, mediation and trademark registration.',
    'Atuamos em assuntos trabalhistas, sucessões, direito civil e comercial, aposentadorias e pensões, mediações e registro de marcas.'
  ],
  'Conocé a todo': ['Meet all of', 'Conheça toda'],
  'nuestro equipo de especialistas': ['our team of specialists', 'nossa equipe de especialistas'],
  'Áreas especializadas': ['Specialized areas', 'Áreas especializadas'],
  'Asesoramiento en despidos sin causa, cálculo de indemnizaciones y reclamos laborales.': [
    'Advice on dismissals without cause, severance calculations and labor claims.',
    'Assessoria em demissões sem justa causa, cálculo de indenizações e reclamações trabalhistas.'
  ],
  'Facilitamos el trámite sucesorio con un enfoque humano y eficiente. Nos ocupamos de toda la gestión legal para que los herederos puedan regularizar inmuebles y otros bienes sin complicaciones.': [
    'We simplify probate proceedings with a humane and efficient approach. We handle all legal matters so heirs can regularize ownership of real estate and other assets without complications.',
    'Facilitamos o processo sucessório com uma abordagem humana e eficiente. Cuidamos de toda a gestão jurídica para que os herdeiros possam regularizar imóveis e outros bens sem complicações.'
  ],
  'Registro de Marcas': ['Trademark Registration', 'Registro de Marcas'],
  'Te asesoramos en el registro y protección de tu marca. Gestionamos trámites ante el INPI, solicitud y seguimiento del registro, oposiciones, renovaciones, transferencias y conflictos marcarios.': [
    'We advise you on registering and protecting your trademark. We handle proceedings before INPI, registration applications and follow-up, oppositions, renewals, transfers and trademark disputes.',
    'Orientamos você no registro e na proteção da sua marca. Cuidamos de procedimentos perante o INPI, pedido e acompanhamento do registro, oposições, renovações, transferências e conflitos de marcas.'
  ],
  'Analizamos tu caso y te asesoramos para reclamar ante la ART o el empleador y obtener la indemnización que te corresponde.': [
    'We analyze your case and advise you on making a claim against the occupational risk insurer (ART) or your employer to obtain the compensation you are entitled to.',
    'Analisamos seu caso e orientamos você para apresentar uma reclamação perante a seguradora de riscos do trabalho (ART) ou o empregador e obter a indenização a que tem direito.'
  ],
  'Aerolíneas y servicios bancarios o financieros.': ['Airlines and banking or financial services.', 'Companhias aéreas e serviços bancários ou financeiros.'],
  'Te acompañamos en cada etapa del alquiler. Si sos propietario o inquilino, te asesoramos en contratos, renovaciones y conflictos locativos. Evitá problemas legales con documentos claros y seguros.': [
    'We support you at every stage of a lease. Whether you are a landlord or a tenant, we advise you on contracts, renewals and rental disputes. Avoid legal problems with clear and secure documents.',
    'Acompanhamos você em cada etapa da locação. Se você é proprietário ou inquilino, orientamos sobre contratos, renovações e conflitos locatícios. Evite problemas jurídicos com documentos claros e seguros.'
  ],
  'Acompañamiento claro y humano. Gestionamos divorcios de común acuerdo o contenciosos, y acuerdos sobre responsabilidad parental, alimentos y bienes.': [
    'Clear and compassionate support. We handle divorce by mutual agreement or contested divorce, and agreements on parental responsibility, support payments and assets.',
    'Acompanhamento claro e humano. Cuidamos de divórcios consensuais ou litigiosos e de acordos sobre responsabilidade parental, pensão alimentícia e bens.'
  ],
  'Resolvé tu conflicto sin juicio. Acuerdos rápidos, confidenciales y económicos con nuestra intervención profesional.': [
    'Resolve your dispute without going to court. Prompt, confidential and affordable agreements with our professional assistance.',
    'Resolva seu conflito sem processo judicial. Acordos rápidos, confidenciais e econômicos com nossa atuação profissional.'
  ],
  'Te asesoramos en jubilaciones y pensiones. Gestionamos trámites ante ANSES y reclamos por reajuste de haberes.': [
    'We advise you on retirement and pensions. We handle proceedings before ANSES and claims for benefit adjustments.',
    'Orientamos você sobre aposentadorias e pensões. Cuidamos de procedimentos perante a ANSES e de pedidos de reajuste de benefícios.'
  ],
  'Analizamos tus recibos de sueldo, calculamos las diferencias salariales y te acompañamos en el reclamo de lo que te corresponde.': [
    'We analyze your payslips, calculate salary differences and support you in claiming what you are entitled to.',
    'Analisamos seus recibos de salário, calculamos as diferenças salariais e acompanhamos você na reivindicação do que lhe é devido.'
  ],
  'Reclamá tu indemnización con respaldo legal y rapidez. Te acompañamos desde la denuncia del siniestro hasta el cobro que te corresponde.': [
    'Claim your compensation promptly and with legal support. We assist you from reporting the accident through to receiving the payment you are entitled to.',
    'Reivindique sua indenização com respaldo jurídico e rapidez. Acompanhamos você desde a comunicação do sinistro até o recebimento do valor a que tem direito.'
  ],
  'Ver todos los servicios': ['View all services', 'Ver todos os serviços'],
  'NUESTROS VALORES': ['OUR VALUES', 'NOSSOS VALORES'],
  '¿Por qué elegirnos?': ['Why choose us?', 'Por que nos escolher?'],
  'Calidez Familiar': ['Family Warmth', 'Acolhimento Familiar'],
  'Al ser un estudio familiar, creamos un ambiente cálido y confiable.': [
    'As a family-run law firm, we create a warm and trustworthy environment.',
    'Como um escritório familiar, criamos um ambiente acolhedor e confiável.'
  ],
  'Cada cliente es parte de nuestra familia legal': ['Every client is part of our legal family', 'Cada cliente faz parte da nossa família jurídica'],
  'Equipo Multidisciplinario': ['Multidisciplinary Team', 'Equipe Multidisciplinar'],
  'Formado por abogados de diversas especialidades, lo que nos permite atender tus': [
    'Made up of attorneys from different specialties, allowing us to address your',
    'Formada por advogados de diversas especialidades, o que nos permite atender suas'
  ],
  'necesidades con mirada integral.': ['needs with a comprehensive perspective.', 'necessidades com uma visão integral.'],
  'Atención Personalizada': ['Personalized Service', 'Atendimento Personalizado'],
  'Mantenemos una comunicación directa y fluida, informando el estado de tu caso y brindando asesoramiento adaptado para ofrecerte soluciones a medida.': [
    'We maintain direct and smooth communication, keeping you informed of the status of your case and providing personalized advice to offer solutions tailored to you.',
    'Mantemos uma comunicação direta e fluida, informando sobre o andamento do seu caso e oferecendo assessoria adaptada para proporcionar soluções sob medida.'
  ],
  'Soluciones Efectivas': ['Effective Solutions', 'Soluções Eficazes'],
  'Nuestro objetivo es obtener el mejor resultado posible encontrando la solución jurídica más adecuada para cada caso.': [
    'Our goal is to achieve the best possible outcome by finding the most suitable legal solution for each case.',
    'Nosso objetivo é obter o melhor resultado possível, encontrando a solução jurídica mais adequada para cada caso.'
  ],
  'CONFIANZA Y RESULTADOS': ['TRUST AND RESULTS', 'CONFIANÇA E RESULTADOS'],
  'Lo que dicen nuestros clientes': ['What our clients say', 'O que dizem nossos clientes'],
  'Excelente 5.0 de 5': ['Excellent, 5.0 out of 5', 'Excelente, 5,0 de 5'],
  'Basado en': ['Based on', 'Com base em'],
  '50 opiniones en Google Maps': ['50 Google Maps reviews', '50 avaliações no Google Maps'],
  '"Gracias por la confidencialidad, profesionalismo y dedicación. Hacen un gran equipo! Excelente servicio"': [
    '"Thank you for your confidentiality, professionalism and dedication. You make a great team! Excellent service"',
    '"Obrigada pela confidencialidade, profissionalismo e dedicação. Vocês formam uma ótima equipe! Excelente serviço"'
  ],
  'Hace 4 meses': ['4 months ago', 'Há 4 meses'],
  '"100% recomendable! Resolvieron mí trámite de divorcio en tiempo récord y con eficiencia. Las dos partes quedamos conformes. Todo salió muy bien. Gracias 🫂"': [
    '"100% recommended! They handled my divorce proceedings in record time and efficiently. Both parties were satisfied. Everything went very well. Thank you 🫂"',
    '"100% recomendável! Resolveram meu processo de divórcio em tempo recorde e com eficiência. Ambas as partes ficaram satisfeitas. Tudo correu muito bem. Obrigado 🫂"'
  ],
  '"Excelente servicio! Muchas gracias por la gestión de mis marcas. Llevo años trabajando con ellos. Super recomendables y profesionales. Saludos"': [
    '"Excellent service! Thank you so much for managing my trademarks. I have been working with them for years. Highly recommended and professional. Best regards"',
    '"Excelente serviço! Muito obrigado pela gestão das minhas marcas. Trabalho com eles há anos. Super recomendáveis e profissionais. Saudações"'
  ],
  'Hace 2 semanas': ['2 weeks ago', 'Há 2 semanas'],
  'En defensa de tus derechos. Estudio jurídico con más de 30 años acompañando a nuestros clientes con excelencia, integridad y resultados reales en CABA y toda Argentina.': [
    'Defending your rights. A law firm with more than 30 years supporting our clients with excellence, integrity and real results in Buenos Aires City (CABA) and throughout Argentina.',
    'Em defesa dos seus direitos. Escritório de advocacia com mais de 30 anos acompanhando nossos clientes com excelência, integridade e resultados reais em CABA e em toda a Argentina.'
  ],
  'Enlaces Rápidos': ['Quick Links', 'Links Rápidos'],
  'Estudio': ['Firm', 'Escritório'],
  'Áreas de Práctica': ['Practice Areas', 'Áreas de Atuação'],
  'Calculadoras Legales': ['Legal Calculators', 'Calculadoras Jurídicas'],
  'Contáctenos': ['Contact Us', 'Fale Conosco'],
  'C1017 Cdad. Autónoma de Buenos Aires': ['C1017 Autonomous City of Buenos Aires', 'C1017 Cidade Autônoma de Buenos Aires'],
  '© 2026 TB ABOGADOS (Estudio Tassara &amp; Bulgheroni). Todos los derechos reservados.': [
    '© 2026 TB ABOGADOS (Tassara &amp; Bulgheroni Law Firm). All rights reserved.',
    '© 2026 TB ABOGADOS (Escritório Tassara &amp; Bulgheroni). Todos os direitos reservados.'
  ],
  'Términos y Condiciones': ['Terms and Conditions', 'Termos e Condições'],
  'Política de Privacidad': ['Privacy Policy', 'Política de Privacidade'],
  'En línea': ['Online', 'Online'],
  'Hola 👋': ['Hello 👋', 'Olá 👋'],
  '¿Buscás asesoramiento legal?': ['Do you need legal advice?', 'Precisa de assessoria jurídica?'],
  'Estudio Tassara & Bulgheroni': ['Tassara & Bulgheroni Law Firm', 'Escritório Tassara & Bulgheroni'],
  'Despidos, Trabajo en negro, Diferencias Salariales, Accidentes de Trabajo (ART)': ['Dismissals, Unregistered Employment, Salary Differences, Workplace Accidents (ART)', 'Demissões, Trabalho sem Registro, Diferenças Salariais, Acidentes de Trabalho (ART)'],
  'Sucesiones, Divorcios, Alimentos, Compensación Económica': ['Probate, Divorce, Support Payments, Financial Compensation', 'Sucessões, Divórcios, Pensão Alimentícia, Compensação Econômica'],
  'Registro de Marcas, Contratos, Alquileres, Daños y Perjuicios': ['Trademark Registration, Contracts, Leases, Damages', 'Registro de Marcas, Contratos, Locações, Perdas e Danos'],
  'Abrir menú de navegación': ['Open navigation menu', 'Abrir menu de navegação'],
  'Mostrar reclamos de consumo': ['Show consumer claims', 'Mostrar reclamações de consumo'],
  'Seleccionar idioma': ['Select language', 'Selecionar idioma'],
  'Logo TB Abogados': ['TB Abogados logo', 'Logo TB Abogados'],
  'Slide anterior': ['Previous slide', 'Slide anterior'],
  'Slide siguiente': ['Next slide', 'Próximo slide'],
  'Servicios anteriores': ['Previous services', 'Serviços anteriores'],
  'Servicios siguientes': ['Next services', 'Próximos serviços'],
  'Visita nuestro Facebook': ['Visit our Facebook page', 'Visite nosso Facebook'],
  'Visita nuestro Instagram': ['Visit our Instagram profile', 'Visite nosso Instagram'],
  'Síguenos en LinkedIn': ['Follow us on LinkedIn', 'Siga-nos no LinkedIn'],
  'Perfil': ['Profile', 'Perfil'],
  'Escribí tu mensaje acá...': ['Type your message here...', 'Escreva sua mensagem aqui...'],
  'Enviar': ['Send', 'Enviar'],
  'Abrir WhatsApp': ['Open WhatsApp', 'Abrir WhatsApp']
};

const metadata = {
  en: {
    title: 'Full-Service Law Firm | More than 30 years of experience | TB Abogados ⚖️',
    description: 'Full-service law firm in Argentina with more than 30 years of experience. Attorneys specializing in labor law, family law, probate, trademarks and damages.',
    socialDescription: 'Full-service law firm in Argentina with more than 30 years of experience. Specialists in labor law, family law, probate, trademarks, retirement, mediation and damages.'
  },
  pt: {
    title: 'Escritório de Advocacia Integral | Mais de 30 anos de experiência | TB Abogados ⚖️',
    description: 'Escritório de advocacia integral na Argentina com mais de 30 anos de experiência. Advogados especializados em direito do trabalho, família, sucessões, marcas e danos.',
    socialDescription: 'Escritório de advocacia integral na Argentina com mais de 30 anos de experiência. Especialistas em direito do trabalho, família, sucessões, marcas, aposentadorias, mediações e danos.'
  }
};

function homeOnly(source) {
  const start = source.indexOf('<section class="view-section active" id="view-home">');
  if (start < 0) throw new Error('Spanish home view not found');
  let depth = 0;
  let end;
  for (const match of source.slice(start).matchAll(/<\/?section\b[^>]*>/g)) {
    depth += match[0].startsWith('</') ? -1 : 1;
    if (depth === 0) { end = start + match.index + match[0].length; break; }
  }
  if (!end) throw new Error('Spanish home view is incomplete');
  return (source.slice(0, source.indexOf('<main id="main-content"'))
    + '<main id="main-content" class="flex-grow w-full">\n        '
    + source.slice(start, end) + '\n    </main>\n\n    '
    + source.slice(source.indexOf('<footer')))
    .replace(/\s*<script>\s*window\.__TB_CALCULADORAS_SRC[\s\S]*?<\/script>/, '');
}

function translate(source, lang) {
  const index = lang === 'en' ? 0 : 1;
  const dictionary = Object.fromEntries(Object.entries(translations).map(([key, values]) => [key, values[index]]));
  dictionary[source.match(/<title>([^<]+)<\/title>/)[1]] = metadata[lang].title;
  const unchanged = new Set(['TB ABOGADOS', 'TB Abogados', 'Tassara', '&amp;', 'Bulgheroni', '+30', '.',
    'Ana S.', 'Claudio B.', 'Elvis A.', 'Paraná 439,', '+54 9 11 2251-1243', 'consultas@tbabogados.com.ar',
    '×', 'Español', 'English', 'Português']);
  const protectedBlocks = [];
  let html = source.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, block => {
    protectedBlocks.push(block);
    return `<tb-protected data-block="${protectedBlocks.length - 1}"></tb-protected>`;
  });
  html = html.replace(/>([^<>]+)</g, (match, raw) => {
    const key = raw.trim().replace(/\s+/g, ' ');
    if (!Object.hasOwn(dictionary, key)) {
      if (key && !unchanged.has(key)) throw new Error(`Missing ${lang} translation: ${key}`);
      return match;
    }
    return `>${raw.match(/^\s*/)[0]}${dictionary[key]}${raw.match(/\s*$/)[0]}<`;
  });
  html = html.replace(/\b(alt|aria-label|placeholder|title)="([^"]*)"/g,
    (match, attribute, value) => Object.hasOwn(dictionary, value) ? `${attribute}="${dictionary[value]}"` : match);
  html = html.replace(/<tb-protected data-block="(\d+)"><\/tb-protected>/g,
    (_, block) => protectedBlocks[Number(block)]);

  // Move the adjective before the noun while keeping the same heading markup.
  if (lang === 'en') html = html.replace('Legal advice <span class="text-[#9e7f44]">personalized</span>', 'Personalized <span class="text-[#9e7f44]">legal advice</span>');

  html = html.replace(/\b(href|src)="([^"]+)"/g, (match, attribute, value) => {
    if (!value || /^(?:[a-z]+:|\/|#)/i.test(value)) return match;
    return `${attribute}="../${value.replace(/^\.\//, '')}"`;
  });
  // Inline styles and the legacy calculator bookmark also resolve from /en/ or /pt/.
  html = html.replace(/url\((['"]?)(?:\.\/)?assets\//g, 'url($1../assets/');
  html = html.replace("window.location.replace('./servicios/calculadoras/')", "window.location.replace('../servicios/calculadoras/')");

  const localized = new Set(['', 'nosotros', 'contacto', 'dra-bulgheroni', 'dr-bulgheroni', 'dra-tassara', 'servicios/marcas']);
  html = html.replace(/<a\b[^>]*>/g, tag => {
    if (/\bdata-language=/.test(tag)) return tag;
    return tag.replace(/href="\.\.\/([^"?#]*)([?#][^"]*)?"/, (match, pathname, suffix = '') => {
      const base = pathname.replace(/\/$/, '');
      return localized.has(base) ? `href="../${base ? `${base}/` : ''}${lang}/${suffix}"` : match;
    });
  });
  html = html.replace(/<a\b[^>]*data-language="(es|en|pt)"[^>]*>/g, (tag, option) => {
    const active = option === lang;
    const desktop = tag.includes('role="menuitem"');
    const classes = desktop
      ? active ? 'block px-4 py-2 text-base text-gold font-medium hover:bg-gold-light' : 'block px-4 py-2 text-base text-gray-700 hover:bg-gold-light hover:text-gold'
      : active ? 'text-gold block py-1' : 'text-gray-300 hover:text-gold block py-1';
    return tag.replace(/ aria-current="page"/, '')
      .replace(/class="[^"]*"/, `class="${classes}"`)
      .replace(/>$/, `${active ? ' aria-current="page"' : ''}>`);
  });
  html = html.replace(/(<button\b[^>]*(?:home-language-button|id="mob-languages-btn")[^>]*>\s*<span class="language-flag language-flag--)ar/g,
    `$1${lang === 'en' ? 'us' : 'br'}`);
  html = html.replace(/(https:\/\/wa\.me\/\d+\?text=)[^"]+/g,
    (_, url) => url + encodeURIComponent(lang === 'en' ? 'Hello! I would like to make a legal inquiry' : 'Olá! Quero fazer uma consulta jurídica'));

  const url = `https://tbabogados.com.ar/${lang}/`;
  const copy = metadata[lang];
  html = html.replace(/<html lang="[^"]+"/, `<html lang="${lang === 'en' ? 'en' : 'pt-BR'}"`)
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${copy.title}</title>`)
    .replace(/(<meta name="description" content=")[^"]*/, `$1${copy.description}`)
    .replace(/<link href="[^"]+" rel="canonical" \/>/, `<link href="${url}" rel="canonical" />`)
    .replace(/(<meta property="og:locale" content=")[^"]*/, `$1${lang === 'en' ? 'en_US' : 'pt_BR'}`)
    .replace(/(<meta property="og:url" content=")[^"]*/, `$1${url}`)
    .replace(/(<meta (?:property="og:title"|name="twitter:title") content=")[^"]*/g, `$1${copy.title}`)
    .replace(/(<meta (?:property="og:description"|name="twitter:description") content=")[^"]*/g, `$1${copy.socialDescription}`);
  html = html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g, (_, raw) => {
    const schema = JSON.parse(raw);
    const translateValue = value => {
      if (typeof value === 'string') return dictionary[value] || value;
      if (Array.isArray(value)) return value.map(translateValue);
      if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, translateValue(item)]));
      return value;
    };
    const translated = translateValue(schema);
    translated.url = url;
    // The firm has one stable identity shared by all language versions.
    return `<script type="application/ld+json">\n${JSON.stringify(translated, null, 2)}\n    </script>`;
  });
  return html;
}

const source = homeOnly(fs.readFileSync(path.join(root, 'index.html'), 'utf8'));
for (const lang of ['en', 'pt']) {
  const target = path.join(root, lang, 'index.html');
  const html = translate(source, lang);
  if (process.argv.includes('--check')) {
    if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== html) {
      throw new Error(`${lang}/index.html is out of date; run node scripts/sync-home-translations.mjs`);
    }
  } else {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, html);
  }
}
console.log(process.argv.includes('--check') ? 'OK: both translated homepages match the Spanish home view.' : 'Generated en/index.html and pt/index.html from the Spanish home view.');
