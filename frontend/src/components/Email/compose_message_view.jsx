import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import { Input, Upload, message, PageHeader, Form, Button } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import EditableTagGroup from './Compose/tabgroup';
import { connect } from "react-redux";
import combinedSage from '../../redux/sagas';
import { GmailController } from './../../api/gmail_controller.js';

const { TextArea } = Input;
const { Dragger } = Upload;

class ComposeMessageView extends React.Component {

  constructor(props) {
    super(props);
    this.gmailController = new GmailController();
    this.state = {
      to: this.props.replyTo,
      subject: props.message ? 'Re: ' + props.message.subject : '',
      body: '',
      attachment: [],
    };
    this.handleAttachment = this.handleAttachment.bind(this);
  }

  componentDidMount() {
    if (this.props.type === "compose from ticket") {
      this.props.changeReplyTo(this.props.ticketReply)
    }
    else {
      this.props.changeReplyTo([])
    }
  }

  //
  // The user clicked the "Send" button.
  //
  handleSend() {
    if (this.props.message) {
      let origMessageDate = moment(this.props.message.date).format('dddd MMM DD, YYYY h:m a');
      //
      // Just being lazy here directly changing the state as the form exits.
      //
      var origBody = this.state.body;
      origBody += '\r\n\r\n==================================================================';
      origBody += '\r\n\r\nOn ' + origMessageDate + ' ' + this.props.message.from + ' Sent:\r\n\r\n' + this.props.message.body;
      this.state.body = origBody;
    }
    this.gmailController.sendEmail(this.state).then(() => {

    })
  }

  //
  // The user typed something into the "To:" text field. Update the local model stored in "state" to reflect what the
  // user has entered.
  //

  //
  // The user typed something into the "Subject:" text field. Update the local model stored in "state" to reflect what the
  // user has entered.
  //
  handleChangeSubject(evt) {
    this.setState({
      subject: evt.target.value
    });
  }

  //
  // The user typed something into the "Body:" text field. Update the local model stored in "state" to reflect what the
  // user has entered.
  //
  handleChangeBody(evt) {
    this.setState({
      body: evt.target.value
    });
  }

  handleChange(changedValues, allValues) {
    this.setState({
      subject: allValues.subject,
      body: allValues.message
    })
  }

  handleAttachment(info) {
    const { status } = info.file;
    if (status !== 'uploading') {
      let reader = new FileReader();
      reader.onload = (e) => {
        info.file.data = e.target.result;
      }
      reader.readAsDataURL(info.file.originFileObj);
    }
    if (status === 'done') {
      this.setState({ attachment: [...this.state.attachment, info.file] })
      message.success(`${info.file.name} file uploaded successfully.`);
    } else if (status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  }

  handleRemoveAttachment(info) {
    let newArray = this.state.attachment.filter(item => item.name !== info.name)
    this.setState({
      attachment: newArray
    });
  }

  render() {

    let title = this.props.message ? 'Reply' : 'Compose New Email';

    const formItemLayout = {
      labelCol: {
        sm: { span: 2 },
      },
      wrapperCol: {
        sm: { span: 20 },
      },
    };

    const normFile = e => {

      if (Array.isArray(e)) {
        return e;
      }

      return e && e.fileList;
    };

    return (
      <div>
        <Form
          {...formItemLayout}
          name="register"
          onFinish={this.handleSend.bind(this)}
          onValuesChange={this.handleChange.bind(this)}
          scrollToFirstError
        >
          <Form.Item
            name="email"
            label="To"
            initialValue={this.state.to}
          >
            <EditableTagGroup />
          </Form.Item>
          <Form.Item
            name="subject"
            label="Subject"
            initialValue={this.state.subject}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="message"
            label="Message"
            initialValue={this.state.body}
          >
            <TextArea autoSize={{ minRows: 8, maxRows: 10 }} />
          </Form.Item>
          <Form.Item label="Attachment">
            <Form.Item name="attachment" valuePropName="fileList" getValueFromEvent={normFile} noStyle>
              <Upload.Dragger name="file"
                multiple
                action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                onChange={this.handleAttachment.bind(this)}
                onRemove={this.handleRemoveAttachment.bind(this)}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">Click or drag file to this area to upload</p>
                <p className="ant-upload-hint">Drop your attachments here</p>
              </Upload.Dragger>
            </Form.Item>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Send
          </Button>
          </Form.Item>
        </Form>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    replyTo: state.email.replyTo
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    changeReplyTo: (to) => dispatch({ type: 'CHANGE_REPLYTO', replyTo: to }),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ComposeMessageView);