import logging

from django.core.management.base import BaseCommand

from building.models import Address
from building.models import Building
from osm.building import get_address_nearby

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = ""

    def handle(self, *args, **options):
        # TODO BR: get existing or remove duplicates
        distance = 100
        buildings = Building.objects.all()
        for i, building in enumerate(buildings):
            self.stdout.write(f"finding address for building {i+1}/{len(buildings)}")
            nodes = get_address_nearby(
                building.center.lat, building.center.lon, distance
            )
            addresses_nearby = [Address.create_from_node(node) for node in nodes]
            building.addresses_nearby.set(addresses_nearby)
            building.save()
