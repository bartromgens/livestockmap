import logging
import time
from typing import List
from typing import Optional
from typing import Tuple

from django.core.management.base import BaseCommand

from building.cities import CITIES_LARGE_NL
from building.models import Address
from building.models import Tile
from company.kvk import ScraperMalfunction
from geo.utils import BBox
from building.models import Building
from building.models import Company
from osm.building import get_buildings_batches
from osm.building import OSMBuilding

logger = logging.getLogger(__name__)

REGIONS = {
    "flevoland": (52.4443529, 5.5478277, 52.5737960, 5.8413397),
    "lunteren": (52.092612, 5.5628603, 52.109061, 5.5923646),
    "montfoort": (52.0231300, 4.9633142, 52.0574780, 5.0250918),
    "twente": (52.2856251, 6.5833896, 52.4216656, 7.0134352),
    "achterhoek": (52.0039710, 6.3718900, 52.0631596, 6.5639037),
    "uden": (51.612175, 5.6340277, 51.6421757, 5.6640277),
    "utrecht": (52.1081869, 5.0961645, 52.1228383, 5.1226157),
}


class Command(BaseCommand):
    help = "Create livestock buildings from OSM"

    def add_arguments(self, parser):
        parser.add_argument(
            "--region",
            type=str,
            # default="lunteren",
            help="The region to create buildings for",
        )

    def handle(self, *args, **options):
        try:
            region_bbox = self.get_region_bbox(options)
            if region_bbox is not None:
                self.create_for_bbox(region_bbox)
            else:
                self.create_tiles()
        except Exception as e:
            logger.exception(e)

    def create_tiles(self):
        tiles = Tile.objects.filter(complete=False, failed=False).all()
        for tile in tiles:
            logger.info(f"Creating tile {tile.id}")
            try:
                self.create_tile(tile)
            except ScraperMalfunction as e:
                logger.exception(e)
                tile.failed = True
                tile.error = str(e)[:9500]
                tile.save()
                logger.info("sleeping for 5 minutes...")
                time.sleep(300)
            logger.info(f"Finished tile {tile.id}.")

    def create_tile(self, tile: Tile):
        start = time.time()
        buildings, companies = self.create_for_bbox(tile.to_bbox())
        tile.duration = time.time() - start
        tile.building_count = len(buildings)
        tile.company_count = len(companies)
        tile.complete = True
        tile.save()

    def create_for_bbox(self, bbox: BBox) -> Tuple[List[Building], List[Company]]:
        buildings_raw = get_buildings_batches(bbox)

        buildings_osm: List[OSMBuilding] = []
        for building_raw in buildings_raw:
            buildings_osm.append(OSMBuilding.create_from_osm_way(building_raw))

        logger.info(f"{len(buildings_osm)} buildings found")
        buildings_osm_large = OSMBuilding.filter_by_area(buildings_osm)
        logger.info(f"{len(buildings_osm_large)} buildings selected as large enough")

        buildings: List[Building] = [
            Building.create_from_osm(building_osm)
            for building_osm in buildings_osm_large
        ]

        addresses = Building.update_nearby_addresses(buildings)
        addresses_before = len(addresses)
        addresses = list(set(addresses))
        logger.info(
            f"removed {addresses_before - len(addresses)} duplicate addresses. {len(addresses)} left."
        )

        addresses_before = len(addresses)
        cities_exclude = [city.lower() for city in CITIES_LARGE_NL]
        addresses = [
            address
            for address in addresses
            if address.city is None or address.city.lower() not in cities_exclude
        ]
        logger.info(
            f"removed {addresses_before - len(addresses)} addresses in large cities. {len(addresses)} left."
        )

        for i, address in enumerate(addresses):
            logger.info(
                f"finding nearby address count for address {i+1}/{len(addresses)}"
            )
            address.update_addresses_nearby_count()

        addresses_before = len(addresses)
        addresses = [
            address
            for address in addresses
            if address.addresses_nearby_count < Building.MAX_ADDRESSES_NEARBY
        ]
        logger.info(
            f"removed {addresses_before - len(addresses)} addresses in a populated area. {len(addresses)} left."
        )
        companies = Address.update_companies(addresses)
        Company.update_types(companies)

        logger.info(
            self.style.SUCCESS(f"Successfully created {len(buildings)} buildings")
        )
        return buildings, companies

    @classmethod
    def get_region_bbox(cls, options) -> Optional[BBox]:
        region = options.get("region")
        if region is not None:
            logger.info(f"Creating buildings for region: {region}")
            region_bbox = REGIONS[region]
            return BBox(
                lon_min=region_bbox[1],
                lon_max=region_bbox[3],
                lat_min=region_bbox[0],
                lat_max=region_bbox[2],
            )
        return None
