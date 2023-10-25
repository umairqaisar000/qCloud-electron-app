//import {getContainerNameFromDb} from '../database/sshData';
//import {getCpuID,getMacAddress } from '../utils/scripts';
const Docker = window.require('dockerode')
const { exec } = window.require('child_process')
const path = require('path')
const { app } = window.require('electron').remote
const appPath = app.getAppPath()
//const docker = new Docker()

// const redis = window.require('ioredis')
// const redisHost = 'localhost' // Replace with the hostname or IP address of your Redis server
// const redisPort = 6379 // Replace with the port number your Redis server is listening on

// const client = redis.createClient({
//   host: redisHost,
//   port: redisPort,
//   db: 1
// })

// Test the Redis connection
// client.on('connect', () => {
//   console.log('Connected to Redis server')
// })

// client.on('error', err => {
//   console.error('Error connecting to Redis:', err)
// })

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

// // Function to set the container name in Redis
// export const setContainerNameInRedis = containerName => {
//   console.log('Here to set the container name in Redis')
//   return new Promise((resolve, reject) => {
//     client.set('containerName', containerName, (err, reply) => {
//       console.log('Here to set the container name in Redis2222222222222')
//       if (err) {
//         console.error('Error setting container name in Redis:', err)
//         reject(err)
//       } else {
//         console.log('Container name set in Redis:', reply)
//         resolve(reply)
//       }
//     })
//   })
// }

// // Function to get the container name from Redis
// export const getContainerNameFromRedis = () => {
//   return new Promise((resolve, reject) => {
//     client.get('containerName', (err, reply) => {
//       if (err) {
//         console.error('Error getting container name from Redis:', err)
//         reject(err)
//       } else {
//         console.log('Container name retrieved from Redis:', reply)
//         resolve(reply)
//       }
//     })
//   })
// }

export async function createAndStartDocker(imageName, container_image_name) {
  const PORT = 2222
  // const currentDir = path.dirname(require.main.filename)
  const currentDir = __dirname

  console.log('current_directory:', currentDir)

  console.log('appPath: ', appPath)
  console.log('app', app)
  const unpackedPath = path.join(path.dirname(appPath), 'app.asar.unpacked')
  console.log('unpackedPath: ', unpackedPath)
  const dockerfilePath = path.join(unpackedPath, 'src', 'server', 'Dockerfile');
  const contextPath = path.join(unpackedPath, 'src', 'server')
  
  // const dockerfilePath =
  //   '/home/shireen/Desktop/qcloud1.0/qCloud-electron-app/src/server/Dockerfile'

  const buildContext = path.join(currentDir, 'src')

  console.log('dockerfilePath:', dockerfilePath)
  console.log('buildContext:', buildContext)

  console.log('Container Name: ', container_image_name)

  try {
    console.log("Running the new container in createAndStartDocker");
    // const checkExistingImages = await execShellCommand('docker images -q')
    // console.log('checkExistingImages:', checkExistingImages)
    // const checkExistingContainers = await execShellCommand('docker ps -a -q')
    // console.log('checkExistingContainers:', checkExistingContainers)

         await stopContainerByPort(PORT)

    //   if(checkExistingImages && checkExistingContainers){
    //     console.log('Stopping all containers...');
    //     await execShellCommand('docker stop $(docker ps -aq)');

    //     console.log('Removing all containers...');
    //     await execShellCommand('docker rm $(docker ps -aq)');

    //     console.log('Removing all images...');
    //     await execShellCommand('docker rmi -f $(docker images -q)');

    //     console.log('Creating Docker image...')
    //   }
    //  else{
    //     console.log("No images found");
    //  }

    await execShellCommand(
      // `docker build --rm -t ${imageName} -f ${dockerfilePath} .`
      // `docker build --rm -t ${imageName} -f ${dockerfilePath}  .`
      `docker build --rm -t ${imageName} -f ${dockerfilePath} ${contextPath}`
    )
  } catch (error) {
    alert(error)
    console.error('Error Creating Docker image:', error)
    throw 'Error Creating Docker image'
  }

  console.log('Running Docker container...')
  await runDockerContainer(imageName);

}
export async function runDockerContainer(imageName) {
    try {
     await waitForContainerToStart(imageName)
    execShellCommand(
      // `docker run -d --privileged --name ${imageName} ${imageName} -p 2222:22 docker:dind`
      `docker run --privileged --gpus all -d -p 2222:22 --name ${imageName} ${imageName} `

      // `docker run -d -p 2222:22 --name ${imageName} ${imageName}`
      // `docker run -p ${PORT}:22 --name ${container_image_name} ${imageName}:latest`
    )
    console.log('docker container run.....')
   
  } catch (error) {
    alert(error)
    console.error('Error running Docker container:', error)
    throw 'Error running Docker container'
  }
}

export async function deleteContainer(imageName){
  try {
    console.log('Deleting Docker container...')
    await execShellCommand(`docker rm -f ${imageName}`)
    console.log(`Container ${imageName} deleted successfully.`)
  } catch (error) {
    console.error(`Error deleting container: ${error.message}`)
    // Handle the error appropriately
  }
}

