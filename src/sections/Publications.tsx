import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FileText, Award, ArrowUpRight } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

gsap.registerPlugin(ScrollTrigger)

const content = {
  zh: {
    supertitle: 'PUBLICATIONS',
    title: '学术成果',
    subtitle: '发表高水平论文与授权发明专利，推动领域理论创新与技术进步',
    detailLabel: { paper: '论文', patent: '专利' },
    viewDetails: '查看详情',
  },
  en: {
    supertitle: 'PUBLICATIONS',
    title: 'Publications & Patents',
    subtitle: 'Publishing high-impact papers and granted patents to advance the field',
    detailLabel: { paper: 'Paper', patent: 'Patent' },
    viewDetails: 'View Details',
  },
}

const sharedPublications = [
  {
    id: 19,
    type: 'paper' as const,
    title: 'Mamba-SfP: Toward open-scene 3D shape from polarization via selective state space models',
    authors: 'Wang PY, Yu KM, He HY, Huang F, Wu XY, Chen YT',
    venue: 'Optics & Laser Technology',
    year: '2026',
    abstract: 'Mamba-SfP explores selective state space models for open-scene 3D shape reconstruction from polarization.',
    link: 'https://doi.org/10.1016/j.optlastec.2026.116380',
  },
  {
    id: 20,
    type: 'paper' as const,
    title: 'UD-SfPNet: An underwater descattering shape-from-polarization network for 3D normal reconstruction',
    authors: 'Wang PY, Yu KM, He HY, Huang F, Wu XY, Chen YT',
    venue: 'Pattern Recognition',
    year: '2026',
    abstract: 'UD-SfPNet jointly optimizes polarization-based underwater descattering and surface normal estimation, using color embedding and detail-enhanced convolutions to improve geometric consistency and preserve fine details.',
    link: 'https://doi.org/10.1016/j.patcog.2026.114827',
  },
  {
    id: 21,
    type: 'paper' as const,
    title: 'Physics-Guided Deep Learning for Multiview Infrared Polarization-Based Subsurface Material Classification',
    authors: 'Lin JW, Yu KM, Liu HH, Huang F, He HY, Wu XY',
    venue: 'IEEE Transactions on Instrumentation and Measurement',
    year: '2026',
    abstract: 'This work studies physics-guided deep learning for subsurface material classification using multiview infrared polarization imaging.',
    link: 'https://doi.org/10.1109/TIM.2026.3711303',
  },
  {
    id: 1,
    type: 'paper' as const,
    title: 'Structure-Aware Consistency Priors for Shape from Polarization in Complex Media',
    authors: 'Yu KM, Wang PY, He HY, Wu XY',
    venue: 'International Conference on Machine Learning (ICML 2026)',
    year: '2026',
    abstract: 'This paper addresses SfP in ice and other complex media by proposing a structure-aware polarization consistency prior and a dual-branch IceSfP network, enabling high-precision single-view surface normal estimation and constructing the first real-world ice SfP dataset.',
    link: 'https://arxiv.org/abs/2606.00509',
  },
  {
    id: 4,
    type: 'paper' as const,
    title: 'Spectral Clustering Super-Resolution Imaging Based on Multispectral Camera Array',
    authors: 'Huang F, Chen YT, Wang XS, Wang S, Wu XY',
    venue: 'IEEE Transactions on Image Processing',
    year: '2023',
    abstract: 'The paper proposes CAMSRIS, a camera-array multispectral imaging system that achieves high-speed, high-resolution imaging while preserving accurate spectral information.',
    link: 'https://ieeexplore.ieee.org/abstract/document/10041841',
  },
  {
    id: 7,
    type: 'paper' as const,
    title: 'GelFinger: A novel visual-tactile sensor with multi-angle tactile image stitching',
    authors: 'Lin ZL, Zhuang JQ, Li YF, Wu XY, Luo S, Gomes DF',
    venue: 'IEEE Robotics and Automation Letters',
    year: '2023',
    abstract: 'The paper proposes GelFinger, a motorized visual-tactile sensor that scans and stitches tactile images to detect defects on large curved surfaces.',
    link: 'https://ieeexplore.ieee.org/abstract/document/10209180',
  },
  {
    id: 9,
    type: 'paper' as const,
    title: 'Dual-polarization defogging method based on frequency division and blind separation of polarization information',
    authors: 'Huang F, Ke CZ, Wu XY, Liu Y',
    venue: 'Optics Express',
    year: '2024',
    abstract: 'The paper proposes a dual-polarization defogging method that separates airlight and target polarization to better restore high-DOP objects in foggy scenes.',
    link: 'https://doi.org/10.1364/OE.514627',
  },
  {
    id: 10,
    type: 'paper' as const,
    title: 'SwinIPISR: A Super-Resolution Method for Infrared Polarization Imaging Sensors via Swin Transformer',
    authors: 'Wu, XY, Zhou, B, Huang, F',
    venue: 'IEEE Sensors Journal',
    year: '2024',
    abstract: 'The performance of infrared polarization remote sensing systems is limited by sensor resolution.',
    link: 'https://doi.org/10.1109/JSEN.2023.3331578',
  },
  {
    id: 11,
    type: 'paper' as const,
    title: 'Polarization video frame interpolation for 3D human pose reconstruction with attention mechanism',
    authors: 'Zhang, X, Wang, XS, Wu, XY, Huang, F',
    venue: 'Optics and Lasers in Engineering',
    year: '2025',
    abstract: 'Video frame interpolation has been extensively explored and demonstrated, yet its application to polarization remains largely unexplored.',
    link: 'https://doi.org/10.1016/j.optlaseng.2025.109046',
  },
  {
    id: 12,
    type: 'paper' as const,
    title: 'Deep learning-based polarization 3D imaging method for underwater targets',
    authors: 'Wu, XY, Chen, JT, Huang, F',
    venue: 'Optics Express',
    year: '2025',
    abstract: 'The significant absorption and scattering of light during its propagation in water severely degrade the quality of underwater imaging.',
    link: 'https://doi.org/10.1364/OE.541298',
  },
  {
    id: 13,
    type: 'paper' as const,
    title: 'Enhancing three-source cross-modality image fusion with improved DenseNet for infrared polarization and visible light images',
    authors: 'Wang, XS, Zhou, B, Wu, XY, Huang, F',
    venue: 'Infrared Physics & Technology',
    year: '2024',
    abstract: 'The fusion of multi-modal images to create an image that preserves the unique features of each modality.',
    link: 'https://doi.org/10.1016/j.infrared.2024.105493',
  },
  {
    id: 14,
    type: 'paper' as const,
    title: 'LVTSR: learning visible image texture network for infrared polarization super-resolution imaging',
    authors: 'Wang, XS, Chen, YT, Wu, XY, Huang, F',
    venue: 'Optics Express',
    year: '2024',
    abstract: 'Infrared polarization division-of-focal-plane imaging technology has gained attention.',
    link: 'https://doi.org/10.1364/OE.529402',
  },
  {
    id: 15,
    type: 'paper' as const,
    title: 'Bio-inspired foveal super-resolution method for multi-focal-length images based on local gradient constraints',
    authors: 'Huang, F, Wang, XS, Wu, XY, Huang, F',
    venue: 'Optics Express',
    year: '2024',
    abstract: 'Most existing super-resolution imaging systems utilize image registration and reconstruction algorithms.',
    link: 'https://doi.org/10.1364/OE.524154',
  },
  {
    id: 16,
    type: 'paper' as const,
    title: 'Three Dimensional Shape Reconstruction via Polarization Imaging and Deep Learning',
    authors: 'Wu, XY, Li, PH, Huang, F',
    venue: 'Sensors',
    year: '2023',
    abstract: 'Deep-learning-based polarization 3D imaging techniques for estimating surface normal distribution.',
    link: 'https://doi.org/10.3390/s23104592',
  },
  {
    id: 17,
    type: 'paper' as const,
    title: 'High-Efficiency Multispectral-Polarization Imaging System Using Polarization Camera Array With Notch Filters',
    authors: 'Huang, F, Cao, RJ, Wu, XY',
    venue: 'IEEE Transactions on Instrumentation and Measurement',
    year: '2023',
    abstract: 'Incident light captured by optical imaging systems engenders multidimensional high-level optical information.',
    link: 'https://doi.org/10.1109/TIM.2023.3328697',
  },
  {
    id: 18,
    type: 'paper' as const,
    title: 'MuS-Polar3D: A Benchmark Dataset for Computational Polarimetric 3D Imaging under Multi-Scattering Conditions',
    authors: 'Wang PY, Yu KM, He HY, Wu XY',
    venue: 'arXiv preprint arXiv:2512.21513',
    year: '2025',
    abstract: 'Polarization-based underwater 3D imaging exploits polarization cues to suppress background scattering, exhibiting distinct advantages in turbid water.',
    link: 'https://arxiv.org/abs/2512.21513',
  },
]

