import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import { Table, Button } from 'antd';
import { GmailController } from './../../api/gmail_controller.js';
import { connect } from "react-redux";

class SentListView extends React.Component {

  constructor(props) {
    super(props)
    this.gmailController = new GmailController();
    this.state = {
      loading: false
    }
  }

  componentDidMount() {
    if (this.props.sentlist.length === 0) {
      this.gmailController.getSentMessages().then((sent) => {
        this.props.setSentList(sent)
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
    for (i = 0; i < this.props.sentlist.length; i++) {
      if (this.props.sentlist[i].id == mailid) {
        message = this.props.sentlist[i]
      }
    }
    this.props.onShowSentDetails(message);
  }

  loadNext() {
    this.setState({ loading: true })
    this.gmailController.getNextSentMessages().then((message) => {
      let tempnextmessages = []
      for (let i = 0; i < message.length; i++) {
        tempnextmessages.push(message[i])
      }
      this.props.setSentList(tempnextmessages)
      this.setState({ loading: false })
    })
  }

  render() {
    let columns = [
      {
        title: 'To',
        dataIndex: 'to',
        key: 'to'
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

    let messages = this.props.sentlist.sort((a, b) => {
      return moment(a.date).diff(b.date)
    })
    messages = messages.reverse()

    for (i = 0; i < messages.length; i++) {
      console.log(this.props.email_service)
      let messageDate = moment(messages[i].date).format('dddd MMM DD, YYYY h:m a')
      if (this.props.email_service === "gmail") {
        data.push({
          key: messages[i].id,
          to: messages[i].to,
          subject: messages[i].subject,
          date: messageDate
        })
      }
      else if (this.props.email_service === "outlook") {
        data.push({
          key: messages[i].id,
          to: messages[i].to[0].emailAddress.address,
          subject: messages[i].subject,
          date: messageDate
        })
      }
      console.log(data)
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
    updateThread: (update, x) => dispatch({ type: 'UPDATE_THREAD', update: update, x: x }),
    updateConversationList: (update) => dispatch({ type: 'UPDATE_CONVERSATIONLIST', update: update }),
    setInboxList: (inboxlist) => dispatch({ type: 'SET_INBOXLIST', inboxlist: inboxlist }),
    setSentList: (sentlist) => dispatch({ type: 'SET_SENTLIST', sentlist: sentlist })
  }
}

const mapStateToProps = (state) => {
  return {
    sentlist: state.email.sentlist,
    conversationlist: state.email.conversationlist,
    email_service: state.auth.email_service
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SentListView);