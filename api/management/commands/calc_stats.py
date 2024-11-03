import logging

from django.core.management.base import BaseCommand
from django.db.models import Sum

from building.models import Animal
from building.models import Company

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Prints some stats of the data in the database"

    def handle(self, *args, **options):
        self.print_animals_counts(Animal.COW)
        self.print_animals_counts(Animal.PIG)
        self.print_animals_counts(Animal.CHICKEN)
        self.print_animals_counts(Animal.SHEEP)
        self.print_animals_counts(Animal.GOAT)

        self.print_company_type_counts(Animal.COW)
        self.print_company_type_counts(Animal.PIG)
        self.print_company_type_counts(Animal.CHICKEN)
        self.print_company_type_counts(Animal.SHEEP)
        self.print_company_type_counts(Animal.GOAT)

        self.print_pig_companies_count()
        self.print_chicken_companies_count()
        self.print_sheep_companies_count()
        self.print_goat_companies_count()

    @classmethod
    @property
    def companies_active(cls):
        return Company.objects.filter(active=True)

    @classmethod
    def print_animals_counts(cls, animal_type: Animal):
        companies = cls.companies_active.filter(animal_type_main=animal_type)
        animal_count = companies.aggregate(Sum("animal_count"))
        print(animal_type.label, animal_count["animal_count__sum"] / 1e6, "million")

    @classmethod
    def print_company_type_counts(cls, animal_type: Animal):
        companies = cls.companies_active.filter(animal_type_main=animal_type)
        print(animal_type.label, companies.count())

    @classmethod
    def print_pig_companies_count(cls):
        companies = cls.companies_active.filter(pig=True)
        pig_only = (
            companies.exclude(cattle=True)
            .exclude(chicken=True)
            .exclude(goat=True)
            .exclude(sheep=True)
        )
        pigs = companies.aggregate(Sum("animal_count"))
        pig_only_animal_count = pig_only.aggregate(Sum("animal_count"))
        print(companies.count(), "pig companies", pig_only.count(), "pig only")
        print(
            pigs["animal_count__sum"],
            "pig companies",
            pig_only_animal_count["animal_count__sum"],
            "pig only",
        )

    @classmethod
    def print_chicken_companies_count(cls):
        companies = cls.companies_active.filter(chicken=True)
        chicken_only = (
            companies.exclude(cattle=True)
            .exclude(pig=True)
            .exclude(goat=True)
            .exclude(sheep=True)
        )
        chicken = companies.aggregate(Sum("animal_count"))
        chicken_only_animal_count = chicken_only.aggregate(Sum("animal_count"))
        print(
            companies.count(), "chicken companies", chicken_only.count(), "chicken only"
        )
        print(
            chicken["animal_count__sum"],
            "chicken",
            chicken_only_animal_count["animal_count__sum"],
            "chicken only",
        )

    @classmethod
    def print_sheep_companies_count(cls):
        name = "sheep"
        all = cls.companies_active.filter(sheep=True)
        only = (
            all.exclude(cattle=True)
            .exclude(pig=True)
            .exclude(goat=True)
            .exclude(chicken=True)
        )
        all_count = all.aggregate(Sum("animal_count"))
        only_animal_count = only.aggregate(Sum("animal_count"))
        print(all.count(), f"{name} companies", only.count(), f"{name} only")
        print(
            all_count["animal_count__sum"],
            f"{name}",
            only_animal_count["animal_count__sum"],
            f"{name} only",
        )

    @classmethod
    def print_goat_companies_count(cls):
        name = "goat"
        all = cls.companies_active.filter(goat=True)
        only = (
            all.exclude(cattle=True)
            .exclude(pig=True)
            .exclude(sheep=True)
            .exclude(chicken=True)
        )
        all_count = all.aggregate(Sum("animal_count"))
        only_animal_count = only.aggregate(Sum("animal_count"))
        print(all.count(), f"{name} companies", only.count(), f"{name} only")
        print(
            all_count["animal_count__sum"],
            f"{name}",
            only_animal_count["animal_count__sum"],
            f"{name} only",
        )
