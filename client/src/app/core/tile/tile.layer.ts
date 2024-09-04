import { layerGroup, LayerGroup, polygon, PolylineOptions, Map } from 'leaflet';
import { Tile } from './tile';

export class TileLayer {
  layerGroup: LayerGroup | null = null;

  update(tiles: Tile[], map: Map): void {
    this.remove(map);
    this.create(tiles);
    this.add(map);
  }

  create(tiles: Tile[]): void {
    const layers: any[] = [];
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
    }
    this.layerGroup = layerGroup(layers);
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
}
