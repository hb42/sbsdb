import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { DataService } from "../../shared/data.service";
import { FormFieldErrorStateMatcher } from "../../shared/form-field-error-state-matcher";
import { IpHelper } from "../../shared/ip-helper";
import { Arbeitsplatz } from "../../shared/model/arbeitsplatz";
import { Hardware } from "../../shared/model/hardware";
import { Vlan } from "../../shared/model/vlan";
import { ApService } from "../ap.service";
import { HwInput } from "../edit-hw/hw-input";
import { HwApInput } from "./hw-ap-input";
import { HwChange } from "./hw-change";
import { HwVlanChange } from "./hw-vlan-change";

@Component({
  selector: "sbsdb-edit-ap-hw",
  templateUrl: "./edit-ap-hw.component.html",
  styleUrls: ["./edit-ap-hw.component.scss"],
})
export class EditApHwComponent implements OnInit {
  @Input() public ap: Arbeitsplatz;
  @Input() public formGroup: FormGroup; // uebergeordnete formGroup
  @Input() public onSubmit: EventEmitter<void>; // fuer den submit der form
  @Output() public hwReady: EventEmitter<HwChange>; // liefert die zu aenderenden Daten

  public matcher = new FormFieldErrorStateMatcher();
  public hwFormGroup: FormGroup;
  public periFormGroup: FormGroup;
  public data: HwApInput;

  constructor(
    private dataService: DataService,
    private formBuilder: FormBuilder,
    private cdRef: ChangeDetectorRef,
    private apService: ApService
  ) {
    console.debug("c'tor EditApHwCompomnenmt");
    this.hwReady = new EventEmitter<HwChange>();
    this.hwFormGroup = this.formBuilder.group({});
    this.periFormGroup = this.formBuilder.group({});
  }

  public ngOnInit(): void {
    this.onSubmit.subscribe(() => {
      // resultHW = [] -> hwId, mac, vlanId, ip
      this.submit();
    });
    this.data = { apid: this.ap.apId, priHw: this.priHw(), periph: this.periHw() };
    // an die uebergeordnete Form anhaengen
    this.formGroup.addControl("prihw", this.hwFormGroup);
    this.formGroup.addControl("perihw", this.periFormGroup);
  }

  public submit(): void {
    console.debug("edit hw submit");
    const changes: HwChange = {
      apid: this.ap.apId,
      priVlans: [],
      periph: [],
    };

    const oldpri = this.data.priHw.hw;
    const oldpriId = oldpri?.id ?? 0;
    const newpri = this.data.priHw.hwCtrl.value as Hardware;
    const newpriId = newpri?.id ?? 0;
    if (oldpriId != newpriId) {
      // pri hw changed
      changes.newpriId = newpriId;
    }
    // vlan-changes priHw
    // (this.data.priHw.hw.hwKonfig.hwTypFlag & DataService.FREMDE_HW_FLAG) !== 0)
    if (
      newpriId ||
      (this.data.priHw.hw && this.apService.filterService.isFremdeHw(this.data.priHw.hw))
    ) {
      changes.priVlans = this.submitVlans(this.data.priHw);
    }

    const oldperi = this.ap.hw.filter((h) => !h.pri);
    const newperi = this.data.periph;
    const del = oldperi.filter(
      (h) => newperi.findIndex((hi) => h.id === (hi.hwCtrl.value as Hardware).id) === -1
    );
    // periph. to remove
    del.forEach((d) => changes.periph.push({ hwId: d.id, del: true, vlans: [] }));
    // periph. changes
    newperi.forEach((p) => {
      const vlanChange = this.submitVlans(p);
      if (vlanChange.length > 0 || p.apid !== (p.hwCtrl.value as Hardware).apId) {
        changes.periph.push({
          hwId: (p.hwCtrl.value as Hardware).id,
          del: false,
          vlans: vlanChange,
        });
      }
    });

    console.debug("-- hardware changes --");
    console.dir(changes);
    this.hwReady.emit(changes);
  }

  public priHw(): HwInput {
    const hw = this.ap.hw.find((h) => h.pri);
    // vlans[] und hwCtrl werden in EditHwComponent eingetragen
    return { hw: hw, apid: this.ap.apId, vlans: [], hwCtrl: null, ctrlid: "" };
  }

  public periHw(): HwInput[] {
    const hws = this.ap.hw.filter((h) => !h.pri);
    return hws.map((h) => ({ apid: this.ap.apId, hw: h, vlans: [], hwCtrl: null, ctrlid: "" }));
  }

  public addPeripherie(): void {
    this.data.periph.push({ apid: this.ap.apId, hw: null, vlans: [], hwCtrl: null, ctrlid: "" });
    // Das Anhaengen eines leeren Feldes fuer Peripherie aendert den Status der form auf invalid
    // (hw == null ist Fehler) und das triggert *ExpressionChangedAfterItHasBeenCheckedError*.
    // Das folgende verhindert diesen Fehler.
    this.cdRef.detectChanges();
  }

  public delPeripherie(peri: HwInput): void {
    const idx = this.data.periph.findIndex((hi) => hi.ctrlid === peri.ctrlid);
    const remove = this.data.periph.splice(idx, 1);
    if (remove && remove.length === 1) {
      this.periFormGroup.removeControl(remove[0].ctrlid);
      // remove[0].hwCtrl = null;
    }
  }

  /**
   * Geaenderte Vlans als HwVlanChange-Arrray liefern
   *
   * @param input
   * @private
   */
  private submitVlans(input: HwInput): HwVlanChange[] {
    console.debug("--- submitVlans input ---");
    console.dir(input);
    const rc: HwVlanChange[] = [];
    const oldvlans = (input.hwCtrl.value as Hardware)?.vlans ?? [];
    const del = oldvlans.filter(
      (v) => input.vlans.findIndex((vi) => v.hwMacId === vi.hwMacId) === -1
    );
    // MAC == "" => DEL
    del.forEach((d) => rc.push({ hwMacId: d.hwMacId, mac: "", ip: 0, vlanId: 0 }));

    input.vlans.forEach((v) => {
      const newVlan = v.vlanCtrl.value as Vlan;
      const newVlanId = newVlan.id;
      const newMac = IpHelper.checkMacString(v.macCtrl.value as string);
      // relevanter Teil der HostIp
      const newIp = IpHelper.getHostIp(
        IpHelper.getIpPartial(v.ipCtrl.value as string),
        newVlan.netmask
      );
      if (v.hwMacId === 0) {
        // hwMacId == 0 => NEW
        rc.push({
          hwMacId: 0,
          vlanId: newVlanId,
          mac: newMac,
          ip: newIp,
        });
      } else if ((v.vlan?.id ?? 0) !== newVlanId || v.mac !== newMac || v.ip != newIp) {
        // changed
        rc.push({
          hwMacId: v.hwMacId,
          vlanId: newVlanId,
          mac: newMac,
          ip: newIp,
        });
      }
    });
    return rc;
  }
}
