// AuthContext.js
import React, { createContext, useState } from 'react'
import { pool } from '../database/PoolConnection'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null)
  const [isLend, setIsLend] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const login = (id, email,org_id) => {
    setIsAuthenticated(true)
    localStorage.setItem('isAuthenticated', true)
    localStorage.setItem('userData', JSON.stringify({ id, email ,org_id}))
  }

  const lend = (lend) => {
    setIsLend(lend)
    localStorage.setItem('isLend', isLend)
  }

  const logout = async () => {
    const client = await pool.connect()
    const query = 'DELETE FROM system_specs WHERE id = $1'
    await client.query(query, [localStorage.getItem('current_job_id')])
    setIsAuthenticated(false)
    setUserData(null)
    localStorage.clear()
  }

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, userData, login, lend, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}
