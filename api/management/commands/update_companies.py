import logging

from django.core.management.base import BaseCommand

from building.models import Address
from building.models import Company

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = ""

    def handle(self, *args, **options):
        addresses = (
            Address.objects.filter(building__addresses_nearby__isnull=False)
            .filter(company__isnull=True)
            .distinct()
        )
        logger.info(f"found {len(addresses)}/{Address.objects.all().count()} addresses")
        companies = Address.update_companies(addresses)
        Company.update_types(companies)
