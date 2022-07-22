import React, { useState, useEffect } from 'react';
import './Compose.css';
import { Input, Upload, message, Form, Button, Drawer, Tag, Tooltip } from 'antd';
import { ArrowRightOutlined, InboxOutlined, PlusOutlined } from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { GmailController } from '../../../api/gmail_controller.js';
import EditableTagGroup from './tabgroup'

export default function Reply(props) {

  const gmailController = new GmailController()
  const { TextArea } = Input;
  const { Dragger } = Upload;
  const [form] = Form.useForm();

  const [visible, setVisible] = useState(false);
  const [body, setBody] = useState('');
  const [attachment, setAttachment] = useState([]);
  const [replySubject, setSubject] = useState('')
  const replyTo = useSelector(state => state.email.replyTo)
  const initialSubject = props.replySubject
  const initialBody = ''


  const showDrawer = () => {
    setVisible(true);
  };
  const onClose = () => {
    setVisible(false);
  };

  useEffect(() => {
    setSubject(initialSubject);
  }, [])

  useEffect(() => {
    form.setFieldsValue({
      subject: initialSubject,
      message: initialBody
    })
  }, [initialSubject, initialBody])

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
    console.log(changedValues)
    console.log(allValues)
    setSubject(allValues.subject)
    setBody(allValues.message)
  }

  const handleSendEmail = (email) => {
    console.log(email)
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
    let replyemail
    //check reply for inbox or conversation
    console.log(props.message)
    if (props.message.constructor == Object) {
      console.log(replyTo)
      replyemail = {
        to: replyTo,
        subject: replySubject,
        body: body,
        attachment: attachment,
        replyid: props.message.replyid,
        threadid: props.message.threadid,
        microsoftreplyid: props.message.id
      }
    }

    else {
      console.log(replyTo)
      for (let i = 0; i < props.message.length; i++) {
        if (props.message[i].label === "INBOX") {
          let origMessageDate = moment(props.message[i].date).format('dddd MMM DD, YYYY h:m a');
          var origBody = body;
          origBody += '\r\n\r\n==================================================================';
          origBody += '\r\n\r\nOn ' + origMessageDate + ' ' + props.message.from + ' Sent:\r\n\r\n' + props.message.body;
          setBody(origBody);
          replyemail = {
            to: replyTo,
            subject: replySubject,
            body: body,
            attachment: attachment,
            replyid: props.message[i].replyid,
            threadid: props.message[i].threadid,
            microsoftreplyid: props.message[i].id
          }
          break;
        }
      }
    }
    handleSendEmail(replyemail)
  }


  return (
    <div className="compose" style={{ marginLeft: 'auto', marginRight: '0px' }}>
      <Button type="primary" size="large" shape="round" style={{ background: "#52c41a", borderColor: "#52c41a", display: "block", marginLeft: 8 }} onClick={showDrawer}>Reply<ArrowRightOutlined /></Button>
      <Drawer
        title="Reply"
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
            <EditableTagGroup type="reply" />
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