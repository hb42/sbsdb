import { Injectable } from "@angular/core";
import { ArbeitsplatzService } from "../ap/arbeitsplatz.service";
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
  constructor(private ap: ArbeitsplatzService, private hw: HwService) {}
}
