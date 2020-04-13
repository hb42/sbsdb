import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ConfigService } from "../shared/config/config.service";
import { UserSession } from "../shared/config/user.session";
import { Bracket } from "../shared/filter/bracket";
import { Element } from "../shared/filter/element";
import { Expression } from "../shared/filter/expression";
import { Field } from "../shared/filter/field";
import { LogicalAnd } from "../shared/filter/logical-and";
import { LogicalOperator } from "../shared/filter/logical-operator";
import { LogicalOr } from "../shared/filter/logical-or";
import { RelationalOperator } from "../shared/filter/relational-operator";
import { ApColumn } from "./ap-column";
import { ApFilterEditComponent } from "./ap-filter-edit/ap-filter-edit.component";
import { ArbeitsplatzService } from "./arbeitsplatz.service";

@Injectable({ providedIn: "root" })
export class ApFilterService {
  public userSettings: UserSession;

  constructor(
    private configService: ConfigService,
    private apService: ArbeitsplatzService,
    public dialog: MatDialog
  ) {
    console.debug("c'tor ApFilter");
    this.userSettings = configService.getUser();
  }

  public edit(el: Element) {
    console.debug("EDIT " + el.term.toString());
    if (!el.term.isBracket()) {
      this.editExpression(null, null, null, el.term as Expression);
    }
  }

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

    console.debug("Insert: " + this.apService.filterExpression.toString());
  }

  public insertFirst(br: Bracket, what: string) {
    console.debug("INSFIRST " + what + " in " + br.toString());
    switch (what) {
      case "brack":
        br.addElement(null, new Bracket());
        break;
      case "exp":
        this.editExpression(br, null, null, null);
        break;
    }

    console.debug("InsertFirst: " + this.apService.filterExpression.toString());
  }

  public remove(el: Element) {
    console.debug("DELETE " + el.term.toString());
    el.term.up.removeElement(el);
    this.apService.triggerFilter();
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

    const dialogRef = this.dialog.open(ApFilterEditComponent, {
      // height: "300px",
      // width: "500px",
      // maxWidth: "600px",
      disableClose: true,
      data: { f: field, o: oper, c: comp },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.debug("The dialog was closed");
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
        console.dir(this.apService.getExtendedFilter());
        this.apService.triggerFilter();
      }
    });
  }
}
