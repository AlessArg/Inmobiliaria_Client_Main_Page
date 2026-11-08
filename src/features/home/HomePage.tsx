import { useEffect, useState } from 'react'
import { fetchProjects } from '@services/api/realEstate'
import type { ProjectRecord } from '@/types/domain'

type HomePageProps = { onExploreProjects: () => void }

export function HomePage({ onExploreProjects }: HomePageProps) {
  const [projects, setProjects] = useState<ProjectRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    void fetchProjects().then(setProjects).catch(() => setProjects([])).finally(() => setLoading(false))
  }, [])

  const visible = Array.from({ length: Math.min(3, projects.length) }, (_, index) => projects[(offset + index) % projects.length])
  const move = (direction: -1 | 1) => {
    if (projects.length) setOffset(current => (current + direction + projects.length) % projects.length)
  }

  return <div className="client-home">
    <section className="client-hero">
      <div className="client-hero-copy"><p className="eyebrow">PHIEN · BIENES RAÍCES</p><h1>Espacios para vivir la vida que imaginas.</h1><p>Conectamos familias con proyectos que combinan ubicación, diseño y una inversión que crece contigo.</p><div className="hero-actions"><button type="button" className="client-primary" onClick={onExploreProjects}>Explorar proyectos</button><span>Asesoría cercana desde la primera visita</span></div></div>
      <div className="client-hero-art" aria-hidden="true"><div className="hero-orb hero-orb-one" /><div className="hero-orb hero-orb-two" /><div className="hero-home-shape"><i /><i /><i /></div></div>
    </section>
    <section className="company-strip" aria-label="Nuestro compromiso"><article><strong>Proyectos con propósito</strong><span>Diseñados para tu día a día</span></article><article><strong>Acompañamiento experto</strong><span>Te guiamos en cada decisión</span></article><article><strong>Compra con confianza</strong><span>Información clara y atención humana</span></article></section>
    <section className="showcase-section" aria-labelledby="projects-title"><header className="section-heading"><div><p className="eyebrow">ENCUENTRA TU PRÓXIMO HOGAR</p><h2 id="projects-title">Proyectos destacados</h2></div><button className="text-action" type="button" onClick={onExploreProjects}>Ver todos <span>→</span></button></header>
      {loading ? <p className="showcase-feedback">Cargando proyectos destacados…</p> : visible.length ? <div className="project-carousel"><button type="button" className="carousel-control" aria-label="Proyecto anterior" onClick={() => move(-1)}>←</button><div className="carousel-track">{visible.map(project => <article className="showcase-card" key={project.id_project} onClick={onExploreProjects}><div className="showcase-image">{project.project_logo ? <img src={project.project_logo} alt={`Proyecto ${project.name}`} /> : <strong>{project.name.slice(0, 2).toUpperCase()}</strong>}<span>{project.city}</span></div><div className="showcase-body"><p>{project.construction_style}</p><h3>{project.name}</h3><small>{project.municipality}</small><button type="button" onClick={onExploreProjects}>Conocer proyecto <span>↗</span></button></div></article>)}</div><button type="button" className="carousel-control" aria-label="Proyecto siguiente" onClick={() => move(1)}>→</button></div> : <p className="showcase-feedback">Próximamente tendremos nuevos proyectos para ti.</p>}
    </section>
  </div>
}
