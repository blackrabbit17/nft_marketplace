import React, { Component } from "react";
import { Link } from '@reach/router';
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

export default class Createpage extends Component {



render() {
    return (
      <div>
      <GlobalStyles/>

        <section className='jumbotron breadcumb no-bg' style={{backgroundImage: `url(${'/static/img/background/bg-shape-1.jpg'})`}}>
          <div className='mainbreadcumb'>
            <div className='container'>
              <div className='row m-10-hor'>
                <div className='col-12'>
                  <h1 className='text-center text-dark'>Create Collectible</h1>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section className='container align-middle no-bottom'>
          <p className="text-center">Choose "Single" if you want your collectible to be one of a kind or "Multiple" if you want to sell one collectible times</p>
        </section>
        
        <section className='container'>
          <div className='row justify-content-center'>
            <div className="col-sm offset-md-2">
              <h2 className="m-3">Single</h2>
              <Link to="/createNFT" className="opt-create">
                  <img src="/static/img/misc/coll-single.png" alt=""/>
              </Link>
            </div>
            <div className="col-sm offset-md-2">
              <h2 className="m-3">Multiple</h2>
              <Link to="/createMultiple" className="opt-create">
                  <img src="/static/img/misc/coll-multiple.png" alt=""/>
              </Link>
            </div>
          </div>
        </section>

       

        <Footer />
      </div>
   );
  }
}