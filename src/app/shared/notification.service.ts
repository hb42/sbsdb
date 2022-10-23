import { EventEmitter, Injectable } from "@angular/core";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { environment } from "../../environments/environment";
import { EditAdresseTransport } from "../admin/edit-adresse-dialog/edit-adresse-transport";
import { EditApkategorieTransport } from "../admin/edit-apkategorie-dialog/edit-apkategorie-transport";
import { EditAptypTransport } from "../admin/edit-aptyp-dialog/edit-aptyp-transport";
import { EditHwtypTransport } from "../admin/edit-hwtyp-dialog/edit-hwtyp-transport";
import { EditOeTransport } from "../admin/edit-oe-dialog/edit-oe-transport";
import { EditTagtypTransport } from "../admin/edit-tagtyp-dialog/edit-tagtyp-transport";
import { EditVlanTransport } from "../admin/edit-vlan-dialog/edit-vlan-transport";
import { ConfigService } from "./config/config.service";
import { AddHwTransport } from "./model/add-hw-transport";
import { ApTransport } from "./model/ap-transport";
import { HwKonfig } from "./model/hw-konfig";
import { HwTransport } from "./model/hw-transport";

@Injectable({
  providedIn: "root",
})
export class NotificationService {
  public apChange: EventEmitter<ApTransport> = new EventEmitter<ApTransport>();
  public apChangeMulti: EventEmitter<ApTransport[]> = new EventEmitter<ApTransport[]>();
  public apChangeMove: EventEmitter<ApTransport[]> = new EventEmitter<ApTransport[]>();
  public apChangeAptyp: EventEmitter<ApTransport> = new EventEmitter<ApTransport>();
  public hwChange: EventEmitter<HwTransport> = new EventEmitter<HwTransport>();
  public hwChangeMulti: EventEmitter<HwTransport[]> = new EventEmitter<HwTransport[]>();
  public addHw: EventEmitter<AddHwTransport> = new EventEmitter<AddHwTransport>();
  public konfigChange: EventEmitter<HwKonfig> = new EventEmitter<HwKonfig>();
  public konfigDel: EventEmitter<number> = new EventEmitter<number>();
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
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
  }

  public initialize(): void {
    try {
      this.stopConnection();

      this.hubConnection = new HubConnectionBuilder()
        .withUrl(this.configService.notificationUrl)
        .build();

      this.hubConnection.on(this.configService.notificationApchange, (data: ApTransport) => {
        this.apChange.emit(data);
      });

      this.hubConnection.on(this.configService.notificationApchangemulti, (data: ApTransport[]) => {
        this.apChangeMulti.emit(data);
      });

      this.hubConnection.on(this.configService.notificationApchangemove, (data: ApTransport[]) => {
        this.apChangeMove.emit(data);
      });

      this.hubConnection.on(this.configService.notificationApchangeaptyp, (data: ApTransport) => {
        this.apChangeAptyp.emit(data);
      });

      this.hubConnection.on(this.configService.notificationHwchange, (data: HwTransport) => {
        this.hwChange.emit(data);
      });

      this.hubConnection.on(this.configService.notificationHwchangemulti, (data: HwTransport[]) => {
        this.hwChangeMulti.emit(data);
      });

      this.hubConnection.on(this.configService.notificationAddhw, (data: AddHwTransport) => {
        this.addHw.emit(data);
      });

      this.hubConnection.on(this.configService.notificationKonfigchange, (data: HwKonfig) => {
        this.konfigChange.emit(data);
      });

      this.hubConnection.on(this.configService.notificationKonfigdel, (data: number) => {
        this.konfigDel.emit(data);
      });

      this.hubConnection.on(this.configService.notificationExtprogchange, () => {
        this.extprogChange.emit();
      });

      this.hubConnection.on(
        this.configService.notificationApkategoriechange,
        (data: EditApkategorieTransport) => {
          this.apkategorieChange.emit(data);
        }
      );

      this.hubConnection.on(
        this.configService.notificationAptypchange,
        (data: EditAptypTransport) => {
          this.aptypChange.emit(data);
        }
      );

      this.hubConnection.on(this.configService.notificationOechange, (data: EditOeTransport) => {
        this.oeChange.emit(data);
      });

      this.hubConnection.on(
        this.configService.notificationAdressechange,
        (data: EditAdresseTransport) => {
          this.adresseChange.emit(data);
        }
      );

      this.hubConnection.on(
        this.configService.notificationHwtypchange,
        (data: EditHwtypTransport) => {
          this.hwtypChange.emit(data);
        }
      );

      this.hubConnection.on(
        this.configService.notificationVlanchange,
        (data: EditVlanTransport) => {
          this.vlanChange.emit(data);
        }
      );

      this.hubConnection.on(
        this.configService.notificationTagtypchange,
        (data: EditTagtypTransport) => {
          this.tagtypChange.emit(data);
        }
      );

      this.hubConnection.onclose((err: Error) => {
        console.error("## Notification has been closed: " + err.message);
        setTimeout(() => this.initialize(), 100);
      });
    } catch (e) {
      // catch all network errors
      // retry is handled by setIntervall
    }

    void this.hubConnection
      .start()
      .then(() => {
        if (!environment.production) console.debug(">>> Now connected to NotificationHub");
      })
      .catch((error: never) => {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        console.error("Could not connect to NotificationHub:");
        console.dir(error);
      });

    // jede Minute Verbindung testen (die Abfrage des Status scheint auch zu verhindern, dass
    //                                der websocket nach 20 Min. vom IIS geschlosssen wird)
    if (this.checkTimer) {
      clearTimeout(this.checkTimer);
    }
    this.checkTimer = setInterval(() => {
      try {
        if (!this.isOpen()) {
          console.error("Notification not open - state: ", this.hubConnection?.state?.toString());
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
