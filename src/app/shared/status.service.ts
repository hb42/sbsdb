import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { StatusComponent } from "./status/status.component";

@Injectable({
  providedIn: "root",
})
export class StatusService {
  constructor(private snackBar: MatSnackBar) {}

  public success(msg: string): void {
    // fuer hat-geklappt-Nachricht: msg ca. 3-4 Sekunden anzeigen
    // springgreen
    // this.snackBar.open(msg, "OK", { duration: 3000 });
    this.snackBar.openFromComponent(StatusComponent, {
      duration: 3000,
      data: { msg: msg, textclass: "success" },
    });
  }

  public warn(msg: string): void {
    // warning: 10 Sekunden anzeigen
    // yellow
    // this.snackBar.open(msg, "OK", { duration: 10000 });
    this.snackBar.openFromComponent(StatusComponent, {
      duration: 10000,
      data: { msg: msg, textclass: "warn" },
    });
  }

  public error(msg: string): void {
    // error: Nachricht muss manuell geschlossen werden
    // red | orange
    // this.snackBar.open(msg, "OK", { panelClass: "snackBarPanel" });
    this.snackBar.openFromComponent(StatusComponent, {
      data: { msg: msg, textclass: "error" },
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
