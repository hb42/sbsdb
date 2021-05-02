import { Directive, Input } from "@angular/core";
import { NgControl } from "@angular/forms";

/**
 * ReactiveForm ignoriert [disabled], ist aber in speziellen Faellen noetig
 * -> https://stackoverflow.com/questions/40494968/reactive-forms-disabled-attribute
 */
@Directive({
  selector: "[sbsdbDisableControl]",
})
export class DisableControlDirective {
  @Input() set sbsdbDisableControl(condition: boolean) {
    const action = condition ? "disable" : "enable";
    setTimeout(() => {
      this.ngControl.control[action]();
    }, 0);
  }

  constructor(private ngControl: NgControl) {}
}
