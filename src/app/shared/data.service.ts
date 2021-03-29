import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Betrst } from "../ap/model/betrst";
import { Arbeitsplatz } from "../ap/model/arbeitsplatz";
import { Hardware } from "../ap/model/hardware";

@Injectable({
              providedIn: "root"
            })
export class DataService {
  public apList: Arbeitsplatz[] = [];
  public apListReady = false;
  public bstList: Betrst[] = [];
  public bstListReady = false;
  public hwList: Hardware[] = [];
  public hwListReady = true; // TODO auf *false* ändern, soblad HW-List implementiert
  // public hwKonfigList: HwKonfig[] = [];
  public hwKonfigListReady = true; // TODO auf *false* ändern, soblad HW-KonfigList implementiert

  // TODO das Laden der Daten sollte hier zentral getriggert werden. Momentan funktioniert
  //      das nur, weil apService (-> fn initTable) in HeadComponent als Abhaengigkeit
  //      eingetragen ist und damit apDataService und dataService mit hochzieht, soblad
  //      der Header geladen wird.
  //      Abhaengigkeiten gehen in Gegenrichtung! Evtl. Service, der "ganz unten" steht,
  //      und alle relevanten Services injected und wiederum in AppComponent eingetragen
  //      wird. Von hier gehen nur Events.

  constructor(private http: HttpClient) {
    console.debug("c'tor DataService");
  }

  public get(url: string): Observable<unknown> {
    return this.http.get(url);
  }

  public isDataReady(): boolean {
    return this.apListReady && this.bstListReady && this.hwListReady && this.hwKonfigListReady;
  }
}
