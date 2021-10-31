import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AdminPanelApFilterComponent } from "./admin/admin-panel-ap-filter/admin-panel-ap-filter.component";
import { AdminPanelConfigComponent } from "./admin/admin-panel-config/admin-panel-config.component";
import { AdminComponent } from "./admin/admin/admin.component";
import { ApComponent } from "./ap/ap/ap.component";
import { ADM_FILTER_PATH, ADM_OPTIONS_PATH, ADM_PATH, AP_PATH, HW_PATH } from "./app-routing-const";
import { HwComponent } from "./hw/hw/hw.component";
import { AdminGuard } from "./shared/admin.guard";
import { ErrorComponent } from "./shared/error/error.component";
import { NavigationService } from "./shared/navigation.service";

const routes: Routes = [
  { path: "", redirectTo: "/" + AP_PATH, pathMatch: "full" },
  { path: AP_PATH, component: ApComponent },
  { path: HW_PATH, component: HwComponent },
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
  { path: NavigationService.errorUrl, component: ErrorComponent },
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
