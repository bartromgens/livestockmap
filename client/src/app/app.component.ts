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
import { latLng, Map, LeafletMouseEvent, LeafletEvent } from "leaflet";
import { polygon, tileLayer, Polygon, Layer, LayerGroup, layerGroup } from "leaflet";
import { Marker, marker, markerClusterGroup, MarkerCluster, divIcon, DivIcon} from 'leaflet';

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
  private readonly ZOOM_DEFAULT: number = 14;
  private readonly CLUSTER_AT_ZOOM: number = 13;
  private readonly MAX_CLUSTER_RADIUS: number = 20;
  private readonly BUILDINGS_AT_ZOOM: number = this.CLUSTER_AT_ZOOM - 1;
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
  buildingLayer: LayerGroup|null = null;

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
    this.updateCompanies();
    this.updateBuildings();
  }

  private updateBuildings(): void {
    this.buildingService.getBuildings().subscribe(buildings => {
      const layers : any[] = [];
      for (const building of buildings) {
        const coordinates : [number, number][] = [];
        for (const coordinate of building.geometry) {
          coordinates.push([coordinate.lat, coordinate.lon]);
        }
        const layer: any = polygon(coordinates);
        layer.on('click', (event: LeafletMouseEvent) => this.onBuildingLayerClick(event, layer));
        layer.buildingId = building.way_id;
        layer.building = building;
        layers.push(layer);
      }
      this.buildingLayer = layerGroup(layers);
      this.layers.push(this.buildingLayer);
    });
  }

  private updateCompanies(): void {
    this.companyService.getCompanies().subscribe(companies => {
      const layers: any[] = [];
      for (const company of companies) {
        const layersCompany: any[] = [];
        const coordinate = latLng([company.address.lat, company.address.lon]);
        // TODO BR: remove switch with polymorphism
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
          layer.on('click', (event: LeafletMouseEvent) => this.onCompanyLayerClick(event, layer));
          layer.company = company;
        }
        layers.push(...layersCompany);
      }
      const markers = markerClusterGroup({
        disableClusteringAtZoom: this.CLUSTER_AT_ZOOM,
        iconCreateFunction: this.createMarkerGroupIcon,
        showCoverageOnHover: false,
        maxClusterRadius: this.MAX_CLUSTER_RADIUS,
      });
      markers.addLayers(layers);
      this.layers.push(markers);

      if (companies.length > 0) {
        this.map?.setView(latLng(companies[0].address.lat, companies[0].address.lon), this.ZOOM_DEFAULT);
      }
    })
  }

  private createMarkerGroupIcon(cluster: MarkerCluster): DivIcon {
    // TODO BR: remove switch with polymorphism
    let cattleCount = 0;
    let chickenCount = 0;
    let pigCount = 0;
    for (const marker of cluster.getAllChildMarkers()) {
      const company: Company = (marker as any)["company"];
      if (company.cattle) {
        cattleCount += 1;
      }
      if (company.chicken) {
        chickenCount += 1;
      }
      if (company.pig) {
        pigCount += 1;
      }
    }
    const totalCount = cattleCount + chickenCount + pigCount;
    const sizeFactorCow = Math.sqrt(cattleCount/totalCount);
    const sizeCow = [30*sizeFactorCow, 19*sizeFactorCow];
    const sizeFactorChicken = Math.sqrt(chickenCount/totalCount);
    const sizeChicken = [30*sizeFactorChicken, 30*sizeFactorChicken];
    const sizeFactorPig = Math.sqrt(pigCount/totalCount);
    const sizePig = [30*sizeFactorPig, 20*sizeFactorPig];
    const iconImageStyle = `display: inline-block;`;
    let iconHtml: string = `<div style="width: 60px;">`;
    iconHtml += `<img src="/assets/pig60x40.png" width=${sizePig[0]} height=${sizePig[1]} style="${iconImageStyle}">`;
    iconHtml += `<img src="/assets/cow60x38.png" width=${sizeCow[0]} height=${sizeCow[1]} style="${iconImageStyle}">`;
    iconHtml += `<img src="/assets/chicken60x60.png" width=${sizeChicken[0]} height=${sizeChicken[1]} style="">`;
    iconHtml += `</div>`;
    return divIcon({ html: iconHtml, iconSize: [0, 0], iconAnchor: [15, 15], className: '' }); // use getAllChildMarkers() to get type
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

  onMapReady(map: Map): void {
    this.map = map;
    this.map.on('zoomend', (event: LeafletEvent) => this.onZoom(event));
  }

  private onZoom(event: LeafletEvent): void {
    this.zone.run(() => {
      if (!this.map || !this.buildingLayer) {
        return;
      }
      console.log('companies in view', this.getCompaniesInView().length);
      if (this.map.getZoom() < this.BUILDINGS_AT_ZOOM && this.map.hasLayer(this.buildingLayer)) {
        this.map.removeLayer(this.buildingLayer);
      }
      if (this.map.getZoom() >= this.BUILDINGS_AT_ZOOM && !this.map.hasLayer(this.buildingLayer)) {
        this.map.addLayer(this.buildingLayer);
      }
    });
  }

  googleCoordinateUrl(coordinate: Coordinate): string {
    return `https://www.google.com/maps/place/${coordinate.lat},${coordinate.lon}`;
  }

  private getCompaniesInView(): Company[] {
    if (!this.map) {
      return [];
    }
    const companies: Company[] = [];
    this.map.eachLayer( (layer: Layer) => {
      if (layer instanceof MarkerCluster) {
        if (this.map?.getBounds().contains(layer.getLatLng())) {
          companies.push(...layer.getAllChildMarkers().map(child => (child as any)["company"]));
        }
      } else if (layer instanceof Marker) {
        if (this.map?.getBounds().contains(layer.getLatLng())) {
          const company = (layer as any)["company"];
          companies.push(company);
        }
      }
    });
    return companies;
  }
}
