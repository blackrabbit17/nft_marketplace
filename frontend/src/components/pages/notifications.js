import axios from "axios";
import React, { useEffect, useState } from 'react';
import { createGlobalStyle } from 'styled-components';
import { useNavigate } from "@reach/router";
import { useSelector } from "react-redux";

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
`;

const Notifications = () => {

  const navigate = useNavigate();

  const navigationClicked = (evt) => {
      navigate(evt.target.id);
  };

  const profile = useSelector((state) => state.profile.profile);

  const [notifications, setNotifications] = useState([]);

  const loadNotifications = () => {
    
    axios.get("/api/1.0/User/UserNotification/").then((resp) => {
      setNotifications(resp.data.payload);
      console.log(resp.data.payload);
    });

  }

  useEffect(() => {
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <GlobalStyles />

      <section id='profile_banner' className='jumbotron breadcumb no-bg' style={{backgroundImage: `url(${profile.banner_img})`}}>
        <div className='mainbreadcumb'/>
      </section>

      <section className="container">
        <div className='row'>
          <div className='col-lg-12'>
              <div className="items_filter">
                <ul className="de_nav text-center ">
                    <li className="settings_menu"><span id="/settings/" onClick={navigationClicked}>Settings</span></li>
                    <li className="active settings_menu"><span id="/notifications/">Notifications</span></li>
                    <li className="settings_menu"><span id="/escrow/" onClick={navigationClicked}>Escrow</span></li>
                    <li className="settings_menu"><span id="/security/" onClick={navigationClicked}>Security</span></li>
                </ul>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Notifications;