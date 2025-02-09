import { Company } from './company';
import {
  Control,
  divIcon,
  DivIcon,
  latLng,
  Layer,
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
  private readonly layers: Record<AnimalType, MarkerClusterGroup | null>;

  constructor(options: CompanyLayerOptions = this.optionsDefault) {
    this.options = { ...this.options, ...options };
    this.layers = this.createLayersMap();
  }

  private createLayersMap(): Record<AnimalType, MarkerClusterGroup | null> {
    return Object.values(AnimalType).reduce(
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

    for (const animalType of Object.values(AnimalType)) {
      this.layers[animalType] = this.createLayerForAnimalType(
        companiesGrouped,
        animalType,
        onClick,
        control,
      );
    }

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

  add(
    map: Map,
    onVisibleLayersChange: (visibleLayers: AnimalType[]) => void,
  ): void {
    map.on('overlayadd', (event) => {
      onVisibleLayersChange(this.getLayersVisible(map));
    });

    map.on('overlayremove', (event) => {
      onVisibleLayersChange(this.getLayersVisible(map));
    });

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

  hideAllLayers(map: Map): void {
    this.options.visibleLayers = [];
    this.updateLayerVisibility(map);
  }

  setLayerVisibility(map: Map, animalType: AnimalType, visible: boolean): void {
    if (this.options.visibleLayers?.includes(animalType) && !visible) {
      this.options.visibleLayers?.filter((item) => item !== animalType);
    }
    if (!this.options.visibleLayers?.includes(animalType) && visible) {
      this.options.visibleLayers?.push(animalType);
    }
    this.updateLayerVisibility(map);
  }

  private updateLayerVisibility(map: Map): void {
    for (const animalType of Object.values(AnimalType)) {
      const animalLayer = this.layers[animalType];
      if (animalLayer && !this.options.visibleLayers?.includes(animalType)) {
        map.removeLayer(animalLayer);
      }
      if (animalLayer && this.options.visibleLayers?.includes(animalType)) {
        map.addLayer(animalLayer);
      }
    }
  }

  private getLayersVisible(map: Map): AnimalType[] {
    const values: AnimalType[] = [];
    for (const [animalType, layer] of Object.entries(this.layers)) {
      if (layer && map.hasLayer(layer)) {
        values.push(animalType as AnimalType);
      }
    }
    return values;
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
