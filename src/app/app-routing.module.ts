import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ErrorService } from "@hb42/lib-client";
import { AdminComponent } from "./admin/admin/admin.component";
import { ApComponent } from "./ap/ap/ap.component";
import { HwComponent } from "./hw/hw/hw.component";
import { ErrorComponent } from "./shared/error/error.component";

const AP_PATH = "ap";
const HW_PATH = "hw";
const ADM_PATH = "admin";

const routes: Routes = [
  {path: "", redirectTo: "/" + AP_PATH, pathMatch: "full"},
  {path: AP_PATH, component: ApComponent},
  {path: HW_PATH, component: HwComponent},
  {path: ADM_PATH, component: AdminComponent},
  {path: ErrorService.errorPage, component: ErrorComponent}
];

@NgModule({
            imports: [RouterModule.forRoot(routes)],
            exports: [RouterModule]
          })
export class AppRoutingModule {
  public static apPath = AP_PATH;
  public static hwPath = HW_PATH;
  public static admPath = ADM_PATH;
}
