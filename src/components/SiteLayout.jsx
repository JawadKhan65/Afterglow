import { Link, NavLink, Outlet, useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../features/auth/authSlice.js'

export function SiteLayout() {
  const user = useSelector((state) => state.auth.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  function handleLogout() {
    dispatch(logout())
    navigate('/events')
  }

  return (
    <div className="site-shell">
      <header className="site-header">
        <Link className="brand" to="/events" aria-label="Afterglow home"><span>Afterglow</span></Link>
        <nav className="main-nav" aria-label="Main navigation">
          <NavLink to="/events">Discover</NavLink>
          <NavLink to="/my-events">My events</NavLink>
        </nav>
        <div className="header-account">
          {user ? <><span className="user-greeting">{user.name.split(' ')[0]}</span><button className="text-button" onClick={handleLogout}>Log out</button></> : <><Link className="login-link" to="/login">Log in</Link><Link className="small-cta" to="/register">Create account</Link></>}
        </div>
      </header>
      <main className="page-content"><Outlet /></main>
      <footer className="site-footer"><span>Event Management System</span><span>Afterglow</span></footer>
    </div>
  )
}
