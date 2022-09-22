import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { environment } from "../../../environments/environment";

@Component({
  selector: "sbsdb-dialog-title",
  templateUrl: "./dialog-title.component.html",
  styleUrls: ["./dialog-title.component.scss"],
})
export class DialogTitleComponent implements OnInit {
  public static NO_NAV = -1;
  public static NAV_DISABLED = 0;
  public static NAV_BACK = 0b01;
  public static NAV_FORWARD = 0b10;
  public static NAV_BOTH = 0b11;

  @Input() dialogTitle: string;
  @Input() formGroup: FormGroup;
  @Input() showNav: number; // -1 = no show, 0 = disabled, 0b01 = back, 0b10 = fore, 0b11 = both
  @Output() public navBack: EventEmitter<void>;
  @Output() public navForward: EventEmitter<void>;

  public show = false;
  public back = false;
  public forward = false;

  constructor() {
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
    this.navBack = new EventEmitter<void>();
    this.navForward = new EventEmitter<void>();
  }

  ngOnInit(): void {
    this.show = this.showNav > 0;
    this.back = this.showNav > 0 && (this.showNav & DialogTitleComponent.NAV_BACK) > 0;
    this.forward = this.showNav > 0 && (this.showNav & DialogTitleComponent.NAV_FORWARD) > 0;
  }

  public navigateBack(): void {
    if (this.navBack) {
      this.navBack.emit();
    }
  }

  public navigateForward(): void {
    if (this.navForward) {
      this.navForward.emit();
    }
  }
}
