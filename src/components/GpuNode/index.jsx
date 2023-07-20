import { Card, Button, Alert } from 'react-bootstrap'
import { useState } from 'react'
import { addGpuData } from '../../database/GpuData'
import { createAndStartDocker } from '../../services/dockerCreation'
import { addSshCredientials } from '../../database/sshData'
import { v4 as uuidv4 } from 'uuid';

const ID = uuidv4();

const IMAGE_NAME = `client_dk_${ID}`
const CONTAINER_IMAGE_NAME = `client_dk_container_${ID}`

const GpuNode = ({ systemSpecs }) => {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleLend = async () => {
    try {
      if (systemSpecs) {
        await addGpuData(systemSpecs)
        await createAndStartDocker(IMAGE_NAME, CONTAINER_IMAGE_NAME)
        await addSshCredientials()
        setShowSuccessMessage(true)
        setTimeout(() => setShowSuccessMessage(false), 5000)
      }
    } catch (err) {
      setErrorMessage('Lending failed. Please try again. Error: ' + err.message)
      setTimeout(() => setErrorMessage(''), 5000) // Clear error message after 5 seconds
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
          Lending success!
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
        <Button variant="secondary" onClick={handleLend}>
          Lend
        </Button>
      </Card>
    </>
  )
}

export default GpuNode
