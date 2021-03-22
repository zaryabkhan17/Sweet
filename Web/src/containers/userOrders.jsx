import React, { useEffect } from "react";

import axios from 'axios'
import url from '../core/index';



function UserOrder() {
    const [orders , setOrders] = React.useState([]);
    useEffect(() => {
        axios({
            method: 'get',
            url: `${url}/myorders`,
        }).then((response) => {
            console.log('my orders , ', response)

            setOrders(response.data.placedRequests);
        }, (error) => {
            console.log("an error occured");
        })
    },[])

    return (
        <div>
            <div className="wrapper">
                <main>
                    <div className="main-section">
                        <div className="container">
                            <div className="main-section-data">
                                <div className="row">
                                    <div className="col-lg-9 col-md-8 no-pd">
                                        <div className="main-ws-sec">
                                            <div className="posts-section">
                                                <div className="row">
                                                    <div>
                                                        <div className="card text-center" style={{ width: '18rem' }}>
                                                            <div className="card-body">
                                                                <div>
                                                                    {
                                                                        orders.map(({ cart, total, phoneNo, address , status }, index) => {
                                                                            return (
                                                                                <div key={index} className="card text-center" style={{ width: '18rem' }}>
                                                                                    <div className="card-body">
                                                                                        <h4 className="card-title">{phoneNo}</h4>
                                                                                        <h4 className="card-title">{address}</h4>
                                                                                        <h2>Total is {total}</h2>
                                                                                        {
                                                                                            cart.map((cartVal, i) => {
                                                                                                return <ul key={i}>
                                                                                                    <li>
                                                                                                        <p>{cartVal.product} Price <b>{cartVal.productPrice} x {cartVal.quantity}</b></p>
                                                                                                        <small> <b>status : {status}</b> </small>
                                                                                                    </li>
                                                                                                </ul>
                                                                                            })
                                                                                        }
                                                                                 
                                                                                    </div>
                                                                                </div>
                                                                            )

                                                                        })
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>

                                                {/* Loding Logo */}
                                                <div className="process-comm">
                                                    <div className="spinner">
                                                        <div className="bounce1"></div>
                                                        <div className="bounce2"></div>
                                                        <div className="bounce3"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default UserOrder;