import axios from "axios"
import React, { useEffect, useState } from 'react';
import Footer from '../components/footer'
import ResourcesCarousel from '../components/resourcesCarousel';

const NewsPage = (props) => {
    /* 
        Props: title, body, author, date, category
    */

    const [newspage, setNewsPage] = useState({});

    const fetchNewsPage = async() => {
        axios.get("/api/1.0/web/news/" + props.slug)
        .then((resp) => {
            setNewsPage(resp.data.payload);
        })
        .catch(error => {
            console.error("FAIL TO FETCH NEWS - fetchNews");
        });
    }

    const fetchNewsPageStatic = async() => {
        axios.get("static/doc/news/" + props.slug)
        .then((resp) => {
            setNewsPage(resp.data);
        })
        .catch(error => {
            console.error("FAIL TO FETCH NEWS - fetchNewsStatic");
        });
        console.log(newspage);
    }
    
    
    useEffect(() => {
        // fetchNewsPage();
        fetchNewsPageStatic();



        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
    <div>
        <section className="outer-container">
            <section className="no-bottom">
                <p className="title">{newspage.description}</p>
                <div className="details">
                    <div className='row justify-content-center'>
                        <div className="col-sm">
                            <p>{newspage.author}</p>
                        </div>
                        <div className="col-sm">
                            <p>{newspage.created_at_human}</p>
                        </div>
                        <div className="col-sm">
                            <p>{newspage.category}</p>
                        </div>
                    </div>
                </div>
            </section>
            <section className='container'>
                <div dangerouslySetInnerHTML={{__html: newspage.blog_content}}></div>
            </section>
            <section className='container no-top no-bottom'>
                <div className="long-border"/>
                <div className='row m-4'>
                    <div className='col-lg-12'>
                        <div className='text-center'>
                            <h3>Similar Posts</h3>
                        </div>
                    </div>
                    <div className='col-lg-12'>
                        <ResourcesCarousel/>
                    </div>
                </div>
            </section>
            <Footer/>
        </section>
    </div>
    )
}

export default NewsPage
