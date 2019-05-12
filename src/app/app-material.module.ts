import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import {
  MatButtonModule,
  MatIconModule,
  MatInputModule,
  MatMenuModule,
  MatPaginatorModule,
  MatProgressSpinnerModule,
  MatSelectModule,
  MatSidenavModule,
  MatSortModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
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
              MatPaginatorModule,
              MatProgressSpinnerModule,
              MatSelectModule,
              MatSidenavModule,
              MatSortModule,
              MatTableModule,
              MatTabsModule,
              MatToolbarModule,
              MatTooltipModule,
              MatTreeModule,

            ]
          })
export class AppMaterialModule {
}
