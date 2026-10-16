import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { searchEvents, toTicketmasterDateTime } from '../services/ticketmaster.js'

const categories = [
  { label: 'All events', value: '' },
  { label: 'Music', value: 'Music' },
  { label: 'Arts & theatre', value: 'Arts & Theatre' },
  { label: 'Sports', value: 'Sports' },
  { label: 'Family', value: 'Family' },
]

function localDateTime(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date)
}

function getEventImage(event) {
  const images = event.images ?? []
  return images.find((image) => image.ratio === '16_9' && image.width >= 500)?.url ?? images[0]?.url
}

function EventCard({ event }) {
  const venue = event._embedded?.venues?.[0]
  const image = getEventImage(event)
  const date = localDateTime(event.dates?.start?.dateTime ?? event.dates?.start?.localDate)

  return <article className="event-card">
    <Link className="event-image-link" to={`/events/${event.id}`} aria-label={`View ${event.name}`}>
      {image ? <img className="event-image" src={image} alt="" loading="lazy" /> : <div className="event-image event-image-fallback">Event image unavailable</div>}
    </Link>
    <div className="event-card-body">
      <p className="event-date">{date ?? 'Date to be announced'}</p>
      <h3><Link to={`/events/${event.id}`}>{event.name}</Link></h3>
      <p className="event-venue">{venue?.name ?? 'Venue to be announced'}{venue?.city?.name ? ` · ${venue.city.name}` : ''}</p>
      <div className="event-card-footer"><span>{event.classifications?.[0]?.segment?.name ?? 'Event'}</span><Link to={`/events/${event.id}`}>Details <span aria-hidden="true">→</span></Link></div>
    </div>
  </article>
}

export function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [keyword, setKeyword] = useState(searchParams.get('keyword') ?? '')
  const [city, setCity] = useState(searchParams.get('city') ?? '')
  const [category, setCategory] = useState(searchParams.get('category') ?? '')
  const [dateRange, setDateRange] = useState(searchParams.get('date') ?? '')
  const [request, setRequest] = useState({ status: 'loading', events: [], total: 0, error: '' })
  const [page, setPage] = useState(Number(searchParams.get('page') ?? 0))
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setRequest((previous) => ({ ...previous, status: 'loading', error: '' }))
      const filters = { keyword, city, classificationName: category, page }
      const now = new Date()
      if (dateRange === 'today') {
        const start = new Date(now)
        const end = new Date(now); end.setHours(23, 59, 59, 999)
        filters.startDateTime = toTicketmasterDateTime(start); filters.endDateTime = toTicketmasterDateTime(end)
      } else if (dateRange === 'weekend') {
        const start = new Date(now)
        const daysUntilSaturday = (6 - start.getDay() + 7) % 7
        start.setDate(start.getDate() + daysUntilSaturday)
        if (daysUntilSaturday > 0) start.setHours(0, 0, 0, 0)
        const end = new Date(start); end.setDate(end.getDate() + 2); end.setMilliseconds(-1)
        filters.startDateTime = toTicketmasterDateTime(start); filters.endDateTime = toTicketmasterDateTime(end)
      } else if (dateRange === 'month') {
        const start = new Date(now); start.setHours(0, 0, 0, 0)
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 1)
        filters.startDateTime = toTicketmasterDateTime(start); filters.endDateTime = toTicketmasterDateTime(end)
      }

      try {
        const data = await searchEvents(filters, controller.signal)
        const events = data._embedded?.events ?? []
        setRequest({ status: 'success', events, total: data.page?.totalElements ?? events.length, error: '' })
      } catch (error) {
        if (error.name !== 'AbortError') setRequest({ status: 'error', events: [], total: 0, error: error.message })
      }
    }, 250)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [keyword, city, category, dateRange, page, retryCount])

  function submitSearch(event) {
    event.preventDefault()
    setPage(0)
    setSearchParams(Object.fromEntries(Object.entries({ keyword: keyword.trim(), city: city.trim(), category, date: dateRange }).filter(([, value]) => value)))
  }

  function changeCategory(value) {
    setCategory(value)
    setPage(0)
    const next = Object.fromEntries(Object.entries({ keyword: keyword.trim(), city: city.trim(), category: value, date: dateRange }).filter(([, item]) => item))
    setSearchParams(next)
  }

  function changeDate(value) {
    setDateRange(value)
    setPage(0)
    const next = Object.fromEntries(Object.entries({ keyword: keyword.trim(), city: city.trim(), category, date: value }).filter(([, item]) => item))
    setSearchParams(next)
  }

  function changePage(nextPage) {
    setPage(nextPage)
    const next = Object.fromEntries(Object.entries({ keyword: keyword.trim(), city: city.trim(), category, date: dateRange, page: nextPage || '' }).filter(([, value]) => value))
    setSearchParams(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <section className="events-page">
      <div className="hero-copy">
        <p className="eyebrow">EVENTS</p>
        <h1>Find an event<br /><em>you’ll enjoy.</em></h1>
        <p>Search concerts, sports, theatre, and more in your area.</p>
      </div>
      <form className="search-panel" onSubmit={submitSearch}>
        <label className="search-field"><span aria-hidden="true">⌕</span><input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Artist, event, or venue" aria-label="Search events" /></label>
        <label className="search-field location-field"><span aria-hidden="true">⌖</span><input value={city} onChange={(event) => setCity(event.target.value)} placeholder="City" aria-label="City" /></label>
        <button className="search-button" type="submit">Search events</button>
      </form>
      <div className="section-heading"><div><p className="eyebrow">BROWSE</p><h2>Upcoming events</h2></div><span className="result-note">{request.status === 'success' ? `${request.total.toLocaleString()} events found` : 'Results from Ticketmaster'}</span></div>
      <div className="category-row" aria-label="Filter by category">{categories.map((item) => <button type="button" className={`category-chip ${category === item.value ? 'active' : ''}`} key={item.label} aria-pressed={category === item.value} onClick={() => changeCategory(item.value)}>{item.label}</button>)}</div>
      <div className="filter-row"><label htmlFor="date-filter">Date</label><select id="date-filter" value={dateRange} onChange={(event) => changeDate(event.target.value)}><option value="">Any upcoming date</option><option value="today">Today</option><option value="weekend">This weekend</option><option value="month">This month</option></select></div>

      {request.status === 'loading' && <div className="event-state" role="status"><span className="loading-indicator" />Loading events…</div>}
      {request.status === 'error' && <div className="event-state event-error" role="alert"><h3>Events couldn’t be loaded</h3><p>{request.error}</p><button className="secondary-button" type="button" onClick={() => setRetryCount((value) => value + 1)}>Try again</button></div>}
      {request.status === 'success' && request.events.length === 0 && <div className="event-state"><h3>No events found</h3><p>Try another keyword, city, category, or date range.</p></div>}
      {request.status === 'success' && request.events.length > 0 && <>
        <div className="event-grid">{request.events.map((event) => <EventCard event={event} key={event.id} />)}</div>
        <div className="pagination"><button type="button" className="secondary-button" onClick={() => changePage(page - 1)} disabled={page === 0}>Previous</button><span>Page {page + 1}</span><button type="button" className="secondary-button" onClick={() => changePage(page + 1)} disabled={(page + 1) * 24 >= request.total}>Next</button></div>
      </>}
      <div className="helper-links"><span>Already registered?</span><Link to="/my-events">View My Events →</Link></div>
    </section>
  )
}
