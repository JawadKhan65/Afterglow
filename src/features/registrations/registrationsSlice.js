import { createSlice } from '@reduxjs/toolkit'

const STORAGE_KEY = 'afterglow.registrations'

function readRegistrations() {
  try {
    const registrations = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(registrations) ? registrations : []
  } catch {
    return []
  }
}

export function persistRegistrations(registrations) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(registrations))
  } catch {
    // Keep the in-memory state usable if browser storage is disabled or full.
  }
}

const registrationsSlice = createSlice({
  name: 'registrations',
  initialState: readRegistrations(),
  reducers: {
    registerForEvent(state, action) {
      const { userId, event } = action.payload
      if (!userId || !event?.id || state.some((item) => item.userId === userId && item.event.id === event.id)) return

      state.push({
        userId,
        registeredAt: new Date().toISOString(),
        event: {
          id: event.id,
          name: event.name,
          url: event.url ?? '',
          image: event.images?.find((image) => image.ratio === '16_9' && image.width >= 500)?.url ?? event.images?.[0]?.url ?? '',
          dateTime: event.dates?.start?.dateTime ?? '',
          localDate: event.dates?.start?.localDate ?? '',
          localTime: event.dates?.start?.localTime ?? '',
          timezone: event.dates?.timezone ?? '',
          venue: event._embedded?.venues?.[0]?.name ?? '',
          city: event._embedded?.venues?.[0]?.city?.name ?? '',
          category: event.classifications?.[0]?.segment?.name ?? 'Event',
        },
      })
    },
    cancelRegistration(state, action) {
      const { userId, eventId } = action.payload
      const remaining = state.filter((item) => !(item.userId === userId && item.event.id === eventId))
      return remaining
    },
  },
})

export const { registerForEvent, cancelRegistration } = registrationsSlice.actions
export default registrationsSlice.reducer
