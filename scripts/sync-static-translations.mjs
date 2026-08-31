import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const common = {
  en: {
    'Inicio': 'Home', 'Servicios': 'Services', 'Marcas': 'Trademarks', 'Despidos': 'Dismissals',
    'Diferencias Salariales': 'Salary Differences', 'Sucesiones': 'Probate', 'Divorcios': 'Divorce',
    'Mediaciones': 'Mediation', 'Jubilaciones': 'Retirement', 'Alquileres': 'Leases',
    'Reclamos de Consumo': 'Consumer Claims', 'Aerolíneas': 'Airlines', 'Bancos y Finanzas': 'Banking and Finance',
    'Accidentes de Tránsito': 'Traffic Accidents', 'Accidentes de Trabajo': 'Workplace Accidents',
    'Calculadoras': 'Calculators', 'Sueldo Bruto a Neto': 'Gross-to-Net Salary',
    'Indemnización por Despido': 'Severance Pay', 'Accidente de Trabajo': 'Workplace Accident',
    'Calculadora Alquiler': 'Rent Calculator', 'Calculadora Jubilación': 'Retirement Calculator',
    'Guías Legales': 'Legal Guides', 'Nosotros': 'About Us', 'Contacto': 'Contact',
    'Dif. Salariales': 'Salary Differences', 'Reclamos de consumo': 'Consumer claims',
    'Bancos y finanzas': 'Banking and finance', 'Accidente tránsito': 'Traffic accident',
    'Accidente trabajo': 'Workplace accident', 'Ver todos los servicios...': 'View all services...',
    '🇦🇷': '🇬🇧', 'ES': 'EN', '🇦🇷 Idioma': '🇬🇧 Language',
    'TB Abogados': 'TB Abogados', 'Enlaces Rápidos': 'Quick Links', 'Estudio': 'Firm',
    'Áreas de Práctica': 'Practice Areas', 'Calculadoras Legales': 'Legal Calculators', 'Contáctenos': 'Contact Us',
    'C1017 Cdad. Autónoma de Buenos Aires': 'C1017 Buenos Aires, Argentina',
    'En defensa de tus derechos. Estudio jurídico con más de 30 años acompañando a nuestros clientes con excelencia, integridad y resultados reales en CABA y toda Argentina.': 'Defending your rights. A law firm with more than 30 years of experience serving clients with excellence, integrity and real results in Buenos Aires and throughout Argentina.',
    '© 2026 TB ABOGADOS (Estudio Tassara &amp; Bulgheroni). Todos los derechos reservados.': '© 2026 TB ABOGADOS (Tassara &amp; Bulgheroni Law Firm). All rights reserved.',
    'Términos y Condiciones': 'Terms and Conditions', 'Política de Privacidad': 'Privacy Policy',
    'En línea': 'Online', 'Hola 👋': 'Hello 👋', '¿Buscás asesoramiento legal?': 'Do you need legal advice?',
    'Nosotros | TB Abogados': 'About Us | TB Abogados',
    'Conocé al equipo de TB Abogados, abogados especialistas con trayectoria y enfoque estratégico en Argentina.': 'Meet the TB Abogados team: experienced attorneys offering strategic legal advice in Argentina.',
    'Socia Abogada': 'Partner Attorney', 'Socio Abogado': 'Partner Attorney',
    'Universidad de Buenos Aires (UBA)': 'University of Buenos Aires (UBA)',
    'Estudio Tassara & Bulgheroni (TB Abogados)': 'Tassara & Bulgheroni Law Firm (TB Abogados)',
    'Matrícula CPACF': 'CPACF Bar Registration', 'Matrícula INPI': 'INPI Registration',
    'Matrícula CTPCBA': 'CTPCBA Registration', 'Matrícula PBA - CAJDM': 'PBA Bar Registration - CAJDM',
    'Perfil oficial de traductor público': 'Official public translator profile',
    'Derecho del Consumidor': 'Consumer Law', 'Reclamos de Consumo': 'Consumer Claims',
    'Transporte Aéreo': 'Air Transport', 'Propiedad Industrial': 'Industrial Property', 'Propiedad industrial': 'Industrial property',
    'Registro de Marcas': 'Trademark Registration', 'Registro de marcas': 'Trademark registration',
    'Derecho Civil': 'Civil Law', 'Derecho civil': 'Civil law',
    'Derecho Comercial': 'Commercial Law', 'Derecho comercial': 'Commercial law',
    'Traducción Pública': 'Public Translation', 'Traducción pública': 'Public translation',
    'Asesoramiento Legal': 'Legal Advice', 'Asesoramiento legal': 'Legal advice',
    'Derecho Laboral': 'Labor Law', 'Derecho laboral': 'Labor law',
    'Sucesiones y Familia': 'Probate and Family Law', 'Sucesiones y familia': 'Probate and family law',
    'Seguros': 'Insurance',
    'Asesoramiento legal en registro, oposición, defensa y vigilancia marcaria ante el INPI en Argentina.': 'Legal advice on trademark registration, oppositions, enforcement and monitoring before the INPI in Argentina.',
    'Registro y defensa de marcas': 'Trademark Registration and Enforcement',
    'Oposiciones marcarias': 'Trademark oppositions', 'Vigilancia marcaria': 'Trademark monitoring',
    'Dra. Florencia Bulgheroni': 'Florencia Bulgheroni',
    'Abogada y Agente de la Propiedad Industrial': 'Attorney and Industrial Property Agent',
    'Matrícula profesional': 'Professional Registration',
    'Agente de la Propiedad Industrial': 'Industrial Property Agent',
    'Dr. Daniel Bulgheroni': 'Daniel Bulgheroni', 'Abogado': 'Attorney',
    'Dra. Victoria Tassara': 'Victoria Tassara', 'Abogada y mediadora': 'Attorney and Mediator',
    'Ciudad Autónoma de Buenos Aires': 'Buenos Aires, Argentina', 'Spanish': 'English',
    'Gracias por la confidencialidad, profesionalismo y dedicación. Hacen un gran equipo! Excelente servicio': 'Thank you for your confidentiality, professionalism and dedication. You make a great team! Excellent service.',
    'Excelente servicio! Muchas gracias por la gestión de mis marcas. Llevo años trabajando con ellos. Super recomendables y profesionales. Saludos': 'Excellent service! Thank you for managing my trademarks. I have worked with them for years. Highly recommended and professional.',
    'Excelente servicio, todos muy amables y eficientes': 'Excellent service; everyone is very kind and efficient.'
  },
  pt: {
    'Inicio': 'Início', 'Servicios': 'Serviços', 'Marcas': 'Marcas', 'Despidos': 'Rescisões',
    'Diferencias Salariales': 'Diferenças Salariais', 'Sucesiones': 'Sucessões', 'Divorcios': 'Divórcios',
    'Mediaciones': 'Mediações', 'Jubilaciones': 'Aposentadorias', 'Alquileres': 'Locações',
    'Reclamos de Consumo': 'Reclamações de Consumo', 'Aerolíneas': 'Companhias Aéreas', 'Bancos y Finanzas': 'Bancos e Finanças',
    'Accidentes de Tránsito': 'Acidentes de Trânsito', 'Accidentes de Trabajo': 'Acidentes de Trabalho',
    'Calculadoras': 'Calculadoras', 'Sueldo Bruto a Neto': 'Salário Bruto para Líquido',
    'Indemnización por Despido': 'Indenização por Demissão', 'Accidente de Trabajo': 'Acidente de Trabalho',
    'Calculadora Alquiler': 'Calculadora de Aluguel', 'Calculadora Jubilación': 'Calculadora de Aposentadoria',
    'Guías Legales': 'Guias Jurídicos', 'Nosotros': 'Sobre Nós', 'Contacto': 'Contato',
    'Dif. Salariales': 'Dif. Salariais', 'Reclamos de consumo': 'Reclamações de consumo',
    'Bancos y finanzas': 'Bancos e finanças', 'Accidente tránsito': 'Acidente de trânsito',
    'Accidente trabajo': 'Acidente de trabalho', 'Ver todos los servicios...': 'Ver todos os serviços...',
    '🇦🇷': '🇧🇷', 'ES': 'PT', '🇦🇷 Idioma': '🇧🇷 Idioma',
    'TB Abogados': 'TB Abogados', 'Enlaces Rápidos': 'Links Rápidos', 'Estudio': 'Escritório',
    'Áreas de Práctica': 'Áreas de Atuação', 'Calculadoras Legales': 'Calculadoras Jurídicas', 'Contáctenos': 'Fale Conosco',
    'C1017 Cdad. Autónoma de Buenos Aires': 'C1017 Buenos Aires, Argentina',
    'En defensa de tus derechos. Estudio jurídico con más de 30 años acompañando a nuestros clientes con excelencia, integridad y resultados reales en CABA y toda Argentina.': 'Defendendo seus direitos. Um escritório com mais de 30 anos de experiência atendendo clientes com excelência, integridade e resultados reais em Buenos Aires e em toda a Argentina.',
    '© 2026 TB ABOGADOS (Estudio Tassara &amp; Bulgheroni). Todos los derechos reservados.': '© 2026 TB ABOGADOS (Escritório Tassara &amp; Bulgheroni). Todos os direitos reservados.',
    'Términos y Condiciones': 'Termos e Condições', 'Política de Privacidad': 'Política de Privacidade',
    'En línea': 'Online', 'Hola 👋': 'Olá 👋', '¿Buscás asesoramiento legal?': 'Precisa de assessoria jurídica?',
    'Nosotros | TB Abogados': 'Sobre Nós | TB Abogados',
    'Conocé al equipo de TB Abogados, abogados especialistas con trayectoria y enfoque estratégico en Argentina.': 'Conheça a equipe da TB Abogados: advogados experientes que oferecem assessoria jurídica estratégica na Argentina.',
    'Socia Abogada': 'Sócia Advogada', 'Socio Abogado': 'Sócio Advogado',
    'Universidad de Buenos Aires (UBA)': 'Universidade de Buenos Aires (UBA)',
    'Estudio Tassara & Bulgheroni (TB Abogados)': 'Escritório Tassara & Bulgheroni (TB Abogados)',
    'Matrícula CPACF': 'Registro CPACF', 'Matrícula INPI': 'Registro INPI',
    'Matrícula CTPCBA': 'Registro CTPCBA', 'Matrícula PBA - CAJDM': 'Registro PBA - CAJDM',
    'Perfil oficial de traductor público': 'Perfil oficial de tradutor público',
    'Derecho del Consumidor': 'Direito do Consumidor', 'Reclamos de Consumo': 'Reclamações de Consumo',
    'Transporte Aéreo': 'Transporte Aéreo', 'Propiedad Industrial': 'Propriedade Industrial', 'Propiedad industrial': 'Propriedade industrial',
    'Registro de Marcas': 'Registro de Marcas', 'Registro de marcas': 'Registro de marcas',
    'Derecho Civil': 'Direito Civil', 'Derecho civil': 'Direito civil',
    'Derecho Comercial': 'Direito Comercial', 'Derecho comercial': 'Direito comercial',
    'Traducción Pública': 'Tradução Pública', 'Traducción pública': 'Tradução pública',
    'Asesoramiento Legal': 'Assessoria Jurídica', 'Asesoramiento legal': 'Assessoria jurídica',
    'Derecho Laboral': 'Direito do Trabalho', 'Derecho laboral': 'Direito do trabalho',
    'Sucesiones y Familia': 'Sucessões e Família', 'Sucesiones y familia': 'Sucessões e família',
    'Seguros': 'Seguros',
    'Asesoramiento legal en registro, oposición, defensa y vigilancia marcaria ante el INPI en Argentina.': 'Assessoria jurídica em registro, oposição, defesa e vigilância de marcas perante o INPI na Argentina.',
    'Registro y defensa de marcas': 'Registro e Defesa de Marcas',
    'Oposiciones marcarias': 'Oposições de marcas', 'Vigilancia marcaria': 'Vigilância de marcas',
    'Dra. Florencia Bulgheroni': 'Florencia Bulgheroni',
    'Abogada y Agente de la Propiedad Industrial': 'Advogada e Agente da Propriedade Industrial',
    'Matrícula profesional': 'Registro Profissional',
    'Agente de la Propiedad Industrial': 'Agente da Propriedade Industrial',
    'Dr. Daniel Bulgheroni': 'Daniel Bulgheroni', 'Abogado': 'Advogado',
    'Dra. Victoria Tassara': 'Victoria Tassara', 'Abogada y mediadora': 'Advogada e Mediadora',
    'Ciudad Autónoma de Buenos Aires': 'Buenos Aires, Argentina', 'Spanish': 'Portuguese',
    'Gracias por la confidencialidad, profesionalismo y dedicación. Hacen un gran equipo! Excelente servicio': 'Obrigado pela confidencialidade, profissionalismo e dedicação. Vocês formam uma grande equipe! Excelente serviço.',
    'Excelente servicio! Muchas gracias por la gestión de mis marcas. Llevo años trabajando con ellos. Super recomendables y profesionales. Saludos': 'Excelente serviço! Obrigado pela gestão das minhas marcas. Trabalho com eles há anos. Muito recomendáveis e profissionais.',
    'Excelente servicio, todos muy amables y eficientes': 'Excelente serviço; todos muito gentis e eficientes.'
  },
  contacto: {
    en: {
      'Agende su Consulta Legal Hoy': 'Schedule Your Legal Consultation Today',
      'Nuestro estudio se encuentra en el centro de la Ciudad Autónoma de Buenos Aires. Atendemos de forma presencial y virtual a todo el país.': 'Our office is located in central Buenos Aires. We assist clients throughout Argentina, both in person and remotely.',
      'Información': 'Information', 'Nuestra Oficina': 'Our Office',
      'Paraná 439, C1017 Cdad. Autónoma de Buenos Aires, Argentina.': 'Paraná 439, C1017 Buenos Aires, Argentina.',
      'Atención presencial': 'In-person consultations', 'exclusivamente con cita previa': 'by appointment only',
      'Lunes a Viernes 09:00 - 18:00': 'Monday to Friday, 9:00 AM–6:00 PM',
      'Correo Electrónico': 'Email', 'Envíenos su consulta': 'Send Us Your Inquiry',
      'Complete el formulario y un abogado especialista analizará su caso a la brevedad.': 'Complete the form and one of our attorneys will review your inquiry shortly.',
      'Nombre Completo *': 'Full Name *', 'Teléfono / Celular': 'Phone Number',
      'Indique al menos un teléfono/celular o un correo electrónico.': 'Please provide at least one phone number or email address.',
      'Asunto': 'Subject', 'Problema Laboral o Despido': 'Labor Matter or Dismissal',
      'Accidente de Trabajo / ART': 'Workplace Accident / ART',
      'Diferencias Salariales / Trabajo en Negro': 'Salary Differences / Unregistered Employment',
      'Accidente de Tránsito': 'Traffic Accident', 'Sucesiones o Derecho de Familia': 'Probate or Family Law',
      'Jubilaciones / Trámites de ANSES': 'Retirement / ANSES Proceedings',
      'Registro de Marcas (INPI)': 'Trademark Registration (INPI)', 'Contratos de Alquiler': 'Lease Agreements',
      'Consulta legal': 'Legal Inquiry', 'Mensaje Detallado *': 'Detailed Message *',
      'Enviar Mensaje': 'Send Message',
      'Toda la información enviada es estrictamente confidencial bajo secreto profesional.': 'All information submitted is strictly confidential and protected by attorney-client privilege.'
    },
    pt: {
      'Agende su Consulta Legal Hoy': 'Agende Sua Consulta Jurídica Hoje',
      'Nuestro estudio se encuentra en el centro de la Ciudad Autónoma de Buenos Aires. Atendemos de forma presencial y virtual a todo el país.': 'Nosso escritório está localizado no centro de Buenos Aires. Atendemos clientes em toda a Argentina, presencialmente e à distância.',
      'Información': 'Informações', 'Nuestra Oficina': 'Nosso Escritório',
      'Paraná 439, C1017 Cdad. Autónoma de Buenos Aires, Argentina.': 'Paraná 439, C1017 Buenos Aires, Argentina.',
      'Atención presencial': 'Atendimento presencial', 'exclusivamente con cita previa': 'somente com agendamento prévio',
      'Lunes a Viernes 09:00 - 18:00': 'Segunda a sexta, das 9h às 18h',
      'Correo Electrónico': 'E-mail', 'Envíenos su consulta': 'Envie Sua Consulta',
      'Complete el formulario y un abogado especialista analizará su caso a la brevedad.': 'Preencha o formulário e um de nossos advogados analisará sua consulta em breve.',
      'Nombre Completo *': 'Nome Completo *', 'Teléfono / Celular': 'Telefone / Celular',
      'Indique al menos un teléfono/celular o un correo electrónico.': 'Informe pelo menos um telefone/celular ou um endereço de e-mail.',
      'Asunto': 'Assunto', 'Problema Laboral o Despido': 'Questão Trabalhista ou Demissão',
      'Accidente de Trabajo / ART': 'Acidente de Trabalho / ART',
      'Diferencias Salariales / Trabajo en Negro': 'Diferenças Salariais / Trabalho sem Registro',
      'Accidente de Tránsito': 'Acidente de Trânsito', 'Sucesiones o Derecho de Familia': 'Sucessões ou Direito de Família',
      'Jubilaciones / Trámites de ANSES': 'Aposentadorias / Procedimentos na ANSES',
      'Registro de Marcas (INPI)': 'Registro de Marcas (INPI)', 'Contratos de Alquiler': 'Contratos de Locação',
      'Consulta legal': 'Consulta Jurídica', 'Mensaje Detallado *': 'Mensagem Detalhada *',
      'Enviar Mensaje': 'Enviar Mensagem',
      'Toda la información enviada es estrictamente confidencial bajo secreto profesional.': 'Todas as informações enviadas são estritamente confidenciais e protegidas pelo sigilo profissional.'
    }
  }
};

