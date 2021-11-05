import { registerLocaleData } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import localeDe from "@angular/common/locales/de";
import { APP_INITIALIZER, ErrorHandler, LOCALE_ID, NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatPaginatorIntl } from "@angular/material/paginator";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AdminOptionsComponent } from "./admin/admin-options/admin-options.component";
import { AdminPanelApFilterComponent } from "./admin/admin-panel-ap-filter/admin-panel-ap-filter.component";
import { AdminPanelConfigInputComponent } from "./admin/admin-panel-config-input/admin-panel-config-input.component";
import { AdminPanelConfigComponent } from "./admin/admin-panel-config/admin-panel-config.component";
import { AdminComponent } from "./admin/admin/admin.component";
import { ApDetailCellComponent } from "./ap/ap-detail-cell/ap-detail-cell.component";
import { ApEditDialogComponent } from "./ap/ap-edit-dialog/ap-edit-dialog.component";
import { ApComponent } from "./ap/ap/ap.component";
import { EditApHwComponent } from "./ap/edit-ap-hw/edit-ap-hw.component";
import { EditApComponent } from "./ap/edit-ap/edit-ap.component";
import { EditHwComponent } from "./ap/edit-hw/edit-hw.component";
import { EditTagsComponent } from "./ap/edit-tags/edit-tags.component";
import { NewApComponent } from "./ap/new-ap/new-ap.component";
import { AppMaterialModule } from "./app-material.module";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { EditConfigDialogComponent } from "./hw/edit-config-dialog/edit-config-dialog.component";
import { EditHwApComponent } from "./hw/edit-hw-ap/edit-hw-ap.component";
import { EditHwHwComponent } from "./hw/edit-hw-hw/edit-hw-hw.component";
import { EditHwMacComponent } from "./hw/edit-hw-mac/edit-hw-mac.component";
import { HwDetailCellComponent } from "./hw/hw-detail-cell/hw-detail-cell.component";
import { HwEditDialogComponent } from "./hw/hw-edit-dialog/hw-edit-dialog.component";
import { HwListComponent } from "./hw/hw-list/hw-list.component";
import { HwTreeComponent } from "./hw/hw-tree/hw-tree.component";
import { HwComponent } from "./hw/hw/hw.component";
import { NewHwDialogComponent } from "./hw/new-hw-dialog/new-hw-dialog.component";
import { AboutDialogComponent } from "./shared/about-dialog/about-dialog.component";
import { AcceleratorStringComponent } from "./shared/accelerator-string/accelerator-string.component";
import { ConfigService } from "./shared/config/config.service";
import { CsvDialogComponent } from "./shared/csv-dialog/csv-dialog.component";
import { DialogActionsComponent } from "./shared/dialog-actions/dialog-actions.component";
import { DialogTitleComponent } from "./shared/dialog-title/dialog-title.component";
import { DisableControlDirective } from "./shared/edit/disable-control.directive";
import { EditDialogComponent } from "./shared/edit/edit-dialog/edit-dialog.component";
import { ErrorComponent } from "./shared/error/error.component";
import { ErrorService } from "./shared/error/error.service";
import { ExpandHeaderComponent } from "./shared/filter/expand-header/expand-header.component";
import { FilterBracketComponent } from "./shared/filter/filter-bracket/filter-bracket.component";
import { FilterEditListComponent } from "./shared/filter/filter-edit-list/filter-edit-list.component";
import { FilterEditComponent } from "./shared/filter/filter-edit/filter-edit.component";
import { FilterElementComponent } from "./shared/filter/filter-element/filter-element.component";
import { FilterComponent } from "./shared/filter/filter/filter.component";
import { SelectHeaderComponent } from "./shared/filter/select-header/select-header.component";
import { SelectRowComponent } from "./shared/filter/select-row/select-row.component";
import { FootComponent } from "./shared/foot/foot.component";
import { HeadComponent } from "./shared/head/head.component";
import { MatPaginatorIntlDe } from "./shared/mat.paginator.intl.de";
import { StatusComponent } from "./shared/status/status.component";
import { HeaderCellComponent } from "./shared/table/header-cell/header-cell.component";
import { PaginatorStatusDirective } from "./shared/table/paginator-status.directive";
import { TooltipOnEllipsisDirective } from "./shared/tooltip-on-ellipsis.directive";
import { Version } from "./shared/version";
import { YesNoDialogComponent } from "./shared/yes-no-dialog/yes-no-dialog.component";
import { ShowHistoryDialogComponent } from './hw/show-history-dialog/show-history-dialog.component';

