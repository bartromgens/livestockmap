import { Component, NgZone } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterOutlet } from '@angular/router';

import { LeafletModule } from "@bluehalo/ngx-leaflet";
import { latLng, LeafletMouseEvent, polygon, tileLayer, Map } from "leaflet";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";

import { BuildingService } from "./core/building.service";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    LeafletModule,
    MatToolbarModule,
    MatIconModule,
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
  opened: boolean = true;
  map: Map|null = null;

  constructor(private buildingService: BuildingService, private zone: NgZone) {}

  ngOnInit(): void {
    this.update();
  }

  private update(): void {
    const layers : any[] = [];
    this.buildingService.getBuildings().subscribe(buildings => {
      for (const building of buildings) {
        const coordinates : [number, number][] = [];
        for (const coordinate of building.geometry) {
          coordinates.push([coordinate.lat, coordinate.lon]);
        }
        const layer: any = polygon(coordinates);
        layer.on('click', (event: L.LeafletMouseEvent) => this.onLayerClick(event, layer));
        layer.buildingId = building.way_id;
        layer.building = building;
        layers.push(layer);
      }
    });
    this.layers = layers;
  }

  onLayerClick(event: L.LeafletMouseEvent, layer: L.Layer) {
    // this.zone.run(() => {
    //   console.log('onLayerClick');
		// });
    console.log('onLayerClick', (layer as any)["buildingId"]);
    console.log('onLayerClick', (layer as any)["building"]);
  }

  onMapClick(event: LeafletMouseEvent): void {
    console.log('mapClick');
  }

  onMapReady(map: Map) {
	  this.map = map;
  }
}
