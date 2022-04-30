import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { DataService } from "../../shared/data.service";
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

  public apStr: string;
  public removeAp = false;

  constructor(
    private dataService: DataService,
    private formBuilder: FormBuilder,
    private cdRef: ChangeDetectorRef,
    public hwService: HwService
  ) {
    console.debug("c'tor EditHwApCompomnenmt");
    this.apReady = new EventEmitter<boolean>();
    this.formGroup = this.formBuilder.group({});
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
    }
    this.onDelAp.emit(); // edit-vlan bebachrichtigen
  }

  public submit(): void {
    this.apReady.emit(this.removeAp);
  }
}
