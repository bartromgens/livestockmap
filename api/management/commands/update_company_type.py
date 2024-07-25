import logging

from django.core.management.base import BaseCommand

from building.models import Company

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Updates the type of company based on the description"

    def handle(self, *args, **options):
        companies = Company.objects.all()
        for i, company in enumerate(companies):
            self.stdout.write(f"finding type for company {i+1}/{len(companies)}")
            company.update_type()
            company.save()
