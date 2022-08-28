import { MatDialog } from "@angular/material/dialog";
import { environment } from "../../../environments/environment";
import { DataService } from "../data.service";

export abstract class BaseEditService {
  protected constructor(protected dialog: MatDialog, protected dataService: DataService) {
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
  }
}
