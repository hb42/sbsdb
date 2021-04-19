import { Directive, Input } from "@angular/core";
import { NgControl } from "@angular/forms";

/**
 * ReactiveForm ignoriert [disabled], ist aber in speziellen noetig
 * -> https://stackoverflow.com/questions/40494968/reactive-forms-disabled-attribute
 */
@Directive({
  selector: "[sbsdbDisableControl]",
})
export class DisableControlDirective {
  @Input() set sbsdbDisableControl(condition: boolean) {
    const action = condition ? "disable" : "enable";
    this.ngControl.control[action]();
  }

  constructor(private ngControl: NgControl) {}
}
