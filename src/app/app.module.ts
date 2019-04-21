import { HttpClientModule } from "@angular/common/http";
import { APP_INITIALIZER, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
// tslint:disable-next-line:no-submodule-imports
import { LibClientModule, LOGON_OPTIONS, LogonParameter } from "@hb42/lib-client/lib/src";
import {
  ButtonModule,
  CheckboxModule,
  DropdownModule,
  InputTextModule,
  MegaMenuModule,
  MenubarModule,
  MenuModule,
  MessageModule,
  MessagesModule,
  OverlayPanelModule,
  PanelModule,
  PickListModule,
  RadioButtonModule,
  SelectButtonModule,
  SharedModule,
  SlideMenuModule,
  SplitButtonModule,
  TabMenuModule,
  TieredMenuModule,
  ToolbarModule,
  TooltipModule,
  TreeModule
} from "primeng/primeng";
import { TableModule } from "primeng/table";
import { ApListComponent } from "./ap/ap-list/ap-list.component";
import { ApTreeComponent } from "./ap/ap-tree/ap-tree.component";
import { ApComponent } from "./ap/ap/ap.component";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { HwListComponent } from "./hw/hw-list/hw-list.component";
import { HwTreeComponent } from "./hw/hw-tree/hw-tree.component";
import { HwComponent } from "./hw/hw/hw.component";
import { UserService } from "./shared/config/user.service";
import { FootComponent } from "./shared/foot/foot.component";
import { HeadComponent } from "./shared/head/head.component";

// FIXME interceptor in lib-client muss auf optional umgebaut werden
//       (oder farc auf IIS/.NET Core umstellen)
export function logonOptionsFactory(): LogonParameter {
  return {
    logon: "NO"
  };
}

// Damit UserService so frueh, wie moeglich geladen wird und die Benutzer-Daten
// fuer alle anderen Services verfuegbar sind (holt implizit ConfigService)..
// (fn , die fn liefert, die ein Promise liefert)
// mit AOT fkt. nur das folgende Konstrukt
export function initConf(userService: UserService) {
  return () => userService.init();
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
        HwComponent
      ],
      imports     : [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        HttpClientModule,

        // -- primeng
        ButtonModule,
        CheckboxModule,
        DropdownModule,
        InputTextModule,
        MegaMenuModule,
        MenubarModule,
        MenuModule,
        MessageModule,
        MessagesModule,
        OverlayPanelModule,
        PanelModule,
        PickListModule,
        RadioButtonModule,
        SelectButtonModule,
        SharedModule,  // w/template etc.
        SlideMenuModule,
        SplitButtonModule,
        TableModule,
        TabMenuModule,
        TieredMenuModule,
        ToolbarModule,
        TooltipModule,
        TreeModule,

        // -- eigene
        LibClientModule,

      ],
      providers   : [
        // -- eigene
        // app startet erst, wenn das Promise aus initConf aufgeloest ist
        // -> login, config holen, usw.
        {
          provide   : APP_INITIALIZER,
          useFactory: initConf,
          deps      : [UserService],  // f. IE11-Prob. + Injector
          multi     : true
        },

        // Konfig fuer Autologon
        {
          provide   : LOGON_OPTIONS,
          useFactory: logonOptionsFactory
        },

      ],
      bootstrap   : [AppComponent]
    })
export class AppModule {
}