const familyText = {
  contacto: common.contacto,
  nosotros: {
    en: {
      'Años Litigando': 'Years of Legal Practice', 'NUESTRA EXPERIENCIA': 'OUR EXPERIENCE',
      'Estudio Tassara': 'Tassara Law Firm', 'Bulgheroni': 'Bulgheroni',
      'Con más de 30 años de trayectoria, en TB Abogados brindamos asesoramiento legal integral combinando la solidez de nuestra experiencia con un trato cercano y personalizado. Nacimos como un estudio de raíces familiares y hoy contamos con un equipo multidisciplinario de abogados especialistas y profesionales al servicio del estudio, como contadores, traductor público y peritos. Esta sinergia nos permite abordar casos laborales, civiles, comerciales, sucesorios y previsionales con una visión completa, garantizando resultados reales. Atendemos de forma presencial en CABA y representamos a clientes en todo el país.': 'For more than 30 years, TB Abogados has provided comprehensive legal advice, combining extensive experience with close and personalized service. Founded as a family law firm, we now work with a multidisciplinary team of specialized attorneys and professionals, including accountants, a public translator and expert consultants. This approach allows us to handle labor, civil, commercial, probate and pension matters with a complete perspective. We meet clients in Buenos Aires and represent individuals and businesses throughout Argentina.',
      'Confianza': 'Trust', 'Visión Multidisciplinaria': 'Multidisciplinary Vision',
      'Comunicación Clara y Constante': 'Clear and Consistent Communication', 'Compromiso': 'Commitment',
      'Socios del estudio': 'Law Firm Partners', 'Bulgheroni, Florencia': 'Florencia Bulgheroni',
      'Socia Abogada': 'Partner Attorney', 'Matrícula: CPACF Tº 137 Fº 145': 'Bar Registration: CPACF Tº 137 Fº 145',
      'Abogada egresada de la UBA, especialista en derecho del consumidor y Agente de la Propiedad Industrial.': 'UBA graduate attorney, consumer law specialist and Industrial Property Agent.',
      'Tassara, Victoria': 'Victoria Tassara', 'Matrícula: CPACF Tº 41 Fº 968': 'Bar Registration: CPACF Tº 41 Fº 968',
      'Abogada egresada de la UBA con matrícula en CABA y Provincia de Buenos Aires. Mediadora Civil, Comercial Empresarial y de Familia. Conciliadora Laboral en SECLO y SERACARH. Conciliadora de la Justicia en las Relaciones de Consumo de la Ciudad Autónoma de Buenos Aires (SCJCABA).': 'UBA graduate attorney admitted in Buenos Aires City and Province. Civil, commercial, business and family mediator; labor conciliator before SECLO and SERACARH; and consumer relations conciliator in Buenos Aires City.',
      'Bulgheroni, Daniel': 'Daniel Bulgheroni', 'Socio Abogado': 'Partner Attorney',
      'Matrícula: CPACF Tº 135 Fº 166': 'Bar Registration: CPACF Tº 135 Fº 166',
      'Abogado y traductor público de inglés egresado de la UBA.': 'UBA graduate attorney and English public translator.',
      'CONFIANZA Y RESULTADOS': 'TRUST AND RESULTS', 'Lo que dicen nuestros clientes': 'What Our Clients Say',
      'Excelente 5.0 de 5': 'Excellent, 5.0 out of 5', 'Basado en': 'Based on',
      '48 opiniones en Google Maps': '48 Google Maps reviews',
      '"Gracias por la confidencialidad, profesionalismo y dedicación. Hacen un gran equipo! Excelente servicio"': '“Thank you for your confidentiality, professionalism and dedication. You make a great team! Excellent service.”',
      '"Excelente servicio y muy confiables."': '“Excellent service and very reliable.”',
      '"Excelente servicio, todos muy amables y eficientes"': '“Excellent service; everyone is very kind and efficient.”'
    },
    pt: {
      'Años Litigando': 'Anos de Atuação', 'NUESTRA EXPERIENCIA': 'NOSSA EXPERIÊNCIA',
      'Estudio Tassara': 'Escritório Tassara', 'Bulgheroni': 'Bulgheroni',
      'Con más de 30 años de trayectoria, en TB Abogados brindamos asesoramiento legal integral combinando la solidez de nuestra experiencia con un trato cercano y personalizado. Nacimos como un estudio de raíces familiares y hoy contamos con un equipo multidisciplinario de abogados especialistas y profesionales al servicio del estudio, como contadores, traductor público y peritos. Esta sinergia nos permite abordar casos laborales, civiles, comerciales, sucesorios y previsionales con una visión completa, garantizando resultados reales. Atendemos de forma presencial en CABA y representamos a clientes en todo el país.': 'Há mais de 30 anos, a TB Abogados oferece assessoria jurídica integral, combinando experiência sólida com atendimento próximo e personalizado. Nascemos como um escritório familiar e hoje contamos com uma equipe multidisciplinar de advogados especializados e profissionais, incluindo contadores, tradutor público e peritos. Essa abordagem permite tratar questões trabalhistas, civis, comerciais, sucessórias e previdenciárias com uma visão completa. Atendemos presencialmente em Buenos Aires e representamos clientes em toda a Argentina.',
      'Confianza': 'Confiança', 'Visión Multidisciplinaria': 'Visão Multidisciplinar',
      'Comunicación Clara y Constante': 'Comunicação Clara e Constante', 'Compromiso': 'Compromisso',
      'Socios del estudio': 'Sócios do Escritório', 'Bulgheroni, Florencia': 'Florencia Bulgheroni',
      'Socia Abogada': 'Sócia Advogada', 'Matrícula: CPACF Tº 137 Fº 145': 'Registro: CPACF Tº 137 Fº 145',
      'Abogada egresada de la UBA, especialista en derecho del consumidor y Agente de la Propiedad Industrial.': 'Advogada formada pela UBA, especialista em direito do consumidor e Agente da Propriedade Industrial.',
      'Tassara, Victoria': 'Victoria Tassara', 'Matrícula: CPACF Tº 41 Fº 968': 'Registro: CPACF Tº 41 Fº 968',
      'Abogada egresada de la UBA con matrícula en CABA y Provincia de Buenos Aires. Mediadora Civil, Comercial Empresarial y de Familia. Conciliadora Laboral en SECLO y SERACARH. Conciliadora de la Justicia en las Relaciones de Consumo de la Ciudad Autónoma de Buenos Aires (SCJCABA).': 'Advogada formada pela UBA com registro na Cidade e na Província de Buenos Aires. Mediadora civil, comercial, empresarial e familiar; conciliadora trabalhista no SECLO e SERACARH; e conciliadora de relações de consumo em Buenos Aires.',
      'Bulgheroni, Daniel': 'Daniel Bulgheroni', 'Socio Abogado': 'Sócio Advogado',
      'Matrícula: CPACF Tº 135 Fº 166': 'Registro: CPACF Tº 135 Fº 166',
      'Abogado y traductor público de inglés egresado de la UBA.': 'Advogado e tradutor público de inglês formado pela UBA.',
      'CONFIANZA Y RESULTADOS': 'CONFIANÇA E RESULTADOS', 'Lo que dicen nuestros clientes': 'O Que Dizem Nossos Clientes',
      'Excelente 5.0 de 5': 'Excelente, 5,0 de 5', 'Basado en': 'Com base em',
      '48 opiniones en Google Maps': '48 avaliações no Google Maps',
      '"Gracias por la confidencialidad, profesionalismo y dedicación. Hacen un gran equipo! Excelente servicio"': '“Obrigado pela confidencialidade, profissionalismo e dedicação. Vocês formam uma grande equipe! Excelente serviço.”',
      '"Excelente servicio y muy confiables."': '“Excelente serviço e muita confiança.”',
      '"Excelente servicio, todos muy amables y eficientes"': '“Excelente serviço; todos muito gentis e eficientes.”'
    }
  },
  florencia: {
    en: {
      'SOCIA ABOGADA': 'PARTNER ATTORNEY', 'Dra. Florencia Bulgheroni': 'Florencia Bulgheroni',
      'Resumen Profesional': 'Professional Summary',
      'La Dra. Florencia Bulgheroni es abogada egresada de la prestigiosa Universidad de Buenos Aires (UBA) y se desempeña como socia titular en el Estudio Tassara & Bulgheroni (TB Abogados). Con un enfoque moderno y comprometido, asesora tanto a empresas como a particulares en la resolución de conflictos legales, con especialización en derecho del consumidor, propiedad industrial y derecho laboral.': 'Florencia Bulgheroni is an attorney graduated from the University of Buenos Aires (UBA) and a partner at Tassara & Bulgheroni Law Firm. With a modern and committed approach, she advises companies and individuals on legal disputes, specializing in consumer law, industrial property and labor law.',
      'Agente de la Propiedad Industrial': 'Industrial Property Agent',
      'Una de las áreas de mayor especialización de la Dra. Bulgheroni es el registro, protección y defensa de Marcas y Patentes. Como agente especializada, tramita ante el Instituto Nacional de la Propiedad Industrial (INPI), asegurando la viabilidad comercial y el blindaje legal de los activos intangibles de sus clientes.': 'She specializes in the registration, protection and defense of trademarks and patents before the National Institute of Industrial Property (INPI), helping protect the commercial value and legal position of her clients’ intangible assets.',
      'Especialista en Derecho del Consumidor': 'Consumer Law Specialist',
      'Asesora a consumidores en reclamos frente a empresas y proveedores, incluyendo conflictos con aerolíneas, bancos y servicios financieros, incumplimientos contractuales y gestiones administrativas o judiciales para la defensa de sus derechos.': 'She advises consumers on claims against companies and providers, including disputes with airlines, banks and financial services, contractual breaches and administrative or judicial proceedings.',
      'Educación y Credenciales': 'Education and Credentials', 'Título de Abogada': 'Law Degree',
      ', Universidad de Buenos Aires (UBA).': ', University of Buenos Aires (UBA).', 'Matriculación': 'Bar Admission',
      ', Colegio Público de Abogados de la Capital Federal (CPACF).': ', Public Bar Association of the Federal Capital (CPACF).',
      ', Matrícula INPI: 2971.': ', INPI Registration 2971.'
    },
    pt: {
      'SOCIA ABOGADA': 'SÓCIA ADVOGADA', 'Dra. Florencia Bulgheroni': 'Florencia Bulgheroni',
      'Resumen Profesional': 'Resumo Profissional',
      'La Dra. Florencia Bulgheroni es abogada egresada de la prestigiosa Universidad de Buenos Aires (UBA) y se desempeña como socia titular en el Estudio Tassara & Bulgheroni (TB Abogados). Con un enfoque moderno y comprometido, asesora tanto a empresas como a particulares en la resolución de conflictos legales, con especialización en derecho del consumidor, propiedad industrial y derecho laboral.': 'Florencia Bulgheroni é advogada formada pela Universidade de Buenos Aires (UBA) e sócia do Escritório Tassara & Bulgheroni. Com uma abordagem moderna e comprometida, assessora empresas e particulares na resolução de conflitos jurídicos, com especialização em direito do consumidor, propriedade industrial e direito do trabalho.',
      'Agente de la Propiedad Industrial': 'Agente da Propriedade Industrial',
      'Una de las áreas de mayor especialización de la Dra. Bulgheroni es el registro, protección y defensa de Marcas y Patentes. Como agente especializada, tramita ante el Instituto Nacional de la Propiedad Industrial (INPI), asegurando la viabilidad comercial y el blindaje legal de los activos intangibles de sus clientes.': 'É especializada no registro, proteção e defesa de marcas e patentes perante o Instituto Nacional da Propriedade Industrial (INPI), protegendo o valor comercial e jurídico dos ativos intangíveis de seus clientes.',
      'Especialista en Derecho del Consumidor': 'Especialista em Direito do Consumidor',
      'Asesora a consumidores en reclamos frente a empresas y proveedores, incluyendo conflictos con aerolíneas, bancos y servicios financieros, incumplimientos contractuales y gestiones administrativas o judiciales para la defensa de sus derechos.': 'Assessora consumidores em reclamações contra empresas e fornecedores, incluindo conflitos com companhias aéreas, bancos e serviços financeiros, descumprimentos contratuais e procedimentos administrativos ou judiciais.',
      'Educación y Credenciales': 'Formação e Credenciais', 'Título de Abogada': 'Graduação em Direito',
      ', Universidad de Buenos Aires (UBA).': ', Universidade de Buenos Aires (UBA).', 'Matriculación': 'Registro Profissional',
      ', Colegio Público de Abogados de la Capital Federal (CPACF).': ', Colégio Público de Advogados da Capital Federal (CPACF).',
      ', Matrícula INPI: 2971.': ', Registro INPI 2971.'
    }
  },
  daniel: {
    en: {
      'SOCIO ABOGADO': 'PARTNER ATTORNEY', 'Dr. Daniel Bulgheroni': 'Daniel Bulgheroni',
      'Matrícula CPACF: Tº 135 Fº 166': 'CPACF Registration: Tº 135 Fº 166', 'Matrícula CTPCBA:': 'CTPCBA Registration:', 'perfil oficial': 'official profile',
      'Resumen Profesional': 'Professional Summary',
      'El Dr. Daniel Bulgheroni es un profesional con doble titulación, desempeñándose como Abogado y Traductor Público de idioma Inglés, ambas carreras cursadas en la Universidad de Buenos Aires (UBA). Como socio del Estudio Tassara & Bulgheroni, aporta una vasta experiencia en el asesoramiento jurídico integral a empresas y particulares, combinando la precisión legal con la pericia técnica en cuestiones bilingües.': 'Daniel Bulgheroni holds degrees in law and English public translation from the University of Buenos Aires (UBA). As a partner at Tassara & Bulgheroni, he provides comprehensive legal advice to companies and individuals, combining legal precision with technical expertise in bilingual matters.',
      'Traducción Pública Legal': 'Legal Public Translation',
      'Especialista en traducción oficial de documentos legales, contratos, poderes y documentación corporativa del idioma inglés al español y viceversa, garantizando la validez legal internacional de los instrumentos.': 'Official translation of legal documents, contracts, powers of attorney and corporate documents between English and Spanish, supporting their international legal validity.',
      'Asesoramiento Civil y Comercial': 'Civil and Commercial Advice',
      'Asesoría sólida en la prevención y resolución de conflictos contractuales, operaciones civiles y defensa del patrimonio en un entorno de negocios dinámico, brindando seguridad jurídica a las transacciones.': 'Advice on preventing and resolving contractual disputes, civil transactions and asset protection in a dynamic business environment.',
      'Educación y Credenciales': 'Education and Credentials', 'Título de Abogado': 'Law Degree',
      ', Universidad de Buenos Aires (UBA).': ', University of Buenos Aires (UBA).', 'Traductor Público de Inglés': 'English Public Translator',
      'Matriculación CABA': 'CABA Bar Admission', ', Colegio Público de Abogados de la Capital Federal (CPACF).': ', Public Bar Association of the Federal Capital (CPACF).',
      'Matriculación CTPCBA': 'CTPCBA Registration', ', Colegio de Traductores Públicos de la Ciudad de Buenos Aires.': ', Buenos Aires Association of Public Translators.', 'Ver perfil oficial': 'View Official Profile'
    },
    pt: {
      'SOCIO ABOGADO': 'SÓCIO ADVOGADO', 'Dr. Daniel Bulgheroni': 'Daniel Bulgheroni',
      'Matrícula CPACF: Tº 135 Fº 166': 'Registro CPACF: Tº 135 Fº 166', 'Matrícula CTPCBA:': 'Registro CTPCBA:', 'perfil oficial': 'perfil oficial',
      'Resumen Profesional': 'Resumo Profissional',
      'El Dr. Daniel Bulgheroni es un profesional con doble titulación, desempeñándose como Abogado y Traductor Público de idioma Inglés, ambas carreras cursadas en la Universidad de Buenos Aires (UBA). Como socio del Estudio Tassara & Bulgheroni, aporta una vasta experiencia en el asesoramiento jurídico integral a empresas y particulares, combinando la precisión legal con la pericia técnica en cuestiones bilingües.': 'Daniel Bulgheroni possui formação em Direito e Tradução Pública de Inglês pela Universidade de Buenos Aires (UBA). Como sócio do Escritório Tassara & Bulgheroni, oferece assessoria jurídica integral a empresas e particulares, combinando precisão jurídica e experiência técnica em questões bilíngues.',
      'Traducción Pública Legal': 'Tradução Pública Jurídica',
      'Especialista en traducción oficial de documentos legales, contratos, poderes y documentación corporativa del idioma inglés al español y viceversa, garantizando la validez legal internacional de los instrumentos.': 'Tradução oficial de documentos jurídicos, contratos, procurações e documentos corporativos entre inglês e espanhol, garantindo sua validade jurídica internacional.',
      'Asesoramiento Civil y Comercial': 'Assessoria Civil e Comercial',
      'Asesoría sólida en la prevención y resolución de conflictos contractuales, operaciones civiles y defensa del patrimonio en un entorno de negocios dinámico, brindando seguridad jurídica a las transacciones.': 'Assessoria na prevenção e resolução de conflitos contratuais, operações civis e proteção patrimonial em um ambiente empresarial dinâmico.',
      'Educación y Credenciales': 'Formação e Credenciais', 'Título de Abogado': 'Graduação em Direito',
      ', Universidad de Buenos Aires (UBA).': ', Universidade de Buenos Aires (UBA).', 'Traductor Público de Inglés': 'Tradutor Público de Inglês',
      'Matriculación CABA': 'Registro CABA', ', Colegio Público de Abogados de la Capital Federal (CPACF).': ', Colégio Público de Advogados da Capital Federal (CPACF).',
      'Matriculación CTPCBA': 'Registro CTPCBA', ', Colegio de Traductores Públicos de la Ciudad de Buenos Aires.': ', Colégio de Tradutores Públicos da Cidade de Buenos Aires.', 'Ver perfil oficial': 'Ver Perfil Oficial'
    }
  },
  victoria: {
    en: {
      'SOCIA ABOGADA': 'PARTNER ATTORNEY', 'Dra. Victoria Tassara': 'Victoria Tassara',
      'Matrícula CPACF: Tº 41 Fº 968': 'CPACF Registration: Tº 41 Fº 968', 'Matrícula CAJDM:': 'CAJDM Registration:',
      'Resumen Profesional': 'Professional Summary',
      'La Dra. Victoria Tassara es abogada egresada de la Universidad de Buenos Aires (UBA) y socia del Estudio Tassara & Bulgheroni. Su práctica profesional se centra en la negociación estratégica y la resolución efectiva de conflictos.': 'Victoria Tassara is an attorney graduated from the University of Buenos Aires (UBA) and a partner at Tassara & Bulgheroni Law Firm. Her practice focuses on strategic negotiation and effective conflict resolution.',
      'Abogada Litigante': 'Litigation Attorney', 'Abogada litigante en la Ciudad Autónoma de Buenos Aires y en la Provincia de Buenos Aires.': 'Litigation attorney admitted in the City and Province of Buenos Aires.',
      'Conciliadora Laboral': 'Labor Conciliator', 'Especialista en la resolución alternativa en el ámbito del trabajo. Actúa como Conciliadora Laboral en el Servicio de Conciliación Laboral Obligatoria (SECLO) y SERACARH.': 'Specialist in alternative labor dispute resolution, acting as a labor conciliator before SECLO and SERACARH.',
      'Mediación Civil y Comercial': 'Civil and Commercial Mediation', 'Mediadora Civil, Comercial Empresarial y de Familia, facultada para allanar caminos de consenso que protejan la integridad emocional y el patrimonio de las partes involucradas.': 'Mediator in civil, commercial, business and family matters, helping the parties reach agreements that protect their personal and financial interests.',
      'Defensa del Consumidor': 'Consumer Defense', 'Conciliadora de la Justicia en las Relaciones de Consumo de la Ciudad Autónoma de Buenos Aires (SCJCABA), defendiendo a los particulares ante corporaciones.': 'Consumer relations conciliator in the City of Buenos Aires, representing individuals in disputes with corporations.',
      'Educación y Credenciales': 'Education and Credentials', 'Título de Abogada': 'Law Degree', ', Universidad de Buenos Aires (UBA).': ', University of Buenos Aires (UBA).',
      'Matriculación CABA': 'CABA Bar Admission', ', Colegio Público de Abogados de la Capital Federal (CPACF).': ', Public Bar Association of the Federal Capital (CPACF).',
      'Matriculación PBA': 'PBA Bar Admission', ', Colegio de Abogados del Departamento Judicial de Mercedes (CAJDM).': ', Mercedes Judicial Department Bar Association (CAJDM).', 'Ver matrícula oficial': 'View Official Registration'
    },
    pt: {
      'SOCIA ABOGADA': 'SÓCIA ADVOGADA', 'Dra. Victoria Tassara': 'Victoria Tassara',
      'Matrícula CPACF: Tº 41 Fº 968': 'Registro CPACF: Tº 41 Fº 968', 'Matrícula CAJDM:': 'Registro CAJDM:',
      'Resumen Profesional': 'Resumo Profissional',
      'La Dra. Victoria Tassara es abogada egresada de la Universidad de Buenos Aires (UBA) y socia del Estudio Tassara & Bulgheroni. Su práctica profesional se centra en la negociación estratégica y la resolución efectiva de conflictos.': 'Victoria Tassara é advogada formada pela Universidade de Buenos Aires (UBA) e sócia do Escritório Tassara & Bulgheroni. Sua prática se concentra na negociação estratégica e na resolução eficaz de conflitos.',
      'Abogada Litigante': 'Advogada Litigante', 'Abogada litigante en la Ciudad Autónoma de Buenos Aires y en la Provincia de Buenos Aires.': 'Advogada litigante na Cidade e na Província de Buenos Aires.',
      'Conciliadora Laboral': 'Conciliadora Trabalhista', 'Especialista en la resolución alternativa en el ámbito del trabajo. Actúa como Conciliadora Laboral en el Servicio de Conciliación Laboral Obligatoria (SECLO) y SERACARH.': 'Especialista em resolução alternativa de conflitos trabalhistas, atuando como conciliadora no SECLO e SERACARH.',
      'Mediación Civil y Comercial': 'Mediação Civil e Comercial', 'Mediadora Civil, Comercial Empresarial y de Familia, facultada para allanar caminos de consenso que protejan la integridad emocional y el patrimonio de las partes involucradas.': 'Mediadora em questões civis, comerciais, empresariais e familiares, ajudando as partes a alcançar acordos que protejam seus interesses pessoais e patrimoniais.',
      'Defensa del Consumidor': 'Defesa do Consumidor', 'Conciliadora de la Justicia en las Relaciones de Consumo de la Ciudad Autónoma de Buenos Aires (SCJCABA), defendiendo a los particulares ante corporaciones.': 'Conciliadora da Justiça nas Relações de Consumo da Cidade de Buenos Aires, representando particulares em conflitos com empresas.',
      'Educación y Credenciales': 'Formação e Credenciais', 'Título de Abogada': 'Graduação em Direito', ', Universidad de Buenos Aires (UBA).': ', Universidade de Buenos Aires (UBA).',
      'Matriculación CABA': 'Registro CABA', ', Colegio Público de Abogados de la Capital Federal (CPACF).': ', Colégio Público de Advogados da Capital Federal (CPACF).',
      'Matriculación PBA': 'Registro PBA', ', Colegio de Abogados del Departamento Judicial de Mercedes (CAJDM).': ', Colégio de Advogados do Departamento Judicial de Mercedes (CAJDM).', 'Ver matrícula oficial': 'Ver Registro Oficial'
    }
  },
  marcas: {
    en: {
      'ESPECIALIDAD LEGAL': 'TRADEMARK REGISTRATION IN ARGENTINA', 'Registro de Marcas': 'Trademark Registration in Argentina',
      'Registramos y protegemos tu marca ante el INPI. Gestionamos oposiciones, vistas, transferencias, renovaciones y conflictos marcarios. Además, incluimos vigilancia y custodia constante de tu marca para alertarte si alguien intenta registrar una marca similar a la tuya. Todo a cargo de Agentes de la Propiedad Industrial.': 'We register and protect your trademark before the INPI. We handle oppositions, office actions, assignments, renewals and trademark disputes. We also provide ongoing watch services to alert you if someone attempts to register a similar trademark. Your matter is handled by Industrial Property Agents.',
      'Registro ante INPI': 'INPI Registration', 'Transferencias y renovaciones': 'Assignments and Renewals', 'Vigilancia marcaria': 'Trademark Monitoring', 'Conflictos marcarios': 'Trademark Disputes', '+30 años de experiencia': '30+ Years of Experience',
      'Nuestro Proceso de Trabajo': 'Our Work Process', '1. Consulta Inicial': '1. Initial Consultation', 'Evaluamos tus objetivos y la estrategia integral detrás de tu marca.': 'We assess your goals and the overall strategy behind your trademark.',
      '2. Búsqueda': '2. Search', 'Verificamos exhaustivamente que tu marca sea única y esté disponible.': 'We thoroughly verify that your trademark is distinctive and available.',
      '3. Registro': '3. Application', 'Gestionamos la solicitud de registro de marca ante el Instituto Nacional de la Propiedad Industrial (INPI).': 'We manage the trademark application before the National Institute of Industrial Property (INPI).',
      '4. Trámite Final': '4. Final Proceeding', 'Realizamos el seguimiento del expediente hasta la concesión y obtención del título de marca.': 'We follow the application through approval and issuance of the trademark certificate.',
      'Preguntas frecuentes': 'Frequently Asked Questions', '¿Por qué necesito registrar mi marca?': 'Why Do I Need to Register My Trademark?',
      'El registro otorga protección legal y el derecho exclusivo de uso. Permite impedir que terceros utilicen tu marca sin autorización, agrega valor comercial y facilita el crecimiento de tu negocio.': 'Registration grants legal protection and the exclusive right to use your trademark. It allows you to prevent unauthorized use, adds commercial value and supports business growth.',
      '¿Cómo funciona la protección marcaria?': 'How Does Trademark Protection Work?', 'La protección comienza con el registro ante el INPI y se complementa con la vigilancia marcaria. Controlamos de manera constante las nuevas solicitudes para detectar signos idénticos o similares. Si aparece un posible conflicto, te alertamos para analizar el caso y, si corresponde, presentar una oposición dentro del plazo legal.': 'Protection begins with registration before the INPI and is complemented by ongoing monitoring of new applications. If a possible conflict appears, we alert you so it can be assessed and, when appropriate, opposed within the legal deadline.',
      '¿Cómo saber si una marca está disponible?': 'How Can I Find Out If a Trademark Is Available?', 'Realizamos búsquedas de antecedentes en las bases del INPI para evaluar la disponibilidad del nombre y detectar posibles conflictos con marcas previamente registradas o solicitadas.': 'We search the INPI databases to assess whether the name is available and identify potential conflicts with previously registered or applied-for trademarks.',
      '¿Cómo elijo el nombre adecuado?': 'How Do I Choose the Right Name?', 'Te asesoramos en la elección del signo distintivo y analizamos su viabilidad para el registro, considerando aspectos legales y estratégicos.': 'We advise you on choosing the distinctive sign and assess its registrability from both legal and strategic perspectives.',
      '¿Qué puedo registrar?': 'What Can I Register?', 'Palabras, letras, números, nombres de fantasía, símbolos gráficos, dibujos, logotipos o combinaciones de estos elementos. También sonoras, olfativas o tridimensionales.': 'Words, letters, numbers, fanciful names, graphic symbols, drawings, logos or combinations of these elements. Sound, scent and three-dimensional marks may also be registered.',
      '¿Qué pasa si alguien se opone a mi marca?': 'What If Someone Opposes My Trademark?', 'Si un tercero presenta una oposición, te asesoramos en la estrategia para resolver el conflicto, ya sea mediante negociaciones o a través del procedimiento correspondiente ante el INPI.': 'We advise you on a strategy to resolve the conflict, either through negotiations or through the corresponding procedure before the INPI.',
      '¿Registro internacional?': 'International Registration?', 'Sí, podemos ayudarte a expandir la protección de tu marca a nivel internacional gestionando el proceso de registro en diferentes países y jurisdicciones.': 'Yes. We can help expand your trademark protection internationally by managing registration processes in different countries and jurisdictions.',
      '¿Cuáles son los costos?': 'What Are the Costs?', 'Te proporcionamos los honorarios y tasas involucradas en cada trámite.': 'We provide a clear breakdown of the professional fees and official fees involved in each proceeding.',
      'Acerca de la duración y renovación': 'Duration and Renewal', 'En Argentina la protección es por 10 años, renovables indefinidamente. Te ayudamos con el seguimiento para renovar y mantener siempre activo tu registro.': 'In Argentina, protection lasts 10 years and can be renewed indefinitely. We monitor deadlines so your registration remains active.',
      '¿Qué derechos obtengo al registrar mi marca?': 'What Rights Do I Obtain by Registering My Trademark?', 'El registro permite impedir que terceros utilicen o registren signos similares que puedan generar confusión en el mercado.': 'Registration allows you to prevent third parties from using or registering similar signs that could create confusion in the marketplace.',
      'Marcas que confiaron en nosotros': 'Brands That Trust Us', '¿Querés registrar una marca o resolver un conflicto?': 'Do You Want to Register a Trademark or Resolve a Dispute?', 'Analizamos tu caso y te orientamos sobre la mejor estrategia para proteger tu marca. Somos agentes de Propiedad Industrial.': 'We assess your situation and guide you toward the best strategy to protect your trademark. We are Industrial Property Agents.', 'Contactanos': 'Contact Us',
      'Dra. Florencia Bulgheroni': 'Florencia Bulgheroni', 'CPACF Tº 137 Fº 145 · Agente INPI 2971': 'CPACF Tº 137 Fº 145 · INPI Agent 2971',
      'CONFIANZA Y RESULTADOS': 'TRUST AND RESULTS', 'Lo que dicen nuestros clientes': 'What Our Clients Say', 'Excelente 5.0 de 5': 'Excellent, 5.0 out of 5', 'Basado en': 'Based on', '48 opiniones en Google Maps': '48 Google Maps reviews',
      '"Gracias por la confidencialidad, profesionalismo y dedicación. Hacen un gran equipo! Excelente servicio"': '“Thank you for your confidentiality, professionalism and dedication. You make a great team! Excellent service.”',
      '"Excelente servicio! Muchas gracias por la gestión de mis marcas. Llevo años trabajando con ellos. Super recomendables y profesionales. Saludos"': '“Excellent service! Thank you for managing my trademarks. I have worked with them for years. Highly recommended and professional.”',
      '"Excelente servicio, todos muy amables y eficientes"': '“Excellent service; everyone is very kind and efficient.”'
    },
    pt: {
      'ESPECIALIDAD LEGAL': 'TRADEMARK REGISTRATION IN ARGENTINA', 'Registro de Marcas': 'Registro de Marcas na Argentina',
      'Registramos y protegemos tu marca ante el INPI. Gestionamos oposiciones, vistas, transferencias, renovaciones y conflictos marcarios. Además, incluimos vigilancia y custodia constante de tu marca para alertarte si alguien intenta registrar una marca similar a la tuya. Todo a cargo de Agentes de la Propiedad Industrial.': 'Registramos e protegemos sua marca perante o INPI. Cuidamos de oposições, exigências, transferências, renovações e conflitos de marcas. Também oferecemos vigilância contínua para avisar se alguém tentar registrar uma marca semelhante. O atendimento é realizado por Agentes da Propriedade Industrial.',
      'Registro ante INPI': 'Registro perante o INPI', 'Transferencias y renovaciones': 'Transferências e Renovações', 'Vigilancia marcaria': 'Vigilância de Marcas', 'Conflictos marcarios': 'Conflitos de Marcas', '+30 años de experiencia': 'Mais de 30 Anos de Experiência',
      'Nuestro Proceso de Trabajo': 'Nosso Processo de Trabalho', '1. Consulta Inicial': '1. Consulta Inicial', 'Evaluamos tus objetivos y la estrategia integral detrás de tu marca.': 'Avaliamos seus objetivos e a estratégia integral por trás da sua marca.',
      '2. Búsqueda': '2. Pesquisa', 'Verificamos exhaustivamente que tu marca sea única y esté disponible.': 'Verificamos cuidadosamente se sua marca é distintiva e está disponível.',
      '3. Registro': '3. Solicitação', 'Gestionamos la solicitud de registro de marca ante el Instituto Nacional de la Propiedad Industrial (INPI).': 'Gerenciamos o pedido de registro perante o Instituto Nacional da Propriedade Industrial (INPI).',
      '4. Trámite Final': '4. Procedimento Final', 'Realizamos el seguimiento del expediente hasta la concesión y obtención del título de marca.': 'Acompanhamos o processo até a concessão e emissão do certificado da marca.',
      'Preguntas frecuentes': 'Perguntas Frequentes', '¿Por qué necesito registrar mi marca?': 'Por Que Preciso Registrar Minha Marca?',
      'El registro otorga protección legal y el derecho exclusivo de uso. Permite impedir que terceros utilicen tu marca sin autorización, agrega valor comercial y facilita el crecimiento de tu negocio.': 'O registro garante proteção jurídica e o direito exclusivo de uso da marca. Permite impedir o uso não autorizado, agrega valor comercial e favorece o crescimento do negócio.',
      '¿Cómo funciona la protección marcaria?': 'Como Funciona a Proteção da Marca?', 'La protección comienza con el registro ante el INPI y se complementa con la vigilancia marcaria. Controlamos de manera constante las nuevas solicitudes para detectar signos idénticos o similares. Si aparece un posible conflicto, te alertamos para analizar el caso y, si corresponde, presentar una oposición dentro del plazo legal.': 'A proteção começa com o registro perante o INPI e é complementada pela vigilância de novas solicitações. Se surgir um possível conflito, avisamos você para analisar o caso e, quando necessário, apresentar uma oposição dentro do prazo legal.',
      '¿Cómo saber si una marca está disponible?': 'Como Saber se uma Marca Está Disponível?', 'Realizamos búsquedas de antecedentes en las bases del INPI para evaluar la disponibilidad del nombre y detectar posibles conflictos con marcas previamente registradas o solicitadas.': 'Realizamos buscas nas bases do INPI para avaliar a disponibilidade do nome e identificar possíveis conflitos com marcas já registradas ou solicitadas.',
      '¿Cómo elijo el nombre adecuado?': 'Como Escolher o Nome Adequado?', 'Te asesoramos en la elección del signo distintivo y analizamos su viabilidad para el registro, considerando aspectos legales y estratégicos.': 'Orientamos a escolha do sinal distintivo e analisamos sua viabilidade de registro sob os aspectos jurídicos e estratégicos.',
      '¿Qué puedo registrar?': 'O Que Posso Registrar?', 'Palabras, letras, números, nombres de fantasía, símbolos gráficos, dibujos, logotipos o combinaciones de estos elementos. También sonoras, olfativas o tridimensionales.': 'Palavras, letras, números, nomes de fantasia, símbolos, desenhos, logotipos ou combinações desses elementos. Também podem ser registradas marcas sonoras, olfativas ou tridimensionais.',
      '¿Qué pasa si alguien se opone a mi marca?': 'E se Alguém se Opuser à Minha Marca?', 'Si un tercero presenta una oposición, te asesoramos en la estrategia para resolver el conflicto, ya sea mediante negociaciones o a través del procedimiento correspondiente ante el INPI.': 'Orientamos a estratégia para resolver o conflito, seja por negociação ou pelo procedimento correspondente perante o INPI.',
      '¿Registro internacional?': 'Registro Internacional?', 'Sí, podemos ayudarte a expandir la protección de tu marca a nivel internacional gestionando el proceso de registro en diferentes países y jurisdicciones.': 'Sim. Podemos ajudar a ampliar a proteção da sua marca internacionalmente, administrando o processo em diferentes países e jurisdições.',
      '¿Cuáles son los costos?': 'Quais São os Custos?', 'Te proporcionamos los honorarios y tasas involucradas en cada trámite.': 'Apresentamos claramente os honorários profissionais e as taxas oficiais de cada procedimento.',
      'Acerca de la duración y renovación': 'Duração e Renovação', 'En Argentina la protección es por 10 años, renovables indefinidamente. Te ayudamos con el seguimiento para renovar y mantener siempre activo tu registro.': 'Na Argentina, a proteção dura 10 anos e pode ser renovada indefinidamente. Acompanhamos os prazos para manter o registro ativo.',
      '¿Qué derechos obtengo al registrar mi marca?': 'Quais Direitos Obtenho ao Registrar Minha Marca?', 'El registro permite impedir que terceros utilicen o registren signos similares que puedan generar confusión en el mercado.': 'O registro permite impedir que terceiros usem ou registrem sinais semelhantes que possam causar confusão no mercado.',
      'Marcas que confiaron en nosotros': 'Marcas Que Confiam em Nós', '¿Querés registrar una marca o resolver un conflicto?': 'Quer Registrar uma Marca ou Resolver um Conflito?', 'Analizamos tu caso y te orientamos sobre la mejor estrategia para proteger tu marca. Somos agentes de Propiedad Industrial.': 'Analisamos seu caso e orientamos sobre a melhor estratégia para proteger sua marca. Somos Agentes da Propriedade Industrial.', 'Contactanos': 'Fale Conosco',
      'Dra. Florencia Bulgheroni': 'Florencia Bulgheroni', 'CPACF Tº 137 Fº 145 · Agente INPI 2971': 'CPACF Tº 137 Fº 145 · Agente INPI 2971',
      'CONFIANZA Y RESULTADOS': 'CONFIANÇA E RESULTADOS', 'Lo que dicen nuestros clientes': 'O Que Dizem Nossos Clientes', 'Excelente 5.0 de 5': 'Excelente, 5,0 de 5', 'Basado en': 'Com base em', '48 opiniones en Google Maps': '48 avaliações no Google Maps',
      '"Gracias por la confidencialidad, profesionalismo y dedicación. Hacen un gran equipo! Excelente servicio"': '“Obrigado pela confidencialidade, profissionalismo e dedicação. Vocês formam uma grande equipe! Excelente serviço.”',
      '"Excelente servicio! Muchas gracias por la gestión de mis marcas. Llevo años trabajando con ellos. Super recomendables y profesionales. Saludos"': '“Excelente serviço! Obrigado pela gestão das minhas marcas. Trabalho com eles há anos. Muito recomendáveis e profissionais.”',
      '"Excelente servicio, todos muy amables y eficientes"': '“Excelente serviço; todos muito gentis e eficientes.”'
    }
  }
};

