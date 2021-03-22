import {
  BrowserRouter as Router,
  HashRouter,
  Route,
  Link,
  Redirect,
} from "react-router-dom";
import React from "react";

// Importing containers
import Signup from "../containers/signup"
import Dashboard from "../containers/userdashboard"
import AdminDashboard from "../containers/vendordashboard";
import Signin from "../containers/signin";
import ForgetPassword from "../containers/forget-password";
import UserOrder from '../containers/userOrders';
import CheckOrders from "../containers/checkorders";
import AddProduct from "../containers/addProduct";

//importing components
import Header from '../components/header';


import { useGlobalState } from "../context/globalContext.js";

export default function AppRouter() {

  const globalState = useGlobalState()

  return (




    <HashRouter>
      {(globalState.loginStatus === false) ?
        <>
          <Route exact={true} path="/">
            <Signin />
          </Route>

          <Route path="/signup">
            <Signup />
          </Route>
          <Route path="/forget-password">
            <ForgetPassword />
          </Route>

          <Route path="*">
            <Redirect to="/" />
          </Route>
        </>
        : null}

      {/* private routes */}

      {(globalState.roll === "user" && globalState.loginStatus === true) ?

        <>
          <Header userName={globalState.user.userName} />
          <Route exact path="/">
            <Dashboard />
          </Route>
          <Route  path="/myorders">
            <UserOrder />
          </Route>

          <Route path="*">
            <Redirect to="/" />
          </Route>
        </>
        : null}

      {(globalState.roll === "admin" && globalState.loginStatus === true) ?

        <>

          <Route exact path="/">
            <AdminDashboard />
          </Route>
          <Route exact path="/checkorders">
            <CheckOrders />
          </Route>
          <Route exact path="/addproduct">
            <AddProduct />
          </Route>
          <Route path="*">
            <Redirect to="/" />
          </Route>
        </>
        : null}
    </HashRouter >

  );
}
