import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { getEvent } from '../services/ticketmaster.js'
import { cancelRegistration, registerForEvent } from '../features/registrations/registrationsSlice.js'

function eventStartDate(dateTime, localDate, localTime = '00:00:00') {
  const date = dateTime ? new Date(dateTime) : localDate ? new Date(`${localDate}T${localTime}`) : null
  return date && !Number.isNaN(date.getTime()) ? date : null
}

function formatEventDate(event) {
  const start = event.dates?.start
  if (!start) return 'Date to be announced'
  const date = start.dateTime ? new Date(start.dateTime) : new Date(`${start.localDate}T${start.localTime ?? '00:00:00'}`)
  if (Number.isNaN(date.getTime())) return 'Date to be announced'
  return new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date)
}

function eventImage(event) {
  const images = event.images ?? []
  return images.find((image) => image.ratio === '16_9' && image.width >= 800)?.url ?? images[0]?.url
}

export function EventDetailsPage() {
  const { eventId } = useParams()
  const user = useSelector((state) => state.auth.user)
  const registrations = useSelector((state) => state.registrations)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const isRegistered = Boolean(user && registrations.some((item) => item.userId === user.id && item.event.id === eventId))
  const [registrationMessage, setRegistrationMessage] = useState('')
  const [result, setResult] = useState({ status: 'loading', event: null, error: '' })

  useEffect(() => {
    const controller = new AbortController()
    setResult({ status: 'loading', event: null, error: '' })
    getEvent(eventId, controller.signal)
      .then((event) => setResult({ status: 'success', event, error: '' }))
      .catch((error) => {
        if (error.name !== 'AbortError') setResult({ status: 'error', event: null, error: error.message })
      })
    return () => controller.abort()
  }, [eventId])

  if (result.status === 'loading') return <section className="simple-page"><p className="eyebrow">EVENT DETAILS</p><div className="event-state" role="status"><span className="loading-indicator" />Loading event details…</div></section>
  if (result.status === 'error') return <section className="simple-page"><p className="eyebrow">EVENT DETAILS</p><div className="event-state event-error" role="alert"><h3>Event details couldn’t be loaded</h3><p>{result.error}</p><Link className="primary-link" to="/events">Back to events</Link></div></section>

  const event = result.event
  const venue = event._embedded?.venues?.[0]
  const place = [venue?.city?.name, venue?.state?.stateCode ?? venue?.country?.name].filter(Boolean).join(', ')
  const category = event.classifications?.map((item) => [item.segment?.name, item.genre?.name].filter(Boolean).join(' · ')).find(Boolean)
  const image = eventImage(event)
  const isCancelled = event.dates?.status?.code === 'cancelled'
  const eventDate = eventStartDate(event.dates?.start?.dateTime, event.dates?.start?.localDate, event.dates?.start?.localTime)
  const isCompleted = eventDate && eventDate.getTime() < Date.now()

  return <section className="simple-page event-detail-page">
    <Link className="back-link" to="/events">← Back to events</Link>
    {image && <img className="detail-image" src={image} alt="" />}
    <div className="event-detail-content">
      <p className="eyebrow">{category ?? 'EVENT'}</p>
      <h1>{event.name}</h1>
      <dl className="event-facts">
        <div><dt>Date and time</dt><dd>{formatEventDate(event)}</dd></div>
        <div><dt>Venue</dt><dd>{venue?.name ?? 'To be announced'}</dd></div>
        <div><dt>Location</dt><dd>{place || venue?.address?.line1 || 'To be announced'}</dd></div>
        {event.priceRanges?.[0] && <div><dt>Price</dt><dd>{event.priceRanges[0].currency} {event.priceRanges[0].min}–{event.priceRanges[0].max}</dd></div>}
      </dl>
      {event.info && <p className="event-description">{event.info}</p>}
      {event.pleaseNote && <p className="event-description"><strong>Please note:</strong> {event.pleaseNote}</p>}
      <div className="event-actions">
        {isRegistered ? isCompleted ? <span className="event-cancelled" role="status">This event is complete. Your registration remains in My Events.</span> : <><span className="registration-status" role="status">You’re registered for this event.</span><button className="secondary-button" type="button" onClick={() => { dispatch(cancelRegistration({ userId: user.id, eventId })); setRegistrationMessage('Your registration has been cancelled.') }}>Cancel registration</button></> : isCancelled ? <span className="event-cancelled" role="status">This event has been cancelled.</span> : <button className="primary-link" type="button" onClick={() => {
          if (!user) { navigate('/login', { state: { from: location.pathname } }); return }
          dispatch(registerForEvent({ userId: user.id, event }))
          setRegistrationMessage('You’re registered for this event.')
        }}>Register for event</button>}
        {event.url && <a className="secondary-link" href={event.url} target="_blank" rel="noreferrer">Tickets on Ticketmaster <span aria-hidden="true">↗</span></a>}
        {registrationMessage && <p className="registration-message" role="status">{registrationMessage}</p>}
      </div>
    </div>
  </section>
}

