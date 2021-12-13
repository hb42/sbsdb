// Preload (Isolated World)
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  doThing: () => ipcRenderer.send("do-a-thing"),
  test: (msg) => console.log("Message from renderer: " + msg),
  version: () => process.versions.electron,
});
