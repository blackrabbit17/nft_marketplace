import axios from "axios"
import React, { useEffect, useState } from 'react';
import Footer from '../components/footer';
import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  header#myHeader.navbar.sticky {
    background: #fff;
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
`;


const Activity = () => {

  /* UI State Management */

  const [reset, setReset] = React.useState(true);
  const [filteredSales, setFilteredSales] = React.useState(false);
  const [filteredLikes, setFilteredLikes] = React.useState(false);
  const [filteredOffers, setFilteredOffers] = React.useState(false);
  const [filteredFollowings, setFilteredFollowings] = React.useState(false);

  const disableState = () => {
    setReset(false);
    setFilteredSales(false);
    setFilteredLikes(false);
    setFilteredOffers(false);
    setFilteredFollowings(false);
    document.getElementById("follow").classList.remove("active");
    document.getElementById("sale").classList.remove("active");
    document.getElementById("offer").classList.remove("active");
    document.getElementById("like").classList.remove("active");
  }

  const resetClicked = () => {
    disableState();
    setReset(true);
  };

  const filerBySalesClicked = () => {
    disableState();
    setFilteredSales(true);
    document.getElementById("sale").classList.add("active");
  };

  const filterByLikesClicked = () => {
    disableState();
    setFilteredLikes(true);
    document.getElementById("like").classList.add("active");
  };

  const filterByOffersClicked = () => {
    disableState();
    setFilteredOffers(true);
    document.getElementById("offer").classList.add("active");
  };

  const filterByFollowingsClicked = () => {
    disableState();
    setFilteredFollowings(true);
    document.getElementById("follow").classList.add("active");
  };

  /* Data Management */

  const [activity, setActivity] = useState([]);

  const fetchActivity = async() => {
    const resp = await axios.get("/api/1.0/web/activity_feed").catch((err) => { console.log(err); });
    setActivity(resp.data.payload);
  }

  useEffect(() => {
    fetchActivity();
  }, []);

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

  /* 
      nft.activity_type:
      1 : MINT
      2 : SALE
      3 : TRANSFER
      4 : OFFER
      5 : FAV
      6 : FOLLOW
  */

  return (
    <div>
      <GlobalStyles/>

      <section className='jumbotron breadcumb no-bg' style={{backgroundImage: `url(${'/static/img/background/bg-shape-1.jpg'})`}}>
        <div className='mainbreadcumb'>
          <div className='container'>
            <div className='row m-10-hor'>
              <div className='col-12 text-center'>
                <h1 className='text-dark'>Activity</h1>
                <p className="text-dark">Anim pariatur cliche reprehenderit</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className='container'>
        <div className='row'>
          <div className="col-md-8">
            <ul className="activity-list">
              {activity.map( (itemact, index) => {
                  return (
                    <React.Fragment key={itemact.id}>
                      { (reset || filteredSales) && itemact.activity_type === 2 &&
                        <li className="act_sale">
                            <img className="lazy" src={itemact.nft.image_preview_url} alt=""/>
                            <div className="act_list_text">
                                <h4>{itemact.title}</h4>
                              1 edition purchased by <span className='color'>Stacy Long</span>
                                <span className="act_list_date">
                                  {itemact.created_at_human}
                                </span>
                            </div>
                        </li>
                      }

                      { (reset || filteredOffers) && itemact.activity_type === 4 &&
                        <li className="act_offer">
                            <img className="lazy" src={itemact.nft.image_preview_url} alt=""/>
                            <div className="act_list_text">
                                <h4>{itemact.nft.title}</h4>
                              <span className='color'>{profile_display(itemact.linked_offer.offered_by)}</span> offered {itemact.linked_offer.price_formatted} {itemact.linked_offer.offer_currency_symbol}
                                <span className="act_list_date">
                                  {itemact.created_at_human}
                                </span>
                            </div>
                        </li>
                      }

                      { (reset || filteredLikes) && itemact.activity_type === 5 &&
                        <li className="act_like">
                            <img className="lazy" src={itemact.user_to.author_img} alt=""/>
                            <div className="act_list_text">
                                <h4>{itemact.nft.title}</h4>
                              liked by <span className='color'>{profile_display(itemact.linked_fav.profile)}</span>
                                <span className="act_list_date">
                                  {itemact.created_at_human}
                                </span>
                            </div>
                        </li>
                      }

                      { (reset || filteredFollowings) && itemact.activity_type === 6 &&

                        <li className="act_follow">
                          <img className="lazy" src={itemact.user_from.author_img} alt=""/>
                          <div className="act_list_text">
                              <h4>{profile_display(itemact.user_from)}</h4>
                              started following <span className='color'>{profile_display(itemact.user_to)}</span>
                              <span className="act_list_date">
                                  {itemact.created_at_human}
                              </span>
                          </div>
                        </li>
                      }
                    </React.Fragment>
                  )
                })
              }
              
            </ul>
          </div>
          <div className="col-md-4">
              <span className="filter__l">Filter</span>
              <span className="filter__r" onClick={resetClicked}>Reset</span>
              <div className="spacer-half"></div>
              <div className="clearfix"></div>
              <ul className="activity-filter">
                  <li id='sale' className="filter_by_sales" onClick={filerBySalesClicked}><i className="fa fa-shopping-basket"></i>Sales</li>
                  <li id='like' className="filter_by_likes" onClick={filterByLikesClicked}><i className="fa fa-heart"></i>Likes</li>
                  <li id='offer' className="filter_by_offers" onClick={filterByOffersClicked}><i className="fa fa-gavel"></i>Offers</li>
                  <li id='follow' className="filter_by_followings" onClick={filterByFollowingsClicked}><i className="fa fa-check"></i>Followings</li>
              </ul>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Activity;