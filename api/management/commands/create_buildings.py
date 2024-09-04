import logging

from django.core.management.base import BaseCommand

from building.create import BuildingFactory

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Create livestock buildings and related data from OSM"

    def add_arguments(self, parser):
        parser.add_argument(
            "--region",
            type=str,
            # default="lunteren",
            help="The region to create buildings for",
        )

    def handle(self, *args, **options):
        try:
            region = options.get("region")
            region_bbox = BuildingFactory.get_region_bbox(region)
            if region_bbox is not None:
                BuildingFactory.create_for_bbox(region_bbox)
            else:
                BuildingFactory.create_tiles()
        except Exception as e:
            logger.exception(e)
