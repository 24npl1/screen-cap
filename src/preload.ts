import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),
  toggleToolbar: (visible: boolean) => ipcRenderer.send('toggle-toolbar', visible),
  togglePassthrough: (enabled: boolean) => ipcRenderer.send('toggle-passthrough', enabled),
})
