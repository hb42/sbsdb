import { Injectable } from "@angular/core";
import { DataService } from "../shared/data.service";
import { HwKonfig } from "../ap/model/hw-konfig";
import { Hardware } from "../ap/model/hardware";
import { ConfigService } from "../shared/config/config.service";

@Injectable({
  providedIn: "root",
})
export class HwService {
  constructor(public dataService: DataService, private configService: ConfigService) {
    console.debug("c'tor HwService ");
    setTimeout(() => {
      this.init();
    }, 0);
  }

  private init(): void {
    const readyCheck = () => {
      if (
        this.dataService.isApListFetched() &&
        this.dataService.isBstListReady() &&
        this.dataService.isHwKonfigListReady() &&
        this.dataService.isHwListReady()
      ) {
        // alle relevanten Listen sind da: HwKonfig in HW eintragen
        // und HW in AP eintragen
        this.prepareData();
        // apList ist damit komplett (stoesst dataService.dataReady an)
        this.dataService.apListReady.emit();
      }
    };
    this.dataService.bstListReady.subscribe(readyCheck);
    this.dataService.hwKonfigListReady.subscribe(readyCheck);
    this.dataService.hwListReady.subscribe(readyCheck);
    this.dataService.apListFetched.subscribe(readyCheck);
    // fetch KW-Konfig-Table + HW-Table
    void this.fetchData();
  }

  private async fetchData(): Promise<void> {
    this.dataService.get(this.dataService.allHwKonfig).subscribe(
      (hwk: HwKonfig[]) => {
        console.debug("fetch HwKonfig size=", hwk.length);
        this.dataService.hwKonfigList = hwk;
      },
      (err) => {
        console.error("ERROR loading HwKonfig-Data ", err);
      },
      () => {
        this.dataService.hwKonfigListReady.emit();
      }
    );
    const pageSize =
      Number(await this.configService.getConfig(ConfigService.AP_PAGE_SIZE)) ??
      DataService.defaultpageSize;
    // Anzahl der Datensaetze
    const recs = (await this.dataService.get(this.dataService.countHwUrl).toPromise()) as number;
    // zu holende Seiten
    const count = Math.ceil(recs / pageSize);
    let fetched = 0;
    for (let page = 0; page < count; page++) {
      this.dataService.get(`${this.dataService.pageHwUrl}${page}/${pageSize}`).subscribe(
        (hw: Hardware[]) => {
          console.debug("fetch HW page #", page, " size=", hw.length);
          this.dataService.hwList = [...this.dataService.hwList, ...hw];
        },
        (err) => {
          console.error("ERROR loading HW-Data ", err);
        },
        () => {
          fetched++;
          if (fetched === count) {
            console.debug("fetch HW READY");
            this.dataService.hwListReady.emit();
          }
        }
      );
    }
  }

  private prepareData(): void {
    this.dataService.hwList.forEach((hw) => {
      let macsearch = "";
      hw.hwKonfig = this.dataService.hwKonfigList.find((h) => h.id === hw.hwKonfigId);
      hw.ipStr = "";
      hw.macStr = "";
      hw.vlanStr = "";
      if (hw.vlans && hw.vlans[0]) {
        hw.vlans.forEach((v) => {
          const dhcp = v.ip === 0 ? " (DHCP)" : "";
          if (hw.ipStr) {
            hw.ipStr += "/ " + this.dataService.getIpString(v.vlan + v.ip) + dhcp;
          } else {
            hw.ipStr = this.dataService.getIpString(v.vlan + v.ip) + dhcp;
          }
          if (hw.macStr) {
            hw.macStr += "/ " + this.dataService.getMacString(v.mac);
          } else {
            hw.macStr = this.dataService.getMacString(v.mac);
          }
          if (hw.vlanStr) {
            hw.vlanStr += "/ " + v.bezeichnung;
          } else {
            hw.vlanStr = v.bezeichnung;
          }
          macsearch += v.mac;
        });
      }

      if (hw.apId) {
        const ap = this.dataService.apList.find((a) => a.apId === hw.apId);
        if (ap) {
          ap.hw.push(hw);
          ap.macsearch = macsearch;
          if (hw.pri) {
            if (hw.hwKonfig.hwTypFlag !== DataService.FREMDE_HW_FLAG) {
              ap.hwTypStr = hw.hwKonfig.hersteller + " - " + hw.hwKonfig.bezeichnung;
            }
            ap.hwStr =
              hw.hwKonfig.hersteller +
              " - " +
              hw.hwKonfig.bezeichnung +
              (hw.sernr && hw.hwKonfig.hwTypFlag !== DataService.FREMDE_HW_FLAG
                ? " [" + hw.sernr + "]"
                : "");
            ap.ipStr = hw.ipStr;
            ap.macStr = hw.macStr;
            ap.vlanStr = hw.vlanStr;
          } else {
            // fuer die Suche in sonstiger HW
            ap.sonstHwStr +=
              " " +
              hw.hwKonfig.hersteller +
              " " +
              hw.hwKonfig.bezeichnung +
              (hw.sernr && hw.hwKonfig.hwTypFlag !== DataService.FREMDE_HW_FLAG
                ? " " + hw.sernr
                : "");
          }
        }
      }
    });
    this.dataService.apList.forEach((ap) => {
      ap.hw.sort((a, b) => {
        if (a.pri) {
          return -1;
        } else if (b.pri) {
          return 1;
        } else {
          return this.dataService.collator.compare(
            a.hwKonfig.hwTypBezeichnung + a.hwKonfig.hersteller + a.hwKonfig.bezeichnung + a.sernr,
            b.hwKonfig.hwTypBezeichnung + b.hwKonfig.hersteller + b.hwKonfig.bezeichnung + b.sernr
          );
        }
      });
    });
  }
}
