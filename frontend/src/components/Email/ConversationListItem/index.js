import React, { useEffect } from 'react';
import shave from 'shave';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import './ConversationListItem.css';

export default function ConversationListItem(props) {
  let i;
  let date;
  let subject;
  let from;
  let thread;
  let name;
  console.log('conversationlistitem')
  console.log(props.data)
  for (i = 0; i < props.data.length; i++) {
    console.log(props.data[i])
    date = moment(props.data[props.data.length - 1].date).format('dddd MMM DD, YYYY h:m a')
    thread = props.data[0].threadid
    subject = props.data[props.data.length - 1].subject
    if (props.data.length === 1) {
      if (props.data[i].label === "SENT") {
        if (props.data[i].to.emailAddress) {
          from = props.data[i].to.emailAddress.address
          name = props.data[i].to.name
        }
        else {
          from = props.data[i].to
        }
      }
      else {
        if (props.data[i].from.emailAddress) {
          from = props.data[i].from.emailAddress.address
          name = props.data[i].from.emailAddress.name
        }
        else {
          from = props.data[i].from
        }
      }
    }
    else {
      if (props.data[i].label === "INBOX") {
        if (props.data[i].from.emailAddress) {
          from = props.data[i].from.emailAddress.address
          name = props.data[i].from.emailAddress.name
        }
        else {
          console.log('over herehrhehre')
          from = props.data[i].from
          console.log(from)
        }
      }
    }
  }

  const dispatch = useDispatch()

  const dispatchReplyDetails = () => {
    let tempfrom = []
    tempfrom.push(from)
    dispatch({ type: 'CHANGE_THREADID', threadid: thread });
    dispatch({ type: 'CHANGE_REPLYSUBJECT', replySubject: subject })
    dispatch({ type: 'CHANGE_REPLYTO', replyTo: tempfrom })
  }

  console.log(subject)
  console.log(name)
  console.log(from)
  console.log(date)

  return (
    <div className="conversation-list-item" onClick={dispatchReplyDetails}>
      <div className="conversation-info">
        <h1 className="conversation-title">{subject}</h1>
        <p className="conversation-snippet">{name}</p>
        <p className="conversation-snippet">{from}</p>
        <p className="conversation-snippet">{date}</p>
      </div>
    </div>
  );
}