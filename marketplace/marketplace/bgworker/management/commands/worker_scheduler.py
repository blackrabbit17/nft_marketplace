from bgworker.tasks import check_item_activity
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
import logging
from nft.models import NFT


class Command(BaseCommand):

    def handle(self, *args, **options):

        logging.basicConfig(level=logging.INFO)

        for nft in NFT.objects.filter(pending_itemactivity__isnull=False):
            check_item_activity(nft.id)
