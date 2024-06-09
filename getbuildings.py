"""
Overpass OpenStreetMap API to get all large buildings.
See https://wiki.openstreetmap.org/wiki/Overpass_API/Language_Guide for the overpass API guide.
See https://github.com/mvexel/overpass-api-python-wrapper for the Python wrapper.
"""

import json
import logging
import time
import warnings
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


# Ignore FutureWarning messages from the pandas package
warnings.filterwarnings(action="ignore", category=FutureWarning, module="shapely")


api = overpass.API(timeout=60)


# Create parent logger
logger = logging.getLogger(__name__)
handler = logging.StreamHandler()
handler.setFormatter(logging.Formatter("%(name)s - %(levelname)s - %(message)s"))
logger.setLevel(logging.INFO)
logger.addHandler(handler)


def main():
    logger.info("main")
    # test_bbox = (
    #     52.09261214198491,
    #     5.562860339734603,
    #     52.109061883798304,
    #     5.592364638898419,
    # )
    # test_box_large = (
    #     51.998199003792266,
    #     5.337630742650022,
    #     52.261223462827274,
    #     5.809699529271116,
    # )
    # buildings_raw = get_buildings_batches(test_bbox)
    # # print(json.dumps(buildings_raw, indent=2))
    #
    # buildings: List[Building] = []
    # for building_raw in buildings_raw:
    #     buildings.append(Building.create_from_osm_way(building_raw))
    #
    # test_building_id = 271591630  # area 2905, 100x29
    # test_building = list(filter(lambda build: build.id == test_building_id, buildings))[
    #     0
    # ]
    #
    # logger.info(f"area: {test_building.area_square_meters} m^2")
    # logger.info(f"length width: {test_building.length_width} m")
    #
    # logger.info(f"{len(buildings)} buildings created")
    #
    # min_area = 200
    # polygons = [
    #     building.polygon
    #     for building in buildings
    #     if building.area_square_meters > min_area
    # ]
    # geojson_feature_collection = shapely_collection_to_geojson(polygons)
    # logger.info(geojson.dumps(geojson_feature_collection, indent=2))
    #
    # with open("buildings.geojson", "w") as outfile:
    #     geojson.dump(geojson_feature_collection, outfile, indent=2)

    # for building in buildings:
    #     if building.area_square_meters > 1000:
    #         logger.info(
    #             f"id: {building.id} | area: {building.area_square_meters} m^2 | length width: {building.length_width} m "
    #         )


if __name__ == "__main__":
    main()
