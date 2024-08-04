export interface CoordinateResource {
  lat: number;
  lon: number;
}

export interface AddressResource {
  node_id: number;
  street: string;
  housenumber: string;
  postcode: string;
  city: string;
  lat: number;
  lon: number;
}

export interface BuildingResource {
  way_id: number;
  area: number;
  length: number;
  width: number;
  tags: Record<string, string>;
  geometry: CoordinateResource[];
  addresses_nearby: AddressResource[];
  lon_min: number;
  lon_max: number;
  lat_min: number;
  lat_max: number;
}

export class Coordinate {
  constructor(
    public lat: number,
    public lon: number,
  ) {}

  static fromResource(resource: CoordinateResource): Coordinate {
    return new Coordinate(resource.lat, resource.lon);
  }

  static fromResources(resources: CoordinateResource[]): Coordinate[] {
    return resources.map((resource) => Coordinate.fromResource(resource));
  }

  static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  distanceTo(coordinate: Coordinate): number {
    return Coordinate.distance(this, coordinate);
  }

  /**
   * The haversine distance between two coordinates
   */
  static distance(coord1: Coordinate, coord2: Coordinate): number {
    const R = 6371 * 1000; // Radius of the Earth in meters

    const dLat = this.toRadians(coord2.lat - coord1.lat);
    const dLon = this.toRadians(coord2.lon - coord1.lon);
    const rLat1 = this.toRadians(coord1.lat);
    const rLat2 = this.toRadians(coord2.lat);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) *
        Math.sin(dLon / 2) *
        Math.cos(rLat1) *
        Math.cos(rLat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
}

export class Address {
  constructor(
    public node_id: number,
    public street: string,
    public housenumber: string,
    public postcode: string,
    public city: string,
    public lat: number,
    public lon: number,
  ) {}

  static fromResource(resource: AddressResource): Address {
    return new Address(
      Number(resource.node_id),
      resource.street,
      resource.housenumber,
      resource.postcode,
      resource.city,
      Number(resource.lat),
      Number(resource.lon),
    );
  }

  static fromResources(resources: AddressResource[]): Address[] {
    return resources.map((resource) => Address.fromResource(resource));
  }

  toString(): string {
    return `${this.street} ${this.housenumber} ${this.city}`;
  }

  get coordinate(): Coordinate {
    return new Coordinate(this.lat, this.lon);
  }
}

export class Building {
  constructor(
    public way_id: number,
    public area: number,
    public length: number,
    public width: number,
    public tags: Record<string, string>,
    public geometry: Coordinate[],
    public addresses_nearby: Address[],
    public center: Coordinate,
  ) {
    this.addresses_nearby.sort(
      (a: Address, b: Address) =>
        a.coordinate.distanceTo(this.center) -
        b.coordinate.distanceTo(this.center),
    );
  }

  static fromResource(resource: BuildingResource): Building {
    const coordinates: Coordinate[] = Coordinate.fromResources(
      resource.geometry,
    );
    const addresses_nearby: Address[] = Address.fromResources(
      resource.addresses_nearby,
    );
    const lat =
      Math.abs(resource.lat_max - resource.lat_min) / 2 + resource.lat_min;
    const lon =
      Math.abs(resource.lon_max - resource.lon_min) / 2 + resource.lon_min;
    return new Building(
      resource.way_id,
      resource.area,
      resource.length,
      resource.width,
      resource.tags,
      coordinates,
      addresses_nearby,
      new Coordinate(lat, lon),
    );
  }

  static fromResources(resources: BuildingResource[]): Building[] {
    return resources.map((resource) => Building.fromResource(resource));
  }

  get osmUrl(): string {
    return `https://www.openstreetmap.org/way/${this.way_id}`;
  }
}
