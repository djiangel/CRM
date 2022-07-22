/**
 * @file
 * js/views/single_message_view.jsx
 *
 * This is a read-only view of an email item that the user has clicked on. This view supports displaying both plain text
 * and html emails.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import { Button, Space, Menu, Dropdown, PageHeader, Descriptions } from 'antd'
import { FilePdfOutlined, FileImageOutlined, ArrowRightOutlined, DownOutlined } from '@ant-design/icons'
import AttachmentView from './attachment_view.js'
import { connect } from "react-redux";

class SingleSentView extends React.Component {

   constructor(props) {
      super(props)
      this.state = {
         visible: false
      }
   }

   handleAttachmentClick = (attachmentclicked) => {
      this.setState({ attachmentclicked: attachmentclicked, visible: true })
   }

   handleCancel = () => {
      this.setState({ visible: false });
   };

   render() {
      let messageDate = moment(this.props.message.date).format('dddd MMM DD, YYYY h:m a');

      let x = 0;

      let attachments = []

      if (this.props.message.attachment.length > 0) {
         for (x = 0; x < this.props.message.attachment.length; x++) {
            if (this.props.message.attachment[x].type.includes("pdf")) {
               attachments.push(<Button type="primary" shape="round" icon={<FilePdfOutlined />} size="large" style={{ marginLeft: 8 }} onClick={this.handleAttachmentClick.bind(this, this.props.message.attachment[x])}>{this.props.message.attachment[x].filename}</Button>)
            };
            if (this.props.message.attachment[x].type.includes("image")) {
               attachments.push(<Button type="primary" shape="round" icon={<FileImageOutlined />} size="large" style={{ marginLeft: 8 }} onClick={this.handleAttachmentClick.bind(this, this.props.message.attachment[x])}>{this.props.message.attachment[x].filename}</Button>)
            };
         }
      }

      return (
         <div className="site-page-header-ghost-wrapper">
            <PageHeader
               ghost={false}
               onBack={this.props.onCancel}
               title={this.props.message.subject}
            >
               <Descriptions size="small" column={1}>
                  {this.props.email_service === "gmail"
                     ? <Descriptions.Item label="To">{this.props.message.to}</Descriptions.Item>
                     : <Descriptions.Item label="To">{this.props.message.to[0].emailAddress.address}</Descriptions.Item>
                  }
                  <Descriptions.Item label="Date">
                     {messageDate}
                  </Descriptions.Item>
               </Descriptions>
            </PageHeader>
            <section>
               <p align="center">
                  <iframe ref="iframe" frameBorder="0" width="90%" ></iframe>
               </p>
            </section>
            <footer>
               <Space size="middle">
                  {attachments}
               </Space>
            </footer>
            <AttachmentView attachment={this.state.attachmentclicked}
               visible={this.state.visible}
               handleCancel={this.handleCancel.bind(this)} />
         </div>
      )
   }

   //
   // This is invoked every time the view shows with some new email message. It is here where we hook into the DOM and
   // place html content into the iframe (which is an HTML component that is good for displaying HTML content).
   //
   componentDidMount() {

      let messageBody = this.props.message.body;
      let iframe = this.refs.iframe;
      let frameDoc = iframe.contentWindow.document;

      //
      // Place the email message's html (or plain text) body into the iframe.
      //
      frameDoc.write(messageBody);

      //
      // Give the content a while to settle. We want to resize the iframe so that it is tall enough to display all of the 
      // content without the need for a scroll bar.
      //
      setTimeout(_ => {
         let contentHeight = frameDoc.body.scrollHeight;
         iframe.height = (contentHeight + 30) + 'px';
      }, 100);
   }
}

const mapStateToProps = (state) => {
   return {
      email_service: state.auth.email_service
   }
}

export default connect(mapStateToProps, null)(SingleSentView);