const pages = [
  { family: 'nosotros', source: 'nosotros/index.html', baseUrl: 'https://tbabogados.com.ar/nosotros/', titles: { en: 'About TB Abogados | Legal Team in Argentina | TB Abogados ⚖️', pt: 'Sobre a TB Abogados | Equipe Jurídica na Argentina | TB Abogados ⚖️' }, descriptions: { en: 'Meet the TB Abogados legal team: experienced attorneys providing strategic, multidisciplinary legal advice in Argentina.', pt: 'Conheça a equipe da TB Abogados: advogados experientes que oferecem assessoria jurídica estratégica e multidisciplinar na Argentina.' } },
  { family: 'florencia', source: 'dra-bulgheroni/index.html', baseUrl: 'https://tbabogados.com.ar/dra-bulgheroni/', titles: { en: 'Florencia Bulgheroni | Attorney and Industrial Property Agent in Argentina | TB Abogados ⚖️', pt: 'Florencia Bulgheroni | Advogada e Agente de Propriedade Industrial na Argentina | TB Abogados ⚖️' }, descriptions: { en: 'Professional profile of Florencia Bulgheroni, attorney and Industrial Property Agent specializing in consumer law, trademarks and industrial property in Argentina.', pt: 'Perfil profissional de Florencia Bulgheroni, advogada e Agente da Propriedade Industrial especializada em direito do consumidor, marcas e propriedade industrial na Argentina.' } },
  { family: 'daniel', source: 'dr-bulgheroni/index.html', baseUrl: 'https://tbabogados.com.ar/dr-bulgheroni/', titles: { en: 'Daniel Bulgheroni | Attorney and Public Translator in Argentina | TB Abogados ⚖️', pt: 'Daniel Bulgheroni | Advogado e Tradutor Público na Argentina | TB Abogados ⚖️' }, descriptions: { en: 'Professional profile of Daniel Bulgheroni, attorney, partner and English public translator at TB Abogados in Argentina.', pt: 'Perfil profissional de Daniel Bulgheroni, advogado, sócio e tradutor público de inglês da TB Abogados na Argentina.' } },
  { family: 'victoria', source: 'dra-tassara/index.html', baseUrl: 'https://tbabogados.com.ar/dra-tassara/', titles: { en: 'Victoria Tassara | Attorney and Mediator in Argentina | TB Abogados ⚖️', pt: 'Victoria Tassara | Advogada e Mediadora na Argentina | TB Abogados ⚖️' }, descriptions: { en: 'Professional profile of Victoria Tassara, attorney, mediator and labor conciliator with extensive experience in Argentina.', pt: 'Perfil profissional de Victoria Tassara, advogada, mediadora e conciliadora trabalhista com ampla experiência na Argentina.' } },
  { family: 'marcas', source: 'servicios/marcas/index.html', baseUrl: 'https://tbabogados.com.ar/servicios/marcas/', titles: { en: 'Trademark Registration in Argentina | TB Abogados ⚖️', pt: 'Trademark Registration in Argentina | Registro de Marcas na Argentina | TB Abogados ⚖️' }, descriptions: { en: 'Protect your trademark in Argentina: registration, defense and ongoing trademark monitoring before the INPI.', pt: 'Trademark Registration in Argentina: registre e proteja sua marca na Argentina, com acompanhamento, defesa e vigilância perante o INPI.' } },
  { family: 'contacto', source: 'contacto/index.html', baseUrl: 'https://tbabogados.com.ar/contacto/', titles: { en: 'Contact TB Abogados | Legal Advice in Argentina ⚖️', pt: 'Contato TB Abogados | Assessoria Jurídica na Argentina ⚖️' }, descriptions: { en: 'Contact TB Abogados for legal advice in Argentina by WhatsApp, phone, email or our secure inquiry form.', pt: 'Entre em contato com a TB Abogados para assessoria jurídica na Argentina por WhatsApp, telefone, e-mail ou formulário seguro.' } }
];

