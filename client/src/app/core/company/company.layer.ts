import { Company } from './company';
import {
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
import { chickenIcon, cowIcon, pigIcon } from '../../map';

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
    onClick: (event: LeafletMouseEvent, layerClicked: Layer) => void,
  ): void {
    console.log('create markers');
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
        layer.on('click', (event: LeafletMouseEvent) => onClick(event, layer));
        layer.company = company;
      }
      layers.push(...layersCompany);
    }
    const markers = markerClusterGroup({
      disableClusteringAtZoom: this.options.clusterAtZoom,
      iconCreateFunction: this.createMarkerGroupIcon,
      showCoverageOnHover: false,
      maxClusterRadius: this.options.maxClusterRadius,
    });
    markers.addLayers(layers);
    this.layerGroup = markers;
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
    const companies: Company[] = [];
    map.eachLayer((layer: Layer) => {
      if (layer instanceof MarkerCluster) {
        if (map.getBounds().contains(layer.getLatLng())) {
          companies.push(
            ...layer
              .getAllChildMarkers()
              .map((child) => (child as any)['company']),
          );
        }
      } else if (layer instanceof Marker) {
        if (map.getBounds().contains(layer.getLatLng())) {
          const company = (layer as any)['company'];
          companies.push(company);
        }
      }
    });
    return companies;
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
}
