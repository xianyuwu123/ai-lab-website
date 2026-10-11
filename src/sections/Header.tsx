import { useEffect, useRef, useState } from 'react'
import { Menu, X, Globe } from 'lucide-react'
import gsap from 'gsap'
import { useLanguage } from '../context/LanguageContext'

const getNavItems = (lang: 'zh' | 'en') => [
  { label: lang === 'zh' ? '团队介绍' : 'Team', href: '#team' },
  { label: lang === 'zh' ? '研究方向' : 'Research', href: '#research' },
  { label: lang === 'zh' ? '学术成果' : 'Publications', href: '#publications' },
  { label: lang === 'zh' ? '开源项目' : 'Open Source', href: '#opensource' },
  { label: lang === 'zh' ? '教学资源' : 'Teaching', href: `${import.meta.env.BASE_URL}courses/index.html` },
  { label: lang === 'zh' ? '联系我们' : 'Contact', href: '#contact' },
]

export default function Header() {
  const headerRef = useRef<HTMLElement>(null)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { lang, setLang } = useLanguage()

  const navItems = getNavItems(lang)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.1 }
      )
    }
  }, [])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setMobileOpen(false)
    if (href.startsWith('#')) {
      e.preventDefault()
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const toggleLang = () => setLang(lang === 'zh' ? 'en' : 'zh')

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        height: '52px',
        backgroundColor: scrolled ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0)',
        backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(0,0,0,0.06)' : '1px solid transparent',
      }}
    >
      <div
        className="mx-auto flex items-center justify-between h-full"
        style={{ maxWidth: '1200px', padding: '0 24px' }}
      >
        {/* Logo */}
        <a
          href="#"
          className="flex items-center gap-2"
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
        >
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{
              backgroundColor: '#FFDF19',
            }}
          />
          <span
            className="text-sm font-semibold tracking-tight"
            style={{ color: '#1d1d1f', letterSpacing: '-0.01em' }}
          >
            {lang === 'zh' ? '先进光学成像与计算感知实验室' : 'AOCI Lab'}
          </span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => handleClick(e, item.href)}
              className="relative text-xs font-normal transition-colors duration-200"
              style={{ color: '#1d1d1f', letterSpacing: '-0.01em' }}
            >
              {item.label}
            </a>
          ))}
          <button
            onClick={toggleLang}
            className="text-xs font-medium px-2.5 py-1 rounded-full transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: lang === 'zh' ? 'rgba(0,0,0,0.06)' : '#FFDF19',
              color: '#1d1d1f',
            }}
          >
            {lang === 'zh' ? 'EN' : '中'}
          </button>
        </nav>

        {/* Mobile Hamburger */}
        <button aria-label={mobileOpen ? '关闭导航' : '打开导航'} aria-expanded={mobileOpen} className="lg:hidden p-2 -mr-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={20} color="#1d1d1f" /> : <Menu size={20} color="#1d1d1f" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          className="lg:hidden absolute top-[52px] left-0 right-0"
          style={{
            backgroundColor: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(20px) saturate(180%)',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <nav className="flex flex-col py-4" style={{ padding: '0 24px' }}>
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleClick(e, item.href)}
                className="py-3 text-sm"
                style={{ color: '#1d1d1f', borderBottom: '1px solid rgba(0,0,0,0.06)' }}
              >
                {item.label}
              </a>
            ))}
            <button
              onClick={toggleLang}
              className="flex items-center gap-2 py-3 text-sm font-medium"
              style={{ color: '#1d1d1f' }}
            >
              <Globe size={14} />
              {lang === 'zh' ? 'Switch to English' : '切换到中文'}
            </button>
          </nav>
        </div>
      )}
    </header>
  )
}
