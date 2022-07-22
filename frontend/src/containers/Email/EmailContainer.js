import ReactDOM from 'react-dom';
import React, { Component } from "react";

import { AppModel } from './../../components/Email/app_model.js';
import { AppView } from './../../components/Email/app_view.jsx';
import { GmailController } from './../../api/gmail_controller.js';
import { connect } from 'react-redux';

var privates = Symbol("privates");

//
// The application's main controller.
//
class EmailContainer extends Component {

   constructor(props) {
      super(props);
      this.appModel = new AppModel();
      this.gmailController = new GmailController();
      this.messages = [];
      this.sent = [];

      //
      // These are private methods that the outside world can't access but methods defined within
      // this class can access.
      //
      this[privates] = {
         displayMessages: (messages) => {
            this.appModel.messages = messages;
            this.appModel.viewState = AppModel.SHOW_MESSAGES_LIST;
            this.forceUpdate();
         },
         displaySent: (sent) => {
            this.appModel.sent = sent;
            this.appModel.viewState = AppModel.SENT_VIEW;
            this.forceUpdate();
         },
         displayConversation: (conversation) => {
            this.appModel.conversation = conversation;
            this.appModel.viewState = AppModel.CONVERSATION_VIEW;
            this.forceUpdate();
         }
      }
   }

   //
   // This re-retrieves inbox items from GMail and then shows the inbox list.
   //
   handleGoHome() {

      //
      // Most of the time, we do the default for this method - which is to go out over the network and grab
      // the most up-to-date top 10 items in the user's GMail inbox...
      this.props.setEmailView(AppModel.SHOW_MESSAGES_LIST);
      this.forceUpdate();
   }

   //
   // This just shows the in-memory inbox list we got from GMail some time in the past. (NOTE: This doesn't go
   // out to GMail for a refreshed view of the inbox.)
   //
   handleGoHomeNoRefresh() {
      this.appModel.viewState = AppModel.SHOW_MESSAGES_LIST;
      this.forceUpdate();
   }

   handleGoSent() {
      this.props.setEmailView(AppModel.SENT_VIEW);
      this.forceUpdate();
   }

   //
   // The user clicked the "Log In to Gmail" button. Log the user in using Google's OAuth API and the 
   // Email API.
   //
   // This function does 2 things:
   //    1. Log the user in.
   //    2. Grab the top 10 items from their GMail inbox.
   //
   handleAuthorize() {
      this.gmailController.authorizeUser().then(() => {
         this.gmailController.watchNotifications()
         this.appModel.userIsLoggedIn = true
         this.props.setEmailView(AppModel.CONVERSATION_VIEW)
         this.forceUpdate()

         //
         // An error indicates that the user isn't currently logged in to GMail. We'll now
         // send them to a page that will allow them to log in via a popup.
         //
      }).catch(() => {
         this.appModel.viewState = AppModel.LOG_IN;
         this.render();
      })
   }

   handleGetSent() {
      this.gmailController.getSentMessages().then((sent) => {
         var i;
         this.sent = []
         for (i = 0; i < sent.length; i++) {
            this.sent.push(sent[i])
         }
         this[privates].displaySent(this.sent);
      })
   }

   handleGetConversation() {
      this.gmailController.getConversations().then((conversation) => {
         var i;
         this.conversation = []
         for (i = 0; i < conversation.length; i++) {
            this.conversation.push(conversation[i])
         }
         this[privates].displayConversation(this.conversation);
      })
   }

   //
   // The user clicked the "Log In to Gmail" button. Log the user in using Google's OAuth API and the 
   // Email API.
   //
   // This function does 2 things:
   //    1. Log the user in.
   //    2. Grab the top 10 items from their GMail inbox.
   //
   handleLogIn() {
      this.gmailController.logUserIn().then(() => {
         return this.gmailController.getPageOfMessages();
      }).then((messages) => {
         this.appModel.userIsLoggedIn = true;
         var i;
         this.messages = []
         for (i = 0; i < messages.length; i++) {
            this.messages.push(messages[i])
         }
         this[privates].displayMessages(this.messages);
      })
   }

   //
   // This goes out to GMail, retrieves a fresh view of the top 10 messages in the user's inbox and then shows
   // those to the screen in a list.
   //
   getAndShowPageOfMessages() {
      let i;
      this.gmailController.getPageOfMessages().then((messages) => {
         this.messages = []
         for (i = 0; i < messages.length; i++) {
            this.messages.push(messages[i])
         }
         this[privates].displayMessages(this.messages);
      })
   }

   handleLoadNext() {
      this.gmailController.getNextPageOfMessages().then((messages) => {
         var i;
         for (i = 0; i < messages.length; i++) {
            this.messages.push(messages[i])
         }
         this[privates].displayMessages(this.messages);
      })
   }

