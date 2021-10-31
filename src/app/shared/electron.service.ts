import { Injectable } from "@angular/core";

/**
 * Verbindung zur electron runtime
 *
 *  Verwendung:
 *  <pre>
 *   public testElectron(electronService.ipcRenderer) {
 *     console.info("### sync reply " + ipcRenderer.sendSync("synchronous-message", "ping"));
 *
 *     ipcRenderer.on("asynchronous-reply", (event, arg) => {
 *       console.info("### async reply " + arg);
 *     });
 *     ipcRenderer.send("asynchronous-message", "ping");
 *   }
 * </pre>
 */
@Injectable({ providedIn: "root" })
export class ElectronService {
  private readonly ipcRenderer: never;

  get isElectron(): boolean {
    return typeof this.ipcRenderer !== "undefined";
  }
  get electronVersion(): string {
    if (this.isElectron) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return this.ipcRenderer["sendSync"]("get-version", "") as string;
    } else {
      return null;
    }
  }

  constructor() {
    console.debug("c'tor ElectronService");
    /*
     electron mit window.require holen, das wird nicht von webpack ueberschrieben. Dadurch
     ignoriert webpack electron und packt es nicht in vendor.js. Ausserdem wird so die vorhandene
     electron-Runtime verwendet. window.require ist nur in einer node/electron-Umgebung vorhanden.
     -> {@link https://github.com/electron/electron/issues/7300#issuecomment-248773783}
     */
    if (typeof window["require"] === "function") {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const electron: never = window["require"]("electron") as never;
      if (electron) {
        this.ipcRenderer = electron["ipcRenderer"];
      }
    }
    if (this.isElectron) {
      console.log("Running on electron runtime " + this.electronVersion);
      // console.dir(process.versions);
    }
  }

  public send(event: string, arg: string): void {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.ipcRenderer["send"](event, arg);
  }
}
