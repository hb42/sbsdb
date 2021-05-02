import { MatDialog } from "@angular/material/dialog";
import { DataService } from "../data.service";

export abstract class BaseEditService {
  protected constructor(protected dialog: MatDialog, protected dataService: DataService) {
    console.debug("c'tor BaseEditService");
  }
}
