import logging

from django.core.management.base import BaseCommand

from building.models import Building

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Update all buildings with derived information such as company."

    def handle(self, *args, **options):
        buildings = Building.objects.filter()
        logger.info(f"found {len(buildings)} buildings")
        for i, building in enumerate(buildings):
            logger.info(
                f"update building {(i + 1)}/{len(buildings)}: {((i + 1) / len(buildings) * 100):.2f}%"
            )
            building.update_company()
