import logging

from django.core.management.base import BaseCommand
from django.db.models import Sum

from building.models import Animal
from building.models import Company

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Prints some stats of the data in the database"

    def handle(self, *args, **options):
        self.print_stats(Animal.COW)
        self.print_stats(Animal.PIG)
        self.print_stats(Animal.CHICKEN)
        self.print_stats(Animal.SHEEP)
        self.print_stats(Animal.GOAT)

    @classmethod
    def print_stats(cls, animal_type: Animal):
        cow_companies = Company.objects.filter(animal_type_main=animal_type)
        companies = cow_companies
        animal_count = companies.aggregate(Sum("animal_count"))
        print(animal_type.label, animal_count["animal_count__sum"] / 1e6, "million")
