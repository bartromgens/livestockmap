import logging

from django.core.management.base import BaseCommand
from building.models import Tile

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Delete tiles"

    def handle(self, *args, **options):
        tiles = Tile.objects.all()
        building_count = tiles.count()
        tiles.delete()
        logger.info(self.style.SUCCESS(f"Successfully deleted {building_count} tiles"))
