import { EventEmitter, Injectable } from "@angular/core";
import { ConfigService } from "../shared/config/config.service";
import { UserSession } from "../shared/config/user.session";
import { DataService } from "../shared/data.service";

@Injectable({
  providedIn: "root",
})
export class AdminService {
  public userSettings: UserSession;
  public loading = false;

  public disableMainMenuButtons = true;
  public newRecordEvent: EventEmitter<void> = new EventEmitter<void>();
  public exportEvent: EventEmitter<void> = new EventEmitter<void>();
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
}
