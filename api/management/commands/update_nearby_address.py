from django.core.management.base import BaseCommand
from osm.building import get_address_nearby


class Command(BaseCommand):
    help = ""

    def handle(self, *args, **options):
        lat = 52.0988864
        lon = 5.5681605
        distance = 100
        nodes = get_address_nearby(lat, lon, distance)
        print(nodes["elements"])
        for node in nodes["elements"]:
            print(
                node["tags"]["addr:street"],
                node["tags"]["addr:housenumber"],
                node["tags"]["addr:postcode"],
                node["tags"]["addr:city"],
            )
