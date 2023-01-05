import { useEffect, useState } from "react";
import ColumnNew from '../components/ColumnNew';
import Footer from '../components/footer';
import { createGlobalStyle } from 'styled-components';
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux"
import { Link } from '@reach/router';


const GlobalStyles = createGlobalStyle`
  header#myHeader.navbar.white {
    background: #fff;
  }
  @media only screen and (max-width: 1199px) {
    .navbar{
      background: #403f83;
    }
    .navbar .menu-line, .navbar .menu-line1, .navbar .menu-line2{
      background: #111;
    }
    .item-dropdown .dropdown a{
      color: #111 !important;
    }
  }
  .empty_container {
    margin-top:200px;
    margin-bottom:200px;
    font-size:24px;
  }

  .create_btn {
    margin: 0 auto;
  }

  #wallet {
    font-size:16px;
    color: #727272;
    cursor:pointer;
  }

  .social_icons {
    color: #727272;
    margin-top:4px;
  }

  .social_icons i {
    cursor:pointer;
  }

  .social_icons i:hover {
    cursor:pointer;
    color:#8364e2;
  }
  
  .profile_follow {
    font-size:16px;
    color: #727272;
  }

  .bio_text {
    padding-left:40px;
  }

  .follow-button {
    padding:2px 8px;
    font-size:12px;

  }

  .prof_verified {
    background-color: #8364e2;
    width:24px;
    height:24px;
    color: white;
    padding:4px;
    border-radius: 12px;
    position:relative;
    right:30px;
    top:120px;
  }

`;


