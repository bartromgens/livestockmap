import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Tile, TileResource } from './tile';

@Injectable({
  providedIn: 'root',
})
export class TileService {
  constructor(private httpClient: HttpClient) {}

  public getTiles(): Observable<Tile[]> {
    const url = `${environment.apiBaseUrl}/tiles/`;
    return new Observable<Tile[]>((observer) => {
      this.httpClient.get<TileResource[]>(url).subscribe((resources) => {
        observer.next(Tile.fromResources(resources));
        observer.complete();
      });
    });
  }
}
