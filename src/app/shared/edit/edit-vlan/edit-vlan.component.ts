import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, ValidationErrors } from "@angular/forms";
import { DataService } from "../../data.service";
import { FormFieldErrorStateMatcher } from "../../form-field-error-state-matcher";
import { IpHelper } from "../../ip-helper";
import { Hardware } from "../../model/hardware";
import { Vlan } from "../../model/vlan";
import { HwInputVlan } from "./hw-input-vlan";
import { HwVlanChange } from "./hw-vlan-change";
import { VlansInput } from "./vlans-input";

@Component({
  selector: "sbsdb-edit-vlan",
  templateUrl: "./edit-vlan.component.html",
  styleUrls: ["./edit-vlan.component.scss"],
})
export class EditVlanComponent implements OnInit {
  public static count = 0;

  @Input() public vlanInp: VlansInput; //HwInputVlan[];
  @Input() public pri: boolean;
  @Input() public formGroup: FormGroup; // uebergeordnete formGroup
  @Input() public hwchange: EventEmitter<Hardware>; // HW wurde geaendert
  @Input() public onDelAp: EventEmitter<void>; // AP entfernt -> alle IP loeschen
  @Input() public onSubmit: EventEmitter<void>;
  @Output() public vlanReady: EventEmitter<HwVlanChange[]>;

  public matcher = new FormFieldErrorStateMatcher();
  public macFormGroup: FormGroup;

  public vlanList: Vlan[];
  private idCounter = -1;

  constructor(private dataService: DataService, private formBuilder: FormBuilder) {
    console.debug("c'tor EditVlanComponent");
    this.vlanReady = new EventEmitter<HwVlanChange[]>();
    this.macFormGroup = this.formBuilder.group({});
  }

  public ngOnInit(): void {
    this.onSubmit.subscribe(() => {
      this.submitVlans();
    });
    // andere HW ausgewaehlt
    this.hwchange.subscribe((hw: Hardware) => {
      console.debug("edit-vlan hwchange handler");
      this.vlanInp.hw = hw;
      // IP sichern
      const sav: { vlan: Vlan; ip: number }[] = [];
      this.vlanInp.vlans.forEach((v) => {
        sav.push({ vlan: v.vlanCtrl.value as Vlan, ip: v.ipCtrl.value as number });
      });
      // controls fuer neue HW
      this.addVlanInputs();
      // IP aus vorheriger HW eintragen
      sav.forEach((s, idx) => {
        if (idx < this.vlanInp.vlans.length) {
          this.vlanInp.vlans[idx].vlanCtrl.setValue(s.vlan, { emitEvent: false });
          this.vlanInp.vlans[idx].ipCtrl.setValue(s.ip, { emitEvent: false });
        }
      });
    });
    // AP entfernt, loesche IPs
    if (this.onDelAp) {
      this.onDelAp.subscribe(() => {
        this.pri = false;
        this.delAllIp();
      });
    }

    // vlan select list
    this.vlanList = this.dataService.vlanList
      .map((v) => v)
      .sort((a, b) => this.dataService.collator.compare(a.bezeichnung, b.bezeichnung));
    this.vlanList.unshift(null);

    // Das Anhaengen einer neuen MAC aendert u.U. den Status der form auf invalid
    // und das triggert NG0100 *ExpressionChangedAfterItHasBeenCheckedError*.
    // setTimeout() verhindert diesen Fehler.
    setTimeout(() => {
      this.addVlanInputs();
      // an die uebergeordnete Form anhaengen
      this.formGroup.addControl(`mac${EditVlanComponent.count++}`, this.macFormGroup);
      this.formGroup.updateValueAndValidity();
    }, 0);
  }

  public getErrorMessage(control: FormControl): string {
    if (control.hasError("required")) {
      return "Das Feld darf nicht leer sein.";
    }
    if (control.hasError("invalidmac")) {
      return "Ungültige MAC-Adresse";
    }
    if (control.hasError("invalidip")) {
      return "Ungültige IP-Adresse";
    }
    return null;
  }

  public vlanSelectionChange(vlan: HwInputVlan): void {
    vlan.ipCtrl.setValue("0", { emitEvent: false });
  }

  public macCheck = (control: FormControl): ValidationErrors => {
    if (IpHelper.checkMacString(control.value as string)) {
      return null;
    } else {
      return { invalidmac: true };
    }
  };

  public ipCheck = (control: FormControl): ValidationErrors => {
    // '==' beruecksichtigt 0 und "0"
    if (control.value == "0") {
      return null;
    }
    if (control.parent) {
      const vlan = control.parent.get("vlaninp").value as Vlan;
      if (vlan) {
        const min = this.getMinIp(vlan);
        const max = IpHelper.getHostIpMax(vlan.ip, vlan.netmask);
        const ipval = IpHelper.getIpPartial(control.value as string);
        // console.debug(`${ipval} > ${min} && ${ipval} < ${max}`);
        if (ipval > min && ipval < max) {
          return null;
        } else {
          return { invalidip: true };
        }
      }
    }
    return null;
  };

  public vlanCheck = (control: FormControl): ValidationErrors => {
    let error: ValidationErrors = null;
    if (this.pri) {
      // mind. eine MAC muss eine IP haben
      if (
        this.vlanInp.vlans.filter((vlan) => vlan.vlanCtrl && !!vlan.vlanCtrl.value).length === 0
      ) {
        error = { required: true };
      }
    }
    // Fehler muss bei allen MACs eingetragen werden
    this.vlanInp.vlans
      .filter((v) => control != v.vlanCtrl)
      .forEach((vl) => {
        if (vl.vlanCtrl) {
          console.debug("### vlan set error");
          vl.vlanCtrl.setErrors(error);
        }
      });

    return error;
  };

