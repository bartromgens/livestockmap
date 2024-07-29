import logging

from django.core.management.base import BaseCommand

from building.models import Address

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = ""

    def handle(self, *args, **options):
        addresses = Address.objects.all()
        Address.update_companies(addresses)