export async function stopAndDeleteContainer(imageName) {
  // Stop the container
  const stopCommand = `docker stop ${imageName}`
  execShellCommand(stopCommand, (stopError, stopStdout, stopStderr) => {
    if (stopError) {
      console.error(`Error stopping the container: ${imageName}`)
      console.error(stopStderr)
    } else {
      console.log(`Container ${imageName} stopped successfully.`)

      // Delete the container
      const deleteContainerCommand = `docker rm ${imageName}`
      execShellCommand(
        deleteContainerCommand,
        (
          deleteContainerError,
          deleteContainerStdout,
          deleteContainerStderr
        ) => {
          if (deleteContainerError) {
            console.error(`Error deleting the container: ${imageName}`)
            console.error(deleteContainerStderr)
          } else {
            console.log(`Container ${imageName} deleted successfully.`)

            // Now that the container is deleted, you can delete the image
            const deleteImageCommand = `docker rmi ${imageName}`
            execShellCommand(
              deleteImageCommand,
              (deleteImageError, deleteImageStdout, deleteImageStderr) => {
                if (deleteImageError) {
                  console.error(`Error deleting the image: ${imageName}`)
                  console.error(deleteImageStderr)
                } else {
                  console.log(`Image ${imageName} deleted successfully.`)
                }
              }
            )
          }
        }
      )
    }
  })
}

export async function stopContainer(containerName) {
  try {
    // Check if the container is already stopped
    const isRunning = await isContainerRunning(containerName);
    console.log('Is Running in stop Container', isRunning)
    if (isRunning) {
      // const containerId = await execShellCommand(
      //   `docker ps -aqf "name=${containerName}"`
      // )
     //console.log('Container Id is: ', containerId)
      console.log('Stopping the container in Stop Container:', containerName)
     
   //   console.log("Container Name trimmed: ", containerName)
      // if (originalName !==  containerName2) {
      //   console.log('Extra spaces were found and removed.')
      // }
      await execShellCommand(`docker stop ${containerName}`)
      console.log(`Container ${containerName} stopped successfully.`)
      await deleteContainer(containerName)
    } else {
      console.log(`Container ${containerName} is already stopped.`)
    }
  } catch (error) {
    console.error(`Error stopping container: ${error.message}`)
    // Handle the error appropriately
  }
}

export async function containerExistsWithName(containerName) {
  try {
    const { stdout, stderr } = await execShellCommand(
      `docker ps -a --filter "name=${containerName}" --format "{{.ID}}"`
    )
    //  const containerId = stdout.toString().trim(); // Convert stdout to string and trim whitespace
    console.log('Containerr Exists Container ID: ', stdout)
    return stdout !== undefined // If there is any output, the container exists
  } catch (error) {
    console.error(`Error checking container existence: ${error.message}`)
    return false // Handle the error appropriately
  }
}

export async function isContainerRunning(containerName) {
  try {
    console.log("Container Name in isContainerRunning",containerName);
    const stdout = await execShellCommand(
      `docker inspect --format='{{.State.Status}}' ${containerName}`
    );   
    // if (stderr) {
    //   console.error(`Error checking container status: ${stderr}`);
    //   return false;
    // }
    console.log('Container Status:',stdout);
    const containerStatus = stdout.trim();
    console.log(`Container Status: ${containerStatus}`);
  
    if (containerStatus.toLowerCase() === 'running') {
      console.log('Container Status: ' + containerStatus)
      return true
    } else {
      console.log('Container Status: ' + containerStatus)
      return false
    }
  } catch (error) {
    console.error(`Error checking container status: ${error.message}`)
    return false // Handle the error appropriately
  }
}

export async function startContainer(containerName) {
  try {
    await runDockerContainer(containerName);
   // await execShellCommand(`docker start ${containerName}`)
    console.log(`Container ${containerName} started successfully.`)
  } catch (error) {
    console.error(`Error starting container: ${error.message}`)
    // Handle the error appropriately
  }
}

export async function startDockerContainer(containerName) {
  try {
    await runDockerContainer(containerName);
    await execShellCommand(
      `docker start ${containerName}`
    )
    console.log(`Container ${containerName} started successfully.`)
  } catch (error) {
    console.error(`Error starting container: ${error.message}`)
    // Handle the error appropriately
  }
}

// export async function stopContainerByPort(port) {
//   try {
//     console.log('Here to stop container by port')
//     const containers = await docker.listContainers({ all: true })
//     console.log('Container: ', containers)

