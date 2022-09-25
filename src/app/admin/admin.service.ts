import { EventEmitter, Injectable, TemplateRef } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { ADM_PATH } from "../const";
import { ConfigService } from "../shared/config/config.service";
import { UserSession } from "../shared/config/user.session";
import { DataService } from "../shared/data.service";
import { NavigationService } from "../shared/navigation.service";
import { EditAdresseTransport } from "./edit-adresse-dialog/edit-adresse-transport";
import { EditApkategorieTransport } from "./edit-apkategorie-dialog/edit-apkategorie-transport";
import { EditAptypTransport } from "./edit-aptyp-dialog/edit-aptyp-transport";
import { EditExtprogTransport } from "./edit-extprog-dialog/edit-extprog-transport";
import { EditHwtypTransport } from "./edit-hwtyp-dialog/edit-hwtyp-transport";
import { EditOeTransport } from "./edit-oe-dialog/edit-oe-transport";
import { EditTagtypTransport } from "./edit-tagtyp-dialog/edit-tagtyp-transport";
import { EditVlanTransport } from "./edit-vlan-dialog/edit-vlan-transport";

@Injectable({
  providedIn: "root",
})
export class AdminService {
  public userSettings: UserSession;
  public loading = false;

  public disableMainMenuNewButton = true;
  public disableMainMenuCsvButton = true;
  public newRecordEvent: EventEmitter<void> = new EventEmitter<void>();
  public exportEvent: EventEmitter<void> = new EventEmitter<void>();
  public debugEvent: EventEmitter<void> = new EventEmitter<void>();
  public currentChild = "";

  public get infoPanel(): TemplateRef<never> {
    return this.infopanel;
  }
  public set infoPanel(tpl: TemplateRef<never>) {
    setTimeout(() => (this.infopanel = tpl), 0);
  }
  private infopanel: TemplateRef<never>;

  constructor(
    public configService: ConfigService,
    public dataService: DataService,
    private navigationService: NavigationService
  ) {
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
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

  public openChildPage(child: string) {
    const path = ["/" + ADM_PATH];
    if (child) {
      this.userSettings.adminPath = child;
      this.currentChild = child;
      path.push(child);
    }
    this.navigationService.navigateByCmd(path);
  }

  public getTcLogs(): Observable<unknown> {
    return this.dataService.get(this.dataService.importTcLogUrl, { responseType: "text" });
  }

  public saveExtprog(data: EditExtprogTransport): void {
    if (data.outChg || data.outDel || data.outNew) {
      this.dataService.post(this.dataService.changeExtprogUrl, data);
    }
  }

  public saveApkategorie(data: EditApkategorieTransport): void {
    this.dataService.post(this.dataService.changeApKatUrl, data);
  }

  public saveAptyp(data: EditAptypTransport): void {
    this.dataService.post(this.dataService.changeAptypUrl, data);
  }

  public saveTagtyp(data: EditTagtypTransport): void {
    this.dataService.post(this.dataService.changeTagtypUrl, data);
  }

  public saveOe(data: EditOeTransport): void {
    this.dataService.post(this.dataService.changeOeUrl, data);
  }

  public saveAdresse(data: EditAdresseTransport): void {
    this.dataService.post(this.dataService.changeAdresseUrl, data);
  }

  public saveHwtyp(data: EditHwtypTransport): void {
    this.dataService.post(this.dataService.changeHwtypUrl, data);
  }

  public saveVlan(data: EditVlanTransport): void {
    this.dataService.post(this.dataService.changeVlanUrl, data);
  }
}
