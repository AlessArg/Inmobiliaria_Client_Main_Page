import { useEffect, useState } from 'react'
import { buildApiUrl } from '@services/http/client'
import { ApplicationForm } from './ApplicationForm'

type Vacancy = { id_vacancy: number; title: string; description: string; responsibilities: string; photo_url: string; requirements: string[] }

export function EmployeesView() {
  const [vacancies, setVacancies] = useState<Vacancy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<Vacancy | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    void fetch(buildApiUrl('careers/vacancies/open'), { signal: controller.signal })
      .then(async response => { if (!response.ok) throw new Error('No se pudieron cargar las plazas vacantes.'); return response.json() as Promise<Vacancy[]> })
      .then(payload => setVacancies(payload))
      .catch(cause => { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'No se pudieron cargar las plazas vacantes.') })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [])

  return <div className="employees-view">
    <section className="employees-intro"><div className="employees-hero-copy"><p className="eyebrow">TALENTO · PERSONAS · PROPÓSITO</p><h1>Tu próximo capítulo comienza aquí<span>.</span></h1><p>En PHIEN construimos más que hogares. Sumamos personas que quieren crecer, conectar y transformar la experiencia de quienes confían en nosotros.</p><a className="employees-hero-link" href="#oportunidades" onClick={event => { event.preventDefault(); document.getElementById('oportunidades')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }) }}>Explorar oportunidades <span aria-hidden="true">↗</span></a></div><div className="employees-hero-art" aria-hidden="true"><span className="employees-art-label">CRECE CON PHIEN</span><div className="employees-art-house"><span>PHIEN</span></div><div className="employees-art-note"><strong>Juntos llegamos más lejos.</strong><span>Personas creando posibilidades.</span></div></div></section>
    <div className="employees-manifesto"><span>01 / NUESTRA ESENCIA</span><p>Las grandes historias se construyen <em>entre personas.</em></p></div>
    <section className="employees-values" aria-label="Nuestra misión, visión y objetivos">
      <article><span>MISIÓN</span><h2>Nuestra misión</h2><p>Acompañar a cada persona en la búsqueda de su hogar con atención cercana, información clara y proyectos pensados para su bienestar.</p></article>
      <article><span>VISIÓN</span><h2>Nuestra visión</h2><p>Ser una inmobiliaria de referencia por la confianza que construimos con clientes, colaboradores y comunidades.</p></article>
      <article><span>OBJETIVOS</span><h2>Nuestros objetivos</h2><p>Crear experiencias inmobiliarias sencillas, impulsar el desarrollo profesional del equipo y contribuir a comunidades donde todos puedan prosperar.</p></article>
    </section>
    <section id="oportunidades" className="employees-openings" aria-labelledby="employees-openings-title"><div className="employees-section-heading"><div><p className="eyebrow">02 / TU PRÓXIMO PASO</p><h2 id="employees-openings-title">Encuentra tu lugar.</h2><p>Conoce las oportunidades disponibles y comparte tu talento con nosotros.</p></div><span>{vacancies.length} {vacancies.length === 1 ? 'plaza abierta' : 'plazas abiertas'}</span></div>
      {loading ? <p className="employees-feedback">Cargando oportunidades…</p> : error ? <p className="employees-feedback" role="alert">{error}</p> : vacancies.length ? <div className="employees-vacancy-grid">{vacancies.map(vacancy => <button className="employees-vacancy-card" type="button" key={vacancy.id_vacancy} onClick={() => setSelected(vacancy)}><img src={vacancy.photo_url} alt="" /><span>PLAZA ABIERTA</span><strong>{vacancy.title}</strong><small>Ver detalles <span aria-hidden="true">↗</span></small></button>)}</div> : <p className="employees-feedback">Por ahora no hay plazas abiertas. Vuelve pronto para conocer nuevas oportunidades.</p>}
    </section>
    {selected && <div className="employees-modal-backdrop" role="presentation" onClick={() => setSelected(null)}><article className="employees-modal" role="dialog" aria-modal="true" aria-labelledby="employees-modal-title" onClick={event => event.stopPropagation()}><button className="employees-modal-close" type="button" aria-label="Cerrar detalle de plaza" onClick={() => setSelected(null)}>×</button><img className="employees-modal-photo" src={selected.photo_url} alt="" /><div className="employees-modal-body"><p className="eyebrow">PLAZA ABIERTA</p><h2 id="employees-modal-title">{selected.title}</h2><section><h3>Descripción</h3><p>{selected.description}</p></section><section><h3>Responsabilidades</h3><p>{selected.responsibilities}</p></section><section><h3>Requisitos</h3><ul>{selected.requirements.map((requirement, index) => <li key={`${index}-${requirement}`}>{requirement}</li>)}</ul></section><ApplicationForm key={selected.id_vacancy} vacancyId={selected.id_vacancy} /></div></article></div>}
  </div>
}
