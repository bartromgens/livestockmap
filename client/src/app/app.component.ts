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
  circle,
  polygon,
  PolylineOptions,
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

import {
  BuildingService,
  CompaniesStats,
  Company,
  Coordinate,
  Tile,
  TileService,
} from './core';
import { Building } from './core';
import { CompanyService } from './core';
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
  private readonly ZOOM_DEFAULT: number = 14;
  private readonly CLUSTER_AT_ZOOM: number = 13;
  private readonly MAX_CLUSTER_RADIUS: number = 20;
  private readonly BUILDINGS_AT_ZOOM: number = this.CLUSTER_AT_ZOOM;
  private readonly ANIMALS_AT_ZOOM: number = 18;
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
  layers: any[] = [];
  sidebarOpened = false;

  buildingSelected: Building | null = null;
  layerBuildingSelected: Polygon | null = null;
  companySelected: Company | null = null;
  buildingLayer: LayerGroup | null = null;
  animalsLayer: LayerGroup | null = null;
  tilesLayer: LayerGroup | null = null;

  private tiles: Tile[] | null = null;

  private map: Map | null = null;
  private readonly highlightBuildingStyle = {
    color: '#FF3388',
    weight: 2,
    opacity: 1,
  };
  private readonly defaultStyle = {
    color: '#3388FF',
    weight: 3,
    opacity: 1,
  };

  constructor(
    private route: ActivatedRoute,
    private buildingService: BuildingService,
    private companyService: CompanyService,
    private tileService: TileService,
    private zone: NgZone,
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      if (params.has('showTiles') && params.get('showTiles') == 'true') {
        this.updateTiles();
      }
    });
  }

  private update(): void {
    if (!this.map) {
      console.assert(false, 'map is not defined');
      return;
    }

    this.layers = [];
    this.updateCompanies(this.bbox);

    if (this.map.getZoom() >= this.BUILDINGS_AT_ZOOM) {
      this.updateBuildings(this.bbox);
    }
  }

  private updateBuildings(bbox: BBox): void {
    this.buildingService.getBuildings(bbox).subscribe((buildings) => {
      const layers: any[] = [];
      for (const building of buildings) {
        const layer: any = building.polygon;
        layer.on('click', (event: LeafletMouseEvent) =>
          this.onBuildingLayerClick(event, layer),
        );
        layer.buildingId = building.way_id;
        layer.building = building;
        layers.push(layer);
      }
      this.buildingLayer = layerGroup(layers);
      this.layers.push(this.buildingLayer);
      this.updateAnimals();
    });
  }

  private updateCompanies(bbox: BBox): void {
    this.companyService.getCompanies(bbox).subscribe((companies) => {
      const layers: any[] = [];
      for (const company of companies) {
        const layersCompany: any[] = [];
        const coordinate = latLng([company.address.lat, company.address.lon]);
        // TODO BR: remove switch with polymorphism
        if (company.chicken) {
          layersCompany.push(marker(coordinate, { icon: chickenIcon }));
        }
        if (company.pig) {
          layersCompany.push(marker(coordinate, { icon: pigIcon }));
        }
        if (company.cattle) {
          layersCompany.push(marker(coordinate, { icon: cowIcon }));
        }
        for (const layer of layersCompany) {
          layer.on('click', (event: LeafletMouseEvent) =>
            this.onCompanyLayerClick(event, layer),
          );
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

      // if (companies.length > 0) {
      //   this.map?.setView(
      //     latLng(companies[0].address.lat, companies[0].address.lon),
      //     this.ZOOM_DEFAULT,
      //   );
      // }
    });
  }

  private updateTiles(): void {
    console.log('updateTiles');
    this.tileService.getTiles().subscribe((tiles) => {
      if (!this.map) {
        return;
      }
      const layers: any[] = [];
      const labels: any[] = [];
      for (const tile of tiles) {
        let color = 'lightblue';
        if (tile.complete) {
          color = 'lightgreen';
        } else if (tile.failed) {
          color = 'red';
        }
        const options: PolylineOptions = {
          color: color,
        };
        const layer: any = polygon(tile.coordinates, options);
        layer.tile = tile;
        layers.push(layer);

        const showTileMarker = false;
        if (showTileMarker) {
          const label = marker([tile.center.lat, tile.center.lon], {
            opacity: 0.3,
          }); //opacity may be set to zero
          label.bindTooltip(`<p>${tile.id}</p>`);
          labels.push(label);
        }
      }

      if (this.tilesLayer && this.map.hasLayer(this.tilesLayer)) {
        this.map.removeLayer(this.tilesLayer);
      }
      this.tilesLayer = layerGroup(layers);
      this.map.addLayer(this.tilesLayer);
      // this.layers.push(layerGroup(layers));
      // this.layers.push(layerGroup(labels));
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

  private createMarkerGroupIcon(cluster: MarkerCluster): DivIcon {
    // TODO BR: remove switch with polymorphism
    let cattleCount = 0;
    let chickenCount = 0;
    let pigCount = 0;
    for (const marker of cluster.getAllChildMarkers()) {
      const company: Company = (marker as any)['company'];
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
    const sizeFactorCow = Math.sqrt(cattleCount / totalCount);
    const sizeCow = [30 * sizeFactorCow, 19 * sizeFactorCow];
    const sizeFactorChicken = Math.sqrt(chickenCount / totalCount);
    const sizeChicken = [30 * sizeFactorChicken, 30 * sizeFactorChicken];
    const sizeFactorPig = Math.sqrt(pigCount / totalCount);
    const sizePig = [30 * sizeFactorPig, 20 * sizeFactorPig];
    const iconImageStyle = `display: inline-block;`;
    let iconHtml = `<div style="width: 60px;">`;
    iconHtml += `<img src="/assets/pig60x40.png" width=${sizePig[0]} height=${sizePig[1]} style="${iconImageStyle}">`;
    iconHtml += `<img src="/assets/cow60x38.png" width=${sizeCow[0]} height=${sizeCow[1]} style="${iconImageStyle}">`;
    iconHtml += `<img src="/assets/chicken60x60.png" width=${sizeChicken[0]} height=${sizeChicken[1]} style="">`;
    iconHtml += `</div>`;
    return divIcon({
      html: iconHtml,
      iconSize: [0, 0],
      iconAnchor: [15, 15],
      className: '',
    }); // use getAllChildMarkers() to get type
  }

  onBuildingLayerClick(event: LeafletMouseEvent, layerClicked: Layer): void {
    this.zone.run(() => {
      this.sidebarOpened = true;
      this.layerBuildingSelected?.setStyle(this.defaultStyle);
      const layer: Polygon = layerClicked as Polygon;
      layer.setStyle(this.highlightBuildingStyle);
      const building: Building = (layer as any)['building'];
      this.layerBuildingSelected = layer;
      this.buildingSelected = building;
      const circleMarkers = [];
      for (const point of building.animalCoordinates) {
        const circleOptions = {
          radius: 1,
          stroke: false,
          fillOpacity: 1,
          fillColor: 'blue',
        };
        circleMarkers.push(
          circleMarker(latLng(point.lat, point.lon), circleOptions),
        );
      }
      this.layers.push(layerGroup(circleMarkers));
    });
  }

  onCompanyLayerClick(event: LeafletMouseEvent, layerClicked: Layer): void {
    this.zone.run(() => {
      this.sidebarOpened = true;
      const layer: Marker = layerClicked as Marker;
      const company: Company = (layer as any)['company'];
      this.companySelected = company;

      if (!environment.production) {
        this.layers.push(
          circle(latLng(company.coordinate.lat, company.coordinate.lon), {
            radius: 100,
          }),
        );
      }
    });
  }

  onMapClick(event: LeafletMouseEvent): void {
    // console.log('mapClick');
  }

  onMapReady(map: Map): void {
    this.map = map;
    this.update();
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

    const circleMarkers = [];
    const circleOptions = this.getAnimalCircleOptions();
    for (const building of this.getBuildingsInView()) {
      for (const point of building.animalCoordinates) {
        circleMarkers.push(
          circleMarker(latLng(point.lat, point.lon), circleOptions),
        );
      }
    }
    this.animalsLayer = layerGroup(circleMarkers);
    this.layers.push(this.animalsLayer);
  }

  private getAnimalCircleOptions(): any {
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

  private getBuildingsInView(): Building[] {
    if (!this.map) {
      return [];
    }
    const buildings: Building[] = [];
    this.map.eachLayer((layer: Layer) => {
      if (layer instanceof Polygon) {
        if (this.map?.getBounds().contains(layer.getCenter())) {
          const building = (layer as any)['building'];
          buildings.push(building);
        }
      }
    });
    return buildings;
  }
}
