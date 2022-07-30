import { Component, HostBinding } from "@angular/core";
import {
  ADM_ADR_PATH,
  ADM_APKAT_PATH,
  ADM_APTYP_PATH,
  ADM_EXTPROG_PATH,
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
  public menu = [
    {
      route: "/" + ADM_PATH + "/" + ADM_OPTIONS_PATH,
      title: "Allgemeine Programmparameter",
      text: "Globale Konfiguration",
    },
    // FIXME das muss ueberarbeitet werden! -> #31
    // {
    //   route: "/" + ADM_PATH + "/" + ADM_FILTER_PATH,
    //   title: "Selbstdefinierte Filter allen Benutzern bereitstellen",
    //   text: "Globale Arbeitsplatzfilter",
    // },
    {
      route: "/" + ADM_PATH + "/" + ADM_APKAT_PATH,
      title: "Arbeitsplatz-Kategorien bearbeiten",
      text: "AP-Kategorien",
    },
    {
      route: "/" + ADM_PATH + "/" + ADM_APTYP_PATH,
      title: "Arbeitsplatz-Typen bearbeiten",
      text: "AP-Typen",
    },
    {
      route: "/" + ADM_PATH + "/" + ADM_EXTPROG_PATH,
      title: "Externe Programmaufrufe zu AP-Typen zuordnen",
      text: "Externe Programme",
    },
    {
      route: "/" + ADM_PATH + "/" + ADM_ADR_PATH,
      title: "Adressen für OEs bearbeiten",
      text: "Hausanschriften",
    },
    {
      route: "/" + ADM_PATH + "/" + ADM_HWTYP_PATH,
      title: "Hardware-Typen bearbeiten",
      text: "HW-Typen",
    },
    {
      route: "/" + ADM_PATH + "/" + ADM_OE_PATH,
      title: "Organisationseinheiten bearbeiten",
      text: "OE",
    },
    {
      route: "/" + ADM_PATH + "/" + ADM_TAGTYP_PATH,
      title: "Sonstige Informations-Typen bearbeiten",
      text: "TAG-Typen",
    },
    { route: "/" + ADM_PATH + "/" + ADM_VLAN_PATH, title: "Netzwerke bearbeiten", text: "Vlans" },
    {
      route: "/" + ADM_PATH + "/" + ADM_TCLOGS_PATH,
      title: "Protokoll des letzten Thin-Client-IP-Imports",
      text: "Thin-Client-Log",
    },
  ];
  // public admApFilterPath = "/" + ADM_PATH + "/" + ADM_FILTER_PATH;
  // public admConfigPath = "/" + ADM_PATH + "/" + ADM_OPTIONS_PATH;
  // public admAdressePath = "/" + ADM_PATH + "/" + ADM_ADR_PATH;
  // public admApkategoriePath = "/" + ADM_PATH + "/" + ADM_APKAT_PATH;
  // public admAptypPath = "/" + ADM_PATH + "/" + ADM_APTYP_PATH;
  // public admExtprogPath = "/" + ADM_PATH + "/" + ADM_EXTPROG_PATH;
  // public admHwtypPath = "/" + ADM_PATH + "/" + ADM_HWTYP_PATH;
  // public admOePath = "/" + ADM_PATH + "/" + ADM_OE_PATH;
  // public admTagtypPath = "/" + ADM_PATH + "/" + ADM_TAGTYP_PATH;
  // public admVlanPath = "/" + ADM_PATH + "/" + ADM_VLAN_PATH;
  // public admTcLogsPath = "/" + ADM_PATH + "/" + ADM_TCLOGS_PATH;

  constructor(public navigationService: NavigationService) {}
}
