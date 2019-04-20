/**
 * electron Start-Script
 *
 * stdout mit electron ist problematisch, da electron nur zu console und
 * nicht auf stdout ausgibt. Dieses Verhelten laesst sich aendern indem
 * folgende Umgebungsvaribale gesetzt wird:
 *   set ELECTRON_NO_ATTACH_CONSOLE=true
 * Wenn electron allerdings via "start xxx.exe" aufgerufen wird funktioniert
 * das nicht (die pipe mit ^ escapen hilft auch nicht).
 *
 * Da der Aufruf von einem Netzlaufwerk sehr langsam sein kann, waere es nuetzlich,
 * die Umgebung zu informieren, wenn die Anwendung soweit ist. Dies wird realisiert,
 * indem electron als zweiter Parameter ein Dateiname uebergeben wird. Wenn die
 * Anwendung per IPC-event "app-ready" Bereitschaft meldet wird die Datei angelegt.
 * Das laesst sich recht einfach per Batch-Script abfragen.
 *
 */
 
const electron = require("electron");
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const session = electron.session;
const ipcMain = electron.ipcMain;

const windowStateKeeper = require("electron-window-state");

const path = require("path");
const url = require("url");
const fs = require("fs");

// Kommandozeile
//   - command line param[1] "dev" startet die Entwicklertools mit der Anwendung
const development = process.argv[1] === "dev";
//   - command line param[2] uebergibt den Dateinamen fuer die Protokollierung
//     des Anwendungsstarts
const checkfile = process.argv[2];

const menuTemplate = [
  {
    label: 'Datei',
    submenu: [
      // Standard-Reload funktioniert nicht mit Angular-App
      {label: 'Neu laden',
        click: function(){ startApp() },
        accelerator: process.platform !== "darwin" ? "F5" : "Cmd+R"
	  },
      {type: 'separator'},
      {role: 'quit', label: "Datei-Archiv beenden"},
    ]
  },
  {
	  // default accelerators funktionieren nicht -> im Menue ausblenden
    label: 'Fenster',
    submenu: [
      {role: 'minimize', label: "Minimieren", accelerator: ""},
      {type: 'separator'},
      {role: 'resetzoom', label: "Originalgröße", accelerator: ""},
      {role: 'zoomin', label: "Vergrößern", accelerator: ""},
      {role: 'zoomout', label: "Verkleinern", accelerator: ""},
      {type: 'separator'},
	  {label: "Entwicklertools",
	   click: () => mainWindow.webContents.openDevTools(),
       accelerator: process.platform !== "darwin" ? "Shift+Ctrl+I" : "Alt+Cmd+I",
	   //visible: development,
	  },
    ]
  }
]

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

const startApp = function() {
	console.log("start app");
  // Tell Electron where to load the entry point from
  mainWindow.loadURL(url.format({ pathname: path.join(__dirname, 'index.html'),
                                  protocol: 'file:',
                                  slashes: true
                                }));
};

const createWindow = function() {

  // Test
  // ipcMain.on('asynchronous-message', function(event, arg) {
  //   console.log("async msg " + arg);
  //   event.sender.send('asynchronous-reply', 'pong')
  // })
  //
  // ipcMain.on('synchronous-message', function(event, arg) {
  //   console.log("sync msg " + arg);
  //   event.returnValue = 'pong'
  // })

  ipcMain.on("reload-app", function(event, arg) {
    console.log("APP RELOAD " + arg);
    startApp();
  });

  ipcMain.on("get-version", function(event, arg) {
    event.returnValue = process.versions.electron;
  });

  ipcMain.on("app-ready", function(event, arg) {
    if (checkfile) {
      fs.writeFile(checkfile, "app-ready", function(err) {
        if(err) {
          console.log(err);
        }
      });
    }
  });


   // Load the previous window state with fallback to defaults
  var mainWindowState = windowStateKeeper({
    defaultWidth: 1200,
    defaultHeight: 900
  });

  // Initialize the window to our specified dimensions
  mainWindow = new BrowserWindow({
    'x': mainWindowState.x,
    'y': mainWindowState.y,
    'width': mainWindowState.width,
    'height': mainWindowState.height,
    "icon": "favicon.ico",
    "autoHideMenuBar": true, 
    "webPreferences": {
      "devTools": true
    }
  });

  // Let us register listeners on the window, so we can update the state
  // automatically (the listeners will be removed when the window is closed)
  // and restore the maximized or full screen state
  mainWindowState.manage(mainWindow);

  startApp();

  // Clear out the main window when the app is closed
  mainWindow.on('closed', function () {
    mainWindow = null;
  });

}

app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  // if (process.platform != 'darwin') {
    app.quit();
  // }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function () {

  createWindow();
     
  const menu = electron.Menu.buildFromTemplate(menuTemplate);
  electron.Menu.setApplicationMenu(menu);

  if (development) {
    mainWindow.webContents.openDevTools();
  }
});
