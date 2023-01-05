import React, { useEffect, useState } from 'react';
import axios from "axios";
import Clock from "../components/Clock";
import Footer from '../components/footer';
import { createGlobalStyle } from 'styled-components';
import { Link } from '@reach/router';
import { toast } from 'react-toastify';

import Web3 from 'web3';
import ABI from "../../artifacts/ABI/PactNFT"
import { DEV_CONTRACT } from '../../artifacts/ContractConst';


const GlobalStyles = createGlobalStyle`
  header#myHeader.navbar.white {
    background: #fff;
    border-bottom: solid 1px #dddddd;
  }
  @media only screen and (max-width: 1199px) {
    .navbar{
      background: #ffffff;
    }
    .navbar .menu-line, .navbar .menu-line1, .navbar .menu-line2{
      background: #111;
    }
    .item-dropdown .dropdown a{
      color: #111 !important;
    }
  }

  .item_info_liked  {
    background-color: rgba(255, 0, 0, 0.2) !important;
  }
  
  .item_i_heart {
      color:red !important;
  }

  .cp {
      cursor: pointer;
  }

  .author_list_info {
      padding-top: 5px !important;
  }

  .author_list_info h6 {
      margin:0;
  }

  .card-header {
      background-color: rgba(131, 100, 226, 0.1) !important;
  }
  .item_info .item_info_counts {
      margin-bottom:12px !important;
  }
  .purchase {
      padding:15px 20px;
  }
  .currency-logo {
      display: inline-block;
  }
  .currency-price {
    display:inline-block;
    font-size:20px;
    color:black;
    letter-spacing:0.02em;
  }
  .blockchain_waiting {
    font-size:14px;

  }
  .eth-logo {
    margin-right:16px;
  }
  .bsc-logo {
    margin-right:14px;
  }
  .poly-logo {
    margin-right:16px;
  }
  .bidTable {
    width:100%;
  }
  .placebid {
      width:100px;
      text-align:right;
  }
  .bidInput {
      padding-right:20px;
  }
  .bidInput input {
    margin-bottom:0;
  }
`;


