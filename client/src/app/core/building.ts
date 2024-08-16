import { PolygonUtils } from '../utils';
import { Polygon, polygon } from 'leaflet';
import { Coordinate } from './geo';

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
  private animals: Coordinate[] | null = null;

  constructor(
    public way_id: number,
    public area: number,
    public length: number,
    public width: number,
    public tags: Record<string, string>,
    public geometry: Coordinate[],
    public addresses_nearby: Address[],
    public center: Coordinate,
    public latMin: number,
    public latMax: number,
    public lonMin: number,
    public lonMax: number,
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
      resource.lat_min,
      resource.lat_max,
      resource.lon_min,
      resource.lon_max,
    );
  }

  static fromResources(resources: BuildingResource[]): Building[] {
    return resources.map((resource) => Building.fromResource(resource));
  }

  get osmUrl(): string {
    return `https://www.openstreetmap.org/way/${this.way_id}`;
  }

  get polygon(): Polygon {
    // TODO BR: use member variable as cache for performance?
    const coordinates: [number, number][] = [];
    for (const coordinate of this.geometry) {
      coordinates.push([coordinate.lat, coordinate.lon]);
    }
    return polygon(coordinates);
  }

  get animalCoordinates(): Coordinate[] {
    if (this.animals) {
      return this.animals;
    }

    const points: Coordinate[] = [];
    const maxPoints = this.area * 0.8;
    const maxTries = maxPoints * 10;
    let nTries = 0;
    const polygonBuilding = this.polygon;
    while (points.length < maxPoints && nTries < maxTries) {
      const lat = Math.random() * (this.latMax - this.latMin) + this.latMin;
      const lon = Math.random() * (this.lonMax - this.lonMin) + this.lonMin;
      if (PolygonUtils.isMarkerInsidePolygon(lat, lon, polygonBuilding)) {
        points.push(new Coordinate(lat, lon));
      }
      nTries++;
    }
    console.log(`${points.length} points created in ${nTries} tries`);

    // TODO BR: improve performance by optimize finding nearest neighbours
    // Move points away from each other if too close
    const distanceToMove = Math.sqrt(this.area) / 10;
    for (const pointA of points) {
      for (const pointB of points) {
        if (pointA == pointB) {
          continue;
        }
        const pA: [number, number] = [pointA.x, pointA.y];
        const pB: [number, number] = [pointB.x, pointB.y];
        const distance: number = PolygonUtils.distanceBetweenPoints(pA, pB);
        if (distance > 1) {
          continue;
        }
        const dAB: [number, number] = PolygonUtils.vsub(pA, pB);
        const newdAB = PolygonUtils.vscale(
          dAB,
          (distanceToMove - distance) / PolygonUtils.vlen(dAB),
        );
        const pANew = PolygonUtils.vadd(pA, newdAB);
        const newCoordsWGS84 = Coordinate.toWGS84(pANew[0], pANew[1]);
        if (
          PolygonUtils.isMarkerInsidePolygon(
            newCoordsWGS84[0],
            newCoordsWGS84[1],
            polygonBuilding,
          )
        ) {
          pointA.lat = newCoordsWGS84[0];
          pointA.lon = newCoordsWGS84[1];
        }
      }
    }
    this.animals = points;
    return this.animals;
  }
}
