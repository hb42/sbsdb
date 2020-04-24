import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AppRoutingModule } from "../../app-routing.module";
import { ArbeitsplatzService } from "../arbeitsplatz.service";
import { OeTreeItem } from "../model/oe.tree.item";

@Component({
  selector: "sbsdb-ap-tree",
  templateUrl: "./ap-tree.component.html",
  styleUrls: ["./ap-tree.component.scss"],
})
export class ApTreeComponent implements OnInit {
  // @HostBinding("attr.class") cssClass = "flex-content";

  constructor(public apService: ArbeitsplatzService, private router: Router) {}

  public async ngOnInit() {
    // await this.apService.getOeTree();
    if (this.apService.urlParams.tree && this.apService.urlParams.tree === "oe") {
      // this.apService.expandTree(this.apService.urlParams.id);
    }
  }

  public hasChild = (_: number, node: OeTreeItem) => !!node.children && node.children.length > 0;

  public select(node: OeTreeItem) {
    console.debug("node selected " + node.id);
    this.apService.selected = node;
    this.router.navigate(["/" + AppRoutingModule.apPath, { tree: "oe", id: node.id }]);
  }

  public isSelected = (id: number) =>
    !!this.apService.selected && this.apService.selected.id === id;

  public showInfo(node) {
    window.alert(node.oeff);
  }
}
