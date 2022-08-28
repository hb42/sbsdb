import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { environment } from "../../environments/environment";
import { DataService } from "../shared/data.service";
import { BaseEditService } from "../shared/filter/base-edit-service";
import { HwKonfig } from "../shared/model/hw-konfig";
import { EditConfigData } from "./edit-config-dialog/edit-config-data";
import { EditConfigDialogComponent } from "./edit-config-dialog/edit-config-dialog.component";

@Injectable({
  providedIn: "root",
})
export class ConfEditService extends BaseEditService {
  constructor(public dialog: MatDialog, public dataService: DataService) {
    super(dialog, dataService);
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
  }

  public newConf(): void {
    this.editConf(null);
  }

  public editConf(conf: HwKonfig): void {
    const ecd = {
      konfig: conf,
    } as EditConfigData;

    const dialogRef = this.dialog.open(EditConfigDialogComponent, {
      disableClose: true,
      data: ecd,
    });

    // Dialog-Ergebnis
    dialogRef.afterClosed().subscribe((result: EditConfigData) => {
      if (result) {
        this.dataService.post(this.dataService.changeKonfigUrl, result.chg);
      }
    });
  }
}
