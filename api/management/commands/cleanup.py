from django.core.management.base import BaseCommand
from building.models import Building
from building.models import Company


class Command(BaseCommand):
    help = ""

    def handle(self, *args, **options):
        self.cleanup_buildings()
        self.cleanup_companies()

    @classmethod
    def cleanup_buildings(cls):
        buildings = Building.objects.all()
        for building in buildings:
            addresses_nearby = Building.filter_nearest(
                building, building.addresses_nearby.all()
            )
            building.addresses_nearby.set(addresses_nearby)
            building.save()

    @classmethod
    def cleanup_companies(cls):
        Company.objects.filter(description="").delete()
