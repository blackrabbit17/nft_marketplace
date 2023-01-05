import React from 'react';
import Reveal from 'react-awesome-reveal';
import { keyframes } from "@emotion/react";
import { Link } from '@reach/router';

const fadeInUp = keyframes`
  0% {
    opacity: 0;
    -webkit-transform: translateY(40px);
    transform: translateY(40px);
  }
  100% {
    opacity: 1;
    -webkit-transform: translateY(0);
    transform: translateY(0);
  }
`;
const fadeIn = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`;

const slidermain= () => (
 <div className="container">
    <div className="row align-items-center mt-5">
          <div className="col-md-6">
              <div className="spacer-single"></div>
              <div className="spacer-10"></div>
              <Reveal className='onStep' keyframes={fadeInUp} delay={300} duration={600} triggerOnce>
              <p className="subheader"></p>  
              </Reveal>
              <Reveal className='onStep' keyframes={fadeInUp} delay={600} duration={600} triggerOnce>
              <h1 className="mb-0">Buy, sell and trade:</h1> 
              <h1 className="hero-header mt-0"> Services on the blockchain you can trust.</h1> 
              </Reveal>
              <Reveal className='onStep' keyframes={fadeInUp} delay={900} duration={600} triggerOnce>
              <p className="subheader"> Experience truly decentralized, justice-based commerce.</p>  
              </Reveal>
              <div className="spacer-10 mb-2"></div>
              <Reveal className='onStep' keyframes={fadeInUp} delay={800} duration={900} triggerOnce>
              <Link className="btn-home inline" to="/explore/search">Explore</Link>
              <div className="mb-sm-30"></div>
              </Reveal>
          </div>
          <div className="col-md-6 xs-hide align-right">
            <Reveal className='onStep' keyframes={fadeIn} delay={900} duration={1500} triggerOnce>
              <img src="" className="lazy img-fluid" alt=""/>
            </Reveal>
          </div>
    </div>
  </div>
);
export default slidermain;