function rewriteRelativeReferences(html, sourceFile, targetFile) {
  const sourceDir = path.posix.dirname(sourceFile);
  const targetDir = path.posix.dirname(targetFile);
  return html.replace(/\b(href|src)="([^"]+)"/g, (match, attr, value) => {
    if (!value || /^(?:[a-z]+:|\/|#|data:)/i.test(value)) return match;
    const suffixMatch = value.match(/([?#].*)$/);
    const suffix = suffixMatch ? suffixMatch[1] : '';
    const pathname = suffix ? value.slice(0, -suffix.length) : value;
    const trailingSlash = pathname.endsWith('/');
    const resolved = path.posix.normalize(path.posix.join(sourceDir, pathname));
    let relative = path.posix.relative(targetDir, resolved) || '.';
    if (trailingSlash && relative !== '.' && !relative.endsWith('/')) relative += '/';
    if (relative === '.') relative = './';
    return `${attr}="${relative}${suffix}"`;
  });
}

function localizeInternalReferences(html, targetFile, lang) {
  const targetDir = path.posix.dirname(targetFile);
  const localizablePaths = new Set([
    'nosotros',
    'contacto',
    'dra-bulgheroni',
    'dr-bulgheroni',
    'dra-tassara',
    'servicios/marcas'
  ]);

  return html.replace(/<a\b([^>]*?)href="([^"]+)"([^>]*)>([\s\S]*?)<\/a>/gi, (match, before, value, after, content) => {
    const label = content.replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');
    if (/^(?:🇦🇷 Español|🇬🇧 English|🇧🇷 Português)$/.test(label)) return match;
    if (!value || /^(?:[a-z]+:|\/|#|data:)/i.test(value)) return match;

    const suffixMatch = value.match(/([?#].*)$/);
    const suffix = suffixMatch ? suffixMatch[1] : '';
    const pathname = suffix ? value.slice(0, -suffix.length) : value;
    const resolved = path.posix.normalize(path.posix.join(targetDir, pathname)).replace(/\/$/, '');
    if (!localizablePaths.has(resolved)) return match;

    let relative = path.posix.relative(targetDir, path.posix.join(resolved, lang));
    if (!relative.endsWith('/')) relative += '/';
    return `<a${before}href="${relative}${suffix}"${after}>${content}</a>`;
  });
}

function translateTextNodes(html, dictionary) {
  const protectedBlocks = [];
  html = html.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, block => {
    const token = `__TB_PROTECTED_${protectedBlocks.length}__`;
    protectedBlocks.push(block);
    return token;
  });
  html = html.replace(/>([^<>]+)</g, (match, raw) => {
    const normalized = raw.trim().replace(/\s+/g, ' ');
    if (!normalized || !(normalized in dictionary)) return match;
    const leading = raw.match(/^\s*/)?.[0] || '';
    const trailing = raw.match(/\s*$/)?.[0] || '';
    return `>${leading}${dictionary[normalized]}${trailing}<`;
  });
  return html.replace(/__TB_PROTECTED_(\d+)__/g, (_, index) => protectedBlocks[Number(index)]);
}

function translateJsonLd(html, dictionary, baseUrl, targetUrl, lang) {
  const localizableUrls = new Set([
    'https://tbabogados.com.ar/nosotros/',
    'https://tbabogados.com.ar/dra-bulgheroni/',
    'https://tbabogados.com.ar/dr-bulgheroni/',
    'https://tbabogados.com.ar/dra-tassara/',
    'https://tbabogados.com.ar/contacto/',
    'https://tbabogados.com.ar/servicios/marcas/'
  ]);
  const translateValue = value => {
    if (typeof value === 'string') {
      if (value === baseUrl) return targetUrl;
      if (localizableUrls.has(value)) return `${value}${lang}/`;
      return dictionary[value] || value;
    }
    if (Array.isArray(value)) return value.map(translateValue);
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, translateValue(item)]));
    return value;
  };
  return html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g, (match, json) => {
    try {
      const parsed = JSON.parse(json);
      return `<script type="application/ld+json">\n${JSON.stringify(translateValue(parsed), null, 2)}\n    </script>`;
    } catch {
      return match;
    }
  });
}

