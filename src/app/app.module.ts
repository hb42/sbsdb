import { registerLocaleData } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import localeDe from "@angular/common/locales/de";
import { APP_INITIALIZER, LOCALE_ID, NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatPaginatorIntl } from "@angular/material/paginator";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { LibClientModule, LOGON_OPTIONS, LogonParameter, Version } from "@hb42/lib-client";
import { AdminOptionsComponent } from "./admin/admin-options/admin-options.component";
import { AdminPanelApFilterComponent } from "./admin/admin-panel-ap-filter/admin-panel-ap-filter.component";
import { AdminPanelConfigInputComponent } from "./admin/admin-panel-config-input/admin-panel-config-input.component";
import { AdminPanelConfigComponent } from "./admin/admin-panel-config/admin-panel-config.component";
import { AdminComponent } from "./admin/admin/admin.component";
import { FilterBracketComponent } from "./shared/filter/filter-bracket/filter-bracket.component";
import { FilterEditListComponent } from "./shared/filter/filter-edit-list/filter-edit-list.component";
import { FilterEditComponent } from "./shared/filter/filter-edit/filter-edit.component";
import { FilterElementComponent } from "./shared/filter/filter-element/filter-element.component";
import { FilterComponent } from "./shared/filter/filter/filter.component";
import { ApComponent } from "./ap/ap/ap.component";
import { AppMaterialModule } from "./app-material.module";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { HwListComponent } from "./hw/hw-list/hw-list.component";
import { HwTreeComponent } from "./hw/hw-tree/hw-tree.component";
import { HwComponent } from "./hw/hw/hw.component";
import { AcceleratorStringComponent } from "./shared/accelerator-string/accelerator-string.component";
import { ConfigService } from "./shared/config/config.service";
import { ErrorComponent } from "./shared/error/error.component";
import { FootComponent } from "./shared/foot/foot.component";
import { HeadComponent } from "./shared/head/head.component";
import { MatPaginatorIntlDe } from "./shared/mat.paginator.intl.de";
import { StatusComponent } from "./shared/status/status.component";
import { HeaderCellComponent } from "./shared/table/header-cell/header-cell.component";
import { ApDetailCellComponent } from "./ap/ap-detail-cell/ap-detail-cell.component";
import { TooltipOnEllipsisDirective } from "./shared/tooltip-on-ellipsis.directive";
import { HwDetailCellComponent } from "./hw/hw-detail-cell/hw-detail-cell.component";
import { SelectHeaderComponent } from "./shared/filter/select-header/select-header.component";
import { SelectRowComponent } from "./shared/filter/select-row/select-row.component";
import { ExpandHeaderComponent } from "./shared/filter/expand-header/expand-header.component";
import { PaginatorStatusDirective } from "./shared/table/paginator-status.directive";
import { CsvDialogComponent } from "./shared/csv-dialog/csv-dialog.component";
import { EditDialogComponent } from "./shared/edit/edit-dialog/edit-dialog.component";
import { EditTagsComponent } from "./ap/edit-tags/edit-tags.component";
import { ApEditDialogComponent } from "./ap/ap-edit-dialog/ap-edit-dialog.component";
import { DisableControlDirective } from "./shared/edit/disable-control.directive";
import { EditApHwComponent } from './ap/edit-ap-hw/edit-ap-hw.component';
import { EditHwComponent } from './ap/edit-hw/edit-hw.component';
import { EditApComponent } from './ap/edit-ap/edit-ap.component';

// FIXME interceptor in lib-client muss auf optional umgebaut werden
//       (oder farc auf IIS/.NET Core umstellen)
export function logonOptionsFactory(): LogonParameter {
  return {
    logon: "NO",
  };
}

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
    LibClientModule,
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

    // Konfig fuer Autologon TODO Altschuld, entfernen, sobald lib-client umgebaut
    {
      provide: LOGON_OPTIONS,
      useFactory: logonOptionsFactory,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
