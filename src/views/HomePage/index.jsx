import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import SystemSpecs from '../../components/SystemSpecs'
import { AuthContext } from '../../Context/AuthContext'
import { removeGpuData,updateGpuStatus } from '../../database/GpuData'
import { removeSshCredientials } from '../../database/sshData'
import TopBar from '../../components/TopBar'
import { SecondaryButton } from 'qlu-20-ui-library'
import './style.scss'
const ngrok = window.require('ngrok')

const HomePage = () => {
  const navigate = useNavigate()
  const { logout } = useContext(AuthContext)

  // const handleWithdraw = async () => {
  //   try {
  //     await removeSshCredientials()
  //     await removeGpuData()
  //     await stopAndDeleteContainer(IMAGE_NAME)
  //     await ngrok.disconnect()
  //     setIsLend(false)
  //   } catch (err) {
  //     setErrorMessage(
  //       'Withdrawal failed. Please try again. Error: ' + err.message
  //     )
  //     setTimeout(() => setErrorMessage(err), 5000) // Clear error message after 5 seconds
  //     console.log(err)
  //   }
  // }

  const handleLogout = async () => {
    
    // removeSshCredientials()
    // removeGpuData()
        const user_id = JSON.parse(localStorage.getItem('userData')).id
        console.log("User_idddddddd",user_id);
        await updateGpuStatus(user_id, 'disconnected'); // Update gpu_status to 'active'
      
        logout()
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
