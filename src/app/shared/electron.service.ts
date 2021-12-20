import { Injectable } from "@angular/core";
import { Arbeitsplatz } from "./model/arbeitsplatz";

// im electron-Startscript (bzw. im preload) wird 'electron' als globale Variable definiert:
//   contextBridge.exposeInMainWorld("electron", { a: () => doSomething, ... });
//
interface LocalApi {
  test(msg: string): void;
  version(): string;
  exec(job: string, ap: Arbeitsplatz): void;
}

/**
 * Verbindung zur electron runtime
 *
 */
@Injectable({ providedIn: "root" })
export class ElectronService {
  private readonly electron: LocalApi;

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
      this.electron = window["electron"] as LocalApi;
    } else {
      this.electron = null;
    }
    console.debug("c'tor ElectronService");
    if (this.isElectron) {
      console.log("Running on electron runtime " + this.electronVersion);
      this.electron.test("calling sbsdb-local");
    }
  }

  public exec(job: string, ap: Arbeitsplatz) {
    if (this.isElectron) {
      this.electron.exec(job, ap);
    } else {
      console.error("Electron call while on browser. AP=" + ap.apname + ", Job=" + job);
    }
  }
}
