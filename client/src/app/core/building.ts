export interface CoordinateResource {
  lat: number;
  lon: number;
}

export interface AddressResource {
  "node_id": number;
  "street": string;
  "housenumber": string;
  "postcode": string;
  "city": string;
  "lat": number;
  "lon": number;
}

export interface BuildingResource {
  way_id: number;
  area: number;
  length: number;
  width: number;
  tags: {[key: string]: string};
  geometry: CoordinateResource[];
  addresses_nearby: AddressResource[];
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

export class Address {
  constructor(
    public node_id: number,
    public street: string,
    public housenumber: string,
    public postcode: string,
    public city: string,
    public lat: number,
    public lon: number,
  ) {
  }

  static fromResource(resource: AddressResource): Address {
    return new Address(
      Number(resource.node_id),
      resource.street,
      resource.housenumber,
      resource.postcode,
      resource.city,
      Number(resource.lat),
      Number(resource.lon)
    )
  }

  static fromResources(resources: AddressResource[]): Address[] {
    return resources.map(resource => Address.fromResource(resource));
  }

  toString(): string {
    return `${this.street} ${this.housenumber} ${this.city}`
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
    public addresses_nearby: Address[]
  ) {
  }

  static fromResource(resource: BuildingResource): Building {
    const coordinates: Coordinate[] = Coordinate.fromResources(resource.geometry);
    const addresses_nearby: Address[] = Address.fromResources(resource.addresses_nearby);
    return new Building(
      resource.way_id,
      resource.area,
      resource.length,
      resource.width,
      resource.tags,
      coordinates,
      addresses_nearby
    );
  }

  static fromResources(resources: BuildingResource[]): Building[] {
    return resources.map(resource => Building.fromResource(resource))
  }

  get osmUrl(): string {
    return `https://www.openstreetmap.org/way/${this.way_id}`
  }
}
