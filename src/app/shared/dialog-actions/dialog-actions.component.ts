import { Component, Input } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { environment } from "../../../environments/environment";

@Component({
  selector: "sbsdb-dialog-actions",
  templateUrl: "./dialog-actions.component.html",
  styleUrls: ["./dialog-actions.component.scss"],
})
export class DialogActionsComponent {
  @Input() data: unknown;
  @Input() formGroup: FormGroup;

  constructor() {
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
  }

  public isInvalid(): boolean {
    return this.formGroup ? this.formGroup.invalid || !this.formGroup.dirty : false;
  }
}
