from django.conf import settings
from django.core.management.base import BaseCommand
import json
from web3 import Web3


DEV_CONTRACT = '0xF3E76138e32a1c0eC070AB1efcFf70E18c1531cC'


class Command(BaseCommand):

    def handle(self, *args, **options):

        w3 = Web3(Web3.HTTPProvider('http://127.0.0.1:7545'))
        abi = json.load(open(str(settings.BASE_DIR / 'artifacts' / 'PactNFT.json')))['abi']
        contract = w3.eth.contract(address=DEV_CONTRACT, abi=abi)

        res = contract.functions.ownerOf(21).call()
        print(res)
