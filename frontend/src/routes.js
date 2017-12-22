
import React from "react";
import { Route, Switch } from "react-router-dom";
import {
    asyncComponent,
    AuthenticatedRoute,
    UnauthenticatedRoute
} from "./components";
import './containers/shared.css';

const AsyncLogin = asyncComponent(() => import("./containers/login.ui"));
const AsyncHome = asyncComponent(() => import("./containers/home.ui"));
const AsyncNotFound = asyncComponent(() => import("./containers/notfound.ui"));

export default ({ childProps }) => <Switch>
    <UnauthenticatedRoute path="/login" exact component={AsyncLogin} props={childProps} />
    <AuthenticatedRoute path="/" exact component={AsyncHome} props={childProps} />
    <Route component={AsyncNotFound} />
</Switch>;