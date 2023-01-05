import axios from "axios"
import React, { useEffect, useState } from 'react';
import Footer from '../components/footer';
import { createGlobalStyle } from 'styled-components';
import { Link } from '@reach/router';

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

const News = () => {

  const [news, setNews] = useState([]);

  const fetchNews = async() => {
    axios.get("/api/1.0/web/news")
        .then((resp) => {
          setNews(resp.data.payload);
        })
        .catch(error => {
          console.error("FAIL TO FETCH NEWS - fetchNews");
        });
  }

  const fetchNewsStatic = async() => {
    axios.get("/static/doc/news/news-list")
        .then((resp) => {
          setNews(resp.data);
        })
        .catch(error => {
          console.error("FAIL TO FETCH NEWS - fetchNewsStatic");
        });
  }

  useEffect(() => {
    // fetchNews();
    fetchNewsStatic();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
    <GlobalStyles/>

      <section className='jumbotron breadcumb no-bg' style={{backgroundImage: `url(${'/static/img/background/bg-shape-1.jpg'})`}}>
        <div className='mainbreadcumb'>
          <div className='container'>
            <div className='row m-10-hor'>
              <div className='col-12 text-center'>
                <h1 className="text-dark">News</h1>
              </div>
            </div>
          </div>
        </div>
      </section>


      <section className='container'>
        <div className="row">
          {news.map( (newsitem, index) => (
            <div key={newsitem.id} className="col-lg-4 col-md-6 mb30">
              <div className="bloglist item">
                <div className="post-content">
                    <div className="post-image">
                        <img alt="" src={newsitem.post_image} className="lazy"/>
                    </div>
                    <div className="post-text">
                       <span className="p-date">{ newsitem.created_at_human }</span>
                        <h4><span>{ newsitem.short_desc || newsitem.description }<span></span></span></h4>
                        <p>{ newsitem.blog_content_preview }…</p>
                        <Link to={"/news/" + newsitem.url_slug}><span className="btn-main">Read more</span></Link>
                        
                    </div>
                </div>
              </div>
            </div>
          )
          )}
        </div>
      </section>

      <Footer />
    </div>)
};

export default News;
