import React from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './Context/AuthContext'
import LoginPage from './views/LoginPage'
import SignupPage from './views/SignupPage'
import HomePage from './views/HomePage';

function App() {
  return (
    <HashRouter>
      
        <AuthProvider>
          <Routes>
            <Route path="/" exact element={<LoginPage />} />
            <Route path="/signup" exact element={<SignupPage />} />
            <Route path="/homepage" exact element={<HomePage />} />
          </Routes>
        </AuthProvider>
     
    </HashRouter>
  )
}

export default App
