import { Component, NgZone, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

import { LeafletModule } from '@bluehalo/ngx-leaflet';
import 'leaflet.markercluster'; // a leaflet plugin
import {
  latLng,
  Map,
  LeafletMouseEvent,
  LeafletEvent,
  circleMarker,
  LatLngBounds,
  LatLng,
  CircleMarker,
} from 'leaflet';
import { tileLayer, Polygon, Layer, LayerGroup, layerGroup } from 'leaflet';
import {
  Marker,
  marker,
  markerClusterGroup,
  MarkerCluster,
  divIcon,
  DivIcon,
} from 'leaflet';

import { Coordinate } from './core';
import {
  CompaniesStats,
  Company,
  CompanyLayer,
  CompanyService,
} from './core/company';
import { Building, BuildingService, BuildingLayer } from './core/building';
import { TileLayer, TileService } from './core/tile';
import { chickenIcon, cowIcon, pigIcon } from './map';
import { BBox } from './core';
import { environment } from '../environments/environment';

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
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private readonly ZOOM_DEFAULT: number = environment.production ? 8 : 13;
  private readonly CLUSTER_AT_ZOOM: number = 13;
  private readonly MAX_CLUSTER_RADIUS: number = 30;
  private readonly BUILDINGS_AT_ZOOM: number = this.CLUSTER_AT_ZOOM + 1;
  private readonly ANIMALS_AT_ZOOM: number = 17;
  Object = Object;
  readonly title: string = 'veekaart.nl';
  options = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 20,
        attribution: '...',
      }),
    ],
    zoom: this.ZOOM_DEFAULT,
    center: latLng(52.1, 5.58),
  };
  sidebarOpened = false;

  buildingLayer: BuildingLayer;
  companyLayer: CompanyLayer;
  tileLayer: TileLayer;

  animalsLayer: LayerGroup | null = null;

  private map: Map | null = null;

  constructor(
    private route: ActivatedRoute,
    private buildingService: BuildingService,
    private companyService: CompanyService,
    private tileService: TileService,
    private zone: NgZone,
  ) {
    this.buildingLayer = new BuildingLayer();
    this.tileLayer = new TileLayer();
    this.companyLayer = new CompanyLayer({
      clusterAtZoom: this.CLUSTER_AT_ZOOM,
      maxClusterRadius: this.MAX_CLUSTER_RADIUS,
    });
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      if (params.has('showTiles') && params.get('showTiles') == 'true') {
        this.updateTiles();
      }
    });
  }

  private initializeMap(): void {
    this.updateCompanies();
    this.update();
  }

  private update(): void {
    if (!this.map) {
      console.assert(false, 'map is not defined');
      return;
    }

    this.updateBuildings(this.bbox);
  }

  private updateBuildings(bbox: BBox): void {
    console.log('updateBuildings');
    if (this.map && this.map.getZoom() < this.BUILDINGS_AT_ZOOM) {
      this.buildingLayer.remove(this.map);
      return;
    }

    bbox = BBox.enlarge(bbox);
    this.buildingService.getBuildings(bbox).subscribe((buildings) => {
      if (!this.map) {
        return;
      }
      this.buildingLayer.remove(this.map);
      this.buildingLayer.create(buildings, this.onBuildingLayerClick);
      this.buildingLayer.add(this.map);
      this.updateAnimals();
    });
  }

  private updateCompanies(): void {
    console.log('updateCompanies');
    this.companyService.getCompanies().subscribe((companies) => {
      if (!this.map) {
        return;
      }

      this.companyLayer.remove(this.map);
      this.companyLayer.create(companies, this.onCompanyLayerClick);
      this.companyLayer.add(this.map);
    });
  }

  private updateTiles(): void {
    console.log('updateTiles');
    this.tileService.getTiles().subscribe((tiles) => {
      if (!this.map) {
        return;
      }

      this.tileLayer.update(tiles, this.map);
    });
  }

  private get bbox(): BBox {
    if (!this.map) {
      console.assert(false, 'map is not defined');
      return new BBox(0, 0, 0, 0);
    }

    const bounds: LatLngBounds = this.map.getBounds();
    return new BBox(
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    );
  }

  private onBuildingLayerClick = (
    event: LeafletMouseEvent,
    layerClicked: Layer,
  ): void => {
    this.zone.run(() => {
      this.sidebarOpened = true;
      const layer: Polygon = layerClicked as Polygon;
      this.buildingLayer.select(layer);
    });
  };

  private onCompanyLayerClick = (
    event: LeafletMouseEvent,
    layerClicked: Layer,
  ): void => {
    this.zone.run(() => {
      this.sidebarOpened = true;
      const layer: Marker = layerClicked as Marker;
      const company: Company = (layer as any)['company'];
      this.companyLayer.select(company);

      // if (!environment.production) {
      //   this.layers.push(
      //     circle(latLng(company.coordinate.lat, company.coordinate.lon), {
      //       radius: 100,
      //     }),
      //   );
      // }
    });
  };

  onMapClick(event: LeafletMouseEvent): void {
    // console.log('mapClick');
  }

  onMapReady(map: Map): void {
    this.map = map;
    this.initializeMap();
  }

  onMove(event: LeafletEvent): void {
    console.log('onMove');
    this.logCompanyInViewStats();
    this.update();
  }

  onZoom(event: LeafletEvent): void {
    console.log('onZoom: level', this.map?.getZoom());
  }

  private updateAnimals(): void {
    if (!this.map) {
      return;
    }
    if (this.animalsLayer) {
      this.map.removeLayer(this.animalsLayer);
    }
    if (this.map.getZoom() < this.ANIMALS_AT_ZOOM) {
      return;
    }

    const circleMarkers = this.createAnimalMarkers();
    this.animalsLayer = layerGroup(circleMarkers);
    this.map.addLayer(this.animalsLayer);
  }

  private createAnimalMarkers(): CircleMarker[] {
    const circleMarkers = [];
    const circleOptions = this.animalCircleOptions;
    for (const building of this.buildingsInView) {
      for (const point of building.animalCoordinates) {
        circleMarkers.push(
          circleMarker(latLng(point.lat, point.lon), circleOptions),
        );
      }
    }
    return circleMarkers;
  }

  private get animalCircleOptions(): any {
    let radius = 1;
    if (this.map) {
      radius = this.map.getZoom() >= 20 ? 2 : radius;
    }
    return {
      radius: radius,
      stroke: false,
      fillOpacity: 1,
      fillColor: 'blue',
    };
  }

  private logCompanyInViewStats(): void {
    const stats = new CompaniesStats(this.getCompaniesInView());
    console.log(
      'companies in view',
      stats.companies.length,
      `cow: ${stats.cattleCompanies.length}, chicken: ${stats.chickenCompanies.length}, pigs: ${stats.pigCompanies.length}`,
    );
  }

  googleCoordinateUrl(coordinate: Coordinate): string {
    return `https://www.google.com/maps/place/${coordinate.lat},${coordinate.lon}`;
  }

  private getCompaniesInView(): Company[] {
    if (!this.map) {
      return [];
    }
    const companies: Company[] = [];
    this.map.eachLayer((layer: Layer) => {
      if (layer instanceof MarkerCluster) {
        if (this.map?.getBounds().contains(layer.getLatLng())) {
          companies.push(
            ...layer
              .getAllChildMarkers()
              .map((child) => (child as any)['company']),
          );
        }
      } else if (layer instanceof Marker) {
        if (this.map?.getBounds().contains(layer.getLatLng())) {
          const company = (layer as any)['company'];
          companies.push(company);
        }
      }
    });
    return companies;
  }

  private get buildingsInView(): Building[] {
    if (!this.map) {
      return [];
    }

    const buildings: Building[] = [];
    this.map.eachLayer((layer: Layer) => {
      if (layer instanceof Polygon) {
        const points = layer.getLatLngs()[0] as LatLng[];
        for (const point of points) {
          if (this.map?.getBounds().contains(point)) {
            console.log('bounds do contain point', point);
            const building = (layer as any)['building'];
            buildings.push(building);
            break;
          }
        }
      }
    });
    return buildings;
  }
}
