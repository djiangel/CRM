import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

const PrivateRoute = ({ component: Component, auth, emailview, ...rest }) => (
  <Route
    {...rest}
    render={(props) => {
      if (!auth.isAuthenticated) {
        return <Redirect to={{
          pathname: "/login",
        }} />;
      } else {
        return <Component {...props} emailview={emailview} />;
      }
    }}
  />
);


const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps)(PrivateRoute);