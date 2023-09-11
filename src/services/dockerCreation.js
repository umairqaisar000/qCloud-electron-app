const Docker = window.require('dockerode')
const { exec } = window.require('child_process')
const path = require('path');

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
  const currentDir = __dirname;
  console.log("current_directory:", currentDir);
  const dockerfilePath = path.join(currentDir, 'src', 'server', 'Dockerfile');
  console.log("dockerfilePath:", dockerfilePath);
  console.log('Creating Docker image...')
  try {
    await execShellCommand(
      `docker build --rm -t ${imageName} -f ${dockerfilePath}  .`
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


export async function stopAndDeleteContainer(imageName) {
  // Stop the container
  const stopCommand = `docker stop ${imageName}`;
  exec(stopCommand, (stopError, stopStdout, stopStderr) => {
    if (stopError) {
      console.error(`Error stopping the container: ${imageName}`);
      console.error(stopStderr);
    } else {
      console.log(`Container ${imageName} stopped successfully.`);

      // Delete the container
      const deleteContainerCommand = `docker rm ${imageName}`;
      exec(deleteContainerCommand, (deleteContainerError, deleteContainerStdout, deleteContainerStderr) => {
        if (deleteContainerError) {
          console.error(`Error deleting the container: ${imageName}`);
          console.error(deleteContainerStderr);
        } else {
          console.log(`Container ${imageName} deleted successfully.`);

          // Now that the container is deleted, you can delete the image
          const deleteImageCommand = `docker rmi ${imageName}`;
          exec(deleteImageCommand, (deleteImageError, deleteImageStdout, deleteImageStderr) => {
            if (deleteImageError) {
              console.error(`Error deleting the image: ${imageName}`);
              console.error(deleteImageStderr);
            } else {
              console.log(`Image ${imageName} deleted successfully.`);
            }
          });
        }
      });
    }
  });
}

export async function stopContainer(imageName) {
  // Stop the container
  const stopCommand = `docker stop ${imageName}`;
  exec(stopCommand, (stopError, stopStdout, stopStderr) => {
    if (stopError) {
      console.error(`Error stopping the container: ${imageName}`);
      console.error(stopStderr);
    } else {
      console.log(`Container ${imageName} stopped successfully.`);
    }
  });
}

export async function containerExistsWithName(containerName) {
  try {
    const { stdout, stderr } = await execShellCommand(`docker ps -a --filter "name=${containerName}" --format "{{.ID}}"`);
  //  const containerId = stdout.toString().trim(); // Convert stdout to string and trim whitespace
    console.log("Containerr Exists Container ID: " ,stdout);
    return stdout !== undefined; // If there is any output, the container exists
  } catch (error) {
    console.error(`Error checking container existence: ${error.message}`);
    return false; // Handle the error appropriately
  }
}

export async function isContainerRunning(containerName) {
  try {
    // Use docker inspect to get detailed information about the container
    const { stdout, stderr } = await exec(`docker inspect --format="{{.State.Status}}" ${containerName}`);
    const containerStatus = stdout.toString().trim();

    if (containerStatus.toLowerCase() === "running") {
      console.log("Container Status: " + containerStatus);
      return true;
    } else {
      console.log("Container Status: " + containerStatus);
      return false;
    }
  } catch (error) {
    console.error(`Error checking container status: ${error.message}`);
    return false; // Handle the error appropriately
  }
}

export async function startContainer(containerName) {
  try {
    await exec(`docker start ${containerName}`);
    console.log(`Container ${containerName} started successfully.`);
  } catch (error) {
    console.error(`Error starting container: ${error.message}`);
    // Handle the error appropriately
  }
}





