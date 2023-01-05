import React, { useState } from "react";
import styled from "styled-components";
import Clock from "./Clock";
import { Link } from '@reach/router';


const Outer = styled.div`
  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
  overflow: hidden;
  border-radius: 8px;
`;

const ColumnNew = (props) => {

    const [height, setHeight] = useState(0);

    const onImgLoad = ({target:img}) => {
        if(height < img.offsetHeight) {
            setHeight(img.offsetHeight);
        }
    };

    return (
        <div className='row'>
        {props.nfts.map( (nft, index) => (
            <div key={index} className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12 mb-4">
                <div className="nft__item m-0">
                    { nft.auction_type === 1 && nft.auction_end !== null &&
                        <div className="de_countdown">
                            <Clock deadline={nft.auction_end} />
                        </div>
                    }
                    { nft.auction_type === 0 &&
                        <div className="de_countdown">Fixed Price</div>
                    }

                    <div className="author_list_pp">
                        <Link to={nft.owner_link}>
                            <img className="lazy" src={nft.owner_img} alt=""/>
                            { nft.owner.verified && 
                                <i className="fa fa-check"></i>
                            }
                        </Link>
                    </div>
                    <div className="nft__item_wrap" style={{height: `${height}px`}}>
                      <Outer>
                        <Link to={"/nft/" + nft.id}>
                          <span>
                            <img onLoad={onImgLoad} src={nft.image_preview_url} className="lazy nft__item_preview" alt=""/>
                          </span>
                        </Link>
                      </Outer>
                    </div>
                    <div className="nft__item_info">
                        <Link to={"/nft/" + nft.id}>
                            <h4>{nft.title}</h4>
                        </Link>
                        <Link to={"/nft/" + nft.id}>
                            <small>{nft.description}</small>
                        </Link>
                        <div className="nft__item_price">
                            <Link to={"/nft/" + nft.id}>
                            {nft.price_formatted} {nft.currency_symbol}
                            </Link>
                        </div>
                        <div className="nft__item_action">
                            <Link to={"/nft/" + nft.id}>
                            { nft.auction_type === 0 && 
                                    <span>Buy</span>
                                }
                                { nft.auction_type === 1 && 
                                    <span>Place a bid</span>
                                }
                                
                            </Link>
                        </div>
                        <div className="nft__item_like">
                            <i className="fa fa-heart"></i><span>{nft.likes}</span>
                        </div>                            
                    </div> 
                </div>
            </div>  
        ))}
        
        </div> 
    );
}

export default ColumnNew;
