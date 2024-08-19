import logging
import math
from typing import List

from django.core.management.base import BaseCommand

from building.models import Tile
from geo.utils import BBox

logger = logging.getLogger(__name__)

BBOX_NL = BBox(
    lat_min=50.7,
    lat_max=53.6,
    lon_min=3.33,
    lon_max=7.24,
)


class Command(BaseCommand):
    help = "Create tiles"

    def handle(self, *args, **options):
        tile_count = 900
        logger.info(f"Creating {tile_count} tiles")
        tile_count_dim = int(math.sqrt(tile_count))
        logger.info(f"tile_count_dim {tile_count_dim} tiles")
        lon_delta = (BBOX_NL.lon_max - BBOX_NL.lon_min) / tile_count_dim
        lat_delta = (BBOX_NL.lat_max - BBOX_NL.lat_min) / tile_count_dim

        tiles: List[BBox] = []
        lon = BBOX_NL.lon_min
        epilon = 1.0000001
        while lon <= (BBOX_NL.lon_max - lon_delta) * epilon:
            lat = BBOX_NL.lat_min
            while lat <= (BBOX_NL.lat_max - lat_delta) * epilon:
                tiles.append(
                    BBox(
                        lon_min=lon,
                        lon_max=lon + lon_delta,
                        lat_min=lat,
                        lat_max=lat + lat_delta,
                    )
                )
                logger.info(tiles[-1])
                lat += lat_delta
            lon += lon_delta
        logger.info(f"{len(tiles)} tiles generated")

        for tile in tiles:
            Tile.from_bbox(tile)
        logger.info(f"{len(tiles)} database tiles created")
