import { Component, NgZone, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage, Location } from '@angular/common';
import { ActivatedRoute, ParamMap, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

import { LeafletModule } from '@bluehalo/ngx-leaflet';
import 'leaflet.markercluster'; // a leaflet plugin
import {
  Control,
  latLng,
  LatLngBounds,
  Layer,
  LeafletEvent,
  LeafletMouseEvent,
  Map,
  Marker,
  Polygon,
  tileLayer,
} from 'leaflet';

import { BBox, Coordinate } from './core';
import {
  CompaniesStats,
  Company,
  CompanyLayer,
  CompanyService,
} from './core/company';
import { Building, BuildingLayer, BuildingService } from './core/building';
import { TileLayer, TileService } from './core/tile';
import { environment } from '../environments/environment';
import {
  AnimalLayer,
  AnimalType,
  getAnimalTypeFromString,
} from './core/animal';
import { FooterComponent } from './nav/footer.component';

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
    MatProgressSpinner,
    FooterComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private readonly ZOOM_DEFAULT: number = environment.production ? 8 : 9;
  private readonly CLUSTER_AT_ZOOM: number = 12;
  private readonly MAX_CLUSTER_RADIUS: number = 30;
  private readonly BUILDINGS_AT_ZOOM: number = 15;
  private readonly ANIMALS_AT_ZOOM: number = 18;
  isLoading = true;

  Object = Object;
  readonly title: string = 'veekaart';
  private baseLayer = tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      maxZoom: 20,
      attribution: '...',
    },
  );
  options = {
    layers: [this.baseLayer],
    zoom: this.ZOOM_DEFAULT,
    center: latLng(52.1, 5.58),
  };
  sidebarOpened = false;

  private map: Map | null = null;
  buildingLayer: BuildingLayer;
  companyLayer: CompanyLayer;
  private animalLayer: AnimalLayer;
  private tileLayer: TileLayer;
  private readonly control: Control.Layers;
  private visibleAnimalTypes: AnimalType[] = [];
  companiesInView: Company[] = [];

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private buildingService: BuildingService,
    private companyService: CompanyService,
    private tileService: TileService,
    private zone: NgZone,
  ) {
    this.buildingLayer = new BuildingLayer();
    this.animalLayer = new AnimalLayer();
    this.companyLayer = new CompanyLayer({
      clusterAtZoom: this.CLUSTER_AT_ZOOM,
      maxClusterRadius: this.MAX_CLUSTER_RADIUS,
      visibleLayers: [AnimalType.Pig, AnimalType.Cow_Beef, AnimalType.Chicken],
    });
    this.tileLayer = new TileLayer();
    this.control = new Control.Layers(undefined, undefined, {
      collapsed: false,
    });
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      if (params.has('showTiles') && params.get('showTiles') == 'true') {
        this.updateTiles();
      }
      if (params.has('visibleLayers') && params.get('visibleLayers') !== null) {
        this.updateVisibleLayersFromParams(params);
      }
    });
  }

  private initializeMap(): void {
    console.log('initializeMap');
    this.isLoading = true;
    if (!this.map) {
      console.assert(false, 'map is not defined');
      return;
    }
    this.updateCompanies();
    this.update();
    this.addControls();
  }

  private addControls() {
    if (!this.map) {
      console.assert(false, 'map is not defined');
      return;
    }
    this.control.addTo(this.map);
    new Control.Scale().addTo(this.map);
  }

  private update(): void {
    console.log('update');
    if (!this.map) {
      console.assert(false, 'map is not defined');
      return;
    }

    this.updateBuildings(this.bbox);
  }

  private updateCompanies(): void {
    console.log('updateCompanies');
    this.companyService.getCompanies().subscribe((companies) => {
      if (!this.map) {
        return;
      }

      this.companyLayer.create(
        companies,
        this.control,
        this.onCompanyLayerClick,
      );

      this.companyLayer.add(this.map, this.onVisibleLayersChange);
      this.isLoading = false;
      this.updateCompanyInViewStats();
    });
  }

  private updateBuildings(bbox: BBox): void {
    console.log('updateBuildings');
    if (this.map && this.map.getZoom() < this.BUILDINGS_AT_ZOOM) {
      this.buildingLayer.remove(this.map);
      console.log('buildings not shown at this zoom level');
      return;
    }

    bbox = BBox.enlarge(bbox);
    this.buildingService.getBuildings(bbox).subscribe((buildings) => {
      if (!this.map) {
        return;
      }
      this.buildingLayer.remove(this.map);
      this.buildingLayer.create(
        buildings,
        this.visibleAnimalTypes,
        this.onBuildingLayerClick,
      );
      this.buildingLayer.add(this.map);
      this.updateAnimals();
    });
  }

  private updateAnimals(): void {
    if (!this.map) {
      return;
    }
    this.animalLayer.remove(this.map);
    if (this.map.getZoom() < this.ANIMALS_AT_ZOOM) {
      return;
    }
    const buildingsInView = this.buildingLayer.getBuildingsInView(this.map);
    this.animalLayer.create(buildingsInView, this.map.getZoom());
    this.animalLayer.add(this.map);
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

  private updateVisibleLayersFromParams(params: ParamMap) {
    const visibleLayersStr = params.get('visibleLayers');
    if (!visibleLayersStr) {
      return;
    }
    const visibleLayers = visibleLayersStr.split(',');
    const visibleLayersAnimalTypes = visibleLayers
      .map((visibleAnimalType) => getAnimalTypeFromString(visibleAnimalType))
      .filter((item) => item !== undefined);
    this.updateVisibleLayers(visibleLayersAnimalTypes);
  }

  private updateVisibleLayers(visibleLayersAnimalTypes: AnimalType[]): void {
    if (!this.map) {
      console.assert(false, 'map is not defined');
      return;
    }
    this.companyLayer.hideAllLayers(this.map);
    for (const visibleAnimalType of visibleLayersAnimalTypes) {
      this.companyLayer.setLayerVisibility(this.map, visibleAnimalType, true);
    }
  }

  private onVisibleLayersChange = (visibleAnimalTypes: AnimalType[]): void => {
    this.visibleAnimalTypes = visibleAnimalTypes;
    const url = new URL(window.location.href);
    url.searchParams.set('visibleLayers', visibleAnimalTypes.join(','));
    this.location.replaceState(url.pathname + url.search);
    this.updateBuildings(this.bbox);
    this.updateCompanyInViewStats();
  };

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
    console.log('mapClick', event);
  }

  onMapReady(map: Map): void {
    this.map = map;
    this.initializeMap();
  }

  onMove(event: LeafletEvent): void {
    console.log('onMove', event);
    this.updateCompanyInViewStats();
    this.update();
  }

  onZoom(event: LeafletEvent): void {
    console.log('onZoom: level', this.map?.getZoom(), event);
  }

  private updateCompanyInViewStats(): void {
    this.companiesInView = this.getCompaniesInView();
    const stats = new CompaniesStats(this.companiesInView);
    console.log(
      'companies in view',
      stats.companies.length,
      `| cows: ${Math.floor(stats.cowCount / 1000)}k, chickens: ${Math.floor(stats.chickenCount / 1000)}k, pigs: ${Math.floor(stats.pigCount / 1000)}k`,
      `| cow farm: ${stats.cattleCompanies.length}, chicken farm: ${stats.chickenCompanies.length}, pig farm: ${stats.pigCompanies.length}`,
    );
  }

  googleCoordinateUrl(coordinate: Coordinate): string {
    return `https://www.google.com/maps/place/${coordinate.lat},${coordinate.lon}`;
  }

  private getCompaniesInView(): Company[] {
    if (!this.map) {
      return [];
    }
    return this.companyLayer.getCompaniesInView(this.map);
  }

  private get buildingsInView(): Building[] {
    if (!this.map) {
      return [];
    }
    return this.buildingLayer.getBuildingsInView(this.map);
  }
}
