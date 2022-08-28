import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { ApService } from "../ap/ap.service";
import { ConfService } from "../conf/conf.service";
import { HwService } from "../hw/hw.service";

/**
 * Init-Service
 *
 * Der Service dient nur dazu alle Services, die fruehzeitig gebraucht werden,
 * z.B. um Daten vom Server zu holen, moeglichst frueh gestartet werden. Dazu
 * wird dieser Dienst in AppComponent als Abhaengigkeit eingetragen.
 *
 */
@Injectable({
  providedIn: "root",
})
export class InitService {
  constructor(private ap: ApService, private hw: HwService, private conf: ConfService) {
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
  }
}
