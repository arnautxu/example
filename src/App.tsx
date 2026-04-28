import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Scene3D, { type Scene3DHandle } from './Scene3D'
import { COPY, type Lang } from './copy'

gsap.registerPlugin(ScrollTrigger)

type Theme = 'night' | 'day'

const TOTAL = 6

export default function App() {
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
    const ctx = gsap.context(() => {
      // All scenes are at full opacity. The transition is a vertical wipe
      // implemented with clip-path: at any given moment, A occupies the
      // top portion of the viewport and B occupies the bottom — they
      // share a moving horizontal split line, never the same pixel.
      gsap.set(sceneRefs.current, { opacity: 1, clipPath: 'inset(100% 0% 0% 0%)' })
      gsap.set(sceneRefs.current[0], { clipPath: 'inset(0% 0% 0% 0%)' })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.scroll-proxy__track',
          start: 'top top',
          end: 'bottom bottom',
          // Smooth scrub: more lag = softer, less twitchy
          scrub: 2.2,
          // Snap to scene boundaries when user stops scrolling so transitions
          // always finish cleanly, with their own momentum.
          snap: {
            snapTo: 1 / (TOTAL - 1),
            duration: { min: 0.4, max: 0.9 },
            ease: 'power2.inOut',
            delay: 0.08,
          },
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

      // Vertical wipe driven by a single eased curve. A and B share a
      // moving boundary line, so no pixel ever holds both scenes at once.
      // The wipe spans most of the segment for a slow, cinematic feel.
      for (let i = 0; i < TOTAL - 1; i++) {
        const a = sceneRefs.current[i]
        const b = sceneRefs.current[i + 1]
        tl.to(
          a,
          { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.85, ease: 'power3.inOut' },
          i + 0.10,
        ).to(
          b,
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.85, ease: 'power3.inOut' },
          i + 0.10,
        )
      }
    })

    ScrollTrigger.refresh()
    return () => ctx.revert()
  }, [booting])

  const toggleTheme = () => setTheme((th) => (th === 'night' ? 'day' : 'night'))

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
              {theme === 'night' ? (
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
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
      </div>

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
                          <li key={x}>· {x}</li>
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
                    <a href="mailto:info@palsec.agency">info@palsec.agency</a>
                  </div>
                  <div className="s-contact__col">
                    <span>{t.contact.cols.agency}</span>
                    <a
                      href="https://www.palsec.agency"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      www.palsec.agency
                    </a>
                  </div>
                  <div className="s-contact__col">
                    <span>{t.contact.cols.dept}</span>
                    <a
                      href="https://www.palsec.agency"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t.contact.deptValue}
                    </a>
                  </div>
                  <div className="s-contact__col">
                    <span>{t.contact.cols.hq}</span>
                    <a
                      href="https://www.google.com/maps/place/Catalonia"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t.contact.hqValue}
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <footer className="botbar">
            <div className="botbar__counter">
              <b ref={counterNumRef}>01</b>
              <em>/ 06 ·</em>
              <em ref={sceneLabelRef}>{t.sceneLabels[0]}</em>
            </div>
            <div className="botbar__hint">
              <span className="dot" />
              {t.scrollHint}
            </div>
          </footer>
        </div>

      {/* Tall invisible track gives the body something to scroll. */}
      <div className="scroll-proxy__track" aria-hidden />
    </>
  )
}
