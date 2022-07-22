import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import axios from 'axios';
import Reply from './Compose';
import Forward from './forward_view.js';
import { Button, Space, Menu, Dropdown, PageHeader, Descriptions } from 'antd'
import { FilePdfOutlined, FileImageOutlined, DownOutlined } from '@ant-design/icons'
import AttachmentView from './attachment_view.js'
import { connect } from "react-redux";

const baseURL = process.env.REACT_APP_BACK_URL

class SingleMessageView extends React.Component {

   constructor(props) {
      super(props)
      this.state = {
         projectlist: [],
         loading: true,
         assigned: false,
         assignedname: '',
         visible: false,
      }
   }

   handleAssignClick = (key) => {
      let url = `${baseURL}mailapi/`;
      let projectid = key.key
      let name
      let form_data = {
         mailid: this.props.message.id,
         body: this.props.message.body,
         date: this.props.message.date,
         subject: this.props.message.subject,
         email: this.props.message.from,
         tagged_project: key.key
      }
      axios.post(url, form_data).then(res => {
         console.log('success', res.data);
      }).catch(err => console.log(err))
      let i
      for (i = 0; i < this.state.projectlist.length; i++) {
         if (this.state.projectlist[i].id == projectid) {
            name = this.state.projectlist[i].name
         }
      }
      this.setState({ assigned: true, assignedname: name })
   };

   handleAttachmentClick = (attachmentclicked) => {
      this.setState({ attachmentclicked: attachmentclicked, visible: true })
   }

   handleCancel = () => {
      this.setState({ visible: false });
   };

   render() {

      let assigned;
      let attachment;

      let messageDate = moment(this.props.message.date).format('dddd MMM DD, YYYY h:m a');

      let displaylist = []

      let len = this.state.projectlist.length
      let i = 0

      for (i = 0; i < len; i++) {
         displaylist.push(<Menu.Item key={this.state.projectlist[i].id}>{this.state.projectlist[i].name}</Menu.Item>)
      }

      let menu = (
         <Menu onClick={this.handleAssignClick.bind(this)}>
            {displaylist}
         </Menu>
      );

      if (this.state.assigned) {
         assigned = <small style={{ marginLeft: 8 }}>Assigned to: {this.state.assignedname}</small>;
      }
      else {
         assigned = null
      }

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
                  {this.props.message.from.emailAddress
                     ? <Descriptions.Item label="From">{this.props.message.from.emailAddress.address}</Descriptions.Item>
                     : <Descriptions.Item label="From">{this.props.message.from}</Descriptions.Item>
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
               <br />
               <br />
               <Reply replySubject={this.props.replySubject} replyTo={this.props.replyTo} message={this.props.message} />
               <Forward forwardSubject={this.props.replySubject} message={this.props.message} />
               <br />
               <Dropdown overlay={menu}>
                  <Button style={{ marginLeft: 8 }}>
                     Assign <DownOutlined />
                  </Button>
               </Dropdown>
               <br />
               <br />
               {assigned}
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
      let projecturl = `${baseURL}salesprojectapi/`
      let mailurl = `${baseURL}mailapi/`


      //
      // Place the email message's html (or plain text) body into the iframe.
      //
      axios.get(projecturl).then(res => {
         this.setState({ projectlist: res.data })
         this.setState({ loading: false })
      })

      axios.get(mailurl).then(res => {
         let taggedmail = res.data
         let len = taggedmail.length
         let i = 0
         let x = 0
         for (i = 0; i < len; i++) {
            if (taggedmail[i].mailid == this.props.message.id) {
               console.log('assigned')
               let projectid = taggedmail[i].tagged_project
               console.log(projectid)
               for (x = 0; x < this.state.projectlist.length; x++) {
                  if (this.state.projectlist[x].id == projectid) {
                     this.setState({ assignedname: this.state.projectlist[x].name, assigned: true })
                  }
               }
               //this.setState({assignedname: })
            }
            else {
               console.log('not assigned')
            }
         }
      })
      let messageBody = this.props.message.body;
      let iframe = this.refs.iframe;
      let frameDoc = iframe.contentWindow.document;

      frameDoc.write(messageBody);


      //
      // Give the content a while to settle. We want to resize the iframe so that it is tall enough to display all of the 
      // content without the need for a scroll bar.
      //
      setTimeout(_ => {
         try {
            let contentHeight = frameDoc.body.scrollHeight;
            iframe.height = (contentHeight + 30) + 'px';
         }
         catch (err) {
            console.log(err)
         }
      }, 100);
   }
}

const mapStateToProps = (state) => {
   return {
      replySubject: state.email.replySubject,
      replyTo: state.email.replyTo
   }
}

export default connect(mapStateToProps, null)(SingleMessageView);