//     for (const containerInfo of containers) {
//       const container = docker.getContainer(containerInfo.Id)
//       console.log("Container's Id: ", containerInfo.Id)
//       console.log('Container by id: ', container)
//       const containerInspect = await container.inspect()
//       console.log('Container Inspect: ', containerInspect)
//       // Check if the container is already stopped
//       if (containerInspect.State.Status !== 'exited') {
//         // Check if the container is running and exposing the specified port
//         const containerPorts = containerInspect.NetworkSettings.Ports
//         console.log('Container Ports:', containerPorts)
//         console.log('Container Ports tcp:', containerPorts[`${port}/tcp`])
//         for (const mapping of Object.values(containerPorts)) {
//           if (mapping && mapping.length > 0) {
//             for (const portMapping of mapping) {
//               console.log('Port Mapping: ', portMapping)
//               if (
//                 containerInspect.State.Running &&
//                 containerPorts &&
//                 portMapping.HostPort === port.toString()
//               ) {
//                 console.log(`Stopping container ${containerInspect.Name}...`)
//                 await container.stop()
//                 // await stopAndDeleteContainer(containerInspect.Name);
//                 console.log(`Container ${containerInspect.Name} stopped.`)
//               }
//             }
//           }
//         }
//       } else {
//         console.log(`Container ${containerInspect.Name} is already stopped.`)
//       }
//     }
//   } catch (error) {
//     console.error('Error stopping container:', error)
//   }
// }

async function waitForContainerToStart(
  containerName,
  maxAttempts = 8,
  interval = 2000
) {
  let attempts = 0
  while (attempts < maxAttempts) {
    // const isRunning = await isContainerRunning(containerName)
    // if (isRunning) {
    //   console.log(`Container ${containerName} is running.`)
    //   return
    // }
    attempts++
    console.log(
      `Waiting for ${containerName} to start (Attempt ${attempts} of ${maxAttempts})...`
    )
    await new Promise(resolve => setTimeout(resolve, interval))
   }
  // console.error(
  //   `Container ${containerName} did not start after ${maxAttempts} attempts.`
  // )
}

// export async function stopContainerByPort(port) {
//   try {
//     const macAddress = await getMacAddress();
//     const cpuId= await getCpuID();
//    // const storedContainerName = await getContainerNameFromDb(macAddress,cpuId)
//    // console.log('Container name retrieved from Db in stopContainerByPort:', storedContainerName)
//     console.log('Here to stop container by port');
//     const containers = await docker.listContainers({ all: true });
//     console.log("Containers List in stopContainerByPort:", containers);
//     // Use Promise.all to stop containers concurrently
//     const promises = containers.map(async (containerInfo) => {
//       console.log("Conatiners Info:",containerInfo);
//       const container = docker.getContainer(containerInfo.Id);
//       console.log("Container from docker in stopContainerByPort:", container)
//       console.log("Container's Id: ", containerInfo.Id);
      
//       const containerInspect = await container.inspect();
//       console.log('Container Inspect: ', containerInspect);

//       if (containerInspect.State.Status !== 'exited') {
//         const containerPorts = containerInspect.NetworkSettings.Ports;
//         console.log('Container Ports:', containerPorts);
//         console.log('Container Ports tcp:', containerPorts[`${port}/tcp`]);
//         const containerName = containerInspect.Name.slice(1);
//         for (const mapping of Object.values(containerPorts)) {
//           if (mapping && mapping.length > 0) {
//             for (const portMapping of mapping) {
//               console.log('Port Mapping: ', portMapping);
//               if (
//                 containerInspect.State.Running &&
//                 portMapping.HostPort === port.toString()
//              //   && containerName !== storedContainerName
//               ) {
//                 console.log(`Stopping container ${containerInspect.Name}...`);
//                 alert("There is already a container running on port 2222 stop it and then retry lending.")
//                 await stopContainerByPort(port);
//                 console.log(`Container ${containerInspect.Name} stopped.`);
//               }
//             }
//           }
//         }
//       } 
//       else {
//         console.log(`Container ${containerInspect.Name} is already stopped.`);
//       }
//     });

//     // Wait for all containers to be processed
//     await Promise.all(promises);
//   } catch (error) {
//     console.error('Error stopping containers:', error);
//   }
// }



async function stopContainerByPort(port) {
  try {
    // Use the 'docker ps' command to list running containers and filter by port
    
    const listContainersCommand = `docker ps --filter "publish=${port}" --format "{{.ID}}"`;
    const runningContainersOnPort = await execShellCommand(listContainersCommand);
    console.log("The running container:",runningContainersOnPort)

    // if (stderr) {
    //   console.error(`Error listing containers: ${stderr}`);
    //   return;
    // }

    if (runningContainersOnPort) {
   //   const containerIds = runningContainersOnPort.trim().split('\n');
      alert("There is already a container running on port 2222 stop it and then retry lending.")
      await stopContainerByPort(port);

      // for (const containerId of containerIds) {
      //   // Stop each container
      //   const stopCommand = `docker stop ${containerId}`;
      //   const stopResult = await execShellCommand(stopCommand);

      //   if (stopResult instanceof Error) {
      //     console.error(`Error stopping container ${containerId}: ${stopResult.message}`);
      //   } else {
      //     console.log(`Container ${containerId} stopped successfully.`);
      //   }
      // }

    } else {
      console.log(`No containers found running on port ${port}.`);
    }
  } catch (error) {
    console.error('Error stopping containers:', error);
  }
}

