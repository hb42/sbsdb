import { Component, HostBinding, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { ConfigService } from "../../shared/config/config.service";

@Component({
             selector   : "sbsdb-ap",
             templateUrl: "./ap.component.html",
             styleUrls  : ["./ap.component.scss"]
           })
export class ApComponent implements OnInit, OnDestroy {
  @HostBinding("attr.class") cssClass = "flex-panel flex-content-fix";

  public leftPaneWidth: string;
  public leftPaneMinWidth: string;
  public centerPaneWidth: string;
  public centerPaneMinWidth: string;

  public urlParams: string[];
  public subscription: Subscription;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private config: ConfigService) {
    console.debug("c'tor ApComponent");
  }

  ngOnInit() {
    // const par = this.route.snapshot.params["tree"];
    // console.debug("onInit ApComponent par=" + par);

    /*  verschiedene parameter
    https://stackoverflow.com/questions/49738911/angular-5-routing-to-same-component-but-different-param-not-working
     */
    this.route.params.subscribe((params) => {
      console.debug("## subscribe");
      console.dir(params);
      // URL /ap;id=11;tree=bst -> {id: 11, tree: 'bst'}
      // als zweiter Navigationsparameter:
      //   this.router.navigate(['/ap', { id: 11, tree: 'bst' }]);
      //   <a [routerLink]="['/ap', { id: 11, tree: 'bst' }]">test</a>
      this.urlParams = [
        params.tree,
        params.id
      ];
    });

    if (this.config.getUser()) {
      console.debug("onInit UserSession path=" + this.config.getUser().path);
    } else {
      console.debug("onInit UserSession is undefined");
    }

    this.leftPaneWidth = "350px";
    this.leftPaneMinWidth = "100px";
    this.centerPaneWidth = "100%";
    this.centerPaneMinWidth = "100px";

  }

  ngOnDestroy(): void {
    if (this.subscription) {
      console.debug("ApComponent - subscription.unsubscribe");
      this.subscription.unsubscribe();
    }
  }

}