  public getNetworkInfo(vlan: Vlan): string {
    if (vlan) {
      const nm = IpHelper.getNetmaskBits(vlan.netmask);
      const net = IpHelper.getIpString(vlan.ip);

      // DEBUG
      // console.debug(`TEST: ${net} = ${IpHelper.getIp(net)} = ${vlan.ip}`);
      // console.debug(`${IpHelper.getIpPartial("193.1")}`);
      // DEBUG

      return `${net}/${nm}`;
    } else {
      return "";
    }
  }
  public getIpInfo(vlan: Vlan): string {
    if (vlan) {
      const bytes = IpHelper.getHostBytes(vlan.netmask);
      const min = this.getMinIp(vlan);
      const max = IpHelper.getHostIpMax(vlan.ip, vlan.netmask);

      return `IP: ${IpHelper.getPartialIpString(min + 1, bytes)} - ${IpHelper.getPartialIpString(
        max - 1,
        bytes
      )}`;
    } else {
      return "";
    }
  }

  /**
   * Min IP -> DHCP
   *
   * @param vlan
   */
  public getMinIp(vlan: Vlan): number {
    return IpHelper.getHostIpMin(vlan.ip, vlan.netmask);
  }

  public delIp(vlan: HwInputVlan): void {
    vlan.ipCtrl.setValue("0");
    vlan.vlanCtrl.setValue(null);
  }

  public delAllIp(): void {
    this.vlanInp.vlans.forEach((v) => this.delIp(v));
  }

  private getVlan(id: number): Vlan {
    return this.vlanList.find((v) => (v ? v.id === id : false));
  }

  public addMac(): void {
    this.idCounter--;
    const newVlan: HwInputVlan = {
      hwMacId: this.idCounter,
      mac: IpHelper.NULL_MAC,
      vlan: null,
      ip: 0,
      ipCtrl: undefined,
      macCtrl: undefined,
      vlanCtrl: undefined,
      groupId: "",
    };
    this.vlanInp.vlans.push(newVlan);
    this.addVlanInput(newVlan);
  }

  public delMac(v: HwInputVlan): void {
    const idx = this.vlanInp.vlans.findIndex((vl) => vl.hwMacId === v.hwMacId);
    const remove = this.vlanInp.vlans.splice(idx, 1);
    if (remove && remove.length === 1) {
      this.macFormGroup.removeControl(remove[0].groupId);
    }
  }

  // alle Controls neu aufbauen
  private addVlanInputs() {
    this.removeVlanInputs();

    // fuer pri immer eine MAC+IP anzeigen
    if (this.vlanInp.hw && this.vlanInp.hw.vlans.length === 0 && this.pri) {
      this.addMac();
      return;
    }

    if (this.vlanInp.hw && !this.dataService.isPeripherie(this.vlanInp.hw)) {
      this.vlanInp.hw.vlans.forEach((v) => {
        this.vlanInp.vlans.push({
          hwMacId: v.hwMacId,
          mac: v.mac,
          vlan: this.getVlan(v.vlanId),
          ip: v.ip ? (v.ip + v.vlan) & (2 ** (IpHelper.getHostBytes(v.netmask) * 8) - 1) : 0,
          ipCtrl: undefined,
          macCtrl: undefined,
          vlanCtrl: undefined,
          groupId: "",
        });
      });
      this.vlanInp.vlans.forEach((vl) => this.addVlanInput(vl));
    }
  }

  // Controls fuer einzelne MAC
  private addVlanInput(vl: HwInputVlan) {
    const vlanFormGroup = this.formBuilder.group({});
    vl.macCtrl = new FormControl(vl.mac, [this.macCheck]);
    vl.vlanCtrl = new FormControl(vl.vlan, [this.vlanCheck]);
    vl.ipCtrl = new FormControl(vl.ip, [this.ipCheck]);
    vl.macCtrl.markAsTouched();
    vl.ipCtrl.markAsTouched();
    vl.vlanCtrl.markAsTouched();
    vlanFormGroup.addControl("macinp", vl.macCtrl);
    vlanFormGroup.addControl("vlaninp", vl.vlanCtrl);
    vlanFormGroup.addControl("ipinp", vl.ipCtrl);
    vl.groupId = `vlan${EditVlanComponent.count++}`;
    this.macFormGroup.addControl(vl.groupId, vlanFormGroup);
  }

  private removeVlanInputs() {
    const rem = Object.keys(this.macFormGroup.controls).map((key) => key);
    rem.forEach((k) => this.macFormGroup.removeControl(k));
    this.vlanInp.vlans = [];
  }

  private submitVlans(): void {
    console.debug("edit vlan submit");
    const rc: HwVlanChange[] = [];
    const oldvlans = this.vlanInp.hw?.vlans ?? [];
    const del = oldvlans.filter(
      (v) => this.vlanInp.vlans.findIndex((vi) => v.hwMacId === vi.hwMacId) === -1
    );
    // MAC == "" => DEL
    del.forEach((d) => rc.push({ hwMacId: d.hwMacId, mac: "", ip: 0, vlanId: 0 }));

    this.vlanInp.vlans.forEach((v) => {
      const newVlan = v.vlanCtrl.value as Vlan;
      const newVlanId = newVlan ? newVlan.id : 0;
      const newMac = IpHelper.checkMacString(v.macCtrl.value as string);
      // relevanter Teil der HostIp
      const newIp = newVlan
        ? IpHelper.getHostIp(IpHelper.getIpPartial(v.ipCtrl.value as string), newVlan.netmask)
        : 0;
      if (v.hwMacId <= 0) {
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
    // this.vlanInp.out = rc;
    this.vlanReady.emit(rc);
  }
}
