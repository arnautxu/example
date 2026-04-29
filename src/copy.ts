export type Lang = 'ca' | 'en'

type Project = { name: string; tag: string; yr: string; url: string }
type Service = { n: string; eyebrow: string; h: string; list: string[] }

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
    bootLabel: 'Vanta · Carregant',
    topbarTagline: 'Un projecte de PalSec Agency',
    toggles: { lang: { ca: 'CA', en: 'EN' }, theme: { day: 'Dia', night: 'Nit' } },
    sceneLabels: ['Inici', 'Manifest', 'Projectes', 'Mètode', 'Servei', 'Contacte'],
    scrollHint: 'Desplaça per avançar',

    title: {
      eyebrow: 'Un projecte de PalSec Agency.',
      h: {
        l1: 'Webs a mida',
        l2: 'per a marques que rebutgen',
        l3: 'el disseny per defecte.',
      },
      sub: 'Vanta és un projecte de PalSec Agency dedicat al disseny i desenvolupament web a mida. Dissenyem i programem webs des de zero per a marques i empreses que volen ser percebudes amb la mateixa cura amb què treballen. Cap plantilla. Cap WordPress. Cap producte enllaunat. Cada projecte: codi propi, disseny únic, llançament en 6 a 8 setmanes.',
      smallTag: 'Vanta · PalSec Agency',
    },
    manifesto: {
      label: 'Manifest',
      section: '§ 01 / 06',
      h: "La majoria d'agències et venen una plantilla amb el teu logo a sobre. Nosaltres no. Cada web que llancem es dissenya des de zero, es programa des de zero, i no s'assembla a cap altra. És més lent. És més car. Val la pena.",
    },
    works: {
      head: 'Projectes Recents',
      sub: 'Una selecció · 2024–2025',
      rowSuffix: 'visita la web',
      items: [
        { name: 'Neutral Design', tag: 'Estudi · Web', yr: '2025', url: 'https://neutraldesign.es' },
        { name: 'Estudi Dental Carrera', tag: 'Marca · Web', yr: '2025', url: 'https://estudi-dental-carrera.vercel.app' },
        { name: 'PalSec Agency', tag: 'Marca · Web', yr: '2025', url: 'https://www.palsec.agency' },
        { name: 'Global Fisio', tag: 'Marca · Web', yr: '2024', url: 'https://global-fisio.vercel.app' },
        { name: 'iPediatria', tag: 'Marca · Web', yr: '2024', url: 'https://i-pediatria.vercel.app' },
      ],
    },
    quote: {
      open: 'Quan publiquem una web, hi has de reconèixer la teva veu, no la nostra.',
      close: "És l'única regla que no negociem.",
      cite: 'Mètode Vanta',
    },
    services: {
      h: 'Servei',
      sub: 'Tres coses, ben fetes',
      cells: [
        {
          n: '01',
          eyebrow: 'Brand websites',
          h: 'Disseny i copy fets a mida des de la primera línia.',
          list: ['Estratègia', 'Disseny UX/UI', 'Art direction', 'Copy'],
        },
        {
          n: '02',
          eyebrow: 'Bespoke development',
          h: 'Codi propi. Sense WordPress. La web és teva, no llogada.',
          list: ['Frontend', 'CMS headless', 'Hosting', 'Manteniment'],
        },
        {
          n: '03',
          eyebrow: 'Detail in motion',
          h: 'Animació, 3D i micro-interaccions on aporten alguna cosa real.',
          list: ['Three.js', 'Motion', 'Micro-interaccions', 'Performance'],
        },
      ],
    },
    contact: {
      h: {
        l1: 'Tens un projecte?',
        l2pre: '',
        l2under: 'Parlem.',
        l2post: ' 30 minuts. Sense compromís.',
      },
      cols: { email: 'Correu', agency: 'Agència', dept: 'Departament', hq: 'Seu' },
      deptValue: 'Vanta · PalSec Agency',
      hqValue: 'Catalunya',
    },
  },

  en: {
    bootLabel: 'Vanta · Loading',
    topbarTagline: 'A PalSec Agency project',
    toggles: { lang: { ca: 'CA', en: 'EN' }, theme: { day: 'Day', night: 'Night' } },
    sceneLabels: ['Index', 'Manifesto', 'Work', 'Method', 'Practice', 'Contact'],
    scrollHint: 'Scroll to advance',

    title: {
      eyebrow: 'A PalSec Agency project',
      h: {
        l1: 'Bespoke websites',
        l2: 'for brands that reject',
        l3: 'the default.',
      },
      sub: "Vanta is a PalSec Agency project focused on bespoke web design and development. We design and code websites from scratch for brands and companies who want to be seen with the same care they put into their work. No templates. No WordPress. No off-the-shelf products. Every project: our own code, unique design, shipped in 6 to 8 weeks.",
      smallTag: 'Vanta · PalSec Agency',
    },
    manifesto: {
      label: 'Manifesto',
      section: '§ 01 / 06',
      h: "Most agencies sell you a template with your logo dropped on top. We don't. Every site we ship is designed from scratch, built from scratch, and looks like nothing else. It's slower. It's more expensive. It's worth it.",
    },
    works: {
      head: 'Recent Work',
      sub: 'A selection · 2024–2025',
      rowSuffix: 'visit site',
      items: [
        { name: 'Neutral Design', tag: 'Studio · Web', yr: '2025', url: 'https://neutraldesign.es' },
        { name: 'Estudi Dental Carrera', tag: 'Brand · Web', yr: '2025', url: 'https://estudi-dental-carrera.vercel.app' },
        { name: 'PalSec Agency', tag: 'Brand · Web', yr: '2025', url: 'https://www.palsec.agency' },
        { name: 'Global Fisio', tag: 'Brand · Web', yr: '2024', url: 'https://global-fisio.vercel.app' },
        { name: 'iPediatria', tag: 'Brand · Web', yr: '2024', url: 'https://i-pediatria.vercel.app' },
      ],
    },
    quote: {
      open: 'When we ship a website, you should hear your voice in it, not ours.',
      close: "That's the one rule we don't negotiate.",
      cite: 'Vanta Method',
    },
    services: {
      h: 'Practice',
      sub: 'Three things, well made',
      cells: [
        {
          n: '01',
          eyebrow: 'Brand websites',
          h: 'Design and copy made from the first line.',
          list: ['Strategy', 'UX/UI Design', 'Art Direction', 'Copy'],
        },
        {
          n: '02',
          eyebrow: 'Bespoke development',
          h: "Our own code. No WordPress. The site is yours, not rented.",
          list: ['Frontend', 'Headless CMS', 'Hosting', 'Maintenance'],
        },
        {
          n: '03',
          eyebrow: 'Detail in motion',
          h: 'Animation, 3D, and micro-interactions where they actually help.',
          list: ['Three.js', 'Motion', 'Micro-interactions', 'Performance'],
        },
      ],
    },
    contact: {
      h: {
        l1: 'Got a project?',
        l2pre: '',
        l2under: "Let's talk.",
        l2post: ' 30 minutes. No obligation.',
      },
      cols: { email: 'Email', agency: 'Agency', dept: 'Department', hq: 'HQ' },
      deptValue: 'Vanta · PalSec Agency',
      hqValue: 'Catalonia',
    },
  },
}
