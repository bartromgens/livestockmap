from typing import List

from django.core.management.base import BaseCommand
from building.models import Building


class Command(BaseCommand):
    help = "Delete livestock buildings from OSM"

    def handle(self, *args, **options):
        buildings = Building.objects.all()
        building_count = buildings.count()
        buildings.delete()
        self.stdout.write(
            self.style.SUCCESS(f"Successfully deleted {building_count} buildings")
        )
