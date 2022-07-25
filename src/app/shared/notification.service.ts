import { EventEmitter, Injectable } from "@angular/core";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { EditApkategorieTransport } from "../admin/edit-apkategorie-dialog/edit-apkategorie-transport";
import { EditAptypTransport } from "../admin/edit-aptyp-dialog/edit-aptyp-transport";
import { EditHwtypTransport } from "../admin/edit-hwtyp-dialog/edit-hwtyp-transport";
import { EditTagtypTransport } from "../admin/edit-tagtyp-dialog/edit-tagtyp-transport";
import { ConfigService } from "./config/config.service";
import { AddHwTransport } from "./model/add-hw-transport";
import { ApTransport } from "./model/ap-transport";
import { HwKonfig } from "./model/hw-konfig";
import { HwTransport } from "./model/hw-transport";
import { EditAdresseTransport } from "../admin/edit-adresse-dialog/edit-adresse-transport";
import { EditOeTransport } from "../admin/edit-oe-dialog/edit-oe-transport";
import { EditVlanTransport } from "../admin/edit-vlan-dialog/edit-vlan-transport";

@Injectable({
  providedIn: "root",
})
export class NotificationService {
  public apChange: EventEmitter<ApTransport> = new EventEmitter<ApTransport>();
  public hwChange: EventEmitter<HwTransport> = new EventEmitter<HwTransport>();
  public addHw: EventEmitter<AddHwTransport> = new EventEmitter<AddHwTransport>();
  public konfigChange: EventEmitter<HwKonfig> = new EventEmitter<HwKonfig>();
  public extprogChange: EventEmitter<void> = new EventEmitter<void>();
  public apkategorieChange: EventEmitter<EditApkategorieTransport> =
    new EventEmitter<EditApkategorieTransport>();
  public aptypChange: EventEmitter<EditAptypTransport> = new EventEmitter<EditAptypTransport>();
  public oeChange: EventEmitter<EditOeTransport> = new EventEmitter<EditOeTransport>();
  public adresseChange: EventEmitter<EditAdresseTransport> =
    new EventEmitter<EditAdresseTransport>();
  public hwtypChange: EventEmitter<EditHwtypTransport> = new EventEmitter<EditHwtypTransport>();
  public vlanChange: EventEmitter<EditVlanTransport> = new EventEmitter<EditVlanTransport>();
  public tagtypChange: EventEmitter<EditTagtypTransport> = new EventEmitter<EditTagtypTransport>();
  private hubConnection: HubConnection | undefined;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private checkTimer: NodeJS.Timeout;

  constructor(public configService: ConfigService) {
    console.debug("c'tor NotificationService");
    // this.initialize();
  }

  public initialize(): void {
    console.debug("## initialize notifications");
    try {
      this.stopConnection();

      // TODO die Strings sollten aus der Config kommen
      this.hubConnection = new HubConnectionBuilder()
        .withUrl(this.configService.webservice + "/notification")
        // .configureLogging(LogLevel.Information)
        .build();

      this.hubConnection.on("apchange", (data: ApTransport) => {
        console.debug("## Event apchange");
        console.dir(data);
        this.apChange.emit(data);
      });

      this.hubConnection.on("hwchange", (data: HwTransport) => {
        console.debug("## Event hwchange");
        console.dir(data);
        this.hwChange.emit(data);
      });

      this.hubConnection.on("addhw", (data: AddHwTransport) => {
        console.debug("## Event addhw");
        console.dir(data);
        this.addHw.emit(data);
      });

      this.hubConnection.on("konfigchange", (data: HwKonfig) => {
        console.debug("## Event konfigchange");
        console.dir(data);
        this.konfigChange.emit(data);
      });

      this.hubConnection.on("extprogchange", () => {
        console.debug("## Event extprogchange");
        this.extprogChange.emit();
      });

      this.hubConnection.on("apkategoriechange", (data: EditApkategorieTransport) => {
        console.debug("## Event apkategoriechange");
        this.apkategorieChange.emit(data);
      });

      this.hubConnection.on("aptypchange", (data: EditAptypTransport) => {
        console.debug("## Event aptypchange");
        this.aptypChange.emit(data);
      });

      this.hubConnection.on("oechange", (data: EditOeTransport) => {
        console.debug("## Event oechange");
        this.oeChange.emit(data);
      });

      this.hubConnection.on("adressechange", (data: EditAdresseTransport) => {
        console.debug("## Event adressechange");
        this.adresseChange.emit(data);
      });

      this.hubConnection.on("hwtypchange", (data: EditHwtypTransport) => {
        console.debug("## Event hwtypchange");
        this.hwtypChange.emit(data);
      });

      this.hubConnection.on("vlanchange", (data: EditVlanTransport) => {
        console.debug("## Event vlanchange");
        this.vlanChange.emit(data);
      });

      this.hubConnection.on("tagtypchange", (data: EditTagtypTransport) => {
        console.debug("## Event tagtypchange");
        this.tagtypChange.emit(data);
      });

      this.hubConnection.onclose((err: Error) => {
        console.debug("## Notification has been closed: " + err.message);
        setTimeout(() => this.initialize(), 100);
      });
    } catch (e) {
      // catch all network errors and retry in a minute
    }

    void this.hubConnection
      .start()
      .then((data: never) => {
        console.debug("## Now connected to NotificationHub");
        console.log(data);
      })
      .catch((error: never) => {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        console.error("Could not connect to NotificationHub:");
        console.dir(error);
        // macht Probleme, wenn der Server weg ist
        //   setTimeout(() => this.initialize(), 1000);
        // TODO Errorhandling f. Serverfehler
      });

    // jede Minute Verbindung testen (die Abfrage des Status scheint zu verhindern, dass
    //                                der websocket nach 20 Min. vom IIS geschlosssen wird)
    if (this.checkTimer) {
      clearTimeout(this.checkTimer);
    }
    this.checkTimer = setInterval(() => {
      try {
        if (!this.isOpen()) {
          console.debug(
            "## Check: Notification not open - state: " + this.hubConnection?.state?.toString()
          );
          setTimeout(() => this.initialize(), 100);
        }
      } catch (e) {
        // ignore error, just retry in a minute
      }
    }, 60000);
  }

  public isOpen(): boolean {
    return this.hubConnection?.state?.toString() === "Connected";
  }

  private stopConnection(): void {
    if (this.hubConnection) {
      void this.hubConnection.stop();
      this.hubConnection = null;
    }
  }
}
