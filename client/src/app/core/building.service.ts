import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Building } from './building';
import { BuildingResource } from './building';
import { BBox } from './geo';

@Injectable({
  providedIn: 'root',
})
export class BuildingService {
  constructor(private httpClient: HttpClient) {}

  public getBuildings(bbox: BBox): Observable<Building[]> {
    const url = `${environment.apiBaseUrl}/buildings/?bbox=${bbox.toString()}`;
    return new Observable<Building[]>((observer) => {
      this.httpClient
        .get<BuildingResource[]>(url)
        .subscribe((buildingResources) => {
          observer.next(Building.fromResources(buildingResources));
          observer.complete();
        });
    });
  }
}
