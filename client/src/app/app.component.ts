import { Component, NgZone } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterOutlet } from '@angular/router';

import { LeafletModule } from "@bluehalo/ngx-leaflet";
import { latLng, LeafletMouseEvent, polygon, tileLayer, Map, Polygon } from "leaflet";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatCardModule } from "@angular/material/card";

import { BuildingService } from "./core/building.service";
import { Building } from "./core/building";
import { CompanyService } from "./core/company.service";
import { Company } from "./core/company";


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
    MatCardModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private readonly ZOOM_DEFAULT = 15;
  Object = Object;
  readonly title: string = 'livestockmap';
  options = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 18, attribution: '...' })
    ],
    zoom: this.ZOOM_DEFAULT,
    center: latLng(52.1, 5.58)
  };
  layers: any[] = [];
  opened: boolean = true;

  buildingSelected: Building|null = null;
  layerSelected: Polygon|null = null;

  private map: Map|null = null;
  private readonly highlightStyle = {
    'color': '#FF3388',
    'weight': 2,
    'opacity': 1
  };
  private readonly defaultStyle = {
    'color': '#3388FF',
    'weight': 3,
    'opacity': 1
  };

  constructor(
    private buildingService: BuildingService,
    private companyService: CompanyService,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    this.update();
  }

  private update(): void {
    this.buildingService.getBuildings().subscribe(buildings => {
      const layers : any[] = [];
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
      this.layers = layers;
      this.map?.setView(latLng(buildings[0].center.lat, buildings[0].center.lon), this.ZOOM_DEFAULT);
    });
    this.updateCompanies();
  }

  private updateCompanies(): void {
    this.companyService.getCompanies().subscribe(companies => {
      for (const company of companies) {
        console.log(company);
      }
    })
  }

  onLayerClick(event: L.LeafletMouseEvent, layerClicked: L.Layer) {
    // this.zone.run(() => {
    //   console.log('onLayerClick');
		// });
    this.layerSelected?.setStyle(this.defaultStyle);
    const layer: Polygon = (layerClicked as Polygon);
    const building: Building = (layer as any)["building"];
    this.layerSelected = layer;
    this.buildingSelected = building;
    layer.setStyle(this.highlightStyle);
  }

  onMapClick(event: LeafletMouseEvent): void {
    console.log('mapClick');
  }

  onMapReady(map: Map) {
	  this.map = map;
  }
}
