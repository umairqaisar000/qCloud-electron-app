const Docker = window.require('dockerode')
const { exec } = window.require('child_process')


const docker = new Docker()
var RUNNING_CONTAINER = false

const execShellCommand = cmd => {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(error)
      } else {
        resolve(stdout || stderr)
      }
    })
  })
}

async function createAndStartDocker(imageName, container_image_name) {
  const PORT = 2222

  if (RUNNING_CONTAINER) {
    console.log('Container already running, please stop it first.')
    return {
      status:
        'Container already running. Please stop it by calling the docker_stop endpoint.'
    }
  }

  console.log('Creating Docker image...')

  try {
    await execShellCommand(
      `docker build --rm -t ${imageName} -f src/server/Dockerfile .`
    )
  } catch (error) {
    console.error('Error Creating Docker image:', error)
    return {
      status: 'Error Creating Docker image'
    }
  }

  RUNNING_CONTAINER = true

  console.log('Running Docker container...')
  try {
    execShellCommand(
      `docker run -d -p 2222:22 --name ${imageName} ${imageName}`
      // `docker run -p ${PORT}:22 --name ${container_image_name} ${imageName}:latest`
    )
  } catch (error) {
    console.error('Error running Docker container:', error)
    RUNNING_CONTAINER = false
    return {
      status: 'Error running Docker container'
    }
  }
}

module.exports = {
  createAndStartDocker
}
