import { EventEmitter, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ConfigService } from "../shared/config/config.service";
import { UserSession } from "../shared/config/user.session";
import { DataService } from "../shared/data.service";
import { EditAptypTransport } from "./edit-aptyp-dialog/edit-aptyp-transport";
import { EditExtprogTransport } from "./edit-extprog-dialog/edit-extprog-transport";

@Injectable({
  providedIn: "root",
})
export class AdminService {
  public userSettings: UserSession;
  public loading = false;

  public disableMainMenuButtons = true;
  public newRecordEvent: EventEmitter<void> = new EventEmitter<void>();
  public exportEvent: EventEmitter<void> = new EventEmitter<void>();
  public debugEvent: EventEmitter<void> = new EventEmitter<void>();
  public newRecordLabel = "Neuen Datensatz anlegen.";

  constructor(public configService: ConfigService, public dataService: DataService) {
    console.debug("c'tor AdminService");
    this.userSettings = configService.getUser();

    this.loading = !this.dataService.isDataReady();
    if (this.loading) {
      this.dataService.dataReady.subscribe(() => {
        this.loading = false;
      });
    }
  }

  public changeDebugState(): void {
    this.userSettings.debug = !this.userSettings.debug;
    this.debugEvent.emit();
  }

  public getTcLogs(): Observable<unknown> {
    return this.dataService.get(this.dataService.importTcLogUrl, { responseType: "text" });
  }

  public saveExtprog(data: EditExtprogTransport): void {
    console.debug("save extprog data");
    console.dir(data);
    if (data.outChg || data.outDel || data.outNew) {
      this.dataService.post(this.dataService.changeExtprogUrl, data);
    }
  }

  public saveAptyp(data: EditAptypTransport): void {
    console.debug("save aptyp data");
    console.dir(data);
    this.dataService.post(this.dataService.changeAptypUrl, data);
  }
}
