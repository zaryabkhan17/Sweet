import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";



import "./css/app.css";
import './css/style.css'

// importing context
import { useGlobalState } from "../context/globalContext";

// importing url 
import url from "../core";


import Logout from "../components/logout";


// import socket
import socket from "../config/socket";



export default function CheckOrders() {

    console.log('socket is=>', socket);
    const globalState = useGlobalState();
    const [orders, setOrders] = useState([]);
    const [realTime, setRealTime] = useState(false);
    useEffect(() => {
        let arr = [];
        axios({
            method: 'get',
            url: `${url}/getOrders`,
        }).then((response) => {

            response.data.placedRequests.map((value) => {
                arr.push(value);
            })
            setOrders(arr);
        }, (error) => {
            console.log("an error occured");
        })

        socket.on('requests', (data) => {
            setRealTime(!realTime);
        })
    }, [realTime])


    const confirmOrder = (index) => {
        console.log(orders[index]._id)
        axios({
            method: 'patch',
            url: `${url}/confirmOrder`,
            data: {
                id: orders[index]._id,
            },

        }).then((res) => {
            alert('Order confirmed');
            setRealTime(!realTime);
        }).catch((err) => {
            console.log("error is=>", err);
        })
    }

    return (
        <div>
            <div className="wrapper">
                <nav className="navbar navbar-expand-lg navbar-light bg-light">
                    <a className="navbar-brand" href="#">{globalState.user.userName}</a>
                    <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon" />
                    </button>
                    <div className="collapse navbar-collapse" id="navbarText">
                        <ul className="navbar-nav mr-auto">
                            <li className="nav-item active">
                                <Link to='/'><a className="nav-link" >Home <span className="sr-only">(current)</span></a></Link>
                            </li>
                            <li className="nav-item active">
                                <Link to='/checkorders'><a className="nav-link" >See Orders<span className="sr-only"></span></a></Link>
                            </li>
                            <li className="nav-item active">
                                <Link to='/addproduct'><a className="nav-link" >Add Products<span className="sr-only"></span></a></Link>
                            </li>
                        </ul>
                        <Logout />
                    </div>
                </nav>
                <main>
                    <div className="main-section">
                        <div className="container">
                            <div className="main-section-data">
                                <div className="row">
                                    <div className="col-lg-3 col-md-4 pd-left-none no-pd">
                                        <div className="main-left-sidebar no-margin">
                                            <div className="user-data full-width">
                                                <div className="user-profile">
                                                    <div className="username-dt">
                                                        <div className="usr-pic">
                                                        </div>
                                                    </div>
                                                    <div className="user-specs">
                                                        <h3>{globalState.user.userName}</h3>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-6 col-md-8 no-pd">
                                        <div className="main-ws-sec">
                                            <div className="post-topbar">

                                            </div>
                                            <div>
                                                {
                                                    orders.reverse().map(({ cart, userEmail, total, phoneNo, address, remarks }, index) => {
                                                        return (
                                                            <div key={index} className="card text-center" style={{ width: '18rem' }}>
                                                                <div className="card-body">
                                                                    <h5 className="card-title">{userEmail}</h5>
                                                                    <h4 className="card-title">{phoneNo}</h4>
                                                                    <h4 className="card-title">{address}</h4>
                                                                    <h2>Total is {total}</h2>
                                                                    {
                                                                        cart.map((cartVal, i) => {
                                                                            return <ul key={i}>
                                                                                <li>
                                                                                    <p>{cartVal.product} Price <b>{cartVal.productPrice} x {cartVal.quantity}</b></p>
                                                                                    <small>{remarks} </small>
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
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}