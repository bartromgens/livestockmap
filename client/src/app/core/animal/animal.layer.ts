import {
  circleMarker,
  CircleMarker,
  latLng,
  LayerGroup,
  Map,
  layerGroup,
} from 'leaflet';
import { Building } from '../building';

export class AnimalLayer {
  private layerGroup: LayerGroup | null = null;

  create(buildings: Building[], zoom: number): void {
    const markers = this.createAnimalMarkers(buildings, zoom);
    this.layerGroup = layerGroup(markers);
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

  private createAnimalMarkers(
    buildings: Building[],
    zoom: number,
  ): CircleMarker[] {
    const circleMarkers = [];
    const circleOptions = this.animalCircleOptions(zoom);
    for (const building of buildings) {
      for (const point of building.animalCoordinates) {
        circleMarkers.push(
          circleMarker(latLng(point.lat, point.lon), circleOptions),
        );
      }
    }
    return circleMarkers;
  }

  private animalCircleOptions(zoom: number): any {
    const radius = zoom >= 20 ? 2 : 1;
    return {
      radius: radius,
      stroke: false,
      fillOpacity: 1,
      fillColor: 'blue',
    };
  }
}
