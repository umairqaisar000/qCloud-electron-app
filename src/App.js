import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './Context/AuthContext'
import LoginPage from './views/LoginPage'
import SignupPage from './views/SignupPage'
import HomePage from './views/HomePage'

//const UserContext = createContext();

function App() {
  //const [isAuthenticated, setIsAuthenticated] = useState(false)
  return (
    <Router>
      <div>
        <div className="container mt-3">
          <AuthProvider>
            <Routes>
              <Route path="/" exact element={<LoginPage />} />
              <Route path="/signup" exact element={<SignupPage />} />
              <Route path="/homepage" exact element={<HomePage />} />
            </Routes>
          </AuthProvider>
        </div>
      </div>
    </Router>
  )
}

export default App
