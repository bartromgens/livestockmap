import {
  Layer,
  LayerGroup,
  LeafletMouseEvent,
  Polygon,
  Map,
  LatLng,
} from 'leaflet';
import { Building } from './building';
import { AnimalType } from '../animal';

export class BuildingLayer {
  private layerGroup: LayerGroup | undefined;
  private selectedLayer: Polygon | undefined;
  private layers: Record<AnimalType, LayerGroup | null>;
  selectedBuilding: Building | undefined;

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

  constructor() {
    this.layers = this.createLayersMap();
  }

  private createLayersMap(): Record<AnimalType, LayerGroup | null> {
    return Object.values(AnimalType).reduce(
      (map, key) => {
        map[key as AnimalType] = null;
        return map;
      },
      {} as Record<AnimalType, null>,
    );
  }

  select(layer: Polygon): void {
    this.selectedLayer?.setStyle(this.defaultStyle);
    layer.setStyle(this.highlightBuildingStyle);
    const building: Building = (layer as any)['building'];
    this.selectedLayer = layer;
    this.selectedBuilding = building;
    layer.setStyle(this.highlightBuildingStyle);
  }

  create(
    buildings: Building[],
    visibleAnimalTypes: AnimalType[],
    onClick: (event: LeafletMouseEvent, layerClicked: Layer) => void,
  ): void {
    console.log('BuildingLayer:create', visibleAnimalTypes);
    const layers: any[] = [];
    for (const animalType of Object.values(AnimalType)) {
      if (!visibleAnimalTypes.includes(animalType)) {
        continue;
      }
      const buildingsType = buildings.filter(
        (building) => building.company.animalTypeMain === animalType,
      );
      for (const building of buildingsType) {
        const layer: any = building.polygon;
        layer.on('click', (event: LeafletMouseEvent) => onClick(event, layer));
        layer.buildingId = building.way_id;
        layer.building = building;
        layers.push(layer);
      }
      this.layers[animalType] = new LayerGroup(layers);
    }
    this.layerGroup = new LayerGroup(
      Object.values(this.layers).filter((value) => value !== null),
    );
  }

  remove(map: Map): void {
    console.log('BuildingLayer:remove');
    this.layers = this.createLayersMap();
    if (this.layerGroup && map.hasLayer(this.layerGroup)) {
      map.removeLayer(this.layerGroup);
    }
  }

  add(map: Map): void {
    if (this.layerGroup) {
      map.addLayer(this.layerGroup);
    }
  }

  getBuildingsInView(map: Map): Building[] {
    const buildings: Building[] = [];
    map.eachLayer((layer: Layer) => {
      if (layer instanceof Polygon) {
        const points = layer.getLatLngs()[0] as LatLng[];
        for (const point of points) {
          if (map.getBounds().contains(point)) {
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
