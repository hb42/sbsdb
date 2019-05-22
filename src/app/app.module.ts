import {registerLocaleData} from "@angular/common";
import {HttpClientModule} from "@angular/common/http";
import localeDe from "@angular/common/locales/de";
import {APP_INITIALIZER, LOCALE_ID, NgModule} from "@angular/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatPaginatorIntl} from "@angular/material";
import {BrowserModule} from "@angular/platform-browser";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {LibClientModule, LOGON_OPTIONS, LogonParameter} from "@hb42/lib-client";

import {AdminComponent} from "./admin/admin/admin.component";
import {ApListComponent} from "./ap/ap-list/ap-list.component";
import {ApTreeComponent} from "./ap/ap-tree/ap-tree.component";
import {ApComponent} from "./ap/ap/ap.component";
import {AppMaterialModule} from "./app-material.module";
import {AppRoutingModule} from "./app-routing.module";
import {AppComponent} from "./app.component";
import {HwListComponent} from "./hw/hw-list/hw-list.component";
import {HwTreeComponent} from "./hw/hw-tree/hw-tree.component";
import {HwComponent} from "./hw/hw/hw.component";
import {ConfigService} from "./shared/config/config.service";
import {ErrorComponent} from "./shared/error/error.component";
import {FootComponent} from "./shared/foot/foot.component";
import {HeadComponent} from "./shared/head/head.component";
import {MatPaginatorIntlDe} from "./shared/mat.paginator.intl.de";
import {StatusComponent} from "./shared/status/status.component";

// FIXME interceptor in lib-client muss auf optional umgebaut werden
//       (oder farc auf IIS/.NET Core umstellen)
export function logonOptionsFactory(): LogonParameter {
  return {
    logon: "NO"
  };
}

registerLocaleData(localeDe);  // + provider, s.u.

// Damit ConfigService so frueh, wie moeglich geladen wird und die Config-Daten
// (u.a. Benutzer-Session) fuer alle anderen Services verfuegbar sind.
// (fn , die fn liefert, die ein Promise liefert)
// mit AOT fkt. nur das folgende Konstrukt
export function initConf(configService: ConfigService) {
  return () => configService.init();
}

@NgModule(
    {
      declarations: [
        AppComponent,
        HeadComponent,
        FootComponent,
        ApTreeComponent,
        ApListComponent,
        HwListComponent,
        HwTreeComponent,
        ApComponent,
        HwComponent,
        ErrorComponent,
        AdminComponent,
        StatusComponent
      ],
      imports     : [
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
      providers   : [
        {provide: LOCALE_ID, useValue: "de"},  // registerLocaleData() s.o.
        // -- eigene
        // app startet erst, wenn das Promise aus initConf aufgeloest ist
        // -> login, config holen, usw.
        {
          provide   : APP_INITIALIZER,
          useFactory: initConf,
          deps      : [ConfigService],  // f. IE11-Prob. + Injector
          multi     : true
        },
        // paginator uebersetzen
        {provide: MatPaginatorIntl, useClass: MatPaginatorIntlDe},

        // Konfig fuer Autologon TODO Altschuld, entfernen, sobald lib-client umgebaut
        {
          provide   : LOGON_OPTIONS,
          useFactory: logonOptionsFactory
        },

      ],
      bootstrap   : [AppComponent]
    })
export class AppModule {
}
