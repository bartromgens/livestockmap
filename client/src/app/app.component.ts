import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { LeafletModule } from "@bluehalo/ngx-leaflet";
import { latLng, polygon, tileLayer } from "leaflet";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatButtonModule } from "@angular/material/button";

import { BuildingService } from "./core/building.service";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    LeafletModule,
    MatToolbarModule,
    MatSidenavModule,
    MatButtonModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title: string = 'livestockmap';
  options = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 18, attribution: '...' })
    ],
    zoom: 15,
    center: latLng(52.1, 5.58)
  };
  layers: any[] = [];

  constructor(private buildingService: BuildingService) {}

  ngOnInit(): void {
    this.update();
  }

  private update() {
    const layers : any[] = [];
    this.buildingService.getBuildings().subscribe(buildings => {
      for (const building of buildings) {
        const coordinates : [number, number][] = [];
        for (const coordinate of building.geometry) {
          coordinates.push([coordinate.lat, coordinate.lon]);
        }
        layers.push(polygon(coordinates));
      }
    });
    this.layers = layers;
  }
}
