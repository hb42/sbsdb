import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "sbsdb-accelerator-string",
  templateUrl: "./accelerator-string.component.html",
  styleUrls: ["./accelerator-string.component.scss"],
})
export class AcceleratorStringComponent implements OnInit {
  // accel ist das Zeichen in text, das unterstrichen werden soll
  @Input() text: string;
  @Input() accel: string;

  public pre = "";
  public acc = "";
  public post = "";

  constructor() {}

  ngOnInit() {
    const pos = this.text.toLowerCase().indexOf(this.accel.toLowerCase());
    if (pos === -1) {
      this.pre = this.text; // key nicht gefunden
    } else {
      if (pos === 0) {
        // erstes Zeichen
        this.pre = "";
        this.acc = this.text.charAt(0);
        this.post = this.text.slice(1);
      } else {
        this.pre = this.text.slice(0, pos);
        this.acc = this.text.charAt(pos);
        this.post = this.text.slice(pos + 1);
      }
    }
  }
}