// FIXME interceptor in lib-client muss auf optional umgebaut werden
//       (oder farc auf IIS/.NET Core umstellen)
// export function logonOptionsFactory(): LogonParameter {
//   return {
//     logon: "NO",
//   };
// }

registerLocaleData(localeDe); // + provider, s.u.

// Damit ConfigService so frueh, wie moeglich geladen wird und die Config-Daten
// (u.a. Benutzer-Session) fuer alle anderen Services verfuegbar sind.
// (fn , die fn liefert, die ein Promise liefert)
// mit AOT fkt. nur das folgende Konstrukt
export function initConf(configService: ConfigService): () => Promise<void | Version> {
  return () => configService.init();
}

@NgModule({
  declarations: [
    AppComponent,
    HeadComponent,
    FootComponent,
    HwListComponent,
    HwTreeComponent,
    ApComponent,
    HwComponent,
    ErrorComponent,
    AdminComponent,
    StatusComponent,
    AcceleratorStringComponent,
    FilterComponent,
    FilterElementComponent,
    FilterBracketComponent,
    FilterEditComponent,
    FilterEditListComponent,
    AdminOptionsComponent,
    AdminPanelApFilterComponent,
    AdminPanelConfigComponent,
    AdminPanelConfigInputComponent,
    HeaderCellComponent,
    ApDetailCellComponent,
    TooltipOnEllipsisDirective,
    HwDetailCellComponent,
    SelectHeaderComponent,
    SelectRowComponent,
    ExpandHeaderComponent,
    PaginatorStatusDirective,
    CsvDialogComponent,
    EditDialogComponent,
    EditTagsComponent,
    ApEditDialogComponent,
    DisableControlDirective,
    EditApHwComponent,
    EditHwComponent,
    EditApComponent,
    DialogTitleComponent,
    DialogActionsComponent,
    NewApComponent,
    YesNoDialogComponent,
    AboutDialogComponent,
    HwEditDialogComponent,
    EditHwApComponent,
    EditHwHwComponent,
    EditHwMacComponent,
    EditConfigDialogComponent,
    NewHwDialogComponent,
    ShowHistoryDialogComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,

    // -- Angular Material
    AppMaterialModule,

    // -- eigene
    // LibClientModule,
  ],
  // f. mat-dialog (wird nur ohne Ivy gebraucht)
  // entryComponents: [ApFilterEditComponent, ApFilterEditListComponent],

  providers: [
    { provide: LOCALE_ID, useValue: "de" }, // registerLocaleData() s.o.
    // -- eigene
    // app startet erst, wenn das Promise aus initConf aufgeloest ist
    // -> login, config holen, usw.
    {
      provide: APP_INITIALIZER,
      useFactory: initConf,
      deps: [ConfigService], // f. IE11-Prob. + Injector
      multi: true,
    },
    // paginator uebersetzen
    { provide: MatPaginatorIntl, useClass: MatPaginatorIntlDe },
    // Error handler
    { provide: ErrorHandler, useClass: ErrorService },

    // Konfig fuer Autologon TODO Altschuld, entfernen, sobald lib-client umgebaut
    // {
    //   provide: LOGON_OPTIONS,
    //   useFactory: logonOptionsFactory,
    // },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
