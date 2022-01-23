import { Component, Inject } from "@angular/core";
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from "@angular/material/snack-bar";

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
    @Inject(MAT_SNACK_BAR_DATA) public data: { msg: string; textclass: string },
    private snackBarRef: MatSnackBarRef<StatusComponent>
  ) {}

  public close(): void {
    this.snackBarRef.dismiss();
  }
}