export function MyEventsPage() {
  const user = useSelector((state) => state.auth.user)
  const registrations = useSelector((state) => state.registrations).filter((item) => item.userId === user.id)
  const dispatch = useDispatch()
  const now = Date.now()
  const upcoming = registrations.filter((item) => !eventStartDate(item.event.dateTime, item.event.localDate, item.event.localTime) || eventStartDate(item.event.dateTime, item.event.localDate, item.event.localTime).getTime() >= now)
  const completed = registrations.filter((item) => {
    const start = eventStartDate(item.event.dateTime, item.event.localDate, item.event.localTime)
    return start && start.getTime() < now
  })

  function renderRegistration(item, isCompleted) {
    const start = eventStartDate(item.event.dateTime, item.event.localDate, item.event.localTime)
    const eventDate = start ? new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(start) : 'Date to be announced'
    return <article className="my-event-card" key={item.event.id}>
      <Link className="my-event-image-link" to={`/events/${item.event.id}`}>
        {item.event.image ? <img src={item.event.image} alt="" loading="lazy" /> : <span className="my-event-image-fallback">Event</span>}
      </Link>
      <div className="my-event-info"><p className="event-date">{eventDate}</p><h3><Link to={`/events/${item.event.id}`}>{item.event.name}</Link></h3><p>{[item.event.venue, item.event.city].filter(Boolean).join(' · ') || item.event.category}</p><span className={`event-status ${isCompleted ? 'completed' : 'upcoming'}`}>{isCompleted ? 'Completed' : 'Upcoming'}</span></div>
      {!isCompleted && <button className="cancel-event-button" type="button" onClick={() => dispatch(cancelRegistration({ userId: user.id, eventId: item.event.id }))}>Cancel registration</button>}
    </article>
  }

  return <section className="simple-page"><p className="eyebrow">YOUR ACCOUNT</p><h1>My events</h1><p className="page-lede">Events you register for are saved to this account.</p>
    {registrations.length === 0 ? <div className="empty-events compact"><h3>No registered events</h3><p>Browse events and register to add them here.</p><Link className="primary-link" to="/events">Browse events</Link></div> : <div className="my-events-sections">
      <section aria-labelledby="upcoming-heading"><div className="my-events-heading"><h2 id="upcoming-heading">Upcoming</h2><span>{upcoming.length}</span></div>{upcoming.length ? <div className="my-events-list">{upcoming.map((item) => renderRegistration(item, false))}</div> : <p className="my-events-empty">No upcoming registrations.</p>}</section>
      <section aria-labelledby="completed-heading"><div className="my-events-heading"><h2 id="completed-heading">Completed</h2><span>{completed.length}</span></div>{completed.length ? <div className="my-events-list">{completed.map((item) => renderRegistration(item, true))}</div> : <p className="my-events-empty">Completed events will appear here.</p>}</section>
    </div>}
  </section>
}

export function NotFoundPage() {
  return <section className="simple-page"><p className="eyebrow">404</p><h1>Page not found</h1><Link className="primary-link" to="/events">Go to events</Link></section>
}
