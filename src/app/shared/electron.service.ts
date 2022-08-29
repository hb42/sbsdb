import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { ElectronRc } from "./electron-rc";
import { Arbeitsplatz } from "./model/arbeitsplatz";
import { ExtProg } from "./model/ext-prog";

// im electron-Startscript (bzw. im preload) wird 'electron' als globale Variable definiert:
//   contextBridge.exposeInMainWorld("electron", { a: () => doSomething, ... });
//
interface LocalApi {
  test(msg: string): void;
  version(): string[]; // #0: electron runtime, #1: local app
  exec(job: string, param: string, ap: Arbeitsplatz): Promise<ElectronRc>;
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
  get electronRuntimeVersion(): string {
    if (this.isElectron) {
      return this.electron.version()[0];
    } else {
      return null;
    }
  }
  get electronAppVersion(): string {
    if (this.isElectron) {
      return this.electron.version()[1];
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
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
    if (this.isElectron) {
      console.log("Running on electron runtime " + this.electronRuntimeVersion);
    }
  }

  public async exec(job: ExtProg, ap: Arbeitsplatz): Promise<ElectronRc | null> {
    if (this.isElectron) {
      const result = await this.electron.exec(job.program, job.param, ap);
      if (!environment.production)
        console.log("electron.exec ended rc=" + result.rc.toString() + ", msg=" + result.info);
      if (result.rc > 0) {
        return result;
      } else {
        return null;
      }
    } else {
      // should not happen
      console.error("Electron call while on browser. AP=" + ap.apname + ", Job=" + job.program);
      return { rc: 3, info: "Fehler: das funktioniert nur in der Standalone-Anwendung" };
    }
  }
}
