const AUTHORIZE_WITH_GMAIL = "AUTHORIZE_WITH_GMAIL";
const LOG_IN = "LOG_IN";
const SHOW_MESSAGES_LIST = "SHOW_MESSAGES_LIST";
const VIEW_MESSAGE = "VIEW_MESSAGE";
const COMPOSE_MESSAGE = "COMPOSE_MESSAGE";
const REPLY_TO_MESSAGE = "REPLY_TO_MESSAGE";
const SHOW_DISCONNECTED_POPUP = "SHOW_DISCONNECTED_POPUP";
const SENT_VIEW = "SENT_VIEW";
const SINGLE_SENT_VIEW = "SINGLE_SENT_VIEW"
const ATTACHMENT_VIEW = "ATTACHMENT_VIEW";
const CONVERSATION_VIEW = "CONVERSATION_VIEW"

class AppModel {

    constructor() {
       this.app = {
          online:true,
          userIsLoggedIn:false,
          viewState:AUTHORIZE_WITH_GMAIL,
          previousViewState: ''
       }
       
       this.email = {
          messages:[],
          sent:[],
          conversation: [],
       }
    }

    set viewState(newViewState) {
        this.app.viewState = newViewState;
    }

    get viewState() {
        return this.app.viewState;
    }

    set previousViewState(ViewState) {
       this.app.previousViewState = ViewState;
    }

    get previousViewState() {
      return this.app.previousViewState
    }

    set selectedAttachment(attachment) {
      this.email.selectedAttachment = attachment;
    }

    get selectedAttachment() {
      return this.email.selectedAttachment
    }

    get conversation() {
      return this.email.conversation;
    }

    set conversation(conversation) {
      this.email.conversation = conversation;
    }

    get messages() {
       return this.email.messages;
    }
    set messages(messages) {
        this.email.messages = messages;
    }

    get sent() {
      return this.email.sent;
    }

    set sent(sent){
      this.email.sent = sent;
    }

    get selectedMessage() {
       return this.email.selectedMessage;
    }
    set selectedMessage(selectedMessage) {
        this.email.selectedMessage = selectedMessage;
    }

    get selectedSentMessage() {
       return this.email.selectedSentMessage;
    }

    set selectedSentMessage(selectedSentMessage){
        this.email.selectedSentMessage = selectedSentMessage;
    }

    get appOnline() {
       return this.app.online;
    }
    set appOnline(isOnline) {
        this.app.online = isOnline;
    }

    get userIsLoggedIn() {
       return this.app.userIsLoggedIn;
    }
    set userIsLoggedIn(isLoggedIn) {
        this.app.userIsLoggedIn = isLoggedIn;
    }



    static get AUTHORIZE_WITH_GMAIL() {
        return AUTHORIZE_WITH_GMAIL;
    }
    static get LOG_IN() {
        return LOG_IN;
    }
    static get SHOW_MESSAGES_LIST() {
        return SHOW_MESSAGES_LIST;
    }
    static get VIEW_MESSAGE() {
        return VIEW_MESSAGE;
    }
    static get COMPOSE_MESSAGE() {
        return COMPOSE_MESSAGE;
    }
    static get REPLY_TO_MESSAGE() {
        return REPLY_TO_MESSAGE;
    }
    static get SHOW_DISCONNECTED_POPUP() {
        return SHOW_DISCONNECTED_POPUP;
    }
    static get SENT_VIEW() {
        return SENT_VIEW;
    }
    static get SINGLE_SENT_VIEW() {
      return SINGLE_SENT_VIEW;
    }
    static get ATTACHMENT_VIEW() {
      return ATTACHMENT_VIEW;
    }
    static get CONVERSATION_VIEW() {
      return CONVERSATION_VIEW;
    }

}

export {AppModel}