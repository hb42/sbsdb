import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ErrorService } from "@hb42/lib-client";
import { ApComponent } from "./ap/ap/ap.component";
import { HwComponent } from "./hw/hw/hw.component";
import { ErrorComponent } from "./shared/error/error.component";

const routes: Routes = [
  {path: "", component: ApComponent},
  {path: "ap", component: ApComponent},
  {path: "hw", component: HwComponent},
  {path: ErrorService.errorPage, component: ErrorComponent}
];

@NgModule({
            imports: [RouterModule.forRoot(routes)],
            exports: [RouterModule]
          })
export class AppRoutingModule {
}
