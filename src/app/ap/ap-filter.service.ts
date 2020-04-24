import { EventEmitter, Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { debounceTime } from "rxjs/operators";
import { ConfigService } from "../shared/config/config.service";
import { UserSession } from "../shared/config/user.session";
import { Bracket } from "../shared/filter/bracket";
import { Element } from "../shared/filter/element";
import { Expression } from "../shared/filter/expression";
import { Field } from "../shared/filter/field";
import { LogicalAnd } from "../shared/filter/logical-and";
import { LogicalOperator } from "../shared/filter/logical-operator";
import { LogicalOr } from "../shared/filter/logical-or";
import { RelOp } from "../shared/filter/rel-op.enum";
import { RelationalOperator } from "../shared/filter/relational-operator";
import { TransportElement } from "../shared/filter/transport-element";
import { TransportExpression } from "../shared/filter/transport-expression";
import { ApColumn } from "./ap-column";
import { ApFilterEditComponent } from "./ap-filter-edit/ap-filter-edit.component";

@Injectable({ providedIn: "root" })
export class ApFilterService {
  public userSettings: UserSession;

  public filterExpression = new Bracket();
  public filterElement = new Element(null, this.filterExpression);
  public stdFilter = true;

  // wird in initService() von apService geliefert
  private columns: ApColumn[];
  public extFilterColumns: ApColumn[];
  private filterChange: EventEmitter<any>;

  // Filtereingaben bremsen
  private readonly keyDebounce = 500;

  constructor(private configService: ConfigService, public dialog: MatDialog) {
    console.debug("c'tor ApFilterService");
    this.userSettings = configService.getUser();
  }

  /**
   * Startparameter setzen (-> ArbeitsplatzService)
   *
   * @param col - Array der Tabellen-Spalten
   * @param evt - Eventhandler fuer Aenderungen am Filter
   */
  public initService(col: ApColumn[], evt: EventEmitter<any>) {
    this.columns = col;
    this.filterChange = evt;
    this.extFilterColumns = this.columns.filter((c) => c.operators);

    // Aenderung an Filter-Feldern in den Benutzereinstellungen speichern
    // und Filter triggern
    this.columns.forEach((c) => {
      if (c.filterControl) {
        c.filterControl.valueChanges // FormControl
          .pipe(debounceTime(this.keyDebounce))
          .subscribe(() => {
            // this.stdFilterChange();
            this.buildStdFilterExpression();
            this.saveFilterExpression();
            this.triggerFilter();
          });
      }
    });
  }

  /**
   * Filter aus den Benutzereinstellungen erstellen
   */
  public initializeFilters() {
    this.stdFilter = this.userSettings.apStdFilter;
    this.filterExpression.reset();
    this.makeElements(this.filterExpression, this.userSettings.apFilter);

    if (this.stdFilter) {
      this.userSettings.apFilter.forEach((t) => {
        if (!Array.isArray(t.elem)) {
          const te = (t.elem as unknown) as TransportExpression;
          const feld = te.fName;
          const col = this.columns.find((c) => c.fieldName === feld);
          let not = "";
          if (te.op === RelOp.notlike) {
            not = "!";
          }
          col.filterControl.setValue(not + te.comp);
          col.filterControl.markAsDirty();
        }
      });
      this.buildStdFilterExpression();
    } else {
      // nur fuer ext. filter noetig (f. std filter implizit)
      this.triggerFilter();
    }
  }

  /**
   * Filter loeschen (triggert valueChange)
   */
  public resetStdFilters() {
    this.columns.forEach((c) => {
      if (c.filterControl) {
        c.filterControl.reset();
      }
    });
  }

  /**
   * Filter-Ausdruck fuer std filter
   */
  private buildStdFilterExpression() {
    this.filterExpression.reset();
    const and = new LogicalAnd();
    this.columns.forEach((col) => {
      if (col.filterControl) {
        const colExpr = col.getFilterExpression();
        if (colExpr) {
          this.filterExpression.addElement(and, colExpr);
        }
      }
    });
  }

  /**
   * filterExpression aus den Benutzereinstellungen wiederherstellen
   *
   * @param b - uebergeordnete Klammer oder null
   * @param t - Array der TransportElemente
   */
  private makeElements(b: Bracket, t: TransportElement[]) {
    let op: LogicalOperator = null;
    const and = new LogicalAnd();
    const or = new LogicalOr();
    t.forEach((tr) => {
      if (tr.op === 0) {
        op = or;
      } else if (tr.op === 1) {
        op = and;
      }
      if (Array.isArray(tr.elem)) {
        const br = new Bracket();
        br.up = b;
        b.addElement(op, br);
        this.makeElements(br, tr.elem);
      } else {
        const ex = new Expression(
          new Field(tr.elem.fName, tr.elem.dName),
          new RelationalOperator(tr.elem.op),
          tr.elem.comp
        );
        b.addElement(op, ex);
      }
    });
  }

  /**
   * Der Filter muss in der MatTable angestossen werden. Deshalb wird
   * ein event an ArbeitsplatzService gesendet.
   */
  public triggerFilter() {
    this.filterChange.emit();
  }

  /**
   * filterExpression in den Benutzereinstellungen speichern
   */
  public saveFilterExpression() {
    this.userSettings.apFilter = this.convBracket(this.filterExpression);
  }

  /**
   * filterExpression fuer die Benutzereinstellungen umwandeln
   *
   * @param b - startende Klammer
   */
  private convBracket(b: Bracket): TransportElement[] {
    return b.getElements().map((el) => {
      return new TransportElement(
        el.operator ? (el.operator.toString() === "UND" ? 1 : 0) : -1,
        el.term.isBracket()
          ? this.convBracket(el.term as Bracket) // recurse
          : this.convExpression(el.term as Expression)
      );
    });
  }
  private convExpression = (e: Expression): TransportExpression | null =>
    e
      ? new TransportExpression(e.field.fieldName, e.field.displayName, e.operator.op, e.compare)
      : null;

  // --- Edit Exxtended Filter ---

  /**
   * Erweiterte Suche ab-/abschalten
   */
  public toggleExtendedFilter() {
    this.stdFilter = !this.stdFilter;
    if (this.stdFilter) {
      this.resetStdFilters();
    }
    this.userSettings.apStdFilter = this.stdFilter;
  }

  /**
   * Einzelnen Ausdruck bearbeiten
   *
   * @param el - Element
   */
  public edit(el: Element) {
    console.debug("EDIT " + el.term.toString());
    if (!el.term.isBracket()) {
      this.editExpression(null, null, null, el.term as Expression);
    }
  }

  /**
   * Ausdruck oderr Klammer einfuegen
   *
   * @param el - Element
   * @param what - was wird eingefuegt?
   */
  public insert(el: Element, what: string) {
    console.debug("INSERT " + what);
    let log: LogicalOperator = new LogicalOr();
    switch (what) {
      case "and_brack":
        log = new LogicalAnd();
      // tslint:disable-next-line:no-switch-case-fall-through
      case "or_brack":
        el.term.up.addElementAt(el, log, new Bracket());
        break;
      case "and_exp":
        log = new LogicalAnd();
      // tslint:disable-next-line:no-switch-case-fall-through
      case "or_exp":
        this.editExpression(null, el, log, null);
        break;
    }
  }

  /**
   * Erstes Element in eine leere Klammer einfuegen
   *
   * @param br - uebergeordnete Klammer
   * @param what - was wird eingefuegt?
   */
  public insertFirst(br: Bracket, what: string) {
    switch (what) {
      case "brack":
        br.addElement(null, new Bracket());
        break;
      case "exp":
        this.editExpression(br, null, null, null);
        break;
    }
  }

  /**
   * Element entfernen
   *
   * @param el - Element
   */
  public remove(el: Element) {
    el.term.up.removeElement(el);
    this.triggerFilter();
  }

  /**
   * Neuer Ausdruck/ Ausdruck bearbeiten
   *
   * @param up - neuer Ausdruck in Klammer | null
   * @param el - neuen Ausdruck mit op nach el einsetzen | null
   * @param op - neuen Ausdruck mit op nach el einsetzen | null
   * @param ex - Ausdruck ex bearbeiten
   */
  public editExpression(
    up: Bracket | null,
    el: Element | null,
    op: LogicalOperator | null,
    ex: Expression | null
  ) {
    const field = ex ? new Field(ex.field.fieldName, ex.field.displayName) : null;
    const oper = ex ? ex.operator.op : null;
    const comp = ex ? "" + ex.compare : null;

    // Dialog oeffnen
    const dialogRef = this.dialog.open(ApFilterEditComponent, {
      disableClose: true,
      data: { f: field, o: oper, c: comp, columns: this.extFilterColumns },
    });

    // Dialog-Ergebnis
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (ex) {
          // edit
          ex.field = result.f;
          ex.operator = new RelationalOperator(result.o);
          ex.compare = result.c;
        } else {
          ex = new Expression(result.f, new RelationalOperator(result.o), result.c);
          if (up) {
            // einziger Ausdruck f. Klammer
            up.addElement(null, ex);
          } else if (el) {
            // nach el einsetzen
            el.term.up.addElementAt(el, op, ex);
          }
        }
        this.saveFilterExpression();
        this.triggerFilter();
      }
    });
  }
}
