import logging

from django.core.management.base import BaseCommand
from django.db.models import Sum

from building.models import Animal
from building.models import Company

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Prints some stats of the data in the database"

    def handle(self, *args, **options):
        print("================")
        self.print_company_stats(Animal.PIG)
        self.print_company_stats(Animal.CHICKEN)
        self.print_company_stats(Animal.COW)
        self.print_company_stats(Animal.COW_DAIRY)
        self.print_company_stats(Animal.COW_BEEF)
        self.print_company_stats(Animal.SHEEP)
        self.print_company_stats(Animal.GOAT)
        self.print_company_stats(Animal.COMBINED)

    @classmethod
    @property
    def companies_active(cls):
        return Company.objects.filter(active=True)

    def print_company_stats(cls, animal_type: Animal):
        name = animal_type.label
        only = cls.companies_active.filter(animal_type_main=animal_type)
        only_animal_count = only.aggregate(Sum("animal_count"))
        print(
            only.count(),
            f"{name} companies",
            only_animal_count["animal_count__sum"] / 1e6,
            f"{name} animals",
        )
