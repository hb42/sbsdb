import { Component, Input } from "@angular/core";
import { FormGroup } from "@angular/forms";

@Component({
  selector: "sbsdb-dialog-actions",
  templateUrl: "./dialog-actions.component.html",
  styleUrls: ["./dialog-actions.component.scss"],
})
export class DialogActionsComponent {
  @Input() data: unknown;
  @Input() formGroup: FormGroup;

  constructor() {
    console.debug("c'tor DialogActionsComponent");
  }

  public isInvalid(): boolean {
    return this.formGroup ? this.formGroup.invalid : false;
  }
}
