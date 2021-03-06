import { Component, HostBinding, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { debounceTime } from "rxjs/operators";
import { ConfigService } from "../../shared/config/config.service";
import { DataService } from "../../shared/data.service";
import { BaseFilterService } from "../../shared/filter/base-filter-service";

@Component({
  selector: "sbsdb-admin-panel-config",
  templateUrl: "./admin-panel-config.component.html",
  styleUrls: ["./admin-panel-config.component.scss"],
})
export class AdminPanelConfigComponent implements OnInit {
  public static bsValidator = "bserror";

  @HostBinding("attr.class") public cssClass = "flex-content";

  // --- blocksize ---
  public blocksize: FormControl;
  public blocksizeLabel = "Blockgröße der Listen";
  public blocksizePlaceholder = "100";
  public blocksizeDefaultValue = DataService.defaultpageSize;
  public blocksizeConfigName = ConfigService.AP_PAGE_SIZE;
  public blocksizeNote =
    "Die Arbeitsplatz- und Hardwarelisten werden beim Starten der Anwendung im Hintergrund geladen. Um das zu " +
    "beschleunigen werden die Listen in mehreren Blöcken geholt, die parallel geladen werden. Dieser " +
    "Parameter stellt die Anzahl der Datensätze je Block ein (min. 100).";

  // --- csv separator ---
  public separator: FormControl;
  public separatorLabel = "CSV-Separator";
  public separatorPlaceholder = "";
  public separatorDefaultValue = BaseFilterService.DEFAULT_CSV_SEPARATOR;
  public separatorConfigName = ConfigService.CSV_SEPARATOR;
  public separatorNote =
    "Trennzeichen für CSV-Dateien. Übliche Werte sind Semikolon (Vorgabe, damit kann Excel die Datei automatisch konvertieren), " +
    "Komma und Tabulator. Das Tabulator-Zeichen bitte als 'TAB' eingeben.";

  // als Variable deklarieren ('bound'), damit die Uebergabe als Param sauber ist
  public blocksizeValidator = (control: FormControl): { [s: string]: boolean } => {
    const val: string = control.value as string;
    const regexNumeric = /^\s*[0-9]+\s*$/;
    if (!regexNumeric.test(val) || Number.parseInt(val, 10) < 100) {
      console.debug("not an integer > 100");
      return { [AdminPanelConfigComponent.bsValidator]: true };
    }
  };

  // als Variable deklarieren ('bound'), damit die Uebergabe als Param sauber ist
  // private separatorValidator = (control: FormControl): { [s: string]: boolean } => {
  //   const val: string = control.value as string;
  //   const regexNumeric = /^\s*[0-9]+\s*$/;
  //   if (!regexNumeric.test(val) || Number.parseInt(val, 10) < 100) {
  //     console.debug("not an integer > 100");
  //     return { [AdminPanelConfigComponent.bsValidator]: true };
  //   }
  // };

  constructor(public configService: ConfigService) {
    console.debug("c'tor AdminPanelConfigComponent");
  }

  public ngOnInit(): void {
    console.debug("oninit");
    this.initBlocksize();
    this.initSeparator();
    console.debug("end oninit");
  }

  public blocksizeErrorMessage(control: FormControl): string {
    return control.hasError(AdminPanelConfigComponent.bsValidator)
      ? "Bitte Integer-Wert größer 100 eingeben."
      : "";
  }
  public separatorErrorMessage(control: FormControl): string {
    return "";
  }

  // public blocksizeSave(control: FormControl): Promise<boolean> {
  //   console.debug("save " + control.value);
  //   return this.configService
  //     .saveConfig(ConfigService.AP_PAGE_SIZE, control.value)
  //     .then((rc) => {
  //       console.debug(ConfigService.AP_PAGE_SIZE + " saved rc=" + rc);
  //       return true;
  //     })
  //     .catch((err) => {
  //       console.error(
  //         "Error saving " +
  //           ConfigService.AP_PAGE_SIZE +
  //           ": " +
  //           err +
  //           " @AdminPanelConfigComponent#blocksizeSave"
  //       );
  //       return false;
  //     });
  // }

  private initBlocksize() {
    // // der Startwert fuer das Eingabefeld kommt mit Verzoegerung
    // let bsInitial;
    // this.configService
    //   .getConfig(ConfigService.AP_PAGE_SIZE)
    //   .then((bs) => {
    //     bsInitial = bs ?? ApDataService.defaultpageSize;
    //     console.debug("got blocksize: " + bsInitial);
    //   })
    //   .catch((err) => {
    //     bsInitial = ApDataService.defaultpageSize;
    //     console.error(
    //       "Error fetching " +
    //         ConfigService.AP_PAGE_SIZE +
    //         ": " +
    //         err +
    //         " @AdminPanelConfigComponent#initBlocksize"
    //     );
    //   })
    //   .finally(() => {
    //     this.blocksize.setValue("" + bsInitial);
    //     this.blocksize.markAsPristine();
    //   });

    this.blocksize = new FormControl("" + DataService.defaultpageSize.toString(), [
      // eslint-disable-next-line @typescript-eslint/unbound-method
      Validators.required,
      this.blocksizeValidator,
    ]);
    this.blocksize.statusChanges.pipe(debounceTime(200)).subscribe(() => {
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      console.debug("--- Blocksize value changed: " + this.blocksize.value);
    });
    console.debug("init Blocksize");
  }

  private initSeparator() {
    this.separator = new FormControl("" + BaseFilterService.DEFAULT_CSV_SEPARATOR, [
      // eslint-disable-next-line @typescript-eslint/unbound-method
      Validators.required,
      // this.separatorValidator,
    ]);
  }
}
