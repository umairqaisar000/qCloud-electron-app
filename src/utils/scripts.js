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
      const ramUsage = ram.used / 1024 ** 2 // Convert to MB
      const ramFree = ram.available / 1024 ** 2
      const ramTotal = ram.total / 1024 ** 2
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
    region: 'us'
  })
  return url
}
