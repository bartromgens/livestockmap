import { LatLng, Point, Polygon } from 'leaflet';

export namespace PolygonUtils {
  /**
   * Source: https://stackoverflow.com/a/31813714/607041
   */
  export function isMarkerInsidePolygon(
    lat: number,
    lon: number,
    poly: Polygon,
  ): boolean {
    const polyPointsAll: LatLng[][] = poly.getLatLngs() as LatLng[][];
    if (polyPointsAll.length > 1) {
      console.warn(
        'polygon has more than one array of points, this is not supported',
      );
    }
    const polyPoints: LatLng[] = polyPointsAll[0];
    const x = lat;
    const y = lon;

    let inside = false;
    for (let i = 0, j = polyPoints.length - 1; i < polyPoints.length; j = i++) {
      const xi = polyPoints[i].lat;
      const yi = polyPoints[i].lng;
      const xj = polyPoints[j].lat;
      const yj = polyPoints[j].lng;

      const intersect =
        yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) {
        inside = !inside;
      }
    }

    return inside;
  }
}
