import React, { useState, useEffect } from 'react'
import './App.css';
import 'antd/dist/antd.css';
import { HashRouter as Router } from 'react-router-dom'
import Alerts from './components/Application/Alerts'
import { Provider as AlertProvider } from 'react-alert';
import { Alert } from 'antd';
import { Route, Switch, withRouter } from "react-router-dom";
import Login from "./containers/Authentication/Login";
import Main from "./Main";
import PrivateRoute from './Routes/PrivateRoute';
import { connect } from 'react-redux';
import { Spin } from 'antd/lib';
import { useDispatch, useSelector } from 'react-redux'
import { useMediaQuery } from 'react-responsive'
import MoonLoader from "react-spinners/MoonLoader";
import 'react-resizable/css/styles.css'
import 'react-grid-layout/css/styles.css'

const alertOptions = {
  timeout: 4000,
  position: 'top center',
  offset: '10px',
};

const AlertTemplate = ({ style, options, message }) => (
  <Alert
    style={style}
    message={options.type}
    description={message}
    type={options.type}
    showIcon
    closable
  />)

export default function App() {

  const dispatch = useDispatch()
  const loading = useSelector(state => state.loading.loading)


  const sm = useMediaQuery({ minWidth: 768 });
  const md = useMediaQuery({ minWidth: 992 });
  const lg = useMediaQuery({ minWidth: 1200 });
  const datatable = useMediaQuery({ maxWidth: 959.95 });

  window.addEventListener("resize", () => dispatch({ type: 'SCREEN_HEIGHT', height: window.innerHeight }))

  useEffect(() => {
    dispatch({ type: 'MEDIA_QUERY', sm: sm, md: md, lg: lg });
  }, [sm, md, lg])

  useEffect(() => {
    dispatch({ type: 'DATATABLE', datatable: datatable })
  }, [datatable])

  useEffect(() => {
    dispatch({ type: 'CHECK_AUTH' });
    const height = window.innerHeight;
    dispatch({ type: 'SCREEN_HEIGHT', height: height });
  }, []);

  if (loading['authentication'] === true) {
    return (
      <div style={{ textAlign: "center", marginTop: '10%' }}>
        <Spin indicator={<MoonLoader
          size={100}
          color={"#1890ff"}
          loading={true}
        />}
          tip="Securing your session..." />
      </div>
    )
  }
  else {
    return (
      <AlertProvider template={AlertTemplate}{...alertOptions}>
        <Router>
          <Alerts />
          <Switch>
            <PrivateRoute exact path="/" component={Main} />
            <Route path="/login" component={Login} />
          </Switch>
        </Router>
      </AlertProvider>
    )

  }
}


