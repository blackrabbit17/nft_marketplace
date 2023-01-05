import axios from "axios";
import React from 'react';
import Web3 from 'web3';

import { setProfile } from "../../store/actions/profileActions"
import { useDispatch } from "react-redux"
import { useNavigate } from "@reach/router"
import { toast } from "react-toastify";


const Wallet = () => {

    const { ethereum } = window;
    const web3 = new Web3(Web3.givenProvider);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const executeLogin = (address) => {
        axios.get("/api/1.0/login_token").then((resp) => {
            
            const token = resp.data.payload;
            const msg = web3.utils.toHex(token);

            web3.eth.personal.sign(msg, address, function (err, result) {
                axios.post("/api/1.0/login_token", {'address': address, 'signature': result}).then((login_result) => {
                    dispatch(setProfile(login_result.data.payload));
                    localStorage.setItem('profile', JSON.stringify(login_result.data.payload));
                    navigate("/explore/search");
                });
            });
        });
    };
        
    const connectMetaMask = () => {

        ethereum.on('accountsChanged', function (accounts) {
            console.log('accountsChanged');
            executeLogin(ethereum.selectedAddress);
        });

        web3.eth.getAccounts().then(
            (res) => {
                if(res.length === 0) {
                    ethereum.request({ method: 'eth_requestAccounts' });
                }
                else {
                    executeLogin(res[0]);
                }
            }
        );
    };

    const login = () => {
        
        if(!Boolean(ethereum && ethereum.isMetaMask)) {
            toast('No metamask installed');
        }
        else {
            console.log('connecting metamask');
            connectMetaMask();
        }
    }

    return (
        <div className="row">
            <div onClick={login} className="col-lg-3 mb30">
                <span className="box-url">
                    <span className="box-url-label">Most Popular</span>
                    <img src="./static/img/wallet/1.png" alt="" className="mb20"/>
                    <h4>Metamask</h4>
                    <p>Start exploring blockchain applications in seconds.  Trusted by over 1 million users worldwide.</p>
                </span>
            </div>
        </div>
    );
};

export default Wallet;
