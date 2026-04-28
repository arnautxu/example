export type Lang = 'ca' | 'en'

type Project = { name: string; tag: string; yr: string }
type Service = { n: string; h: string; list: string[] }

export type Copy = {
  bootLabel: string
  topbarTagline: string
  toggles: { lang: { ca: string; en: string }; theme: { day: string; night: string } }
  sceneLabels: string[]
  scrollHint: string

  title: {
    eyebrow: string
    h: { l1: string; l2: string; l3: string }
    sub: string
    smallTag: string
  }
  manifesto: { label: string; section: string; h: string }
  works: { head: string; sub: string; rowSuffix: string; items: Project[] }
  quote: { open: string; close: string; cite: string }
  services: { h: string; sub: string; cells: Service[] }
  contact: {
    h: { l1: string; l2pre: string; l2under: string; l2post: string }
    cols: { email: string; agency: string; dept: string; hq: string }
    deptValue: string
    hqValue: string
  }
}

export const COPY: Record<Lang, Copy> = {
  ca: {
    bootLabel: 'PalSec WebLab — Carregant',
    topbarTagline: 'Un departament de PalSec Agency',
    toggles: { lang: { ca: 'CA', en: 'EN' }, theme: { day: 'Dia', night: 'Nit' } },
    sceneLabels: ['Inici', 'Manifest', 'Projectes', 'Cita', 'Servei', 'Contacte'],
    scrollHint: 'Desplaça per avançar',

    title: {
      eyebrow: 'Un projecte de PalSec Agcy.',
      h: { l1: 'PalSec, dissenyem', l2: 'webs que es recorden', l3: 'més enllà del scroll.' },
      sub: 'Som el WebLab de PalSec Agency: un equip dedicat exclusivament al disseny i desenvolupament de llocs web a mida — amb cura per la tipografia, el ritme i els detalls que fan que una web sembli un objecte i no una plantilla.',
      smallTag: 'PalSec Agency · WebLab',
    },
    manifesto: {
      label: 'Manifest',
      section: '§ 01 / 06',
      h: "No fem webs que reaccionen — fem webs que responen. Amb pes, amb temps, amb la mena de cura que fa pensar que algú s'hi ha preocupat.",
    },
    works: {
      head: 'Projectes Seleccionats',
      sub: 'Una mostra del nostre treball',
      rowSuffix: '— un estudi',
      items: [
        { name: 'Marbre & Mà', tag: 'Identitat', yr: '2026' },
        { name: 'Folio Press', tag: 'Editorial · Web', yr: '2025' },
        { name: 'Halcyon Àudio', tag: 'Marca · Producte', yr: '2025' },
        { name: 'Nord Co.', tag: 'Web · 3D', yr: '2024' },
        { name: 'Tipografia No. 7', tag: 'Identitat', yr: '2024' },
        { name: 'Estudis Cendra', tag: 'Motion · Marca', yr: '2023' },
      ],
    },
    quote: {
      open: 'Una bona web no demana atenció.',
      close: "Se la guanya, a poc a poc, per ser digna d'una segona mirada.",
      cite: "— Apunt d'estudi Núm. 14",
    },
    services: {
      h: 'Servei',
      sub: 'El que fem, en paraules clares',
      cells: [
        { n: '01', h: 'Webs corporatives fetes per durar més enllà del llançament', list: ['Estratègia', 'Disseny UX/UI', 'Art direction', 'Copy'] },
        { n: '02', h: 'Desenvolupament a mida amb codi propi i net', list: ['Frontend', 'CMS', 'Headless', 'Integracions'] },
        { n: '03', h: 'Detall en moviment: animació, 3D i interacció', list: ['Three.js', 'Motion', 'Micro-interaccions', 'Performance'] },
      ],
    },
    contact: {
      h: { l1: 'Tens un projecte?', l2pre: '', l2under: 'Comencem', l2post: ' a parlar-ne.' },
      cols: { email: 'Correu', agency: 'Agència', dept: 'Departament', hq: 'Seu' },
      deptValue: 'WebLab — PalSec Agency',
      hqValue: 'Catalunya',
    },
  },

  en: {
    bootLabel: 'PalSec WebLab — Loading',
    topbarTagline: 'A PalSec Agency department',
    toggles: { lang: { ca: 'CA', en: 'EN' }, theme: { day: 'Day', night: 'Night' } },
    sceneLabels: ['Index', 'Manifesto', 'Works', 'Statement', 'Practice', 'Contact'],
    scrollHint: 'Scroll to advance',

    title: {
      eyebrow: 'A PalSec Agcy. project',
      h: { l1: 'PalSec — websites', l2: 'that stay with you', l3: 'beyond the scroll.' },
      sub: "We are PalSec Agency's WebLab — a team dedicated exclusively to bespoke web design and development, with care for typography, rhythm, and the details that make a website feel like an object, not a template.",
      smallTag: 'PalSec Agency · WebLab',
    },
    manifesto: {
      label: 'Manifesto',
      section: '§ 01 / 06',
      h: "We don't build websites that react — we build websites that respond. With weight, with timing, with the kind of craft that suggests someone cared.",
    },
    works: {
      head: 'Selected Works',
      sub: 'A selection of our work',
      rowSuffix: '— a study',
      items: [
        { name: 'Marble & Hand', tag: 'Identity', yr: '2026' },
        { name: 'Folio Press', tag: 'Editorial · Web', yr: '2025' },
        { name: 'Halcyon Audio', tag: 'Brand · Product', yr: '2025' },
        { name: 'Northbound Co.', tag: 'Site · 3D', yr: '2024' },
        { name: 'Type Atelier No. 7', tag: 'Identity', yr: '2024' },
        { name: 'Cinder Studios', tag: 'Motion · Brand', yr: '2023' },
      ],
    },
    quote: {
      open: "A good website doesn't ask for attention.",
      close: 'It earns it, slowly, by being worth a second look.',
      cite: '— Studio Note No. 14',
    },
    services: {
      h: 'Practice',
      sub: 'What we do, in plain language',
      cells: [
        { n: '01', h: 'Brand websites built to last past the launch', list: ['Strategy', 'UX/UI Design', 'Art Direction', 'Copy'] },
        { n: '02', h: 'Bespoke development with clean, owned code', list: ['Frontend', 'CMS', 'Headless', 'Integrations'] },
        { n: '03', h: 'Detail in motion: animation, 3D, and interaction', list: ['Three.js', 'Motion', 'Micro-interactions', 'Performance'] },
      ],
    },
    contact: {
      h: { l1: 'Have a project?', l2pre: "Let's ", l2under: 'begin', l2post: ' a conversation.' },
      cols: { email: 'Email', agency: 'Agency', dept: 'Department', hq: 'HQ' },
      deptValue: 'WebLab — PalSec Agency',
      hqValue: 'Catalonia',
    },
  },
}