const sortedPublications = [...sharedPublications].sort(
  (a, b) => Number(b.year) - Number(a.year)
)

const publications = {
  zh: sortedPublications,
  en: sortedPublications,
}
export default function Publications() {
  const { lang } = useLanguage()
  const t = content[lang]
  const pubs = publications[lang]

  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [selected, setSelected] = useState(0)

  useEffect(() => { setSelected(0) }, [lang])

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (titleRef.current) {
        gsap.fromTo(titleRef.current.querySelectorAll('.animate-in'),
          { opacity: 0, y: 30 },
          {
            opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.1,
            scrollTrigger: { trigger: titleRef.current, start: 'top 85%', once: true },
          }
        )
      }
      if (contentRef.current) {
        gsap.fromTo(contentRef.current,
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.2,
            scrollTrigger: { trigger: contentRef.current, start: 'top 80%', once: true },
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const selectedPub = pubs[selected]

  return (
    <section
      id="publications"
      ref={sectionRef}
      style={{ backgroundColor: '#f5f7fa', paddingTop: '160px', paddingBottom: '160px' }}
    >
      <div className="mx-auto" style={{ maxWidth: '1200px', padding: '0 24px' }}>
        {/* Title Area */}
        <div ref={titleRef} className="text-center mb-16">
          <p className="animate-in text-sm font-medium mb-3" style={{ color: '#86868b', letterSpacing: '0.05em' }}>
            {t.supertitle}
          </p>
          <h2
            className="animate-in font-semibold"
            style={{ fontSize: 'clamp(36px, 5vw, 56px)', color: '#1d1d1f', letterSpacing: '-0.025em', lineHeight: 1.1 }}
          >
            {t.title}
          </h2>
          <p className="animate-in mt-4 text-lg" style={{ color: '#86868b', maxWidth: '620px', margin: '16px auto 0' }}>
            {t.subtitle}
          </p>
        </div>

        {/* Content */}
        <div ref={contentRef} className="flex flex-col lg:flex-row gap-6">
          {/* Left: Detail Panel */}
          <div className="lg:w-[42%]">
            <div className="rounded-[24px] p-8 sticky top-24" style={{ backgroundColor: '#1d1d1f', color: '#f5f5f7' }}>
              <div className="flex items-center gap-2 mb-5">
                {selectedPub.type === 'paper' ? <FileText size={15} /> : <Award size={15} />}
                <span className="text-xs font-medium uppercase tracking-wide" style={{ color: '#86868b' }}>
                  {t.detailLabel[selectedPub.type]}
                </span>
              </div>

              <h3 className="text-lg font-semibold mb-3 leading-snug" style={{ letterSpacing: '-0.01em' }}>
                {selectedPub.title}
              </h3>

              <p className="text-xs mb-3" style={{ color: '#86868b' }}>
                {selectedPub.authors}
              </p>

              <div className="flex items-center gap-3 mb-5">
                <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  {selectedPub.venue}
                </span>
                <span className="text-xs" style={{ color: '#86868b' }}>
                  {selectedPub.year}
                </span>
              </div>

              <p className="text-sm leading-relaxed mb-6" style={{ color: '#a1a1a6', lineHeight: 1.7 }}>
                {selectedPub.abstract}
              </p>

              <a
                href={selectedPub.link}
                className="inline-flex items-center gap-1.5 text-sm font-medium transition-opacity duration-200 hover:opacity-80"
                style={{ color: '#2997ff' }}
              >
                {t.viewDetails}
                <ArrowUpRight size={14} />
              </a>
            </div>
          </div>

          {/* Right: List */}
          <div className="lg:w-[58%]">
            <div className="flex flex-col gap-3">
              {pubs.map((pub, index) => (
                <div
                  key={pub.id}
                  className="flex items-start gap-4 rounded-[16px] p-5 cursor-pointer transition-all duration-300"
                  style={{
                    backgroundColor: selected === index ? '#ffffff' : 'transparent',
                    borderLeft: selected === index ? '3px solid #1d1d1f' : '3px solid transparent',
                    boxShadow: selected === index ? '0 2px 12px rgba(0,0,0,0.04)' : 'none',
                  }}
                  onClick={() => setSelected(index)}
                  onMouseEnter={(e) => {
                    if (selected !== index) e.currentTarget.style.backgroundColor = '#ffffff'
                  }}
                  onMouseLeave={(e) => {
                    if (selected !== index) e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#1d1d1f' }}>
                    {pub.type === 'paper' ? <FileText size={16} color="#ffffff" /> : <Award size={16} color="#ffffff" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold mb-1 leading-snug" style={{ color: '#1d1d1f' }}>
                      {pub.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs" style={{ color: '#86868b' }}>
                      <span>{pub.venue}</span>
                      <span>·</span>
                      <span>{pub.year}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

