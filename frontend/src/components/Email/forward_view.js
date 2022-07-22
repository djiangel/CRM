import React, { useState, useEffect } from 'react';
import { Input, Upload, message, Form, Button, Drawer } from 'antd';
import { SendOutlined, InboxOutlined } from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { GmailController } from './../../api/gmail_controller.js';

export default function Forward(props) {

  const gmailController = new GmailController()
  const { TextArea } = Input;
  const { Dragger } = Upload;
  const [form] = Form.useForm();

  console.log(props.message)

  const [visible, setVisible] = useState(false);
  const [body, setBody] = useState('');
  const [attachment, setAttachment] = useState([]);
  const [forwardSubject, setSubject] = useState('')
  const [forwardTo, setTo] = useState('')
  const initialSubject = props.forwardSubject
  const initialTo = props.forwardTo
  const email_service = useSelector(state => state.auth.email_service)
  let initialBody
  if (email_service === "gmail") {
    initialBody = [
      '---------- Forwarded message ---------<br />',
      'From: ' + props.message.from + '<br />',
      'Date: ' + props.message.date + '<br />',
      'Subject: ' + props.message.subject + '<br />',
      'To: ' + props.message.to + '<br />',
      props.message.body
    ].join('')
  }

  if (email_service === "outlook") {
    initialBody = [
      '---------- Forwarded message ---------<br />',
      'From: ' + props.message.from.emailAddress.address + '<br />',
      'Date: ' + props.message.date + '<br />',
      'Subject: ' + props.message.subject + '<br />',
      'To: ' + props.message.to[0].emailAddress.address + '<br />',
      props.message.body
    ].join('')
  }



  const showDrawer = () => {
    setVisible(true);
  };
  const onClose = () => {
    setVisible(false);
  };

  useEffect(() => {
    setSubject(initialSubject);
    setTo(initialTo);
  }, [])

  useEffect(() => {
    form.setFieldsValue({
      email: initialTo,
      subject: initialSubject,
      message: initialBody
    })
  }, [initialTo, initialSubject, initialBody])

  const formItemLayout = {
    labelCol: {
      sm: { span: 3 },
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

  const fullWidth = global.window.innerWidth * 0.75

  const handleChange = (changedValues, allValues) => {
    setTo(allValues.email)
    setSubject(allValues.subject)
    setBody(allValues.message)
    console.log(allValues)
  }

  const handleSendEmail = (email) => {
    gmailController.sendEmail(email).then(() => {
      setVisible(false)
    })
  }

  const handleAttachment = (info) => {
    const { status } = info.file;
    if (status !== 'uploading') {
      let reader = new FileReader();
      reader.onload = (e) => {
        info.file.data = e.target.result;
      }
      reader.readAsDataURL(info.file.originFileObj);
    }
    if (status === 'done') {
      let tempattachment = []
      tempattachment.push(info.file)
      setAttachment(tempattachment)
      message.success(`${info.file.name} file uploaded successfully.`);
    } else if (status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  }

  const handleSend = () => {
    let forwardemail
    //check reply for inbox or conversation
    if (props.message.constructor == Object) {
      forwardemail = {
        to: forwardTo,
        subject: forwardSubject,
        body: body,
        attachment: attachment,
        threadid: props.message.threadid,
        microsoftforwardid: props.message.id
      }
    }

    else {
      for (let i = 0; i < props.message.length; i++) {
        if (props.message[i].label === "INBOX") {
          let origMessageDate = moment(props.message[i].date).format('dddd MMM DD, YYYY h:m a');
          var origBody = body;
          origBody += '\r\n\r\n==================================================================';
          origBody += '\r\n\r\nOn ' + origMessageDate + ' ' + props.message.from + ' Sent:\r\n\r\n' + props.message.body;
          setBody(origBody);
          forwardemail = {
            to: forwardTo,
            subject: forwardSubject,
            body: body,
            attachment: attachment,
            threadid: props.message[i].threadid,
            microsoftforwardid: props.message.id
          }
          break;
        }
      }
    }
    console.log(forwardemail)
    handleSendEmail(forwardemail)
  }


  return (
    <div className="compose" style={{ marginLeft: 'auto', marginRight: '0px' }}>
      <Button type="primary" size="large" shape="round" style={{ background: "#52c41a", borderColor: "#52c41a", display: "block", marginLeft: 8 }} onClick={showDrawer}>Forward<SendOutlined /></Button>
      <Drawer
        title="Forward"
        placement="right"
        closable={false}
        onClose={onClose}
        visible={visible}
        width={fullWidth}
      >
        <Form
          form={form}
          {...formItemLayout}
          name="register"
          onFinish={handleSend}
          onValuesChange={handleChange}
          scrollToFirstError
        >
          <Form.Item
            name="email"
            label="To"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="subject"
            label="Subject"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="message"
            label="Message"
          >
            <TextArea autoSize={{ minRows: 8, maxRows: 10 }} />
          </Form.Item>
          <Form.Item label="Attachment">
            <Form.Item name="attachment" valuePropName="fileList" getValueFromEvent={normFile} noStyle>
              <Upload.Dragger name="file"
                multiple
                action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                onChange={handleAttachment}
                onRemove={null}>
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
      </Drawer>
    </div>
  );
}