export interface CoordinateResource {
  lat: number;
  lon: number;
}

export interface BuildingResource {
  way_id: number;
  area: number;
  length: number;
  width: number;
  tags: {[key: string]: string};
  geometry: CoordinateResource[];
}

export class Coordinate {
  constructor(
    public lat: number,
    public lon: number
  ) {
  }

  static fromResource(resource: CoordinateResource): Coordinate {
    return new Coordinate(resource.lat, resource.lon);
  }

  static fromResources(resources: CoordinateResource[]): Coordinate[] {
    return resources.map(resource => Coordinate.fromResource(resource));
  }
}

export class Building {
  constructor(
    public way_id: number,
    public area: number,
    public length: number,
    public width: number,
    public tags: {[key: string]: string},
    public geometry: Coordinate[],
  ) {
  }

  static fromResource(resource: BuildingResource): Building {
    const coordinates = Coordinate.fromResources(resource.geometry);
    return new Building(resource.way_id, resource.area, resource.length, resource.width, resource.tags, coordinates);
  }

  static fromResources(resources: BuildingResource[]): Building[] {
    return resources.map(resource => Building.fromResource(resource))
  }

  get osmUrl(): string {
    return `https://www.openstreetmap.org/way/${this.way_id}`
  }
}
