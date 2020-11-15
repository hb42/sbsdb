import { Component, HostBinding } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { debounceTime } from "rxjs/operators";
import { FormFieldErrorStateMatcher } from "../../shared/form-field-error-state-matcher";

@Component({
  selector: "sbsdb-admin-list-config",
  templateUrl: "./admin-list-config.component.html",
  styleUrls: ["./admin-list-config.component.scss"],
})
export class AdminListConfigComponent {
  @HostBinding("attr.class") public cssClass = "flex-content";

  public blockSize: FormControl = new FormControl("", [Validators.required, Validators.min(100)]);
  public matcher = new FormFieldErrorStateMatcher();

  constructor() {
    this.blockSize.statusChanges.pipe(debounceTime(200)).subscribe(() => {
      console.debug("--- Blocksize value changed: " + this.blockSize.value);
    });
  }

  public getErrorMessage() {
    if (this.blockSize.hasError("required")) {
      return "Bitte einen Wert eingeben.";
    }
    return this.blockSize.hasError("min") ? "Der Wert muss größer 100 sein." : "";
  }
}
