import logging

from django.core.management.base import BaseCommand

from building.models import Building

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Update all buildings with derived information such as company."

    def handle(self, *args, **options):
        building_count = Building.objects.all().count()
        logger.info(f"found {building_count} buildings")

        i = 0
        for building in Building.objects.all().iterator(chunk_size=1000):
            i += 1
            logger.info(
                f"update building {i}/{building_count}: {(i / building_count * 100):.2f}%"
            )
            building.update_company(save=True)

