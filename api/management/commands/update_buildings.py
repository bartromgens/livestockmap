import logging

from django.core.management.base import BaseCommand
from django.core.paginator import Paginator

from building.models import Building

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Update all buildings with derived information such as company."

    def handle(self, *args, **options):
        buildings = Building.objects.all().order_by('id')
        # logger.info(f"found {len(buildings)} buildings")

        page_size = 100
        paginator = Paginator(buildings, page_size)

        i = 0
        for p_count in paginator.page_range:
            i += page_size
            logger.info(
                f"update building {i}/{len(buildings)}: {(i / len(buildings) * 100):.2f}%"
            )
            page = paginator.page(p_count)
            for building in page.object_list:
                building.update_company(save=False)

            # Perform bulk update for the current page
            Building.objects.bulk_update(page.object_list, ['company'])

