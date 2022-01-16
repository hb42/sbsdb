import { DOCUMENT } from "@angular/common";
import { EventEmitter, Inject, Injectable } from "@angular/core";
import { KeyboardListener } from "./keyboard-listener";

interface Listener {
  trigger: EventEmitter<void>;
  key: string;
  key2: string;
}

@Injectable({ providedIn: "root" })
export class KeyboardService {
  private listeners: Listener[] = [];
  private ctrlListeners: Listener[] = [];

  // In Windows liefert Alt+<Taste> in KeyboardEvent.key das Zeichen
  // fuer diese Taste, also Alt+A => 'a'. Unter macOS wird mit Alt eine
  // zusaetzliche Belegung mit Sonderzeichen geliefert, z.B. Alt+A => 'å'.
  // Die folgende Tabelle enthaelt das Mapping fuer ein deutsches Tastatur-
  // Layout. Beim Testen wird dann KeyboardEvent.key auf beide Werte
  // verglichen, z.B. 'a' || 'å' => AltA.
  private keytable = [
    { k: "^", a: "„" },
    { k: "1", a: "¡" },
    { k: "2", a: "“" },
    { k: "3", a: "¶" },
    { k: "4", a: "¢" },
    { k: "5", a: "[" },
    { k: "6", a: "]" },
    { k: "7", a: "|" },
    { k: "8", a: "{" },
    { k: "9", a: "}" },
    { k: "0", a: "≠" },
    { k: "ß", a: "¿" },
    { k: "´", a: "'" },
    { k: "q", a: "«" },
    { k: "w", a: "∑" },
    { k: "e", a: "€" },
    { k: "r", a: "®" },
    { k: "t", a: "†" },
    { k: "z", a: "Ω" },
    { k: "u", a: "Dead" }, // ¨
    { k: "i", a: "⁄" },
    { k: "o", a: "ø" },
    { k: "p", a: "π" },
    { k: "ü", a: "•" },
    { k: "+", a: "±" },
    { k: "a", a: "å" },
    { k: "s", a: "‚" },
    { k: "d", a: "∂" },
    { k: "f", a: "ƒ" },
    { k: "g", a: "©" },
    { k: "h", a: "ª" },
    { k: "j", a: "º" },
    { k: "k", a: "∆" },
    { k: "l", a: "@" },
    { k: "ö", a: "œ" },
    { k: "ä", a: "æ" },
    { k: "#", a: "‘" },
    { k: "<", a: "≤" },
    { k: "y", a: "¥" },
    { k: "x", a: "≈" },
    { k: "c", a: "ç" },
    { k: "v", a: "√" },
    { k: "b", a: "∫" },
    { k: "n", a: "Dead" }, // ~
    { k: "m", a: "µ" },
    { k: ",", a: "∞" },
    { k: ".", a: "…" },
    { k: "-", a: "–" },
    { k: " ", a: " " },
  ];

  constructor(@Inject(DOCUMENT) doc: Document) {
    doc.addEventListener("keydown", (event) => {
      // console.debug("keydown " + event.key);
      if (
        event.altKey &&
        !event.ctrlKey &&
        !event.shiftKey &&
        !event.metaKey &&
        event.key !== "Alt"
      ) {
        const data = this.listeners.find((c) => event.key === c.key || event.key === c.key2);
        if (data) {
          // console.debug("KEYBOARD EVENT alt+" + data.key);
          data.trigger.emit();
          event.preventDefault();
          event.stopPropagation();
        }
      } else if (
        event.ctrlKey &&
        !event.altKey &&
        !event.shiftKey &&
        !event.metaKey &&
        event.key !== "Control"
      ) {
        const data = this.ctrlListeners.find((c) => event.key === c.key || event.key === c.key2);
        if (data) {
          // console.debug("KEYBOARD EVENT ctl+" + data.key);
          data.trigger.emit();
          event.preventDefault();
          event.stopPropagation();
        }
      }
    });
  }

  public register(listener: KeyboardListener, ctrl: boolean = false): void {
    const keys = ctrl ? this.ctrlListeners : this.listeners;
    if (this.unregister(listener.key, ctrl)) {
      console.error(`KeyboardService: Shortcut '${listener.key}' was already in use.`);
    }
    const key2 = this.keytable.find((kt) => kt.k === listener.key);
    if (key2) {
      keys.push({ trigger: listener.trigger, key: listener.key, key2: key2.a });
    }
  }

  public unregister(key: string, ctrl: boolean = false): boolean {
    const keys = ctrl ? this.ctrlListeners : this.listeners;
    const idx = keys.findIndex((c) => c.key === key);
    if (idx >= 0) {
      keys.splice(idx, 1);
      return true;
    } else {
      return false;
    }
  }
}
