import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit'
import authReducer from './features/auth/authSlice.js'
import registrationsReducer, { cancelRegistration, persistRegistrations, registerForEvent } from './features/registrations/registrationsSlice.js'

const persistenceMiddleware = createListenerMiddleware()

persistenceMiddleware.startListening({
  matcher: (action) => registerForEvent.match(action) || cancelRegistration.match(action),
  effect: (_action, listenerApi) => {
    persistRegistrations(listenerApi.getState().registrations)
  },
})

export const store = configureStore({
  reducer: {
    auth: authReducer,
    registrations: registrationsReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(persistenceMiddleware.middleware),
})
