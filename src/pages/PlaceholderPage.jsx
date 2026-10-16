import { Link, useParams } from 'react-router'

export function EventDetailsPage() {
  const { eventId } = useParams()
  return <section className="simple-page"><p className="eyebrow">EVENT DETAILS</p><div className="simple-card"><h1>Event details</h1><p>Event <code>{eventId}</code> will show its date, venue, location, and ticket information once the event catalogue is connected.</p><Link className="primary-link" to="/events">Back to events</Link></div></section>
}

export function MyEventsPage() {
  return <section className="simple-page"><p className="eyebrow">YOUR ACCOUNT</p><h1>My events</h1><p className="page-lede">Manage the events you’ve registered for.</p><div className="empty-events compact"><h3>No registered events</h3><p>Events you register for will appear here.</p><Link className="primary-link" to="/events">Browse events</Link></div></section>
}

export function NotFoundPage() {
  return <section className="simple-page"><p className="eyebrow">404</p><h1>Page not found</h1><Link className="primary-link" to="/events">Go to events</Link></section>
}
