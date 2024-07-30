import logging
from typing import List

from django.core.management.base import BaseCommand

from building.models import Address
from building.models import Building
from building.models import Company
from osm.building import get_buildings_batches
from osm.building import OSMBuilding

logger = logging.getLogger(__name__)

REGIONS = {
    "flevoland": (52.4443529, 5.5478277, 52.5737960, 5.8413397),
    "lunteren": (52.092612, 5.5628603, 52.109061, 5.5923646),
    "montfoort": (52.1081869, 5.0961645, 52.1228383, 5.1226157),
    "twente": (52.0039710, 6.3718900, 52.0631596, 6.5639037),
    "uden": (51.612175, 5.6340277, 51.6421757, 5.6640277),
    "utrecht": (52.0231300, 4.9633142, 52.0574780, 5.0250918),
}


class Command(BaseCommand):
    help = "Create livestock buildings from OSM"

    def add_arguments(self, parser):
        parser.add_argument(
            "--region",
            type=str,
            default="lunteren",
            help="The region to create buildings for",
        )

    def handle(self, *args, **options):
        region = options["region"]
        region_bbox = REGIONS[region]
        logger.info(f"Creating buildings for region: {region}")
        buildings_raw = get_buildings_batches(region_bbox)
        # print(json.dumps(buildings_raw, indent=2))

        buildings_osm: List[OSMBuilding] = []
        for building_raw in buildings_raw:
            buildings_osm.append(OSMBuilding.create_from_osm_way(building_raw))

        self.stdout.write(f"{len(buildings_osm)} buildings found")

        buildings_osm_large = list(
            filter(lambda build: build.area_square_meters > 200, buildings_osm)
        )

        self.stdout.write(f"{len(buildings_osm_large)} buildings created")

        buildings: List[Building] = [
            Building.create_from_osm(building_osm)
            for building_osm in buildings_osm_large
        ]

        addresses = Building.update_nearby_addresses(buildings)
        companies = Address.update_companies(addresses)
        Company.update_types(companies)

        self.stdout.write(
            self.style.SUCCESS(f"Successfully created {len(buildings)} buildings")
        )
