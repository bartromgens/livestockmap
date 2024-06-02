"""
Overpass OpenStreetMap API to get all large buildings.
See https://wiki.openstreetmap.org/wiki/Overpass_API/Language_Guide for the overpass API guide.
See https://github.com/mvexel/overpass-api-python-wrapper for the Python wrapper.
"""

import json
import time
from dataclasses import dataclass
from functools import partial
from typing import Any
from typing import Dict
from typing import List

import geojson
import pyproj
import requests
import overpass
import shapely.geometry
from shapely.geometry import Point
from shapely.geometry import Polygon
from shapely.ops import transform


api = overpass.API(timeout=60)


@dataclass
class Building:
    id: int
    tags: Dict[str, str]
    raw: Dict[Any, Any]
    polygon: Polygon
    coordinates: List[Dict[str, float]]

    WGS84 = pyproj.Proj(init="epsg:4326")

    @classmethod
    def create_from_osm_way(cls, osm_way_json):
        points = [(point["lon"], point["lat"]) for point in osm_way_json["geometry"]]
        polygon = Polygon(points)
        return Building(
            raw=osm_way_json,
            id=osm_way_json["id"],
            tags=osm_way_json["tags"],
            polygon=polygon,
            coordinates=osm_way_json["geometry"],
        )

    @property
    def area_square_meters(self) -> float:
        return self._polygon_utm_projection.area

    @property
    def length_width(self):
        box = self._polygon_utm_projection.minimum_rotated_rectangle
        # get coordinates of polygon vertices
        x, y = box.exterior.coords.xy
        # get length of bounding box edges
        edge_length = (
            Point(x[0], y[0]).distance(Point(x[1], y[1])),
            Point(x[1], y[1]).distance(Point(x[2], y[2])),
        )
        # get length of polygon as the longest edge of the bounding box
        length = max(edge_length)
        # get width of polygon as the shortest edge of the bounding box
        width = min(edge_length)
        return length, width

    @classmethod
    def calculate_utm_zone(cls, lon):
        return int((lon + 180) / 6) + 1

    @property
    def _polygon_utm_projection(self) -> Polygon:
        utm_zone = self.calculate_utm_zone(self.coordinates[0]["lon"])
        utm = pyproj.Proj(proj="utm", zone=utm_zone, datum="WGS84")
        proj = partial(pyproj.transform, self.WGS84, utm)
        return transform(proj, self.polygon)


def main():
    test_bbox = (
        52.09261214198491,
        5.562860339734603,
        52.109061883798304,
        5.592364638898419,
    )
    test_box_large = (
        51.998199003792266,
        5.337630742650022,
        52.261223462827274,
        5.809699529271116,
    )
    buildings_raw = get_buildings_batches(test_box_large)
    # print(json.dumps(buildings_raw, indent=2))

    buildings: List[Building] = []
    for building_raw in buildings_raw:
        buildings.append(Building.create_from_osm_way(building_raw))

    test_building_id = 271591630  # area 2905, 100x29
    test_building = list(filter(lambda build: build.id == test_building_id, buildings))[
        0
    ]

    print(f"area: {test_building.area_square_meters} m^2")
    print(f"length width: {test_building.length_width} m")

    min_area = 200
    polygons = [
        building.polygon
        for building in buildings
        if building.area_square_meters > min_area
    ]
    geojson_feature_collection = shapely_collection_to_geojson(polygons)
    print(geojson.dumps(geojson_feature_collection, indent=2))

    with open("buildings.geojson", "w") as outfile:
        geojson.dump(geojson_feature_collection, outfile, indent=2)

    # for building in buildings:
    #     if building.area_square_meters > 1000:
    #         print(
    #             f"id: {building.id} | area: {building.area_square_meters} m^2 | length width: {building.length_width} m "
    #         )


def get_buildings(bbox, exclude_types):
    bbox = f"({bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]});"
    exclude_str = "|".join(exclude_types)
    query = f"""(
        way[building]["building"!~"^({exclude_str})$"]{bbox}
    )   
    """
    print(f"get buildings for {bbox}")
    return api.get(
        query, responseformat="json", verbosity="geom"
    )  # use verbosity = geom to get way geometry in geojson


def get_buildings_batches(bbox, exclude_types=("house", "apartments", "retail")):
    tiles = generate_tiles(
        bbox[0], bbox[1], bbox[2], bbox[3], delta_lat=0.07, delta_lon=0.07
    )
    print(f"{len(tiles)} tiles create")
    buildings = []
    for i, tile in enumerate(tiles):
        print(f"getting tile: {i+1}/{len(tiles)}")
        buildings += get_buildings(tile, exclude_types=exclude_types)["elements"]
    return buildings


def get_country_area_id():
    query = """
        (area["ISO3166-1"="NL"];)
    """
    return api.get(query, responseformat="json")


def get_api_status():
    return requests.get("https://overpass-api.de/api/status")


def kill_my_queries():
    return requests.get("https://overpass-api.de/api/kill_my_queries")


def generate_tiles(min_lat, min_lon, max_lat, max_lon, delta_lat, delta_lon):
    lat_lon_tiles = []
    lat = min_lat
    while lat < max_lat:
        lon = min_lon
        while lon < max_lon:
            lat_lon_tiles.append((lat, lon, lat + delta_lat, lon + delta_lon))
            lon += delta_lon
        lat += delta_lat
    return lat_lon_tiles


def shapely_to_geojson(shapely_polygon: Polygon) -> geojson.Feature:
    geojson_polygon = shapely.geometry.mapping(shapely_polygon)
    return geojson.Feature(geometry=geojson_polygon)


def shapely_collection_to_geojson(
    shapely_polygons: List[Polygon],
) -> geojson.FeatureCollection:
    features = [shapely_to_geojson(polygon) for polygon in shapely_polygons]
    return geojson.FeatureCollection(features)


if __name__ == "__main__":
    main()
