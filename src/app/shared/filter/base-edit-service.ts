import { EventEmitter } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { environment } from "../../../environments/environment";
import { DataService } from "../data.service";

export abstract class BaseEditService<R> {
  protected editFromNavigation = new EventEmitter<R>();
  protected constructor(protected dialog: MatDialog, protected dataService: DataService) {
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
    this.setEditFromNavigation();
  }

  protected abstract setEditFromNavigation(): void;
}
