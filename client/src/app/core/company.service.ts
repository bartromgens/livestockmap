import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Company, CompanyResource } from './company';
import { BBox } from './geo';

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  constructor(private httpClient: HttpClient) {}

  public getCompanies(bbox?: BBox): Observable<Company[]> {
    let url = `${environment.apiBaseUrl}/companies/`;
    if (bbox) {
      url += `?bbox=${bbox.toString()}`;
    }

    return new Observable<Company[]>((observer) => {
      this.httpClient.get<CompanyResource[]>(url).subscribe((resources) => {
        observer.next(Company.fromResources(resources));
        observer.complete();
      });
    });
  }
}
