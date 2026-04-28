import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Scene3D, { type Scene3DHandle } from './Scene3D'

gsap.registerPlugin(ScrollTrigger)

const SCENE_LABELS = [
  'Inici',
  'Manifest',
  'Projectes',
  'Cita',
  'Servei',
  'Contacte',
]

const TOTAL = SCENE_LABELS.length

export default function App() {
  const proxyRef = useRef<HTMLDivElement>(null)
  const sceneRefs = useRef<(HTMLDivElement | null)[]>([])
  const sceneEls = (i: number) => (el: HTMLDivElement | null) => {
    sceneRefs.current[i] = el
  }
  const progressBarRef = useRef<HTMLDivElement>(null)
  const counterNumRef = useRef<HTMLElement>(null)
  const sceneLabelRef = useRef<HTMLElement>(null)
  const sceneRef = useRef<Scene3DHandle>(null)

  const [booting, setBooting] = useState(true)
  const [bootCount, setBootCount] = useState(0)

  useEffect(() => {
    const obj = { v: 0 }
    const tween = gsap.to(obj, {
      v: 100,
      duration: 1.6,
      ease: 'power2.inOut',
      onUpdate: () => setBootCount(Math.round(obj.v)),
      onComplete: () => {
        gsap.delayedCall(0.25, () => setBooting(false))
      },
    })
    return () => {
      tween.kill()
    }
  }, [])

  useEffect(() => {
    if (booting) return
    const proxy = proxyRef.current!
    const ctx = gsap.context(() => {
      gsap.set(sceneRefs.current, { opacity: 0, y: 24 })
      gsap.set(sceneRefs.current[0], { opacity: 1, y: 0 })

      const total = TOTAL

      const tl = gsap.timeline({
        scrollTrigger: {
          scroller: proxy,
          trigger: proxy.querySelector('.scroll-proxy__track'),
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.2,
          onUpdate: (self) => {
            const p = self.progress
            sceneRef.current?.setProgress(p)
            if (progressBarRef.current) {
              progressBarRef.current.style.width = `${p * 100}%`
            }
            const idx = Math.min(Math.floor(p * total), total - 1)
            if (counterNumRef.current) {
              counterNumRef.current.textContent = String(idx + 1).padStart(2, '0')
            }
            if (sceneLabelRef.current) {
              sceneLabelRef.current.textContent = SCENE_LABELS[idx]
            }
          },
        },
      })

      for (let i = 0; i < total - 1; i++) {
        const a = sceneRefs.current[i]
        const b = sceneRefs.current[i + 1]
        tl.to(
          a,
          { opacity: 0, y: -32, duration: 0.5, ease: 'power2.in' },
          i + 0.45,
        ).fromTo(
          b,
          { opacity: 0, y: 32 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
          i + 0.55,
        )
      }
    }, proxy)

    ScrollTrigger.refresh()
    return () => ctx.revert()
  }, [booting])

  return (
    <>
      <div className={`boot ${!booting ? 'hidden' : ''}`} aria-hidden={!booting}>
        <div className="boot__inner">
          <div style={{ opacity: 0.6 }}>PalSec WebLab — Carregant</div>
          <div className="boot__count">{String(bootCount).padStart(3, '0')}</div>
        </div>
      </div>

      <div className="progress" aria-hidden>
        <div className="progress__bar" ref={progressBarRef} />
      </div>

      <div className="stage">
        <div className="stage__canvas">
          <Scene3D ref={sceneRef} />
        </div>

        <div className="stage__scrim" aria-hidden />

        <div className="stage__overlay">
          <header className="topbar">
            <div className="topbar__mark">
              PalSec WebLab<span>.</span>
            </div>
            <nav className="topbar__nav">
              <span>Inici</span>
              <span>Projectes</span>
              <span>Servei</span>
              <span>Contacte</span>
            </nav>
            <div>Un departament de PalSec Agency</div>
          </header>

          <div className="scenes">
            <section className="scene" ref={sceneEls(0)}>
              <div className="scene__inner s-title">
                <div className="s-title__eyebrow">Disseny i desenvolupament web · Des de Catalunya</div>
                <h1 className="s-title__h">
                  PalSec<i>,</i> dissenyem<br />
                  webs que es <i>recorden</i><br />
                  més enllà del scroll.
                </h1>
                <div className="s-title__sub">
                  <p>
                    Som el WebLab de PalSec Agency: un equip dedicat exclusivament al
                    disseny i desenvolupament de llocs web a mida — amb cura per la
                    tipografia, el ritme i els detalls que fan que una web sembli un
                    objecte i no una plantilla.
                  </p>
                  <small>PalSec Agency · WebLab</small>
                </div>
              </div>
            </section>

            <section className="scene" ref={sceneEls(1)}>
              <div className="scene__inner s-manifesto">
                <div className="s-manifesto__label">
                  <span>Manifest</span>
                  <b>§ 01 / 06</b>
                </div>
                <h2 className="s-manifesto__h">
                  No fem webs que <em>reaccionen</em> — fem webs que
                  <em> responen</em>. Amb pes, amb temps, amb la mena de
                  cura que fa pensar que algú s'hi ha <em>preocupat</em>.
                </h2>
              </div>
            </section>

            <section className="scene" ref={sceneEls(2)}>
              <div className="scene__inner s-works">
                <div className="s-works__head">
                  <h2>Projectes Seleccionats</h2>
                  <span>Una mostra del nostre treball</span>
                </div>
                <div className="s-works__list">
                  {[
                    ['Marbre & Mà', 'Identitat', '2026'],
                    ['Folio Press', 'Editorial · Web', '2025'],
                    ['Halcyon Àudio', 'Marca · Producte', '2025'],
                    ['Nord Co.', 'Web · 3D', '2024'],
                    ['Tipografia No. 7', 'Identitat', '2024'],
                    ['Estudis Cendra', 'Motion · Marca', '2023'],
                  ].map(([name, tag, yr], i) => (
                    <div className="s-works__row" key={name}>
                      <span className="num">{String(i + 1).padStart(2, '0')}</span>
                      <span className="name">
                        {name} <i>— un estudi</i>
                      </span>
                      <span className="tag">{tag}</span>
                      <span className="yr">{yr}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="scene" ref={sceneEls(3)}>
              <div className="scene__inner s-quote">
                <blockquote>
                  &laquo;Una bona web no demana atenció. <span>Se la guanya, a
                  poc a poc, per ser digna d'una segona mirada.&raquo;</span>
                </blockquote>
                <cite>— Apunt d'estudi Núm. 14</cite>
              </div>
            </section>

            <section className="scene" ref={sceneEls(4)}>
              <div className="scene__inner s-services">
                <h2 className="s-services__h">
                  Servei
                  <em>El que fem, en paraules clares</em>
                </h2>
                <div className="s-services__grid">
                  {[
                    {
                      n: '01',
                      h: 'Webs corporatives fetes per durar més enllà del llançament',
                      list: ['Estratègia', 'Disseny UX/UI', 'Art direction', 'Copy'],
                    },
                    {
                      n: '02',
                      h: 'Desenvolupament a mida amb codi propi i net',
                      list: ['Frontend', 'CMS', 'Headless', 'Integracions'],
                    },
                    {
                      n: '03',
                      h: 'Detall en moviment: animació, 3D i interacció',
                      list: ['Three.js', 'Motion', 'Micro-interaccions', 'Performance'],
                    },
                  ].map((s) => (
                    <div className="s-services__cell" key={s.n}>
                      <div className="idx">{s.n}</div>
                      <h3>{s.h}</h3>
                      <ul>
                        {s.list.map((x) => (
                          <li key={x}>— {x}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="scene" ref={sceneEls(5)}>
              <div className="scene__inner s-contact">
                <h2 className="s-contact__h">
                  Tens un projecte?<br />
                  <u>Comencem</u> a parlar-ne.
                </h2>
                <div className="s-contact__grid">
                  <div className="s-contact__col">
                    <span>Correu</span>
                    <a href="mailto:weblab@palsec.agency">weblab@palsec.agency</a>
                  </div>
                  <div className="s-contact__col">
                    <span>Agència</span>
                    <a href="mailto:hola@palsec.agency">hola@palsec.agency</a>
                  </div>
                  <div className="s-contact__col">
                    <span>Departament</span>
                    <p>WebLab — PalSec Agency</p>
                  </div>
                  <div className="s-contact__col">
                    <span>Seu</span>
                    <p>Catalunya</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <footer className="botbar">
            <div className="botbar__counter">
              <b ref={counterNumRef}>01</b>
              <em>/ 06 —</em>
              <em ref={sceneLabelRef}>Inici</em>
            </div>
            <div className="botbar__hint">
              <span className="dot" />
              Desplaça per avançar
            </div>
          </footer>
        </div>
      </div>

      <div className="scroll-proxy" ref={proxyRef}>
        <div className="scroll-proxy__track" />
      </div>
    </>
  )
}
