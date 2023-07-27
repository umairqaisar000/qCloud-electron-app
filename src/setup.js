const { exec } = require('child_process');
const os = require('os');

function installDockerUbuntu() {
  return new Promise((resolve, reject) => {
    console.log('Installing Docker on Ubuntu...');
    exec('sudo apt-get update && \
     sudo apt-get install ca-certificates curl gnupg && \
      sudo install -m 0755 -d /etc/apt/keyrings &&  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg && \
       sudo chmod a+r /etc/apt/keyrings/docker.gpg && \
       sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin', (error, stdout, stderr) => {
      if (error) {
        console.error('Failed to install Docker on Ubuntu:', error.message);
        reject(error);
      } else {
        console.log('Docker installed successfully on Ubuntu.');
        resolve();
      }
    });
  });
}

function installNvidiaSmiUbuntu() {
  return new Promise((resolve, reject) => {
    console.log('Installing NVIDIA drivers and nvidia-smi on Ubuntu...');
    exec('sudo apt-get update && sudo apt-get install -y nvidia-utils', (error, stdout, stderr) => {
      if (error) {
        console.error('Failed to install NVIDIA drivers on Ubuntu:', error.message);
        reject(error);
      } else {
        console.log('NVIDIA drivers and nvidia-smi installed successfully on Ubuntu.');
        resolve();
      }
    });
  });
}

function installNvidiaSmiMacOS() {
  return new Promise((resolve, reject) => {
    console.log('Installing nvidia-smi on macOS...');
    exec('/usr/local/bin/brew install nvidia-smi', (error, stdout, stderr) => {
      if (error) {
        console.error('Failed to install nvidia-smi on macOS:', error.message);
        reject(error);
      } else {
        console.log('nvidia-smi installed successfully on macOS.');
        resolve();
      }
    });
  });
}

async function setup() {
  try {
    if (os.platform() === 'linux') {
      // Detect Ubuntu and install Docker and NVIDIA drivers
    //   await installDockerUbuntu();
    //   await installNvidiaSmiUbuntu();
    } else if (os.platform() === 'darwin') {
      // macOS - Install NVIDIA drivers
      await installNvidiaSmiMacOS();
    } else {
      console.log('Unsupported platform:', os.platform());
    }
  } catch (error) {
    console.error('Error during setup:', error.message);
  }
}

setup();
