import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Scene3D, { type Scene3DHandle } from './Scene3D'

gsap.registerPlugin(ScrollTrigger)

const SCENE_LABELS = [
  'Index',
  'Manifesto',
  'Selected Works',
  'Statement',
  'Practice',
  'Contact',
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
          <div style={{ opacity: 0.6 }}>React Studio — Loading</div>
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
              React<span>.</span>
            </div>
            <nav className="topbar__nav">
              <span>Index</span>
              <span>Works</span>
              <span>Practice</span>
              <span>Contact</span>
            </nav>
            <div>2018 — 2026</div>
          </header>

          <div className="scenes">
            <section className="scene" ref={sceneEls(0)}>
              <div className="scene__inner s-title">
                <div className="s-title__eyebrow">A Studio for Moving Pictures</div>
                <h1 className="s-title__h">
                  React<i>,</i> a design<br />
                  studio for the<br />
                  <i>screen</i> &amp; everything after.
                </h1>
                <div className="s-title__sub">
                  <p>
                    We craft brand systems, interactive sites, and three-dimensional
                    storytelling for companies who want their first impression to
                    last longer than a scroll.
                  </p>
                  <small>Lisbon · New York</small>
                </div>
              </div>
            </section>

            <section className="scene" ref={sceneEls(1)}>
              <div className="scene__inner s-manifesto">
                <div className="s-manifesto__label">
                  <span>Manifesto</span>
                  <b>§ 01 / 06</b>
                </div>
                <h2 className="s-manifesto__h">
                  We don't make websites that <em>react</em> — we make websites that
                  <em> respond</em>. With weight, with timing, with the kind of
                  craft that suggests someone <em>cared</em>.
                </h2>
              </div>
            </section>

            <section className="scene" ref={sceneEls(2)}>
              <div className="scene__inner s-works">
                <div className="s-works__head">
                  <h2>Selected Works</h2>
                  <span>14 projects · 2022 — 2026</span>
                </div>
                <div className="s-works__list">
                  {[
                    ['Marble & Hand', 'Identity', '2026'],
                    ['Folio Press', 'Editorial · Web', '2025'],
                    ['Halcyon Audio', 'Brand · Product', '2025'],
                    ['Northbound Co.', 'Site · 3D', '2024'],
                    ['Type Atelier No. 7', 'Identity', '2024'],
                    ['Cinder Studios', 'Motion · Brand', '2023'],
                  ].map(([name, tag, yr], i) => (
                    <div className="s-works__row" key={name}>
                      <span className="num">{String(i + 1).padStart(2, '0')}</span>
                      <span className="name">
                        {name} <i>— a study</i>
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
                  &ldquo;Great work doesn't ask for attention. <span>It earns it,
                  slowly, by being worth looking at twice.&rdquo;</span>
                </blockquote>
                <cite>— Studio Note No. 14</cite>
              </div>
            </section>

            <section className="scene" ref={sceneEls(4)}>
              <div className="scene__inner s-services">
                <h2 className="s-services__h">
                  Practice
                  <em>What we do, in plain language</em>
                </h2>
                <div className="s-services__grid">
                  {[
                    {
                      n: '01',
                      h: 'Brand systems built to last past the launch deck',
                      list: ['Identity', 'Naming', 'Voice', 'Guidelines'],
                    },
                    {
                      n: '02',
                      h: 'Websites that feel like objects, not templates',
                      list: ['Art Direction', 'Frontend', 'Three.js', 'CMS'],
                    },
                    {
                      n: '03',
                      h: 'Three-dimensional craft for stories told on flat screens',
                      list: ['Modelling', 'Shading', 'Motion', 'Real-time'],
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
                  Have a project?<br />
                  Let's <u>begin</u> a conversation.
                </h2>
                <div className="s-contact__grid">
                  <div className="s-contact__col">
                    <span>Email</span>
                    <a href="mailto:hello@react.studio">hello@react.studio</a>
                  </div>
                  <div className="s-contact__col">
                    <span>Press</span>
                    <a href="mailto:press@react.studio">press@react.studio</a>
                  </div>
                  <div className="s-contact__col">
                    <span>Lisbon</span>
                    <p>R. Garrett 22, 2º</p>
                  </div>
                  <div className="s-contact__col">
                    <span>New York</span>
                    <p>110 Greene St, 4F</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <footer className="botbar">
            <div className="botbar__counter">
              <b ref={counterNumRef}>01</b>
              <em>/ 06 —</em>
              <em ref={sceneLabelRef}>Index</em>
            </div>
            <div className="botbar__hint">
              <span className="dot" />
              Scroll to advance
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
