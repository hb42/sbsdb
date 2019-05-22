import {Component, Input, OnInit} from "@angular/core";

/**
 * Status-Zeile
 *
 * Wird links unten eingeblendet. Die Position kann vorgegeben werden,
 * weitere Formatierung ueber class sbsdb-status.
 */
@Component({
             selector   : "sbsdb-status",
             templateUrl: "./status.component.html",
             styleUrls  : ["./status.component.scss"]
           })
export class StatusComponent implements OnInit {
  // @HostBinding("attr.class") cssClass = "status-panel";
  // @HostBinding("style.left.px") st_left: number;
  // @HostBinding("style.bottom.px") st_bottom: number;

  @Input() left = 10;   // Abstand von links in px
  @Input() bottom = 10; // Abstand von unten in px
  @Input() text = "";   // anzuzeigender Text

  public panelPosition;

  constructor() {
  }

  ngOnInit() {
    // this.st_left = this.left;
    // this.st_bottom = this.bottom;
    this.panelPosition = {
      "left"  : this.left + "px",
      "bottom": this.bottom + "px",
    };
  }

}
