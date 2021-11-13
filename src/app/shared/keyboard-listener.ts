import { EventEmitter } from "@angular/core";

export interface KeyboardListener {
  trigger: EventEmitter<void>;
  key: string;
}
