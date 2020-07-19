import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class DataService {
  constructor(private http: HttpClient) {
    console.debug("c'tor DataService");
  }

  public get(url: string): Observable<any> {
    return this.http.get(url);
  }
}
