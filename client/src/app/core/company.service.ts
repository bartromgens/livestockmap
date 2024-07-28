import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from "../../environments/environment";
import { Company, CompanyResource } from "./company";


@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  constructor(private httpClient: HttpClient) {}

  public getCompanies(): Observable<Company[]> {
    const url = `${environment.apiBaseUrl}/companies/`;
    return new Observable<Company[]>(observer => {
      this.httpClient.get<CompanyResource[]>(url).subscribe(resources => {
        observer.next(Company.fromResources(resources));
        observer.complete();
      });
    });
  }
}
