import React from 'react';
import ReactDOM from 'react-dom';
import { Spin, Space } from 'antd';

class AuthorizeView extends React.Component { 
   
   componentDidMount() {
   	 this.props.onHandleLogIn()
   } 
   
   render() {
      return (
          <div className="login-view">
             <Space size="middle">
			    <Spin size="large" />
			 </Space>
          </div>
      )
   }
}

export {AuthorizeView};