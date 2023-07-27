import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid';
import { Card, Button, Alert } from 'react-bootstrap'

import { addGpuData, removeGpuData } from '../../database/GpuData'
import { removeSshCredientials } from '../../database/sshData'

import { createAndStartDocker, stopAndDeleteContainer } from '../../services/dockerCreation'
import { execShellCommand } from '../../utils/scripts';

const ngrok = window.require('ngrok')

const ID = uuidv4();

const IMAGE_NAME = `client_dk_${ID}`
const CONTAINER_IMAGE_NAME = `client_dk_container_${ID}`

const GpuNode = ({ systemSpecs,isRunning }) => {
  const [errorMessage, setErrorMessage] = useState('')
  const [isLend, setIsLend] = useState(isRunning)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  const handleLend = async () => {
    try {
      if (systemSpecs) {
        await createAndStartDocker(IMAGE_NAME, CONTAINER_IMAGE_NAME)
        const image_id = await execShellCommand(`docker images -q ${IMAGE_NAME}`)
        const user_id = JSON.parse(localStorage.getItem('userData')).id
        console.log(user_id,image_id)
        await addGpuData(systemSpecs, user_id, image_id)
        setShowSuccessMessage(true)
        setIsLend(true);
        setTimeout(() => setShowSuccessMessage(false), 5000)
      }
    } catch (err) {
      setErrorMessage('Lending failed. Please try again. Error: ' + err.message)
      setTimeout(() => setErrorMessage(err), 5000) // Clear error message after 5 seconds
      console.log(err)
    }
  }
  
  const handleWithdraw = async () => {
    try {
      await removeSshCredientials();
      await removeGpuData();
      await stopAndDeleteContainer(IMAGE_NAME)
      await ngrok.disconnect();
      setIsLend(false)
    } catch (err) {
      setErrorMessage('Withdrawal failed. Please try again. Error: ' + err.message)
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
          {!isLend ? "Withdrawn success!" : "Lending success!"}
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
      <Card className="p-5 bg-dark text-light mt-4">
        {systemSpecs['gpu'] !== undefined ? (
          systemSpecs['gpu']?.length >= 0 &&
          systemSpecs['gpu']?.map((gpu, i) => (
            <>
              <h3>{`GPU: ${gpu.name}`}</h3>
              <div>
                {`Free: ${gpu.free} MB`}
                <br></br>
                {`Used: ${gpu.used} MB`}
                <br></br>
                {`Total: ${gpu.total} MB`}
              </div>
            </>
          ))
        ) : (
          <h3>No GPU</h3>
        )}
        <h3>VRAM</h3>
        <p>
          {`Free: ${systemSpecs['ram'].free} MB`}
          <br></br>
          {`Used: ${systemSpecs['ram'].used} MB`}
        </p>
        <h3>{`CPU: ${systemSpecs['cpu']}`}</h3>
        {!isLend ?
        <Button variant="secondary" onClick={handleLend}>
          Lend
        </Button> : <Button variant="light" onClick={handleWithdraw}>
          Withdraw
        </Button>}
      </Card>
    </>
  )
}

export default GpuNode
