import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import url from "../core/index";
import "./css/app.css";
import './css/style.css'
import "./css/dashboard.css";


// import global state
import { useGlobalState } from "../context/globalContext";
export default function UserDashboard() {

    const globalState = useGlobalState();

    var [cart, setCart] = useState([]);
    var [products, setProducts] = useState([]);
    var [orderMessage, setMessage] = useState("Cart");
    var address = useRef();
    var phoneNo = useRef();
    var remarks = useRef();
    useEffect(() => {
        axios({
            method: 'get',
            url: `${url}/getproducts`
        }).then((res) => {
            console.log(res);
            setProducts(res.data.products)
        }).catch((err) => {
            console.log('error')
        })
    },[]);




    function addCart(value, index) {
        var products_change = [...products];
        products_change[index].added = true;
        setProducts(products_change);

        var valueToAdd = {
            product: value.product,
            price: value.productPrice,
            quantity: 1,
            productPrice: value.productPrice,
        }

        setCart([...cart, valueToAdd]);
        setMessage("Cart");

    }
    function addQty(index) {
        var prevCart = [...cart];
        prevCart[index].quantity += 1;
        prevCart[index].price = prevCart[index].quantity * prevCart[index].productPrice;
        setCart(prevCart);

    }

    function removeQty(index) {
        if (cart[index].quantity > 1) {
            var prevCart = [...cart];
            prevCart[index].quantity -= 1;
            prevCart[index].price = prevCart[index].quantity * prevCart[index].productPrice;
            setCart(prevCart);
        }
        else {
            for (let i = 0; i < products.length; i++) {
                if (cart[index].product === products[i].product) {
                    var products_change = [...products];
                    products_change[i].added = false;
                    setProducts(products_change);
                }
            }


            let old_cart = [...cart]
            old_cart.splice(index, 1);
            setProducts(products_change);
            setCart(old_cart);
        }

    }
    function checkOut(e) {
        e.preventDefault();
        var productTotal = 0;
        cart.map((value => {
            productTotal += value.price;
        }))

        console.log("cart is=>", cart);


        axios({
            method: 'post',
            url: `${url}/placeOrder`,
            data: {
                cart: cart,
                total: productTotal,
                address: address.current.value,
                phoneNo: phoneNo.current.value,
                remarks: remarks.current.value,
            },

        }).then((response) => {
            console.log("response is = > ", response.data);
            setMessage("Your order has been placed");
            cart.map((value) => {
                value.quantity = 0
                setCart([]);
            });

        }, (error) => {
            console.log("an error occured");
        })
        products.map((value) => value.added = false);
    }



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
                                                    {
                                                        products.map((value, index) => {
                                                            return <div key={index} className="card mr-2 mt-2" style={{ width: "15rem" }} >
                                                                <img style={{height:"170px"}}src={value.productImage} className="card-img-top" alt="..." />
                                                                <div className="card-body">
                                                                    <div className="gradient-img">
                                                                    </div>
                                                                    <h2>{value.productName}</h2>
                                                                    <p className="card-text">
                                                                        {value.productDescription}
                                                                    </p>
                                                                </div>
                                                                <ul className="list-group list-group-flush">
                                                                    <li className="list-group-item">

                                                                        <span className="pricing">STARTING AT <span className="price-of-product">${parseInt(value.productPrice)}</span></span>
                                                                    </li>
                                                                </ul>
                                                                <button onClick={value.added ? () => { return } : (e) => addCart(value, index)} className="cart-btn">{value.added ? "Added" : "Add to cart"}</button>
                                                            </div>
                                                        })
                                                    }
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
                                    <div className="col-lg-3 pd-right-none no-pd">
                                        <div className="right-sidebar">
                                            <div className="widget widget-about">
                                                <img src="images/wd-logo.png" alt="" />
                                                <h3>{orderMessage}</h3>
                                                <div className="sign_link">
                                                    {
                                                        cart.map((value, index) => {
                                                            return <div key={index}>
                                                                <h2>
                                                                    <span className="pricing">{value.product} qty:{value.quantity} <span className="price-of-product">${value.price}</span></span>

                                                                </h2>
                                                                <div className="quantity buttons_added">
                                                                    <input onClick={value.quantity > 0 ? (e) => removeQty(index) : () => { return }} type="button" defaultValue="-" className="minus" />
                                                                    <input style={{ textAlign: "center", width: 34 }} type="text" value={value.quantity} className="input-text qty text" disabled />
                                                                    <input onClick={(e) => addQty(index)} type="button" defaultValue="+" className="plus" />
                                                                </div>


                                                            </div>
                                                        })
                                                    }

                                                </div>
                                            </div>
                                            <hr />
                                        </div>
                                        {
                                            cart.length > 0
                                                ?
                                                <form onSubmit={cart.length > 0 ? (e) => checkOut(e) : () => { return }}>
                                                    <div className="form-row align-items-center">
                                                        <div className="col-auto">
                                                            <label className="sr-only" >Phone Number</label>
                                                            <input required type="text" className="form-control mb-2"
                                                                placeholder="Enter Phone Number"
                                                                ref={phoneNo}
                                                            />
                                                        </div>
                                                        <div className="col-auto">
                                                            <label className="sr-only" htmlFor="inlineFormInputGroup">Address</label>
                                                            <div className="input-group mb-2">

                                                                <input required type="text" className="form-control" id="inlineFormInputGroup"
                                                                    placeholder="Delivery Address"
                                                                    ref={address}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="col-auto mx-auto">
                                                            <textarea
                                                                placeholder='Enter remarks'
                                                                rows="4" cols="50"
                                                                ref={remarks}
                                                            />
                                                        </div>
                                                        <div className="col-auto mx-auto">
                                                            <button class='cart-btn' >{cart.length > 0 ? "Checkout" : "Add Something to checkout"}</button>
                                                        </div>
                                                    </div>
                                                </form>
                                                : ''
                                        }
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