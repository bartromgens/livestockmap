import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { Building } from './building';
import { BuildingResource } from "./building";
import { environment } from "../../environments/environment";


@Injectable({
  providedIn: 'root'
})
export class BuildingService {

  constructor(private httpClient: HttpClient) {}

  public getBuildings(): Observable<Building[]> {
    const url = `${environment.apiBaseUrl}/buildings/`;
    return new Observable<Building[]>(observer => {
      this.httpClient.get<BuildingResource[]>(url).subscribe(buildingResources => {
        observer.next(Building.fromResources(buildingResources));
        observer.complete();
      });
    });
  }
}