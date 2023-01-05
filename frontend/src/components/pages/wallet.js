import React from 'react';
import Wallet from '../components/Wallet';
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

const wallet = () => {
  
  return (
    <div>
      <GlobalStyles/>

      <section className='jumbotron breadcumb no-bg' style={{backgroundImage: `url(${'/static/img/background/bg-shape-1.jpg'})`}}>
        <div className='mainbreadcumb'>
          <div className='container'>
            <div className='row m-10-hor'>
              <div className='col-12'>
                <h1 className='text-center text-dark'>Wallet</h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className='container'>
        <Wallet/>
      </section>

      <Footer />
    </div>

  );
}

export default wallet;
