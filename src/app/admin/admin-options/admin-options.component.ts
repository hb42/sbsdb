import { Component, HostBinding } from "@angular/core";
import {
  ADM_ADR_PATH,
  ADM_APKAT_PATH,
  ADM_APTYP_PATH,
  ADM_EXTPROG_PATH,
  ADM_FILTER_PATH,
  ADM_HWTYP_PATH,
  ADM_OE_PATH,
  ADM_OPTIONS_PATH,
  ADM_PATH,
  ADM_TAGTYP_PATH,
  ADM_TCLOGS_PATH,
  ADM_VLAN_PATH,
} from "../../const";
import { NavigationService } from "../../shared/navigation.service";

@Component({
  selector: "sbsdb-admin-options",
  templateUrl: "./admin-options.component.html",
  styleUrls: ["./admin-options.component.scss"],
})
export class AdminOptionsComponent {
  @HostBinding("attr.class") public cssClass = "flex-content";
  public admApFilterPath = "/" + ADM_PATH + "/" + ADM_FILTER_PATH;
  public admConfigPath = "/" + ADM_PATH + "/" + ADM_OPTIONS_PATH;
  public admAdressePath = "/" + ADM_PATH + "/" + ADM_ADR_PATH;
  public admApkategoriePath = "/" + ADM_PATH + "/" + ADM_APKAT_PATH;
  public admAptypPath = "/" + ADM_PATH + "/" + ADM_APTYP_PATH;
  public admExtprogPath = "/" + ADM_PATH + "/" + ADM_EXTPROG_PATH;
  public admHwtypPath = "/" + ADM_PATH + "/" + ADM_HWTYP_PATH;
  public admOePath = "/" + ADM_PATH + "/" + ADM_OE_PATH;
  public admTagtypPath = "/" + ADM_PATH + "/" + ADM_TAGTYP_PATH;
  public admVlanPath = "/" + ADM_PATH + "/" + ADM_VLAN_PATH;
  public admTcLogsPath = "/" + ADM_PATH + "/" + ADM_TCLOGS_PATH;

  constructor(public navigationService: NavigationService) {}
}
