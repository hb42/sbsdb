import { Component, EventEmitter, HostBinding, Input, OnInit, Output } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, ValidationErrors } from "@angular/forms";
import { DataService } from "../../shared/data.service";
import { FormFieldErrorStateMatcher } from "../../shared/form-field-error-state-matcher";
import { IpHelper } from "../../shared/ip-helper";
import { Arbeitsplatz } from "../../shared/model/arbeitsplatz";
import { Hardware } from "../../shared/model/hardware";
import { Vlan } from "../../shared/model/vlan";
import { HwInput } from "./hw-input";
import { HwInputVlan } from "./hw-input-vlan";

@Component({
  selector: "sbsdb-edit-hw",
  templateUrl: "./edit-hw.component.html",
  styleUrls: ["./edit-hw.component.scss"],
})
export class EditHwComponent implements OnInit {
  public static count = 0;
  @HostBinding("attr.style") public hostStyle = "display: inline-grid; width: 100%;";

  @Input() public ap: Arbeitsplatz;
  @Input() public pri: boolean;
  @Input() public hw: HwInput;
  @Input() public formGroup: FormGroup; // uebergeordnete formGroup
  @Output() public delete: EventEmitter<HwInput>; // diesen Eintrag entfernen

  public matcher = new FormFieldErrorStateMatcher();
  public hwFormGroup: FormGroup;
  public macFormGroup: FormGroup;

  public vlans: Vlan[];
  // public hwInput: HwInput;

  constructor(private dataService: DataService, private formBuilder: FormBuilder) {
    console.debug("c'tor EditHwComponent");
    this.delete = new EventEmitter<HwInput>();
    this.hwFormGroup = this.formBuilder.group({});
    this.macFormGroup = this.formBuilder.group({});
  }

