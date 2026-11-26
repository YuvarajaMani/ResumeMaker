(() => {
  'use strict';

  // Paper sizes in CSS px at 96dpi; `css` is the value for the print @page rule.
  const PAGE_SIZES = {
    a4: { label: 'A4', note: '210 × 297 mm', w: 794, h: 1123, css: 'A4' },
    letter: { label: 'US Letter', note: '8.5 × 11 in', w: 816, h: 1056, css: 'letter' },
    legal: { label: 'US Legal', note: '8.5 × 14 in', w: 816, h: 1344, css: 'legal' },
  };
  const paper = () => PAGE_SIZES[state.design.pageSize] || PAGE_SIZES.a4;
  const KEY = 'resumebuilder.state.v1';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const uid = () => Math.random().toString(36).slice(2, 10);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const words = (s) => (String(s || '').trim().match(/\S+/g) || []).length;

  /* ---------------- Icons ---------------- */
  const svg = (d) => `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const I = {
    save: svg('<path d="M5 3h11l3 3v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M7 3v5h8V3M7 21v-7h10v7"/>'),
    info: svg('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'),
    plus: svg('<path d="M12 5v14M5 12h14"/>'),
    layers: svg('<path d="M12 3 3 8l9 5 9-5-9-5Z"/><path d="m3 13 9 5 9-5"/>'),
    layout: svg('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/>'),
    palette: svg('<path d="M12 3a9 9 0 1 0 0 18c.9 0 1.5-.7 1.5-1.5 0-.4-.2-.8-.4-1.1-.3-.3-.4-.6-.4-1 0-.8.7-1.5 1.5-1.5H16a5 5 0 0 0 5-5c0-4.4-4-7.9-9-7.9Z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/>'),
    check: svg('<path d="m8.5 12.5 2.5 2.5 4.5-5"/><circle cx="12" cy="12" r="9"/>'),
    tick: svg('<path d="m6 12.5 4 4 8-9"/>'),
    file: svg('<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/>'),
    undo: svg('<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>'),
    redo: svg('<path d="m15 14 5-5-5-5"/><path d="M20 9H9a5 5 0 0 0 0 10h3"/>'),
    download: svg('<path d="M12 4v11"/><path d="m7 10 5 5 5-5"/><path d="M5 20h14"/>'),
    upload: svg('<path d="M12 20V9"/><path d="m7 14 5-5 5 5"/><path d="M5 4h14"/>'),
    phone: svg('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>'),
    mail: svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'),
    link: svg('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'),
    pin: svg('<path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12Z"/><circle cx="12" cy="9" r="2.5"/>'),
    cal: svg('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
    trash: svg('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
    up: svg('<path d="m6 15 6-6 6 6"/>'),
    down: svg('<path d="m6 9 6 6 6-6"/>'),
    swap: svg('<path d="M4 8h14l-4-4M20 16H6l4 4"/>'),
    list: svg('<path d="M10 6h10M10 12h10M10 18h10"/><path d="M4 6h.01M4 12h.01M4 18h.01" stroke-width="3"/>'),
    x: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
    star: svg('<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9Z"/>'),
    bolt: svg('<path d="M13 3 4 14h7l-1 7 9-11h-7z"/>'),
    grip: svg('<path d="M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01" stroke-width="3"/>'),
    camera: svg('<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>'),
    refresh: svg('<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>'),
    pencil: svg('<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>'),
    eye: svg('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>'),
    scan: svg('<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><path d="M8 9h8M8 12h8M8 15h5"/>'),
    copy: svg('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>'),
    sliders: svg('<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>'),
  };

  /* ---------------- Config ---------------- */
  const FONTS = [
    { name: 'Inter', css: "'Inter', system-ui, sans-serif" },
    { name: 'Lato', css: "'Lato', 'Segoe UI', sans-serif" },
    { name: 'Roboto', css: "'Roboto', Arial, sans-serif" },
    { name: 'Open Sans', css: "'Open Sans', Arial, sans-serif" },
    { name: 'Montserrat', css: "'Montserrat', Arial, sans-serif" },
    { name: 'Raleway', css: "'Raleway', Arial, sans-serif" },
    { name: 'Rubik', css: "'Rubik', Arial, sans-serif" },
    { name: 'Merriweather', css: "'Merriweather', Georgia, serif" },
    { name: 'PT Serif', css: "'PT Serif', Georgia, serif" },
    { name: 'Source Serif 4', css: "'Source Serif 4', Georgia, serif" },
  ];
  const ACCENTS = ['#0f766e', '#0e7490', '#1d4ed8', '#334155', '#15803d', '#b45309', '#be123c', '#6d28d9', '#111827'];
  // group: 'single' = one column of content, 'two' = two columns.
  // datesRight: dates and location sit on the right of each entry's title.
  // font (optional): the template also switches to this font.
  const LAYOUTS = [
    { id: 'single', group: 'single', name: 'Simple', desc: 'One linear column with accent bars. Clean and ATS-safe.', heading: 'bar' },
    { id: 'professional', group: 'single', name: 'Professional', desc: 'Dates aligned right, ruled headings. The recruiter favourite.', heading: 'line', datesRight: true },
    { id: 'executive', group: 'single', name: 'Executive', desc: 'Bold colored header band for senior roles.', heading: 'accent', datesRight: true },
    { id: 'lefthead', group: 'single', name: 'Left headings', desc: 'Section titles in a narrow left gutter, content on the right.', heading: 'plain', datesRight: true },
    { id: 'timeline', group: 'single', name: 'Timeline', desc: 'Entries hang on a vertical timeline with dots.', heading: 'accent' },
    { id: 'minimal', group: 'single', name: 'Minimal', desc: 'Light type, lots of white space, no icons.', heading: 'plain' },
    { id: 'elegant', group: 'single', name: 'Elegant', desc: 'Centered serif layout with ornamental headings.', heading: 'plain', font: 'Source Serif 4' },
    { id: 'classic', group: 'single', name: 'Classic', desc: 'Centered header and ruled sections. Formal and timeless.', heading: 'line' },
    { id: 'modern', group: 'single', name: 'Modern', desc: 'Accent-colored name and short underlined headings.', heading: 'plain', datesRight: true },
    { id: 'compact', group: 'single', name: 'Compact', desc: 'Tighter spacing and smaller headings. Fits more on one page.', heading: 'line', datesRight: true },
    { id: 'boxed', group: 'single', name: 'Boxed headings', desc: 'Section titles sit in tinted full-width bands.', heading: 'plain', datesRight: true },
    { id: 'bold', group: 'single', name: 'Bold', desc: 'Thick accent top border and a large uppercase name.', heading: 'accent' },
    { id: 'academic', group: 'single', name: 'Academic', desc: 'Serif type and small-caps headings. Suits research and CVs.', heading: 'line', datesRight: true, font: 'Merriweather' },
    { id: 'splithead', group: 'single', name: 'Split header', desc: 'Name on the left, contact details stacked on the right.', heading: 'line', datesRight: true },
    { id: 'ats', group: 'single', name: 'ATS plain', desc: 'Black and white, no icons or color. Parses perfectly.', heading: 'line', datesRight: true, font: 'PT Serif' },
    { id: 'double', group: 'two', name: 'Double column', desc: 'Two columns: experience on the left, skills on the right.', heading: 'line' },
    { id: 'sidebar', group: 'two', name: 'Sidebar', desc: 'Colored sidebar for contact details, skills and languages.', heading: 'accent' },
  ];
  const HEADINGS = [['line', 'Ruled'], ['accent', 'Accent'], ['bar', 'Bar'], ['plain', 'Plain']];

  const TYPES = {
    summary: { label: 'Summary', hint: 'A short pitch: who you are and what you bring.', title: 'Summary', col: 'left', focus: 'text', item: () => ({ text: '' }) },
    experience: { label: 'Experience', hint: 'Roles, companies and the impact you made.', title: 'Experience', col: 'left', focus: 'role', item: () => ({ role: '', company: '', dates: '', location: '', desc: '', bullets: [''] }) },
    education: { label: 'Education', hint: 'Degrees, schools and grades.', title: 'Education', col: 'right', focus: 'degree', item: () => ({ degree: '', school: '', dates: '', location: '', gpa: '' }) },
    projects: { label: 'Projects', hint: 'Side projects, open source or key initiatives.', title: 'Projects', col: 'left', focus: 'name', item: () => ({ name: '', link: '', dates: '', desc: '', bullets: [''] }) },
    skills: { label: 'Skills', hint: 'Tools, technologies and methods.', title: 'Skills', col: 'right', focus: 'name', item: () => ({ name: '', rating: 4, list: '' }) },
    languages: { label: 'Languages', hint: 'Spoken languages with a proficiency rating.', title: 'Languages', col: 'right', focus: 'name', item: () => ({ name: '', level: '', rating: 3 }) },
    certifications: { label: 'Certifications', hint: 'Licences and professional certificates.', title: 'Certifications', col: 'right', focus: 'name', item: () => ({ name: '', issuer: '', date: '' }) },
    achievements: { label: 'Key achievements', hint: 'Your proudest wins, with results.', title: 'Key Achievements', col: 'right', focus: 'title', item: () => ({ title: '', desc: '' }) },
    strengths: { label: 'Strengths', hint: 'What you are known for, with evidence.', title: 'Strengths', col: 'right', focus: 'title', item: () => ({ title: '', desc: '' }) },
    volunteering: { label: 'Volunteering', hint: 'Unpaid roles and community work.', title: 'Volunteering', col: 'left', focus: 'role', item: () => ({ role: '', company: '', dates: '', location: '', desc: '', bullets: [''] }) },
    interests: { label: 'Interests', hint: 'Hobbies that add personality.', title: 'Interests', col: 'right', focus: 'name', item: () => ({ name: '' }) },
    custom: { label: 'Custom section', hint: 'Anything else: awards, publications, courses.', title: 'Custom Section', col: 'left', focus: 'title', item: () => ({ title: '', sub: '', dates: '', desc: '' }) },
  };
  const TAG_TYPES = new Set(['skills', 'interests']);
  // Skills grouped by category (Backend: Java, Kafka). Each item is one category with a comma list.
  const isCat = (sec) => sec.type === 'skills' && /^cat/.test(variantOf(sec));
  // Split "Java, Python (Pandas, NumPy), Go" on commas, but not on commas inside brackets.
  const splitSkills = (txt) => {
    const out = [];
    let cur = '';
    let depth = 0;
    for (const ch of String(txt || '')) {
      if ('([{'.includes(ch)) depth++;
      else if (')]}'.includes(ch)) depth = Math.max(0, depth - 1);
      if (!depth && (ch === ',' || ch === ';' || ch === '\n')) { out.push(cur); cur = ''; } else cur += ch;
    }
    out.push(cur);
    return out.map((x) => x.trim()).filter(Boolean);
  };

  // Optional fields the user can show or hide, per section type (applies to every entry) and for the header.
  const ENTRY_FIELDS = (org) => [['company', org], ['dates', 'Dates'], ['location', 'Location'], ['desc', 'Description'], ['bullets', 'Bullet points']];
  // Bullet styles for sections with bullet points: [id, name, glyph shown in the picker]
  const BULLET_STYLES = [
    ['disc', 'Dot', '●'],
    ['circle', 'Circle', '○'],
    ['square', 'Square', '■'],
    ['dash', 'Dash', '–'],
    ['arrow', 'Arrow', '›'],
    ['triangle', 'Triangle', '▸'],
    ['check', 'Check', '✓'],
    ['diamond', 'Diamond', '◆'],
    ['number', 'Numbered', '1.'],
    ['none', 'None', '∅'],
  ];
  // How a section's bullet points are laid out: [id, name, description]
  const BULLET_LAYOUTS = [
    ['list', 'List', 'One point per line'],
    ['para', 'Paragraph', 'Points flow together as one paragraph'],
    ['inline', 'Inline', 'Points on running lines, separated by the bullet'],
    ['cols', 'Two columns', 'Short points side by side'],
  ];
  // Text alignment for a section's paragraphs, descriptions and bullet points
  const alignIcon = (lines) => `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">${lines.map(([x1, x2], i) => `<path d="M${x1} ${5 + i * 4.67}H${x2}"/>`).join('')}</svg>`;
  const ALIGNS = [
    ['left', 'Left', alignIcon([[4, 20], [4, 14], [4, 20], [4, 14]])],
    ['center', 'Center', alignIcon([[4, 20], [7, 17], [4, 20], [7, 17]])],
    ['right', 'Right', alignIcon([[4, 20], [10, 20], [4, 20], [10, 20]])],
    ['justify', 'Justify', alignIcon([[4, 20], [4, 20], [4, 20], [4, 20]])],
  ];
  const ENTRY_ONLY = {
    summary: [],
    experience: ENTRY_FIELDS('Company'),
    volunteering: ENTRY_FIELDS('Organization'),
    education: [['school', 'School'], ['dates', 'Dates'], ['location', 'Location'], ['gpa', 'GPA']],
    projects: [['link', 'Link or role'], ['dates', 'Dates'], ['desc', 'Summary'], ['bullets', 'Bullet points']],
    skills: [['rating', 'Level bars (Skill bars style)']],
    interests: [],
    languages: [['level', 'Proficiency'], ['rating', 'Rating graphic']],
    certifications: [['issuer', 'Issuer'], ['date', 'Date']],
    achievements: [['icon', 'Icon'], ['desc', 'Description']],
    strengths: [['icon', 'Icon'], ['desc', 'Description']],
    custom: [['sub', 'Subtitle'], ['dates', 'Dates'], ['desc', 'Description']],
  };
  // Every section can also hide its own heading.
  const FIELDS = Object.fromEntries(Object.entries(ENTRY_ONLY).map(([k, v]) => [k, [['heading', 'Section title'], ...v]]));
  const HEADER_FIELDS = [['title', 'Headline'], ['phone', 'Phone'], ['email', 'Email'], ['link', 'LinkedIn / portfolio'], ['location', 'Location'], ['photo', 'Photo']];
  const cleanHide = (arr, allowed) => (Array.isArray(arr) ? [...new Set(arr.map(String))].filter((k) => allowed.some(([f]) => f === k)) : []);

  // Per-section display styles: [key, name, description]. The first one is the default.
  const ENTRY_V = [
    ['standard', 'Standard', 'Title, organization and dates stacked'],
    ['compact', 'Compact', 'Title and organization on one line, dates right'],
    ['dates-left', 'Dates on left', 'Dates in a narrow column beside each entry'],
  ];
  const CARD_V = [
    ['icons', 'With icons', 'An accent icon beside each item'],
    ['plain', 'Plain', 'Text only, no icons'],
    ['grid', 'Two-column grid', 'Items side by side in two columns'],
  ];
  const VARIANTS = {
    summary: [['paragraph', 'Paragraph', 'Plain paragraph of text'], ['callout', 'Callout', 'Tinted block with an accent edge']],
    experience: ENTRY_V,
    volunteering: ENTRY_V,
    education: ENTRY_V,
    projects: ENTRY_V,
    custom: ENTRY_V,
    certifications: [['standard', 'Standard', 'Name, issuer and date stacked'], ['compact', 'Compact', 'Name and issuer on one line, date right']],
    skills: [
      ['tags', 'Tags', 'Each skill in a soft pill'],
      ['list', 'Bullet list', 'Skills in a dotted list, two per row'],
      ['inline', 'Comma list', 'One line of text separated by commas'],
      ['bars', 'Skill bars', 'Each skill with a 1–5 level bar'],
      ['cats', 'Categories', 'Bold category, then its skills: Backend: Java, Kafka'],
      ['catcols', 'Category columns', 'Categories in a left column, skills aligned beside them'],
      ['catstack', 'Category stacked', 'Category as a small heading, skills below it'],
      ['catbullets', 'Category bullets', 'One bulleted line per category'],
    ],
    interests: [['tags', 'Tags', 'Each interest in a soft pill'], ['list', 'Bullet list', 'Dotted list, two per row'], ['inline', 'Comma list', 'One line separated by commas']],
    languages: [['dots', 'Dots', 'Five dots show proficiency'], ['bar', 'Bar', 'A segmented bar shows proficiency'], ['text', 'Text only', 'Language and level, no graphic']],
    achievements: CARD_V,
    strengths: CARD_V,
  };
  const variantOf = (sec) => {
    const list = VARIANTS[sec.type];
    return list.some(([k]) => k === sec.variant) ? sec.variant : list[0][0];
  };

  const VERBS = new Set(('achieved accelerated adopted advised analyzed architected automated boosted built championed coached collaborated completed consolidated coordinated created cut decreased defined delivered designed developed directed drove eliminated enabled engineered established expanded facilitated founded generated grew guided halved implemented improved increased initiated introduced launched led maintained managed mentored migrated modernized negotiated optimized orchestrated organized overhauled owned partnered pioneered planned produced rebuilt redesigned reduced refactored resolved restructured revamped saved scaled secured shipped simplified spearheaded standardized streamlined strengthened supervised taught tested trained transformed tripled doubled unified upgraded won wrote').split(' '));

  /* ---------------- State ---------------- */
  const defaultDesign = () => ({ layout: 'double', accent: '#0f766e', font: 'Inter', fontSize: 12.5, lineHeight: 1.45, sectionGap: 18, margin: 40, ratio: 62, heading: 'line', showPhoto: true, pageSize: 'a4', headFont: '' });
  const blankHeader = () => ({ name: '', title: '', phone: '', email: '', link: '', location: '', photo: '' });
  const newSection = (type) => ({ id: uid(), type, title: TYPES[type].title, column: TYPES[type].col, variant: VARIANTS[type][0][0], items: [TYPES[type].item()] });

  // A made-up resume with random names, roles, numbers and skills: shown on first launch
  // (when nothing is saved yet) and by "Load random example". Every person, company and
  // contact detail is fictional; emails use example.com and phone numbers the 555 range.
  function randomResume() {
    const pick = (a) => a[Math.floor(Math.random() * a.length)];
    const int = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
    const some = (a, n) => [...a].sort(() => Math.random() - 0.5).slice(0, n);
    const sec = (type, items, extra = {}) => ({ id: uid(), type, title: TYPES[type].title, column: TYPES[type].col, items, ...extra });
    const mmYYYY = (y, m) => `${String(m).padStart(2, '0')}/${y}`;

    const first = pick(['Avery', 'Jordan', 'Priya', 'Mateo', 'Hana', 'Leo', 'Amara', 'Noah', 'Sofia', 'Kai', 'Elena', 'Ravi', 'Chloe', 'Omar', 'Mei', 'Lucas']);
    const last = pick(['Patel', 'Nguyen', 'Garcia', 'Okafor', 'Larsen', 'Kim', 'Rossi', 'Haddad', 'Silva', 'Novak', 'Tanaka', 'Murphy', 'Fischer', 'Mensah']);
    const city = pick(['Austin, TX', 'Seattle, WA', 'Denver, CO', 'Toronto, ON', 'London, UK', 'Berlin, Germany', 'Bengaluru, India', 'Singapore', 'Amsterdam, NL', 'Sydney, AU']);

    const fields = [
      { area: 'Backend', role: 'Software Engineer', skills: ['Java', 'Spring Boot', 'Go', 'PostgreSQL', 'Kafka', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'gRPC', 'REST APIs', 'Microservices'],
        wins: ['Cut API p95 latency from {a} ms to {b} ms by redesigning the caching layer.', 'Built an event pipeline processing {k}k messages per second with zero data loss.', 'Migrated {n} services to Kubernetes, saving ${k}k per year in hosting costs.', 'Introduced contract tests that reduced production incidents by {p}%.', 'Mentored {s} engineers; {t} were promoted within a year.'] },
      { area: 'Frontend', role: 'Frontend Engineer', skills: ['TypeScript', 'React', 'Next.js', 'CSS', 'Accessibility', 'GraphQL', 'Jest', 'Playwright', 'Vite', 'Design systems', 'Web performance', 'Storybook'],
        wins: ['Rebuilt the checkout flow in React, lifting conversion by {p}%.', 'Cut bundle size by {p}% and Largest Contentful Paint from {a} ms to {b} ms.', 'Led a design system adopted by {n} product teams.', 'Raised accessibility score to 100 across {n} key pages.', 'Mentored {s} engineers through structured code reviews.'] },
      { area: 'Data', role: 'Data Engineer', skills: ['Python', 'SQL', 'Spark', 'Airflow', 'dbt', 'Snowflake', 'BigQuery', 'Kafka', 'Pandas', 'Terraform', 'Data modeling', 'Looker'],
        wins: ['Built a lakehouse serving {n} teams, replacing {s} legacy pipelines.', 'Reduced nightly ETL runtime from {t} hours to {b} minutes.', 'Cut warehouse spend by ${k}k per year through query tuning.', 'Introduced data quality checks that caught {p}% of bad loads before release.', 'Mentored {s} analysts in SQL and dbt best practices.'] },
      { area: 'Platform', role: 'DevOps Engineer', skills: ['AWS', 'Azure', 'Terraform', 'Kubernetes', 'Helm', 'GitHub Actions', 'Jenkins', 'Prometheus', 'Grafana', 'Linux', 'Bash', 'Python'],
        wins: ['Cut deployment time from {t} hours to {b} minutes with a new CI/CD pipeline.', 'Raised uptime to 99.9{s}% across {n} production services.', 'Reduced cloud spend by ${k}k per year with rightsizing and autoscaling.', 'Halved mean time to recovery with better alerting and runbooks.', 'Automated environment setup for {n} teams with Terraform modules.'] },
    ];
    const f = pick(fields);
    const fill = (s) => s.replace(/\{a\}/g, int(400, 900)).replace(/\{b\}/g, int(40, 180)).replace(/\{k\}/g, int(40, 480))
      .replace(/\{n\}/g, int(6, 40)).replace(/\{p\}/g, int(12, 65)).replace(/\{s\}/g, int(3, 8)).replace(/\{t\}/g, int(2, 6));

    const companies = some(['Northwind Labs', 'Brightline Analytics', 'Copperleaf Studio', 'Bluepeak Systems', 'Lumen Health', 'Harbor Freight Tech', 'Silverline Bank', 'Quantum Retail', 'Evergreen Logistics', 'Atlas Media'], 3);
    const now = new Date().getFullYear();
    const y1 = now - int(1, 3);
    const y2 = y1 - int(2, 4);
    const y3 = y2 - int(2, 3);
    const years = now - y3;
    const m = () => int(1, 12);
    const job = (title, company, from, to, n) => ({
      role: title, company, dates: `${from} – ${to}`, location: pick([city, 'Remote', 'Hybrid']), desc: '',
      bullets: some(f.wins, n).map(fill),
    });

    return {
      meta: { name: `${first} ${last} – ${f.role}` },
      header: {
        name: `${first} ${last}`, title: `Senior ${f.role} · ${f.area}`,
        phone: `+1 (555) 0${int(10, 99)}-${int(1000, 9999)}`, email: `${first}.${last}@example.com`.toLowerCase(),
        link: `linkedin.com/in/${first}-${last}`.toLowerCase(), location: city, photo: '',
      },
      design: { ...defaultDesign(), layout: pick(['professional', 'single', 'modern', 'compact', 'classic']), accent: pick(ACCENTS.slice(0, 8)) },
      sections: [
        sec('summary', [{ text: `${f.area} engineer with ${years}+ years of experience building reliable, well-measured software. Known for turning ambiguous goals into shipped products, improving performance and cost, and helping teammates grow.` }]),
        sec('experience', [
          job(`Senior ${f.role}`, companies[0], mmYYYY(y1, m()), 'Present', 4),
          job(f.role, companies[1], mmYYYY(y2, m()), mmYYYY(y1, m()), 3),
          job(`Junior ${f.role}`, companies[2], mmYYYY(y3, m()), mmYYYY(y2, m()), 2),
        ]),
        sec('skills', some(f.skills, 10).map((name) => ({ name, rating: int(3, 5), list: '' })), { variant: pick(['tags', 'inline', 'list']) }),
        sec('projects', [{ name: pick(['OpenLedger', 'Pathfinder', 'Tidewatch', 'Beacon', 'Keystone']), link: `github.com/${first}${last}`.toLowerCase(), dates: `${now - 2} – Present`, desc: `Open-source ${f.area.toLowerCase()} tool used by other developers.`, bullets: [`Grew to ${int(200, 3000).toLocaleString('en-US')} GitHub stars and ${int(5, 60)} contributors.`] }]),
        sec('education', [{ degree: pick(['B.Sc. Computer Science', 'B.Tech Information Technology', 'B.Eng. Software Engineering', 'M.Sc. Computer Science']), school: pick(['State University', 'Institute of Technology', 'Metropolitan University', 'City College']), dates: `${y3 - 4} – ${y3}`, location: city, gpa: `GPA ${(3 + Math.random()).toFixed(1)} / 4.0` }]),
        sec('certifications', [(([name, issuer]) => ({ name, issuer, date: String(now - int(0, 3)) }))(pick([['AWS Certified Solutions Architect – Associate', 'Amazon Web Services'], ['Certified Kubernetes Administrator', 'The Linux Foundation'], ['Professional Data Engineer', 'Google Cloud'], ['Azure Developer Associate', 'Microsoft']]))]),
        sec('languages', [{ name: 'English', level: 'Fluent', rating: 5 }, { name: pick(['Spanish', 'German', 'Hindi', 'French', 'Japanese']), level: 'Professional', rating: int(3, 4) }]),
      ],
    };
  }

  function blankResume() {
    return {
      meta: { name: 'My Resume' },
      header: blankHeader(),
      design: defaultDesign(),
      sections: ['summary', 'experience', 'education', 'skills'].map(newSection),
    };
  }

  // Coerce any loaded/imported object into a safe, complete state.
  function normalize(s) {
    if (!s || typeof s !== 'object' || !Array.isArray(s.sections)) throw new Error('Not a resume file');
    const str = (v) => (v == null ? '' : String(v));
    const d = { ...defaultDesign(), ...(s.design || {}) };
    const dd = defaultDesign();
    if (!/^#[0-9a-f]{6}$/i.test(d.accent)) d.accent = dd.accent;
    if (!FONTS.some((f) => f.name === d.font)) d.font = dd.font;
    d.headFont = FONTS.some((f) => f.name === d.headFont) ? d.headFont : ''; // '' = same as body
    if (!LAYOUTS.some((l) => l.id === d.layout)) d.layout = dd.layout;
    if (!HEADINGS.some(([k]) => k === d.heading)) d.heading = dd.heading;
    for (const k of ['fontSize', 'lineHeight', 'sectionGap', 'margin', 'ratio']) d[k] = Number.isFinite(+d[k]) ? +d[k] : dd[k];
    d.showPhoto = !!d.showPhoto;
    if (!PAGE_SIZES[d.pageSize]) d.pageSize = dd.pageSize;
    const h = { ...blankHeader() };
    for (const k of Object.keys(h)) h[k] = str(s.header?.[k]);
    if (h.photo && !/^data:image\/(png|jpe?g|webp|gif);base64,/i.test(h.photo)) h.photo = '';
    const sections = [];
    for (const sec of s.sections) {
      const T = TYPES[sec?.type];
      if (!T) continue;
      const items = (Array.isArray(sec.items) ? sec.items : []).map((it) => {
        const base = T.item();
        for (const k of Object.keys(base)) {
          if (Array.isArray(base[k])) base[k] = Array.isArray(it?.[k]) ? it[k].map(str) : base[k];
          else if (k === 'rating') base[k] = it?.[k] == null ? base[k] : Math.min(5, Math.max(0, parseInt(it[k], 10) || 0));
          else base[k] = str(it?.[k]);
        }
        return base;
      });
      const out = { id: str(sec.id) || uid(), type: sec.type, title: str(sec.title ?? T.title), column: sec.column === 'right' ? 'right' : 'left', items };
      out.variant = variantOf({ type: sec.type, variant: sec.variant });
      out.space = Math.max(-16, Math.min(120, Math.round(+sec.space) || 0));
      const hide = cleanHide(sec.hide, FIELDS[sec.type] || []);
      if (hide.length) out.hide = hide;
      if (sec.itemGap != null && sec.itemGap !== '' && Number.isFinite(+sec.itemGap)) out.itemGap = Math.max(0, Math.min(40, Math.round(+sec.itemGap)));
      if (BULLET_STYLES.some(([k]) => k === sec.bullet) && sec.bullet !== 'disc') out.bullet = sec.bullet;
      if (ALIGNS.some(([k]) => k === sec.align) && sec.align !== 'left') out.align = sec.align;
      if (BULLET_LAYOUTS.some(([k]) => k === sec.bulletLayout) && sec.bulletLayout !== 'list') out.bulletLayout = sec.bulletLayout;
      sections.push(out);
    }
    const hh = cleanHide(s.header?.hide, HEADER_FIELDS).filter((k) => k !== 'photo');
    if (hh.length) h.hide = hh;
    return { meta: { name: str(s.meta?.name) || 'My Resume' }, header: h, design: d, sections };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return normalize(JSON.parse(raw));
    } catch (e) { /* fall through to sample */ }
    return randomResume(); // nothing saved yet: start from a random example (a saved file still wins, see syncWithDisk)
  }

  let state = load();
  let past = [];
  let future = [];
  let typing = false;
  let typingTimer = 0;
  let zoom = 1;
  let pages = 1;
  let drawerKind = null;
  let designDirty = false;
  let fontTarget = 'head'; // which font list the Design panel is editing: 'head' or 'body'

  const getPath = (path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), state);
  function setPath(path, value) {
    const keys = path.split('.');
    const last = keys.pop();
    const parent = keys.reduce((o, k) => (o == null ? undefined : o[k]), state);
    if (parent != null) parent[last] = value;
  }

  /* ---------------- History ---------------- */
  function snapshot() {
    past.push(JSON.stringify(state));
    if (past.length > 150) past.shift();
    future = [];
  }
  function mutate(fn) {
    snapshot();
    fn();
    render();
  }
  function undo() {
    if (!past.length) return;
    future.push(JSON.stringify(state));
    state = JSON.parse(past.pop());
    render();
  }
  function redo() {
    if (!future.length) return;
    past.push(JSON.stringify(state));
    state = JSON.parse(future.pop());
    render();
  }
  function beginTyping() {
    if (!typing) { snapshot(); typing = true; }
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => { typing = false; }, 900);
  }

  /* ---------------- Persistence ---------------- */
  let saveTimer = 0;
  // Every change is saved twice: in this browser (localStorage) and, through the local server,
  // to resume-data.json in the Resume folder (C:\Resume by default). On startup the newer of the two wins, so the app
  // reopens with your latest edits in any browser and at any local address.
  const KEY_AT = KEY + '.savedAt';
  const API = '/api/resume';
  const canUseDisk = location.protocol.startsWith('http');
  let lastSavedJson = JSON.stringify(state); // what is on record; renders that change nothing don't re-save
  let diskOk = canUseDisk;

  let saveDetail = '';
  let lastSavedAt = +localStorage.getItem(KEY_AT) || 0;
  function setSaveState(text, detail = '') {
    const el = $('#saveState');
    el.innerHTML = `${esc(text)}${I.info}`;
    el.classList.toggle('warn', text !== 'Saved' && text !== 'Saving…');
    saveDetail = detail;
    if (!$('#savePop').hidden) renderSavePop();
  }

  // Another tab of the app saved this resume: this tab's copy is now out of date, and its next
  // save would overwrite those edits. Say so, once, instead of letting edits silently collide.
  let otherTabWarned = false;
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY || otherTabWarned || e.newValue === lastSavedJson) return;
    otherTabWarned = true;
    toast('This resume was just changed in another tab. Reload this tab before editing here, or your edits will replace those changes.');
  });

  function putDisk(body, keepalive = false) {
    if (!canUseDisk) return Promise.resolve(false);
    return fetch(API, {
      method: 'PUT', keepalive: keepalive && body.length < 60000,
      headers: { 'Content-Type': 'application/json', 'X-Resume-Builder': '1' }, body,
    }).then((r) => r.ok || r.status === 409).catch(() => false);
  }

  // force: write both copies even if nothing changed (the Save button), and report the result.
  function saveNow(keepalive = false, force = false) {
    clearTimeout(saveTimer);
    saveTimer = 0;
    const json = JSON.stringify(state);
    if (json === lastSavedJson && !force) {
      setSaveState('Saved', diskOk ? 'Saved in this browser and in your Resume folder' : '');
      return Promise.resolve({ local: true, disk: diskOk });
    }
    lastSavedJson = json;
    const savedAt = Date.now();
    lastSavedAt = savedAt;
    let local = true;
    try {
      localStorage.setItem(KEY, json);
      localStorage.setItem(KEY_AT, String(savedAt));
    } catch (e) {
      local = false;
    }
    return putDisk(`{"savedAt":${savedAt},"state":${json}}`, keepalive).then((ok) => {
      diskOk = ok;
      if (!saveTimer) { // otherwise a newer change is already waiting to be saved
        if (ok) setSaveState('Saved', 'Saved in this browser and in your Resume folder');
        else if (local) setSaveState('Saved in this browser', canUseDisk ? 'Could not reach the local server, so the file copy was not updated' : 'Open the app through its local server to also save a file copy');
        else setSaveState('Not saved', 'Browser storage is full and the local server could not be reached');
      }
      return { local, disk: ok };
    });
  }

  /* ----- Save button and "where is it saved" panel ----- */
  let diskInfo = null;
  const fmtTime = (t) => (t ? new Date(t).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Not yet');
  const fmtSize = (n) => (n > 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB');

  function loadDiskInfo() {
    if (!canUseDisk) return Promise.resolve(null);
    return fetch('/api/info', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null)
      .then((info) => { diskInfo = info; return info; });
  }

  function renderSavePop() {
    const p = $('#savePop');
    const fileRow = !canUseDisk
      ? `<div class="sp-row off"><b>Resume file</b><span>Not in use. Start the app with <code>npm start</code> and open http://localhost:5173 to also save a file copy.</span></div>`
      : diskInfo
        ? `<div class="sp-row ${diskOk && diskInfo.exists ? 'ok' : 'bad'}"><b>Resume file</b>
             <code class="sp-path">${esc(diskInfo.file)}</code>
             <span>${diskInfo.exists ? `Last written ${esc(fmtTime(diskInfo.modified))} · ${fmtSize(diskInfo.size)}` : 'Not created yet'}${diskOk ? '' : ' · The last save could not reach the local server'}</span>
             <button class="btn sm" data-copypath>${I.copy}<span>Copy path</span></button></div>`
        : `<div class="sp-row bad"><b>Resume file</b><span>Could not reach the local server, so the file copy is not being updated.</span></div>`;
    p.innerHTML = `
      <div class="sp-head"><strong>Where your resume is saved</strong><span>${esc(saveDetail || 'Every edit is saved automatically.')}</span></div>
      ${fileRow}
      <div class="sp-row ok"><b>This browser</b>
        <span>Browser storage for ${esc(location.host || 'this page')} · last saved ${esc(fmtTime(lastSavedAt))}</span></div>
      <p class="sp-note">When the app opens, it loads whichever copy is newer. The file holds your personal details, so don't share it. To keep a copy elsewhere, use Import / export.</p>`;
  }

  function openSavePop() {
    const p = $('#savePop');
    const btn = $('#saveState');
    renderSavePop();
    p.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    const r = btn.getBoundingClientRect();
    p.style.top = r.bottom + 8 + 'px';
    p.style.left = Math.max(8, Math.min(innerWidth - p.offsetWidth - 8, r.left - 20)) + 'px';
    loadDiskInfo().then(() => { if (!p.hidden) renderSavePop(); });
  }
  function closeSavePop() {
    $('#savePop').hidden = true;
    $('#saveState').setAttribute('aria-expanded', 'false');
  }

  function manualSave() {
    const btn = $('#saveBtn');
    btn.disabled = true;
    setSaveState('Saving…');
    saveNow(false, true).then(({ local, disk }) => {
      btn.disabled = false;
      if (disk) toast(diskInfo && diskInfo.file ? `Saved to this browser and to ${diskInfo.file}` : 'Saved to this browser and to your Resume folder');
      else if (local) toast(canUseDisk ? 'Saved in this browser only: the local server could not be reached' : 'Saved in this browser');
      else toast('Could not save. Use Import / export to download a copy.');
      loadDiskInfo().then(() => { if (!$('#savePop').hidden) renderSavePop(); });
    });
  }

  $('#saveBtn').addEventListener('click', manualSave);
  $('#saveState').addEventListener('click', () => ($('#savePop').hidden ? openSavePop() : closeSavePop()));
  $('#savePop').addEventListener('click', (e) => {
    if (!e.target.closest('[data-copypath]') || !diskInfo) return;
    navigator.clipboard.writeText(diskInfo.file).then(() => toast('File path copied'), () => toast(diskInfo.file));
  });
  document.addEventListener('mousedown', (e) => {
    if (!$('#savePop').hidden && !e.target.closest('#savePop, #saveState')) closeSavePop();
  });

  function scheduleSave() {
    setSaveState('Saving…');
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveNow(), 400);
  }

  // Save straight away when the tab is hidden or closed, so the last keystrokes are never lost.
  const flushSave = () => { if (saveTimer) saveNow(true); };
  window.addEventListener('pagehide', flushSave);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flushSave(); });

  // Load the copy on disk if it is newer than this browser's copy; otherwise update the disk copy.
  async function syncWithDisk() {
    if (!canUseDisk) return;
    let disk = null;
    try {
      const r = await fetch(API, { cache: 'no-store' });
      if (r.status === 200) disk = await r.json();
    } catch (e) {
      diskOk = false;
      setSaveState('Saved in this browser', 'Could not reach the local server, so the file copy was not updated');
      return;
    }
    const localAt = +localStorage.getItem(KEY_AT) || 0;
    if (disk && disk.state && Number.isFinite(disk.savedAt) && disk.savedAt > localAt && JSON.stringify(state) === lastSavedJson) {
      try {
        state = normalize(disk.state);
      } catch (e) {
        return;
      }
      past = [];
      future = [];
      lastSavedJson = JSON.stringify(state);
      try {
        localStorage.setItem(KEY, lastSavedJson);
        localStorage.setItem(KEY_AT, String(disk.savedAt));
      } catch (e) { /* the disk copy still has it */ }
      lastSavedAt = disk.savedAt;
      render();
      setSaveState('Saved', 'Loaded your latest edits from resume-data.json');
    } else if (localStorage.getItem(KEY) && (!disk || localAt > disk.savedAt)) {
      // This browser has the newer copy: write it to disk.
      const json = JSON.stringify(state);
      const at = localAt || Date.now();
      putDisk(`{"savedAt":${at},"state":${json}}`).then((ok) => { diskOk = ok; });
    }
  }

  /* ---------------- Rendering ---------------- */
  // Fields hidden in the section (or header) being rendered right now.
  let curHide = new Set();
  const isHidden = (k) => curHide.has(k);
  const secHidden = (sec) => new Set(sec.hide || []);
  const headHidden = () => new Set(state.header.hide || []);
  // Header values with hidden fields blanked, for the ATS preview and resume check.
  const visHeader = () => {
    const h = { ...state.header };
    for (const k of headHidden()) h[k] = '';
    return h;
  };

  function ce(path, ph, cls = '', opts = {}) {
    if (isHidden(path.split('.').pop())) return '';
    const attrs = [`class="ce ${cls}"`, 'contenteditable="true"', 'spellcheck="true"', `data-path="${path}"`, `data-ph="${esc(ph)}"`];
    if (opts.multi) attrs.push('data-multi="1"');
    if (opts.kind) attrs.push(`data-kind="${opts.kind}"`);
    return `<div ${attrs.join(' ')}>${esc(getPath(path) ?? '')}</div>`;
  }
  const meta = (parts) => {
    const shown = parts.filter(([, path]) => !isHidden(path.split('.').pop()));
    return shown.length ? `<div class="meta">${shown.map(([icon, path, ph]) => `<span class="m">${icon}${ce(path, ph, 'inl')}</span>`).join('')}</div>` : '';
  };
  const bullets = (b, arr) => (arr && arr.length && !isHidden('bullets')
    ? `<ul class="bullets">${arr.map((_, k) => `<li>${ce(`${b}.bullets.${k}`, 'Type a bullet point', '', { kind: 'bullet' })}<button class="b-add" data-act="bullet-below" data-k="${k}" title="Add a bullet point below this line" aria-label="Add a bullet point below" tabindex="-1">${I.plus}</button></li>`).join('')}</ul>`
    : '');

  const ITEM = {
    experience: (b, it) => `${ce(b + '.role', 'Title', 'it-title')}${ce(b + '.company', 'Company name', 'it-sub')}${meta([[I.cal, b + '.dates', 'Date period'], [I.pin, b + '.location', 'Location']])}${ce(b + '.desc', 'Company description (optional)', 'it-desc', { multi: true })}${bullets(b, it.bullets)}`,
    volunteering: (b, it) => `${ce(b + '.role', 'Role', 'it-title')}${ce(b + '.company', 'Organization', 'it-sub')}${meta([[I.cal, b + '.dates', 'Date period'], [I.pin, b + '.location', 'Location']])}${ce(b + '.desc', 'What was the mission? (optional)', 'it-desc', { multi: true })}${bullets(b, it.bullets)}`,
    education: (b) => `${ce(b + '.degree', 'Degree and field of study', 'it-title')}${ce(b + '.school', 'School or university', 'it-sub')}${meta([[I.cal, b + '.dates', 'Date period'], [I.pin, b + '.location', 'Location'], ['', b + '.gpa', 'GPA (optional)']])}`,
    projects: (b, it) => `${ce(b + '.name', 'Project name', 'it-title')}${ce(b + '.link', 'Link or your role', 'it-sub')}${meta([[I.cal, b + '.dates', 'Date period']])}${ce(b + '.desc', 'Short summary of the project', 'it-desc', { multi: true })}${bullets(b, it.bullets)}`,
    languages: (b, it) => `<div class="lang"><div class="lang-l">${ce(b + '.name', 'Language', 'it-title inl')}${ce(b + '.level', 'Proficiency', 'lang-lvl inl')}</div>${isHidden('rating') ? '' : `<div class="dots">${[1, 2, 3, 4, 5].map((n) => `<button class="dot ${n <= it.rating ? 'on' : ''}" data-act="rate" data-v="${n}" tabindex="-1" title="${n} of 5" aria-label="Rate ${n} of 5"></button>`).join('')}</div>`}</div>`,
    certifications: (b) => `${ce(b + '.name', 'Certification name', 'it-title')}${ce(b + '.issuer', 'Issuing organization', 'it-sub')}${meta([[I.cal, b + '.date', 'Date']])}`,
    achievements: (b) => `<div class="ach">${isHidden('icon') ? '' : `<span class="ach-ic">${I.star}</span>`}<div class="ach-b">${ce(b + '.title', 'What did you achieve?', 'it-title')}${ce(b + '.desc', 'Describe the result and why it mattered', 'it-desc', { multi: true })}</div></div>`,
    strengths: (b) => `<div class="ach">${isHidden('icon') ? '' : `<span class="ach-ic">${I.bolt}</span>`}<div class="ach-b">${ce(b + '.title', 'Your strength', 'it-title')}${ce(b + '.desc', 'Back it up with an example', 'it-desc', { multi: true })}</div></div>`,
    custom: (b) => `${ce(b + '.title', 'Title', 'it-title')}${ce(b + '.sub', 'Subtitle', 'it-sub')}${meta([[I.cal, b + '.dates', 'Date period']])}${ce(b + '.desc', 'Description', 'it-desc', { multi: true })}`,
  };

  function itemHTML(sec, si, it, ii) {
    const b = `sections.${si}.items.${ii}`;
    if (sec.type === 'summary') {
      return `<div class="item" data-s="${si}" data-i="${ii}">${ce(b + '.text', 'Summarize your experience, strengths and what you are looking for.', '', { multi: true })}</div>`;
    }
    const tools = `<div class="tools item-tools">
      ${Array.isArray(it.bullets) && !isHidden('bullets') ? `<button data-act="bullet-add" title="Add bullet point">${I.list}</button>` : ''}
      <button data-act="item-add" title="Add entry below">${I.plus}</button>
      <button data-act="item-up" title="Move up">${I.up}</button>
      <button data-act="item-down" title="Move down">${I.down}</button>
      <button data-act="item-del" class="danger" title="Delete entry">${I.trash}</button>
    </div>`;
    return `<div class="item" data-s="${si}" data-i="${ii}">${tools}${ITEM[sec.type](b, it)}</div>`;
  }

  function sectionHTML(sec, si, twoCol) {
    let body;
    const addLabel = { skills: 'Add skill', interests: 'Add interest' }[sec.type] || 'Add entry';
    if (!sec.items.length) {
      body = `<button class="empty-add" data-act="sec-add">+ ${addLabel}</button>`;
    } else if (isCat(sec)) {
      body = `<div class="cats">${sec.items.map((it, ii) => `<div class="cat" data-s="${si}" data-i="${ii}">${ce(`sections.${si}.items.${ii}.name`, 'Category', 'cat-name')}${ce(`sections.${si}.items.${ii}.list`, 'Skills, separated by commas', 'cat-list', { kind: 'catlist' })}<button class="tag-x" data-act="item-del" title="Remove category" tabindex="-1">${I.x}</button></div>`).join('')}</div>`;
      if (!sec.items.some((it) => String(it.name || '').trim() || String(it.list || '').trim())) body += `<button class="empty-add tags-add" data-act="sec-add">+ Add category</button>`;
    } else if (TAG_TYPES.has(sec.type)) {
      const ph = sec.type === 'skills' ? 'Skill' : 'Interest';
      const bars = variantOf(sec) === 'bars' && !secHidden(sec).has('rating');
      body = `<div class="tags">${sec.items.map((it, ii) => `<span class="tag" data-s="${si}" data-i="${ii}">${ce(`sections.${si}.items.${ii}.name`, ph, 'inl', { kind: 'tag' })}${bars ? `<span class="sbar">${[1, 2, 3, 4, 5].map((n) => `<button class="${n <= (it.rating ?? 4) ? 'on' : ''}" data-act="rate" data-v="${n}" tabindex="-1" aria-label="Level ${n} of 5"></button>`).join('')}</span>` : ''}<button class="tag-x" data-act="item-del" title="Remove" tabindex="-1">${I.x}</button></span>`).join('')}</div>`;
      // Every tag is still blank (and so hidden): give the section something to click.
      if (!sec.items.some((it) => String(it.name || '').trim())) body += `<button class="empty-add tags-add" data-act="sec-add">+ ${addLabel}</button>`;
    } else {
      curHide = secHidden(sec);
      body = sec.items.map((it, ii) => itemHTML(sec, si, it, ii)).join('');
      curHide = new Set();
    }
    const canAdd = sec.type !== 'summary';
    const style = [
      sec.space ? `margin-bottom:calc(var(--gap) + ${sec.space}px)` : '',
      sec.itemGap != null ? `--igap:${sec.itemGap}px` : '',
    ].filter(Boolean).join(';');
    return `<section class="sec sec-${sec.type} v-${variantOf(sec)}${sec.bullet ? ` b-${sec.bullet}` : ''}${sec.bulletLayout ? ` bl-${sec.bulletLayout}` : ''}${sec.align ? ` al-${sec.align}` : ''}" data-s="${si}"${style ? ` style="${style}"` : ''}>
      <div class="sec-resize" title="Drag to change the space below this section"></div>
      <div class="tools sec-tools">
        ${canAdd ? `<button data-act="sec-add" title="Add entry">${I.plus}<span>${isCat(sec) ? 'Category' : { skills: 'Skill', interests: 'Interest' }[sec.type] || 'Entry'}</span></button>` : ''}
        <button data-act="sec-fields" title="Show or hide fields">${I.eye}<span>Fields</span></button>
        <button data-act="sec-style" title="Change how this section looks">${I.sliders}<span>Style</span></button>
        <button data-act="sec-up" title="Move section up">${I.up}</button>
        <button data-act="sec-down" title="Move section down">${I.down}</button>
        ${twoCol ? `<button data-act="sec-swap" title="Move to the other column">${I.swap}</button>` : ''}
        <button data-act="sec-del" class="danger" title="Delete section">${I.trash}</button>
      </div>
      ${secHidden(sec).has('heading') ? '' : `<h2 class="sec-title">${ce(`sections.${si}.title`, 'Section title', 'inl')}</h2>`}
      <div class="sec-body">${body}</div>
    </section>`;
  }

  const contactsHTML = () => {
    const hid = headHidden();
    const shown = [
      ['phone', 'header.phone', 'Phone'],
      ['mail', 'header.email', 'Email'],
      ['link', 'header.link', 'LinkedIn / portfolio'],
      ['pin', 'header.location', 'City, Country'],
    ].filter(([, p]) => !hid.has(p.split('.')[1]));
    return shown.length ? `<div class="contacts">${shown.map(([ic, p, ph]) => `<span class="c">${I[ic]}${ce(p, ph, 'inl')}</span>`).join('')}</div>` : '';
  };
  const headTools = () => `<div class="tools head-tools"><button data-act="head-fields" title="Show or hide header fields">${I.eye}<span>Fields</span></button></div>`;

  const photoHTML = () => {
    const p = state.header.photo;
    return `<div class="photo ${p ? '' : 'empty'}" data-act="photo" title="Upload photo">${p ? `<img src="${esc(p)}" alt="">` : I.camera}<span class="photo-edit">${p ? 'Change' : 'Add photo'}</span></div>`;
  };
  const nameBlock = (withContacts) => `<div class="r-head-main">${ce('header.name', 'Your Name', 'name')}${headHidden().has('title') ? '' : ce('header.title', 'The role you are targeting', 'headline')}${withContacts ? contactsHTML() : ''}</div>`;

  const isTwoCol = () => state.design.layout === 'double' || state.design.layout === 'sidebar';

  function render(opts = {}) {
    const d = state.design;
    const page = $('#page');
    const font = FONTS.find((f) => f.name === d.font) || FONTS[0];
    const two = isTwoCol();
    const lay = LAYOUTS.find((l) => l.id === d.layout) || LAYOUTS[0];
    page.className = `page layout-${d.layout} hs-${d.heading}${lay.datesRight ? ' dr' : ''}`;
    page.style.setProperty('--accent', d.accent);
    page.style.setProperty('--rfont', font.css);
    const hfont = FONTS.find((f) => f.name === d.headFont);
    page.style.setProperty('--hfont', hfont ? hfont.css : font.css);
    page.style.setProperty('--fs', d.fontSize + 'px');
    page.style.setProperty('--lh', d.lineHeight);
    page.style.setProperty('--gap', d.sectionGap + 'px');
    page.style.setProperty('--pad', d.margin + 'px');
    const pp = paper();
    page.style.width = pp.w + 'px';
    let ps = document.getElementById('pageSizeStyle');
    if (!ps) {
      ps = document.createElement('style');
      ps.id = 'pageSizeStyle';
      document.head.appendChild(ps);
    }
    ps.textContent = `@media print { @page { size: ${pp.css}; margin: 0; } }`;

    const L = [];
    const R = [];
    const ALL = [];
    state.sections.forEach((s, si) => {
      const h = sectionHTML(s, si, two);
      ALL.push(h);
      (s.column === 'right' ? R : L).push(h);
    });
    const photo = d.showPhoto ? photoHTML() : '';

    let html;
    if (d.layout === 'double') {
      page.style.gridTemplateColumns = '';
      html = `<header class="r-head">${headTools()}${nameBlock(true)}${photo}</header>
        <div class="cols" style="grid-template-columns:minmax(0,${d.ratio}fr) minmax(0,${100 - d.ratio}fr)">
          <div class="col">${L.join('')}</div><div class="col">${R.join('')}</div>
        </div>`;
    } else if (d.layout === 'sidebar') {
      page.style.gridTemplateColumns = `minmax(0,${100 - d.ratio}fr) minmax(0,${d.ratio}fr)`;
      html = `<aside class="col side">${photo}${contactsHTML()}${R.join('')}</aside>
        <div class="col main"><header class="r-head">${headTools()}${nameBlock(false)}</header>${L.join('')}</div>`;
    } else {
      page.style.gridTemplateColumns = '';
      html = `<header class="r-head">${headTools()}${nameBlock(true)}${photo}</header><div class="col">${ALL.join('')}</div>`;
    }
    page.innerHTML = html;

    updateBreaks();
    updateChrome();
    scheduleSave();
    if (drawerKind && opts.drawer !== false) renderDrawer();
    if (previewOn) {
      page.classList.add('is-print');
      $$('[contenteditable]', page).forEach((e) => e.setAttribute('contenteditable', 'false'));
      updateBreaks();
    }
  }

  // The editor shows each printed page as its own sheet, with a gap between sheets on screen.
  // When actually printing the gap is 0, so the PDF pages are the sheets with nothing in between.
  const SHEET_GAP = 32;
  const stride = (page) => paper().h + (page.classList.contains('printing') ? 0 : SHEET_GAP);

  // Push entries, headings and tag blocks that would cross the end of a sheet onto the next sheet,
  // below its top margin. The screen, the preview and the PDF therefore break in the same places.
  function paginate(page) {
    $$('.pspacer', page).forEach((e) => e.remove());
    $$('[data-pushed]', page).forEach((e) => { e.style.marginTop = ''; e.removeAttribute('data-pushed'); });
    const H = paper().h;
    const S = stride(page);
    const pad = Math.max(16, state.design.margin);
    const limit = H - 2 * pad;
    const z = page.getBoundingClientRect().height / page.offsetHeight || 1;
    for (let el of $$('.sec-title, .item, .tags, .bullets li', page)) {
      if (el.tagName === 'LI') {
        const it = el.closest('.item');
        if (!it || it.offsetHeight < limit) continue; // the whole entry is handled instead
        if (getComputedStyle(el).display === 'inline') continue; // paragraph/inline points flow as text
      }
      const r = el.getBoundingClientRect();
      if (!r.height) continue;
      const top0 = page.getBoundingClientRect().top;
      const t = (r.top - top0) / z;
      const b = (r.bottom - top0) / z;
      if (b - t >= limit) continue; // taller than a page: let it split
      const k = Math.floor(t / S);
      const isTitle = el.classList.contains('sec-title');
      let target = null;
      if (k >= 1 && t < k * S + pad - 0.5) target = k * S + pad;
      else if (b + (isTitle ? 48 : 0) > k * S + H - pad) target = (k + 1) * S + pad;
      if (target == null) continue;
      let anchor = t;
      let moveTitle = isTitle;
      // Keep a heading with its first entry: if the first entry moves, the heading moves too
      if (!isTitle && el.tagName !== 'LI') {
        const sec = el.closest('.sec');
        if (sec && sec.querySelector('.sec-body > .item, .sec-body > .tags') === el) {
          const title = sec.querySelector('.sec-title');
          const tt = (title.getBoundingClientRect().top - top0) / z;
          if (Math.floor(tt / S) === k && tt < target - pad) {
            el = title;
            anchor = tt;
            moveTitle = true;
          }
        }
      }
      // Headings in a grid row (Left headings template) move with their whole section
      if (moveTitle && getComputedStyle(el.parentElement).display === 'grid') el = el.parentElement;
      const shift = target - anchor;
      const pd = getComputedStyle(el.parentElement).display;
      if (pd.includes('grid') || pd.includes('flex')) {
        el.style.marginTop = (parseFloat(getComputedStyle(el).marginTop) || 0) + shift + 'px';
        el.dataset.pushed = '1';
      } else {
        const sp = document.createElement(el.tagName === 'LI' ? 'li' : 'div');
        sp.className = 'pspacer';
        sp.style.height = shift + 'px';
        el.before(sp);
      }
    }
  }

  function updateBreaks() {
    const page = $('#page');
    $$('.sheet-bg, .sheet-label', page).forEach((e) => e.remove());
    page.style.minHeight = '0px';
    paginate(page);
    const h = page.scrollHeight;
    const H = paper().h;
    const S = stride(page);
    pages = Math.max(1, Math.floor((h - 1) / S) + 1);
    page.style.minHeight = (pages - 1) * S + H + 'px';
    const d = state.design;
    // In the Sidebar template the colored column is painted on each sheet, so it stops at the gaps
    const bg = d.layout === 'sidebar'
      ? `background:linear-gradient(90deg,${d.accent} 0 ${100 - d.ratio}%,#fff ${100 - d.ratio}%)`
      : '';
    let html = '';
    for (let k = 0; k < pages; k++) {
      html += `<div class="sheet-bg" style="top:${k * S}px;height:${H}px;${bg}"></div>`;
      html += `<div class="sheet-label" style="top:${k * S}px">Page ${k + 1}${pages > 1 ? ` of ${pages}` : ''}</div>`;
    }
    page.insertAdjacentHTML('afterbegin', html);
    $('#pageCount').textContent = `${pages} ${pages === 1 ? 'page' : 'pages'}`;
  }

  /* ---------------- Preview mode ---------------- */
  // Preview is the same page view with the editing aids switched off: no placeholders,
  // no toolbars, no hover outlines, and the text can't be edited.
  let previewOn = false;
  function setPreview(on) {
    previewOn = on;
    if (on) {
      if (pop) closeStylePop();
      if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    }
    document.body.classList.toggle('previewing', on);
    $('#page').classList.toggle('is-print', on);
    $$('#page [contenteditable]').forEach((e) => e.setAttribute('contenteditable', on ? 'false' : 'true'));
    const btn = $('#previewBtn');
    btn.innerHTML = `${on ? I.pencil : I.eye}${on ? 'Edit' : 'Preview'}`;
    btn.title = on ? 'Back to editing' : 'Hide the editing aids and see the pages exactly as they will print';
    updateBreaks();
  }

  // Printing lays the page out with the print rules and without gaps between sheets
  window.addEventListener('beforeprint', () => { const pg = $('#page'); pg.classList.add('is-print', 'printing'); updateBreaks(); });
  window.addEventListener('afterprint', () => { const pg = $('#page'); pg.classList.remove('printing'); pg.classList.toggle('is-print', previewOn); updateBreaks(); });

  let breakTimer = 0;
  const scheduleBreaks = () => {
    clearTimeout(breakTimer);
    breakTimer = setTimeout(() => {
      updateBreaks();
      if (drawerKind === 'check' || drawerKind === 'ats') renderDrawer();
    }, 200);
  };

  function updateChrome() {
    $('#undoBtn').disabled = !past.length;
    $('#redoBtn').disabled = !future.length;
    const dn = $('#docName');
    if (document.activeElement !== dn) dn.value = state.meta.name;
    $('#zoomVal').textContent = Math.round(zoom * 100) + '%';
    $('#pageZoom').style.zoom = zoom;
  }

  function placeCaretEnd(el) {
    el.focus();
    const r = document.createRange();
    r.selectNodeContents(el);
    r.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(r);
  }
  function focusPath(path) {
    const el = document.querySelector(`[data-path="${path}"]`);
    if (!el) return;
    // Empty tags are hidden until focused, so show this one first or it can't take the caret.
    const tag = el.closest('.tag, .cat, .bullets li');
    if (tag) {
      tag.classList.add('editing');
      el.addEventListener('blur', () => tag.classList.remove('editing'), { once: true });
    }
    placeCaretEnd(el);
    el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  /* ---------------- Page actions ---------------- */
  function moveSection(si, dir) {
    const arr = state.sections;
    const col = arr[si].column;
    let j = si + dir;
    if (isTwoCol()) while (j >= 0 && j < arr.length && arr[j].column !== col) j += dir;
    if (j < 0 || j >= arr.length) return;
    mutate(() => { [arr[si], arr[j]] = [arr[j], arr[si]]; });
  }

  function onPageAction(act, btn) {
    const secEl = btn.closest('section[data-s]');
    const si = secEl ? +secEl.dataset.s : -1;
    const sec = state.sections[si];
    const itEl = btn.closest('[data-i]');
    const ii = itEl ? +itEl.dataset.i : -1;
    const T = sec && TYPES[sec.type];

    switch (act) {
      case 'photo': $('#photoInput').click(); break;
      case 'rate': mutate(() => { const it = sec.items[ii]; const v = +btn.dataset.v; it.rating = it.rating === v ? v - 1 : v; }); break;
      case 'sec-add': {
        // For skills and interests, drop leftover blank tags first so only the new one is shown.
        mutate(() => {
          if (TAG_TYPES.has(sec.type)) sec.items = sec.items.filter((it) => String(it.name || '').trim() || String(it.list || '').trim());
          sec.items.push(T.item());
        });
        focusPath(`sections.${si}.items.${sec.items.length - 1}.${T.focus}`);
        break;
      }
      case 'sec-style': openStylePop(btn, si); break;
      case 'head-fields': openHeadPop(btn); break;
      case 'sec-fields': openFieldsPop(btn, si); break;
      case 'sec-up': moveSection(si, -1); break;
      case 'sec-down': moveSection(si, 1); break;
      case 'sec-swap': mutate(() => { sec.column = sec.column === 'right' ? 'left' : 'right'; }); break;
      case 'sec-del':
        mutate(() => state.sections.splice(si, 1));
        toast(`“${sec.title || T.label}” deleted`, true);
        break;
      case 'item-add':
        mutate(() => sec.items.splice(ii + 1, 0, T.item()));
        focusPath(`sections.${si}.items.${ii + 1}.${T.focus}`);
        break;
      case 'item-up':
      case 'item-down': {
        const j = ii + (act === 'item-up' ? -1 : 1);
        if (j < 0 || j >= sec.items.length) return;
        mutate(() => { [sec.items[ii], sec.items[j]] = [sec.items[j], sec.items[ii]]; });
        break;
      }
      case 'item-del':
        mutate(() => sec.items.splice(ii, 1));
        if (!TAG_TYPES.has(sec.type)) toast('Entry deleted', true);
        break;
      case 'bullet-below': {
        // Insert a new bullet right under the line whose + was clicked
        const it = sec.items[ii];
        const k = +btn.dataset.k;
        mutate(() => it.bullets.splice(k + 1, 0, ''));
        focusPath(`sections.${si}.items.${ii}.bullets.${k + 1}`);
        break;
      }
      case 'bullet-add': {
        const it = sec.items[ii];
        mutate(() => it.bullets.push(''));
        focusPath(`sections.${si}.items.${ii}.bullets.${it.bullets.length - 1}`);
        break;
      }
      default: break;
    }
  }

  /* ---------------- Section style popover ---------------- */
  let pop = null;
  function closeStylePop() {
    if (pop) { pop.remove(); pop = null; }
  }
  const hasBullets = (sec) => (ENTRY_ONLY[sec.type] || []).some(([k]) => k === 'bullets');
  function openStylePop(btn, si) {
    const wasFor = pop && pop.dataset.kind === 'style' && +pop.dataset.si === si;
    closeStylePop();
    if (wasFor) return;
    const sec = state.sections[si];
    const cur = variantOf(sec);
    pop = document.createElement('div');
    pop.className = 'pop';
    pop.dataset.si = si;
    pop.dataset.kind = 'style';
    const multi = sec.type !== 'summary';
    const ig = sec.itemGap != null ? sec.itemGap : defaultItemGap(sec);
    pop.classList.add('pop-style');
    const tabs = [['layout', 'Styles'], ['text', 'Text'], ...(hasBullets(sec) ? [['bullets', 'Bullets']] : []), ['spacing', 'Spacing']];
    styleTab = 'layout'; // always open on the section's styles, the main choice
    const curDesc = (VARIANTS[sec.type].find(([k]) => k === cur) || [])[2] || '';
    const al = sec.align || 'left';
    pop.innerHTML = `
      <div class="ps-head"><strong>${esc(sec.title || TYPES[sec.type].label)}</strong><span>Section style</span>
        <button class="ps-x" data-psclose aria-label="Close">${I.x}</button></div>
      <div class="ps-tabs" role="tablist">${tabs.map(([k, n]) => `<button role="tab" data-pstab="${k}" aria-selected="${k === styleTab}" class="${k === styleTab ? 'on' : ''}">${n}</button>`).join('')}</div>
      <div class="ps-pane" data-pane="layout" ${styleTab === 'layout' ? '' : 'hidden'}>
        <div class="ps-cards">${VARIANTS[sec.type].map(([k, n, d]) => `<button class="ps-card ${k === cur ? 'on' : ''}" data-variant="${k}" title="${esc(d)}">${sketch(SKETCH[k])}<span>${n}</span></button>`).join('')}</div>
        <p class="ps-desc" data-psdesc>${esc(curDesc)}</p>
      </div>
      <div class="ps-pane" data-pane="text" ${styleTab === 'text' ? '' : 'hidden'}>
        <div class="ps-label">Alignment</div>
        <div class="ps-seg" role="group" aria-label="Text alignment">${ALIGNS.map(([k, n, svg]) => `<button class="${k === al ? 'on' : ''}" data-align="${k}" aria-pressed="${k === al}">${svg}<span>${n}</span></button>`).join('')}</div>
        <p class="ps-desc">Applies to paragraphs, descriptions and bullet points. Titles and dates stay where they are.</p>
      </div>
      ${hasBullets(sec) ? `<div class="ps-pane" data-pane="bullets" ${styleTab === 'bullets' ? '' : 'hidden'}>
        <div class="ps-label">Show bullet points as</div>
        <div class="ps-cards">${BULLET_LAYOUTS.map(([k, n, d]) => `<button class="ps-card ${k === (sec.bulletLayout || 'list') ? 'on' : ''}" data-blayout="${k}" title="${esc(d)}">${sketch(SKETCH['bl-' + k])}<span>${n}</span></button>`).join('')}</div>
        <div class="ps-label">Bullet shape</div>
        <div class="pop-bullets ${sec.bulletLayout === 'para' ? 'off' : ''}">${BULLET_STYLES.map(([k, n, glyph]) => `<button class="pop-b ${k === (sec.bullet || 'disc') ? 'on' : ''}" data-bullet="${k}" title="${n}" aria-label="${n}"><span>${glyph}</span></button>`).join('')}</div>
        <p class="ps-desc ps-off-note" ${sec.bulletLayout === 'para' ? '' : 'hidden'}>A paragraph has no bullet marks.</p>
      </div>` : ''}
      <div class="ps-pane" data-pane="spacing" ${styleTab === 'spacing' ? '' : 'hidden'}>
        <label class="pop-r"><span>Space below section<output>${sec.space > 0 ? '+' : ''}${sec.space || 0}px</output></span>
          <input type="range" min="-16" max="120" step="2" value="${sec.space || 0}" data-secspace="space"></label>
        ${multi ? `<label class="pop-r"><span>Space between ${TAG_TYPES.has(sec.type) ? 'items' : 'entries'}<output>${ig}px</output></span>
          <input type="range" min="0" max="40" step="1" value="${ig}" data-secspace="itemGap"></label>` : ''}
        <button class="pop-reset" data-secreset>Reset spacing</button>
      </div>`;
    placePop(btn);
  }
  let styleTab = 'layout';

  // Tiny wireframe previews for the Style panel. Each row is a list of segments:
  // t title, a accent text, m muted text, p pill, d dot, b level bar, i icon, f flexible gap, g fixed gap (number = width %).
  const SKETCH = {
    paragraph: 'm100|m100|m100|m60',
    callout: '!callout m95|m95|m55',
    standard: 't45|a32|m22|d m85|d m70',
    compact: 't32 a28 f m16|d m85|d m70',
    'dates-left': 'm16 g6 t40|g22 a30|g22 m70|g22 m55',
    tags: 'p20 p14 p24|p16 p26 p18|p22 p15',
    list: 'd m30 g8 d m30|d m26 g12 d m30|d m32',
    inline: 'm100|m100|m45',
    bars: 'm32 f b28|m26 f b28|m36 f b28',
    cats: 't16 m72|t20 m60|t14 m50',
    catcols: 't20 g6 m70|t20 g6 m58|t20 g6 m64',
    catstack: 'a22|m85|a18|m60',
    catbullets: 'd t16 m64|d t20 m55|d t14 m48',
    dots: 'm34 f d d d d d|m28 f d d d d d|m40 f d d d d d',
    bar: 'm34 f b30|m28 f b30|m40 f b30',
    text: 'm30 g4 m18|m26 g4 m22|m34 g4 m16',
    icons: 'i t40|g10 m70|i t36|g10 m60',
    plain: 't40|m75|t36|m65',
    grid: 't32 g8 t32|m40 g4 m40|m30 g14 m30',
    'bl-list': 'd m85|d m70|d m80',
    'bl-para': 'm100|m100|m100|m50',
    'bl-inline': 'm28 d m30 d m24|m34 d m40',
    'bl-cols': 'd m38 g6 d m38|d m30 g14 d m34',
  };
  function sketch(spec = 'm100|m80|m60') {
    let cls = '';
    if (spec.startsWith('!')) { [cls, spec] = [spec.slice(1, spec.indexOf(' ')), spec.slice(spec.indexOf(' ') + 1)]; }
    const rows = spec.split('|').map((row) => `<span class="sk-r">${row.split(' ').map((seg) => {
      const t = seg[0];
      const w = seg.slice(1);
      return `<i class="sk-${t}"${w ? ` style="width:${w}%"` : ''}></i>`;
    }).join('')}</span>`).join('');
    return `<span class="sk ${cls ? 'sk-' + cls : ''}" aria-hidden="true">${rows}</span>`;
  }
  // Fields popover for a section: the same switches as the header's, applied to every entry.
  function openFieldsPop(btn, si) {
    const wasFor = pop && pop.dataset.kind === 'fields' && +pop.dataset.si === si;
    closeStylePop();
    if (wasFor) return;
    const sec = state.sections[si];
    pop = document.createElement('div');
    pop.className = 'pop';
    pop.dataset.si = si;
    pop.dataset.kind = 'fields';
    const multi = ENTRY_ONLY[sec.type].length && !TAG_TYPES.has(sec.type) && sec.type !== 'summary';
    pop.innerHTML = `<div class="pop-h">Show fields <small>in ${esc(sec.title || TYPES[sec.type].label)}</small></div>${fieldToggles(FIELDS[sec.type], secHidden(sec))}
      <p class="pop-note">${multi ? 'Applies to every entry in this section. ' : ''}Hidden fields keep their text. They are left out of the page, the PDF and the ATS preview.</p>`;
    placePop(btn);
  }
  const fieldToggles = (list, hid, on = {}) => `<div class="pop-fields">${list.map(([k, n]) => {
    const shown = k in on ? on[k] : !hid.has(k);
    return `<label class="pop-f"><span>${n}</span><input type="checkbox" role="switch" data-showfield="${k}" ${shown ? 'checked' : ''}></label>`;
  }).join('')}</div>`;
  function openHeadPop(btn) {
    const wasFor = pop && pop.dataset.si === 'head';
    closeStylePop();
    if (wasFor) return;
    pop = document.createElement('div');
    pop.className = 'pop';
    pop.dataset.si = 'head';
    pop.dataset.kind = 'fields';
    pop.innerHTML = `<div class="pop-h">Show fields <small>in the header</small></div>${fieldToggles(HEADER_FIELDS, headHidden(), { photo: state.design.showPhoto })}
      <p class="pop-note">Hidden fields keep their text. They are left out of the page, the PDF and the ATS preview.</p>`;
    placePop(btn);
  }
  function placePop(btn) {
    document.body.appendChild(pop);
    const r = btn.getBoundingClientRect();
    const top = r.bottom + 6 + pop.offsetHeight > innerHeight ? r.top - pop.offsetHeight - 6 : r.bottom + 6;
    pop.style.top = Math.max(8, top) + 'px';
    pop.style.left = Math.max(8, Math.min(innerWidth - pop.offsetWidth - 8, r.right - pop.offsetWidth)) + 'px';
  }
  // Default gap between entries for each style, matching the CSS fallbacks
  function defaultItemGap(sec) {
    const v = variantOf(sec);
    if (isCat(sec)) return v === 'catstack' ? 6 : 3;
    if (TAG_TYPES.has(sec.type)) return v === 'list' ? 3 : 6;
    if (v === 'compact') return 4;
    if (v === 'grid') return 6;
    return 8;
  }
  let secDirty = false;
  document.addEventListener('input', (e) => {
    const inp = pop && e.target.closest('.pop [data-secspace]');
    if (!inp) return;
    const sec = state.sections[+pop.dataset.si];
    if (!sec) return;
    if (!secDirty) { snapshot(); secDirty = true; }
    const key = inp.dataset.secspace;
    sec[key] = +inp.value;
    inp.previousElementSibling.querySelector('output').textContent = (key === 'space' && sec[key] > 0 ? '+' : '') + inp.value + 'px';
    render({ drawer: false });
  });
  document.addEventListener('change', (e) => {
    if (e.target.closest('.pop [data-secspace]')) secDirty = false;
    const f = pop && e.target.closest('.pop [data-showfield]');
    if (!f) return;
    const key = f.dataset.showfield;
    const show = f.checked;
    if (pop.dataset.si === 'head') {
      if (key === 'photo') return mutate(() => { state.design.showPhoto = show; });
      mutate(() => { state.header.hide = toggleHide(state.header.hide, key, show); });
    } else {
      const sec = state.sections[+pop.dataset.si];
      if (sec) mutate(() => { sec.hide = toggleHide(sec.hide, key, show); });
    }
  });
  const toggleHide = (arr, key, show) => {
    const s = new Set(arr || []);
    if (show) s.delete(key); else s.add(key);
    return [...s];
  };

  function setVariant(si, v) {
    const sec = state.sections[si];
    if (!sec || variantOf(sec) === v) return;
    const wasCat = isCat(sec);
    const toCat = sec.type === 'skills' && /^cat/.test(v);
    let note = '';
    mutate(() => {
      sec.variant = v;
      if (toCat && !wasCat && !sec.items.some((it) => String(it.list || '').trim())) {
        // Single skills -> one category holding all of them
        const names = sec.items.map((it) => String(it.name || '').trim()).filter(Boolean);
        sec.items = [{ name: names.length ? 'Technical' : '', rating: 4, list: names.join(', ') }];
        if (names.length) note = 'Your skills are in one category. Rename it and press Enter at the end of a list to add another.';
      } else if (wasCat && !toCat && sec.items.some((it) => String(it.list || '').trim())) {
        // Categories -> one tag per skill
        const names = sec.items.flatMap((it) => splitSkills(it.list));
        sec.items = names.map((name) => ({ name, rating: 4, list: '' }));
        note = 'Categories were split into single skills.';
      }
    });
    if (note) toast(note, true);
  }
  document.addEventListener('mousedown', (e) => {
    if (pop && !pop.contains(e.target) && !e.target.closest('[data-act="sec-style"], [data-act="sec-fields"], [data-act="head-fields"]')) closeStylePop();
  });
  document.addEventListener('click', (e) => {
    if (pop && e.target.closest('.pop [data-psclose]')) { closeStylePop(); return; }
    const tab = pop && e.target.closest('.pop [data-pstab]');
    if (tab) {
      styleTab = tab.dataset.pstab;
      $$('.pop [data-pstab]').forEach((x) => { const on = x === tab; x.classList.toggle('on', on); x.setAttribute('aria-selected', on); });
      $$('.pop [data-pane]').forEach((x) => { x.hidden = x.dataset.pane !== styleTab; });
      return;
    }
    if (pop && e.target.closest('.pop [data-secreset]')) {
      const sec = state.sections[+pop.dataset.si];
      if (sec && (sec.space || sec.itemGap != null)) mutate(() => { sec.space = 0; delete sec.itemGap; });
      // Show the reset values in the sliders without closing the panel
      $$('.pop [data-secspace]').forEach((inp) => {
        const v = inp.dataset.secspace === 'space' ? 0 : defaultItemGap(sec);
        inp.value = v;
        inp.closest('.pop-r').querySelector('output').textContent = `${v}px`;
      });
      return;
    }
    const al = pop && e.target.closest('.pop [data-align]');
    if (al) {
      const sec = state.sections[+pop.dataset.si];
      const v = al.dataset.align;
      if (sec && (sec.align || 'left') !== v) mutate(() => { if (v === 'left') delete sec.align; else sec.align = v; });
      $$('.pop [data-align]').forEach((x) => { x.classList.toggle('on', x === al); x.setAttribute('aria-pressed', x === al); });
      return;
    }
    const bl = pop && e.target.closest('.pop [data-blayout]');
    if (bl) {
      const sec = state.sections[+pop.dataset.si];
      const v = bl.dataset.blayout;
      if (sec && (sec.bulletLayout || 'list') !== v) mutate(() => { if (v === 'list') delete sec.bulletLayout; else sec.bulletLayout = v; });
      $$('.pop [data-blayout]').forEach((x) => x.classList.toggle('on', x === bl));
      $('.pop .pop-bullets').classList.toggle('off', v === 'para'); // a paragraph has no bullet marks
      const note = $('.pop .ps-off-note');
      if (note) note.hidden = v !== 'para';
      return;
    }
    const b = pop && e.target.closest('.pop [data-bullet]');
    if (b) {
      // Keep the popover open so you can try several bullet styles in a row.
      const sec = state.sections[+pop.dataset.si];
      const v = b.dataset.bullet;
      if (sec && (sec.bullet || 'disc') !== v) mutate(() => { if (v === 'disc') delete sec.bullet; else sec.bullet = v; });
      $$('.pop [data-bullet]').forEach((x) => x.classList.toggle('on', x === b));
      return;
    }
    const o = pop && e.target.closest('.pop [data-variant]');
    if (!o) return;
    const si = +pop.dataset.si;
    if (!pop.classList.contains('pop-style')) { closeStylePop(); setVariant(si, o.dataset.variant); return; }
    // Keep the Style panel open so you can compare layouts
    setVariant(si, o.dataset.variant);
    $$('.pop [data-variant]').forEach((x) => x.classList.toggle('on', x === o));
    const d = (VARIANTS[state.sections[si].type].find(([k]) => k === o.dataset.variant) || [])[2] || '';
    const desc = $('.pop [data-psdesc]');
    if (desc) desc.textContent = d;
  });
  $('#canvas').addEventListener('scroll', closeStylePop);

  $('#page').addEventListener('pointerdown', (e) => {
    const h = e.target.closest('.sec-resize');
    if (!h) return;
    e.preventDefault();
    closeStylePop();
    const secEl = h.closest('section[data-s]');
    const sec = state.sections[+secEl.dataset.s];
    const start = sec.space || 0;
    const y0 = e.clientY;
    let val = start;
    h.setPointerCapture(e.pointerId);
    secEl.classList.add('resizing');
    const move = (ev) => {
      val = Math.round(Math.max(-16, Math.min(120, start + (ev.clientY - y0) / zoom)));
      secEl.style.marginBottom = `calc(var(--gap) + ${val}px)`;
      h.dataset.val = `${val > 0 ? '+' : ''}${val}px`;
    };
    const up = () => {
      h.removeEventListener('pointermove', move);
      h.removeEventListener('pointerup', up);
      h.removeEventListener('pointercancel', up);
      secEl.classList.remove('resizing');
      delete h.dataset.val;
      if (val !== start) mutate(() => { sec.space = val; });
    };
    h.addEventListener('pointermove', move);
    h.addEventListener('pointerup', up);
    h.addEventListener('pointercancel', up);
  });

  function addSection(type) {
    const idx = state.sections.length;
    mutate(() => state.sections.push(newSection(type)));
    closeModal();
    focusPath(`sections.${idx}.items.0.${TYPES[type].focus}`);
    toast(`${TYPES[type].label} added`);
  }

  /* ---------------- Page events ---------------- */
  const page = $('#page');

  page.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-act]');
    if (btn && page.contains(btn)) {
      e.preventDefault();
      onPageAction(btn.dataset.act, btn);
    }
  });
  // Keep focus in the text when clicking toolbar buttons
  page.addEventListener('mousedown', (e) => {
    if (e.target.closest('.tools button, .dot, .tag-x, .sbar button')) e.preventDefault();
  });

  page.addEventListener('input', (e) => {
    const el = e.target.closest('.ce');
    if (!el) return;
    beginTyping();
    if (el.textContent === '') el.innerHTML = ''; // restore :empty so the placeholder shows
    const v = el.dataset.multi ? el.innerText.replace(/\n$/, '') : el.textContent;
    setPath(el.dataset.path, v);
    scheduleSave();
    scheduleBreaks();
    updateChrome();
    if (drawerKind === 'rearrange' && /^sections\.\d+\.title$/.test(el.dataset.path)) renderDrawer();
  });

  page.addEventListener('keydown', (e) => {
    const el = e.target.closest && e.target.closest('.ce');
    if (!el) return;
    const { kind, path } = el.dataset;

    if (e.key === 'Enter') {
      if (el.dataset.multi && !kind) {
        e.preventDefault();
        document.execCommand('insertLineBreak');
        return;
      }
      e.preventDefault();
      if (kind === 'bullet') {
        const parts = path.split('.');
        const k = +parts.pop();
        const arrPath = parts.join('.');
        mutate(() => getPath(arrPath).splice(k + 1, 0, ''));
        focusPath(`${arrPath}.${k + 1}`);
      } else if (kind === 'catlist') {
        const [, si, ii] = path.match(/^sections\.(\d+)\.items\.(\d+)/).map(Number);
        mutate(() => state.sections[si].items.splice(ii + 1, 0, TYPES.skills.item()));
        focusPath(`sections.${si}.items.${ii + 1}.name`);
      } else if (kind === 'tag') {
        const [, si, ii] = path.match(/^sections\.(\d+)\.items\.(\d+)/).map(Number);
        mutate(() => state.sections[si].items.splice(ii + 1, 0, TYPES[state.sections[si].type].item()));
        focusPath(`sections.${si}.items.${ii + 1}.name`);
      } else {
        const all = $$('.ce', page);
        const next = all[all.indexOf(el) + 1];
        if (next) placeCaretEnd(next);
      }
      return;
    }

    if (e.key === 'Backspace' && el.textContent === '' && (kind === 'bullet' || kind === 'tag')) {
      e.preventDefault();
      if (kind === 'bullet') {
        const parts = path.split('.');
        const k = +parts.pop();
        const arrPath = parts.join('.');
        mutate(() => getPath(arrPath).splice(k, 1));
        if (k > 0) focusPath(`${arrPath}.${k - 1}`);
      } else {
        const [, si, ii] = path.match(/^sections\.(\d+)\.items\.(\d+)/).map(Number);
        mutate(() => state.sections[si].items.splice(ii, 1));
        if (ii > 0) focusPath(`sections.${si}.items.${ii - 1}.name`);
      }
    }
  });

  page.addEventListener('paste', (e) => {
    const el = e.target.closest('.ce');
    if (!el) return;
    e.preventDefault();
    let text = (e.clipboardData || window.clipboardData).getData('text/plain') || '';
    if (el.dataset.kind === 'bullet' && /\n/.test(text.trim())) {
      // Pasting a list into a bullet splits it into separate bullets
      const lines = text.split(/\r?\n/).map((l) => l.replace(/^\s*([-*•●▪◦–]|\d+[.)])\s*/, '').trim()).filter(Boolean);
      const parts = el.dataset.path.split('.');
      const k = +parts.pop();
      const arrPath = parts.join('.');
      mutate(() => {
        const arr = getPath(arrPath);
        const first = (arr[k] || '') + lines[0];
        arr.splice(k, 1, first, ...lines.slice(1));
      });
      focusPath(`${arrPath}.${k + lines.length - 1}`);
      return;
    }
    if (!el.dataset.multi) text = text.replace(/\s*\r?\n\s*/g, ' ');
    document.execCommand('insertText', false, text);
  });

  page.addEventListener('drop', (e) => { if (e.target.closest('.ce')) e.preventDefault(); });

  /* ---------------- Drawers ---------------- */
  const PANELS = { rearrange: 'Rearrange sections', templates: 'Templates', design: 'Design & font', check: 'Resume check', ats: 'ATS preview', file: 'Import / export' };

  function thumb(id) {
    const lines = (n) => Array.from({ length: n }, (_, i) => `<i class="ln" style="width:${62 + ((i * 37) % 36)}%"></i>`).join('');
    if (id === 'double') return `<div class="thumb"><i class="th-name"></i><i class="th-sub"></i><div class="th-cols"><div>${lines(10)}</div><div>${lines(7)}</div></div></div>`;
    if (id === 'sidebar') return `<div class="thumb th-sb"><div class="th-side"><i class="th-av"></i>${lines(8)}</div><div class="th-main"><i class="th-name"></i><i class="th-sub"></i>${lines(10)}</div></div>`;
    const rows = (n) => Array.from({ length: n }, (_, i) => `<div class="th-row"><i class="ln" style="width:${48 + ((i * 29) % 30)}%"></i><i class="ln" style="width:16%"></i></div>`).join('');
    const head = (cls = '') => `<i class="th-name ${cls}"></i><i class="th-sub ${cls}"></i>`;
    const hd = (cls = '') => `<i class="th-h ${cls}"></i>`;
    switch (id) {
      case 'classic': return `<div class="thumb th-center">${head()}${lines(13)}</div>`;
      case 'professional': return `<div class="thumb">${head()}${hd('rule')}${rows(5)}${hd('rule')}${rows(4)}</div>`;
      case 'executive': return `<div class="thumb th-exec"><div class="th-band">${head('inv')}</div>${hd()}${rows(5)}${hd()}${rows(4)}</div>`;
      case 'lefthead': return `<div class="thumb">${head()}<div class="th-lh"><i class="th-h"></i><div>${lines(5)}</div></div><div class="th-lh"><i class="th-h"></i><div>${lines(6)}</div></div><div class="th-lh"><i class="th-h"></i><div>${lines(3)}</div></div></div>`;
      case 'timeline': return `<div class="thumb">${head()}${hd()}<div class="th-tl">${lines(5)}</div>${hd()}<div class="th-tl">${lines(5)}</div></div>`;
      case 'minimal': return `<div class="thumb th-min">${head('thin')}${lines(4)}<i class="gap"></i>${lines(4)}<i class="gap"></i>${lines(4)}</div>`;
      case 'elegant': return `<div class="thumb th-center">${head()}${hd('orn')}${lines(5)}${hd('orn')}${lines(5)}</div>`;
      case 'ats': return `<div class="thumb th-mono">${head('mono')}${hd('rule mono')}${rows(5)}${hd('rule mono')}${rows(4)}</div>`;
      case 'modern': return `<div class="thumb">${head('acc')}${hd('short')}${rows(5)}${hd('short')}${rows(4)}</div>`;
      case 'compact': return `<div class="thumb th-compact">${head()}${hd('rule')}${rows(7)}${hd('rule')}${rows(6)}${hd('rule')}${rows(3)}</div>`;
      case 'boxed': return `<div class="thumb">${head()}${hd('box')}${rows(5)}${hd('box')}${rows(4)}</div>`;
      case 'bold': return `<div class="thumb th-bold">${head('big')}${hd('acc')}${lines(5)}${hd('acc')}${lines(5)}</div>`;
      case 'academic': return `<div class="thumb">${head('serif')}${hd('dbl')}${rows(5)}${hd('dbl')}${rows(4)}</div>`;
      case 'splithead': return `<div class="thumb"><div class="th-split"><div><i class="th-name"></i><i class="th-sub"></i></div><div>${lines(3)}</div></div>${hd('rule')}${rows(5)}${hd('rule')}${rows(4)}</div>`;
      default: return `<div class="thumb">${head()}${hd('bar')}${lines(6)}${hd('bar')}${lines(5)}</div>`;
    }
  }

  const DRAWERS = {
    templates() {
      const d = state.design;
      const card = (l) => `<button class="tpl ${d.layout === l.id ? 'on' : ''}" data-layout="${l.id}">${thumb(l.id)}<strong>${l.name}</strong><span>${l.desc}</span></button>`;
      const group = (g, label) => `<h4 class="tpl-group">${label}</h4><div class="tpl-grid">${LAYOUTS.filter((l) => l.group === g).map(card).join('')}</div>`;
      return `<p class="drawer-note">Switch layouts any time. Your content stays the same.</p>
        ${group('single', 'Single column')}${group('two', 'Two column')}`;
    },

    design() {
      const d = state.design;
      const range = (key, label, min, max, step, unit = '') => `<div class="field"><div class="flabel"><span>${label}</span><output>${d[key]}${unit}</output></div>
        <input type="range" data-design="${key}" data-unit="${unit}" min="${min}" max="${max}" step="${step}" value="${d[key]}"></div>`;
      return `
        <div class="field"><div class="flabel"><span>Accent color</span></div>
          <div class="swatches">${ACCENTS.map((c) => `<button class="sw ${c === d.accent ? 'on' : ''}" style="--c:${c}" data-accent="${c}" title="${c}"></button>`).join('')}
            <label class="sw custom ${ACCENTS.includes(d.accent) ? '' : 'on'}" title="Custom color"><input type="color" data-design="accent" value="${d.accent}"></label>
          </div></div>
        <div class="field"><div class="flabel"><span>Fonts</span></div>
          <div class="seg seg-gap"><button class="${fontTarget === 'head' ? 'on' : ''}" data-fonttarget="head">Headings</button><button class="${fontTarget === 'body' ? 'on' : ''}" data-fonttarget="body">Body text</button></div>
          <p class="fhint">${fontTarget === 'head' ? 'Your name, headline and section titles.' : 'Entries, bullets, skills and contact details.'}</p>
          <div class="fontlist">${fontTarget === 'head' ? `<button class="fopt ${d.headFont ? '' : 'on'}" data-font="">Same as body</button>` : ''}${FONTS.map((f) => {
            const on = fontTarget === 'head' ? f.name === d.headFont : f.name === d.font;
            return `<button class="fopt ${on ? 'on' : ''}" data-font="${esc(f.name)}" style="font-family:${esc(f.css)}">${esc(f.name)}</button>`;
          }).join('')}</div></div>
        <div class="field"><div class="flabel"><span>Section headings</span></div>
          <div class="seg">${HEADINGS.map(([k, n]) => `<button class="${d.heading === k ? 'on' : ''}" data-heading="${k}">${n}</button>`).join('')}</div></div>
        <div class="field"><div class="flabel"><span>Page size</span><output>${paper().note}</output></div>
          <div class="seg">${Object.entries(PAGE_SIZES).map(([k, p]) => `<button class="${(d.pageSize || 'a4') === k ? 'on' : ''}" data-pagesize="${k}">${p.label}</button>`).join('')}</div></div>
        ${range('fontSize', 'Font size', 10.5, 15, 0.5, 'px')}
        ${range('lineHeight', 'Line height', 1.2, 1.8, 0.05)}
        ${range('sectionGap', 'Section spacing', 8, 34, 1, 'px')}
        ${range('margin', 'Page margins', 22, 64, 2, 'px')}
        ${isTwoCol() ? range('ratio', 'Main column width', 50, 72, 1, '%') : ''}
        <div class="field"><div class="flabel"><span>Photo</span></div>
          <label class="toggle"><span>Show photo</span><input type="checkbox" data-design="showPhoto" ${d.showPhoto ? 'checked' : ''}></label>
          <div class="row-btns">
            <button class="btn" data-file="photo">${I.upload}${state.header.photo ? 'Change photo' : 'Upload photo'}</button>
            ${state.header.photo ? `<button class="btn danger-text" data-file="photo-remove">Remove</button>` : ''}
          </div></div>
        <div class="field"><div class="flabel"><span>Section styles</span></div>
          <div class="secstyles">${state.sections.map((s, si) => `<label class="secstyle"><span>${esc(s.title || TYPES[s.type].label)}</span>
            <select data-secv="${si}">${VARIANTS[s.type].map(([k, n]) => `<option value="${k}" ${k === variantOf(s) ? 'selected' : ''}>${n}</option>`).join('')}</select></label>`).join('')}</div></div>`;
    },

    rearrange() {
      const li = (s) => `<li draggable="true" data-id="${esc(s.id)}">${I.grip}<span>${esc(s.title || TYPES[s.type].label)}</span><small>${TYPES[s.type].label}</small></li>`;
      if (isTwoCol()) {
        const left = state.sections.filter((s) => s.column !== 'right');
        const right = state.sections.filter((s) => s.column === 'right');
        const [ln, rn] = state.design.layout === 'sidebar' ? ['Main column', 'Sidebar'] : ['Left column', 'Right column'];
        return `<p class="drawer-note">Drag sections to reorder them or move them between columns.</p>
          <div class="ra-col"><h4>${ln}</h4><ul class="ra-list" data-col="left">${left.map(li).join('')}</ul></div>
          <div class="ra-col"><h4>${rn}</h4><ul class="ra-list" data-col="right">${right.map(li).join('')}</ul></div>`;
      }
      return `<p class="drawer-note">Drag sections to change their order.</p>
        <div class="ra-col"><ul class="ra-list" data-col="">${state.sections.map(li).join('')}</ul></div>`;
    },

    check() {
      const { score, checks } = runChecks();
      const color = score >= 80 ? '#15803d' : score >= 55 ? '#b45309' : '#b42318';
      const verdict = score >= 80 ? 'Strong resume' : score >= 55 ? 'Good start, a few fixes left' : 'Needs work';
      const sorted = [...checks].sort((a, b) => a.ok - b.ok);
      return `<div class="score"><div class="ring" style="--p:${score};--ring:${color}"><span>${score}</span></div>
          <div><strong>${verdict}</strong><p>${checks.filter((c) => !c.ok).length} of ${checks.length} checks need attention. Updates live as you type.</p></div></div>
        <ul class="checks">${sorted.map((c) => `<li class="${c.ok ? 'ok' : 'bad'}"><span class="ci">${c.ok ? I.tick : '!'}</span><div><strong>${esc(c.t)}</strong><p>${esc(c.d)}</p></div></li>`).join('')}</ul>`;
    },

    ats() {
      const { text, fields, notes } = atsParse();
      const okCount = notes.filter((n) => n.ok).length;
      return `<p class="drawer-note">Roughly what an applicant tracking system reads from your PDF: plain text in reading order, with all design stripped away. Updates live as you type.</p>
        <h4 class="ats-h">Detected contact fields</h4>
        <dl class="ats-fields">${fields.map(([k, v, hidden]) => `<div class="${v ? 'ok' : hidden ? 'off' : 'bad'}"><dt>${k}</dt><dd>${v ? esc(v) : hidden ? 'Hidden' : 'Not found'}</dd></div>`).join('')}</dl>
        <h4 class="ats-h">Parsing notes <small>${okCount} of ${notes.length} fine</small></h4>
        <ul class="checks">${[...notes].sort((a, b) => a.ok - b.ok).map((c) => `<li class="${c.ok ? 'ok' : 'bad'}"><span class="ci">${c.ok ? I.tick : '!'}</span><div><strong>${esc(c.t)}</strong><p>${esc(c.d)}</p></div></li>`).join('')}</ul>
        <div class="ats-texthead"><h4 class="ats-h">Extracted text</h4><button class="btn sm" data-atscopy>${I.copy}Copy</button></div>
        <pre class="ats-text">${esc(text)}</pre>`;
    },

    file() {
      return `<p class="drawer-note">Your resume saves automatically in this browser. Export a JSON backup to move it to another device.</p>
        <button class="btn block" data-file="pdf">${I.download}Download as PDF</button>
        <button class="btn block" data-file="export">${I.file}Export backup (.json)</button>
        <button class="btn block" data-file="import">${I.upload}Import backup (.json)</button>
        <div style="height:12px"></div>
        <button class="btn block" data-file="sample">${I.refresh}Load random example</button>
        <button class="btn block danger-text" data-file="blank">${I.trash}Start from a blank resume</button>
        <p class="drawer-note" style="margin-top:14px">Loading the example or a blank resume replaces the current one. You can undo it with Ctrl+Z.</p>`;
    },
  };

  function runChecks() {
    const h = visHeader();
    const secs = state.sections;
    const of = (...types) => secs.filter((s) => types.includes(s.type));
    const allBullets = of('experience', 'projects', 'volunteering').flatMap((s) => (s.hide || []).includes("bullets") ? [] : s.items.flatMap((i) => (i.bullets || []).filter((b) => b.trim())));
    const sumWords = words(of('summary').flatMap((s) => s.items.map((i) => i.text)).join(' '));
    const exp = of('experience').flatMap((s) => s.items);
    const skills = of('skills').flatMap((s) => (isCat(s) ? s.items.flatMap((i) => splitSkills(i.list)) : s.items.filter((i) => i.name.trim()))).length;
    const quant = allBullets.filter((b) => /\d/.test(b)).length;
    const verbStart = allBullets.filter((b) => VERBS.has((b.trim().split(/\s+/)[0] || '').toLowerCase().replace(/[^a-z]/g, ''))).length;
    const long = allBullets.filter((b) => words(b) > 30).length;
    const allText = JSON.stringify(secs.map((s) => s.items));
    const pronouns = (allText.match(/\b(I|me|my|I'm|I've)\b/g) || []).length;
    const pct = (n) => (allBullets.length ? Math.round((n / allBullets.length) * 100) : 0);

    const checks = [
      { w: 10, ok: !!(h.name.trim() && h.email.trim() && h.phone.trim()), t: 'Contact details', d: 'Name, email and phone are all filled in so recruiters can reach you.' },
      { w: 5, ok: !!h.title.trim(), t: 'Headline', d: 'A headline under your name tells readers what role you want.' },
      { w: 10, ok: sumWords >= 25 && sumWords <= 90, t: 'Summary length', d: `Your summary has ${sumWords} words. Aim for 25 to 90.` },
      { w: 10, ok: exp.length >= 1, t: 'Work experience', d: 'Include at least one role in an Experience section.' },
      { w: 10, ok: exp.length > 0 && exp.every((i) => (i.bullets || []).filter((b) => b.trim()).length >= 2), t: 'Bullets per role', d: 'Give every role at least two accomplishment bullets.' },
      { w: 15, ok: allBullets.length > 0 && quant / allBullets.length >= 0.5, t: 'Quantified impact', d: `${pct(quant)}% of your bullets include a number. Aim for at least half: %, $, time saved, team size.` },
      { w: 10, ok: allBullets.length > 0 && verbStart / allBullets.length >= 0.6, t: 'Action verbs', d: `${pct(verbStart)}% of bullets start with a strong verb such as Led, Built or Reduced. Aim for 60% or more.` },
      { w: 5, ok: long === 0, t: 'Concise bullets', d: long ? `${long} bullet(s) run over 30 words. Split or trim them.` : 'All bullets are 30 words or fewer.' },
      { w: 10, ok: skills >= 6, t: 'Skills', d: `You list ${skills} skill(s). Six or more relevant skills help keyword matching.` },
      { w: 5, ok: of('education').length > 0, t: 'Education', d: 'Add an Education section, even a short one.' },
      { w: 5, ok: pronouns === 0, t: 'No personal pronouns', d: pronouns ? `Found ${pronouns} use(s) of I / me / my. Resumes read better without them.` : 'No first-person pronouns found.' },
      { w: 5, ok: pages <= 2, t: 'Length', d: `Your resume is ${pages} page(s). Keep it to one or two.` },
    ];
    const total = checks.reduce((a, c) => a + c.w, 0);
    const score = Math.round((checks.reduce((a, c) => a + (c.ok ? c.w : 0), 0) / total) * 100);
    return { score, checks };
  }

  /* ---------------- ATS preview ---------------- */
  // Headings most ATS parsers map to a known resume field.
  const ATS_HEADINGS = /\b(summary|profile|objective|about|experience|employment|work history|career|education|academic|skills|competenc\w*|expertise|technolog\w*|projects?|certifications?|licen[cs]es?|languages?|achievements?|accomplishments?|awards?|honou?rs|volunteer\w*|interests|hobbies|publications?|courses|training|references|strengths)\b/i;
  const YEAR_RE = /\b(19|20)\d{2}\b/;

  // Reading order an ATS uses: header, then the main column, then the second column.
  function atsOrder() {
    if (!isTwoCol()) return state.sections;
    return [...state.sections.filter((s) => s.column !== 'right'), ...state.sections.filter((s) => s.column === 'right')];
  }

  function atsSectionLines(sec) {
    const t = (v) => String(v || '').trim();
    const join = (...xs) => xs.map(t).filter(Boolean).join(' | ');
    const bullets = (it) => (it.bullets || []).map(t).filter(Boolean).map((b) => `- ${b}`);
    if (isCat(sec)) {
      return sec.items.map((i) => [t(i.name), splitSkills(i.list).join(', ')]).filter(([, l]) => l).map(([n, l]) => (n ? `${n}: ${l}` : l));
    }
    if (TAG_TYPES.has(sec.type)) {
      const names = sec.items.map((i) => t(i.name)).filter(Boolean);
      return names.length ? [names.join(', ')] : [];
    }
    const out = [];
    const hid = secHidden(sec);
    for (const raw of sec.items) {
      const it = { ...raw };
      for (const k of hid) it[k] = k === 'bullets' ? [] : '';
      let block = [];
      switch (sec.type) {
        case 'summary': block = [t(it.text)]; break;
        case 'experience': case 'volunteering':
          block = [join(it.role, it.company), join(it.dates, it.location), t(it.desc), ...bullets(it)]; break;
        case 'projects': block = [join(it.name, it.link), t(it.dates), t(it.desc), ...bullets(it)]; break;
        case 'education': block = [join(it.degree, it.school), join(it.dates, it.location), t(it.gpa)]; break;
        case 'languages': block = [join(it.name, it.level)]; break;
        case 'certifications': block = [join(it.name, it.issuer, it.date)]; break;
        case 'achievements': case 'strengths': block = [t(it.title), t(it.desc)]; break;
        case 'custom': block = [join(it.title, it.sub), t(it.dates), t(it.desc)]; break;
        default: break;
      }
      const lines = block.filter(Boolean);
      if (lines.length) out.push(lines.join('\n'));
    }
    return out;
  }

  function atsParse() {
    const h = visHeader();
    const t = (v) => String(v || '').trim();
    const parts = [];
    const head = [t(h.name), t(h.title), [h.phone, h.email, h.link, h.location].map(t).filter(Boolean).join(' | ')].filter(Boolean);
    if (head.length) parts.push(head.join('\n'));
    const order = atsOrder();
    const visible = [];
    for (const sec of order) {
      const body = atsSectionLines(sec);
      if (!body.length) continue;
      visible.push(sec);
      parts.push(secHidden(sec).has('heading') ? body.join('\n\n') : `${t(sec.title || TYPES[sec.type].title).toUpperCase()}\n${body.join('\n\n')}`);
    }
    const text = parts.join('\n\n');

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t(h.email));
    const phoneOk = (t(h.phone).match(/\d/g) || []).length >= 7;
    const hh = headHidden();
    const fields = [
      ['Name', t(h.name)],
      ['Email', emailOk ? t(h.email) : '', hh.has('email')],
      ['Phone', phoneOk ? t(h.phone) : '', hh.has('phone')],
      ['Location', t(h.location), hh.has('location')],
      ['Link', t(h.link), hh.has('link')],
      ['Headline', t(h.title), hh.has('title')],
    ];

    const odd = visible.filter((s) => secHidden(s).has('heading') || !ATS_HEADINGS.test(t(s.title)));
    const dated = order.filter((s) => ['experience', 'education', 'volunteering'].includes(s.type)).flatMap((s) => s.items)
      .filter((i) => t(i.role || i.degree || i.company || i.school));
    const noDate = dated.filter((i) => !YEAR_RE.test(i.dates || ''));
    const graphic = visible.filter((s) => (s.type === 'skills' && variantOf(s) === 'bars' && !secHidden(s).has('rating')) || (s.type === 'languages' && variantOf(s) !== 'text' && !secHidden(s).has('rating')));
    const two = isTwoCol();
    const photo = state.design.showPhoto && !!h.photo;
    const notes = [
      { ok: !!(t(h.name) && emailOk && phoneOk), t: 'Contact details readable', d: t(h.name) && emailOk && phoneOk ? 'Name, a valid email and a phone number were found in the header.' : 'Add a full name, a valid email address and a phone number. ATS use these to create your candidate record.' },
      { ok: !odd.length, t: 'Standard section headings', d: odd.length ? `ATS may not recognize ${odd.map((s) => `"${t(s.title) || 'untitled'}"${secHidden(s).has('heading') ? ' (title hidden)' : ''}`).join(', ')}. Show the title and use common names like Experience, Education or Skills.` : 'Every section heading maps to a field ATS know.' },
      { ok: !noDate.length, t: 'Dates on every entry', d: noDate.length ? `${noDate.length} experience or education ${noDate.length === 1 ? 'entry has' : 'entries have'} no year. ATS use dates to work out years of experience.` : 'Each role and degree has a date with a year.' },
      { ok: !two, t: 'Single-column layout', d: two ? 'Some ATS read two columns straight across, mixing lines together. The text below shows the intended order; a single-column template such as ATS plain is safest.' : 'One column reads top to bottom with no risk of mixed lines.' },
      { ok: !photo, t: 'No photo', d: photo ? 'ATS ignore photos, and many employers in the US and UK prefer resumes without one.' : 'No photo is shown, which suits most ATS.' },
      { ok: !graphic.length, t: 'No rating graphics', d: graphic.length ? `${graphic.map((s) => t(s.title) || TYPES[s.type].label).join(', ')} ${graphic.length === 1 ? 'uses' : 'use'} dots or bars. ATS drop these, so the level is lost; switch to a text style.` : 'Levels are written as text, not drawn as graphics.' },
    ];
    return { text, fields, notes };
  }

  function renderDrawer() {
    if (!drawerKind) return;
    const body = $('#drawerBody');
    const scroll = body.scrollTop;
    $('#drawerTitle').textContent = PANELS[drawerKind];
    body.innerHTML = DRAWERS[drawerKind]();
    body.scrollTop = scroll;
  }
  function openDrawer(kind) {
    drawerKind = kind;
    $('#drawer').hidden = false;
    $('#drawer').classList.toggle('wide', kind === 'ats');
    $$('#rail [data-panel]').forEach((b) => b.classList.toggle('on', b.dataset.panel === kind));
    renderDrawer();
  }
  function closeDrawer() {
    drawerKind = null;
    $('#drawer').hidden = true;
    $$('#rail [data-panel]').forEach((b) => b.classList.remove('on'));
  }

  $('#rail').addEventListener('click', (e) => {
    const b = e.target.closest('[data-panel]');
    if (!b) return;
    const kind = b.dataset.panel;
    if (kind === 'add') return openModal();
    if (drawerKind === kind) closeDrawer();
    else openDrawer(kind);
  });
  $('#drawerClose').addEventListener('click', closeDrawer);

  const drawerBody = $('#drawerBody');
  drawerBody.addEventListener('click', (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.dataset.layout) {
      const l = LAYOUTS.find((x) => x.id === t.dataset.layout);
      if (state.design.layout !== l.id) {
        mutate(() => {
          state.design.layout = l.id;
          state.design.heading = l.heading;
          if (l.font) state.design.font = l.font;
        });
      }
    } else if (t.dataset.accent) {
      mutate(() => { state.design.accent = t.dataset.accent; });
    } else if (t.dataset.fonttarget) {
      fontTarget = t.dataset.fonttarget;
      renderDrawer();
    } else if (t.dataset.font != null) {
      const f = t.dataset.font;
      mutate(() => {
        if (fontTarget === 'head') state.design.headFont = f;
        else state.design.font = f;
      });
    } else if (t.dataset.pagesize) {
      mutate(() => { state.design.pageSize = t.dataset.pagesize; });
    } else if (t.dataset.heading) {
      mutate(() => { state.design.heading = t.dataset.heading; });
    } else if (t.dataset.file) {
      fileAction(t.dataset.file);
    } else if (t.hasAttribute('data-atscopy')) {
      navigator.clipboard.writeText(atsParse().text).then(() => toast('Plain text copied'), () => toast('Could not copy. Select the text and copy it instead.'));
    }
  });
  drawerBody.addEventListener('input', (e) => {
    const inp = e.target.closest('[data-design]');
    if (!inp) return;
    if (!designDirty) { snapshot(); designDirty = true; }
    const key = inp.dataset.design;
    if (inp.type === 'checkbox') state.design[key] = inp.checked;
    else if (inp.type === 'range') state.design[key] = +inp.value;
    else state.design[key] = inp.value;
    if (inp.type === 'range') inp.closest('.field').querySelector('output').textContent = inp.value + inp.dataset.unit;
    render({ drawer: false });
  });
  drawerBody.addEventListener('change', (e) => {
    if (e.target.dataset.secv != null) return setVariant(+e.target.dataset.secv, e.target.value);
    if (!e.target.closest('[data-design]')) return;
    designDirty = false;
    if (e.target.type !== 'range') renderDrawer();
  });

  // Rearrange drag & drop
  let dragEl = null;
  drawerBody.addEventListener('dragstart', (e) => {
    const li = e.target.closest('li[data-id]');
    if (!li) return;
    dragEl = li;
    li.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', li.dataset.id);
  });
  drawerBody.addEventListener('dragover', (e) => {
    const list = e.target.closest('.ra-list');
    if (!list || !dragEl) return;
    e.preventDefault();
    const after = $$('li:not(.dragging)', list).find((li) => e.clientY < li.getBoundingClientRect().top + li.offsetHeight / 2);
    if (after) list.insertBefore(dragEl, after);
    else list.appendChild(dragEl);
  });
  drawerBody.addEventListener('drop', (e) => { if (dragEl) e.preventDefault(); });
  drawerBody.addEventListener('dragend', () => {
    if (!dragEl) return;
    dragEl.classList.remove('dragging');
    dragEl = null;
    const order = $$('.ra-list', drawerBody).flatMap((list) => $$('li', list).map((li) => [li.dataset.id, list.dataset.col]));
    const before = state.sections.map((s) => s.id + s.column).join();
    const after = order.map(([id, col]) => id + (col || state.sections.find((s) => s.id === id).column)).join();
    if (before === after) return;
    mutate(() => {
      const byId = Object.fromEntries(state.sections.map((s) => [s.id, s]));
      state.sections = order.map(([id, col]) => {
        const s = byId[id];
        if (col) s.column = col;
        return s;
      });
    });
  });

  /* ---------------- Modal: add section ---------------- */
  function openModal() {
    const existing = new Set(state.sections.map((s) => s.type));
    $('#modalBody').innerHTML = `<div class="type-grid">${Object.entries(TYPES).map(([k, t]) => `
      <button class="type-card" data-add="${k}"><strong>${t.label}</strong><span>${t.hint}</span>
      <em>${existing.has(k) ? 'Already on your resume · add another' : t.col === 'left' ? 'Goes in the main column' : 'Goes in the side column'}</em></button>`).join('')}</div>`;
    $('#modal').hidden = false;
    $('#modalBody [data-add]').focus();
  }
  function closeModal() { $('#modal').hidden = true; }
  $('#modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget || e.target.closest('[data-close]')) return closeModal();
    const card = e.target.closest('[data-add]');
    if (card) addSection(card.dataset.add);
  });

  /* ---------------- Files ---------------- */
  const fileName = () => (state.meta.name || state.header.name || 'Resume').replace(/[\\/:*?"<>|]+/g, '').trim() || 'Resume';

  function downloadPDF() {
    const prev = document.title;
    document.title = fileName();
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    window.print();
    setTimeout(() => { document.title = prev; }, 500);
  }

  function fileAction(kind) {
    switch (kind) {
      case 'pdf': downloadPDF(); break;
      case 'photo': $('#photoInput').click(); break;
      case 'photo-remove': mutate(() => { state.header.photo = ''; }); break;
      case 'export': {
        const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = fileName() + '.json';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
        toast('Backup exported');
        break;
      }
      case 'import': $('#importInput').click(); break;
      case 'sample': mutate(() => { state = randomResume(); }); toast('Random example loaded', true); break;
      case 'blank': mutate(() => { state = blankResume(); }); toast('Started a blank resume', true); break;
      default: break;
    }
  }

  $('#importInput').addEventListener('change', async (e) => {
    const f = e.target.files[0];
    e.target.value = '';
    if (!f) return;
    try {
      const next = normalize(JSON.parse(await f.text()));
      mutate(() => { state = next; });
      toast('Resume imported', true);
    } catch (err) {
      toast('That file is not a valid resume backup');
    }
  });

  $('#photoInput').addEventListener('change', (e) => {
    const f = e.target.files[0];
    e.target.value = '';
    if (!f || !f.type.startsWith('image/')) return;
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      const size = 320;
      const min = Math.min(img.width, img.height);
      const c = document.createElement('canvas');
      c.width = c.height = size;
      c.getContext('2d').drawImage(img, (img.width - min) / 2, (img.height - min) / 2, min, min, 0, 0, size, size);
      URL.revokeObjectURL(url);
      mutate(() => { state.header.photo = c.toDataURL('image/jpeg', 0.85); state.design.showPhoto = true; });
    };
    img.onerror = () => { URL.revokeObjectURL(url); toast('Could not read that image'); };
    img.src = url;
  });

  /* ---------------- Toast ---------------- */
  let toastTimer = 0;
  function toast(msg, withUndo = false) {
    const t = $('#toast');
    t.innerHTML = `<span>${esc(msg)}</span>${withUndo ? '<button data-undo>Undo</button>' : ''}`;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 4500);
  }
  $('#toast').addEventListener('click', (e) => {
    if (e.target.closest('[data-undo]')) { undo(); $('#toast').classList.remove('show'); }
  });

  /* ---------------- Top bar ---------------- */
  $('#undoBtn').addEventListener('click', undo);
  $('#redoBtn').addEventListener('click', redo);
  $('#downloadBtn').addEventListener('click', downloadPDF);
  $('#previewBtn').addEventListener('click', () => setPreview(!previewOn));
  // Revealing or hiding an entry's empty fields changes its height, so re-check the page breaks
  page.addEventListener('focusin', scheduleBreaks);
  page.addEventListener('focusout', scheduleBreaks);
  const setZoom = (z) => { zoom = Math.min(1.6, Math.max(0.5, Math.round(z * 10) / 10)); updateChrome(); };
  $('#zoomIn').addEventListener('click', () => setZoom(zoom + 0.1));
  $('#zoomOut').addEventListener('click', () => setZoom(zoom - 0.1));
  const docName = $('#docName');
  docName.addEventListener('focus', () => snapshot());
  docName.addEventListener('input', () => { state.meta.name = docName.value; scheduleSave(); updateChrome(); });
  docName.addEventListener('keydown', (e) => { if (e.key === 'Enter') docName.blur(); });

  document.addEventListener('keydown', (e) => {
    const mod = e.ctrlKey || e.metaKey;
    const inField = e.target.matches && e.target.matches('input, textarea, select');
    if (mod && !inField && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
    else if (mod && !inField && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); }
    else if (mod && e.key.toLowerCase() === 'p') { e.preventDefault(); downloadPDF(); }
    else if (mod && e.key.toLowerCase() === 's') { e.preventDefault(); manualSave(); }
    else if (e.key === 'Escape') {
      if (!$('#savePop').hidden) closeSavePop();
      else if (pop) closeStylePop();
      else if (previewOn) setPreview(false);
      else if (!$('#modal').hidden) closeModal();
      else if (drawerKind) closeDrawer();
    }
  });

  // Fill icon slots declared in the HTML
  $$('[data-icon]').forEach((el) => el.insertAdjacentHTML('afterbegin', I[el.dataset.icon] || ''));

  // An unexpected error should never fail silently. Log it, try to save what we have, and tell
  // the user once (not on every repeat of the same error).
  let errorShown = false;
  const onAppError = (err) => {
    console.error('Resume Builder error:', err);
    try { saveNow(); } catch (e) { /* saving is best effort here */ }
    if (errorShown) return;
    errorShown = true;
    toast('Something went wrong. Your edits are saved; reload the page if anything looks wrong.');
  };
  window.addEventListener('error', (e) => onAppError(e.error || e.message));
  window.addEventListener('unhandledrejection', (e) => onAppError(e.reason));

  render();
  syncWithDisk().then(loadDiskInfo); // loadDiskInfo: so save messages can name the real file
  // Web fonts change text metrics, so re-measure page breaks once they load
  if (document.fonts) {
    document.fonts.ready.then(updateBreaks);
    document.fonts.addEventListener('loadingdone', updateBreaks);
  }
})();
