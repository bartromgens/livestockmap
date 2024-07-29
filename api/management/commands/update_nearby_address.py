import logging

from django.core.management.base import BaseCommand

from building.models import Building

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = ""

    def handle(self, *args, **options):
        buildings = Building.objects.all()
        Building.update_nearby_addresses(buildings)