  ngOnInit(): void {
    // vlan select list
    this.vlans = this.dataService.vlanList
      .map((v) => v)
      .sort((a, b) => this.dataService.collator.compare(a.bezeichnung, b.bezeichnung));
    this.vlans.unshift(null);

    this.hw.hwCtrl = new FormControl(this.hw.hw, [this.hwCheck]);
    const groupId = `hwgroup${EditHwComponent.count++}`;
    this.hw.ctrlid = groupId;
    this.hwFormGroup.addControl(`hw${EditHwComponent.count++}`, this.hw.hwCtrl);
    this.addVlanInputs(this.hw.hw);
    this.hwFormGroup.addControl(`mac${EditHwComponent.count++}`, this.macFormGroup);

    // an die uebergeordnete Form anhaengen
    this.formGroup.addControl(groupId, this.hwFormGroup);

    if (this.hw.hw == null && !this.pri) {
      this.hw.hwCtrl.markAsTouched();
    }
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

  /**
   * HW-Selectlist
   */
  public hwSelectList(): Hardware[] {
    const sel = this.dataService.hwList
      .filter((h) => {
        // aktuelle HW muss auf jeden Fall rein
        if (this.hw.hw && h.id == this.hw.hw.id) {
          return true;
        }
        // zugeordnete HW und fremde HW nicht anzeigen
        if (h.ap || this.isFremdeHw(h.hwKonfig.hwTypFlag)) {
          return false;
        }
        if (this.pri) {
          // fuer pri nur gleiche Kategorie
          return h.hwKonfig.apKatId === this.ap.apKatId;
        } else {
          // f. Peripherie alle HW-Typen
          return true;
        }
      })
      .sort((a, b) =>
        this.dataService.collator.compare(a.konfiguration + a.sernr, b.konfiguration + b.sernr)
      );
    sel.unshift(null);
    return sel;
  }

  public hwSelectionChange(hw: Hardware): void {
    this.addVlanInputs(hw);
  }

  public vlanSelectionChange(vlan: HwInputVlan): void {
    vlan.ipCtrl.setValue("0", { emitEvent: false });
  }

  public isFremdeHw(flag: number): boolean {
    return (flag & DataService.FREMDE_HW_FLAG) !== 0;
  }

  // --- Validators ---

  public hwCheck = (control: FormControl): ValidationErrors => {
    // '==' beruecksichtigt null + undefined
    if (control.value == null && !this.pri) {
      return { required: true };
    }
    return null;
  };

  public macCheck = (control: FormControl): ValidationErrors => {
    if (IpHelper.checkMacString(control.value)) {
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
        const ipval = IpHelper.getIpPartial(control.value);
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
    // '==' beruecksichtigt null + undefined
    if (control.value == null && this.pri) {
      return { required: true };
    }
    return null;
  };

  public isPeripherie(hw: Hardware): boolean {
    return (hw.hwKonfig.apKatFlag & DataService.PERIPHERIE_FLAG) !== 0;
  }

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

  // public getDhcpInfo(vlan: Vlan, ip: number): string {
  //   const min = this.getMinIp(vlan);
  //   let rc = `DHCP = ${min}`;
  //   if (ip != null && this.getMinIp(vlan) === ip) {
  //     rc = "DHCP";
  //   }
  //   return rc;
  // }

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

  public delHw(): void {
    if (this.pri) {
      this.hw.hwCtrl.setValue(null);
      this.hwSelectionChange(null);
    } else {
      this.removeVlanInputs();
      this.delete.emit(this.hw);
    }
  }

  private getVlan(id: number): Vlan {
    return this.vlans.find((v) => (v ? v.id === id : false));
  }

  public addMac(): void {
    console.error("addMac() not yet implemented");
    // TODO UI?
    //      falls ja -> .vlan.hwMacId = 0
  }
  public delMac(): void {
    console.error("delMac() not yet implemented");
    // TODO ist es sinnvoll hier die MAC zu loeschen? UI?
    //      falls ja -> .vlan.mac = ""
    //      fuer fremde HW muss min. eine MAC bleiben
  }

  private addVlanInputs(hw: Hardware) {
    this.removeVlanInputs();

    if (hw && !this.isPeripherie(hw)) {
      hw.vlans.forEach((v) => {
        this.hw.vlans.push({
          hwMacId: v.hwMacId,
          mac: v.mac,
          vlan: this.getVlan(v.vlanId),
          ip: v.ip ? (v.ip + v.vlan) & (2 ** (IpHelper.getHostBytes(v.netmask) * 8) - 1) : 0,
          ipCtrl: undefined,
          macCtrl: undefined,
          vlanCtrl: undefined,
        });
      });
      // fuer pri immer eine MAC+IP anzeigen
      if (hw.vlans.length === 0 && this.pri) {
        this.hw.vlans.push({
          hwMacId: 0,
          mac: IpHelper.NULL_MAC,
          vlan: null,
          ip: 0,
          ipCtrl: undefined,
          macCtrl: undefined,
          vlanCtrl: undefined,
        });
      }
      this.hw.vlans.forEach((vl) => {
        const vlanFormGroup = this.formBuilder.group({});
        vl.macCtrl = new FormControl(vl.mac, [this.macCheck]);
        vl.vlanCtrl = new FormControl(vl.vlan, [this.vlanCheck]);
        vl.ipCtrl = new FormControl(vl.ip, [this.ipCheck]);
        vl.ipCtrl.markAsTouched();
        vl.vlanCtrl.markAsTouched();
        // this.macFormGroup.addControl(`hw${EditHwComponent.count++}`, vl.macCtrl);
        vlanFormGroup.addControl("macinp", vl.macCtrl);
        vlanFormGroup.addControl("vlaninp", vl.vlanCtrl);
        vlanFormGroup.addControl("ipinp", vl.ipCtrl);
        this.macFormGroup.addControl(`vlan${EditHwComponent.count++}`, vlanFormGroup);
      });
    }
  }

  private removeVlanInputs() {
    const rem = Object.keys(this.macFormGroup.controls).map((key) => key);
    rem.forEach((k) => this.macFormGroup.removeControl(k));
    this.hw.vlans = [];
  }
}
