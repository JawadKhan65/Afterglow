import { Link } from 'react-router'

const categories = ['All events', 'Music', 'Arts & theatre', 'Sports', 'Food & drink']

export function EventsPage() {
  return (
    <section className="events-page">
      <div className="hero-copy">
        <p className="eyebrow">EVENTS</p>
        <h1>Find an event<br /><em>you’ll enjoy.</em></h1>
        <p>Search concerts, sports, theatre, and more in your area.</p>
      </div>
      <div className="search-panel">
        <label className="search-field"><span aria-hidden="true">⌕</span><input placeholder="Artist, event, or venue" aria-label="Search events" /></label>
        <label className="search-field location-field"><span aria-hidden="true">⌖</span><input placeholder="City or ZIP code" aria-label="City or ZIP code" /></label>
        <button className="search-button">Find events <span>↗</span></button>
      </div>
      <div className="section-heading"><div><p className="eyebrow">BROWSE</p><h2>Upcoming events</h2></div><span className="result-note">Event listings will appear when Ticketmaster is connected.</span></div>
      <div className="category-row" aria-label="Event categories">{categories.map((category, index) => <button className={`category-chip ${index === 0 ? 'active' : ''}`} key={category}>{category}</button>)}</div>
      <div className="empty-events"><h3>No events to show yet</h3><p>Event results will appear here after the Ticketmaster API is connected.</p></div>
      <div className="helper-links"><span>Already registered?</span><Link to="/my-events">View My Events →</Link></div>
    </section>
  )
}
