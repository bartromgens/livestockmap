import { LayerGroup, Polygon } from 'leaflet';
import { Building } from './building';

export class BuildingLayer {
  layerGroup: LayerGroup | null = null;
  selectedLayer: Polygon | null = null;
  selectedBuilding: Building | null = null;

  private readonly defaultStyle = {
    color: '#3388FF',
    weight: 3,
    opacity: 1,
  };

  private readonly highlightBuildingStyle = {
    color: '#FF3388',
    weight: 2,
    opacity: 1,
  };

  selectBuilding(layer: Polygon): void {
    this.selectedLayer?.setStyle(this.defaultStyle);
    layer.setStyle(this.highlightBuildingStyle);
    const building: Building = (layer as any)['building'];
    this.selectedLayer = layer;
    this.selectedBuilding = building;
    layer.setStyle(this.highlightBuildingStyle);
  }
}
