"""
Overpass OpenStreetMap API to get all large buildings.
See https://wiki.openstreetmap.org/wiki/Overpass_API/Language_Guide for the overpass API guide.
See https://github.com/mvexel/overpass-api-python-wrapper for the Python wrapper.
"""

import json
from dataclasses import dataclass
from functools import partial
from typing import Any
from typing import Dict
from typing import List

import pyproj
import requests
import overpass
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
    response = get_buildings_test_area()
    print(json.dumps(response, indent=2))

    buildings_raw = response["elements"]
    buildings: List[Building] = []
    for building_raw in buildings_raw:
        buildings.append(Building.create_from_osm_way(building_raw))

    test_building_id = 271591630  # area 2905, 100x29
    test_building = list(filter(lambda build: build.id == test_building_id, buildings))[
        0
    ]

    print(f"area: {test_building.area_square_meters} m^2")
    print(f"length width: {test_building.length_width} m")

    # for building in buildings:
    #     if building.area_square_meters > 1000:
    #         print(
    #             f"id: {building.id} | area: {building.area_square_meters} m^2 | length width: {building.length_width} m "
    #         )


def get_buildings_test_area(responseformat="json"):
    query = """(
        way[building](52.09261214198491,5.562860339734603,52.109061883798304,5.592364638898419);
    )   
    """
    return api.get(
        query, responseformat=responseformat, verbosity="geom"
    )  # use verbosity = geom to get way geometry in geojson


def get_country_area_id():
    query = """
        (area["ISO3166-1"="NL"];)
    """
    return api.get(query, responseformat="json")


def get_api_status():
    return requests.get("https://overpass-api.de/api/status")


def kill_my_queries():
    return requests.get("https://overpass-api.de/api/kill_my_queries")


if __name__ == "__main__":
    main()
