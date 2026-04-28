export type Lang = 'ca' | 'en'

type Project = { name: string; tag: string; yr: string; url: string }
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
    bootLabel: 'PalSec WebLab · Carregant',
    topbarTagline: 'Un departament de PalSec Agency',
    toggles: { lang: { ca: 'CA', en: 'EN' }, theme: { day: 'Dia', night: 'Nit' } },
    sceneLabels: ['Inici', 'Manifest', 'Projectes', 'Mètode', 'Servei', 'Contacte'],
    scrollHint: 'Desplaça per avançar',

    title: {
      eyebrow: 'Un projecte de PalSec Agcy.',
      h: {
        l1: 'Webs a mida',
        l2: 'per a marques que rebutgen',
        l3: 'el disseny per defecte.',
      },
      sub: 'Som el WebLab de PalSec Agency. Dissenyem i programem webs des de zero per a marques i empreses que volen ser percebudes amb la mateixa cura amb què treballen. Cap plantilla. Cap WordPress. Cap producte enllaunat. Cada projecte: codi propi, disseny únic, llançament en 6 a 8 setmanes.',
      smallTag: 'PalSec Agency · WebLab',
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
        { name: 'Neutral Estudio', tag: 'Estudi · Web', yr: '2025', url: 'https://neutralestudio.es' },
        { name: 'Estudi Dental Carrera', tag: 'Marca · Web', yr: '2025', url: 'https://estudi-dental-carrera.vercel.app' },
        { name: 'PalSec Agency', tag: 'Marca · Web', yr: '2025', url: 'https://www.palsec.agency' },
        { name: 'Global Fisio', tag: 'Marca · Web', yr: '2024', url: 'https://global-fisio.vercel.app' },
        { name: 'iPediatria', tag: 'Marca · Web', yr: '2024', url: 'https://i-pediatria.vercel.app' },
      ],
    },
    quote: {
      open: 'Quan publiquem una web, hi has de reconèixer la teva veu, no la nostra.',
      close: "És l'única regla que no negociem.",
      cite: 'Mètode PalSec WebLab',
    },
    services: {
      h: 'Servei',
      sub: 'Tres coses, ben fetes',
      cells: [
        {
          n: '01',
          h: 'Webs corporatives. Disseny i copy fets a mida des de la primera línia.',
          list: ['Estratègia', 'Disseny UX/UI', 'Art direction', 'Copy'],
        },
        {
          n: '02',
          h: 'Codi propi. Sense WordPress, sense temes comprats. La web és teva, no llogada.',
          list: ['Frontend', 'CMS headless', 'Hosting', 'Manteniment'],
        },
        {
          n: '03',
          h: 'Detalls que es noten. Animació, 3D i micro-interaccions on aporten alguna cosa real.',
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
      deptValue: 'WebLab · PalSec Agency',
      hqValue: 'Catalunya',
    },
  },

  en: {
    bootLabel: 'PalSec WebLab · Loading',
    topbarTagline: 'A PalSec Agency department',
    toggles: { lang: { ca: 'CA', en: 'EN' }, theme: { day: 'Day', night: 'Night' } },
    sceneLabels: ['Index', 'Manifesto', 'Work', 'Method', 'Practice', 'Contact'],
    scrollHint: 'Scroll to advance',

    title: {
      eyebrow: 'A PalSec Agcy. project',
      h: {
        l1: 'Bespoke websites',
        l2: 'for brands that reject',
        l3: 'the default.',
      },
      sub: "We're the WebLab of PalSec Agency. We design and code websites from scratch for brands and companies who want to be seen with the same care they put into their work. No templates. No WordPress. No off-the-shelf products. Every project: our own code, unique design, shipped in 6 to 8 weeks.",
      smallTag: 'PalSec Agency · WebLab',
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
        { name: 'Neutral Estudio', tag: 'Studio · Web', yr: '2025', url: 'https://neutralestudio.es' },
        { name: 'Estudi Dental Carrera', tag: 'Brand · Web', yr: '2025', url: 'https://estudi-dental-carrera.vercel.app' },
        { name: 'PalSec Agency', tag: 'Brand · Web', yr: '2025', url: 'https://www.palsec.agency' },
        { name: 'Global Fisio', tag: 'Brand · Web', yr: '2024', url: 'https://global-fisio.vercel.app' },
        { name: 'iPediatria', tag: 'Brand · Web', yr: '2024', url: 'https://i-pediatria.vercel.app' },
      ],
    },
    quote: {
      open: 'When we ship a website, you should hear your voice in it, not ours.',
      close: "That's the one rule we don't negotiate.",
      cite: 'PalSec WebLab Method',
    },
    services: {
      h: 'Practice',
      sub: 'Three things, well made',
      cells: [
        {
          n: '01',
          h: 'Brand websites. Design and copy made from the first line.',
          list: ['Strategy', 'UX/UI Design', 'Art Direction', 'Copy'],
        },
        {
          n: '02',
          h: "Our own code. No WordPress, no purchased themes. The site is yours, not rented.",
          list: ['Frontend', 'Headless CMS', 'Hosting', 'Maintenance'],
        },
        {
          n: '03',
          h: 'Details that show. Animation, 3D, and micro-interactions where they actually help.',
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
      deptValue: 'WebLab · PalSec Agency',
      hqValue: 'Catalonia',
    },
  },
}
