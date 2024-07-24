import logging

from django.core.management.base import BaseCommand

from building.models import Address
from building.models import Company
from company.kvk import get_companies_for_address

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = ""

    def handle(self, *args, **options):
        addresses = Address.objects.all()
        for i, address in enumerate(addresses):
            self.stdout.write(f"finding company for address {i+1}/{len(addresses)}")
            companies = get_companies_for_address(str(address))
            for c in companies:
                company, _created = Company.objects.get_or_create(
                    address=address, description=c.description, active=c.active
                )
                if _created:
                    company.save()
