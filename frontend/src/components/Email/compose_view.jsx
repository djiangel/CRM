import React, { useState, useEffect } from 'react';
import './Compose.css';
import { Input, Upload, message, Form, Button, Drawer } from 'antd';
import { ArrowRightOutlined, InboxOutlined } from '@ant-design/icons'

export default function Compose(props) {
  
  const { TextArea } = Input;
  const { Dragger } = Upload;

  const [visible, setVisible] = useState(false);
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [attachment, setAttachment] = useState([]);

  useEffect(() => {
    showSubject();
  }, [subject])

  useEffect(() => {
    showTo();
  }, [to])

  const showDrawer = () => {
    setVisible(true);
  };
  const onClose = () => {
    setVisible(false);
  };

  const showSubject = () => {
    return subject;
  };

  const showTo = () => {
    return to;
  };

  const formItemLayout = {
      labelCol: {
        sm: { span: 3 },
      },
      wrapperCol: {
        sm: { span: 20},
      },
    };

  const normFile = e => {

      if (Array.isArray(e)) {
        return e;
      }

      return e && e.fileList;
    };

  const fullWidth = global.window.innerWidth * 0.75

  const setReply = () => {
    for (let i=0; i<props.messages.length; i++) {
      if (props.messages[i].label === "INBOX") { break; }
      setTo(props.messages[i].from);
      setSubject("Re: " + props.messages[i].subject);
    }
  }