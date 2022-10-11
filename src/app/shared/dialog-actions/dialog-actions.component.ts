import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { environment } from "../../../environments/environment";
import { DialogTitleComponent } from "../dialog-title/dialog-title.component";

@Component({
  selector: "sbsdb-dialog-actions",
  templateUrl: "./dialog-actions.component.html",
  styleUrls: ["./dialog-actions.component.scss"],
})
export class DialogActionsComponent implements OnInit {
  @Input() data: unknown;
  @Input() formGroup: FormGroup;
  @Input() showNav: number; // -1 = no show, 0 = disabled, 0b01 = back, 0b10 = fore, 0b11 = both
  @Output() public navForward: EventEmitter<void>;

  public show: boolean;

  constructor() {
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
    this.navForward = new EventEmitter<void>();
  }

  public isInvalid(): boolean {
    return this.formGroup ? this.formGroup.invalid || !this.formGroup.dirty : false;
  }

  ngOnInit(): void {
    this.show = this.showNav > 0 && (this.showNav & DialogTitleComponent.NAV_FORWARD) > 0;
  }

  public navigateForward(): void {
    if (this.navForward) {
      this.navForward.emit();
    }
  }
}