const ItemDetail = (props) => {

    const { ethereum } = window;
    const web3 = new Web3(Web3.givenProvider);

    const [showBids, setShowBids] = useState(true);
    const [showHistory, setShowHistory] = useState(false);

    const [likeCount, setLikeCount] = useState(null);
    const [viewCount, setViewCount] = useState(null);

    const [selfHasLiked, setSelfHasLiked] = useState(false);

    const [nft, setNFT] = useState({});
    const [bids, setBids] = useState([]);
    const [history, setHistory] = useState([]);
    const [nftVoucher, setNFTVoucher] = useState({});

    const [loadingDone, setLoadingDone] = useState(false);

    const [auctionFixedPrice, setAuctionFixedPrice] = useState(false);
    const [nftTxPending, setNFTTxPending] = useState(null);

    const fetchNFT = async() => {
        axios.get("api/1.0/web/NFT/" + props.id)
            .then((resp) => {

              setNFT(resp.data.payload.nft);
              setLikeCount(resp.data.payload.nft.likes);
              setBids(resp.data.payload.offers);
              setHistory(resp.data.payload.history);

              if(resp.data.payload.nft.pending_itemactivity) {
                  setNFTTxPending(resp.data.payload.nft.pending_itemactivity);
              }

              if(resp.data.payload.voucher !== null) {
                setNFTVoucher(resp.data.payload.voucher.data_structure);
              }
              
              if(resp.data.payload.nft.auction_type === 0) {
                setAuctionFixedPrice(true);
              }
              else {
                setAuctionFixedPrice(false);
              }

              setSelfHasLiked(resp.data.payload.nft.user_has_fav);
              trackView(resp.data.payload.nft);

            })
            .catch(error => {
              // TODO: Show an error message
              console.error("Fail to fetch")
            });
    }

    const trackView = (nft) => {
        axios.post("api/1.0/NFTView/"+nft.id+"/", {nft: nft.id})
            .then((resp) => {
                setViewCount(resp.data.payload.count);
                setLoadingDone(true);
            });
    }

    const toggleSelfHasLiked = () => {

        var newSelfHasLiked = !selfHasLiked;  // Note that the setter is async so might not be reflected immediatly,
                                              // which is why we have to use this intermediate variable
        setSelfHasLiked(newSelfHasLiked);


        if(newSelfHasLiked) {
            setLikeCount(likeCount + 1);
        }
        else {
            setLikeCount(likeCount - 1);
        }

        if(newSelfHasLiked) {
            axios.post("api/1.0/NFTFav/"+nft.id+"/", {nft: nft.id})
            .then((resp) => {
                console.log(resp);
            });
        }
        else {
            axios.delete("api/1.0/NFTFav/"+nft.id+"/", {nft: nft.id})
            .then((resp) => {
                console.log(resp);
            });
        }
    }
   
    useEffect(() => {
        fetchNFT();

        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);
    
    
    const clickShowBids = () => {
      setShowBids(true);
      setShowHistory(false);

      document.getElementById("showBidsBttn").classList.add("active");
      document.getElementById("showHistoryBttn").classList.remove("active");
    };

    const clickShowHistory = () => {
      setShowHistory(true);
      setShowBids(false);

      document.getElementById("showHistoryBttn").classList.add("active");
      document.getElementById("showBidsBttn").classList.remove("active");
    };

    const buyNow = () => {

        let myContract = new web3.eth.Contract(ABI['abi'], DEV_CONTRACT);

        var parsedVouch = {
            'tokenId': nftVoucher['tokenId'],
            'uri': nftVoucher['uri'],
            'signature': nftVoucher['signature'],
            'minPrice': nftVoucher['minPrice'].toString()
        }
        
        myContract.methods.redeem(parsedVouch).send({
            from: ethereum.selectedAddress,
            value: nftVoucher['minPrice'].toString(),
        }).then(result => {
            
            var payload = {
                'nft': nft.id,
                'activityType': 2, /* Purchase - NFTItemActivity.ACT_TYPE_PURCHASE */
                'blockchainTx': result.transactionHash
            }

            axios.post("api/1.0/NFTItemActivity/0/", payload)
            .then((resp) => {
                fetchNFT();
            });

        }).catch(error => {
            
            if(error.code === 4001) {
                toast('Transaction cancelled');
            }
            else if(error.code === -32603 && error.message.indexOf('already minted') !== -1) {
                toast('Error: NFT already minted');
            }
            else {
                // Unknown Error! TODO: Publish this to some error handling system
                toast('Error: Unknown Error!');
                console.error(error);
            }
        });
    };

    const placeBid = () => {

    }

    /* Utility functions */
    const wallet_display = (wallet_addr) => {
        if(wallet_addr === undefined || wallet_addr === null) {
            return null;
        }
        else {
            return '0x' + wallet_addr.slice(2, 5) + '..'  + wallet_addr.slice(wallet_addr.length - 3)
        }
    }

    const profile_display = (profile) => {
        if(profile.username != null) {
        return profile.username;
        }
        else {
        return wallet_display(profile.address);
        }
    }

    return (
        <div>
            <GlobalStyles/>

            { loadingDone &&

                <section className='container'>
                  <div className='row mt-md-5 pt-md-4'>
                    <div className="col-md-6 text-center">
                        <img src={nft.image_preview_url} className="img-fluid img-rounded mb-sm-30" alt=""/>
                    </div>
                    <div className="col-md-6">
                        <div className="item_info">
                            { nft.deadline && 
                                <>
                                    <span>Auctions ends in </span>
                                    <div className="de_countdown">
                                        <Clock deadline={nft.deadline} />
                                    </div>
                                </>
                            }
                            <h2>{nft.title}</h2>

                            <div className="item_info_counts">
                                <div className="item_info_views"><i className="fa fa-eye"></i>{viewCount !== null && <>{viewCount}</>}</div>
                                <div onClick={toggleSelfHasLiked} className={selfHasLiked ? 'cp item_info_liked' : 'cp item_info_like'}><i className={selfHasLiked ? 'cp fa fa-heart item_i_heart' : 'cp fa fa-heart'}></i>{likeCount}</div>
                            </div>

                            { nft.description &&
                                <p>{nft.description}</p>
                            }

                            <div className="row">
                                <div className="col-md-6">
                                    <div className="item_author">
                                        <Link to={"/profile/" + nft.creator.address}>
                                            <div className="author_list_pp">
                                                <span>
                                                    <img className="lazy" src={nft.creator_img} alt=""/>
                                                    {nft && nft.creator.verified && 
                                                        <i className="fa fa-check"></i>
                                                    }
                                                </span>
                                            </div>
                                            <div className="author_list_info">
                                                <h6>Creator</h6>
                                                <span>{profile_display(nft.owner)}</span>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="item_author">
                                        <Link to={"/profile/" + nft.owner.address}>
                                            <div className="author_list_pp">
                                                <span>
                                                    <img className="lazy" src={nft.owner_img} alt=""/>
                                                    {nft && nft.owner.verified && 
                                                        <i className="fa fa-check"></i>
                                                    }
                                                </span>
                                            </div>
                                            <div className="author_list_info">
                                                <h6>Owner</h6>
                                                <span>{profile_display(nft.owner)}</span>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <div className="spacer-20"></div>

                            {nftTxPending !== null && 
                                <div className="card">
                                    <div className="card-header">Transaction</div>
                                    <div>
                                        <div className="purchase">
                                            <div className="blockchain_waiting">
                                                
                                                A purchase transaction is pending for this item, please check back in a few minutes for updates!
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            }

                            {nftTxPending === null && 
                            <>
                            
                                <div className="card">
                                    <div className="card-header">{nft.auction_type_human}</div>
                                    <div>
                                        <div className="purchase">
                                            <div className="currency-logo">
                                                {nft.currency_symbol === 'ETH' &&
                                                    <img alt="ethereum" className="eth-logo" src="/static/img/crypto_logos/eth.svg" width="28" />
                                                }
                                                {nft.currency_symbol === "BSC" &&
                                                    <img alt="Binance Smart Chain" className="bsc-logo" src="/static/img/crypto_logos/bsc.svg" width="48" />
                                                }
                                                {nft.currency_symbol === 'POLY' &&
                                                    <img alt="Polygon" className="poly-logo" src="/static/img/crypto_logos/poly.svg" width="43" />
                                                }
                                            </div>
                                            <div className="currency-price">{nft.price_formatted} {nft.currency_symbol}</div>
                                            
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="spacer-30"></div>

                                {auctionFixedPrice && 
                                    <div className="btn-main" onClick={buyNow}>Buy Now</div>
                                }

                                {!auctionFixedPrice && 
                                <>
                                    <table className="bidTable">
                                        <tbody>
                                            <tr>
                                                <td className="bidInput">
                                                    <input className="form-control inline-input" type="number" placeholder="" />
                                                </td>
                                                <td className="placebid">
                                                    <div className="btn-main inline-input" onClick={placeBid}>Place Bid</div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </>
                                }

                                {!auctionFixedPrice && 
                                    <>
                                    <div className="spacer-30"></div><div className="de_tab">
                                            <ul className="de_nav">
                                                <li id='showBidsBttn' className="active"><span onClick={clickShowBids}>Bids</span></li>
                                                <li id='showHistoryBttn' className=''><span onClick={clickShowHistory}>History</span></li>
                                            </ul>
                                            <div className="de_tab_content">
                                                {showBids && (
                                                    <div className="tab-1 onStep fadeIn">
                                                        {bids.map((bid, index) => (
                                                            <div className="p_list" key={index}>
                                                                <div className="p_list_pp">
                                                                    <span>
                                                                        <img className="lazy" src={bid.offered_by.author_img} alt="" />
                                                                        {bid.offered_by.verified &&
                                                                            <i className="fa fa-check"></i>}
                                                                    </span>
                                                                </div>
                                                                <div className="p_list_info">
                                                                    Bid <b>{bid.price_formatted} {bid.offer_currency_symbol}</b>
                                                                    <span>by <b>{profile_display(bid.offered_by)}</b> at {bid.created_at_human}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {showHistory && (
                                                    <div className="tab-2 onStep fadeIn">
                                                        {history.map((hist, index) => (
                                                            <div className="p_list" key={index}>

                                                                {hist.currency &&
                                                                    <>
                                                                        <div className="p_list_pp">
                                                                            <span>
                                                                                <img className="lazy" src={hist.source_owner.author_img} alt="" />
                                                                                {hist.source_owner.verified &&
                                                                                    <i className="fa fa-check"></i>}
                                                                            </span>
                                                                        </div>
                                                                        <div className="p_list_info">
                                                                            SALE bid <b>{hist.formatted_amount} {hist.sale_currency_symbol}</b>
                                                                            <span>by <b>{profile_display(hist.source_owner)}</b> to <b>{profile_display(hist.target_owner)}</b>
                                                                                <br />
                                                                                {hist.created_at_human}
                                                                            </span>
                                                                        </div>
                                                                    </>}

                                                                {!hist.currency &&
                                                                    <>
                                                                        <div className="p_list_pp">
                                                                            <span>
                                                                                <img className="lazy" src={hist.source_owner.author_img} alt="" />
                                                                                {hist.source_owner.verified &&
                                                                                    <i className="fa fa-check"></i>}
                                                                            </span>
                                                                        </div>
                                                                        <div className="p_list_info">
                                                                            Transfer
                                                                            <span> from <b>{profile_display(hist.source_owner)}</b> to <b>{profile_display(hist.target_owner)}</b> <br />{hist.created_at_human}</span>
                                                                        </div>
                                                                    </>}

                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                    </div>
                                    </>
                                }
                            </>
                            }

                        </div>
                    </div>
                  </div>
                </section>
            }

            <Footer />
        </div>
    );
}

export default ItemDetail;
