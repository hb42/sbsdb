import { Location } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";

@Injectable({providedIn: "root"})
export class ConfigService {

  private _webservice: string;

  public get webservice(): string {
    return this._webservice;
  }

  constructor(private http: HttpClient, private location: Location) {
    console.debug("c'tor ConfigService");
    this._webservice = location.prepareExternalUrl(environment.webservice);
  }


}
