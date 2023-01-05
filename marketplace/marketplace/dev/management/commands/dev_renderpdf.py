from django.core.management.base import BaseCommand
from nft.models import ContractTemplate


class Command(BaseCommand):

    def handle(self, *args, **options):

        ct = ContractTemplate.objects.all()[0]
        ct.write_pdf('/tmp/test.pdf')
