import { Layer, LayerGroup, LeafletMouseEvent, Polygon, Map } from 'leaflet';
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

  createLayer(
    buildings: Building[],
    onClick: (event: LeafletMouseEvent, layerClicked: Layer) => void,
  ): void {
    const layers: any[] = [];
    for (const building of buildings) {
      const layer: any = building.polygon;
      layer.on('click', (event: LeafletMouseEvent) => onClick(event, layer));
      layer.buildingId = building.way_id;
      layer.building = building;
      layers.push(layer);
    }
    this.layerGroup = new LayerGroup(layers);
  }

  removeLayer(map: Map): void {
    if (this.layerGroup && map.hasLayer(this.layerGroup)) {
      map.removeLayer(this.layerGroup);
    }
  }

  addLayer(map: Map): void {
    if (this.layerGroup) {
      map.addLayer(this.layerGroup);
    }
  }
}
