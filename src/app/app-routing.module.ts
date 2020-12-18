import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ErrorService } from "@hb42/lib-client";
import { AdminPanelApFilterComponent } from "./admin/admin-panel-ap-filter/admin-panel-ap-filter.component";
import { AdminPanelConfigComponent } from "./admin/admin-panel-config/admin-panel-config.component";
import { AdminComponent } from "./admin/admin/admin.component";
import { ApComponent } from "./ap/ap/ap.component";
import { HwComponent } from "./hw/hw/hw.component";
import { AdminGuard } from "./shared/admin.guard";
import { ErrorComponent } from "./shared/error/error.component";

const AP_PATH = "ap";
const HW_PATH = "hw";
const ADM_PATH = "admin";

const ADM_APFILTER = "apfilter";
const ADM_CONFIG = "config";

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
        path: ADM_APFILTER,
        component: AdminPanelApFilterComponent,
        canActivate: [AdminGuard],
      },
      {
        path: ADM_CONFIG,
        component: AdminPanelConfigComponent,
        canActivate: [AdminGuard],
      },
    ],
  },
  { path: ErrorService.errorPage, component: ErrorComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: "legacy" })],
  exports: [RouterModule],
})
export class AppRoutingModule {
  public static apPath = AP_PATH;
  public static hwPath = HW_PATH;
  public static admPath = ADM_PATH;

  public static admApfilterPath = ADM_PATH + "/" + ADM_APFILTER;
  public static admConfig = ADM_PATH + "/" + ADM_CONFIG;
}
