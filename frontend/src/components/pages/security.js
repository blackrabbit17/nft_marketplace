import React, { useEffect, useState } from 'react';
import { createGlobalStyle } from 'styled-components';
import { useNavigate } from "@reach/router";
import axios from "axios";
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
  .small_dt {
    font-size:10px;
  }
`;

const Security = () => {

  const navigate = useNavigate();
  const profile = useSelector((state) => state.profile.profile);

  const navigationClicked = (evt) => {
      navigate(evt.target.id);
  };

  const [securityEvents, setSecurityEvents] = useState([]);

  const loadEvents = () => {

    axios.get("/api/1.0/web/security_events/").then((resp) => {
      setSecurityEvents(resp.data.payload);
    });

  };

  useEffect(() => {
    loadEvents();
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
          <div className='col-lg-3'>
            <div className="items_filter">
              <ul className="de_nav text-center ">
                  <li className="settings_menu"><span id="/settings/" onClick={navigationClicked}>Settings</span></li>
                  <li className="settings_menu"><span id="/notifications/" onClick={navigationClicked}>Notifications</span></li>
                  <li className="settings_menu"><span id="/escrow/" onClick={navigationClicked}>Escrow</span></li>
                  <li className="active settings_menu"><span id="/security/">Security</span></li>
              </ul>
            </div>
          </div>
          <div className="col-lg-9">
              <table className="table de-table table-rank">
                <thead>
                  <tr>
                    <th scope="col">Event At</th>
                    <th scope="col">Event type</th>
                    <th scope="col">Network</th>
                    <th scope="col">Info</th>
                  </tr>
                </thead>
                <tbody>

                {securityEvents.map( (event, index) => (
                  <tr key={index}>
                    <td>
                      {event.created_at_human}<br/>
                      <span className="small_dt">{event.created_at}</span>
                    </td>
                    <td>{event.event_type_human}</td>
                    <td>Remote IP: {event.remote_ip}</td>
                    <td>{event.meta}</td>
                  </tr>
                ))}

                </tbody>
              </table>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Security;