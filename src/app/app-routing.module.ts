import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ErrorService } from "@hb42/lib-client";
import { AdminComponent } from "./admin/admin/admin.component";
import { ApComponent } from "./ap/ap/ap.component";
import { HwComponent } from "./hw/hw/hw.component";
import { ErrorComponent } from "./shared/error/error.component";

// TODO Pfadnamen als const exportieren

const routes: Routes = [
  {path: "", redirectTo: "/ap", pathMatch: "full"},
  {path: "ap", component: ApComponent},
  {path: "hw", component: HwComponent},
  {path: "admin", component: AdminComponent},
  {path: ErrorService.errorPage, component: ErrorComponent}
];

@NgModule({
            imports: [RouterModule.forRoot(routes)],
            exports: [RouterModule]
          })
export class AppRoutingModule {
}
