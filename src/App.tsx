import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
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

  // Discrete one-step-per-gesture navigation: every wheel tick / swipe /
  // arrow key advances exactly ONE scene, regardless of input strength. A
  // lock blocks new input until the smooth scrollTo animation finishes, so
  // a fast trackpad fling can't skip past a scene.
  useEffect(() => {
    if (booting) return

    // Lenis is kept only as the smooth-scroll engine that animates
    // scrollTo() — its native wheel/touch input handlers are disabled so
    // we control the cadence ourselves.
    const lenis = new Lenis({
      smoothWheel: false,
      syncTouch: false,
    })

    lenis.on('scroll', ScrollTrigger.update)

    const tickerCb = (time: number) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(tickerCb)
    gsap.ticker.lagSmoothing(0)

    let animatingUntil = 0
    let currentTargetIdx = 0

    const goTo = (idx: number) => {
      const clamped = Math.max(0, Math.min(TOTAL - 1, idx))
      if (clamped === currentTargetIdx) return
      if (Date.now() < animatingUntil) return
      currentTargetIdx = clamped

      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight
      const target = (clamped / (TOTAL - 1)) * maxScroll
      const duration = 0.95

      animatingUntil = Date.now() + duration * 1000 + 80
      lenis.scrollTo(target, {
        duration,
        easing: (x: number) => 1 - Math.pow(1 - x, 3), // power3.out
      })
    }

    const onWheel = (e: WheelEvent) => {
      // Block native scroll completely; we drive scroll only via goTo.
      e.preventDefault()
      if (Math.abs(e.deltaY) < 4) return
      if (Date.now() < animatingUntil) return
      goTo(currentTargetIdx + (e.deltaY > 0 ? 1 : -1))
    }

    let touchStartY: number | null = null
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY
    }
    const onTouchMove = (e: TouchEvent) => {
      if (touchStartY === null) return
      e.preventDefault()
      if (Date.now() < animatingUntil) return
      const dy = touchStartY - e.touches[0].clientY
      if (Math.abs(dy) > 36) {
        goTo(currentTargetIdx + (dy > 0 ? 1 : -1))
        touchStartY = null // require a fresh touch for the next step
      }
    }
    const onTouchEnd = () => {
      touchStartY = null
    }

    const onKey = (e: KeyboardEvent) => {
      const target = e.target as Element | null
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')
      )
        return
      if (Date.now() < animatingUntil) return
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault()
        goTo(currentTargetIdx + 1)
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault()
        goTo(currentTargetIdx - 1)
      } else if (e.key === 'Home') {
        e.preventDefault()
        goTo(0)
      } else if (e.key === 'End') {
        e.preventDefault()
        goTo(TOTAL - 1)
      }
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('keydown', onKey)

    return () => {
      gsap.ticker.remove(tickerCb)
      lenis.destroy()
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('keydown', onKey)
    }
  }, [booting])

  // Active scene index, kept in a ref so updating it during scroll doesn't
  // re-render the React tree. Initialized to 0 (Inici).
  const activeIdxRef = useRef(0)

  useEffect(() => {
    if (booting) return
    const ctx = gsap.context(() => {
      // Start with only scene 0 visible. The rest are hidden, ready to fade in.
      gsap.set(sceneRefs.current, { opacity: 0, y: 32 })
      gsap.set(sceneRefs.current[0], { opacity: 1, y: 0 })

      // Helper: snap a scene to its target visibility with a real-time tween.
      // The tweens are NOT scroll-driven, so they always finish — when the
      // user stops between two snap points there's exactly one scene visible.
      const showScene = (idx: number) => {
        sceneRefs.current.forEach((ref, i) => {
          if (!ref) return
          if (i === idx) {
            gsap.to(ref, {
              opacity: 1,
              y: 0,
              duration: 0.55,
              ease: 'power2.out',
              overwrite: 'auto',
            })
          } else {
            gsap.to(ref, {
              opacity: 0,
              y: i < idx ? -32 : 32,
              duration: 0.4,
              ease: 'power2.in',
              overwrite: 'auto',
            })
          }
        })
      }

      // ScrollTrigger drives the BACKGROUND (3D scene + progress bar)
      // continuously via scrub. Text scene visibility is handled separately
      // through discrete tweens triggered when the active index changes.
      ScrollTrigger.create({
        trigger: '.scroll-proxy__track',
        start: 'top top',
        end: 'bottom bottom',
        // scrollTo() already eases smoothly; only a tiny scrub for buttery
        // updates without piling extra lag on top.
        scrub: 0.2,
        onUpdate: (self) => {
          const p = self.progress
          // 1. Background — continuous, untouched by the discrete text logic
          sceneRef.current?.setProgress(p)
          if (progressBarRef.current) {
            progressBarRef.current.style.width = `${p * 100}%`
          }

          // 2. Text scenes — discrete: pick the nearest scene to the
          //    current progress and only swap when that index changes.
          const newIdx = Math.min(
            Math.max(Math.round(p * (TOTAL - 1)), 0),
            TOTAL - 1,
          )
          if (newIdx !== activeIdxRef.current) {
            activeIdxRef.current = newIdx
            showScene(newIdx)
            if (counterNumRef.current) {
              counterNumRef.current.textContent = String(newIdx + 1).padStart(2, '0')
            }
            if (sceneLabelRef.current) {
              sceneLabelRef.current.textContent = sceneLabelsRef.current[newIdx]
            }
          }
        },
      })
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
                <header className="s-services__head">
                  <span className="s-services__kicker">{t.services.sub}</span>
                  <h2 className="s-services__h">{t.services.h}</h2>
                </header>

                <ol className="s-services__list">
                  {t.services.cells.map((s) => (
                    <li className="s-services__row" key={s.n}>
                      <span className="s-services__num" aria-hidden>{s.n}</span>
                      <div className="s-services__body">
                        <span className="s-services__eye">{s.eyebrow}</span>
                        <h3 className="s-services__h3">{s.h}</h3>
                        <div className="s-services__tags">
                          {s.list.map((x, i) => (
                            <span key={x}>
                              {x}
                              {i < s.list.length - 1 && <i aria-hidden> · </i>}
                            </span>
                          ))}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
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
