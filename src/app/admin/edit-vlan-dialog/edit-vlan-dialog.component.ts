import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormControl, ValidationErrors } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DataService } from "../../shared/data.service";
import { IpHelper } from "../../shared/ip-helper";
import { Vlan } from "../../shared/model/vlan";
import { BaseSvzDialog } from "../base-svz-dialog";

@Component({
  selector: "sbsdb-edit-vlan-dialog",
  templateUrl: "./edit-vlan-dialog.component.html",
  styleUrls: ["./edit-vlan-dialog.component.scss"],
})
export class EditVlanDialogComponent extends BaseSvzDialog<Vlan> implements OnInit {
  public bezeichControl: FormControl;
  public ipControl: FormControl;
  public nmControl: FormControl;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Vlan,
    public formBuilder: FormBuilder,
    public dataService: DataService
  ) {
    super(data, formBuilder, dataService);
    console.debug("c'tor EditVlanDialogComponent");
  }

  public ngOnInit(): void {
    this.bezeichControl = this.addFormControl(this.data.bezeichnung, "bezeich", [this.required]);
    this.nmControl = this.addFormControl(IpHelper.getIpString(this.data.netmask), "netmask", [
      this.required,
      this.netmaskCheck,
    ]);
    this.ipControl = this.addFormControl(IpHelper.getIpString(this.data.ip), "ip", [
      this.required,
      this.ipCheck,
    ]);
    this.nmControl.markAsTouched();
    this.ipControl.markAsTouched();
  }

  onSubmit(): void {
    this.data.bezeichnung = this.bezeichControl.value as string;
    this.data.ip = IpHelper.getIp(this.ipControl.value as string);
    this.data.netmask = IpHelper.getIp(this.nmControl.value as string);
  }

  public ipCheck = (control: FormControl): ValidationErrors => {
    const inp = control.value as string;
    const ip = IpHelper.getIp(inp);
    if (ip !== null) {
      if (this.nmControl.valid) {
        const inpNm = this.nmControl.value as string;
        const nm = IpHelper.getIp(inpNm);
        if (IpHelper.getHostIp(ip, nm) === 0) {
          return null;
        } else {
          return { invalidipnm: true };
        }
      } else {
        return { invalidipnm: true };
      }
    } else {
      return { invalidip: true };
    }
  };

  public netmaskCheck = (control: FormControl): ValidationErrors => {
    const inpNm = control.value as string;
    const nm = IpHelper.getIp(inpNm);
    if (nm !== null) {
      if (IpHelper.getHostBits(nm) > 0) {
        if (this.ipControl) {
          // trigger check IP
          this.ipControl.setValue(this.ipControl.value);
        }
        return null;
      } else {
        return { invalidnm: true };
      }
    } else {
      return { invalidip: true };
    }
  };

  public nmHint(): string {
    if (this.nmControl.valid) {
      const inpNm = this.nmControl.value as string;
      const nm = IpHelper.getIp(inpNm);
      return `/${IpHelper.getNetmaskBits(nm)}`;
    } else {
      return "";
    }
  }
}
