import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import { Table, Button } from 'antd';
import { GmailController } from './../../api/gmail_controller.js';
import { connect } from "react-redux";

class MessagesListView extends React.Component {

  constructor(props) {
    super(props)
    this.gmailController = new GmailController();
    this.state = {
      loading: false
    }
  }

  componentDidMount() {
    if (this.props.inboxlist.length === 0) {
      this.gmailController.getPageOfMessages().then((message) => {
        console.log(message)
        this.props.setInboxList(message)
      })
    }
    else {
      if (this.props.email_service === "gmail") {
        this.gmailController.getHistoryList().then((conversation) => {
          console.log(conversation)

          try {
            for (let i = 0; i < conversation.length; i++) {
              let threadorconversation = this.props.conversationlist.find(conversationlist => {
                return conversationlist[0].threadid === conversation[i].threadid
              })
              if (threadorconversation) {
                console.log(threadorconversation)
                let index = this.props.conversationlist.indexOf(threadorconversation)
                console.log('updating thread')
                this.props.updateThread(conversation[i], index)
              }
              else {
                this.props.updateConversationList([conversation[i]])
              }
            }
            for (let x = 0; x < conversation.length; x++) {
              if (conversation[x].label === "INBOX") {
                let exist = this.props.inboxlist.find(inboxlist => {
                  return inboxlist.id === conversation[x].id
                })
                if (exist) {
                  this.props.setInboxList([conversation[x]])
                }
              }
              else if (conversation[x].label === "SENT") {
                console.log('senttttt')
                let exist = this.props.sentlist.find(sentlist => {
                  return sentlist.id === conversation[x].id
                })
                if (exist) {
                  this.props.setSentList([conversation[x]])
                }
              }
            }
          }
          catch (err) {
            console.log(err)
          }

        })
      }
    }
  }

  handleSelectedRow(mailid) {
    let i
    let message
    for (i = 0; i < this.props.inboxlist.length; i++) {
      if (this.props.inboxlist[i].id == mailid) {
        message = this.props.inboxlist[i]
        this.props.changeReplySubject(this.props.inboxlist[i].subject)
        if (this.props.inboxlist[i].from.emailAddress) {
          this.props.changeReplyTo(this.props.inboxlist[i].from.emailAddress.address)
        }
        else {
          this.props.changeReplyTo(this.props.inboxlist[i].from)
        }
      }
    }
    this.props.onShowEmailDetails(message);
  }

  loadNext() {
    this.setState({ loading: true })
    this.gmailController.getNextPageOfMessages().then((message) => {
      let tempnextmessages = []
      for (let i = 0; i < message.length; i++) {
        tempnextmessages.push(message[i])
      }
      this.props.setInboxList(tempnextmessages)
      this.setState({ loading: false })
    })
  }

  render() {
    const { loadings } = this.state;
    let columns = [
      {
        title: 'From',
        dataIndex: 'from',
        key: 'from'
      },
      {
        title: 'Subject',
        dataIndex: 'subject',
        key: 'subject'
      },
      {
        title: 'Date',
        dataIndex: 'date',
        key: 'date'
      }
    ];

    let data = []

    let i

    let messages = this.props.inboxlist

    for (i = 0; i < messages.length; i++) {
      let messageDate = moment(messages[i].date).format('dddd MMM DD, YYYY h:m a')
      if (messages[i].from.emailAddress) {
        data.push({
          key: messages[i].id,
          from: messages[i].from.emailAddress.address,
          subject: messages[i].subject,
          date: messageDate
        })
      }
      else {
        data.push({
          key: messages[i].id,
          from: messages[i].from,
          subject: messages[i].subject,
          date: messageDate
        })
      }
    }

    return (
      <div>
        <Table columns={columns} dataSource={data} onRow={(record) => ({
          onClick: () => { this.handleSelectedRow(record.key) }
        })} />
        <Button loading={this.state.loading} onClick={this.loadNext.bind(this)}>
          Load Next
          </Button>
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    changeReplySubject: (subject) => dispatch({ type: 'CHANGE_REPLYSUBJECT', replySubject: subject }),
    changeReplyTo: (to) => dispatch({ type: 'CHANGE_REPLYTO', replyTo: to }),
    updateThread: (update, x) => dispatch({ type: 'UPDATE_THREAD', update: update, x: x }),
    updateConversationList: (update) => dispatch({ type: 'UPDATE_CONVERSATIONLIST', update: update }),
    setInboxList: (inboxlist) => dispatch({ type: 'SET_INBOXLIST', inboxlist: inboxlist }),
    setSentList: (update) => dispatch({ type: 'SET_SENTLIST', sentlist: update })
  }
}

const mapStateToProps = (state) => {
  return {
    inboxlist: state.email.inboxlist,
    conversationlist: state.email.conversationlist,
    email_service: state.auth.email_service
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MessagesListView);