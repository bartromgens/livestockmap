from typing import List

from django.core.management.base import BaseCommand

from building.models import Address
from building.models import Building
from building.models import Company
from osm.building import get_buildings_batches
from osm.building import OSMBuilding


class Command(BaseCommand):
    help = "Create livestock buildings from OSM"

    # def add_arguments(self, parser):
    #     parser.add_argument("area", nargs="+", type=int)

    def handle(self, *args, **options):
        test_bbox = (
            52.09261214198491,
            5.562860339734603,
            52.109061883798304,
            5.592364638898419,
        )
        test_bbox_brabant = (
            51.6121757,
            5.6340277,
            51.6421757,
            5.6640277,
        )
        test_bbox_utrecht_rural = (52.0231300, 4.9633142, 52.0574780, 5.0250918)
        test_bbox_utrecht_city = (52.1081869, 5.0961645, 52.1228383, 5.1226157)
        test_bbox_flevoland = (52.4443529, 5.5478277, 52.5737960, 5.8413397)
        test_bbox_twente = (52.0039710, 6.3718900, 52.0631596, 6.5639037)
        test_box_large = (
            51.998199003792266,
            5.337630742650022,
            52.261223462827274,
            5.809699529271116,
        )
        buildings_raw = get_buildings_batches(test_bbox_twente)
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
