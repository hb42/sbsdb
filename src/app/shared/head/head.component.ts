import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { MenuItem } from "primeng/api";
import { NavigationService } from "../navigation.service";
import {ConfigService} from "../config/config.service";

@Component({
             selector   : "sbsdb-head",
             templateUrl: "./head.component.html",
             styleUrls  : ["./head.component.scss"]
           })
export class HeadComponent implements OnInit {

  items: MenuItem[];
  mainmenu: MenuItem[];
  mainmenuheight: number;

  public navLinks = [
    {path: "/ap", label: "Arbeitsplätze"},
    {path: "/hw", label: "Hardware"},
    {path: "/admin", label: "Admin"},
  ];

  public search: string;

  constructor(private router: Router, public navigationService: NavigationService,
              public configService: ConfigService) {
  }

  ngOnInit() {
    // TODO das hier ist nur zum testen drin
    this.items = [
      {label: "Angular.io", icon: "fa fa-link", url: "http://angular.io"},
      {label: "Theming", icon: "fa fa-paint-brush", routerLink: ["/theming"]}
    ];

    this.mainmenu = [
      {
        label: "File",
        icon : "pi pi-fw pi-file",
        items: [{
          label: "New",
          icon : "pi pi-fw pi-plus",
          items: [
            {label: "Project"},
            {label: "Other"},
          ]
        },
          {label: "Open"},
          {separator: true},
          {label: "Quit"}
        ]
      },
      {
        label: "Edit",
        icon : "pi pi-fw pi-pencil",
        items: [
          {label: "Delete", icon: "pi pi-fw pi-trash"},
          {label: "Refresh", icon: "pi pi-fw pi-refresh"}
        ]
      },
      {
        label: "Help",
        icon : "pi pi-fw pi-question",
        items: [
          {
            label: "Contents"
          },
          {
            label: "Search",
            icon : "pi pi-fw pi-search",
            items: [
              {
                label: "Text",
                items: [
                  {
                    label: "Workspace"
                  }
                ]
              },
              {
                label: "File"
              }
            ]
          }
        ]
      },
      {
        label: "Actions",
        icon : "pi pi-fw pi-cog",
        items: [
          {
            label: "Edit",
            icon : "pi pi-fw pi-pencil",
            items: [
              {label: "Save", icon: "pi pi-fw pi-save"},
              {label: "Update", icon: "pi pi-fw pi-save"},
            ]
          },
          {
            label: "Other",
            icon : "pi pi-fw pi-tags",
            items: [
              {label: "Delete", icon: "pi pi-fw pi-minus"}
            ]
          }
        ]
      },
      {separator: true},
      {
        label: "Quit", icon: "pi pi-fw pi-times"
      }
    ];

    this.mainmenuheight = this.mainmenu.length * 41;
  }

  public navigate(target: string) {
    if (!this.navigationService.isPage(target)) {
      this.router.navigate([target]);
    }
  }

  public backBtn() {
    history.back();
  }

  public forwardBtn() {
    history.forward();
  }

}
