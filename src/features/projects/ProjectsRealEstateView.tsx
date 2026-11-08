import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  createLeadContactCenter,
  fetchHousesByProject,
  fetchProjects,
} from '@services/api/realEstate'
import type { HouseRecord, LeadContactPayload, ProjectRecord } from '@/types/domain'
import type { CustomerProfile } from '@/types/customer'
import { createCustomerLead } from '@services/api/portal'
import { leadFormForCustomer } from './leadForm'

type LeadFormState = {
  lead_client_name: string
  lead_client_phone: string
  lead_client_email: string
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
    maximumFractionDigits: 2,
  }).format(price)
}

export function ProjectsRealEstateView({ customer, onViewProcesses }: {
  customer: CustomerProfile | null
  onViewProcesses: () => void
}) {
  const [projects, setProjects] = useState<ProjectRecord[]>([])
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [projectsError, setProjectsError] = useState('')

  const [selectedProject, setSelectedProject] = useState<ProjectRecord | null>(null)

  const [houses, setHouses] = useState<HouseRecord[]>([])
  const [housesLoading, setHousesLoading] = useState(false)
  const [housesError, setHousesError] = useState('')

  const [selectedHouse, setSelectedHouse] = useState<HouseRecord | null>(null)
  const [leadForm, setLeadForm] = useState<LeadFormState>(() => leadFormForCustomer(customer))
  const [leadLoading, setLeadLoading] = useState(false)
  const [leadError, setLeadError] = useState('')
  const [leadSuccess, setLeadSuccess] = useState('')

  useEffect(() => {
    const loadProjects = async () => {
      setProjectsLoading(true)
      setProjectsError('')

      try {
        const records = await fetchProjects()
        setProjects(records)
      } catch (error) {
        setProjectsError(error instanceof Error ? error.message : 'No se pudieron cargar los proyectos.')
      } finally {
        setProjectsLoading(false)
      }
    }

    void loadProjects()
  }, [])

  const openProject = async (project: ProjectRecord) => {
    setSelectedProject(project)
    setHouses([])
    setHousesLoading(true)
    setHousesError('')

    try {
      const records = await fetchHousesByProject(project.id_project)
      setHouses(records)
    } catch (error) {
      setHousesError(error instanceof Error ? error.message : 'No se pudieron cargar las casas del proyecto.')
    } finally {
      setHousesLoading(false)
    }
  }

  const openLeadModal = (house: HouseRecord) => {
    setSelectedHouse(house)
    setLeadForm(leadFormForCustomer(customer))
    setLeadError('')
    setLeadSuccess('')
  }

  const closeLeadModal = () => {
    if (leadLoading) return
    setSelectedHouse(null)
    setLeadError('')
    setLeadSuccess('')
  }

  const handleLeadSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedProject || !selectedHouse) return

    if (!leadForm.lead_client_name.trim()) {
      setLeadError('El nombre del cliente es obligatorio.')
      return
    }

    if (!leadForm.lead_client_phone.trim()) {
      setLeadError('El telefono del cliente es obligatorio.')
      return
    }

    if (!leadForm.lead_client_email.trim()) {
      setLeadError('El email del cliente es obligatorio.')
      return
    }

    const payload: LeadContactPayload = {
      lead_client_name: leadForm.lead_client_name.trim(),
      lead_client_phone: leadForm.lead_client_phone.trim(),
      lead_client_email: leadForm.lead_client_email.trim(),
      id_project: selectedProject.id_project,
      id_house: selectedHouse.id_house,
    }

    setLeadLoading(true)
    setLeadError('')

    try {
      if (customer) await createCustomerLead(payload)
      else await createLeadContactCenter(payload)
      setLeadSuccess(customer ? 'Consulta enviada. Ya puedes seguirla en Mis procesos.' : 'Formulario enviado. Te contactaremos pronto.')
    } catch (error) {
      setLeadError(error instanceof Error ? error.message : 'No se pudo enviar el formulario.')
    } finally {
      setLeadLoading(false)
    }
  }

  const projectCountMessage = useMemo(() => {
    if (projectsLoading) return 'Cargando proyectos...'
    if (projects.length === 1) return '1 proyecto disponible'
    return `${projects.length} proyectos disponibles`
  }, [projects, projectsLoading])

  if (!selectedProject) {
    return (
      <section className="section-panel">
        <header className="section-header">
          <div>
            <h2>Proyectos Inmobiliarios</h2>
            <p>{projectCountMessage}</p>
          </div>
        </header>

        {projectsError ? <p className="feedback-error">{projectsError}</p> : null}

        {projectsLoading ? (
          <p className="users-loading">Cargando proyectos...</p>
        ) : projects.length === 0 ? (
          <p className="users-loading">No hay proyectos disponibles.</p>
        ) : (
          <div className="projects-grid">
            {projects.map((project, index) => {
              const preview = project.description.length > 160
                ? `${project.description.slice(0, 160)}...`
                : project.description
              const statusClass = project.status.toLowerCase() === 'activo' ? 'status-active' : 'status-inactive'

              return (
                <article
                  key={`${project.id_project}-${project.name}`}
                  className="project-card animate-fade-in"
                  style={{ animationDelay: `${index * 0.04}s` }}
                  onClick={() => {
                    void openProject(project)
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      void openProject(project)
                    }
                  }}
                >
                  <header className="project-media" style={{ backgroundColor: '#6f4a2f' }}>
                    {project.project_logo ? (
                      <img
                        className="project-media-image"
                        src={project.project_logo}
                        alt={`Proyecto ${project.name}`}
                        loading="lazy"
                      />
                    ) : (
                      <div className="project-media-fallback" aria-hidden="true">
                        <span>{project.name.slice(0, 2).toUpperCase()}</span>
                      </div>
                    )}

                    <div className="project-media-overlay" />

                    <div className="project-media-top">
                      <span className="project-department-chip">{project.city}</span>
                      <span className={`project-status-chip ${statusClass}`}>{project.status}</span>
                    </div>
                  </header>

                  <div className="project-card-body">
                    <div className="project-title-wrap">
                      <h3>{project.name}</h3>
                      <p>{preview}</p>
                    </div>

                    <div className="project-location-row">
                      <span>{project.city}</span>
                      <span>•</span>
                      <span>{project.municipality}</span>
                      <span>•</span>
                      <span>{project.construction_style}</span>
                    </div>

                    <div className="project-stats-row">
                      <span className="project-stat"><strong>Parques</strong>{project.parks}</span>
                      <span className="project-stat"><strong>Piscinas</strong>{project.pools}</span>
                      <span className="project-stat"><strong>Recreativos</strong>{project.recreational_centers}</span>
                      <span className="project-stat"><strong>Salones</strong>{project.multi_use_scenarios}</span>
                      <span className="project-stat"><strong>Discotecas</strong>{project.discos}</span>
                      <span className="project-stat"><strong>Night clubs</strong>{project.night_clubs}</span>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    )
  }

  return (
    <section className="section-panel">
      <header className="section-header">
        <div>
          <h2>{selectedProject.name}</h2>
          <p>Casas disponibles en este proyecto.</p>
        </div>

        <button
          type="button"
          className="project-back-btn"
          onClick={() => {
            setSelectedProject(null)
            setHouses([])
            setHousesError('')
          }}
        >
          ← Volver a proyectos
        </button>
      </header>

      {housesError ? <p className="feedback-error">{housesError}</p> : null}

      {housesLoading ? (
        <p className="users-loading">Cargando casas...</p>
      ) : houses.length === 0 ? (
        <p className="users-loading">No hay casas disponibles para este proyecto.</p>
      ) : (
        <div className="projects-grid">
          {houses.map((house, index) => {
            const cardImage = house.house_photo_1 ?? house.house_photo_2 ?? house.house_photo_3

            return (
              <article
                key={`${house.id_house}-${house.house_name}`}
                className="project-card animate-fade-in"
                style={{ animationDelay: `${index * 0.03}s` }}
                onClick={() => openLeadModal(house)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    openLeadModal(house)
                  }
                }}
              >
                <header className="project-media" style={{ backgroundColor: '#7a5330' }}>
                  {cardImage ? (
                    <img
                      className="project-media-image"
                      src={cardImage}
                      alt={`Casa ${house.house_name}`}
                      loading="lazy"
                    />
                  ) : (
                    <div className="project-media-fallback" aria-hidden="true">
                      <span>{house.house_name.slice(0, 2).toUpperCase()}</span>
                    </div>
                  )}

                  <div className="project-media-overlay" />

                  <div className="project-media-top">
                    <span className={`project-status-chip ${house.house_status ? 'status-active' : 'status-inactive'}`}>
                      {house.house_status ? 'Disponible' : 'No disponible'}
                    </span>
                    <span className="project-status-chip house-size-chip">{house.house_size || 'N/D'}</span>
                  </div>
                </header>

                <div className="project-card-body">
                  <div className="project-title-wrap">
                    <div className="house-title-row">
                      <h3>{house.house_name}</h3>
                      <span className="house-card-price">{formatPrice(house.house_price)}</span>
                    </div>
                    <span className="project-department-chip house-project-chip">{selectedProject.name}</span>
                  </div>

                  <p className="projects-card-description">{house.house_description || 'Sin descripcion disponible.'}</p>

                  <div className="project-stats-row inventory-stats-row">
                    <span className="project-stat"><strong>Pisos</strong>{house.house_floors}</span>
                    <span className="project-stat"><strong>Cuartos</strong>{house.house_total_rooms}</span>
                    <span className="project-stat"><strong>Habitaciones</strong>{house.house_bedrooms}</span>
                    <span className="project-stat"><strong>Banos</strong>{house.house_bathrooms}</span>
                    <span className="project-stat"><strong>Garages</strong>{house.house_garage}</span>
                    <span className="project-stat"><strong>Amueblada</strong>{house.house_furnished ? 'Si' : 'No'}</span>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {selectedHouse ? (
        <div className="modal-backdrop" role="presentation" onClick={closeLeadModal}>
          <article
            className="modal-box lead-modal"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="modal-header">
              <div>
                <small className="modal-caption">{customer ? 'Completamos tus datos de contacto con tu perfil. Revisa la información antes de enviarla.' : 'Llena el formulario y nos pondremos en contacto contigo.'}</small>
                <h3>{selectedHouse.house_name}</h3>
              </div>
              <button type="button" className="modal-close" aria-label="Cerrar consulta" disabled={leadLoading} onClick={closeLeadModal}>×</button>
            </header>

            <form className="modal-form" onSubmit={handleLeadSubmit}>
              <div className="modal-fields">
                <label>
                  Nombre completo
                  <input
                    className="modal-input"
                    value={leadForm.lead_client_name}
                    disabled={leadLoading || Boolean(leadSuccess)}
                    maxLength={150}
                    autoComplete="name"
                    onChange={(event) => setLeadForm((prev) => ({ ...prev, lead_client_name: event.target.value }))}
                    required
                  />
                </label>

                <label>
                  Telefono
                  <input
                    className="modal-input"
                    value={leadForm.lead_client_phone}
                    type="tel"
                    disabled={leadLoading || Boolean(leadSuccess)}
                    autoComplete="tel"
                    maxLength={30}
                    onChange={(event) => setLeadForm((prev) => ({ ...prev, lead_client_phone: event.target.value }))}
                    required
                  />
                </label>

                <label>
                  Email
                  <input
                    className="modal-input"
                    type="email"
                    readOnly={Boolean(customer)}
                    disabled={leadLoading || Boolean(leadSuccess)}
                    autoComplete="email"
                    value={leadForm.lead_client_email}
                    onChange={(event) => setLeadForm((prev) => ({ ...prev, lead_client_email: event.target.value }))}
                    required
                  />
                </label>

                {leadError ? <p className="feedback-error">{leadError}</p> : null}
                {leadSuccess ? <p className="feedback-success">{leadSuccess}</p> : null}
              </div>

              <footer className="modal-footer">
                <button type="button" className="modal-cancel" disabled={leadLoading} onClick={closeLeadModal}>
                  {leadSuccess ? 'Cerrar' : 'Cancelar'}
                </button>
                {leadSuccess && customer ? <button type="button" className="modal-submit" onClick={onViewProcesses}>Ver mis procesos</button> : <button type="submit" className="modal-submit" disabled={leadLoading || Boolean(leadSuccess)}>
                  {leadLoading ? 'Enviando...' : 'Enviar formulario'}
                </button>}
              </footer>
            </form>
          </article>
        </div>
      ) : null}
    </section>
  )
}
