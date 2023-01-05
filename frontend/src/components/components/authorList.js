import axios from "axios"
import React, { useEffect, useState } from 'react';
import { Link } from '@reach/router';


const Authorlist = () => {

    const [topsellers, setTopSellers] = useState([]);

    const fetchTopSellers = async() => {
        const resp = await axios.get("/api/1.0/web/topsellers").catch((err) => { console.log(err); });
        setTopSellers(resp.data.payload);
    }

    useEffect(() => {
        fetchTopSellers();
    }, []);

    const walletShorthand = (wallet_addr) => {
        return '0x' + wallet_addr.slice(2, 5) + '..'  + wallet_addr.slice(wallet_addr.length - 3)
    }

    return (
        <div>
            <ol className="author_list">
                {topsellers.map( (profile, index) => (
                    <li key={profile.id}>                                    
                        <div className="author_list_pp">
                            <Link to={"/profile/" + profile.address}>
                                <img className="lazy" src={profile.author_img} alt=""/>
                                { profile.verified &&
                                    <i className="fa fa-check"></i>
                                }
                            </Link>
                        </div>                                    
                        <div className="author_list_info">
                            <Link to={"/profile/" + profile.address}>{profile.username || walletShorthand(profile.address)}</Link>
                            <span className="bot">3.2 ETH</span>
                        </div>
                    </li>
                ))}
            </ol>
        </div>
    )
}

export default Authorlist;