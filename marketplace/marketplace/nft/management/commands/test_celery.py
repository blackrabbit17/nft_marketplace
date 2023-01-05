from django.core.management.base import BaseCommand
from nft.tasks import celery_worker_test


class Command(BaseCommand):

    def handle(self, *args, **options):

        celery_worker_test.delay(3, 5)
