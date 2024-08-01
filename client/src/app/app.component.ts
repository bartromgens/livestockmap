import { Component, NgZone } from '@angular/core';
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatCardModule } from "@angular/material/card";

import { LeafletModule } from "@bluehalo/ngx-leaflet";
import 'leaflet.markercluster';  // a leaflet plugin
import { latLng, LeafletMouseEvent, polygon, tileLayer, Map, Polygon, Layer } from "leaflet";
import { Marker, marker, markerClusterGroup, divIcon } from 'leaflet';

import { BuildingService, Company, Coordinate } from "./core";
import { Building } from "./core";
import { CompanyService } from "./core";
import { chickenIcon, cowIcon, pigIcon } from "./map";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NgOptimizedImage,
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
  readonly title: string = 'veekaart.nl';
  options = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 20, attribution: '...' })
    ],
    zoom: this.ZOOM_DEFAULT,
    center: latLng(52.1, 5.58)
  };
  layers: any[] = [];
  sidebarOpened: boolean = false;

  buildingSelected: Building|null = null;
  layerBuildingSelected: Polygon|null = null;
  companySelected: Company|null = null;
  layerCompanySelected: Marker|null = null;

  private map: Map|null = null;
  private readonly highlightBuildingStyle = {
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
        layer.on('click', (event: L.LeafletMouseEvent) => this.onBuildingLayerClick(event, layer));
        layer.buildingId = building.way_id;
        layer.building = building;
        layers.push(layer);
      }
      this.layers.push(...layers);
      if (buildings.length > 0) {
        this.map?.setView(latLng(buildings[0].center.lat, buildings[0].center.lon), this.ZOOM_DEFAULT);
      }
    });
    this.updateCompanies();
  }

  private updateCompanies(): void {
    this.companyService.getCompanies().subscribe(companies => {
      const layers: any[] = [];
      for (const company of companies) {
        const layersCompany: any[] = [];
        const coordinate = latLng([company.address.lat, company.address.lon]);
        if (company.chicken) {
          layersCompany.push(marker(coordinate, {icon: chickenIcon}));
        }
        if (company.pig) {
          layersCompany.push(marker(coordinate, {icon: pigIcon}));
        }
        if (company.cattle) {
          layersCompany.push(marker(coordinate, {icon: cowIcon}));
        }
        for (const layer of layersCompany) {
          layer.on('click', (event: L.LeafletMouseEvent) => this.onCompanyLayerClick(event, layer));
          layer.company = company;
        }
        layers.push(...layersCompany);
      }
      const markers = markerClusterGroup({
        disableClusteringAtZoom: 13,
        // iconCreateFunction: function(cluster) {
        //   return divIcon({ html: '<b>' + cluster.getChildCount() + '</b>' }); // use getAllChildMarkers() to get type
        // }
      });
      markers.addLayers(layers);
      this.layers.push(markers);
    })
  }

  onBuildingLayerClick(event: LeafletMouseEvent, layerClicked: Layer): void {
    this.zone.run(() => {
      this.sidebarOpened = true;
      this.layerBuildingSelected?.setStyle(this.defaultStyle);
      const layer: Polygon = (layerClicked as Polygon);
      layer.setStyle(this.highlightBuildingStyle);
      const building: Building = (layer as any)["building"];
      this.layerBuildingSelected = layer;
      this.buildingSelected = building;
    });
  }

  onCompanyLayerClick(event: LeafletMouseEvent, layerClicked: Layer): void {
    this.zone.run(() => {
      this.sidebarOpened = true;
      const layer: Marker = (layerClicked as Marker);
      const company: Company = (layer as any)["company"];
      this.companySelected = company;
    });
  }

  onMapClick(event: LeafletMouseEvent): void {
    console.log('mapClick');
  }

  onMapReady(map: Map) {
	  this.map = map;
  }

  googleCoordinateUrl(coordinate: Coordinate): string {
    return `https://www.google.com/maps/place/${coordinate.lat},${coordinate.lon}`;
  }
}
