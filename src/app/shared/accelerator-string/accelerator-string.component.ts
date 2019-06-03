import {Component, Input, OnInit} from "@angular/core";

@Component({
             selector   : "sbsdb-accelerator-string",
             templateUrl: "./accelerator-string.component.html",
             styleUrls  : ["./accelerator-string.component.scss"]
           })
export class AcceleratorStringComponent implements OnInit {

  // '&' markiert das Zeichen, das unterstirchen werden soll
  @Input() text: string;

  public pre = "";
  public acc = "";
  public post = "";

  constructor() {
  }

  ngOnInit() {
    if (this.text.indexOf("&") === -1) {
      this.pre = this.text;  // kein '&'
    } else {
      const parts = this.text.split("&");
      if (parts.length === 1) {  // '&' als erstes Zeichen
        this.pre = "";
        this.acc = parts[0].charAt(0);
        this.post = parts[0].slice(1);
      } else if (parts.length === 2) {
        this.pre = parts[0];
        this.acc = parts[1].charAt(0);
        this.post = parts[1].slice(1);
      } else {  // mehr als 1 '&' -> alle ignorieren
        this.pre = parts.join();
      }
    }
  }

}