const ProfilePage = () => {

  const [profile, setProfile] = useState({});

  const [saleTab, setSaleTab] = useState(true);
  const [createdTab, setCreatedTab] = useState(false);
  const [ownTab, setOwnTab] = useState(false);
  const [likedTab, setLikedTab] = useState(false);

  const [NFTsOnSale, setNFTsOnSale] = useState([]);
  const [NFTsCreated, setNFTsCreated] = useState([]);
  const [NFTsOwned, setNFTsOwned] = useState([]);
  const [NFTsFavd, setNFTsFavd] = useState([]);
  const [followedCount, setFollowedCount] = useState(0);
  const [followerCount, setFollowerCount] = useState(0);
  const [userIsFollowing, setUserIsFollowing] = useState(false);

  const [amLookingAtOwnProfile, setAmLookingAtOwnProfile] = useState(false);

  const loggedInProfile = useSelector((state) => state.profile.profile); /* is null if not logged in */

  const saleTabBtnClick = () => {
    setSaleTab(true);
    setCreatedTab(false);
    setOwnTab(false);
    setLikedTab(false);
    document.getElementById("saleTabBtn").classList.add("active");
    document.getElementById("createdTabBtn").classList.remove("active");
    document.getElementById("ownTabBtn").classList.remove("active");
    document.getElementById("likedTabBtn").classList.remove("active");
  };

  const createdTabBtnClick = () => {
    setCreatedTab(true);
    setSaleTab(false);
    setOwnTab(false);
    setLikedTab(false);
    document.getElementById("createdTabBtn").classList.add("active");
    document.getElementById("saleTabBtn").classList.remove("active");
    document.getElementById("ownTabBtn").classList.remove("active");
    document.getElementById("likedTabBtn").classList.remove("active");
  };

  const ownTabBtnClick = () => {
    setOwnTab(true);
    setSaleTab(false);
    setCreatedTab(false);
    setLikedTab(false);
    document.getElementById("ownTabBtn").classList.add("active");
    document.getElementById("saleTabBtn").classList.remove("active");
    document.getElementById("createdTabBtn").classList.remove("active");
    document.getElementById("likedTabBtn").classList.remove("active");
  };

  const likedTabBtnClick = () => {
    setLikedTab(true);
    setSaleTab(false);
    setCreatedTab(false);
    setOwnTab(false);
    document.getElementById("likedTabBtn").classList.add("active");
    document.getElementById("saleTabBtn").classList.remove("active");
    document.getElementById("createdTabBtn").classList.remove("active");
    document.getElementById("ownTabBtn").classList.remove("active");
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(profile.address);
    toast('Address copied!');
  };

  const loadProfile = async() => {

    /* Wallet address = 0x314114 or "me" */
    const wallet_address = window.location.pathname.split('/')[2];

    axios
    .post("/api/1.0/User/Profile/", {'address': wallet_address})
    .then((res) => {

      const banner_img = document.getElementById('profile_banner');
      if(res.data.payload.profile.banner_img === null) {
        banner_img.style["background-image"] = "url('/static/img/author_single/author_banner.jpg')";
      }
      else {
        banner_img.style["background-image"] = "url('" + res.data.payload.profile.banner_img + "')";
      }

      setProfile(res.data.payload.profile);
      setNFTsOnSale(res.data.payload.nftsOnSale);
      setNFTsCreated(res.data.payload.nftsCreated);
      setNFTsOwned(res.data.payload.nftsOwned);
      setNFTsFavd(res.data.payload.nftsFavd);
      setFollowerCount(res.data.payload.profile.follower_count);
      setFollowedCount(res.data.payload.profile.following_count);
      setUserIsFollowing(res.data.payload.userHasFollowed);
      setAmLookingAtOwnProfile(loggedInProfile !== null && res.data.payload.profile.address === loggedInProfile.address);

    })
    .catch(err => {
      if(err.message === 'No user with this address found') {
        toast('User with this wallet address does not exist');
      }
      else {
        toast('Error: Backend system unavailable, please try again in a few minutes');
        console.error(err);
      }
    })
  }

  const followClicked = () => {
    
    const wallet_address = window.location.pathname.split('/')[2];
    var payl = {'destination': wallet_address};

    if(userIsFollowing) {
      setFollowerCount(followerCount - 1);
      payl['method'] = 'UNFOLLOW'
    }
    else {
      setFollowerCount(followerCount + 1);
      payl['method'] = 'FOLLOW'
    }

    setUserIsFollowing(!userIsFollowing);

    axios
    .post("/api/1.0/User/Follow/", payl)
    .then((res) => {
      
    })
    .catch(err => {
      toast('Error: Backend system unavailable, please try again in a few minutes');
      console.error(err);
    })

  }

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
    <div>
    
      <GlobalStyles/>
    
      <section id='profile_banner' className='jumbotron breadcumb no-bg'>
          <div className='mainbreadcumb'/>
      </section>
    
      <section className='container no-bottom'>
        <div className='row'>
          <div className="col-md-12">
             <div className="d_profile de-flex">
                  <div className="de-flex-col">
                      <div className="profile_avatar">
                          <img src={profile.author_img} alt="Profile Pic"/>
                          
                          {profile.verified && 
                            <div className="fa fa-check prof_verified"></div>
                          }
                          <div className="profile_name">
                              <h4>
                                { profile.username === null &&
                                  <>
                                    <div className="profile_username" onClick={copyAddress}>{profile.address}</div>
                                  </>
                                }
                                { profile.username !== null &&
                                  <>
                                    <div className="profile_username">{profile.username}</div>
                                    <div id="wallet" onClick={copyAddress}>{profile.address}</div>
                                    
                                  </>
                                }

                                <div className="profile_follow de-flex">
                                  <div className="de-flex-col">
                                      <div className="profile_following">{followedCount} following</div>
                                      <div className="profile_follower">
                                        {followerCount === 1 && 
                                        <>{followerCount} follower</>
                                        } 
                                        {followerCount !== 1 && 
                                        <>{followerCount}  followers</>
                                        } 
                                        </div>
                                      
                                      {loggedInProfile !== null && profile.address !== loggedInProfile.address && 
                                        <button className="btn-main follow-button" onClick={followClicked}>
                                          { userIsFollowing && 
                                            <>Stop following</>
                                          }
                                          { !userIsFollowing && 
                                            <>Follow</>
                                          }

                                        </button>
                                      }
                                  </div>
                                </div>

                                <div className="social_icons">
                                  { profile.twitter !== null &&
                                    <i className="fa fa-fw" aria-hidden="true" title="Twitter" onClick={()=> window.open("http://twitter.com/" + profile.twitter, "_blank")}></i>
                                  }

                                  { profile.insta !== null && 
                                    <i className="fa fa-fw" aria-hidden="true" title="Instagram" onClick={()=> window.open("http://instagram.com/" + profile.insta, "_blank")}></i>
                                  }

                                  { profile.website !== null && 
                                    <i className="fa fa-fw" aria-hidden="true" title="Website" onClick={()=> window.open(profile.website, "_blank")}></i>
                                  }
                                </div>



                              </h4>
                          </div>
                      </div>
                      
                  </div>

                  {profile.bio !== null && 
                    <div className="profile_follow de-flex">
                      <div className="de-flex-col">

                        <p className="bio_text">{profile.bio}</p>
                      </div>
                    </div>
                  }
    
              </div>
          </div>
        </div>

        

      </section>
    
      <section className='container no-top'>
            <div className='row'>
              <div className='col-lg-12'>
                  <div className="items_filter">
                    <ul className="de_nav text-center">
                        <li id='saleTabBtn' className="active"><span onClick={saleTabBtnClick}>On Sale {NFTsOnSale.length > 0 && <>({NFTsOnSale.length})</>}</span></li>
                        <li id='createdTabBtn' className=""><span onClick={createdTabBtnClick}>Created {NFTsCreated.length > 0 && <>({NFTsCreated.length})</>}</span></li>
                        <li id='ownTabBtn' className=""><span onClick={ownTabBtnClick}>Own {NFTsOwned.length > 0 && <>({NFTsOwned.length})</>}</span></li>
                        <li id='likedTabBtn' className=""><span onClick={likedTabBtnClick}>Liked {NFTsFavd.length > 0 && <>({NFTsFavd.length})</>}</span></li>
                    </ul>
                </div>
              </div>
            </div>
          {saleTab && (  
            <div id='saleTabDisplay' className='onStep fadeIn'>
              
              {NFTsOnSale.length === 0 && 
                <>
                  {amLookingAtOwnProfile && 
                  <div className='widget empty_container text-center'>
                    <p>You haven't got any NFTs on sale yet</p>
                  </div>  
                  }
                  {!amLookingAtOwnProfile && 
                  <div className='widget empty_container text-center'>
                    <p>This user has no NFTs on sale</p>
                  </div>  
                  }
                </>
              }

              {NFTsOnSale.length > 0 && 
                <ColumnNew nfts={NFTsOnSale}/>
              }
              
            </div>
          )}
          {createdTab && ( 
            <div id='createdTabDisplay' className='onStep fadeIn'>

              {NFTsCreated.length === 0 && 
                <>
                  {amLookingAtOwnProfile && 
                  <div className='widget empty_container text-center'>
                    <p>You haven't created any NFTs yet<br/><br/><Link to="/createNFT" className="btn-main create_btn">Create one!</Link></p>
                  </div>  
                  }
                  {!amLookingAtOwnProfile && 
                  <div className='widget empty_container text-center'>
                    <p>This user has not created any NFTs</p>
                  </div>  
                  }
                </>
              }

              {NFTsCreated.length > 0 && 
                <ColumnNew nfts={NFTsCreated}/>
              }

            </div>
          )}
          {ownTab && ( 
            <div id='ownTabDisplay' className='onStep fadeIn'>

              {NFTsOwned.length === 0 && 
                <>
                  {amLookingAtOwnProfile && 
                  <div className='widget empty_container text-center'>
                    <p>You dont own any NFTs yet<br/><br/><Link to="/explore/search" className="btn-main create_btn">Explore NFTs for sale!</Link></p>
                  </div>  
                  }
                  {!amLookingAtOwnProfile && 
                  <div className='widget empty_container text-center'>
                    <p>This user does not own any NFTs</p>
                  </div>  
                  }
                </>
              }

              {NFTsOwned.length > 0 && 
                <ColumnNew nfts={NFTsOwned}/>
              }
            </div>
          )}
          {likedTab && ( 
            <div id='likedTabDisplay' className='onStep fadeIn'>

              {NFTsFavd.length === 0 && 
                <>
                  {amLookingAtOwnProfile && 
                  <div className='widget empty_container text-center'>
                    <p>You have not liked any NFTs yet<br/><br/><Link to="/explore/search" className="btn-main create_btn">Explore NFTs</Link></p>
                  </div>  
                  }
                  {!amLookingAtOwnProfile && 
                  <div className='widget empty_container text-center'>
                    <p>This user has not liked any NFTs</p>
                  </div>  
                  }
                </>
              }

              {NFTsFavd.length > 0 && 
                <ColumnNew nfts={NFTsFavd}/>
              }
            </div>
          )}
      </section>
    
      <Footer />
    </div> 
    </>
  );
}

export default ProfilePage;