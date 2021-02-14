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
import { ApFilterBracketComponent } from "./ap/ap-filter-bracket/ap-filter-bracket.component";
import { ApFilterEditListComponent } from "./ap/ap-filter-edit-list/ap-filter-edit-list.component";
import { ApFilterEditComponent } from "./ap/ap-filter-edit/ap-filter-edit.component";
import { ApFilterElementComponent } from "./ap/ap-filter-element/ap-filter-element.component";
import { ApFilterComponent } from "./ap/ap-filter/ap-filter.component";
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
    ApFilterComponent,
    ApFilterElementComponent,
    ApFilterBracketComponent,
    ApFilterEditComponent,
    ApFilterEditListComponent,
    AdminOptionsComponent,
    AdminPanelApFilterComponent,
    AdminPanelConfigComponent,
    AdminPanelConfigInputComponent,
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
