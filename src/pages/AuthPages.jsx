import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { useDispatch, useSelector, useStore } from 'react-redux'
import { clearAuthError, login, register } from '../features/auth/authSlice.js'

function AuthLayout({ mode, children, onSubmit, error, notice }) {
  const isRegister = mode === 'register'
  return (
    <section className="auth-page">
      <div className="auth-aside"><div><p className="eyebrow">EVENT MANAGEMENT</p><h1>{isRegister ? <>Create an<br /><em>account.</em></> : <>Welcome<br /><em>back.</em></>}</h1><p>Save events you’re interested in and keep your plans in one place.</p></div></div>
      <div className="auth-main"><div className="auth-card"><p className="eyebrow">{isRegister ? 'REGISTER' : 'LOGIN'}</p><h2>{isRegister ? 'Create your account' : 'Log in to your account'}</h2><p className="auth-subtitle">{isRegister ? 'Enter your details to get started.' : 'Enter your account details to continue.'}</p>
        {notice && <div className="notice-box" role="status">{notice}</div>}
        {error && <div className="error-box" role="alert">{error}</div>}
        <form className="auth-form" onSubmit={onSubmit} noValidate>{children}<button className="auth-submit" type="submit">{isRegister ? 'Create account' : 'Log in'} <span>↗</span></button></form>
        <p className="auth-switch">{isRegister ? 'Already part of the story?' : 'New around here?'} <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Log in' : 'Create an account'}</Link></p>
        <p className="demo-note">This is a frontend demo. Use a password that you don’t use for other accounts.</p>
      </div></div>
    </section>
  )
}

function Field({ id, label, type = 'text', autoComplete, value, onChange, error, placeholder }) {
  return <label className="form-field" htmlFor={id}><span>{label}</span><input id={id} name={id} type={type} autoComplete={autoComplete} value={value} onChange={onChange} placeholder={placeholder} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} />{error && <small id={`${id}-error`} className="field-error">{error}</small>}</label>
}

export function LoginPage() {
  const [values, setValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const dispatch = useDispatch()
  const store = useStore()
  const navigate = useNavigate()
  const location = useLocation()
  const user = useSelector((state) => state.auth.user)
  const authError = useSelector((state) => state.auth.error)
  if (user) return <Navigate to={location.state?.from || '/events'} replace />

  function update(event) { dispatch(clearAuthError()); setValues({ ...values, [event.target.name]: event.target.value }) }
  function submit(event) {
    event.preventDefault()
    const nextErrors = {}
    if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) nextErrors.email = 'Enter a valid email address.'
    if (!values.password) nextErrors.password = 'Enter your password.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    dispatch(login(values))
    if (store.getState().auth.user) navigate(location.state?.from || '/events', { replace: true })
  }

  return <AuthLayout mode="login" onSubmit={submit} error={authError} notice={location.state?.registered ? 'Your account is ready. Welcome to Afterglow!' : ''}>
    <Field id="email" label="Email address" type="email" autoComplete="email" value={values.email} onChange={update} error={errors.email} placeholder="you@example.com" />
    <Field id="password" label="Password" type="password" autoComplete="current-password" value={values.password} onChange={update} error={errors.password} placeholder="Your password" />
  </AuthLayout>
}

export function RegisterPage() {
  const [values, setValues] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const dispatch = useDispatch()
  const store = useStore()
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth.user)
  const authError = useSelector((state) => state.auth.error)
  if (user) return <Navigate to="/events" replace />

  function update(event) { dispatch(clearAuthError()); setValues({ ...values, [event.target.name]: event.target.value }) }
  function submit(event) {
    event.preventDefault()
    const nextErrors = {}
    if (values.name.trim().length < 2) nextErrors.name = 'Enter your name (at least 2 characters).'
    if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) nextErrors.email = 'Enter a valid email address.'
    if (values.password.length < 8) nextErrors.password = 'Use at least 8 characters.'
    if (!/[A-Za-z]/.test(values.password) || !/\d/.test(values.password)) nextErrors.password = 'Include at least one letter and one number.'
    if (values.confirmPassword !== values.password) nextErrors.confirmPassword = 'Passwords do not match.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    dispatch(register(values))
    if (store.getState().auth.user) navigate('/events', { replace: true })
  }

  return <AuthLayout mode="register" onSubmit={submit} error={authError}>
    <Field id="name" label="Full name" autoComplete="name" value={values.name} onChange={update} error={errors.name} placeholder="Enter your name" />
    <Field id="email" label="Email address" type="email" autoComplete="email" value={values.email} onChange={update} error={errors.email} placeholder="you@example.com" />
    <Field id="password" label="Password" type="password" autoComplete="new-password" value={values.password} onChange={update} error={errors.password} placeholder="At least 8 characters" />
    <Field id="confirmPassword" label="Confirm password" type="password" autoComplete="new-password" value={values.confirmPassword} onChange={update} error={errors.confirmPassword} placeholder="Enter it once more" />
  </AuthLayout>
}
