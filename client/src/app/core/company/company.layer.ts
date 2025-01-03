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
  MarkerClusterGroup,
  markerClusterGroup,
} from 'leaflet';
import { ANIMAL_TYPE_DISPLAY_NAME, ANIMAL_TYPE_ICON } from '../../map';
import { AnimalType } from '../animal';

export interface CompanyLayerOptions {
  clusterAtZoom?: number;
  maxClusterRadius?: number;
  visibleLayers?: AnimalType[];
}

export class CompanyLayer {
  selectedCompany: Company | undefined;
  private readonly optionsDefault: CompanyLayerOptions = {
    clusterAtZoom: 13,
    maxClusterRadius: 30,
    visibleLayers: [AnimalType.Pig, AnimalType.Cow_Beef, AnimalType.Chicken],
  };
  private readonly options: CompanyLayerOptions = this.optionsDefault;
  private layerGroup: LayerGroup | undefined;
  private readonly layers: Record<AnimalType, MarkerClusterGroup | null>;

  constructor(options: CompanyLayerOptions = this.optionsDefault) {
    this.options = { ...this.options, ...options };

    this.layers = Object.values(AnimalType).reduce(
      (map, key) => {
        map[key as AnimalType] = null;
        return map;
      },
      {} as Record<AnimalType, null>,
    );
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
      const animalLayer = this.createLayerForAnimalType(
        companiesGrouped,
        animalType,
        onClick,
        control,
      );
      this.layers[animalType] = animalLayer;
      animalLayers.push(animalLayer);
    }

    this.layerGroup = new LayerGroup(animalLayers);
    console.log('create markers done');
  }

  private createLayerForAnimalType(
    companiesGrouped: Record<AnimalType, Company[]>,
    animalType: AnimalType,
    onClick: (event: LeafletMouseEvent, layerClicked: Layer) => void,
    control: Control.Layers,
  ): MarkerClusterGroup {
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
    this.createControls(animalType, control, markers);
    return markers;
  }

  private createControls(
    animalType: AnimalType,
    control: Control.Layers,
    markers: MarkerClusterGroup,
  ) {
    const displayName = ANIMAL_TYPE_DISPLAY_NAME[animalType];
    const icon = ANIMAL_TYPE_ICON[animalType];
    const labelHtml = `<div class="control-name"><img src="${icon.iconUrl}" height="16"/></div>${displayName}`;
    control.addOverlay(markers, labelHtml);
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

    this.updateLayerVisibility(map);
  }

  select(company: Company): void {
    console.log('selected company', company);
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

  private updateLayerVisibility(map: Map): void {
    for (const animalType of Object.values(AnimalType)) {
      const animalLayer = this.layers[animalType];
      if (animalLayer && !this.options.visibleLayers?.includes(animalType)) {
        map.removeLayer(animalLayer);
      }
    }
  }

  private createMarkerGroupIcon(cluster: MarkerCluster): DivIcon {
    const companies: Company[] = [];
    for (const marker of cluster.getAllChildMarkers()) {
      const company: Company = (marker as any)['company'];
      companies.push(company);
    }

    if (companies.length == 0) {
      return divIcon({
        iconSize: [0, 0],
        iconAnchor: [0, 0],
        className: '',
      });
    }

    const icon = ANIMAL_TYPE_ICON[companies[0].animalTypeMain];
    const sizeFactor = Math.sqrt(companies.length / 100) + 1;
    const iconWidth = Math.min(icon.width, icon.widthDisplay * sizeFactor);
    const iconHeight = Math.min(icon.height, icon.heightDisplay * sizeFactor);

    let iconHtml = `<div style="width: ${iconWidth}px;">`;
    iconHtml += `<img src="${icon.iconUrl}" width=${iconWidth} height=${iconHeight} style="display: inline-block;">`;

    iconHtml += `</div>`;
    return divIcon({
      html: iconHtml,
      iconSize: [0, 0],
      iconAnchor: [15, 15],
      className: '',
    }); // use getAllChildMarkers() to get type
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
}
