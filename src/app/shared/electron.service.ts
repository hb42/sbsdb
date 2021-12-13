import { Injectable } from "@angular/core";

// im electron-Startscript (bzw. im preload) wird 'electron' als globale Variable definiert:
//   contextBridge.exposeInMainWorld("electron", { a: () => doSomething, ... });
//
interface Electron {
  test: (msg: string) => void;
  version: () => string;
}

/**
 * Verbindung zur electron runtime
 *
 */
@Injectable({ providedIn: "root" })
export class ElectronService {
  private readonly electron: Electron;

  get isElectron(): boolean {
    return !!this.electron;
  }
  get electronVersion(): string {
    if (this.isElectron) {
      return this.electron.version();
    } else {
      return null;
    }
  }

  constructor() {
    if (window["electron"]) {
      this.electron = window["electron"] as Electron;
    } else {
      this.electron = null;
    }
    console.debug("c'tor ElectronService");
    if (this.isElectron) {
      console.log("Running on electron runtime " + this.electronVersion);
    }
  }
}
