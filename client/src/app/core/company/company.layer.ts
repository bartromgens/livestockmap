import { Company } from './company';
import {
  Control,
  divIcon,
  DivIcon,
  latLng,
  Layer,
  LayerGroup,
  LeafletMouseEvent,
  Map,
  Marker,
  marker,
  MarkerCluster,
  markerClusterGroup,
} from 'leaflet';
import { ANIMAL_TYPE_ICON } from '../../map';
import { AnimalType } from '../animal';
import { EnumUtils } from '../../utils';

export interface CompanyLayerOptions {
  clusterAtZoom: number;
  maxClusterRadius: number;
}

export class CompanyLayer {
  selectedCompany: Company | null = null;
  private readonly optionsDefault: CompanyLayerOptions = {
    clusterAtZoom: 13,
    maxClusterRadius: 30,
  };
  private readonly options: CompanyLayerOptions = this.optionsDefault;
  private layerGroup: LayerGroup | null = null;

  constructor(options: CompanyLayerOptions = this.optionsDefault) {
    this.options = { ...this.options, ...options };
  }

  create(
    companies: Company[],
    control: Control.Layers,
    onClick: (event: LeafletMouseEvent, layerClicked: Layer) => void,
  ): void {
    console.log('create markers');
    const companiesGrouped = Company.groupCompaniesByAnimalType(companies);

    const animalLayers = [];
    for (const animalType of Object.values(AnimalType)) {
      const layers: any[] = [];
      for (const company of companiesGrouped[animalType]) {
        const coordinate = latLng([company.address.lat, company.address.lon]);
        const companyMarker: any = marker(coordinate, {
          icon: ANIMAL_TYPE_ICON[company.animalTypeMain].leafletIcon,
        });
        companyMarker.on('click', (event: LeafletMouseEvent) =>
          onClick(event, companyMarker),
        );
        companyMarker.company = company;
        layers.push(companyMarker);
      }
      const markers = markerClusterGroup({
        disableClusteringAtZoom: this.options.clusterAtZoom,
        iconCreateFunction: this.createMarkerGroupIcon,
        showCoverageOnHover: false,
        maxClusterRadius: this.options.maxClusterRadius,
      });
      markers.addLayers(layers);
      animalLayers.push(markers);
      control.addOverlay(
        markers,
        EnumUtils.getEnumKeyByValue(AnimalType, animalType) as string,
      );
    }

    this.layerGroup = new LayerGroup(animalLayers);
    console.log('create markers done');
  }

  remove(map: Map): void {
    if (this.layerGroup && map.hasLayer(this.layerGroup)) {
      map.removeLayer(this.layerGroup);
    }
  }

  add(map: Map): void {
    if (this.layerGroup) {
      map.addLayer(this.layerGroup);
    }
  }

  select(company: Company): void {
    this.selectedCompany = company;
  }

  getCompaniesInView(map: Map): Company[] {
    console.log('getCompaniesInView');
    const companiesSet = new Set<Company>();
    map.eachLayer((layer: Layer) => {
      if (layer instanceof MarkerCluster) {
        if (map.getBounds().contains(layer.getLatLng())) {
          layer
            .getAllChildMarkers()
            .map((child) => companiesSet.add((child as any)['company']));
        }
      } else if (layer instanceof Marker) {
        if (map.getBounds().contains(layer.getLatLng())) {
          const company = (layer as any)['company'];
          companiesSet.add(company);
        }
      }
    });
    return [...companiesSet];
  }

  private static countAnimalType(companies: Company[]): {
    [key in AnimalType]: number;
  } {
    const counts = Object.values(AnimalType).reduce(
      (acc, animalType) => {
        acc[animalType as AnimalType] = 0;
        return acc;
      },
      {} as { [key in AnimalType]: number },
    );

    // Iterate over the items and increment the corresponding color count
    companies.forEach((company) => {
      counts[company.animalTypeMain]++;
    });

    return counts;
  }

  private createMarkerGroupIcon(cluster: MarkerCluster): DivIcon {
    const companies: Company[] = [];
    for (const marker of cluster.getAllChildMarkers()) {
      const company: Company = (marker as any)['company'];
      companies.push(company);
    }

    const animalCounts = CompanyLayer.countAnimalType(companies);

    let totalCount = 0;
    for (const animalType of Object.values(AnimalType)) {
      const count: number = animalCounts[animalType];
      totalCount += count;
    }

    if (totalCount == 0) {
      return divIcon({
        iconSize: [0, 0],
        iconAnchor: [0, 0],
        className: '',
      });
    }

    let iconHtml = `<div style="width: 80px;">`;
    for (const animalType of Object.values(AnimalType)) {
      const count: number = animalCounts[animalType];
      const sizeFactor = Math.pow(count / totalCount, 1 / 2) / Math.sqrt(2);
      const icon = ANIMAL_TYPE_ICON[animalType];
      iconHtml += `<img src="${icon.iconUrl}" width=${icon.width * sizeFactor} height=${icon.height * sizeFactor} style="display: inline-block;">`;
    }

    iconHtml += `</div>`;
    return divIcon({
      html: iconHtml,
      iconSize: [0, 0],
      iconAnchor: [15, 15],
      className: '',
    }); // use getAllChildMarkers() to get type
  }
}
