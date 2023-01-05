from django.contrib.auth.models import User
from blockchains.providers import get_provider_for_nft
from blockchains.nft_contract import get_blockchain_owner_of
from celery import shared_task
import logging
from nft.models import NFT, BlockchainStatusMixin, NFTItemActivity
from requests.exceptions import ConnectionError
from userprofile.models import UserNotification
from web3 import Web3


@shared_task
def check_item_activity(nft_id: int):

    nft = NFT.objects.get(pk=nft_id)

    if nft.pending_itemactivity is None:
        logging.info(f'NFT<{nft.id}> pending item activity is now none, nothing to do')
        return

    pending = nft.pending_itemactivity

    logging.info(f'NFT<{nft.id}> NFTItemActivity<{pending.id}>, item activity is activity type: ' + 
                   pending.activity_type_human())

    provider = get_provider_for_nft(nft)

    if pending.blockchain_tx_status in [BlockchainStatusMixin.BLKCHN_STATUS_PENDING,
                                        BlockchainStatusMixin.BLKCHN_STATUS_SUBMITTED]:

        try:
            n_confirms = provider.eth.blockNumber - provider.eth.getTransaction(pending.blockchain_tx).blockNumber
        except ConnectionError as e:
            logging.error('ConnectionError calling RPC, exception was: ' + str(e))
            return

        if n_confirms > 0 or nft.network == NFT.NETWORK_DEVELOPMENT_EVM:
            logging.info(f'NFTItemActivity{pending.id} has {n_confirms} confirms, marking as confirmed')
            pending.blockchain_tx_status = BlockchainStatusMixin.BLKCHN_STATUS_CONFIRMED
            pending.save()
        else:
            logging.info(f'NFTItemActivity{pending.id} still has 0 confirms, nothing to do')
            return

    NFT.objects.filter(pk=nft.id).update(pending_itemactivity=None)
    NFT.objects.filter(pk=nft.id).update(on_sale=False)

    if pending.activity_type == NFTItemActivity.ACT_TYPE_MINT:
        pass
        # Not sure if we need this activity type anymore, because we are
        # now doing lazy-minting, maybe remove this in future

    if pending.activity_type == NFTItemActivity.ACT_TYPE_PURCHASE:

        blkchn_owner = Web3.toChecksumAddress(get_blockchain_owner_of(nft))

        if blkchn_owner != Web3.toChecksumAddress(nft.owner.username):

            logging.info(f'NFT<id={nft.id}> changed blockchain owner, new owner is: {blkchn_owner}')

            pending.user_from = nft.owner
            pending.wallet_from = nft.owner.username

            try:
                user_to = User.objects.get(username=blkchn_owner)
                pending.user_to = user_to
                NFT.objects.filter(pk=nft.id).update(owner=user_to)
            except User.DoesNotExist:
                logging.info(f'NFT<id={nft.id}> new owner is not registered with system, setting wallet only')

            pending.wallet_to = blkchn_owner
            pending.save()

            # Notify the seller
            logging.info(f'NFT<id={nft.id}> emitting UserNotification of purchase to {pending.user_from}')
            un = UserNotification()
            un.nft_item_activity = pending
            un.owner = pending.user_from
            un.save()

    if pending.activity_type == NFTItemActivity.ACT_TYPE_TRANSFER:
        pass
        # Look up the new owner on the blockchain
        # Fill the properties of the NFTItemActivity
