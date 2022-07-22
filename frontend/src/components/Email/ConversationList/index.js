import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import ConversationSearch from '../ConversationSearch';
import ConversationListItem from '../ConversationListItem';
import Toolbar from '../Toolbar';
import ToolbarButton from '../ToolbarButton';
import axios from 'axios';
import { GmailController } from '../../../api/gmail_controller.js';
import moment from 'moment';
import { useSelector, useDispatch } from 'react-redux'

import './ConversationList.css';

export default function ConversationList(props) {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const gmailController = new GmailController();
  let conversationlist = useSelector(state => state.email.conversationlist)

  if (props.messages) {
    conversationlist = props.messages
  }

  console.log('conversationlist')
  console.log(conversationlist)

  const loadNext = () => {
    setLoading(true)
    let tempconversation = []
    gmailController.getNextPageOfConversations().then((conversation) => {
      for (let i = 0; i < conversation.length; i++) {
        tempconversation.push(conversation[i]);
        tempconversation = tempconversation.sort((a, b) => {
          return moment(b[0].date).diff(a[0].date)
        })
      }
      dispatch({ type: 'SET_CONVERSATIONLIST', conversationlist: tempconversation })
      setLoading(false)
    })
  }
  conversationlist = conversationlist.sort((a, b) => {
    return moment(a[a.length - 1].date).diff(b[b.length - 1].date)
  })
  conversationlist = conversationlist.reverse()


  console.log('conversationlist')
  console.log(conversationlist)
  return (
    <div className="conversation-list">
      <ConversationSearch />
      {
        conversationlist.map(conversation =>
          <ConversationListItem
            key={conversation[0].id}
            data={conversation}
          />
        )
      }
      {props.messages
        ? null
        : <Button type="primary" loading={loading} onClick={loadNext}>Load Next</Button>
      }
    </div>
  );
}