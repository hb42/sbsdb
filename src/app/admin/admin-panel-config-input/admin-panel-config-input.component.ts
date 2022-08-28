import { Component, Input, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { environment } from "../../../environments/environment";
import { ConfigService } from "../../shared/config/config.service";
import { FormFieldErrorStateMatcher } from "../../shared/form-field-error-state-matcher";

@Component({
  selector: "sbsdb-admin-panel-config-input",
  templateUrl: "./admin-panel-config-input.component.html",
  styleUrls: ["./admin-panel-config-input.component.scss"],
})
export class AdminPanelConfigInputComponent implements OnInit {
  @Input() control: FormControl;
  @Input() label: string;
  @Input() placeholder: string;
  @Input() note: string;
  @Input() configName: string;
  @Input() defaultValue: string;
  @Input() errorMsg: (FormControl) => string;

  public matcher = new FormFieldErrorStateMatcher();

  constructor(public configService: ConfigService) {
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
  }

  ngOnInit(): void {
    // der Startwert fuer das Eingabefeld kommt mit Verzoegerung
    let initial: string;
    this.configService
      .getConfig(this.configName)
      .then((val: string) => {
        initial = val ?? this.defaultValue;
      })
      .catch((err) => {
        initial = this.defaultValue;
        console.error(
          "Error fetching " +
            this.configName +
            ": " +
            (err as string) +
            " @AdminPanelConfigInputComponent#ngOninit"
        );
      })
      .finally(() => {
        this.control.setValue("" + initial);
        this.control.markAsPristine();
      });
  }

  public getErrorMessage(): string {
    if (this.control.hasError("required")) {
      return "Bitte einen Wert eingeben.";
    }
    if (this.control.hasError("saveError")) {
      return "Fehler beim Speichern des Wertes in der Datenbank.";
    }

    return this.errorMsg(this.control);
  }

  public saveControl(): void {
    this.configService
      .saveConfig(this.configName, this.control.value)
      .then(() => {
        this.control.markAsPristine();
      })
      .catch((err) => {
        this.control.setErrors({ saveError: true });
        console.error(
          "Error saving",
          this.configName,
          ":",
          err,
          "@AdminPanelConfigInputComponent#saveControl"
        );
      });
  }
}
