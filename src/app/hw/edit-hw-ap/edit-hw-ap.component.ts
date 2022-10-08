import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { ThemePalette } from "@angular/material/core";
import { environment } from "../../../environments/environment";
import { Hardware } from "../../shared/model/hardware";
import { HwService } from "../hw.service";

@Component({
  selector: "sbsdb-edit-hw-ap",
  templateUrl: "./edit-hw-ap.component.html",
  styleUrls: ["./edit-hw-ap.component.scss"],
})
export class EditHwApComponent implements OnInit {
  @Input() public hw: Hardware;
  @Input() public formGroup: FormGroup; // uebergeordnete formGroup
  @Input() public onDelAp: EventEmitter<void>;
  @Input() public onSubmit: EventEmitter<void>; // fuer den submit der form
  @Output() public apReady: EventEmitter<boolean>; // liefert die zu aenderenden Daten
  // Fehlermeldungen im HTML vermeiden
  public accentcolor: ThemePalette = "accent";
  public defaultcolor: ThemePalette = undefined;

  public apStr: string;
  public removeAp = false;

  constructor(public hwService: HwService) {
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
    this.apReady = new EventEmitter<boolean>();
  }

  public ngOnInit(): void {
    // form submit
    this.onSubmit.subscribe(() => {
      this.submit();
    });
    this.apStr = this.hw.apStr ? this.hw.apStr : null;
  }

  public delAp(): void {
    if (this.apStr) {
      this.apStr = null;
      this.removeAp = true;
      this.formGroup.markAsDirty();
    }
  }

  public submit(): void {
    this.apReady.emit(this.removeAp);
  }
}
