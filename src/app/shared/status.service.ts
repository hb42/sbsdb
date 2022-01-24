import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { StatusComponent } from "./status/status.component";

@Injectable({
  providedIn: "root",
})
export class StatusService {
  public static STATUS_INFO = "INFO";
  public static STATUS_WARN = "WARN";
  public static STATUS_ERROR = "ERROR";

  constructor(private snackBar: MatSnackBar) {}

  /**
   * Fuer hat-geklappt-Nachricht: msg 4 Sekunden anzeigen
   */
  public info(msg: string): void {
    this.snackBar.openFromComponent(StatusComponent, {
      duration: 4000,
      data: { msg: msg, type: StatusService.STATUS_INFO },
    });
  }

  /**
   * warning: msg 10 Sekunden anzeigen
   */
  public warn(msg: string): void {
    this.snackBar.openFromComponent(StatusComponent, {
      duration: 10000,
      data: { msg: msg, type: StatusService.STATUS_WARN },
    });
  }

  /**
   * error: Nachricht muss manuell geschlossen werden
   */
  public error(msg: string): void {
    this.snackBar.openFromComponent(StatusComponent, {
      data: { msg: msg, type: StatusService.STATUS_ERROR },
    });
  }

  public test(): void {
    console.debug("SnackBar.TEST");
    this.snackBar.open("test message", "OK", { duration: 10000 });

    // const snackBarRef =
    // this.snackBar.open(result, "OK", { duration: 10000 });
    // snackBarRef.onAction().subscribe(() => {
    //   snackBarRef.dismiss();
    // });
  }
}
