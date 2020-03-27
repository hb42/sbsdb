import { Component, Input, OnInit } from "@angular/core";

/**
 * Status-Zeile
 *
 * Wird links unten eingeblendet. Die Position kann vorgegeben werden,
 * weitere Formatierung ueber class sbsdb-status.
 */
@Component({
  selector: "sbsdb-status",
  templateUrl: "./status.component.html",
  styleUrls: ["./status.component.scss"],
})
export class StatusComponent implements OnInit {
  // @HostBinding("attr.class") cssClass = "status-panel";
  // @HostBinding("style.left.px") st_left: number;
  // @HostBinding("style.bottom.px") st_bottom: number;

  @Input() public left = 10; // Abstand von links in px
  @Input() public bottom = 10; // Abstand von unten in px
  @Input() public text = ""; // anzuzeigender Text

  public panelPosition;

  // tslint:disable-next-line:no-empty
  constructor() {}

  public ngOnInit() {
    // this.st_left = this.left;
    // this.st_bottom = this.bottom;
    this.panelPosition = {
      left: this.left + "px",
      bottom: this.bottom + "px",
    };
  }
}
