import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import {
  MatButtonModule,
  MatIconModule,
  MatInputModule,
  MatMenuModule,
  MatSidenavModule, MatSortModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTreeModule
} from "@angular/material";

@NgModule({
            declarations: [],
            imports     : [
              CommonModule
            ],
            exports     : [
              MatButtonModule,
              MatIconModule,
              MatInputModule,
              MatMenuModule,
              MatSidenavModule,
              MatSortModule,
              MatTableModule,
              MatTabsModule,
              MatToolbarModule,
              MatTreeModule,

            ]
          })
export class AppMaterialModule {
}
