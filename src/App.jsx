import { Navigate, Route, Routes } from 'react-router'
import { SiteLayout } from './components/SiteLayout.jsx'
import { ProtectedRoute } from './components/ProtectedRoute.jsx'
import { LoginPage, RegisterPage } from './pages/AuthPages.jsx'
import { EventDetailsPage, MyEventsPage, NotFoundPage } from './pages/PlaceholderPage.jsx'
import { EventsPage } from './pages/EventsPage.jsx'

export function App() {
  return <Routes>
    <Route element={<SiteLayout />}>
      <Route index element={<Navigate to="/events" replace />} />
      <Route path="events" element={<EventsPage />} />
      <Route path="events/:eventId" element={<EventDetailsPage />} />
      <Route path="my-events" element={<ProtectedRoute><MyEventsPage /></ProtectedRoute>} />
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Routes>
}
