const { app, BrowserWindow, Tray, Menu, dialog } = require('electron')
const path = require('path')
const isDev = require('electron-is-dev')
const { exec } = require('child_process');

let tray
let win

require('@electron/remote/main').initialize()


function performPreInstallationChecks() {
  // Check if Docker is installed
  exec('docker --version', (dockerError, dockerStdout, dockerStderr) => {
    if (dockerError) {
      // Docker is not installed
      dialog.showErrorBox(
        'Missing Dependency',
        'Docker is not installed. Please follow these instructions to install it:\n\n1. Go to https://www.docker.com/get-started and download Docker.\n2. Install Docker by following the installation instructions for your platform.\n3. Once Docker is installed, restart this app.'
      );
    } else {
      // Docker is installed, check for ngrok or other dependencies
      exec('ngrok --version', (ngrokError, ngrokStdout, ngrokStderr) => {
        if (ngrokError) {
          // ngrok is not installed
          dialog.showErrorBox(
            'Missing Dependency',
            'ngrok is not installed. Please follow these instructions to install it:\n\n1. Go to https://ngrok.com/download and download ngrok for your platform.\n2. Install ngrok by following the installation instructions.\n3. Once ngrok is installed, restart this app.'
          );
        } else {
          // Both dependencies are installed, create the main window
          createWindow();
        }
      });
    }
  });
}

function createWindow() {
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

  win.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  )
  

  win.on('close', event => {
    event.preventDefault()
    win.hide()
  })
}

app.on('ready', () => {
  performPreInstallationChecks();
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
})


// app.on('before-quit', () => {
//   tray.destroy();
// });

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
