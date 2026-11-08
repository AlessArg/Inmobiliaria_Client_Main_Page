import { useState, type FormEvent } from 'react'
import { buildApiUrl } from '@services/http/client'

export function ApplicationForm({ vacancyId }: { vacancyId: number }) {
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [dpi, setDpi] = useState('')
  const [education, setEducation] = useState('')
  const [studyYears, setStudyYears] = useState('')
  const [experienceYears, setExperienceYears] = useState('')
  const [studying, setStudying] = useState('')
  const [career, setCareer] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (files.length > 5 || files.some(file => file.size > 5 * 1024 * 1024 || !['application/pdf', 'image/jpeg', 'image/png'].includes(file.type))) {
      setError('Adjunta hasta 5 archivos PDF, JPG o PNG de máximo 5 MB cada uno.'); return
    }
    setSending(true); setError('')
    try {
      const form = new FormData()
      form.append('full_name', name.trim()); form.append('age', age); form.append('dpi', dpi.trim())
      form.append('education', education.trim()); form.append('study_years', studyYears); form.append('currently_studying', studying)
      form.append('experience_years', experienceYears)
      if (studying === 'true') form.append('current_career', career.trim())
      files.forEach(file => form.append('files', file))
      const response = await fetch(buildApiUrl(`careers/vacancies/${vacancyId}/applications`), { method: 'POST', body: form })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({})) as { message?: string }
        throw new Error(payload.message || 'No se pudo enviar tu postulación. Intenta nuevamente.')
      }
      setSent(true)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo enviar tu postulación.') }
    finally { setSending(false) }
  }

  if (sent) return <div className="application-success" role="status"><strong>¡Postulación enviada!</strong><p>Hemos recibido tus datos y archivos.</p></div>
  return <form className="application-form" onSubmit={event => void submit(event)}>
    <div className="application-heading"><p className="eyebrow">TU PRÓXIMO PASO</p><h3>Postúlate a esta plaza</h3><p>Cuéntanos sobre ti para que nuestro equipo conozca tu perfil.</p></div>
    <div className="application-grid"><label className="application-full">Nombre completo<input value={name} onChange={event => setName(event.target.value)} maxLength={150} autoComplete="name" required /></label><label>Edad<input type="number" min="1" max="120" value={age} onChange={event => setAge(event.target.value)} required /></label><label>DPI<input inputMode="numeric" pattern="[0-9]{13}" maxLength={13} value={dpi} onChange={event => setDpi(event.target.value.replace(/\D/g, ''))} placeholder="13 dígitos" required /></label><label className="application-full">Último grado académico<input value={education} onChange={event => setEducation(event.target.value)} maxLength={150} required /></label>
      <label className="application-full">Años de estudio completados<input type="number" min="0" max="80" step="1" value={studyYears} onChange={event => setStudyYears(event.target.value)} required /></label>
      <label className="application-full">Años de experiencia<input type="number" min="0" max="80" step="1" value={experienceYears} onChange={event => setExperienceYears(event.target.value)} required /></label>
      <fieldset className="application-full"><legend>¿Estudias actualmente?</legend><div className="application-radio"><label><input type="radio" name="studying" value="true" checked={studying === 'true'} onChange={() => setStudying('true')} required /> Sí</label><label><input type="radio" name="studying" value="false" checked={studying === 'false'} onChange={() => { setStudying('false'); setCareer('') }} required /> No</label></div></fieldset>
      <label className="application-full">Nombre de carrera en curso<input value={career} disabled={studying !== 'true'} required={studying === 'true'} maxLength={150} onChange={event => setCareer(event.target.value)} /></label>
      <label className="application-full application-file">Archivos de apoyo <small>Hasta 5 archivos PDF, JPG o PNG de 5 MB cada uno.</small><input type="file" multiple accept="application/pdf,image/jpeg,image/png" onChange={event => { const selected = Array.from(event.target.files ?? []); setFiles(selected); setError(selected.length > 5 ? 'Puedes adjuntar hasta 5 archivos.' : '') }} />{files.length > 0 && <span>{files.length} archivo(s) seleccionado(s): {files.map(file => file.name).join(', ')}</span>}</label>
    </div>
    {error && <p className="application-error" role="alert">{error}</p>}
    <button className="application-submit" type="submit" disabled={sending || files.length > 5}>{sending ? 'Enviando…' : 'Enviar postulación'} <span aria-hidden="true">→</span></button>
  </form>
}
