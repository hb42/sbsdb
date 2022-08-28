import { Component, Inject } from "@angular/core";
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from "@angular/material/snack-bar";
import { environment } from "../../../environments/environment";
import { StatusService } from "../status.service";

/**
 * Status als SnackBar
 *
 */
@Component({
  selector: "sbsdb-status",
  templateUrl: "./status.component.html",
  styleUrls: ["./status.component.scss"],
})
export class StatusComponent {
  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: { msg: string; type: string },
    private snackBarRef: MatSnackBarRef<StatusComponent>
  ) {
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
  }

  public close(): void {
    this.snackBarRef.dismiss();
  }

  public icon(): string {
    switch (this.data.type) {
      case StatusService.STATUS_INFO:
        return "info_outline";
      case StatusService.STATUS_WARN:
        return "warning_amber";
      case StatusService.STATUS_ERROR:
        return "error_outline";
      default:
        return "";
    }
  }
  public textclass(): string {
    switch (this.data.type) {
      case StatusService.STATUS_INFO:
        return "status-info";
      case StatusService.STATUS_WARN:
        return "status-warn";
      case StatusService.STATUS_ERROR:
        return "status-error";
      default:
        return "";
    }
  }
}
