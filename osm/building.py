import logging
import time
import warnings
from dataclasses import dataclass
from functools import partial
from typing import Any
from typing import Dict
from typing import List

import pyproj
from shapely.geometry import Point
from shapely.geometry import Polygon
from shapely.ops import transform

from geo.utils import BBox
from osm.core import api
from osm.tile import generate_tiles

logger = logging.getLogger(__name__)

# Ignore FutureWarning messages from the pandas package
warnings.filterwarnings(action="ignore", category=FutureWarning, module="shapely")


@dataclass
class OSMBuilding:
    id: int
    tags: Dict[str, str]
    raw: Dict[Any, Any]
    polygon: Polygon
    coordinates: List[Dict[str, float]]

    WGS84 = pyproj.Proj(init="epsg:4326")
    EXCLUDE_TYPES_DEFAULT = (
        "apartments",
        "barracks",
        "castle",
        "commercial",
        "college",
        "church",
        "industrial",
        "garage",
        "garages",
        "government",
        "greenhouse",
        "hangar",
        "house",
        "hotel",
        "office",
        "parking",
        "public",
        "religious",
        "residental",
        "retail",
        "school",
        "sports_hall",
        "sports_centre",
        "stadium",
        "supermarket",
        "university",
        "train_station",
        "transportation",
        "warehouse",
    )

    @classmethod
    def create_from_osm_way(cls, osm_way_json) -> "OSMBuilding":
        points = [(point["lon"], point["lat"]) for point in osm_way_json["geometry"]]
        polygon = Polygon(points)
        return OSMBuilding(
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
        length = max(edge_length)
        width = min(edge_length)
        return length, width

    @classmethod
    def calculate_utm_zone(cls, lon) -> int:
        return int((lon + 180) / 6) + 1

    @property
    def _polygon_utm_projection(self) -> Polygon:
        utm_zone = self.calculate_utm_zone(self.coordinates[0]["lon"])
        utm = pyproj.Proj(proj="utm", zone=utm_zone, datum="WGS84")
        proj = partial(pyproj.transform, self.WGS84, utm)
        proj_transformed = transform(proj, self.polygon)
        return proj_transformed


def get_buildings(bbox, exclude_types):
    bbox = f"({bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]});"
    exclude_str = "|".join(exclude_types)
    query = f"""(
        way[building]["building"!~"^({exclude_str})$"]{bbox}
    )   
    """
    logger.info(f"get buildings for {bbox}")
    return api.get(
        query, responseformat="json", verbosity="geom"
    )  # use verbosity = geom to get way geometry in geojson


def get_buildings_batches(bbox: BBox, exclude_types=OSMBuilding.EXCLUDE_TYPES_DEFAULT):
    tiles = generate_tiles(
        min_lat=bbox.lat_min,
        min_lon=bbox.lon_min,
        max_lat=bbox.lat_max,
        max_lon=bbox.lon_max,
        delta_lat=0.07,
        delta_lon=0.07,
    )
    logger.info(f"{len(tiles)} tiles created")
    buildings = []
    for i, tile in enumerate(tiles):
        logger.info(f"getting tile: {i+1}/{len(tiles)}")
        buildings += get_buildings(tile, exclude_types=exclude_types)["elements"]
    return buildings


def get_address_nearby(lat: float, lon: float, distance: float):
    query = f"""(
        node["addr:housenumber"](around:{distance},{lat},{lon});
    );
    """
    logger.info(
        f"get nearby addresses for {lat}, {lon} within a distance of {distance} m"
    )
    return api.get(query, responseformat="json")["elements"]
