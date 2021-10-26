import { EventEmitter, Injectable } from "@angular/core";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { ConfigService } from "./config/config.service";
import { ApHw } from "./model/ap-hw";

@Injectable({
  providedIn: "root",
})
export class NotificationService {
  public apChange: EventEmitter<ApHw> = new EventEmitter<ApHw>();
  private hubConnection: HubConnection | undefined;

  constructor(public configService: ConfigService) {
    console.debug("c'tor NotificationService");
    // this.initialize();
  }

  public initialize(): void {
    console.debug("## initialize notifications");
    this.stopConnection();

    // TODO die Strings sollten aus der Config kommen
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.configService.webservice + "/notification")
      // .configureLogging(LogLevel.Information)
      .build();

    this.hubConnection.on("apchange", (data: ApHw) => {
      console.debug("## Event apchange");
      console.dir(data);
      this.apChange.emit(data);
    });

    this.hubConnection.onclose((err: Error) => {
      console.debug("## Notification has been closed: " + err.message);
      setTimeout(() => this.initialize(), 100);
    });

    // alle 5 Min. Verbindung testen (die Abfrage des Status scheint zu verhindern, dass
    //                                der websocket nach 20 Min. geschlosssen wird)
    setInterval(() => {
      if (!this.isOpen()) {
        console.debug(
          "## Check: Notification not open - state: " + this.hubConnection?.state?.toString()
        );
        setTimeout(() => this.initialize(), 100);
      }
    }, 300000);

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
