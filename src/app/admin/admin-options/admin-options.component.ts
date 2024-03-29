import { Component, HostBinding } from "@angular/core";
import { ThemePalette } from "@angular/material/core";
import { environment } from "../../../environments/environment";
import {
  ADM_ADR_PATH,
  ADM_APKAT_PATH,
  ADM_APTYP_PATH,
  ADM_AUSSOND_PATH,
  ADM_EXTPROG_PATH,
  ADM_HWTYP_PATH,
  ADM_OE_PATH,
  ADM_OPTIONS_PATH,
  ADM_TAGTYP_PATH,
  ADM_TCLOGS_PATH,
  ADM_VLAN_PATH,
} from "../../const";
import { AdminService } from "../admin.service";

@Component({
  selector: "sbsdb-admin-options",
  templateUrl: "./admin-options.component.html",
  styleUrls: ["./admin-options.component.scss"],
})
export class AdminOptionsComponent {
  @HostBinding("attr.class") public cssClass = "flex-content";
  // Fehlermeldungen im HTML vermeiden
  public primarycolor: ThemePalette = "primary";
  public defaultcolor: ThemePalette = undefined;

  public menu = [
    {
      route: ADM_OPTIONS_PATH,
      title: "Allgemeine Programmparameter",
      text: "Globale Konfiguration",
    },
    {
      route: ADM_APKAT_PATH,
      title: "Arbeitsplatz-Kategorien bearbeiten",
      text: "AP-Kategorien",
    },
    {
      route: ADM_APTYP_PATH,
      title: "Arbeitsplatz-Typen bearbeiten",
      text: "AP-Typen",
    },
    { route: ADM_AUSSOND_PATH, title: "Aussonderungen bearbeiten", text: "Aussonderungen" },
    {
      route: ADM_EXTPROG_PATH,
      title: "Externe Programmaufrufe zu AP-Typen zuordnen",
      text: "Externe Programme",
    },
    {
      route: ADM_ADR_PATH,
      title: "Adressen für OEs bearbeiten",
      text: "Hausanschriften",
    },
    {
      route: ADM_HWTYP_PATH,
      title: "Hardware-Typen bearbeiten",
      text: "HW-Typen",
    },
    {
      route: ADM_OE_PATH,
      title: "Organisationseinheiten bearbeiten",
      text: "OE",
    },
    {
      route: ADM_TAGTYP_PATH,
      title: "Sonstige Informations-Typen bearbeiten",
      text: "TAG-Typen",
    },
    { route: ADM_VLAN_PATH, title: "Netzwerke bearbeiten", text: "Vlans" },
    {
      route: ADM_TCLOGS_PATH,
      title: "Protokoll des letzten Thin-Client-IP-Imports",
      text: "Thin-Client-Log",
    },
  ];

  constructor(public adminService: AdminService) {
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
  }
}
