import React, { Component } from "react";
import styled from "styled-components";
import Clock from "./Clock";
import axios from "axios";

const Outer = styled.div`
  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
  overflow: hidden;
  border-radius: 8px;
`;

export default class Responsive extends Component {
    constructor(props) {
        super(props);
        this.state = {
            nfts: [],
            height: 0
        };
    this.onImgLoad = this.onImgLoad.bind(this);
    }

    componentDidMount(){
        if(this.props.nfts === undefined){
            console.error("nfts json file missing or invalid path");
        } else {
            axios
            .get(this.props.nfts)
            .then((res) => {
                const nfts = res.data;
                this.setState({nfts});
            })
            .catch(err=>console.error(err))
        }
    }

    onImgLoad({target:img}) {
        let currentHeight = this.state.height;
        if(currentHeight < img.offsetHeight) {
            this.setState({
                height: img.offsetHeight
            })
        }
    }

    render() {
    return (
    <div className='row'>
        {this.state.nfts.map( (nft, index) => (
            <div key={index} className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12">
                <div className="nft__item">
                    { nft.deadline &&
                        <div className="de_countdown">
                            <Clock deadline={nft.deadline} />
                        </div>
                    }
                    <div className="author_list_pp">
                        <span onClick={()=> window.open(nft.authorLink, "_self")}>                                    
                            <img className="lazy" src={nft.authorImg} alt=""/>
                            <i className="fa fa-check"></i>
                        </span>
                    </div>
                    <div className="nft__item_wrap" style={{height: `${this.state.height}px`}}>
                      <Outer>
                        <span>
                            <img onLoad={this.onImgLoad} src={nft.previewImg} className="lazy nft__item_preview" alt=""/>
                        </span>
                      </Outer>
                    </div>
                    <div className="nft__item_info">
                        <span onClick={()=> window.open(nft.nftLink, "_self")}>
                            <h4>{nft.title}</h4>
                        </span>
                        <div className="nft__item_description"> 
                            <span>{nft.description}</span>
                        </div>
                        <div className="nft__item_price">
                            {nft.price}<span>{nft.bid}</span>
                        </div>
                        <div className="nft__item_action">
                            <span onClick={()=> window.open(nft.bidLink, "_self")}>Place a bid</span>
                        </div>
                        <div className="nft__item_like">
                            <i className="fa fa-heart"></i><span>{nft.likes}</span>
                        </div>                            
                    </div> 
                </div>
            </div>  
        ))}
        
    </div>              
    );}
}