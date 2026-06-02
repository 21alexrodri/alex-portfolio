// ─────────────────────────────────────────────────────────
// AÑADIR UN LIBRO NUEVO:
//   1. Copia uno de los bloques de abajo
//   2. Pégalo al final de su sección (education / experience)
//   3. Rellena los campos — los opcionales están marcados
//
// Los colores y tamaños se asignan solos, no hace falta tocarlos.
// ─────────────────────────────────────────────────────────

export const BOOKS_DATA = [

  // ── FORMACIÓN ───────────────────────────────────────────
  {
    section: 'education',
    spine: 'Grado Informática',       // texto corto del lomo
    period: '2021–2025',              // siempre visible en el lomo
    title: 'Grado en Ingeniería Informática',
    institution: 'Universitat Politècnica de Catalunya',
    description:
      'Especialización en ingeniería del software y sistemas inteligentes. ' +
      'Proyectos en inteligencia artificial, desarrollo web y sistemas distribuidos.',
    // tags: ['Python', 'Java', 'SQL'],        // opcional
    // certificate: '/certs/grado.pdf',        // opcional — pon el PDF en public/certs/
  },

  {
    section: 'education',
    spine: 'CFGS DAW',
    period: '2019–2021',
    title: 'CFGS — Desarrollo de Aplicaciones Web',
    institution: 'Institut XYZ · Barcelona',
    description:
      'Formación en desarrollo web front-end y back-end: HTML, CSS, JavaScript, PHP, ' +
      'SQL y metodologías de proyecto. Prácticas en empresa incluidas.',
    tags: ['HTML', 'CSS', 'JavaScript', 'PHP'],
    certificate: '/certs/cfgs-daw.pdf',
  },

  {
    section: 'education',
    spine: 'Cambridge B2',
    period: '2020',
    title: 'Cambridge English: First (FCE) — Nivel B2',
    institution: 'Cambridge Assessment English',
    description:
      'Certificación oficial de inglés nivel B2 del Marco Común Europeo de Referencia.',
    certificate: '/certs/cambridge-b2.pdf',
  },

  // ── EXPERIENCIA ─────────────────────────────────────────
  {
    section: 'experience',
    spine: 'Dev. Frontend',
    period: '2024–hoy',
    title: 'Desarrollador Frontend',
    institution: 'Nombre de la empresa',
    description:
      'Desarrollo de interfaces web con React y TypeScript. Implementación de sistemas ' +
      'de diseño, optimización de rendimiento y colaboración con equipos de backend y diseño.',
    tags: ['React', 'TypeScript', 'Tailwind', 'Git'],
    // certificate: '/certs/recomendacion-empresa1.pdf',
  },

  {
    section: 'experience',
    spine: 'Prácticas Web',
    period: '2023',
    title: 'Prácticas — Desarrollo Web',
    institution: 'Otra empresa · Barcelona',
    description:
      'Desarrollo de aplicaciones web y APIs REST. Trabajo en equipo con metodología ' +
      'Scrum, integración continua y despliegue en entornos cloud.',
    tags: ['JavaScript', 'Node.js', 'MongoDB'],
    certificate: '/certs/recomendacion.pdf',
  },

]
