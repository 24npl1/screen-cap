import { app, BrowserWindow, ipcMain, IpcMainEvent } from 'electron'
declare const MAIN_WINDOW_WEBPACK_ENTRY: string
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string


if (require('electron-squirrel-startup')) {
  app.quit()
}

let mainWindow: BrowserWindow | null = null
let toolbarWindow: BrowserWindow | null = null

const createWindow = (): void => {
  mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    transparent: true,
    simpleFullscreen: true,
    frame: false,
    hasShadow: false,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  mainWindow.setAlwaysOnTop(true, 'screen-saver')
  mainWindow.setVisibleOnAllWorkspaces(true)

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)

  ipcMain.removeAllListeners('minimize-window')
  ipcMain.removeAllListeners('close-window')
  ipcMain.removeAllListeners('toggle-toolbar')
  ipcMain.removeAllListeners('toggle-passthrough')


  ipcMain.on('minimize-window', () => {
    if (mainWindow != null) mainWindow.minimize()
    if (toolbarWindow != null) toolbarWindow.minimize()
  })

  ipcMain.on('close-window', () => {
    if (mainWindow != null) mainWindow.close()
    if (toolbarWindow != null) toolbarWindow.close()
  })

  ipcMain.on('toggle-toolbar', (_, visible: boolean) => {
    if (mainWindow != null) {
      mainWindow.setAlwaysOnTop(!visible)
    }
  })

  ipcMain.on('toggle-passthrough', (_, enabled: boolean) => {
    if (mainWindow != null) {
      if (enabled) {
        if (toolbarWindow == null) {
          toolbarWindow = new BrowserWindow({
            width: mainWindow.getBounds().width,
            height: 48, // toolbar height
            x: mainWindow.getBounds().x,
            y: mainWindow.getBounds().y,
            transparent: true,
            frame: false,
            hasShadow: false,
            alwaysOnTop: true,
            webPreferences: {
              preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
              contextIsolation: true,
              nodeIntegration: false,
            },
          })
          toolbarWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY + '#toolbar')
          
          toolbarWindow.setIgnoreMouseEvents(false)
        }

        mainWindow.setIgnoreMouseEvents(true, { forward: true })
        mainWindow.blur()
      } else {
        if (toolbarWindow != null) {
          toolbarWindow.close()
          toolbarWindow = null
        }

        mainWindow.setIgnoreMouseEvents(false)
        mainWindow.focus()
        mainWindow.setAlwaysOnTop(true, 'screen-saver')
      }
    }
  })

  mainWindow.on('closed', () => {
    ipcMain.removeAllListeners('minimize-window')
    ipcMain.removeAllListeners('close-window')
    ipcMain.removeAllListeners('toggle-toolbar')
    ipcMain.removeAllListeners('toggle-passthrough')
    if (toolbarWindow != null) {
      toolbarWindow.close()
      toolbarWindow = null
    }
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
