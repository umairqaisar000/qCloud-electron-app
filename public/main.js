const { app, BrowserWindow, Tray, Menu } = require('electron')
const path = require('path')
const isDev = require('electron-is-dev')

let tray
let win

require('@electron/remote/main').initialize()

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
  createWindow()
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
