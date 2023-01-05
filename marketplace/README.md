```
#  ┌──────────┐                            ┌──────────┐
#  |  Minted  ├───────── Expires ─────────►| Expired  |◄─────────────────────────┐
#  └────┬─────┘                            └──────────┘                          |
#       |                                    ▲                                   | Expires
#       |                                    |  Expires                          |
#       |                                    |                                   |
#       |                               ┌───────────┐                        ┌───┴───────┐
#       └──────────── Purchased ───────►| Owned     ├──── Transferred ──────►| Owned     ├──── Transferred ──────► .. n
#                                       |           |                        |           |
#                                       |           ├──── Sold ─────────────►|           ├──── Sold ─────────────► .. n
#                                       └──┬─────┬──┘                        └──┬─────┬──┘ 
#                                          |     |                              |     |              ┌──────────┐
#                                          └─────)───────────── Redeem ─────────┴─────)────────────► | Redeemed |
#                                                |                                    |              └──────────┘
#                                                | Disputed                           | Disputed
#                                                |                                    |              ┌──────────┐
#                                                └────────────────────────────────────┴────────────► | Disputed | ── Resolved, Service Provider ──►
#                                                                                                    |          |
#                                                                                                    |          | ── Resolved, Owner ──►
#                                                                                                    └──────────┘
#  Path                 DB Changes                  Blockchain Changes              Economics
#
#  Path1 -----------------------------------------------------------------------------------------------------------
#     Minted            Create NFT Object           mintNFT()                       Gas paid by service provider
#     Expires           Status: Expired             -                               -

#  Path2 -----------------------------------------------------------------------------------------------------------
#     Minted            Create NFT Object           mintNFT()                       Gas paid by service provider
#     Purchased         Status: Purchased           change owner                    Gas paid by purchaser
#                                                                                   Funds sent to escrow
#     Expires           Status: Expired             -                               Funds may be withdrawn from escrow back to purchaser

#  Path3 -----------------------------------------------------------------------------------------------------------
#     Minted            Create NFT Object           mintNFT()                       Gas paid by service provider
#     Purchased         Status: Purchased           change owner                    Gas paid by purchaser
#                                                                                   Funds sent to escrow
#     Transferred       Change Owner                change owner()                  -
#
#     Redeemed          Status: Redeemed            change_owner()                  Escrowed funds sent to service provider
#                    
#

#  Path4 -----------------------------------------------------------------------------------------------------------
#     Minted            Create NFT Object           mintNFT()                       Gas paid by service provider
#     Purchased         Status: Purchased           change owner                    Gas paid by purchaser
#                                                                                   Funds sent to escrow
#     Sold              Change Owner                change owner()                  Fund % sent to escrow
#
#     Redeemed          Status: Redeemed            change_owner()                  Escrowed funds sent to service provider
#

#  Path5 -----------------------------------------------------------------------------------------------------------
#     Minted            Create NFT Object           mintNFT()                       Gas paid by service provider
#     Purchased         Status: Purchased           change owner                    Gas paid by purchaser
#                                                                                   Funds sent to escrow
#     Sold              Change Owner                change owner()                  Fund % sent to escrow
#
#     Disputed          Status: Disputed            -                               -
#     
#     Evidence uploaded and decided by DAO (or admins)
#
#     Resolved - Service Provider Status: resolved  ?                               Funds sent to service provider


#  Path6 -----------------------------------------------------------------------------------------------------------
#     Minted            Create NFT Object           mintNFT()                       Gas paid by service provider
#     Purchased         Status: Purchased           change owner                    Gas paid by purchaser
#                                                                                   Funds sent to escrow
#     Sold              Change Owner                change owner()                  Fund % sent to escrow
#
#     Disputed          Status: Disputed            -                               -
#     
#     Evidence uploaded and decided by DAO (or admins)
#
#     Resolved - Token Owner: Status resolved ?                                     Funds sent to token owner
#                                                                                   Up to current token price (made from original token price + royalties)
#                                                                                   if current_price > (original price + royalties) then user has shortfall
#                                                                                   if current_price < (original price + royalties) user gets current_price, and remainder sent to DAO trust
```
