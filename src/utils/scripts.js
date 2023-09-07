const os = window.require('os')
const ngrok = window.require('ngrok')
const si = window.require('systeminformation')
const { exec } = window.require('child_process')

export const getSystemSpecs = async () => {
  try {
    const [gpuMemoryInfo, cpuUsageInfo, ramMemoryInfo] = await Promise.all([
      getGPUMemoryInfo(),
      getCPUUsage(),
      getRAMUsage()
    ])
    console.log('Ram Memory Information:', ramMemoryInfo);
    return {
      gpu: gpuMemoryInfo,
      cpu: `${cpuUsageInfo}%`,
      ram: ramMemoryInfo
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
        console.log("Gpu info:", gpuInfo);
        const [index, name, free, used, total] = gpuInfo.split(', ')
        gpuInfoList.push({
          index: parseInt(index), // Parse GPU index
          name,
          free: parseInt(free),
          used: parseInt(used),
          total: parseInt(total)
        })
      }

      return gpuInfoList;
    })
    .catch(error => {
      return []
    })
}
const getCPUUsage = () => {
  const cpus = os.cpus()
 console.log("Cpus available:",cpus);
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
      console.log("RAM usage:",ram)
      const ramUsage = ram.used / 1024 ** 3 // Convert to MB
      console.log("used RAM: ",ramUsage);
      const ramFree = ram.free / 1024 ** 3
      console.log("free RAM: " + ramFree);
      const ramTotal = ram.total / 1024 ** 3
      console.log("total RAM: " + ramTotal);
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
  const url = await ngrok.connect({
    proto: 'tcp',
    addr: 2222,
    authtoken: '2SkN5WEvYetwQVt4gLkqiQ5S0Av_4Ly9WjG4inH7wa6F1jvMq',
    region: 'us',
    binPath: path => path.replace('app.asar', 'app.asar.unpacked'),
  })
  
  return url
}
