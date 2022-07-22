import React from 'react';
import { Card, Row, Divider, Col } from 'antd';
import moment from 'moment';
import Messenger from './Messenger';
import { connect } from "react-redux";
import { GmailController } from './../../api/gmail_controller.js';

class ConversationView extends React.Component {

	constructor(props) {
		super(props)
		this.gmailController = new GmailController();
		this.tempconversation = []
	}

	componentDidMount() {

		this.props.setThreadId('')

		if (this.props.conversationlist.length === 0) {
			this.gmailController.getConversations().then((conversation) => {
				console.log('here yo')
				console.log(conversation)
				for (let i = 0; i < conversation.length; i++) {
					this.tempconversation.push(conversation[i])
				}
				this.props.setConversation(this.tempconversation)
			});
		}
		else {
			this.gmailController.getHistoryList().then((conversation) => {

				try {
					for (let i = 0; i < conversation.length; i++) {
						let threadorconversation = this.props.conversationlist.find(conversationlist => {
							return conversationlist[0].threadid === conversation[i].threadid
						})
						if (threadorconversation) {
							let index = this.props.conversationlist.indexOf(threadorconversation)
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

	render() {

		return (
			<Messenger assigneduser={true} from="conversation" />
		)
	}

}

const mapDispatchToProps = (dispatch) => {
	return {
		setConversation: (sortedconversation) => dispatch({ type: 'SET_CONVERSATIONLIST', conversationlist: sortedconversation }),
		updateThread: (update, x) => dispatch({ type: 'UPDATE_THREAD', update: update, x: x }),
		updateConversationList: (update) => dispatch({ type: 'UPDATE_CONVERSATIONLIST', update: update }),
		setInboxList: (update) => dispatch({ type: 'SET_INBOXLIST', inboxlist: update }),
		setSentList: (update) => dispatch({ type: 'SET_SENTLIST', sentlist: update }),
		setThreadId: (threadid) => dispatch({ type: 'CHANGE_THREADID', threadid: '' }),
	}
}

const mapStateToProps = (state) => {
	return {
		conversationlist: state.email.conversationlist
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(ConversationView);