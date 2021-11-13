import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { DataService } from "../shared/data.service";
import { BaseEditService } from "../shared/filter/base-edit-service";

@Injectable({
  providedIn: "root",
})
export class ConfEditService extends BaseEditService {
  constructor(public dialog: MatDialog, public dataService: DataService) {
    super(dialog, dataService);
    console.debug("c'tor ConfEditService");
  }

  public newConf(): void {
    console.debug("** new conf button");
  }
}
