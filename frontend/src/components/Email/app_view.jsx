import React from 'react';
import ReactDOM from 'react-dom';

import { Navibar } from './navbar.jsx';
import { AuthorizeView } from './authorize_view.jsx';
import { LoginView } from './login_view.jsx';
import SingleMessageView from './single_message_view.jsx';
import ComposeMessageView from './compose_message_view.jsx';
import MessagesListView from './messages_list_view.jsx';
import SentListView from './sent_view.jsx'
import { AppModel } from './app_model.js';
import SingleSentView from './single_sent_view.jsx';
import ConversationView from './conversation_view.jsx'



class AppView extends React.Component {

      render() {

            //
            // Create the mage page view that sits below the top nav. This view is different based on what state the
            // applicaion is in (such as: showing the inbox list, composing a new email, viewing an email, etc.)
            //
            console.log(this.props.app.viewState)
            let mainContent = (() => {
                  switch (this.props.app.viewState) {

                        case AppModel.AUTHORIZE_WITH_GMAIL:
                              return (
                                    <AuthorizeView onHandleLogIn={this.props.onHandleAuthorize} />
                              )
                        case AppModel.LOG_IN:
                              return (
                                    <LoginView onHandleLogIn={this.props.onHandleLogIn} />
                              )
                        case AppModel.SHOW_MESSAGES_LIST:
                              return (
                                    <MessagesListView messages={this.props.messages}
                                          onShowEmailDetails={this.props.onShowEmailDetails}
                                          onLoadNext={this.props.onLoadNext} />
                              )
                        case AppModel.VIEW_MESSAGE:
                              return (
                                    <SingleMessageView message={this.props.selectedMessage}
                                          onReplyToEmail={this.props.onReplyToEmail}
                                          onCancel={this.props.onGoHome}
                                          onShowAttachment={this.props.onShowAttachment} />
                              )
                        case AppModel.COMPOSE_MESSAGE:
                              return (
                                    <ComposeMessageView onSend={this.props.onSend}
                                          onCancel={this.props.onGoHome} />
                              )
                        case AppModel.REPLY_TO_MESSAGE:
                              return (
                                    <ComposeMessageView message={this.props.selectedMessage}
                                          onSend={this.props.onSend}
                                          onCancel={this.props.onCancelReplyMessage} />
                              )
                        case AppModel.SENT_VIEW:
                              return (
                                    <SentListView sent={this.props.sent}
                                          onShowSentDetails={this.props.onShowSentDetails}
                                          onLoadNextSent={this.props.onLoadNextSent} />
                              )
                        case AppModel.SINGLE_SENT_VIEW:
                              return (
                                    <SingleSentView message={this.props.selectedSentMessage}
                                          onCancel={this.props.onGoSent}
                                          onShowAttachment={this.props.onShowAttachment} />
                              )
                        case AppModel.CONVERSATION_VIEW:
                              return (
                                    <ConversationView conversation={this.props.conversation} />

                              )

                        default:
                              return (
                                    <h1>NOTHING</h1>
                              )
                              break;
                  }
            })()

            return (
                  <React.Fragment>
                        {mainContent}
                  </React.Fragment>
            )
      }
}

export { AppView }