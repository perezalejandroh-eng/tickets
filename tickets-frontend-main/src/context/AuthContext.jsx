import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedUser = authService.getUser()
    if (savedUser && authService.isAuthenticated()) {
      setUser(savedUser)
    }
    setLoading(false)
  }, [])

  const login = async (correo, password) => {
    const jwtData = await authService.login(correo, password)
    authService.saveSession(jwtData)
    setUser({ id: jwtData.id, nombre: jwtData.nombre, correo: jwtData.correo, rol: jwtData.rol })
    return jwtData
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  const isRole = (...roles) => user && roles.includes(user.rol)

  const updateUser = (data) => {
    const updated = { ...authService.getUser(), ...data }
    localStorage.setItem('user', JSON.stringify(updated))
    setUser(updated)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isRole, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
