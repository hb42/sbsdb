import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatMenuModule } from "@angular/material/menu";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSelectModule } from "@angular/material/select";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatSortModule } from "@angular/material/sort";
import { MatTableModule } from "@angular/material/table";
import { MatTabsModule } from "@angular/material/tabs";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatTreeModule } from "@angular/material/tree";

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
