import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AdminPanelAdresseComponent } from "./admin/admin-panel-adresse/admin-panel-adresse.component";
import { AdminPanelApFilterComponent } from "./admin/admin-panel-ap-filter/admin-panel-ap-filter.component";
import { AdminPanelApkategorieComponent } from "./admin/admin-panel-apkategorie/admin-panel-apkategorie.component";
import { AdminPanelAptypComponent } from "./admin/admin-panel-aptyp/admin-panel-aptyp.component";
import { AdminPanelConfigComponent } from "./admin/admin-panel-config/admin-panel-config.component";
import { AdminPanelExtprogComponent } from "./admin/admin-panel-extprog/admin-panel-extprog.component";
import { AdminPanelHwtypComponent } from "./admin/admin-panel-hwtyp/admin-panel-hwtyp.component";
import { AdminPanelTagtypComponent } from "./admin/admin-panel-tagtyp/admin-panel-tagtyp.component";
import { AdminPanelTclogsComponent } from "./admin/admin-panel-tclogs/admin-panel-tclogs.component";
import { AdminComponent } from "./admin/admin/admin.component";
import { ApComponent } from "./ap/ap/ap.component";
import { ConfComponent } from "./conf/conf/conf.component";
import {
  ADM_ADR_PATH,
  ADM_APKAT_PATH,
  ADM_APTYP_PATH,
  ADM_AUSSOND_PATH,
  ADM_EXTPROG_PATH,
  ADM_FILTER_PATH,
  ADM_HWTYP_PATH,
  ADM_OE_PATH,
  ADM_OPTIONS_PATH,
  ADM_PATH,
  ADM_TAGTYP_PATH,
  ADM_TCLOGS_PATH,
  ADM_VLAN_PATH,
  AP_PATH,
  CONF_PATH,
  ERROR_PATH,
  HW_PATH,
} from "./const";
import { HwComponent } from "./hw/hw/hw.component";
import { AdminGuard } from "./shared/admin.guard";
import { ErrorComponent } from "./shared/error/error.component";
import { AdminPanelOeComponent } from "./admin/admin-panel-oe/admin-panel-oe.component";
import { AdminPanelVlanComponent } from "./admin/admin-panel-vlan/admin-panel-vlan.component";
import { AdminPanelAussondComponent } from "./admin/admin-panel-aussond/admin-panel-aussond.component";

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
      { path: ADM_FILTER_PATH, component: AdminPanelApFilterComponent, canActivate: [AdminGuard] },
      { path: ADM_OPTIONS_PATH, component: AdminPanelConfigComponent, canActivate: [AdminGuard] },
      { path: ADM_AUSSOND_PATH, component: AdminPanelAussondComponent, canActivate: [AdminGuard] },
      { path: ADM_ADR_PATH, component: AdminPanelAdresseComponent, canActivate: [AdminGuard] },
      {
        path: ADM_APKAT_PATH,
        component: AdminPanelApkategorieComponent,
        canActivate: [AdminGuard],
      },
      { path: ADM_APTYP_PATH, component: AdminPanelAptypComponent, canActivate: [AdminGuard] },
      { path: ADM_EXTPROG_PATH, component: AdminPanelExtprogComponent, canActivate: [AdminGuard] },
      { path: ADM_HWTYP_PATH, component: AdminPanelHwtypComponent, canActivate: [AdminGuard] },
      { path: ADM_OE_PATH, component: AdminPanelOeComponent, canActivate: [AdminGuard] },
      { path: ADM_TAGTYP_PATH, component: AdminPanelTagtypComponent, canActivate: [AdminGuard] },
      { path: ADM_VLAN_PATH, component: AdminPanelVlanComponent, canActivate: [AdminGuard] },
      { path: ADM_TCLOGS_PATH, component: AdminPanelTclogsComponent, canActivate: [AdminGuard] },
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
