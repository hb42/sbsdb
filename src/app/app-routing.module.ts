import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ApComponent } from "./ap/ap/ap.component";
import { HwComponent } from "./hw/hw/hw.component";

const routes: Routes = [
  {path: "", component: ApComponent},
  {path: "ap", component: ApComponent},
  {path: "ap/:tree", component: ApComponent},
  {path: "hw", component: HwComponent}
];

@NgModule({
            imports: [RouterModule.forRoot(routes)],
            exports: [RouterModule]
          })
export class AppRoutingModule {
}
