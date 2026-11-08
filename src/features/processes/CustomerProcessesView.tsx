import { useEffect, useState } from 'react'
import { fetchCustomerProcesses } from '@services/api/portal'
import type { CustomerProcess } from '@/types/customer'

export function CustomerProcessesView({ onExploreProjects }: { onExploreProjects: () => void }) {
  const [records, setRecords] = useState<CustomerProcess[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)

  useEffect(() => {
    let active = true
    void fetchCustomerProcesses().then((rows) => {
      if (active) { setRecords(rows); setError('') }
    }).catch((cause: unknown) => {
      if (active) setError(cause instanceof Error ? cause.message : 'No se pudieron cargar tus procesos.')
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [reload])

  return <section className="section-panel" aria-label="Mis procesos">
    <header className="section-header"><div><h2>Mis procesos</h2><p>Consulta el estado de las propiedades por las que has mostrado interés.</p></div><button className="btn-outline" type="button" disabled={loading} onClick={() => { setLoading(true); setReload(value => value + 1) }}>Actualizar</button></header>
    {loading ? <p role="status">Cargando tus procesos…</p> : error ? <p className="feedback-error" role="alert">{error}</p> : records.length === 0 ? <div className="customer-empty"><h3>Aquí comienza tu próximo hogar</h3><p>Aún no tienes procesos asociados a tu cuenta. Envía una consulta desde una propiedad para darle seguimiento aquí.</p><button type="button" className="btn-primary" onClick={onExploreProjects}>Explorar propiedades</button></div> : <div className="projects-grid">{records.map(record => <article className="project-card customer-process-card" key={record.id_lead}>
      {record.house_photo_1 ? <img className="customer-process-image" src={record.house_photo_1} alt={record.house_name ?? 'Propiedad consultada'} loading="lazy" /> : null}
      <div className="project-card-body"><span className="customer-process-phase">{record.phase_name || 'En seguimiento'}</span><h3>{record.house_name || 'Consulta de proyecto'}</h3><p>{record.project_name || 'Proyecto inmobiliario'}</p><dl className="customer-process-details"><div><dt>Referencia</dt><dd>#{record.id_lead}</dd></div><div><dt>Solicitud enviada</dt><dd>{new Date(record.created_at).toLocaleDateString('es-GT')}</dd></div><div><dt>Contacto</dt><dd>{record.lead_client_phone}</dd></div></dl></div>
    </article>)}</div>}
  </section>
}
