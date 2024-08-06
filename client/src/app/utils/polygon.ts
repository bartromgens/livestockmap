import { LatLng, Polygon } from 'leaflet';

// eslint-disable-next-line @typescript-eslint/no-namespace
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

  export function distanceBetweenPoints(
    pointA: [number, number],
    pointB: [number, number],
  ): number {
    const dx = pointA[0] - pointB[0];
    const dy = pointA[1] - pointA[1];
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Source: https://gis.stackexchange.com/a/170225
   */
  export function closestPointOnPolygon(
    point: [number, number],
    poly: [number, number][],
  ): [[number, number], number] {
    let shortestDist = Number.MAX_VALUE;
    let closestPointOnPoly = poly[0];

    let i = 0;
    for (const p1 of poly) {
      const prev = (i === 0 ? poly.length : i) - 1,
        p2 = poly[prev],
        line = vsub(p2, p1);

      // if (vlen(line) === 0) {
      //   return vlen(vsub(point, p1));
      // }

      const norm = vnorm(line),
        x1 = point[0],
        x2 = norm[0],
        x3 = p1[0],
        x4 = line[0],
        y1 = point[1],
        y2 = norm[1],
        y3 = p1[1],
        y4 = line[1],
        j = (x3 - x1 - (x2 * y3) / y2 + (x2 * y1) / y2) / ((x2 * y4) / y2 - x4);

      let currentDistanceToPoly;
      let currentPointToPoly: [number, number];
      if (j < 0 || j > 1) {
        const a = vsub(point, p1);
        const aLen = vlen(a);
        const b = vsub(point, p2);
        const bLen = vlen(b);
        if (a < b) {
          currentPointToPoly = vnegate(a);
          currentDistanceToPoly = aLen;
        } else {
          currentPointToPoly = vnegate(b);
          currentDistanceToPoly = bLen;
        }
      } else {
        const i = (y3 + j * y4 - y1) / y2;

        currentPointToPoly = vscale(norm, i);
        currentDistanceToPoly = vlen(currentPointToPoly);
      }

      if (currentDistanceToPoly < shortestDist) {
        closestPointOnPoly = vadd(point, currentPointToPoly);
        shortestDist = currentDistanceToPoly;
      }
      i++;
    }

    return [closestPointOnPoly, shortestDist];
  }

  function vlen(vector: [number, number]): number {
    return Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1]);
  }

  function vnegate(v: [number, number]): [number, number] {
    return [-v[0], -v[1]];
  }

  export function vadd(
    v1: [number, number],
    v2: [number, number],
  ): [number, number] {
    return [v1[0] + v2[0], v1[1] + v2[1]];
  }

  export function vsub(
    v1: [number, number],
    v2: [number, number],
  ): [number, number] {
    return [v1[0] - v2[0], v1[1] - v2[1]];
  }

  export function vscale(
    vector: [number, number],
    factor: number,
  ): [number, number] {
    return [vector[0] * factor, vector[1] * factor];
  }

  function vnorm(v: [number, number]): [number, number] {
    return [-v[1], v[0]];
  }
}
