import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AdminPanelApFilterComponent } from "./admin/admin-panel-ap-filter/admin-panel-ap-filter.component";
import { AdminPanelConfigComponent } from "./admin/admin-panel-config/admin-panel-config.component";
import { AdminComponent } from "./admin/admin/admin.component";
import { ApComponent } from "./ap/ap/ap.component";
import {
  ADM_FILTER_PATH,
  ADM_OPTIONS_PATH,
  ADM_PATH,
  AP_PATH,
  CONF_PATH,
  ERROR_PATH,
  HW_PATH,
} from "./app-routing-const";
import { ConfComponent } from "./conf/conf/conf.component";
import { HwComponent } from "./hw/hw/hw.component";
import { AdminGuard } from "./shared/admin.guard";
import { ErrorComponent } from "./shared/error/error.component";

const routes: Routes = [
  { path: "", redirectTo: "/" + AP_PATH, pathMatch: "full" },
  { path: AP_PATH, component: ApComponent },
  { path: HW_PATH, component: HwComponent },
  { path: CONF_PATH, component: ConfComponent },
  {
    path: ADM_PATH,
    component: AdminComponent,
    canActivate: [AdminGuard],
    children: [
      {
        path: ADM_FILTER_PATH,
        component: AdminPanelApFilterComponent,
        canActivate: [AdminGuard],
      },
      {
        path: ADM_OPTIONS_PATH,
        component: AdminPanelConfigComponent,
        canActivate: [AdminGuard],
      },
    ],
  },
  { path: ERROR_PATH, component: ErrorComponent },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      /*relativeLinkResolution: "legacy",*/
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
