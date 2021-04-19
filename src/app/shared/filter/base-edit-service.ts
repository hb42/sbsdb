import { MatDialog } from "@angular/material/dialog";

export abstract class BaseEditService {
  protected constructor(protected dialog: MatDialog) {
    console.debug("c'tor BaseEditService");
  }
}
