from celery import shared_task
import logging
from nft.models import NFTItemActivity


@shared_task
def celery_worker_test(x, y):
    logging.info('Worker test addition :' + str(x + y))
    

@shared_task
def blockchain_nftitemact_check(transaction_id):

    pass

