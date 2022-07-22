
import React, { Component } from 'react'

var Loader = require('react-loaders').Loader;

export class LoadingScreen extends Component {
    render() {
        return (
            <div style={{ textAlign: 'center' }}>
                hi
                <Loader type="line-scale" active />
            </div>
        )
    }
}

export default LoadingScreen
