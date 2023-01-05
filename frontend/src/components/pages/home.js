import React from 'react';
import SliderMain from '../components/SliderMain';
import FeatureBox from '../components/FeatureBox';
import ResourcesCarousel from '../components/resourcesCarousel';
import CarouselNew from '../components/CarouselNew';
import AuthorList from '../components/authorList';
import Catgor from '../components/Catgor';
import Footer from '../components/footer';


const home= () => (
  <div>
      <section className="" style={{backgroundImage: `url(${'/static/img/bg-shape-1.jpg'})`}}>
         <SliderMain/>
      </section>

      <section className='container no-top no-bottom'>
        <div className='row'>
          <div className='col-lg-12'>
            <div className='text-center'>
              <h3 className='mb-0'>What is a Pact?</h3>
              <div className="small-border"></div>
            </div>
          </div>
        </div>
        
      </section>

      <section className='container no-top no-bottom'>
        <div className='row'>
          <div className='col-lg-12'>
            <div className='text-center'>
              <h3 className='mb-0'>Browse by category</h3>
              <div className="small-border"></div>
            </div>
          </div>
        </div>
        <Catgor/>
      </section>

      <section className='container no-bottom'>
        <div className='row'>
          <div className='col-lg-12'>
            <div className='text-center'>
              <h3 className='mb-0'>New Items</h3>
              <div className="small-border"></div>
            </div>
          </div>
          <div className='col-lg-12'>
            <CarouselNew/>
          </div>
        </div>
      </section>

      <section className='container'>
        <FeatureBox/>
      </section>

      <section className='container no-top'>
        <div className='row'>
          <div className='col-lg-12'>
            <div className='text-center'>
              <h3 className='mb-0'>Resources for getting started</h3>
              <div className="small-border"></div>
            </div>
          </div>
          <div className='col-lg-12'>
            <ResourcesCarousel/>
          </div>
        </div>
      </section>
     
      <Footer/>
  </div>
);
export default home;