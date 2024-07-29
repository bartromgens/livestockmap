import logging

from django.core.management.base import BaseCommand

from building.models import Company

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Updates the type of company based on the description"

    def handle(self, *args, **options):
        companies = Company.objects.all()
        Company.update_types(companies)
