import { Navigate, useLocation } from 'react-router'
import { useSelector } from 'react-redux'

export function ProtectedRoute({ children }) {
  const user = useSelector((state) => state.auth.user)
  const location = useLocation()
  return user ? children : <Navigate to="/login" replace state={{ from: location.pathname }} />
}
