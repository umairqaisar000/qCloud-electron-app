const Docker = window.require('dockerode')
const { exec } = window.require('child_process')

const docker = new Docker()

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

export async function createAndStartDocker(imageName, container_image_name) {
  const PORT = 2222

  console.log('Creating Docker image...')
  try {
    await execShellCommand(
      `docker build --rm -t ${imageName} -f /home/shireen/Desktop/qcloud1.0/qCloud-electron-app/src/server/Dockerfile .`
    )
  } catch (error) {
    console.error('Error Creating Docker image:', error)
    throw 'Error Creating Docker image'
  }

  console.log('Running Docker container...')
  try {
    execShellCommand(
      `docker run -d -p 2222:22 --name ${imageName} ${imageName}`
      // `docker run -p ${PORT}:22 --name ${container_image_name} ${imageName}:latest`
    )
  } catch (error) {
    console.error('Error running Docker container:', error)
    throw 'Error running Docker container'
  }
}



export function stopAndDeleteContainer(imageName) {
  // Stop the container
  const stopCommand = `docker stop ${imageName}`;
  exec(stopCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error stopping the container: ${imageName}`);
      console.error(stderr);
    } else {
      console.log(`Container ${imageName} stopped successfully.`);
      // Delete the container
      const deleteCommand = `docker rm ${imageName}`;
      exec(deleteCommand, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error deleting the container: ${imageName}`);
          console.error(stderr);
        } else {
          console.log(`Container ${imageName} deleted successfully.`);
        }
      });
    }
  });
}