   handleLoadNextSent() {
      this.gmailController.getNextSentMessages().then((sent) => {
         var i;
         for (i = 0; i < sent.length; i++) {
            this.sent.push(sent[i])
         }
         this[privates].displaySent(this.sent);
      })
   }

   //
   // The user clicked an email. Show it in detailed view.
   //
   handleShowEmailDetails(message) {
      this.appModel.selectedMessage = message;
      this.props.setEmailView(AppModel.VIEW_MESSAGE)
      this.forceUpdate()
   }

   handleShowSentDetails(message) {
      this.appModel.selectedSentMessage = message;
      this.props.setEmailView(AppModel.SINGLE_SENT_VIEW)
      this.forceUpdate()
   }

   handleShowAttachment(attachment) {
      this.appModel.selectedAttachment = attachment;
      this.appModel.previousViewState = this.appModel.viewState
      this.appModel.viewState = AppModel.ATTACHMENT_VIEW;
      this.forceUpdate()
   }

   //
   // The user clicked the "Compose Email" link along the top navigation. Show a "Compose Email" form.
   //
   handleComposeEmail() {
      this.appModel.viewState = AppModel.COMPOSE_MESSAGE;
      this.forceUpdate()
   }

   //
   // The user was replying to an email but cancelled that activity. We want to bring the user back to the
   // original email they wanted to reply to.
   //
   handleCancelReplyMessage() {
      this.appModel.viewState = AppModel.VIEW_MESSAGE;
      this.forceUpdate()
   }

   //
   // The user was viewing an email from their inbox and clicked the "Reply" button. We will show the user
   // a screen that allows them to reply to the email.
   //
   handleReplyToEmail() {
      this.appModel.viewState = AppModel.REPLY_TO_MESSAGE;
      this.forceUpdate()
   }

   //
   // The user clicked the "Send" button from the Compose/Reply form. If the browser is "offline" (the network is off),
   // then the email the user is sending will be saved in a local queue (from which it will be sent once the computer's
   // network comes back online). But if the user's computer is online (network is working), then this will send the
   // email. Once the email is sent, this re-retrieves the user's inbox from GMail and shows those messages to the
   // user in a list.
   //
   handleSendEmail(email) {
      this.gmailController.sendEmail(email).then(() => {
         this.handleGoHome();
      })
   }


   //
   // Each time this is called, the application's UI is re-rendered (based on the model).
   //
   render() {
      if (this.props.isSignedIn === false) {
         this.appModel.viewState = AppModel.AUTHORIZE_WITH_GMAIL;
      }

      if (this.props.emailview === '') {
         this.appModel.viewState = AppModel.AUTHORIZE_WITH_GMAIL;
      }

      else {
         this.appModel.viewState = this.props.emailview;
      }

      return (
         <AppView
            selectedAttachment={this.appModel.selectedAttachment}
            conversation={this.appModel.conversation}
            sent={this.appModel.sent}
            messages={this.appModel.messages}
            selectedMessage={this.appModel.selectedMessage}
            selectedSentMessage={this.appModel.selectedSentMessage}
            app={this.appModel.app}
            appIsOnline={this.appModel.appOnline}
            userIsLoggedIn={this.appModel.userIsLoggedIn}
            onGoHome={this.handleGoHome.bind(this)}
            onGoHomeNoRefresh={this.handleGoHomeNoRefresh.bind(this)}
            onCancelReplyMessage={this.handleCancelReplyMessage.bind(this)}
            onHandleLogIn={this.handleLogIn.bind(this)}
            onHandleAuthorize={this.handleAuthorize.bind(this)}
            onShowEmailDetails={this.handleShowEmailDetails.bind(this)}
            onComposeEmail={this.handleComposeEmail.bind(this)}
            onReplyToEmail={this.handleReplyToEmail.bind(this)}
            onSend={this.handleSendEmail.bind(this)}
            onLoadNext={this.handleLoadNext.bind(this)}
            onShowSentDetails={this.handleShowSentDetails.bind(this)}
            onGoSent={this.handleGoSent.bind(this)}
            onSentClicked={this.handleGetSent.bind(this)}
            onConversationsClicked={this.handleGetConversation.bind(this)}
            onLoadNextSent={this.handleLoadNextSent.bind(this)}
            onShowAttachment={this.handleShowAttachment.bind(this)} />
      );
   }

}

const mapStateToProps = (state) => {
   return {
      isSignedIn: state.email.isSignedIn,
      emailview: state.email.emailview
   }
}

const mapDispatchToProps = (dispatch) => {
   return {
      setEmailView: (view) => dispatch({ type: 'SET_EMAILVIEW', emailview: view }),
   }
}


export default connect(mapStateToProps, mapDispatchToProps)(EmailContainer);