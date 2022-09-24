import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { environment } from "../../environments/environment";
import { DataService } from "../shared/data.service";
import { DialogTitleComponent } from "../shared/dialog-title/dialog-title.component";
import { BaseEditService } from "../shared/filter/base-edit-service";
import { HwKonfig } from "../shared/model/hw-konfig";
import { ConfFilterService } from "./conf-filter.service";
import { EditConfigData } from "./edit-config-dialog/edit-config-data";
import { EditConfigDialogComponent } from "./edit-config-dialog/edit-config-dialog.component";

@Injectable({
  providedIn: "root",
})
export class ConfEditService extends BaseEditService<HwKonfig> {
  constructor(
    public dialog: MatDialog,
    public dataService: DataService,
    private filterService: ConfFilterService
  ) {
    super(dialog, dataService);
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
  }

  protected setEditFromNavigation() {
    this.editFromNavigation.subscribe((k) => this.editConf(k));
  }

  public newConf(): void {
    this.editConf(null);
  }

  public editConf(conf: HwKonfig, noNav = false): void {
    const nav = noNav
      ? DialogTitleComponent.NO_NAV
      : this.filterService.getNavigationIcons((k) => k.id === conf.id);
    const ecd = {
      konfig: conf,
      navigate: nav,
    } as EditConfigData;

    const dialogRef = this.dialog.open(EditConfigDialogComponent, {
      disableClose: true,
      data: ecd,
      id: "edit-dialog",
    });

    // Dialog-Ergebnis
    dialogRef.afterClosed().subscribe((result: EditConfigData) => {
      if (result) {
        if (result.savedata) {
          this.dataService.post(this.dataService.changeKonfigUrl, result.chg);
        }
        // handle navigation
        const to = this.filterService.navigateTo(result.navigate, (k) => k.id === result.konfig.id);
        if (to) {
          this.editFromNavigation.emit(to);
        }
      }
    });
  }
}
