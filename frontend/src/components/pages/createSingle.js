import axios from "axios"
import React, { useEffect, useState } from 'react';
import Clock from "../components/Clock";
import Footer from '../components/footer';
import Select from 'react-select'
import { createGlobalStyle } from 'styled-components';
import { useNavigate } from "@reach/router"
import { useSelector } from "react-redux"

import LazyMinter from "../../lib/LazyMinter";

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

  .style_step { width:150px; }

  .bubble_top { margin-top:20px; }

  .create_breadcrumb { padding: 130px 0 10px; }

  .cursor_ptr { cursor: pointer; }
`;

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

const currencyOptions = [
  { value: '1', label: 'Ethereum'},
  { value: '2', label: 'Binance Smart Chain'},
  { value: '3', label: 'Polygon'},
  { value: '5', label: 'Ganache (Development)'},
]

const currencySymbols = {
  '1': 'ETH',
  '2': 'BSC',
  '3': 'MATIC',
  '5': 'ETH (dev)'
}


const AUCTION_FIXED_PRICE = 0;
const AUCTION_TIMED = 1;

const CreatePage = () => {

  /* Utility */
  const navigate = useNavigate();
  const { ethereum } = window;
  const profile = useSelector((state) => state.profile.profile); /* is null if not logged in */

  /* Step 0 State Variables */
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imgDataURL, setImgDataURL] = useState('');

  /* Step 1 state variables */
  const [contractTemplates, setContractTemplates] = useState([]);                   // Models from the databas
  const [contractTemplatesSelect, setContractTemplatesSelect] = useState([]);       // UI Select drop-down state variable

  const [currentContractTemplate, setCurrentContractTemplate] = useState({});       // Which contractTemplates is selected
  const [ctPlaceholders, setCtPlaceholders] = useState([]);                         // List of placeholders that must be folled
  const [ctPlaceHolderInput, setCtPlaceHolderInput] = useState({});                 // Dict of user input of the ctPlaceholders

  /* Step 2 State variables */
  const [currency, setCurrency] = useState(currencyOptions[0]);
  const [price, setPrice] = useState(0);
  const [royalties, setRoyalties] = useState(0);
  const [auctionType, setAuctionType] = useState(AUCTION_FIXED_PRICE);
  const [auctionStartDate, setAuctionStartDate] = useState({});
  const [auctionEndDate, setAuctionEndDate] = useState({});

  const [wizardStep, setWizardStep] = useState(0);

  /* Step 0 Validation Errors */
  const [valErrTitle, setValErrTitle] = useState(false);
  const [valErrDesc, setValErrDesc] = useState(false);

  /* Step 1 Validation Errors */
  const [valErrNoContract, setValErrNoContract] = useState(false);
  const [valErrPlaceholders, setValErrPlaceholders] = useState({});                 // A dict of validation errors, the key is the ID of the placeholder

  /* Step 2 Validation Errors */
  const [valPriceErr, setValPriceErr] = useState('');
  const [valRoyaltyErr, setValRoyaltyErr] = useState('');
  const [valMinBidErr, setValMinBidErr] = useState('');
  const [valDateErr, setValDateErr] = useState('');

  const auctionStartDateChanged = (e) => {
      setAuctionStartDate(e.target.value);
  }

  const auctionEndDateChanged = (e) => {
    setAuctionEndDate(e.target.value);
  }

  const setFixedPriceAuction = () => {
    setAuctionType(AUCTION_FIXED_PRICE);

    const btn_fixed_price = document.getElementById("btn_fixed_price");
    const btn_timed_auction = document.getElementById("btn_timed_auction");
    const tab_fixed_price = document.getElementById("tab_fixed_price");
    const tab_auction = document.getElementById("tab_auction");

    btn_fixed_price.classList.add("active");
    btn_timed_auction.classList.remove("active");
    tab_fixed_price.classList.remove('hide');
    tab_auction.classList.add('hide');

    setValPriceErr('');
    setValRoyaltyErr('');
    setValMinBidErr('');
    setValDateErr('');
  }

  const setTimedAuction = () => {
    setAuctionType(AUCTION_TIMED);

    const btn_fixed_price = document.getElementById("btn_fixed_price");
    const btn_timed_auction = document.getElementById("btn_timed_auction");
    const tab_fixed_price = document.getElementById("tab_fixed_price");
    const tab_auction = document.getElementById("tab_auction");

    btn_fixed_price.classList.remove("active");
    btn_timed_auction.classList.add("active");
    tab_fixed_price.classList.add('hide');
    tab_auction.classList.remove('hide');

    setValPriceErr('');
    setValRoyaltyErr('');
    setValMinBidErr('');
    setValDateErr('');
  }

  const contractTemplateChange = (event) => {

    contractTemplates.map( (ct, index) => {
      if(ct.id === event.value) {
        setCurrentContractTemplate(ct);
        console.log(ct.ContractTemplatePlaceholder);
        setCtPlaceholders(ct.ContractTemplatePlaceholder);

        setValErrNoContract(false);
      }
      return ct;
    });
  }

  const validateStep0 = () => {
    var valErrorFound = false;

    if(title.trim() === '') {
      setValErrTitle(true);
      valErrorFound = true;
    }

    if(description.trim() === '') {
      setValErrDesc(true);
      valErrorFound = true;
    }

    return !valErrorFound;
  }

  const validateStep1 = () => {
    var valErrorFound = false;

    if( Object.entries(currentContractTemplate).length === 0 ) {
      setValErrNoContract(true);
      return false;
    }

    /* Validate each placeholder */
    var valErrors = {};
    ctPlaceholders.map( (pl, idx) => {

      var place_id = pl.id;

      if(ctPlaceHolderInput[pl.id] === undefined) {
        if(pl.data_type === 2) {
          valErrors[place_id] = 'A numeric field is required';
        }
        else {
          valErrors[place_id] = 'This field is required';
        }
        valErrorFound = true;
      }

      return null;
    });

    setValErrPlaceholders(valErrors);

    return !valErrorFound;
  }

  const validateStep2 = () => {

    setValPriceErr('');
    setValRoyaltyErr('');
    setValMinBidErr('');
    setValDateErr('');

    var valErrorFound = false;

    if(auctionType === AUCTION_FIXED_PRICE) {
        if(isNaN(price)) {
          setValPriceErr('Price must be a number');
          valErrorFound = true;
        }
        else {
          if(price <= 0) {
            setValPriceErr('Price must be a positive number');
            valErrorFound = true;
          }
        }
    }
    else if(auctionType === AUCTION_TIMED) {

      if(isNaN(price)) {
        setValMinBidErr('Minimum bid must be a number');
        valErrorFound = true;
      }
      else {
        if(price <= 0) {
          setValMinBidErr('Minimum bid must be a positive number');
          valErrorFound = true;
        }
      }

      if(Object.entries(auctionStartDate).length === 0) {
        setValDateErr('Starting date is required');
        valErrorFound = true;
      }
    }

    if(isNaN(royalties)) {
      setValRoyaltyErr('Royalties must be numeric');
      valErrorFound = true;
    }
    else {
      if(royalties > 10) {
        setValRoyaltyErr('Royalties % must be less than 10%');
        valErrorFound = true;
      }
      if(royalties < 0) {
        setValRoyaltyErr('Royalties must be 0 or greater');
        valErrorFound = true;
      }
    }

    return !valErrorFound;
  }

  const step0ProceedClicked = () => {
    if(validateStep0()) {
      goToStep1();
    }
    else {
      return;
    }
  }

  const step1ProceedClicked = () => {
    if(validateStep1()) {
      goToStep2();
    }
    else {
      return;
    }
  }

  const createItemClicked = () => {
    if(validateStep2()) {
      doSubmission();
    }
  }

  const goToStep0 = () => {

    setWizardStep(0);

    axios.get("/api/1.0/web/contract_templates")
    .then((resp) => {

      setContractTemplates(resp.data.payload);
      const select = [];
      resp.data.payload.map( (con_temp, index) => (
          select.push({'value': con_temp.id, 'label': con_temp.name})
      ));

      setContractTemplatesSelect(select);
      
    })
    .catch(error => {
      // TODO: Show an error message
    });
  }

  const goToStep1 = () => {
    setCtPlaceHolderInput({});
    setWizardStep(1);
  }

  const goToStep2 = () => {
    setWizardStep(2);
  }

  const titleKeypress = (event) => {
    setTitle(event.target.value);
  }

  const descriptionKeypress = (event) => {
    setDescription(event.target.value);
  }

  const priceKeypress = (event) => {
    setPrice(event.target.value);
  }

  const royaltiesKeypress = (event) => {
    setRoyalties(event.target.value);
  }

  const uploadChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.addEventListener("load", function () {
        const prev = document.getElementById('preview_file');
        prev.src = this.result;
        setImgDataURL(this.result);
      });
    }
  }

  const placeholderChanged = (event) => {
    const input_id = event.currentTarget.getAttribute("data-ctpid")
    ctPlaceHolderInput[input_id] = event.target.value;
  }

  const doSubmission = () => {
    var payload = {};

    /* Section 0 */
    payload['title'] = title;
    payload['description'] = description;
    payload['imgDataURL'] = imgDataURL;

    /* Section 1 */
    payload['ctPlaceHolderInput'] = ctPlaceHolderInput;
    payload['contractTemplate'] = currentContractTemplate;

    /* Section 2 */
    payload['network'] = currency['value'];
    payload['auctionType'] = auctionType;
    payload['price'] = price
    payload['royalties'] = royalties;
    payload['auctionStartDate'] = auctionStartDate;
    payload['auctionEndDate'] = auctionEndDate;

    axios.post("/api/1.0/web/NFT/new/", payload)
      .then((resp) => {

        // Now that the NFT is created on the server we have to create the NFT voucher
        // this voucher is a signed transaction (a.k.a lazy minting), which is signed by the
        // users metamask and stored on the server. Later, when the actual minting happens, 
        // We submit the ETH (or whatever payment) AND the voucher to the smart contract, the smart
        // contract verifies the voucher and then mints the NFT to the creator and transfers it to the 
        // buyer (first minting to the creator for the sake of on-chain provenance)
        const nft = resp.data.payload;
        const lazyMinter = new LazyMinter(ethereum);
        const voucherMsg = lazyMinter.generateVoucherMsg(nft);
        var params = [ethereum.selectedAddress, voucherMsg];

        ethereum.request({method: 'eth_signTypedData_v4', params: params}).then((signature) => {
            
          var voucher_payload = {'nft': nft.id, 'voucher_signature': signature};

          axios.post("/api/1.0/NFTVoucher/0/", voucher_payload).then((resp) => {
            navigate("/nft/" + nft.id);
          });

        });

      })
      .catch(error => {
        // TODO: Show an error message
      });
  }

  const previewContract = () => {

    console.log(ctPlaceHolderInput);
  }

  useEffect(() => {
    goToStep0();
  }, []);

    return (
      <div>
        <GlobalStyles/>

          <section className='jumbotron breadcumb no-bg' style={{backgroundImage: `url(${'/static/img/background/bg-shape-1.jpg'})`}}>
            <div className='create_breadcrumb'>
              <div className='container'>
                <div className='row m-10-hor'>
                  <div className='col-12'>
                    <h1 className='text-center text-dark'>Create NFT</h1>
                  </div>  

                  <div className='col-12'>
                    
                  <div className="siimple-steps siimple-steps--primary">
                      { wizardStep === 0 &&
                        <>
                          <div className="siimple-steps-item siimple-steps-item--current style_step">
                            <div className="siimple-steps-item-bubble"></div>
                            <div className="siimple-steps-item-title">Step 1</div>
                            <div className="siimple-steps-item-description">Listing</div>
                          </div>

                          <div className="siimple-steps-item style_step">
                            <div className="siimple-steps-item-bubble"></div>
                            <div className="siimple-steps-item-title">Step 2</div>
                            <div className="siimple-steps-item-description">Contract</div>
                          </div>
                          <div className="siimple-steps-item style_step">
                            <div className="siimple-steps-item-bubble"></div>
                            <div className="siimple-steps-item-title">Step 3</div>
                            <div className="siimple-steps-item-description">Pricing</div>
                          </div>
                        </>
                      }

                      { wizardStep === 1 &&
                        <>
                          <div className="siimple-steps-item style_step">
                            <div className="siimple-steps-item-bubble"></div>
                            <div className="siimple-steps-item-title">Step 1</div>
                            <div className="siimple-steps-item-description">Listing</div>
                          </div>

                          <div className="siimple-steps-item siimple-steps-item--current style_step">
                            <div className="siimple-steps-item-bubble"></div>
                            <div className="siimple-steps-item-title">Step 2</div>
                            <div className="siimple-steps-item-description">Contract</div>
                          </div>
                          <div className="siimple-steps-item style_step">
                            <div className="siimple-steps-item-bubble"></div>
                            <div className="siimple-steps-item-title">Step 3</div>
                            <div className="siimple-steps-item-description">Pricing</div>
                          </div>
                        </>
                      }

                      { wizardStep === 2 &&
                        <>
                          <div className="siimple-steps-item style_step">
                            <div className="siimple-steps-item-bubble"></div>
                            <div className="siimple-steps-item-title">Step 1</div>
                            <div className="siimple-steps-item-description">Listing</div>
                          </div>

                          <div className="siimple-steps-item style_step">
                            <div className="siimple-steps-item-bubble"></div>
                            <div className="siimple-steps-item-title">Step 2</div>
                            <div className="siimple-steps-item-description">Contract</div>
                          </div>
                          <div className="siimple-steps-item siimple-steps-item--current style_step">
                            <div className="siimple-steps-item-bubble"></div>
                            <div className="siimple-steps-item-title">Step 3</div>
                            <div className="siimple-steps-item-description">Pricing</div>
                          </div>
                        </>
                      }

                  </div>

                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className='container'>

          <div className="row">
            <div className="col-lg-7 offset-lg-1 mb-5">
                <div id="form-create-item" className="form-border">
                    <div className="field-set">

                          {wizardStep === 0 &&  
                            <>
                              <h5>Title</h5>
                              <input type="text" className="form-control" onChange={titleKeypress} value={title}  placeholder="" />

                              {title === '' && valErrTitle && 
                                <div className="alert alert-danger" role="alert">
                                  A title is required
                                </div>
                              }

                              <div className="spacer-10"></div>
                              <h5>Description</h5>
                              <textarea data-autoresize className="form-control" onChange={descriptionKeypress} value={description} placeholder="A short description, 1 - 2 sentences"></textarea>

                              {description === '' && valErrDesc && 
                                <div className="alert alert-danger" role="alert">
                                  A description is required
                                </div>
                              }

                              <h5>Image Preview</h5>

                              <div className="d-create-file">
                                  <p id="file_name">PNG, JPG, GIF max 5mb</p>
                                  <div className='browse'>
                                    <input type="button" className="btn-main" value="Browse"/>
                                    <input id='upload_file' type="file" accept="image/*" onChange={uploadChange} />
                                  </div>
                              </div>

                              <div className="spacer-30"></div>
                              <input type="button" id="submit" className="btn-main pull-right" onClick={step0ProceedClicked} value="Continue →"/>
                            </>
                          }

                          {wizardStep === 1 &&
                            <>
                              <div className="spacer-10"></div>
                              <h5>Category</h5>
                              <div className='dropdownSelect one'>
                                  <Select styles={customStyles} 
                                          menuContainerStyle={{'zIndex': 999}} 
                                          options={contractTemplatesSelect}
                                          onChange={contractTemplateChange} /></div>

                              <div className="spacer-10"></div>

                              {valErrNoContract && 
                                  <div className="alert alert-danger" role="alert">
                                    Please select a contract
                                  </div>
                              }

                              {currentContractTemplate && 
                                <>
                                  <div className="spacer-30"></div>
                                  <h5>
                                    {currentContractTemplate.name}
                                  </h5>
                                  <div className="spacer-30"></div>

                                  {ctPlaceholders.map( (ct, index) => {
                                      return (
                                        <div key={index}>
                                          {ct.data_type === 0 &&
                                            <>
                                              <h5>{ct.description}</h5>
                                              <input type="text" className="form-control" data-ctpid={ct.id} onChange={placeholderChanged} placeholder="" />
                                            </>
                                          }

                                          {ct.data_type_human === 'Numeric' &&
                                            <>
                                              <h5>{ct.description}</h5>
                                              <input type="number" className="form-control" data-ctpid={ct.id} onChange={placeholderChanged} placeholder="" />
                                            </>
                                          }

                                          {ct.data_type_human === 'Datetime' &&
                                            <>
                                            <h5>{ct.description}</h5>
                                            <input type="date" className="form-control" data-ctpid={ct.id} onChange={placeholderChanged} placeholder="" />
                                          </>
                                        }

                                        { valErrPlaceholders[ct.id] && 
                                          <div className="alert alert-danger" role="alert">
                                            {valErrPlaceholders[ct.id]}
                                          </div>
                                        }
                                          <div className="spacer-10"></div>

                                        </div>
                                      )
                                    }
                                  )}

                                </>
                              }

                              <div className="spacer-60"></div>
                              <input type="button" className="btn-main pull-left" onClick={previewContract} value="Preview Contract"/>
                              <input type="button" className="btn-main pull-right" onClick={step1ProceedClicked} value="Continue →"/>
                            </>
                          }

                          {wizardStep === 2 &&
                            <>
                              <h5>Currency</h5>
                                <div className='dropdownSelect one'>
                                    <Select styles={customStyles} 
                                            menuContainerStyle={{'zIndex': 999}} 
                                            defaultValue={currency} 
                                            options={currencyOptions}
                                            onChange={setCurrency} /></div>

                              <div className="spacer-20"></div> 

                              <h5>Select method</h5>
                              <div className="de_tab tab_methods">
                                  <ul className="de_nav">
                                      <li onClick={setFixedPriceAuction} id="btn_fixed_price" className="active"><span><i className="fa fa-tag"></i>Fixed price</span>
                                      </li>
                                      <li onClick={setTimedAuction} id="btn_timed_auction"><span><i className="fa fa-hourglass-1"></i>Timed auction</span>
                                      </li>
                                  </ul>

                                  <div className="spacer-10"></div>

                                  <div className="de_tab_content pt-3">
                                    <div id="tab_fixed_price">
                                          <h5>Price</h5>
                                          <input type="text" className="form-control" value={price} onChange={priceKeypress} />
                                    </div>
                                    {valPriceErr && 
                                      <div className="alert alert-danger" role="alert">
                                        {valPriceErr}
                                      </div>
                                    }

                                    <div id="tab_auction" className='hide'>
                                      <h5>Minimum bid</h5>
                                      <input type="text" className="form-control" value={price} onChange={priceKeypress} />
                                      { valMinBidErr &&
                                        <div className="alert alert-danger" role="alert">
                                          {valMinBidErr}
                                        </div>
                                      }
                                      <div className="spacer-20"></div>

                                      <div className="row">
                                          <div className="col-md-6">
                                              <h5>Starting date</h5>
                                              <input type="date" onChange={auctionStartDateChanged} className="form-control" min="2022-01-01" />
                                          </div>
                                          <div className="col-md-6">
                                              <h5>Expiration date</h5>
                                              <input type="date" onChange={auctionEndDateChanged}  className="form-control" min="2022-01-01" />
                                          </div>
                                      </div>
                                      { valDateErr &&
                                        <div className="alert alert-danger" role="alert">
                                          {valDateErr}
                                        </div>
                                      }
                                    </div>
                                  </div>
                              </div>

                              <div className="spacer-10"></div>

                              <h5>Royalties</h5>
                              <input type="number" min="0" max="10" className="form-control" defaultValue={royalties} onChange={royaltiesKeypress} placeholder="0 - 10%, maximum is 10%" />
                              {valRoyaltyErr && 
                                <div className="alert alert-danger" role="alert">
                                    {valRoyaltyErr}
                                </div>
                              }

                              <div className="spacer-20"></div>
                              <input type="button" id="submit" className="btn-main pull-right" onClick={createItemClicked} value="Create Item"/>

                            </>
                          }
                    </div>
                </div>
            </div>

            <div className="col-lg-3 col-sm-6 col-xs-12">
              <h5>Preview item</h5>
              <div className="nft__item m-0">
                  {auctionType === AUCTION_TIMED &&
                    <div className="de_countdown">
                      <Clock deadline="December, 30, 2021" />
                    </div>
                  }
                  <div className="author_list_pp">
                      <span>                                    
                          <img className="lazy" src={profile.author_img} alt=""/>
                          { profile.verified && 
                            <i className="fa fa-check"></i>
                          }
                          
                      </span>
                  </div>
                  <div className="nft__item_wrap">
                      <span>
                          <img src="/static/img/collections/coll-item-3.jpg" id="preview_file" className="lazy nft__item_preview" alt=""/>
                      </span>
                  </div>
                  <div className="nft__item_info">
                      <span >
                          <h4>{title}</h4>
                      </span>
                      <div className="nft__item_price">
                          {price} {currencySymbols[currency.value]}
                      </div>
                      <div className="nft__item_action">
                          <span>Place a bid</span>
                      </div>
                      <div className="nft__item_like">
                          <i className="fa fa-heart"></i><span></span>
                      </div>                            
                </div>
            </div>
            
            </div>                                         
        </div>

          </section>

          <Footer />
      </div>
   );
  }

  export default CreatePage;