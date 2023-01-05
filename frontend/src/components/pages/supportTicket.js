import React from 'react';
import emailjs from 'emailjs-com';
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

const SupportTicket= function() {

    function sendEmail(e) {
  
      const success = document.getElementById("success");
      const button = document.getElementById("buttonsent");
      const failed = document.getElementById("failed");
      e.preventDefault();
  
      emailjs.sendForm('gmail', 'template_csfdEZiA', e.target, 'user_zu7p2b3lDibMCDutH5hif')
        .then((result) => {
            console.log(result.text);
            success.classList.add('show');
            button.classList.add('show');
            failed.classList.remove('show');
        }, (error) => {
            console.log(error.text);
            failed.classList.add('show');
        });
    }
  
    return (

<div>
    <GlobalStyles />

    <section className='jumbotron breadcumb no-bg' style={{backgroundImage: `url(${'/static/img/background/bg-shape-1.jpg'})`}}>
    <div className='mainbreadcumb'>
      <div className='container'>
        <div className='row'>
          <div className="col-md-12 text-center">
              <h2 className="text-dark">Submit a Support Ticket</h2>
              <p className="text-dark">Be as clear and include as much detail as possible.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section className='container'>
        <div className='row'>
          
          <div className='col-lg-8 mb-3'>
          <div className="form-side">
              <form className="formcontact" onSubmit={sendEmail}>
                <input type="email" className="form-control" name="user_email" placeholder="Your Email" required />
                <textarea name="message" className="form-control" placeholder="Your Message" required />
                <div id='success' className='hide'>Your message has been sent...</div>
                <div id='failed' className='hide'>Message failed...</div>
                <input type='submit' id='buttonsent' value='Submit' className="btn btn-main color-2" />
              </form>
            </div>
          </div>
        </div>

</section>

<Footer />
</div>
);
    }
export default SupportTicket;