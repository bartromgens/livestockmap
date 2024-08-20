import proj4 from 'proj4';
import { CoordinateResource } from './building';

export class BBox {
  constructor(
    public lonMin: number,
    public latMin: number,
    public lonMax: number,
    public latMax: number,
  ) {}

  toString(): string {
    return `${this.lonMin},${this.latMin},${this.lonMax},${this.latMax}`;
  }
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

  get lat(): number {
    return this._lat;
  }

  set lon(lon: number) {
    this._lon = lon;
    this._x = null;
    this._y = null;
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
    return proj4(this.TMERC, [lon, lat]);
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
