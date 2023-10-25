const { app, BrowserWindow, Tray, Menu, dialog, ipcMain } = require('electron')
const path = require('path')
const isDev = require('electron-is-dev')
const { exec } = require('child_process')
const Store = require('electron-store')
const { string } = require('yup')
const prompt = require('electron-prompt')
  

// const store = new Store()

// store.set('ngrokAuthToken', '');
// let ngrokAuthToken = '';

let tray
let win

require('@electron/remote/main').initialize()

function performPreInstallationChecks() {
  console.log("Installation checks performed")
  // Check if Docker is installed
  exec('docker --version', (dockerError, dockerStdout, dockerStderr) => {
    if (dockerError) {
      // Docker is not installed
      dialog.showErrorBox(
        'Missing Dependency',
        'Docker is not installed. Please follow these instructions to install it:\n\n1. Go to https://www.docker.com/get-started and download Docker.\n2. Install Docker by following the installation instructions for your platform.\n3. Once Docker is installed, restart this app.'
      )
    } else {
      // Docker is installed, check for ngrok or other dependencies
      exec('ngrok --version', (ngrokError, ngrokStdout, ngrokStderr) => {
        if (ngrokError) {
          // ngrok is not installed
          dialog.showErrorBox(
            'Missing Dependency',
            'ngrok is not installed. Please follow these instructions to install it:\n\n1. Go to https://ngrok.com/download and download ngrok for your platform.\n2. Install ngrok by following the installation instructions.\n3. Once ngrok is installed, restart this app.'
          )
        } else {
          exec('cpuid --version', (cpuIdError, cpuIdStdout, cpuIdStderr) => {
            if (cpuIdError) {
              // cpuId is not installed
              dialog.showErrorBox(
                'Missing Dependency',
                'CpuId is not installed. Please follow these instructions to install it:\n\n1. Go to https://zoomadmin.com/HowToInstall/UbuntuPackage/cpuid\n2. Install cpuid by following the installation command sudo apt-get install -y cpuid.\n3. Once cpuid is installed, restart this app.'
              )
            } else {
              exec('nvidia-container-cli --version', (nvidiaError, nvidiaStdout, nvidiaStderr) => {
                if (nvidiaError) {
                  // cpuId is not installed
                  dialog.showErrorBox(
                    'Missing Dependency',
                    'nvidia-container-toolkit is not installed. Please follow these instructions to install it:\n\n1. Go to https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html\n2.Dont forget to restart docker daemon by: systemctl restart docker.\n3. Once nvidia-container-toolkit is installed, restart this app.'
                  )
                } else {
                  // All dependencies are installed, create the main window
                  createWindow()
                }
              })
            }
          })
        }
      })
    }
  })
}

function createWindow() {
  console.log("In create Window")
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: __dirname + '/logo.png',
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false
    }
  })
  console.log("In create Window2")
  win.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  )
  console.log("In create Window3")
  win.on('close', event => {
    event.preventDefault()
    win.hide()
  })
  console.log("In create Window4")
  win.webContents.on('devtools-opened', () => {
    console.log('DevTools opened!')
  })
  console.log("In create Window5")
  // win.webContents.openDevTools()
}

app.on('ready', () => {

  // ngrokAuthToken = store.get('ngrokAuthToken');
  
  // console.log('Auth token : ' + ngrokAuthToken);

  // if (!ngrokAuthToken || ngrokAuthToken.trim() === "") {
    // Prompt user for the authToken
    // prompt({
    //   title: 'Enter Auth Token',
    //   label: 'AuthToken:',
    //   value: '',
    //   inputAttrs: { type: 'text' },
    //   type: 'input'
    // })
    // .then(r => {
    //   if (r !== null && r.trim() !== "") {
    //     store.set('ngrokAuthToken', r);
    //     ngrokAuthToken = r; // Update the variable
    //     console.log("Ngrok Auth Token in Prompt: ", ngrokAuthToken);
    //     performPreInstallationChecks();
    //   } else {
    //     // User cancelled or entered an empty string.
    //     // Handle accordingly, e.g., show a message or close the app
    //     app.quit();
    //   }
    // })
    // .catch(console.error);
  // } 
  // else {
    // If token is already there (for some reason, though it shouldn't be according to your requirements)
    performPreInstallationChecks();
  // }
  

  tray = new Tray(path.join(__dirname, '/cloud-computing.png'))

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: () => {
        win.show()
      }
    },
    {
      label: 'Quit',
      click: () => {
        tray.destroy()
        // If in development mode, quit directly
        if (isDev) {
          app.quit()
        } else {
          // For production mode, ensure all windows are closed before quitting
          if (!win.isDestroyed()) {
            win.destroy()
          }
        }
      }
    }
  ])

  tray.setToolTip('QCloud')
  tray.setContextMenu(contextMenu)

  tray.on('click', () => {
    win.isVisible() ? win.hide() : win.show()
  })
  ipcMain.handle('get-ngrok-auth-token', event => {
    return store.get('ngrokAuthToken')
  })
})

// app.on('before-quit', () => {
//   tray.destroy();
// });

// Quit when all windows are closed.
// app.on('window-all-closed', function () {
//   // On OS X it is common for applications and their menu bar
//   // to stay active until the user quits explicitly with Cmd + Q
//   if (process.platform !== 'darwin') {
//     app.quit()
//   }
// })
app.on('window-all-closed', (event) => {
  event.preventDefault();
  // prevent default behavior (quit app)
  // if (process.platform !== 'darwin') {
  //   app.quit()
  // }
});
app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
