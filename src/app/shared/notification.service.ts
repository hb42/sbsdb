import { EventEmitter, Injectable } from "@angular/core";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
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
  public hwChange: EventEmitter<HwTransport> = new EventEmitter<HwTransport>();
  public addHw: EventEmitter<AddHwTransport> = new EventEmitter<AddHwTransport>();
  public konfigChange: EventEmitter<HwKonfig> = new EventEmitter<HwKonfig>();
  public extprogChange: EventEmitter<void> = new EventEmitter<void>();
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
