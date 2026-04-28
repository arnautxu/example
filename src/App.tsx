import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Scene3D, { type Scene3DHandle } from './Scene3D'
import { COPY, type Lang } from './copy'

gsap.registerPlugin(ScrollTrigger)

type Theme = 'night' | 'day'

const TOTAL = 6

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
  const [lang, setLang] = useState<Lang>('ca')
  const [theme, setTheme] = useState<Theme>('night')

  const t = COPY[lang]
  const sceneLabelsRef = useRef(t.sceneLabels)
  sceneLabelsRef.current = t.sceneLabels

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dataset.theme = theme
  }, [lang, theme])

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
            const idx = Math.min(Math.floor(p * TOTAL), TOTAL - 1)
            if (counterNumRef.current) {
              counterNumRef.current.textContent = String(idx + 1).padStart(2, '0')
            }
            if (sceneLabelRef.current) {
              sceneLabelRef.current.textContent = sceneLabelsRef.current[idx]
            }
          },
        },
      })

      for (let i = 0; i < TOTAL - 1; i++) {
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

  const toggleTheme = () => setTheme((th) => (th === 'night' ? 'day' : 'night'))

  // Wheel events on clickable elements (works rows, contact links) don't
  // bubble to the .scroll-proxy because those elements live above it. Forward
  // them manually so the page keeps advancing while the cursor is over a link.
  const forwardWheel = (e: React.WheelEvent<HTMLElement>) => {
    if (proxyRef.current) {
      proxyRef.current.scrollTop += e.deltaY
    }
  }

  return (
    <>
      <div className={`boot ${!booting ? 'hidden' : ''}`} aria-hidden={!booting}>
        <div className="boot__inner">
          <div style={{ opacity: 0.6 }}>{t.bootLabel}</div>
          <div className="boot__count">{String(bootCount).padStart(3, '0')}</div>
        </div>
      </div>

      <div className="progress" aria-hidden>
        <div className="progress__bar" ref={progressBarRef} />
      </div>

      {/* Top controls live in their own fixed layer above the scroll-proxy
          so they can actually receive clicks. */}
      <header className="topbar">
        <div className="topbar__mark">
          PalSec WebLab<span>.</span>
        </div>

        <div className="topbar__tag">{t.topbarTagline}</div>

        <div className="topbar__controls">
          <div className="seg" role="group" aria-label="Language">
            <button
              type="button"
              className={`seg__btn ${lang === 'ca' ? 'is-on' : ''}`}
              onClick={() => setLang('ca')}
              aria-pressed={lang === 'ca'}
            >
              CA
            </button>
            <button
              type="button"
              className={`seg__btn ${lang === 'en' ? 'is-on' : ''}`}
              onClick={() => setLang('en')}
              aria-pressed={lang === 'en'}
            >
              EN
            </button>
          </div>
          <button
            type="button"
            className="theme-btn"
            onClick={toggleTheme}
            aria-label={theme === 'night' ? t.toggles.theme.day : t.toggles.theme.night}
            title={theme === 'night' ? t.toggles.theme.day : t.toggles.theme.night}
          >
            <span className="theme-btn__icon" aria-hidden>
              {theme === 'night' ? '☀' : '☾'}
            </span>
            <span className="theme-btn__label">
              {theme === 'night' ? t.toggles.theme.day : t.toggles.theme.night}
            </span>
          </button>
        </div>
      </header>

      <div className="stage">
        <div className="stage__canvas">
          <Scene3D ref={sceneRef} theme={theme} />
        </div>

        <div className="stage__scrim" aria-hidden />

        <div className="stage__overlay">
          <div className="scenes">
            <section className="scene" ref={sceneEls(0)}>
              <div className="scene__inner s-title">
                <div className="s-title__eyebrow">{t.title.eyebrow}</div>
                <h1 className="s-title__h">
                  {t.title.h.l1}<br />
                  <i>{t.title.h.l2}</i><br />
                  {t.title.h.l3}
                </h1>
                <div className="s-title__sub">
                  <p>{t.title.sub}</p>
                  <small>{t.title.smallTag}</small>
                </div>
              </div>
            </section>

            <section className="scene" ref={sceneEls(1)}>
              <div className="scene__inner s-manifesto">
                <div className="s-manifesto__label">
                  <span>{t.manifesto.label}</span>
                  <b>{t.manifesto.section}</b>
                </div>
                <h2 className="s-manifesto__h">{t.manifesto.h}</h2>
              </div>
            </section>

            <section className="scene" ref={sceneEls(2)}>
              <div className="scene__inner s-works">
                <div className="s-works__head">
                  <h2>{t.works.head}</h2>
                  <span>{t.works.sub}</span>
                </div>
                <div className="s-works__list">
                  {t.works.items.map((p, i) => (
                    <a
                      className="s-works__row"
                      key={p.name}
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onWheel={forwardWheel}
                    >
                      <span className="num">{String(i + 1).padStart(2, '0')}</span>
                      <span className="name">
                        {p.name} <i>{t.works.rowSuffix}</i>
                      </span>
                      <span className="tag">{p.tag}</span>
                      <span className="yr">{p.yr}<span className="arrow" aria-hidden> ↗</span></span>
                    </a>
                  ))}
                </div>
              </div>
            </section>

            <section className="scene" ref={sceneEls(3)}>
              <div className="scene__inner s-quote">
                <blockquote>
                  «{t.quote.open} <span>{t.quote.close}»</span>
                </blockquote>
                <cite>{t.quote.cite}</cite>
              </div>
            </section>

            <section className="scene" ref={sceneEls(4)}>
              <div className="scene__inner s-services">
                <h2 className="s-services__h">
                  {t.services.h}
                  <em>{t.services.sub}</em>
                </h2>
                <div className="s-services__grid">
                  {t.services.cells.map((s) => (
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
                  {t.contact.h.l1}<br />
                  {t.contact.h.l2pre}
                  <u>{t.contact.h.l2under}</u>
                  {t.contact.h.l2post}
                </h2>
                <div className="s-contact__grid">
                  <div className="s-contact__col">
                    <span>{t.contact.cols.email}</span>
                    <a href="mailto:info@palsec.agency" onWheel={forwardWheel}>info@palsec.agency</a>
                  </div>
                  <div className="s-contact__col">
                    <span>{t.contact.cols.agency}</span>
                    <a
                      href="https://www.palsec.agency"
                      target="_blank"
                      rel="noopener noreferrer"
                      onWheel={forwardWheel}
                    >
                      www.palsec.agency
                    </a>
                  </div>
                  <div className="s-contact__col">
                    <span>{t.contact.cols.dept}</span>
                    <p>{t.contact.deptValue}</p>
                  </div>
                  <div className="s-contact__col">
                    <span>{t.contact.cols.hq}</span>
                    <p>{t.contact.hqValue}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <footer className="botbar">
            <div className="botbar__counter">
              <b ref={counterNumRef}>01</b>
              <em>/ 06 —</em>
              <em ref={sceneLabelRef}>{t.sceneLabels[0]}</em>
            </div>
            <div className="botbar__hint">
              <span className="dot" />
              {t.scrollHint}
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
