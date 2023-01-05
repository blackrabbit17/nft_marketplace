import axios from "axios";

import React, { useState } from 'react';
import { Link } from '@reach/router';

import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  #btn-subscribe { cursor:pointer; }
`;


const Footer = () => {

    const [newsletter, setNewsletter] = useState('');
    const newsletterChange = (e) => setNewsletter(e.target.value);

    const [emailOK, setEmailOK] = useState(false);
    const [emailErr, setEmailErr] = useState(false);

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            submit();
        }
    }

    const submit = () => {
        axios.post("/api/1.0/web/newsletter_sub", {'email': newsletter})
        .then((subscribe_result) => {
            setEmailOK(true);
            setEmailErr(false);
            setNewsletter('');
        })
        .catch(error => {
            setEmailOK(false);
            setEmailErr(true);
        });
    }

    return (
        
        <footer className="footer-light">
          <GlobalStyles />

        <div className='container'>
            <div className="row">
                <div className ='col-lg-12 col-md-12 col-sm-12 col-xs-1'>
                    <div className='widget mb-0 text-center'>
                        <img src="/static/img/footer logo.png" className="align-center" alt=""/>
                        <p>The world's first NFT services and cryptocontracts. The future of commerce.</p>
                    </div>               
                </div>
            </div>
        </div>

          <div className='container'>
            <div className="row">
                 <div className="col-lg-6 col-md-12 col-sm-12 col-xs-1">
                      <div className="widget">
                          <h5 className='text-white mb-0'>Stay up to date.</h5>
                          <p className='mb-2'>with our latest news, feature releases to keep with the latest trends.</p>
                          <div className="row form-dark" id="form_subscribe" method="post" name="form_subscribe">
                              <div className="col text-center">
                                  <input className="form-control" value={newsletter} onKeyDown={handleKeyDown} onChange={newsletterChange} placeholder="Enter email..." name="txt_subscribe" type="text" /> 
                                  <div id="btn-subscribe" onClick={submit}>
                                      <i className="arrow_right bg-color-secondary"></i>
                                  </div>

                                  <div className="clearfix"></div>
                                  {emailOK &&
                                    <div id="message_success" className="alert alert-success" role="alert">
                                      <h4 className="alert-heading">Subscribed!</h4>
                                      <p>Your email is safe with us. We don't spam.</p>
                                    </div>
                                  }

                                  {emailErr &&
                                    <div id="message_error" className="alert alert-danger" role="alert">
                                      <h4 className="alert-heading">Error</h4>
                                      <p>Invalid email, please check the address for typos</p>
                                    </div>
                                  }
                              </div>
                          </div>
                      </div>
                  </div>
                                  <div className="col-lg-6 col-md-12 col-sm-12 col-xs-1">
                                        <div className="widget">
                                            <h5 className='text-white mb-0'>Join the community.</h5>
                                                <p className='mb-2'>with our latest news, feature releases to keep with the latest trends.</p>
                                                    <div className="de-flex">
                                                        <div className="de-flex-col">
                                                            <div className="social-icons">
                                                                <span onClick={()=> window.open("")}><i className="fa fa-facebook fa-lg"></i></span>
                                                                <span onClick={()=> window.open("https://twitter.com/PactumX")}><i className="fa fa-twitter fa-lg"></i></span>
                                                                <span onClick={()=> window.open("")}><i className="fa fa-linkedin fa-lg"></i></span>
                                                                <span onClick={()=> window.open("")}><i className="fa fa-pinterest fa-lg"></i></span>
                                                                <span onClick={()=> window.open("")}><i className="fa fa-rss fa-lg"></i></span>
                                                            </div>
                                                        </div>
                                                    </div>
                                         </div>
                                  </div>


                </div>
          </div>

          <div className="container">
              <div className="row">
                  <div className="col-md-3 col-sm-6 col-xs-1">
                      <div className="widget">
                          <h5 className='text-white'>Marketplace</h5>
                          <ul>
                              <li><Link to="/explore/search">All NFTs</Link></li>
                              <li><Link to="/explore/art">Art</Link></li>
                              <li><Link to="/explore/music">Music</Link></li>
                              <li><Link to="/explore/domains">Domain Names</Link></li>
                              <li><Link to="/explore/virtual">Virtual World</Link></li>
                              <li><Link to="/explore/collectables">Collectibles</Link></li>
                          </ul>
                      </div>
                  </div>
                  <div className="col-md-3 col-sm-6 col-xs-1">
                      <div className="widget">
                          <h5 className='text-white'>Resources</h5>
                          <ul>
                              <li><Link to="/helpcenter">Help Center</Link></li>
                              <li><Link to="">Discord</Link></li>
                          </ul>
                      </div>
                  </div>
                  <div className="col-md-3 col-sm-6 col-xs-1">
                      <div className="widget">
                          <h5 className='text-white'>Community</h5>
                          <ul>
                              <li><Link to="/news">News</Link></li>
                          </ul>
                      </div>
                  </div>
                  
              </div>
          </div>
          <div className="subfooter">
          <div className="container">
              <div className="row">
                  <div className="col-md-6 col-sm-12 col-xs-1">
                      <p>2021-2022 PACTX PTE. LTD.</p>
                  </div>

                  <div className='col-md-6 col-sm-12 col-xs-1 text-right'>
                      <a className='m-5' href='/tos'>Terms of Service</a>
                      <a href='/privacy'>Privacy Policy</a>
                  </div>

              </div>
          </div>
          </div>
        </footer>
      );
}
export default Footer;