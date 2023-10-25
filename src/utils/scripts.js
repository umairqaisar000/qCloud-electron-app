const os = window.require('os')
const ngrok = window.require('ngrok')
const si = window.require('systeminformation')
//const getmac = require('getmac');
const { exec } = window.require('child_process')


// const { ipcRenderer } = window.require('electron');

export const getSystemSpecs = async () => {
  try {
    const [gpuMemoryInfo, cpuUsageInfo, ramMemoryInfo, macAddress, cpuSerialId] = await Promise.all([
      getGPUMemoryInfo(),
      getCPUUsage(),
      getRAMUsage(),
      getMacAddress(),
      getCpuID()
    ])
    console.log('Ram Memory Information:', ramMemoryInfo)
    console.log('MAC address Information:', macAddress)
    console.log("CPU Serial ID:", cpuSerialId)
    return {
      gpu: gpuMemoryInfo,
      cpu: `${cpuUsageInfo}%`,
      ram: ramMemoryInfo,
      mac: macAddress,
      cpuId: cpuSerialId
    }
  } catch (error) {
    console.error('Error retrieving system specs:', error)
    return null
  }
}

export const execShellCommand = cmd => {
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

const getGPUMemoryInfo = () => {
  const command =
    'nvidia-smi --query-gpu=index,name,memory.free,memory.used,memory.total --format=csv,noheader,nounits'

  return execShellCommand(command)
    .then(result => {
      const memoryInfo = result.trim().split('\n')
      const gpuInfoList = []

      for (const gpuInfo of memoryInfo) {
        console.log('Gpu info:', gpuInfo)
        const [index, name, free, used, total] = gpuInfo.split(', ')
        gpuInfoList.push({
          index: parseInt(index), // Parse GPU index
          name,
          free: parseInt(free),
          used: parseInt(used),
          total: parseInt(total)
        })
      }

      return gpuInfoList
    })
    .catch(error => {
      return []
    })
}
const getCPUUsage = () => {
  const cpus = os.cpus()
  console.log('Cpus available:', cpus)
  let idleMs = 0
  let totalMs = 0

  for (const cpu of cpus) {
    for (const time in cpu.times) {
      totalMs += cpu.times[time]
    }

    idleMs += cpu.times.idle
  }

  const percentage = (1 - idleMs / totalMs) * 100
  return parseFloat(percentage.toFixed(2))
}

const getRAMUsage = () => {
  return si
    .mem()
    .then(ram => {
      console.log('RAM usage:', ram)
      const ramUsage = ram.used / 1024 ** 3 // Convert to MB
      console.log('used RAM: ', ramUsage)
      const ramFree = ram.free / 1024 ** 3
      console.log('free RAM: ' + ramFree)
      const ramTotal = ram.total / 1024 ** 3
      console.log('total RAM: ' + ramTotal)
      return {
        free: parseInt(ramFree),
        used: parseInt(ramUsage),
        total: parseInt(ramTotal)
      }
    })
    .catch(error => {
      console.error('Error while getting RAM usage:')
      console.error(error)
      return { free: 0, used: 0, total: 0 }
    })
}

export const getNgrokUrl = async () => {
  // const authToken = await ipcRenderer.invoke('get-ngrok-auth-token');
  // console.log('Auth token: ' , authToken)
  const userData = JSON.parse(localStorage.getItem('userData'));  // Retrieve and parse userData from localStorage
  const authToken = userData ? userData.ngrok_token : null;
  console.log("The auth token in getNgrokUrl: " , authToken);
  if (!authToken) {
    throw new Error('Ngrok Auth Token not set.');
  }
  else{
    const url = await ngrok.connect({
      proto: 'tcp',
      addr: 2222,
      authtoken: authToken,
      region: 'us',
      binPath: path => path.replace('app.asar', 'app.asar.unpacked'),
    })
  
    return url
  }
}

// export const getLocalTunnelUrl = async () => {
//   try {
//     console.log('In local tunnel to get the url')
//     const tunnel = await localtunnel({ port: 2222 })
//     console.log('tunnel:', tunnel)
//     const url = tunnel.url

//     // Add event listeners for more diagnostics
//     tunnel.on('error', err => {
//       console.error('Tunnel error:', err)
//     })

//     tunnel.on('close', () => {
//       console.log('LocalTunnel connection closed.')
//     })

//     return url
//   } catch (error) {
//     console.error('Error establishing localtunnel:', error)
//   }
// }

// export const getMacAddress = async () => {
//   return new Promise((resolve, reject) => {
//     const command = "ip addr show $(awk 'NR==3{print $1}' /proc/net/wireless | tr -d :) | awk '/ether/{print $2}'";
    
//     exec(command, (error, stdout, stderr) => {
//       if (error) {
//         reject(error);
//         return;
//       }
  
//       const macAddress = stdout.trim();
//       resolve(macAddress);
//     });
//   })
//   .then(macAddress => {
//     if (typeof macAddress === 'string') {
//       console.log('MAC Address:', macAddress);
//     } else {
//       console.error('Error:', macAddress);
//     }
//     return macAddress; // Pass the result through
//   })
//   .catch(error => {
//     console.error('Error:', error);
//     return error;
//   });
// };

export const getCpuID = async () => {
  return new Promise((resolve, reject) => {
    const command = `cpuid | grep 'processor serial number' | awk '{sub(/=/, "", $5); print $5}' | head -n2`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
     
      const cpuSerialId = stdout.trim();
      resolve(cpuSerialId );
    });
  })
  .then(cpuSerialId  => {
    if (typeof cpuSerialId  === 'string') {
      console.log('Cpu Serail Address:', cpuSerialId );
    } else {
      console.error('Error:', cpuSerialId );
    }
    return cpuSerialId; // Pass the result through
  })
  .catch(error => {
    console.error('Error:', error);
    return error;
  });
};

export const getMacAddress = async () => {
  return new Promise((resolve, reject) => {
    // Check for wireless interface
    const wirelessCommand = "ip addr show $(awk 'NR==3{print $1}' /proc/net/wireless | tr -d :) | awk '/ether/{print $2}'";
    exec(wirelessCommand, (wirelessError, wirelessStdout, wirelessStderr) => {
      if (!wirelessError && wirelessStdout.trim()) {
        const wirelessMacAddress = wirelessStdout.trim();
        resolve(wirelessMacAddress);
      } else {
        // Wireless not found, check for ethernet
        const ethernetCommand = "ip -o link | awk '($2 ~ /^en/ || $2 ~ /^eth/) {print $(NF-2)}'";
        exec(ethernetCommand, (ethernetError, ethernetStdout, ethernetStderr) => {
          if (ethernetError) {
            reject(ethernetError);
            return;
          }
  
          const ethernetMacAddress = ethernetStdout.trim();
          resolve(ethernetMacAddress);
        });
      }
    });
  })
  .then(macAddress => {
    if (typeof macAddress === 'string') {
      console.log('MAC Address:', macAddress);
    } else {
      console.error('Error:', macAddress);
    }
    return macAddress; // Pass the result through
  })
  .catch(error => {
    console.error('Error:', error);
    return error;
  });
};


