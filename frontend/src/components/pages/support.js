import React from 'react';
import Footer from '../components/footer';
import { Link } from '@reach/router';
import { createGlobalStyle } from 'styled-components';
import { Tabs, Tab } from 'react-bootstrap';
/*
const GlobalStyles = createGlobalStyle`
  header#myHeader.navbar.sticky.white {
    background: #fff;
    border-bottom: solid 1px #403f83;
  }
  header#myHeader.navbar .search #quick_search{
    color: #0;
    background: rgba(255, 255, 255, .1);
  }
  header#myHeader.navbar.white .btn, .navbar.white a, .navbar.sticky.white a{
    color: #0;
  }
  header#myHeader .dropdown-toggle::after{
    color: #0;
  }
  header#myHeader .logo .d-block{
    display: none !important;
  }
  header#myHeader .logo .d-none{
    display: block !important;
  }
  @media only screen and (max-width: 1199px) {
    .navbar{
      background: #0;
    }
    .navbar .menu-line, .navbar .menu-line1, .navbar .menu-line2{
      background: #0;
    }
    .item-dropdown .dropdown a{
      color: #0 !important;
    }
  }
`;
*/
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

const Support = () => (
<div>
<GlobalStyles/>

  <section className='jumbotron breadcumb no-bg' style={{backgroundImage: `url(${'/static/img/background/bg-shape-1.jpg'})`}}>
    <div className='mainbreadcumb'>
      <div className='container'>
        <div className='row'>
          <div className="col-md-8 offset-md-2 text-center">
              <h1 className="text-dark">Help Center</h1>

              <div className="spacer-20"></div>
              <form className="row" id='form_sb' name="myForm">
              <div className="col text-center">
                  <input className="form-control" id='name_1' name='name_1' placeholder="type your question here" type='text'/> <button id="btn-submit"><i className="arrow_right"></i></button>
              </div>
              </form>
              <div className="spacer-20"></div>
              
              <p className="mt-0 text-dark">eg. create item, create wallet.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <div className="centered-tabs">
    <Tabs defaultActiveKey="center" id="uncontrolled-tab-example" className="mb-10" fill>
      <Tab eventKey="center" title="Center" styles={{padding:"10"}}>
        <section className='container'>
          <div className="row">
            <div className="col-lg-4 col-md-6 mb-4">
                <div className="feature-box f-boxed style-3 text-center">
                    <div className="text">
                        <h2>Get Started</h2>
                        <p>Start here to find out about PactumX and NFT services.</p>
                        <Link to="" className="btn-main m-auto">Read more</Link>
                    </div>
                </div>
            </div>    

            <div className="col-lg-4 col-md-6 mb-4">
                <div className="feature-box f-boxed style-3 text-center">
                    <div className="text">
                        <h2>Buying</h2>
                        <p>Everything you need to know about buying your NFT services.</p>
                        <Link to="" className="btn-main m-auto">Read more</Link>
                    </div>
                </div>
            </div>  

            <div className="col-lg-4 col-md-6 mb-4">
                <div className="feature-box f-boxed style-3 text-center">
                    <div className="text">
                        <h2>Selling</h2>
                        <p>Learn the ins and outs of setting up your NFT services for sale.</p>
                        <Link to="" className="btn-main m-auto">Read more</Link>
                    </div>
                </div>
            </div>  

            <div className="col-lg-4 col-md-6 mb-4">
                <div className="feature-box f-boxed style-3 text-center">
                    <div className="text">
                        <h2>Wallet</h2>
                        <p>Find out more about wallets, resolution and compatibility.</p>
                        <Link to="" className="btn-main m-auto">Read more</Link>
                    </div>
                </div>
            </div>  

            <div className="col-lg-4 col-md-6 mb-4">
                <div className="feature-box f-boxed style-3 text-center">
                    <div className="text">
                        <h2>Partners</h2>
                        <p>Pioneers of service providers on the blockchain.</p>
                        <Link to="" className="btn-main m-auto">Read more</Link>
                    </div>
                </div>
            </div>  

            <div className="col-lg-4 col-md-6 mb-4">
                <div className="feature-box f-boxed style-3 text-center">
                    <div className="text">
                        <h2>Developers</h2>
                        <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem</p>
                        <Link to="" className="btn-main m-auto">Read more</Link>
                    </div>
                </div>
            </div> 

            <section className='container'>
        <div className='row'>
          <div className='col-lg-12 mb-4'>
          <h2>Related FAQs</h2>
          </div>
            <div className='row'>
              <div className='col-lg-6 col-md-6'>
                <div className='text-left'>
                  <li>
                    <a href="/support/solutions/articles/" title="I Would Like a Refund">I Would Like a Refundaaaaaaa</a>
                  </li>
                  <li>
                    <a href="/support/solutions/articles/" title="I Would Like a Refund">I Would Like a Refundaaaaaaaaaaaaa</a>
                  </li>
                  <li>
                    <a href="/support/solutions/articles/" title="I Would Like a Refund">I Would Like a Refundaaaaaaaaa</a>
                  </li>
                </div>
              </div>
              <div className='col-lg-6 col-md-6 mb-4'>
                <div className='text-left'>
                  <li className='text-purple'>
                    <a href="/support/solutions/articles/" title="I Would Like a Refund">I Would Like a Refundaaaaaaaaaa</a>
                  </li>
                  <li>
                    <a href="/support/solutions/articles/" title="I Would Like a Refund">I Would Like a Refundaa</a>
                  </li>
                  <li>
                    <a href="/support/solutions/articles/" title="I Would Like a Refund">I Would Like a Refundaaaa</a>
                  </li>
                </div>
              </div>
              <div>
                <a class="btn-inverse" href="/support/FAQ">See All FAQs</a>
              </div>
            </div>
        </div>
      </section>

          </div>
        </section>
      </Tab>
      <Tab eventKey="faq" title="FAQ">
      </Tab>
      <Tab eventKey="others" title="Others">
      </Tab>
    </Tabs>
    
    


<section className='container no-top'>
  <div className='text-center'>
    <h2>Still need help?</h2>
    <p>Our Community team is here for you</p>
        <a class="btn-main m-auto" href="/support/tickets/new">Submit a Support Ticket</a>
  </div>
</section>

  </div>
  <Footer />
</div>

);
export default Support;