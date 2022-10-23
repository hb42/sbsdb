import { A11yModule } from "@angular/cdk/a11y";
import { registerLocaleData } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import localeDe from "@angular/common/locales/de";
import { APP_INITIALIZER, ErrorHandler, LOCALE_ID, NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatPaginatorIntl } from "@angular/material/paginator";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AdminOptionsComponent } from "./admin/admin-options/admin-options.component";
import { AdminPanelAdresseComponent } from "./admin/admin-panel-adresse/admin-panel-adresse.component";
import { AdminPanelApkategorieComponent } from "./admin/admin-panel-apkategorie/admin-panel-apkategorie.component";
import { AdminPanelAptypComponent } from "./admin/admin-panel-aptyp/admin-panel-aptyp.component";
import { AdminPanelAussondComponent } from "./admin/admin-panel-aussond/admin-panel-aussond.component";
import { AdminPanelConfigInputComponent } from "./admin/admin-panel-config-input/admin-panel-config-input.component";
import { AdminPanelConfigComponent } from "./admin/admin-panel-config/admin-panel-config.component";
import { AdminPanelExtprogComponent } from "./admin/admin-panel-extprog/admin-panel-extprog.component";
import { AdminPanelHwtypComponent } from "./admin/admin-panel-hwtyp/admin-panel-hwtyp.component";
import { AdminPanelOeComponent } from "./admin/admin-panel-oe/admin-panel-oe.component";
import { AdminPanelTagtypComponent } from "./admin/admin-panel-tagtyp/admin-panel-tagtyp.component";
import { AdminPanelTclogsComponent } from "./admin/admin-panel-tclogs/admin-panel-tclogs.component";
import { AdminPanelVlanComponent } from "./admin/admin-panel-vlan/admin-panel-vlan.component";
import { AdminComponent } from "./admin/admin/admin.component";
import { EditAdresseDialogComponent } from "./admin/edit-adresse-dialog/edit-adresse-dialog.component";
import { EditApkategorieDialogComponent } from "./admin/edit-apkategorie-dialog/edit-apkategorie-dialog.component";
import { EditAptypDialogComponent } from "./admin/edit-aptyp-dialog/edit-aptyp-dialog.component";
import { EditExtprogDialogComponent } from "./admin/edit-extprog-dialog/edit-extprog-dialog.component";
import { EditHwtypDialogComponent } from "./admin/edit-hwtyp-dialog/edit-hwtyp-dialog.component";
import { EditOeDialogComponent } from "./admin/edit-oe-dialog/edit-oe-dialog.component";
import { EditTagtypDialogComponent } from "./admin/edit-tagtyp-dialog/edit-tagtyp-dialog.component";
import { EditVlanDialogComponent } from "./admin/edit-vlan-dialog/edit-vlan-dialog.component";
import { NewAussondMeldComponent } from "./admin/new-aussond-meld/new-aussond-meld.component";
import { ApDetailCellComponent } from "./ap/ap-detail-cell/ap-detail-cell.component";
import { ApEditDialogComponent } from "./ap/ap-edit-dialog/ap-edit-dialog.component";
import { ApEditMultiDialogComponent } from "./ap/ap-edit-multi-dialog/ap-edit-multi-dialog.component";
import { ApComponent } from "./ap/ap/ap.component";
import { EditApHwComponent } from "./ap/edit-ap-hw/edit-ap-hw.component";
import { EditApComponent } from "./ap/edit-ap/edit-ap.component";
import { EditHwComponent } from "./ap/edit-hw/edit-hw.component";
import { EditMultiComponent } from "./ap/edit-multi/edit-multi.component";
import { EditTagsComponent } from "./ap/edit-tags/edit-tags.component";
import { MoveDialogComponent } from "./ap/move-dialog/move-dialog.component";
import { NewApComponent } from "./ap/new-ap/new-ap.component";
import { AppMaterialModule } from "./app-material.module";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { ConfDetailCellComponent } from "./conf/conf-detail-cell/conf-detail-cell.component";
import { ConfComponent } from "./conf/conf/conf.component";
import { EditConfigDialogComponent } from "./conf/edit-config-dialog/edit-config-dialog.component";
import { EditConfigComponent } from "./conf/edit-config/edit-config.component";
import { EditHwApComponent } from "./hw/edit-hw-ap/edit-hw-ap.component";
import { EditHwHwComponent } from "./hw/edit-hw-hw/edit-hw-hw.component";
import { EditHwMacComponent } from "./hw/edit-hw-mac/edit-hw-mac.component";
import { EditHwMultiComponent } from "./hw/edit-hw-multi/edit-hw-multi.component";
import { HwAussondDialogComponent } from "./hw/hw-aussond-dialog/hw-aussond-dialog.component";
import { HwDetailCellComponent } from "./hw/hw-detail-cell/hw-detail-cell.component";
import { HwEditDialogComponent } from "./hw/hw-edit-dialog/hw-edit-dialog.component";
import { HwEditMultiDialogComponent } from "./hw/hw-edit-multi-dialog/hw-edit-multi-dialog.component";
import { HwComponent } from "./hw/hw/hw.component";
import { NewHwDialogComponent } from "./hw/new-hw-dialog/new-hw-dialog.component";
import { ShowHistoryDialogComponent } from "./hw/show-history-dialog/show-history-dialog.component";
import { AboutDialogComponent } from "./shared/about-dialog/about-dialog.component";
import { AcceleratorStringComponent } from "./shared/accelerator-string/accelerator-string.component";
import { ConfigService } from "./shared/config/config.service";
import { CsvDialogComponent } from "./shared/csv-dialog/csv-dialog.component";
import { DialogActionsComponent } from "./shared/dialog-actions/dialog-actions.component";
import { DialogTitleComponent } from "./shared/dialog-title/dialog-title.component";
import { DisableControlDirective } from "./shared/edit/disable-control.directive";
import { EditVlanComponent } from "./shared/edit/edit-vlan/edit-vlan.component";
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
import { HeadComponent } from "./shared/head/head.component";
import { MatPaginatorIntlDe } from "./shared/mat.paginator.intl.de";
import { StatusComponent } from "./shared/status/status.component";
import { HeaderCellComponent } from "./shared/table/header-cell/header-cell.component";
import { PaginatorStatusDirective } from "./shared/table/paginator-status.directive";
import { StdTableComponent } from "./shared/table/std-table/std-table.component";
import { TooltipOnEllipsisDirective } from "./shared/tooltip-on-ellipsis.directive";
import { Version } from "./shared/version";
import { YesNoDialogComponent } from "./shared/yes-no-dialog/yes-no-dialog.component";

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
    ConfComponent,
    ConfDetailCellComponent,
    HwAussondDialogComponent,
    EditVlanComponent,
    EditConfigComponent,
    AdminPanelExtprogComponent,
    StdTableComponent,
    AdminPanelAptypComponent,
    EditAptypDialogComponent,
    AdminPanelTclogsComponent,
    EditExtprogDialogComponent,
    AdminPanelTagtypComponent,
    EditTagtypDialogComponent,
    AdminPanelApkategorieComponent,
    EditApkategorieDialogComponent,
    AdminPanelHwtypComponent,
    EditHwtypDialogComponent,
    AdminPanelAdresseComponent,
    EditAdresseDialogComponent,
    AdminPanelOeComponent,
    EditOeDialogComponent,
    AdminPanelVlanComponent,
    EditVlanDialogComponent,
    ApEditMultiDialogComponent,
    EditMultiComponent,
    HwEditMultiDialogComponent,
    EditHwMultiComponent,
    AdminPanelAussondComponent,
    NewAussondMeldComponent,
    MoveDialogComponent,
  ],
  imports: [
    A11yModule,
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

  providers: [
    { provide: LOCALE_ID, useValue: "de" }, // registerLocaleData() s.o.

    // -- eigene
    //    app startet erst, wenn das Promise aus initConf aufgeloest ist
    //    -> login, config holen, usw.
    {
      provide: APP_INITIALIZER,
      useFactory: initConf,
      deps: [ConfigService],
      multi: true,
    },
    // paginator uebersetzen
    { provide: MatPaginatorIntl, useClass: MatPaginatorIntlDe },
    // Error handler
    { provide: ErrorHandler, useClass: ErrorService },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
