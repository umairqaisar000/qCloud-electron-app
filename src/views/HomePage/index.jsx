import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import SystemSpecs from '../../components/SystemSpecs'
import { AuthContext } from '../../Context/AuthContext'
import { removeGpuData } from '../../database/GpuData'
import { removeSshCredientials } from '../../database/sshData'
import TopBar from '../../components/TopBar'
import { SecondaryButton } from 'qlu-20-ui-library'
import './style.scss'
const ngrok = window.require('ngrok')

const HomePage = () => {
  const navigate = useNavigate()
  const { logout } = useContext(AuthContext)

  const handleLogout = () => {
    logout()
    removeGpuData()
    removeSshCredientials()
    ngrok.disconnect()
    navigate('/')
  }

  return (
    <>
      <TopBar />
      <div className="main-content">
      <div className="gpu-bar">
        <div className="active-gpus">
          <div className="text">
          Active Gpu's
          </div>
          
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="87"
            height="2"
            viewBox="0 0 87 2"
            fill="none"
          >
            <path
              d="M1 1H86"
              stroke="#FF8D4E"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </div>
        <div className="total-gpus">
          <div className="text">Total Gpus</div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="87"
            height="2"
            viewBox="0 0 87 2"
            fill="none"
          >
            <path
              d="M1 1H86"
              stroke="#FF8D4E"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </div>
        
      </div>
      <SystemSpecs />
      </div>
    <div className="logout-button">
    <SecondaryButton text='Logout' onClick={handleLogout}/>
    </div>
 
    </>
  )
}

export default HomePage
