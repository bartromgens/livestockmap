import { Coordinate } from './geo';

export interface TileResource {
  level: number;
  id: number;
  lon_min: number;
  lon_max: number;
  lat_min: number;
  lat_max: number;
  complete: boolean;
  failed: boolean;
}

export class Tile {
  constructor(
    public id: number,
    public level: number,
    public lon_min: number,
    public lon_max: number,
    public lat_min: number,
    public lat_max: number,
    public complete: boolean,
    public failed: boolean,
  ) {}

  get coordinates(): [number, number][] {
    return [
      [this.lat_min, this.lon_min],
      [this.lat_min, this.lon_max],
      [this.lat_max, this.lon_max],
      [this.lat_max, this.lon_min],
    ];
  }

  get center(): Coordinate {
    const lat = (this.lat_max - this.lat_min) / 2 + this.lat_min;
    const lon = (this.lon_max - this.lon_min) / 2 + this.lon_min;
    return new Coordinate(lat, lon);
  }

  static fromResource(resource: TileResource): Tile {
    return new Tile(
      resource.id,
      resource.level,
      resource.lon_min,
      resource.lon_max,
      resource.lat_min,
      resource.lat_max,
      resource.complete,
      resource.failed,
    );
  }

  static fromResources(resources: TileResource[]): Tile[] {
    return resources.map((resource) => Tile.fromResource(resource));
  }
}
