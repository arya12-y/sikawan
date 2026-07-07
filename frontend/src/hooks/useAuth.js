import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api, { getToken, setToken as persistToken } from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setTokenState] = useState(getToken())
  const [loading, setLoading] = useState(Boolean(getToken()))

  const updateToken = useCallback((nextToken) => {
    persistToken(nextToken)
    setTokenState(nextToken)
  }, [])

  const me = useCallback(async () => {
    const response = await api.get('/me')
    setUser(response.data.user ?? response.data)
    return response.data
  }, [])

  const login = useCallback(async (credentials) => {
    const response = await api.post('/login', credentials)
    const nextToken = response.data.token ?? response.data.access_token
    updateToken(nextToken)
    setUser(response.data.user ?? null)
    return response.data
  }, [updateToken])

  const logout = useCallback(async () => {
    try {
      await api.post('/logout')
    } catch {
      undefined
    } finally {
      updateToken(null)
      setUser(null)
    }
  }, [updateToken])

  useEffect(() => {
    let active = true

    if (!token) {
      return undefined
    }

    queueMicrotask(() => {
      if (active) {
        setLoading(true)
      }
      me()
        .catch(() => {
          if (active) {
            updateToken(null)
            setUser(null)
          }
        })
        .finally(() => {
          if (active) {
            setLoading(false)
          }
        })
    })

    return () => {
      active = false
    }
  }, [me, token, updateToken])

  useEffect(() => {
    const handleUnauthorized = () => {
      updateToken(null)
      setUser(null)
    }

    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized)
  }, [updateToken])

  const value = useMemo(() => ({
    user,
    token,
    loading,
    isAuthenticated: Boolean(token),
    login,
    logout,
    me,
    updateToken,
    setUser,
  }), [user, token, loading, login, logout, me, updateToken])

  return createElement(AuthContext.Provider, { value }, children)
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