function setMetadata(html, lang, page, targetUrl) {
  const locale = lang === 'en' ? 'en_US' : 'pt_BR';
  html = html.replace(/<html lang="[^"]+"/, `<html lang="${lang === 'en' ? 'en' : 'pt-BR'}"`);
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${page.titles[lang]}</title>`);
  html = html.replace(/<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${page.descriptions[lang]}">`);
  html = html.replace(/<link href="[^"]+" rel="canonical"\s*\/?>/, `<link href="${targetUrl}" rel="canonical" />`);
  html = html.replace(/<meta property="og:locale" content="[^"]*"\s*\/?>/, `<meta property="og:locale" content="${locale}">`);
  html = html.replace(/<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${page.titles[lang]}">`);
  html = html.replace(/<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${page.descriptions[lang]}">`);
  html = html.replace(/<meta property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${targetUrl}">`);
  html = html.replace(/<meta name="twitter:title" content="[^"]*"\s*\/?>/, `<meta name="twitter:title" content="${page.titles[lang]}">`);
  html = html.replace(/<meta name="twitter:description" content="[^"]*"\s*\/?>/, `<meta name="twitter:description" content="${page.descriptions[lang]}">`);
  return html;
}

function translateAttributes(html, lang) {
  const replacements = lang === 'en' ? {
    'Abrir menú de navegación': 'Open navigation menu', 'Mostrar reclamos de consumo': 'Show consumer claims',
    'Ver versión en inglés': 'View English version', 'Seleccionar idioma': 'Select language',
    'Logo TB Abogados': 'TB Abogados logo', 'Enviar Email': 'Send email',
    'Visita nuestro Facebook': 'Visit our Facebook page', 'Visita nuestro Instagram': 'Visit our Instagram profile',
    'Síguenos en LinkedIn': 'Follow us on LinkedIn', 'Perfil': 'Profile', 'Enviar': 'Send',
    'Abrir WhatsApp': 'Open WhatsApp', 'Escribí tu mensaje acá...': 'Type your message here...',
    'Ej: Juan Pérez': 'E.g.: John Smith', 'Ej: 11 1234 5678': 'E.g.: +54 9 11 1234 5678', 'su-email@ejemplo.com': 'your-email@example.com',
    'Cuéntenos los detalles de su caso para poder asesorarlo mejor...': 'Tell us about your situation so we can advise you effectively...',
    'Estudio Tassara & Bulgheroni': 'Tassara & Bulgheroni Law Firm',
    'Ver perfil de LinkedIn de Florencia Bulgheroni': 'View Florencia Bulgheroni’s LinkedIn profile',
    'Ver perfil de LinkedIn de Victoria Tassara': 'View Victoria Tassara’s LinkedIn profile',
    'Ver perfil de LinkedIn de Daniel Bulgheroni': 'View Daniel Bulgheroni’s LinkedIn profile',
    'Marca 1': 'Brand 1', 'Marca 2': 'Brand 2', 'Marca 3': 'Brand 3',
    'Conocé el perfil profesional de la Dra. Florencia Bulgheroni': 'View Florencia Bulgheroni’s professional profile'
  } : {
    'Abrir menú de navegación': 'Abrir menu de navegação', 'Mostrar reclamos de consumo': 'Mostrar reclamações de consumo',
    'Ver versión en inglés': 'Ver versão em inglês', 'Seleccionar idioma': 'Selecionar idioma',
    'Logo TB Abogados': 'Logo TB Abogados', 'Enviar Email': 'Enviar e-mail',
    'Visita nuestro Facebook': 'Visite nosso Facebook', 'Visita nuestro Instagram': 'Visite nosso Instagram',
    'Síguenos en LinkedIn': 'Siga-nos no LinkedIn', 'Perfil': 'Perfil', 'Enviar': 'Enviar',
    'Abrir WhatsApp': 'Abrir WhatsApp', 'Escribí tu mensaje acá...': 'Escreva sua mensagem aqui...',
    'Ej: Juan Pérez': 'Ex.: João Silva', 'Ej: 11 1234 5678': 'Ex.: +54 9 11 1234 5678', 'su-email@ejemplo.com': 'seu-email@exemplo.com',
    'Cuéntenos los detalles de su caso para poder asesorarlo mejor...': 'Conte os detalhes do seu caso para que possamos orientá-lo melhor...',
    'Estudio Tassara & Bulgheroni': 'Escritório Tassara & Bulgheroni',
    'Ver perfil de LinkedIn de Florencia Bulgheroni': 'Ver perfil de Florencia Bulgheroni no LinkedIn',
    'Ver perfil de LinkedIn de Victoria Tassara': 'Ver perfil de Victoria Tassara no LinkedIn',
    'Ver perfil de LinkedIn de Daniel Bulgheroni': 'Ver perfil de Daniel Bulgheroni no LinkedIn',
    'Conocé el perfil profesional de la Dra. Florencia Bulgheroni': 'Ver perfil profissional de Florencia Bulgheroni'
  };
  for (const [from, to] of Object.entries(replacements)) html = html.split(from).join(to);
  return html;
}

function setActiveLanguage(html, lang) {
  const currentLabel = lang === 'en' ? '🇬🇧 English' : '🇧🇷 Português';
  return html.replace(/<a([^>]*)>(🇦🇷 Español|🇬🇧 English|🇧🇷 Português)<\/a>/g, (match, attrs, label) => {
    const href = attrs.match(/href="[^"]+"/)?.[0] || '';
    const desktop = /role="menuitem"/.test(attrs);
    const current = label === currentLabel;
    if (desktop) {
      const classes = current
        ? 'block px-4 py-2 text-base text-gold font-medium hover:bg-gold-light'
        : 'block px-4 py-2 text-base text-gray-700 hover:bg-gold-light hover:text-gold';
      return `<a ${href}${current ? ' aria-current="page"' : ''} class="${classes}" role="menuitem">${label}</a>`;
    }
    const classes = current ? 'text-gold block py-1' : 'text-gray-300 hover:text-gold block py-1';
    return `<a ${href}${current ? ' aria-current="page"' : ''} class="${classes}">${label}</a>`;
  });
}

function removeTrademarkPricing(html) {
  html = html.replace(/\s*<!-- Pricing Section -->[\s\S]*?(?=\s*<!-- FAQs -->)/, '');
  return html.replace(/^\s*"priceRange":\s*"\$\$",?\r?\n/m, '');
}

for (const page of pages) {
  const source = fs.readFileSync(path.join(root, page.source), 'utf8');
  for (const lang of ['en', 'pt']) {
    const target = path.posix.join(path.posix.dirname(page.source), lang, 'index.html');
    const targetUrl = `${page.baseUrl}${lang}/`;
    const dictionary = { ...common[lang], ...familyText[page.family][lang] };
    let html = rewriteRelativeReferences(source, page.source, target);
    html = localizeInternalReferences(html, target, lang);
    html = translateTextNodes(html, dictionary);
    html = translateAttributes(html, lang);
    html = setMetadata(html, lang, page, targetUrl);
    html = translateJsonLd(html, dictionary, page.baseUrl, targetUrl, lang);
    if (page.family === 'marcas') html = removeTrademarkPricing(html);
    html = setActiveLanguage(html, lang);
    fs.mkdirSync(path.dirname(path.join(root, target)), { recursive: true });
    fs.writeFileSync(path.join(root, target), html);
  }
}

console.log(`Synchronized ${pages.length * 2} translated pages from their Spanish originals.`);
