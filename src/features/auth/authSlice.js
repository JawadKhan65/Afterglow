import { createSlice } from '@reduxjs/toolkit'

const USERS_KEY = 'afterglow.users'
const SESSION_KEY = 'afterglow.session'

function readUsers() {
  try {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
    return Array.isArray(users) ? users : []
  } catch {
    return []
  }
}

function readSession() {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')
    if (!session?.id || !session?.email) return null
    const user = readUsers().find((entry) => entry.id === session.id && entry.email === session.email)
    return user ? { id: user.id, name: user.name, email: user.email } : null
  } catch {
    return null
  }
}

const initialState = { user: readSession(), users: readUsers(), error: null }

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    register(state, action) {
      const email = action.payload.email.trim().toLowerCase()
      if (state.users.some((user) => user.email === email)) {
        state.error = 'An account with this email already exists.'
        return
      }

      const user = {
        id: crypto.randomUUID(),
        name: action.payload.name.trim(),
        email,
        password: action.payload.password,
      }
      state.users.push(user)
      state.user = { id: user.id, name: user.name, email: user.email }
      state.error = null
      localStorage.setItem(USERS_KEY, JSON.stringify(state.users))
      localStorage.setItem(SESSION_KEY, JSON.stringify(state.user))
    },
    login(state, action) {
      const email = action.payload.email.trim().toLowerCase()
      const user = state.users.find((entry) => entry.email === email && entry.password === action.payload.password)
      if (!user) {
        state.error = 'That email and password combination was not found.'
        return
      }

      state.user = { id: user.id, name: user.name, email: user.email }
      state.error = null
      localStorage.setItem(SESSION_KEY, JSON.stringify(state.user))
    },
    logout(state) {
      state.user = null
      state.error = null
      localStorage.removeItem(SESSION_KEY)
    },
    clearAuthError(state) {
      state.error = null
    },
  },
})

export const { register, login, logout, clearAuthError } = authSlice.actions
export default authSlice.reducer
