import React, { Component } from 'react'
import './App.css';
import 'antd/dist/antd.css';
import { BrowserRouter as Router } from 'react-router-dom'
import BaseRouter from './Routes/routes';
import LayoutHeader from './containers/Application/LayoutHeader';

class Main extends Component {

  render() {
    return (
      <Router>
        <LayoutHeader>
          <BaseRouter />
        </LayoutHeader>
      </Router>
    )
  }
}


export default Main;
