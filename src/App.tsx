import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import Scene3D, { type Scene3DHandle } from './Scene3D'
import { COPY, type Lang } from './copy'

gsap.registerPlugin(ScrollTrigger)

type Theme = 'night' | 'day'

function PalSecLogo({ height = 18 }: { height?: number }) {
  // viewBox 413.2 × 169.1 — red = brand colour, dark uses currentColor (theme-adaptive)
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 413.2 169.1"
      height={height}
      width={(413.2 / 169.1) * height}
      aria-label="PalSec Agency"
      style={{ display: 'block' }}
    >
      {/* PalSec wordmark — red */}
      <g fill="#ea0029">
        <path d="M203.6,95l8.3-16.3c6.6,3.6,16,5.6,23.8,5.6s6.2-1.1,6.2-3.2-2-3.3-8.2-3.6c-16.1-.7-27.4-8.9-27.4-21.3s11.4-21.9,30.1-21.9,20.7,3,26.8,6.7l-8.9,15.7c-4.4-2.2-10.2-3.6-17-3.6s-7.5.9-7.5,3.3,1.7,2.8,6.5,3c18,1.1,29.2,8.3,29.2,21.5s-11.4,22.2-31.7,22.2-23-3.4-30.3-8.3Z"/>
        <path d="M333.3,75.4h-45.9c1.3,5,6.6,8.9,14.9,8.9s11.9-1.6,16.9-5l11.8,13.2c-8.1,6.9-18.4,10.4-30,10.4-23.5,0-37.9-12.8-37.9-33.8s14.5-34.4,35.9-34.4,39,16.9,34.2,40.7ZM287.6,63.4h23.8c-.1-6.5-4.4-10.4-11.5-10.4s-12,4-12.3,10.4Z"/>
        <path d="M330.7,68.9c0-20.6,14.5-34.2,36.3-34.2s19.2,3.7,25.9,10.3l-12.8,14.1c-3.3-3-7.3-4.6-11.6-4.6-8.3,0-14,5.7-14,14.3s5.7,14.3,14,14.3,8.9-1.7,12.4-5.2l13.2,13.9c-7.5,7.3-16.6,11.1-26.7,11.1-22.6,0-36.7-13-36.7-34Z"/>
        <path d="M85.6,68.8c0,20-12.7,34-30.7,34s-13.7-2.4-19-7.1v33H11.9V36.2h20.9l1.3,7.5c5.6-5.9,12.4-8.9,20.9-8.9,18,0,30.7,14,30.7,34ZM61.8,68.8c0-8.5-5.3-14.1-13.1-14.1s-13.1,5.7-13.1,14.1,5.3,14.1,13.1,14.1,13.1-5.7,13.1-14.1Z"/>
        <path d="M156.2,36.2v65.3h-20.9l-1.3-7.7c-5.6,5.9-12.6,9-20.9,9-18,0-30.7-14-30.7-34s12.7-34,30.7-34,15.3,2.9,20.9,8.9l1.3-7.5h20.9ZM132.4,68.8c0-8.5-5.3-14.1-13.1-14.1s-13.1,5.7-13.1,14.1,5.3,14.1,13.1,14.1,13.1-5.7,13.1-14.1Z"/>
        <path d="M165.2,7.4h24v94h-24V7.4Z"/>
      </g>
      {/* agency — currentColor (adapts to theme) */}
      <g fill="currentColor" opacity="0.7">
        <path d="M297.1,119.7v28.8h-7.9l-.6-3.4c-2.4,2.6-5.7,4-9.6,4-8.1,0-13.8-6.1-13.8-15s5.7-15,13.8-15,7.2,1.4,9.6,4l.6-3.4h7.9ZM288.1,134.1c0-4.3-2.8-7.3-6.9-7.3s-6.8,3-6.8,7.3,2.8,7.3,6.8,7.3,6.9-3,6.9-7.3Z"/>
        <path d="M331.8,152.9c0,7.3-6.3,12.1-16,12.1s-16.2-5.5-15.4-13.7h8.8c-.2,3.8,2.3,6,6.6,6s6.5-1.9,6.5-4.8-2.3-4.6-6.4-4.6c-9.6,0-15.9-5.7-15.9-14.6s6.5-14.5,15.8-14.5,4.5.5,6.5,1.4l3.4-4.2,6.7,4.8-3.8,4.5c2,2.3,2.9,4.8,2.9,7.9s-2.2,8-5.9,10.4c3.9,1.7,6.1,5,6.1,9.2ZM322.6,133.4c0-4.1-2.7-6.8-6.8-6.8s-6.8,2.7-6.8,6.8,2.7,6.8,6.8,6.8,6.8-2.7,6.8-6.8Z"/>
        <path d="M333.5,134.1c0-9,6.4-15.1,15.7-15.1s8.3,1.6,11.3,4.5l-5.1,5.5c-1.6-1.5-3.6-2.3-5.8-2.3-4.2,0-7.1,2.9-7.1,7.3s2.9,7.3,7.1,7.3,4.4-.9,6.1-2.5l5.2,5.5c-3.3,3.2-7.1,4.8-11.5,4.8-9.7,0-15.9-5.8-15.9-15Z"/>
        <path d="M394,119.7l-18,41.3h-9.7l5.6-12.9-11.2-28.4h9.9l3.3,9.1,3.1,9.4,3.4-9.4,3.7-9.1h9.9Z"/>
        <path d="M396.4,144.1c0-2.9,2.2-5,5.3-5s5.2,2,5.2,5-2.2,5-5.2,5-5.3-2.1-5.3-5Z"/>
      </g>
    </svg>
  )
}

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
    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.2,
    })
    lenis.on('scroll', ScrollTrigger.update)
    const tickerCb = (time: number) => { lenis.raf(time * 1000) }
    gsap.ticker.add(tickerCb)
    gsap.ticker.lagSmoothing(0)
    return () => { gsap.ticker.remove(tickerCb); lenis.destroy() }
  }, [booting])

  useEffect(() => {
    if (booting) return
    const ctx = gsap.context(() => {
      gsap.set(sceneRefs.current, { opacity: 0, y: 24 })
      gsap.set(sceneRefs.current[0], { opacity: 1, y: 0 })
      sceneRefs.current[0]?.classList.add('is-active')

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.scroll-proxy__track',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5,
          onUpdate: (self) => {
            const p = self.progress
            sceneRef.current?.setProgress(p)
            if (progressBarRef.current) {
              progressBarRef.current.style.width = `${p * 100}%`
            }
            const idx = Math.min(Math.floor(p * TOTAL), TOTAL - 1)
            sceneRefs.current.forEach((ref, i) => {
              ref?.classList.toggle('is-active', i === idx)
            })
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
        <div className={`topbar__mark ${!booting ? 'is-visible' : ''}`}>
          {'Vueik'.split('').map((l, i) => (
            <span key={i} className="topbar__mark-letter" style={{ '--i': i } as React.CSSProperties}>{l}</span>
          ))}
          <span className="topbar__mark-dot">.</span>
        </div>

        <a
          className="topbar__tag"
          href="https://www.palsec.agency"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="PalSec Agency"
          style={{ pointerEvents: 'auto' }}
        >
          <span className="topbar__tag-label">{t.topbarTagline}</span>
          <PalSecLogo height={16} />
        </a>

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
