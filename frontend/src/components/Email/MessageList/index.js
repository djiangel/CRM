import React, { useEffect, useState } from 'react';
import Reply from '../Compose';
import Toolbar from '../Toolbar';
import ToolbarButton from '../ToolbarButton';
import Message from '../Message';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux'
import { Button, Dropdown, Menu, Drawer, Popconfirm, message } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import DynamicForm from '../../Application/DynamicForm';
import { useHistory } from "react-router-dom";

import './MessageList.css';
import axiosInstance from '../../../api/axiosApi';

export default function MessageList(props) {
  let history = useHistory();
  let [messages, setMessages] = useState([])
  let [pocs, setPocs] = useState([])
  let [project, setProject] = useState([])
  let [tickets, setTickets] = useState([])
  let [error, setError] = useState(null)
  let [clear, setClear] = useState(false)
  let [refresh, setRefresh] = useState(true)
  const [visible, setVisible] = useState(false);
  const [key, setKey] = useState(null);
  const threadid = useSelector(state => state.email.threadid)
  const replySubject = useSelector(state => state.email.replySubject)
  const replyTo = useSelector(state => state.email.replyTo)
  let conversationlist = useSelector(state => state.email.conversationlist)
  const ticketId = useSelector(state => state.ticket.ticket.id)

  if (props.messages) {
    conversationlist = props.messages
  }

  useEffect(() => {
    getMessages();
  }, [threadid])

  useEffect(() => {
    getCustomers();
    getProject();
    getTickets();
  }, [])

  const getMessages = () => {
    for (let i = 0; i < conversationlist.length; i++) {
      if (conversationlist[i][0].threadid === threadid) {
        setMessages(conversationlist[i])
      }
    }
  }

  const getProps = () => {
    let data;
    let from;
    let to = []
    if (messages.length > 0) {
      if (messages[messages.length - 1].from.emailAddress) {
        from = messages[messages.length - 1].from.emailAddress.address
        for (let i = 0; i < messages[messages.length - 1].to.length; i++) {
          to.push(messages[messages.length - 1].to[i].emailAddress.address)
        }
      }
      else {
        from = messages[messages.length - 1].from
        to.push(messages[messages.length - 1].to)
      }

      data = {
        subject: messages[messages.length - 1].subject,
        from: from,
        to: to,
        cc: messages[messages.length - 1].cc,
        date: messages[messages.length - 1].date
      }
    }
    else {
      data = {
        subject: null,
        from: null,
        to: null,
        cc: null,
        date: null,
      }
    }

    return data
  }



  const renderMessages = () => {
    console.log(messages)
    let i = 0;
    let messageCount = messages.length;
    let tempMessages = [];
    while (i < messageCount) {
      messages = messages.sort((a, b) => {
        return moment(a.date).diff(b.date)
      })
      let previous = messages[i - 1];
      let current = messages[i];
      let next = messages[i + 1];
      let isMine = current.label === "SENT";
      let currentMoment = moment(current.date);
      let prevBySameAuthor = false;
      let nextBySameAuthor = false;
      let startsSequence = true;
      let endsSequence = true;
      let showTimestamp = true;

      if (previous) {
        let previousMoment = moment(previous.date);
        let previousDuration = moment.duration(currentMoment.diff(previousMoment));
        prevBySameAuthor = previous.from === current.from;

        if (prevBySameAuthor && previousDuration.as('hours') < 1) {
          startsSequence = false;
        }

        if (previousDuration.as('hours') < 1) {
          showTimestamp = false;
        }
      }

      if (next) {
        let nextMoment = moment(next.date);
        let nextDuration = moment.duration(nextMoment.diff(currentMoment));
        nextBySameAuthor = next.from === current.from;

        if (nextBySameAuthor && nextDuration.as('hours') < 1) {
          endsSequence = false;
        }
      }

      tempMessages.push(
        <Message
          key={i}
          isMine={isMine}
          startsSequence={startsSequence}
          endsSequence={endsSequence}
          showTimestamp={showTimestamp}
          data={current}
        />
      );

      // Proceed to the next message.
      i += 1;

    }

    return tempMessages;
  }
  const assignType = (e) => {
    setKey(e.key);
    showDrawer()
  }

  const menu = (
    <Menu onClick={assignType}>
      <Menu.Item key="customer">Customer</Menu.Item>
      <Menu.Item key="salesproject">Sales Project</Menu.Item>
      <Menu.Item key="ticket">Existing Tickets</Menu.Item>
      <Menu.Item key="unassigned">Unassigned</Menu.Item>
    </Menu>
  );

  const unassignEmail = (e) => {
    axiosInstance.delete(`/assigned-email/${threadid}/`).then(response => {
      console.log('deleting here')
      console.log(response.data)
      message.success('Successfully Deleted');
      window.location.reload(false);
    }).catch(error => {
      console.log('there is an error')
      console.log(error)
    })
  }

  function cancel(e) { }

  let replybutton = <Reply replySubject={replySubject} message={messages} />
  let assignbutton = <Dropdown overlay={menu}><a className="ant-dropdown-link" onClick={e => e.preventDefault()}>Assign Ticket<DownOutlined /></a></Dropdown>
  let unassignbutton = <Popconfirm title="Are you sure unassign this email?" onConfirm={unassignEmail} onCancel={cancel} okText="Yes" cancelText="No"><a href="#">Unassign Email</a></Popconfirm>

  //<D onClick={()=>assignTicket(messages[0].threadid)}>Assign Ticket</Button>

  const assignTicket = (data) => {
    data.source = "email"
    //data.assignedemail = JSON.stringify(messages)
    for (let i = 0; i < messages.length; i++) {
      if (messages[i].label === "INBOX") {
        data.title = messages[i].subject
        data.emailid = messages[i].threadid
        data.content = messages[i].snippet
        if (messages[i].from.emailAddress) {
          data.email = messages[i].from.emailAddress.address
          data.name = messages[i].from.emailAddress.name
        }
        else {
          if (messages[i].from.includes("<")) {
            data.email = messages[i].from.split('<')[1].replace('>', '')
            data.name = messages[i].from.split(' <')[0]
          }
          else {
            data.email = messages[i].from
            data.name = messages[i].from.split('@')[0]
          }
        }
        break;
      }
    }
    console.log(data)
    onClose()

    axiosInstance.post(`/ticket/createfromemail/`, data)
      .then((response) => {
        let assignedemail = {}
        console.log('1')
        console.log(response)
        assignedemail.content = JSON.stringify(messages)
        assignedemail.emailId = messages[0].threadid
        assignedemail.ticket = response.data
        console.log('gonna post here')
        axiosInstance.post(`/assigned-email/`, assignedemail).then((response) => {
          console.log('heyheyhey')
          console.log(response)
          message.success('Successfully Assigned');
          history.push(`/ticket/detail/${assignedemail.ticket}/`)
        }).catch((error) => {
          console.log('whatsuppppp')
          console.log(error)
          if (error.response) {
            console.log(error.response)
          }
        })
      }).catch((error) => {
        console.log(error)
        if (error.response) {
          console.log(error.reponse)
        }
      })
    setClear(!clear)

  }


  const getCustomers = () => {
    axiosInstance.get(`/customer-poc/`).then(response => {
      setPocs(response.data)
    }).catch(error => {
      console.log(error)
    })
  }

  const getProject = () => {
    axiosInstance.get(`/sales-project/`).then(response => {
      setProject(response.data)
    }).catch(error => {
      console.log(error)
    })
  }

  const getTickets = () => {
    axiosInstance.get(`/ticket/`).then(response => {
      console.log('ticketssss')
      console.log(response.data)
      setTickets(response.data)
    }).catch(error => {
      console.log(error)
    })
  }

  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };
  console.log('from')
  console.log(props.from)

  return (
    <div className="message-list">
      <Toolbar
        data={getProps()}
      />

      <div className="message-list-container">{renderMessages()}</div>
      {props.assigneduser === true && threadid !== ''
        ? replybutton
        : null
      }
      {props.from === "conversation" && threadid !== ''
        ? assignbutton
        : null
      }
      {props.from === "ticket" && threadid !== ''
        ? unassignbutton
        : null
      }
      <Drawer
        title="Assign Ticket"
        placement="right"
        closable={false}
        onClose={onClose}
        visible={visible}
        width={720}
      >
        <DynamicForm className="form"
          model={
            key === 'customer' ?
              [
                { key: "phone", label: "Phone Number" },
                { key: "nature", label: "Nature", type: "select", options: ['complain', 'enquiry'] },
                { key: "priority", label: "Priority", type: "select", options: ['important', 'medium', 'normal'] },
                { key: "customerPoc", label: "Customer Poc", type: "fkey", options: pocs, id: "poc_id", name: "name" },
              ] : key === 'salesproject' ?
                [
                  { key: "phone", label: "Phone Number" },
                  { key: "nature", label: "Nature", type: "select", options: ['complain', 'enquiry'] },
                  { key: "priority", label: "Priority", type: "select", options: ['important', 'medium', 'normal'] },
                  { key: "salesProject", label: "Sales Project", type: "fkey", options: project, id: "sales_project_id", name: "sales_project_name" },
                ]
                : key === 'ticket' ?
                  [
                    { key: "ticket", label: "Existing Tickets", type: "fkey", options: tickets, id: "id", name: "title" },
                  ]
                  :

                  [
                    { key: "phone", label: "Phone Number" },
                    { key: "nature", label: "Nature", type: "select", options: ['complain', 'enquiry'] },
                    { key: "priority", label: "Priority", type: "select", options: ['important', 'medium', 'normal'] },
                  ]


          }

          addon={[]}

          clearData={clear}

          data={null}

          response={error}

          onSubmit={(data) => { assignTicket(data) }}

        />
      </Drawer>
    </div>
  );
}