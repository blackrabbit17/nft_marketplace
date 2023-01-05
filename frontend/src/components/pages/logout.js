import axios from "axios";
import React, { useEffect } from 'react';
import Footer from '../components/footer';

import { setProfile } from "../../store/actions/profileActions"
import { useDispatch } from "react-redux"
import { useNavigate } from "@reach/router"


const Logout = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const logoutUser = () => {
        axios.get("/api/1.0/logout_token").then((resp) => {
            dispatch(setProfile(null));
            localStorage.setItem('profile', null);
            navigate("/");
        }).catch(err => {

          // TODO: Whatever error mechanism we sign up to, we need to log this error
          //       to their API
          console.log(err);

          dispatch(setProfile(null));
          localStorage.setItem('profile', null);
          navigate("/");
      });
    }

    useEffect(() => {
        logoutUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

    return (<div>
  
        <section className='jumbotron breadcumb no-bg' style={{backgroundImage: `url(${'/static/img/background/bg-shape-1.jpg'})`}}>
          <div className='mainbreadcumb'>
            <div className='container'>
              <div className='row m-10-hor'>
                <div className='col-12'>
                  <h1 className='text-center text-dark'>Logout</h1>
                </div>
              </div>
            </div>
          </div>
        </section>
  
        <section className='container text-center'>
            <p>Please wait a moment, you are being logged out...</p>
        </section>

        <Footer />
      </div>)
};

export default Logout;
