import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Alert } from 'react-bootstrap'
import { addGpuData, removeGpuData,updateGpuStatus,checkExistingRecord } from '../../database/GpuData'
import { removeSshCredientials } from '../../database/sshData'
import {
  createAndStartDocker,
  stopAndDeleteContainer
} from '../../services/dockerCreation'
import { execShellCommand } from '../../utils/scripts'
import { SecondaryButton } from 'qlu-20-ui-library'
import './style.scss'

const ngrok = window.require('ngrok')

const ID = uuidv4()

const IMAGE_NAME = `client_dk_${ID}`
const CONTAINER_IMAGE_NAME = `client_dk_container_${ID}`

const GpuNode = ({ systemSpecs, isRunning }) => {
  const [errorMessage, setErrorMessage] = useState('')
  const [isLend, setIsLend] = useState(isRunning)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  console.log("Running????",isRunning);

  const handleLend = async () => {
    try {
      const gpu_status='active'
      const gpu_index=systemSpecs['gpu'][0].index;
      const user_id = JSON.parse(localStorage.getItem('userData')).id
     console.log("SystemSpecs",systemSpecs['gpu'][0].index)

     const existingRecord = await checkExistingRecord(user_id, gpu_index);
     if(!existingRecord){
      if (systemSpecs) {
        await createAndStartDocker(IMAGE_NAME, CONTAINER_IMAGE_NAME)
        const image_id = await execShellCommand(
          `docker images -q ${IMAGE_NAME}`
        )
        console.log("system Specs");
        console.log("userId and imageId ",user_id, image_id)
        await addGpuData(systemSpecs, user_id, image_id,gpu_status);
        setShowSuccessMessage(true)
        setIsLend(true)
        setTimeout(() => setShowSuccessMessage(false), 5000)
      }
     }
     else{
      await updateGpuStatus(user_id, gpu_status);
      setShowSuccessMessage(true);
      setIsLend(true);
     }
      
    } catch (err) {
      setErrorMessage('Lending failed. Please try again. Error: ' + err.message)
      setTimeout(() => setErrorMessage(err), 5000) // Clear error message after 5 seconds
      console.log(err)
    }
  }

  const handleWithdraw = async () => {
    try {
      //  await removeSshCredientials()
      //  await removeGpuData()
      await stopAndDeleteContainer(IMAGE_NAME)
      await ngrok.disconnect()
      const user_id = JSON.parse(localStorage.getItem('userData')).id
      await updateGpuStatus(user_id, 'inactive');
      setIsLend(false)
    } catch (err) {
      setErrorMessage(
        'Withdrawal failed. Please try again. Error: ' + err.message
      )
      setTimeout(() => setErrorMessage(err), 5000) // Clear error message after 5 seconds
      console.log(err)
    }
  }

  return (
    <>
      {showSuccessMessage && (
        <Alert
          variant="primary"
          className="position-fixed top-0 end-0 mt-4 me-4"
          onClose={() => setShowSuccessMessage(false)}
          dismissible
        >
          {!isLend ? 'Withdrawn success!' : 'Lending success!'}
        </Alert>
      )}
      {errorMessage && (
        <Alert
          variant="danger"
          className="position-fixed top-0 end-0 mt-4 me-4"
          onClose={() => setErrorMessage(false)}
          dismissible
        >
          {errorMessage}
        </Alert>
      )}

      {/* Display GPU and system info in the card-container */}
      {systemSpecs['gpu'] !== undefined ? (
        systemSpecs['gpu']?.length >= 0 &&
        systemSpecs['gpu']?.map((gpu, i) => (
          <div key={i} className="gpu-card">
            <div className="title">
              <div className="left-info">
                <div className="gpu-num">{`GPU-${i + 1}`}</div>
                <div className="gpu-name">{gpu.name}</div>
              </div>

              <div className="icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 22 22"
                  fill="none"
                >
                  <path
                    d="M10.9974 15.585C10.7681 15.585 10.5805 15.7725 10.583 16.0018C10.583 16.2311 10.7706 16.4186 10.9999 16.4186C11.2291 16.4186 11.4167 16.2311 11.4167 16.0018C11.4167 15.7725 11.2291 15.585 10.9974 15.585"
                    stroke="#D5D5D5"
                    stroke-width="2.4"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M10.9974 10.583C10.7681 10.583 10.5805 10.7706 10.583 10.9998C10.583 11.2291 10.7706 11.4167 10.9999 11.4167C11.2291 11.4167 11.4167 11.2291 11.4167 10.9998C11.4167 10.7706 11.2291 10.583 10.9974 10.583"
                    stroke="#D5D5D5"
                    stroke-width="2.4"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M10.9974 5.58105C10.7681 5.58105 10.5805 5.76863 10.583 5.99789C10.583 6.22716 10.7706 6.41473 10.9999 6.41473C11.2291 6.41473 11.4167 6.22716 11.4167 5.99789C11.4167 5.76863 11.2291 5.58105 10.9974 5.58105"
                    stroke="#D5D5D5"
                    stroke-width="2.4"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
            </div>
            <div className="logo">
              {isLend ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="87"
                  height="87"
                  viewBox="0 0 87 87"
                  fill="none"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M12.6875 14.5H70.6875C76.6936 14.5 81.5625 19.3689 81.5625 25.375V61.625C81.5625 67.6311 76.6936 72.5 70.6875 72.5H12.6875V14.5Z"
                    stroke="#99552F"
                    stroke-width="5.4375"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M12.6875 76.125V14.5C12.6875 12.498 11.0645 10.875 9.0625 10.875H5.4375"
                    stroke="#99552F"
                    stroke-width="5.4375"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M23.5625 29V58"
                    stroke="#99552F"
                    stroke-width="5.4375"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M59.8164 43.5V60.0703"
                    stroke="url(#paint0_linear_418_1525)"
                    stroke-width="5.4375"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M45.3164 43.4989V26.9258"
                    stroke="url(#paint1_linear_418_1525)"
                    stroke-width="5.4375"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <circle
                    cx="52.5664"
                    cy="43.5"
                    r="7.25"
                    stroke="#FF8D4E"
                    stroke-width="5.4375"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M52.5664 36.25H69.1366"
                    stroke="url(#paint2_linear_418_1525)"
                    stroke-width="5.4375"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M52.5683 50.75H35.9951"
                    stroke="url(#paint3_linear_418_1525)"
                    stroke-width="5.4375"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M52.564 61.625H52.561C42.5511 61.6242 34.4371 53.5091 34.4375 43.4992C34.4379 33.4894 42.5526 25.375 52.5625 25.375C62.5724 25.375 70.6871 33.4894 70.6875 43.4992C70.6879 53.5091 62.5739 61.6242 52.564 61.625"
                    stroke="#FFBF9B"
                    stroke-width="5.4375"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <defs>
                    <linearGradient
                      id="paint0_linear_418_1525"
                      x1="62.5"
                      y1="52"
                      x2="57.5"
                      y2="52"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="#FF8D4E" />
                      <stop offset="1" stop-color="#FF8D4E" stop-opacity="0" />
                    </linearGradient>
                    <linearGradient
                      id="paint1_linear_418_1525"
                      x1="48"
                      y1="35.4273"
                      x2="43"
                      y2="35.4272"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="#FF8D4E" />
                      <stop offset="1" stop-color="#FF8D4E" stop-opacity="0" />
                    </linearGradient>
                    <linearGradient
                      id="paint2_linear_418_1525"
                      x1="60.8515"
                      y1="34.4375"
                      x2="60.8515"
                      y2="38.0625"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="#FF8D4E" />
                      <stop offset="1" stop-color="#FF8D4E" stop-opacity="0" />
                    </linearGradient>
                    <linearGradient
                      id="paint3_linear_418_1525"
                      x1="44.2817"
                      y1="48.9375"
                      x2="44.2817"
                      y2="52.5625"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="#FF8D4E" />
                      <stop offset="1" stop-color="#FF8D4E" stop-opacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="87"
                  height="87"
                  viewBox="0 0 87 87"
                  fill="none"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M12.6875 14.5H70.6875C76.6936 14.5 81.5625 19.3689 81.5625 25.375V61.625C81.5625 67.6311 76.6936 72.5 70.6875 72.5H12.6875V14.5Z"
                    stroke="#727272"
                    stroke-width="5.4375"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M12.6875 76.125V14.5C12.6875 12.498 11.0645 10.875 9.0625 10.875H5.4375"
                    stroke="#727272"
                    stroke-width="5.4375"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M23.5625 29V58"
                    stroke="#727272"
                    stroke-width="5.4375"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M45.3164 43.4989V26.9258"
                    stroke="#ADADAD"
                    stroke-width="5.4375"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M59.8164 43.5V60.0703"
                    stroke="#ADADAD"
                    stroke-width="5.4375"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M52.5664 36.25H69.1366"
                    stroke="#ADADAD"
                    stroke-width="5.4375"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M52.5683 50.75H35.9951"
                    stroke="#ADADAD"
                    stroke-width="5.4375"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <circle
                    cx="52.5664"
                    cy="43.5"
                    r="7.25"
                    stroke="#ADADAD"
                    stroke-width="5.4375"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M52.564 61.625H52.561C42.5511 61.6242 34.4371 53.5091 34.4375 43.4992C34.4379 33.4894 42.5526 25.375 52.5625 25.375C62.5724 25.375 70.6871 33.4894 70.6875 43.4992C70.6879 53.5091 62.5739 61.6242 52.564 61.625"
                    stroke="#727272"
                    stroke-width="5.4375"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              )}
            </div>
            <div className="system-info">
              <div className="info">
                <span className="name">VRAM</span>
                <span className="value">{`${((gpu.used + gpu.total) / 1024).toFixed(2)} GB`}</span>
              </div>
              <div className="info">
                <span className="name">RAM</span>
                <span className="value">{`${((systemSpecs['ram'].used + systemSpecs['ram'].total) / 1024).toFixed(2)} GB`}</span>
              </div>
              <div className="info">
                <span className="name">CPU USAGE</span>
                <span className="value">{systemSpecs['cpu']}</span>
              </div>
            </div>
            <div className="button">
              {!isLend ? (
                <SecondaryButton text="Lend GPU" onClick={handleLend} />
              ) : (
                <SecondaryButton text="Stop Lending" onClick={handleWithdraw} />
              )}
            </div>
          </div>
        ))
      ) : (
        <h3>No GPU</h3>
      )}
    </>
  )
}

export default GpuNode
