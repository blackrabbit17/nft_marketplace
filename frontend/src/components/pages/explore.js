import axios from "axios"
import React, { useEffect, useState } from 'react';
import Select from 'react-select'
import ColumnNew from '../components/ColumnNew';
import Footer from '../components/footer';
import { toast } from "react-toastify";


const customStyles = {
  option: (base, state) => ({
    ...base,
    background: "#fff",
    color: "#333",
    borderRadius: state.isFocused ? "0" : 0,
    "&:hover": {
      background: "#eee",
    }
  }),
  menu: base => ({
    ...base,
    borderRadius: 0,
    marginTop: 0
  }),
  menuList: base => ({
    ...base,
    padding: 0
  }),
  control: (base, state) => ({
    ...base,
    padding: 2
  })
};

const category_options = [
  { value: 'All categories', label: 'All categories' },
  { value: 'YOUTUBE_SHOUTOUT', label: 'Youtube Shoutouts' },
  { value: 'INSTA_SHOUTOUT', label: 'Instagram Shoutouts' },
  { value: 'NFT_ARTWORK_COMMISSION', label: 'NFT Artwork Comissions' },
  { value: 'DIGITAL_COMMISSION', label: 'Digital File Commission' },
  { value: 'PUBLIC_CONSULT', label: 'Public consultation' }
]
const trade_options = [
  { value: 'Buy Now', label: 'Buy Now' },
  { value: 'On Auction', label: 'On Auction' },
  { value: 'Has Offers', label: 'Has Offers' }
]


const Explore = () => {
  
  const [nfts, setNFTs] = useState([]);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(category_options[0]);
  const [tradeoption, setTradeOption] = useState(trade_options[0]);

  const searchTextChange = (e) => setSearch(e.target.value);

  const onCategoryChange = (selected_category) => {
    setCategory(selected_category);
    fetchNFTs();
  };

  const onTradeOptionChange = (selected_trade_option) => {
    setTradeOption(selected_trade_option);
    fetchNFTs();
  };

  const searchHandleKeyDown = (event) => {
    if (event.key === 'Enter') {
      fetchNFTs();
    }
  }

  const fetchNFTs = async() => {
    axios.post("/api/1.0/web/explore", {'search': search, 'category': category, 'tradeoption': trade_options})
        .then((resp) => {
          setNFTs(resp.data.payload);
        })
        .catch(error => {
          toast('Backend server unavailable, please try again later');
          console.error(error);
        });
  }

  useEffect(() => {
    fetchNFTs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
          <div>

              <section className='jumbotron breadcumb no-bg' style={{backgroundImage: `url(${'/static/img/background/bg-shape-1.jpg'})`}}>
                <div className='mainbreadcumb'>
                  <div className='container'>
                    <div className='row m-10-hor'>
                      <div className='col-12'>
                        <h1 className='text-center text-dark'>Explore</h1>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className='container'>
                    <div className='row'>
                      <div className='col-lg-12'>
                          <div className="items_filter">
                            <div className="row form-dark" id="form_quick_search" name="form_quick_search">
                                <div className="col">
                                    <input className="form-control" onKeyDown={searchHandleKeyDown} value={search} onChange={searchTextChange} placeholder="Search..." type="text" /> 
                                    <button id="btn-submit" onClick={fetchNFTs}><i className="fa fa-search bg-color-secondary"></i></button>
                                    <div className="clearfix"></div>
                                </div>
                            </div>
                            <div className='dropdownSelect one'>
                              <Select styles={customStyles} 
                                      menuContainerStyle={{'zIndex': 999}} 
                                      defaultValue={category} 
                                      options={category_options}
                                      onChange={onCategoryChange} /></div>

                            <div className='dropdownSelect two'>
                              <Select styles={customStyles} 
                                      defaultValue={tradeoption} 
                                      options={trade_options}
                                      onChange={onTradeOptionChange} /></div>
                        </div>
                      </div>
                    </div>
                    <ColumnNew nfts={nfts} />
                  </section>

            <Footer />
          </div>
  );
}

export default Explore;
