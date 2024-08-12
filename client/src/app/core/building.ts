import { PolygonUtils } from '../utils';
import { Polygon, polygon } from 'leaflet';
import proj4 from 'proj4';

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

/**
 * Latitude and longitude in WGS84.
 * x and y in Transverse Mercator with natural origin at Utrecht, the Netherlands
 */
export class Coordinate {
  private static readonly COORDS_UTRECHT = [52.0907006, 5.1215634];
  private static readonly TMERC = `+proj=tmerc +lat_0=${this.COORDS_UTRECHT[0]} +lon_0=${this.COORDS_UTRECHT[1]}`;
  private _x: number | null = null;
  private _y: number | null = null;
  private _lat: number;
  private _lon: number;

  constructor(lat: number, lon: number) {
    this._lat = lat;
    this._lon = lon;
  }

  set lat(lat: number) {
    this._lat = lat;
    this._x = null;
    this._y = null;
  }

  set lon(lon: number) {
    this._lon = lon;
    this._x = null;
    this._y = null;
  }

  get lat(): number {
    return this._lat;
  }

  get lon(): number {
    return this._lon;
  }

  get x(): number {
    if (this._x !== null) {
      return this._x;
    }
    return this.setTransverseMercatorCoordinates()[0];
  }

  get y(): number {
    if (this._y !== null) {
      return this._y;
    }
    return this.setTransverseMercatorCoordinates()[1];
  }

  private setTransverseMercatorCoordinates(): [number, number] {
    const coords = Coordinate.toTransverseMercator(this.lat, this.lon);
    this._x = coords[0];
    this._y = coords[1];
    return [this._x, this._y];
  }

  static toTransverseMercator(lat: number, lon: number): [number, number] {
    // TODO BR: add test for coordinate transformations.
    // See https://proj.org/en/9.4/operations/projections/tmerc.html for projection arguments
    return proj4(this.TMERC, [lat, lon]);
  }

  static toWGS84(x: number, y: number): [number, number] {
    return proj4(this.TMERC, 'WGS84', [x, y]);
  }

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
