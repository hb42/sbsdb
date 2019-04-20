import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
// tslint:disable-next-line:no-submodule-imports
import { LibClientModule } from "@hb42/lib-client/lib/src";
import {
  ButtonModule, CheckboxModule,
  DropdownModule, InputTextModule, MegaMenuModule,
  MenubarModule,
  MenuModule, MessageModule, MessagesModule, OverlayPanelModule,
  PanelModule,
  PickListModule, RadioButtonModule, SelectButtonModule, SharedModule, SlideMenuModule, SplitButtonModule, TabMenuModule, TieredMenuModule,
  ToolbarModule, TooltipModule,
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
import { FootComponent } from "./shared/foot/foot.component";
import { HeadComponent } from "./shared/head/head.component";

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
      imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,

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
      providers   : [],
      bootstrap   : [AppComponent]
    })
export class AppModule {
}
