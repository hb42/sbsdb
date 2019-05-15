import { animate, state, style, transition, trigger } from "@angular/animations";
import { Component, HostBinding, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { MatPaginator, MatSort } from "@angular/material";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { ConfigService } from "../../shared/config/config.service";
import { ArbeitsplatzService } from "../arbeitsplatz.service";

@Component({
             selector   : "sbsdb-ap",
             templateUrl: "./ap.component.html",
             styleUrls  : ["./ap.component.scss"],
             animations : [
               trigger("detailExpand", [
                 state("collapsed", style({height: "0px", minHeight: "0", display: "none"})),
                 state("expanded", style({height: "*"})),
                 transition("expanded <=> collapsed", animate("225ms cubic-bezier(0.4, 0.0, 0.2, 1)")),
               ])
             ],
           })
export class ApComponent implements OnInit, OnDestroy {
  @HostBinding("attr.class") cssClass = "flex-panel flex-content-fix";

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  public subscription: Subscription;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private config: ConfigService,
              public apService: ArbeitsplatzService
  ) {
    console.debug("c'tor ApComponent");
  }

  public async ngOnInit() {
    // const par = this.route.snapshot.params["tree"];
    // console.debug("onInit ApComponent par=" + par);

    /*  verschiedene parameter
    https://stackoverflow.com/questions/49738911/angular-5-routing-to-same-component-but-different-param-not-working
     */
    // TODO ActivatedRoute ist nur in der jeweiligen component sinnvoll
    //      d.h. je comp. in der das gebraucht wird .params.subscribe und das Handling an den Service delegieren
    //      (evtl. NaviagatonService ??)
    this.route.params.subscribe((params) => {
      console.debug("## route params changed");
      console.dir(params);
      // URL /ap;id=11;tree=bst -> {id: 11, tree: 'bst'}
      // als zweiter Navigationsparameter:
      //   this.router.navigate(['/ap', { id: 11, tree: 'bst' }]);
      //   <a [routerLink]="['/ap', { id: 11, tree: 'bst' }]">test</a>
      this.apService.urlParams = {
        tree: params.tree,
        id  : Number.parseInt(params.id, 10)
      };
      if (params.tree && params.tree === "oe") {
        this.apService.expandTree(this.apService.urlParams.id);
      }
    });

    // await this.apService.getAps();
    this.apService.apDataSource.sort = this.sort;
    this.apService.apDataSource.paginator = this.paginator;

    if (this.config.getUser()) {
      console.debug("onInit UserSession path=" + this.config.getUser().path);
    } else {
      console.debug("onInit UserSession is undefined");
    }

  }

  ngOnDestroy(): void {
    if (this.subscription) {
      console.debug("ApComponent - subscription.unsubscribe");
      this.subscription.unsubscribe();
    }
  }

  public sortData(event) {
    console.debug("SORT");
    console.dir(event);
  }
}
