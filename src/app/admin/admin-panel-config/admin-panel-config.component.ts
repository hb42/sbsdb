import { Component, HostBinding, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { debounceTime } from "rxjs/operators";
import { ApDataService } from "../../ap/ap-data.service";
import { ConfigService } from "../../shared/config/config.service";

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
  public blocksizeLabel = "Blockgröße der AP-Liste";
  public blocksizePlaceholder = "100";
  public blocksizeDefaultValue = ApDataService.defaultpageSize;
  public blocksizeConfigName = ConfigService.AP_PAGE_SIZE;
  public blocksizeNote =
    "Die Arbeitsplatzliste wird beim Starten der Anwendung im Hintergrund geladen. Um das zu " +
    "beschleunigen wird die Liste in mehreren Blöcken geholt, die parallel geladen werden. Dieser " +
    "Parameter stellt die Anzahl der Datensätze je Block ein (min. 100).";

  // als Variable deklarieren ('bound'), damit die Uebergabe als Param sauber ist
  private blocksizeValidator = (control: FormControl): { [s: string]: boolean } => {
    const val: string = control.value as string;
    const regexNumeric = /^\s*[0-9]+\s*$/;
    if (!regexNumeric.test(val) || Number.parseInt(val, 10) < 100) {
      console.debug("not an integer > 100");
      return { [AdminPanelConfigComponent.bsValidator]: true };
    }
  };

  constructor(public configService: ConfigService) {
    console.debug("c'tor AdminPanelConfigComponent");
  }

  public ngOnInit(): void {
    console.debug("oninit");
    this.initBlocksize();
    console.debug("end oninit");
  }

  // --- blocksize ---

  public blocksizeErrorMessage(control: FormControl): string {
    return control.hasError(AdminPanelConfigComponent.bsValidator)
      ? "Bitte Integer-Wert größer 100 eingeben."
      : "";
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

    this.blocksize = new FormControl("" + ApDataService.defaultpageSize.toString(), [
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
}
