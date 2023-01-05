import React, { Component } from "react";
import Slider from "react-slick";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

class CustomSlide extends Component {
  render() {
    const { index, ...props } = this.props;
    return (
      <div {...props}></div>
    );
  }
}

export default class Responsive extends Component {
  render() {
    var settings = {
      infinite: false,
      speed: 500,
      slidesToShow: 4,
      slidesToScroll: 1,
      initialSlide: 0,
      responsive: [
        {
          breakpoint: 1900,
          settings: {
            slidesToShow: 4,
            slidesToScroll: 1,
            infinite: true
          }
        },
        {
          breakpoint: 1600,
          settings: {
            slidesToShow: 4,
            slidesToScroll: 1,
            infinite: true
          }
        },
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: 3,
            slidesToScroll: 1,
            infinite: true
          }
        },
        {
          breakpoint: 600,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 1,
            initialSlide: 2
          }
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
            dots: true
          }
        }
      ]
    };
    return (
        <div className='nft'>
          <Slider {...settings}>
            <CustomSlide className='itm' index={1}>
                <div className="nft_coll">
                    <div className="nft_wrap">
                        <span><img src="/static/img/news/news-1.jpg" className="lazy img-fluid" alt=""/></span>
                    </div>
                    <div className="nft_coll_info mt-3">
                        <span onClick={()=> window.open("/home", "_self")}><h4>The next big trend in crypto</h4></span>
                    </div>
                </div>
            </CustomSlide>

            <CustomSlide className='itm' index={2}>
                <div className="nft_coll">
                    <div className="nft_wrap">
                        <span><img src="/static/img/news/news-2.jpg" className="lazy img-fluid" alt=""/></span>
                    </div>
                    <div className="nft_coll_info mt-3">
                        <span onClick={()=> window.open("/home", "_self")}><h4>The next big trend in crypto</h4></span>
                    </div>
                </div>
            </CustomSlide>

            <CustomSlide className='itm' index={3}>
                <div className="nft_coll">
                    <div className="nft_wrap">
                        <span><img src="/static/img/news/news-3.jpg" className="lazy img-fluid" alt=""/></span>
                    </div>
                    <div className="nft_coll_info mt-3">
                        <span onClick={()=> window.open("/home", "_self")}><h4>The next big trend in crypto</h4></span>
                    </div>
                </div>
            </CustomSlide>

            <CustomSlide className='itm' index={4}>
                <div className="nft_coll">
                    <div className="nft_wrap">
                        <span><img src="/static/img/news/news-4.jpg" className="lazy img-fluid" alt=""/></span>
                    </div>
                    <div className="nft_coll_info mt-3">
                        <span onClick={()=> window.open("/home", "_self")}><h4>The next big trend in crypto</h4></span>
                    </div>
                </div>
            </CustomSlide>

            <CustomSlide className='itm' index={5}>
                <div className="nft_coll">
                    <div className="nft_wrap">
                        <span><img src="/static/img/news/news-5.jpg" className="lazy img-fluid" alt=""/></span>
                    </div>
                    <div className="nft_coll_info mt-3">
                        <span onClick={()=> window.open("/home", "_self")}><h4>The next big trend in crypto</h4></span>
                    </div>
                </div>
            </CustomSlide>

            <CustomSlide className='itm' index={6}>
                <div className="nft_coll">
                    <div className="nft_wrap">
                        <span><img src="/static/img/news/news-6.jpg" className="lazy img-fluid" alt=""/></span>
                    </div>
                    <div className="nft_coll_info mt-3">
                        <span onClick={()=> window.open("/home", "_self")}><h4>The next big trend in crypto</h4></span>
                    </div>
                </div>
            </CustomSlide>

          </Slider>
        </div>
    );
  }
}
