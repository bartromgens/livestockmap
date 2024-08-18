import logging

from django.core.management.base import BaseCommand
from building.models import Building

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Delete livestock buildings from OSM"

    def handle(self, *args, **options):
        buildings = Building.objects.all()
        building_count = buildings.count()
        buildings.delete()
        logger.info(
            self.style.SUCCESS(f"Successfully deleted {building_count} buildings")
        )
