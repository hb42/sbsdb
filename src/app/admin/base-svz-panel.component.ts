import {
  AfterViewInit,
  Component,
  EventEmitter,
  OnDestroy,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { lastValueFrom, Subscription } from "rxjs";
import { DataService } from "../shared/data.service";
import { SbsdbColumn } from "../shared/table/sbsdb-column";
import { YesNoDialogComponent } from "../shared/yes-no-dialog/yes-no-dialog.component";
import { AdminService } from "./admin.service";

@Component({
  selector: "sbsdb-base-svz-panel",
  template: "",
})
export abstract class BaseSvzPanelComponent<C, R> implements AfterViewInit, OnDestroy {
  /**
   * Components, die diese Klasse erben koennen eine ngTemplate mit dem Namen "infoTpl"
   * deklarieren. Die Template wird hier an adminService weitergegeben und unterhalb
   * der Component angezeigt.
   *   <ng-template #infoTpl> ... </ng-template>
   *
   * @private
   */
  @ViewChild("infoTpl") private infoTpl: TemplateRef<never>;

  public dataSource: MatTableDataSource<R> = new MatTableDataSource<R>();
  public columns: SbsdbColumn<C, R>[] = [];
  public csvEvent: EventEmitter<void> = new EventEmitter<void>();

  public changeEvent: EventEmitter<unknown> = new EventEmitter<unknown>();
  public delEvent: EventEmitter<unknown> = new EventEmitter<unknown>();

  public refreshTableEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

  protected newRecordHandler: Subscription;
  protected exportHandler: Subscription;
  protected debugHandler: Subscription;
  /**
   * hier kann ein Tabellen-Update-Event von ausserhalb registriert
   * werden, damit er in onDestroy wieder deregistriert wird
   */
  protected notificationHandler: Subscription;

  protected constructor(
    public dataService: DataService,
    public adminService: AdminService,
    protected dialog: MatDialog
  ) {
    setTimeout(() => (this.adminService.disableMainMenuButtons = false), 0);
    this.dataSource.data = this.getTableData();
    this.buildColumns();

    this.exportHandler = this.adminService.exportEvent.subscribe(() => {
      this.csvEvent.emit();
    });

    this.debugHandler = this.adminService.debugEvent.subscribe(() => {
      this.changeDebug();
    });

    // new
    this.newRecordHandler = this.adminService.newRecordEvent.subscribe(() => {
      this.handleChangeOrNew(null);
    });
    // chg
    this.changeEvent.subscribe((svz: unknown) => {
      this.handleChangeOrNew(svz);
    });

    // del
    this.delEvent.subscribe((svz: unknown) => {
      this.handleDelete(svz);
    });
  }

  ngAfterViewInit(): void {
    this.adminService.infoPanel = this.infoTpl;
  }

  public ngOnDestroy(): void {
    this.adminService.disableMainMenuButtons = true;
    this.newRecordHandler.unsubscribe();
    this.exportHandler.unsubscribe();
    this.debugHandler.unsubscribe();
    if (this.notificationHandler) {
      this.notificationHandler.unsubscribe();
    }
    this.adminService.infoPanel = null;
  }

  /**
   * this.columns mit den Daten der benoetigten Spalten fuellen
   *
   * @protected
   */
  protected abstract buildColumns();

  /**
   * Daten fuer die Tabelle liefern
   *
   * i.d.R. this.dataService.XXXList, sowie ggf. noetige Aufbereitung,
   * z.B. Abhaengigkeiten aktualisieren (-> this.dataService.XXXDeps()).
   *
   * @protected
   */
  protected abstract getTableData(): R[];

  /**
   * Wert, den der New-/Change-Dialog liefert speichern
   *
   * @param any
   * @protected
   */
  protected abstract handleChangeOrNew(any);

  /**
   * Loeschen-Dialog aufrufen und Datensatz ggf. loeschen
   * @param any
   * @protected
   */
  protected abstract handleDelete(any);

  protected changeDebug() {
    this.refreshTableEvent.emit(this.adminService.userSettings.debug);
  }

  protected askDelete(title: string, text: string): Promise<boolean> {
    const dialogRef = this.dialog.open(YesNoDialogComponent, {
      data: {
        title: title,
        text: text,
      },
    });
    return lastValueFrom(dialogRef.afterClosed()).then((result: boolean) => {
      return result;
    });
  }
}
