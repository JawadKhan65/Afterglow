import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { getEvent } from '../services/ticketmaster.js'

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
      {event.url && <a className="primary-link" href={event.url} target="_blank" rel="noreferrer">Tickets on Ticketmaster <span aria-hidden="true">↗</span></a>}
    </div>
  </section>
}

export function MyEventsPage() {
  return <section className="simple-page"><p className="eyebrow">YOUR ACCOUNT</p><h1>My events</h1><p className="page-lede">Manage the events you’ve registered for.</p><div className="empty-events compact"><h3>No registered events</h3><p>Events you register for will appear here.</p><Link className="primary-link" to="/events">Browse events</Link></div></section>
}

export function NotFoundPage() {
  return <section className="simple-page"><p className="eyebrow">404</p><h1>Page not found</h1><Link className="primary-link" to="/events">Go to events</Link></section>
}
