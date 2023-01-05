import React, { useEffect, useState } from 'react';
import { createGlobalStyle } from 'styled-components';
import { useNavigate } from "@reach/router";
import axios from "axios";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux"
import { setProfile } from "../../store/actions/profileActions"


const GlobalStyles = createGlobalStyle`
  header#myHeader.navbar.white {
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
  .settings_menu {
    display: block !important;
    width:200px;
    margin-top:5px;
  }
  #message_verified {
    margin-top:24px;
    padding: 8px;
  }
  #message_verified p {
    margin:0;
  }
  .prof_pic {
    margin:0 auto;
  }
  .d-create-file {
    border:none;
    padding:10px;
  }
  
  .profile-pic-upload {
    position:absolute;
    bottom:0;
    right:0;
    font-size:10px;
  }

  #upload_profile {
    position:absolute;
    top:0;
    left:0;
    right:0;
    bottom:0;
    opacity:0;
  }

  #profilePic {
    height:150px;
    width: 150px;
    border-radius:75px;
    background-size: 100% auto;
    position:relative;
  }
`;

const UserSettings = () => {

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const navigationClicked = (evt) => {
    navigate(evt.target.id);
  };

  /* Form input */
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const [bio, setBio] = useState('');
  const [twitter, setTwitter] = useState('');
  const [insta, setInsta] = useState('');
  const [website, setWebsite] = useState('');

  const [backgroundBannerChanged, setBackgroundBannerChanged] = useState(false);
  const [newBgBanner, setNewBgBanner] = useState('');

  const [profileImgChanged, setProfileImgChanged] = useState(false);
  const [newProfilePic, setNewProfilePic] = useState('');

  const loadProfile = () => {
    axios.post("/api/1.0/User/Profile/", {'address': 'me'}).then((resp) => {

      var loadedProfile = resp.data.payload.profile;
      console.log(loadedProfile);

      setUsername(loadedProfile.username);
      setEmail(loadedProfile.email_address);
      setEmailConfirmed(loadedProfile.email_confirmed);
      setBio(loadedProfile.bio);
      setTwitter(loadedProfile.twitter);
      setInsta(loadedProfile.insta);
      setWebsite(loadedProfile.website);

      const prof_image = document.getElementById('profilePic');
      prof_image.style["background-image"] = "url('" + loadedProfile.author_img + "')";

      const banner_img = document.getElementById('profile_banner');

      if(loadedProfile.banner_img === null) {
        banner_img.style["background-image"] = "url('/static/img/author_single/author_banner.jpg')";
      }
      else {
        banner_img.style["background-image"] = "url('" + loadedProfile.banner_img + "')";
      }

    });
  };

  const saveClicked = () => {

    var payl = {
      'username': username,
      'email': email,
      'bio': bio,
      'twitter': twitter,
      'insta': insta,
      'website': website
    }

    if(backgroundBannerChanged) {
      payl['banner-img'] = newBgBanner;
    }

    if(profileImgChanged) {
      payl['profile-img'] = newProfilePic;
    }

    axios.post("/api/1.0/User/Profile/Update/", payl).then((resp) => {
      dispatch(setProfile(resp.data.payload));
      localStorage.setItem('profile', JSON.stringify(resp.data.payload));
      toast('Profile Updated!');
    }).catch(err => {
      console.error(err.message);
    });
  }

  const uploadBannerChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.addEventListener("load", function () {
        const prev = document.getElementById('profile_banner');
        prev.style["background-image"] = "url('" + this.result + "')";

        setBackgroundBannerChanged(true);
        setNewBgBanner(this.result);
      });
    }
  }

  const uploadProfileChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.addEventListener("load", function () {
        const prev = document.getElementById('profilePic');
        prev.style["background-image"] = "url('" + this.result + "')";

        setProfileImgChanged(true);
        setNewProfilePic(this.result);
      });
    }
  }

  const websiteBlur = (event) => {
    if(!event.target.value.startsWith('http://') && !event.target.value.startsWith('https://')) {
      setWebsite('https://' + event.target.value);
    }
  }

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <GlobalStyles />

      <section id='profile_banner' className='jumbotron breadcumb no-bg'>
        <div className='mainbreadcumb'/>

        <div className="d-create-file">
            <div className='browse'>
              <input type="button" className="btn-main" value="Upload image"/>
              <input id='upload_file' type="file" accept="image/*" onChange={uploadBannerChange} />
            </div>
        </div>


      </section>

      <section className="container">
        <div className='row'>
          <div className='col-lg-3'>
              <div className="items_filter">
                <ul className="de_nav text-center ">
                    <li className="active settings_menu"><span id="/settings/">Settings</span></li>
                    <li className="settings_menu"><span id="/notifications/" onClick={navigationClicked}>Notifications</span></li>
                    <li className="settings_menu"><span id="/escrow/" onClick={navigationClicked}>Escrow</span></li>
                    <li className="settings_menu"><span id="/security/" onClick={navigationClicked}>Security</span></li>
                </ul>
            </div>
          </div>
          <div className='col-lg-9'>
            <div>
              
                <div className="row">

                    <div className="col-md-9">
                        <div className="field-set">
                            <label>Username</label>
                            <input type='text' name='username' id='username' value={username || ''} onChange={(evt) => setUsername(evt.target.value)} className="form-control"/>
                        </div>
                    </div>

                    <div className="col-md-3">
                        <div id="profilePic">
                          <div className="d-create-file profile-pic-upload">
                            <div className="profile_browse">
                              <input type="button" className="btn-main" value="Upload"/>
                              <input id='upload_profile' type="file" accept="image/*" onChange={uploadProfileChange} />
                            </div>
                          </div>
                        </div>
                    </div>
                </div>

                <div className="spacer-50"></div>

                <div className="row">    

                    <div className="col-md-9">
                        <div className="field-set">
                            <label>Email Address</label>
                            <input type='text' name='email' id='email' value={email || ''} onChange={(evt) => setEmail(evt.target.value)} className="form-control"/>
                        </div>
                    </div>

                    <div className="col-md-3">
                        <div className="field-set">
                          { !emailConfirmed &&
                            <>
                              <label>Email Not Verified</label>
                              <input type='button' className="btn-main" value="Send code"/>
                            </>
                          }

                          { emailConfirmed &&
                            <>
                              <div id="message_verified" className="alert alert-success text-center" role="alert">
                                <p>✔ Verified</p>
                              </div>
                            </>
                          }
                        </div>
                    </div>

                    <div className="col-md-12">
                        <div className="field-set">
                        <label>Bio</label>
                            <textarea className="form-control" value={bio || ''} onChange={(evt) => setBio(evt.target.value)} ></textarea>
                        </div>
                    </div>

                </div>

                <div className="spacer-30"></div>

                <div className="row">    

                  <div className="col-md-12">
                      <div className="field-set">
                          <label>Twitter</label>
                          <input type='text' name='twitter' id='twitter' value={twitter || ''} onChange={(evt) => setTwitter(evt.target.value)} className="form-control"/>
                      </div>
                  </div>

                  <div className="col-md-12">
                      <div className="field-set">
                          <label>Instagram</label>
                          <input type='text' name='insta' id='insta' value={insta || ''} onChange={(evt) => setInsta(evt.target.value)} className="form-control"/>
                      </div>
                  </div>

                  <div className="col-md-12">
                      <div className="field-set">
                          <label>Website</label>
                          <input type='text' name='website' id='website' value={website || ''} onChange={(evt) => setWebsite(evt.target.value)} onBlur={websiteBlur} className="form-control"/>
                      </div>
                  </div>

                  <div className="col-md-12">
                    <button onClick={saveClicked} className=" btn-main">Save</button>
                  </div>

                </div>

            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default UserSettings;