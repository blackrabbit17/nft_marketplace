import React, { useEffect } from 'react';
import { Router, Location, Redirect } from '@reach/router';
import ScrollToTopBtn from './menu/ScrollToTop';
import Header from './menu/header';
import Home from './pages/home';
import Explore from './pages/explore';
import Ranking from './pages/ranking';
import Auction from './pages/auction';
import Support from './pages/support';
import Collection from './pages/collection';
import ItemDetail from './pages/ItemDetail';
import Wallet from './pages/wallet';
import Login from './pages/login';
import Logout from "./pages/logout";
import News from './pages/news';
import Create2 from './pages/createSingle';
import Create3 from './pages/createMultiple';
import Createoption from './pages/createOptions';
import Activity from './pages/activity';
import Contact from './pages/contact';
import IndivProfile from './pages/indivProfile';
import NewsPage from './pages/newsPage';
import UserSettings from './pages/settings';
import PageNotFound from './pages/pageNotFound';
import Notifications from './pages/notifications';
import Escrow from './pages/escrow';
import Security from './pages/security';

import { createGlobalStyle } from 'styled-components';
import { ToastContainer } from 'react-toastify';

import { setProfile } from "../store/actions/profileActions"
import { useDispatch } from "react-redux"
import 'react-toastify/dist/ReactToastify.css';


const GlobalStyles = createGlobalStyle`
  :root {
    scroll-behavior: unset;
  }
`;

export const ScrollTop = ({ children, location }) => {
  React.useEffect(() => window.scrollTo(0,0), [location])
  return children
}

const PosedRouter = ({ children }) => (
  <Location>
    {({ location }) => (
      <div id='routerhang'>
        <div key={location.key}>
          <Router location={location}>
            {children}
          </Router>
        </div>
      </div>
    )}
  </Location>
);

const App = () => {

  const dispatch = useDispatch();

  const resurrectProfile = () => {
      var profile = localStorage.getItem('profile');
      if(profile === null) {
        return;
      }
      else {
        profile = JSON.parse(profile);
        // TODO: ALAINR: Maybe we should also call the backend authentication endpoint
        // to make sure the cookie session is still valid?
        dispatch(setProfile(profile));
      }
  }

  useEffect(() => {
    resurrectProfile();
  });

  return (<div className="wraper">
            <GlobalStyles />
              <Header/>

              <ToastContainer
                position="top-center"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
              />

                <PosedRouter>
                <ScrollTop path="/">
                  <Home exact path="/">
                    <Redirect to="/home"/>
                  </Home>
                  <Explore path="/explore/:category" />
                  <Ranking path="/ranking" />
                  <Auction path="/auction" />
                  <Support path="/support" />
                  <Collection path="/colection" />
                  <ItemDetail path="/nft/:id" />
                  <Wallet path="/wallet" />
                  <Login path="/login" />
                  <Logout path="/logout" />
                  <UserSettings path="/settings" />
                  <Notifications path="/notifications" />
                  <Escrow path="/escrow" />
                  <Security path="/security" />
                  <News path="/news" />
                  <NewsPage path='/news/:slug'/>
                  <Create2 path="/createNFT" />
                  <Create3 path="/createMultiple" />
                  <Createoption path="/createOptions" />
                  <Activity path="/activity" />
                  <Contact path="/contact" />
                  <IndivProfile path="/profile/:id"/>
                  <PageNotFound path='/pageNotFound'/>
                  </ScrollTop>
                </PosedRouter>
              <ScrollToTopBtn />
          </div>);

};
export default App;