const API_ROOT = 'https://app.ticketmaster.com/discovery/v2'
const API_KEY = import.meta.env.VITE_TICKETMASTER_API_KEY?.trim()

export function toTicketmasterDateTime(date) {
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z')
}

export class TicketmasterError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'TicketmasterError'
    this.status = status
  }
}

async function request(path, params = {}, signal) {
  if (!API_KEY) {
    throw new TicketmasterError('Ticketmaster API key is missing. Add VITE_TICKETMASTER_API_KEY to your local .env file, then restart the dev server.')
  }

  const search = new URLSearchParams({ apikey: API_KEY, ...params })
  let response
  try {
    response = await fetch(`${API_ROOT}${path}?${search}`, { signal })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new TicketmasterError('Could not connect to Ticketmaster. Check your connection and try again.')
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new TicketmasterError('Ticketmaster rejected the API key. Check that it is valid and enabled for the Discovery API.', response.status)
    }
    if (response.status === 429) {
      throw new TicketmasterError('Ticketmaster request limit reached. Please wait a little and try again.', response.status)
    }
    throw new TicketmasterError(`Ticketmaster returned an error (${response.status}). Please try again.`, response.status)
  }

  return response.json()
}

export function searchEvents(filters, signal) {
  const params = {
    size: '24',
    page: String(filters.page ?? 0),
    sort: 'date,asc',
    startDateTime: toTicketmasterDateTime(filters.startDateTime ? new Date(filters.startDateTime) : new Date()),
    includeTBA: 'no',
    includeTBD: 'no',
  }

  if (filters.keyword?.trim()) params.keyword = filters.keyword.trim()
  if (filters.city?.trim()) params.city = filters.city.trim()
  if (filters.classificationName) params.classificationName = filters.classificationName
  if (filters.startDateTime) params.startDateTime = toTicketmasterDateTime(new Date(filters.startDateTime))
  if (filters.endDateTime) params.endDateTime = toTicketmasterDateTime(new Date(filters.endDateTime))

  return request('/events.json', params, signal)
}

export function getEvent(eventId, signal) {
  return request(`/events/${encodeURIComponent(eventId)}.json`, {}, signal)
}
