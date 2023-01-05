import React, { useEffect, useState } from "react";
import Breakpoint, { BreakpointProvider, setDefaultBreakpoints } from "react-socks";
import { Link } from '@reach/router';
import useOnclickOutside from "react-cool-onclickoutside";
import LoginButton from "./loginbutton"
import { useSelector } from "react-redux"


setDefaultBreakpoints([
  { xs: 0 },
  { l: 1199 },
  { xl: 1200 }
]);

const NavLink = props => (
  <Link 
    {...props}
    getProps={({ isCurrent }) => {
      // the object returned here is passed to the
      // anchor element's props
      return {
        className: isCurrent ? 'active' : 'non-active',
      };
    }}
  />
);


const Header = () => {

/*    const [openMenu, setOpenMenu] = React.useState(false); */
    const [openMenu1, setOpenMenu1] = React.useState(false);
    const [openMenu2, setOpenMenu2] = React.useState(false);
    const [openMenu3, setOpenMenu3] = React.useState(false);
/*     const handleBtnClick = (): void => {
      setOpenMenu(!openMenu);
    }; */
    const handleBtnClick1 = () => {
      setOpenMenu1(!openMenu1);
    };
    const handleBtnClick2 = () => {
      setOpenMenu2(!openMenu2);
    };
    const handleBtnClick3 = () => {
      setOpenMenu3(!openMenu3);
    };
    const closeMenu = () => {
      //setOpenMenu(false);
    };
    const closeMenu1 = () => {
      setOpenMenu1(false);
    };
    const closeMenu2 = () => {
      setOpenMenu2(false);
    };
    const closeMenu3 = () => {
      setOpenMenu3(false);
    };
/*     const ref = useOnclickOutside(() => {
      closeMenu();
    }); */
    const ref1 = useOnclickOutside(() => {
      closeMenu1();
    });
    const ref2 = useOnclickOutside(() => {
      closeMenu2();
    });
    const ref3 = useOnclickOutside(() => {
      closeMenu3();
    });

    const profile = useSelector((state) => state.profile.profile);

    const [showmenu, btn_icon] = useState(false);
    useEffect(() => {
      const header = document.getElementById("myHeader");
      const totop = document.getElementById("scroll-to-top");
      const sticky = header.offsetTop;
      const scrollCallBack = window.addEventListener("scroll", () => {
          btn_icon(false);
          if (window.pageYOffset > sticky) {
            header.classList.add("sticky");
            totop.classList.add("show");
            
          } else {
            header.classList.remove("sticky");
            totop.classList.remove("show");
          } if (window.pageYOffset > sticky) {
            closeMenu();
          }
        });
        return () => {
          window.removeEventListener("scroll", scrollCallBack);
        };
    }, []);
    
    return (
    <header id="myHeader" className='navbar white'>
     <div className='container'>
       <div className='row w-100-nav'>
          <div className='logo px-0'>
              <div className='navbar-title navbar-item'>
                <NavLink to="/">
                <img
                    src="/static/img/logo-black.png"
                    className="img-fluid d-block"
                    alt="#"
                  />
                </NavLink>
              </div>
          </div>

          <div className='search'>
            <input id="quick_search" className="xs-hide" name="quick_search" placeholder="Search Pact services..." type="text" />
          </div>
                    
              <BreakpointProvider>

                <Breakpoint l down>
                  {showmenu && 
                  <div className='menu'>
                    <div className='navbar-item'>
                      <NavLink to="/explore/search">
                      Explore
                      <span className='lines'></span>
                      </NavLink>
                    </div>
                    <div className='navbar-item'>
                      <div ref={ref1}>
                          <div className="dropdown-custom dropdown-toggle btn" 
                             onMouseEnter={handleBtnClick1} onMouseLeave={closeMenu1}>
                            Stats
                            <span className='lines'></span>
                            {openMenu1 && (
                            <div className='item-dropdown'>
                              <div className="dropdown" onClick={closeMenu1}>
                              <NavLink to="/ranking">Ranking</NavLink>
                              <NavLink to="/activity">Activity</NavLink>
                              </div>
                            </div>
                          )}
                          </div>
                          
                        </div>
                    </div>
                    <div className='navbar-item'>
                      <div ref={ref2}>
                          <div className="dropdown-custom dropdown-toggle btn" 
                             onMouseEnter={handleBtnClick2} onMouseLeave={closeMenu2}>
                            Resources
                            <span className='lines'></span>
                            {openMenu2 && (
                            <div className='item-dropdown'>
                              <div className="dropdown" onClick={closeMenu2}>
                              <NavLink to="/news">News</NavLink>
                              <NavLink to="/support">Help</NavLink>
                              <NavLink to="/contact">Partners</NavLink>
                              </div>
                            </div>
                          )}
                          </div>
                        </div>
                    </div>
                    <div className='navbar-item'>
                      <NavLink to="/createNFT">
                      Create
                      <span className='lines'></span>
                      </NavLink>
                    </div>
                    <div className='navbar-item'>
                      <div ref={ref3}>
                          <div className="dropdown-custom dropdown-toggle btn" 
                             onMouseEnter={handleBtnClick3} onMouseLeave={closeMenu3}>
                            Profile
                            <span className='lines'></span>
                            {openMenu3 && (
                            <div className='item-dropdown'>
                              <div className="dropdown" onClick={closeMenu3}>
                              <NavLink to="/">Favourites</NavLink>
                              <NavLink to="/profile/me">My Collection</NavLink>
                              <NavLink to="/">Settings</NavLink>
                              </div>
                            </div>
                          )}
                          </div>
                        </div>
                    </div>
                  </div>
                } 
                </Breakpoint>
 
                <Breakpoint xl>
                  <div className='menu'>
                    <div className='navbar-item'>
                      <NavLink to="/explore/search">
                      Explore
                      <span className='lines'></span>
                      </NavLink>
                    </div>
                    <div className='navbar-item'>
                      <div ref={ref1}>
                          <div className="dropdown-custom dropdown-toggle btn" 
                             onMouseEnter={handleBtnClick1} onMouseLeave={closeMenu1}>
                            Stats
                            <span className='lines'></span>
                            {openMenu1 && (
                            <div className='item-dropdown'>
                              <div className="dropdown" onClick={closeMenu1}>
                              <NavLink to="/ranking">Ranking</NavLink>
                              <NavLink to="/activity">Activity</NavLink>
                              </div>
                            </div>
                          )}
                          </div>
                          
                        </div>
                    </div>
                    <div className='navbar-item'>
                      <div ref={ref2}>
                          <div className="dropdown-custom dropdown-toggle btn" 
                             onMouseEnter={handleBtnClick2} onMouseLeave={closeMenu2}>
                            Resources
                            <span className='lines'></span>
                            {openMenu2 && (
                            <div className='item-dropdown'>
                              <div className="dropdown" onClick={closeMenu2}>
                              <NavLink to="/news">News</NavLink>
                              <NavLink to="/support">Help</NavLink>
                              <NavLink to="/contact">Partners</NavLink>
                              </div>
                            </div>
                          )}
                          </div>
                        </div>
                    </div>
                    <div className='navbar-item'>
                      <NavLink to="/createNFT">
                      Create
                      <span className='lines'></span>
                      </NavLink>
                    </div>

                    { profile !== null &&
                      <div className='navbar-item'>
                      <div ref={ref3}>
                          <div className="dropdown-custom dropdown-toggle btn" 
                            onMouseEnter={handleBtnClick3} onMouseLeave={closeMenu3}>
                            Profile
                            <span className='lines'></span>
                            {openMenu3 && (
                            <div className='item-dropdown'>
                              <div className="dropdown" onClick={closeMenu3}>
                              <NavLink to="/profile/me">My Profile</NavLink>
                              <NavLink to="/settings">Settings</NavLink>
                              <NavLink to="/logout">Log out</NavLink>
                              </div>
                            </div>
                          )}
                          </div>
                        </div>
                      </div>
                    }

                  </div>
                </Breakpoint>
              </BreakpointProvider>

              <LoginButton />
                  
      </div>

        <button className="nav-icon" onClick={() => btn_icon(!showmenu)}>
          <div className="menu-line white"></div>
          <div className="menu-line1 white"></div>
          <div className="menu-line2 white"></div>
        </button>

      </div>     
    </header>
    );
}
export default Header;
