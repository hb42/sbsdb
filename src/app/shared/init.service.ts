import { Injectable } from "@angular/core";
import { ApService } from "../ap/ap.service";
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
  constructor(private ap: ApService, private hw: HwService) {}
}
