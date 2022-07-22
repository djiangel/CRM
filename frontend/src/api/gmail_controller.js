import { gapi } from 'gapi-script';
import { Client } from "@microsoft/microsoft-graph-client"
import React, { Component } from "react";
import { useState } from 'react';
import { connect } from 'react-redux';
import path from 'path';
import moment from 'moment';
import store from '../redux/store'
import { UserAgentApplication } from "msal";
import { ImplicitMSALAuthenticationProvider } from "@microsoft/microsoft-graph-client/lib/src/ImplicitMSALAuthenticationProvider";
import { MSALAuthenticationProviderOptions } from '@microsoft/microsoft-graph-client/lib/src/MSALAuthenticationProviderOptions';

const frontend_url = process.env.REACT_APP_FRONT_URL
const scopes = 'https://www.googleapis.com/auth/gmail.readonly ' + 'https://www.googleapis.com/auth/gmail.send';
const clientId = process.env.GOOGLE_CLIENT_ID;
const apiKey = process.env.GOOGLE_API_KEY;
const outlookclientId = process.env.OUTLOOK_CLIENT_ID;

const MailComposer = require('nodemailer/lib/mail-composer');
let outlookclient

function getMessageHeader(messageHeaders, key) {
   let headerValue = null;

   messageHeaders.forEach((header) => {
      if (header.name === key) {
         headerValue = header.value;
      }
   });

   return headerValue;
}

function getAttachments(message) {
   let attachmentlist = []
   if (message.payload.parts === undefined) {
   }
   else {
      var parts = message.payload.parts;
      let attach
      for (var i = 0; i < parts.length; i++) {
         var part = parts[i];
         if (part.filename && part.filename.length > 0) {
            var attachId = part.body.attachmentId;
            let filename = part.filename
            let mimeType = part.mimeType
            var request = gapi.client.gmail.users.messages.attachments.get({
               'id': attachId,
               'messageId': message.id,
               'userId': 'me'
            });
            request.execute(function (attachment) {
               attach = attachment
               attach.filename = filename
               attach.type = mimeType
               attachmentlist.push(attach)
            });

         }
      }
   }
   return attachmentlist
}

function getMessageBody(message) {
   let encodedBody = '';



   function getHTMLPart(arr) {

      for (let x = 0; x < arr.length; x++) {
         if (typeof arr[x].parts === 'undefined') {
            if (arr[x].mimeType === 'text/html') {
               return arr[x].body.data;
            }
         } else {
            return getHTMLPart(arr[x].parts);
         }
      }
      return '';
   }

   if (typeof message.parts === 'undefined') {
      encodedBody = message.body.data;
   } else {
      encodedBody = getHTMLPart(message.parts);
   }
   encodedBody = encodedBody.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '');
   return decodeURIComponent(escape(window.atob(encodedBody)));


   if (typeof message.parts === 'undefined') {
      encodedBody = message.body && message.body.data; //'none' //message.body.data;
      encodedBody = encodedBody || 'missing';
   } else {
      encodedBody = getHTMLPart(message.parts);
   }
   encodedBody = encodedBody.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '');

   return encodedBody;
}

function parseMessageDetails(message) {
   let parsedMessage;

   if (message.labelIds.includes("INBOX")) {
      parsedMessage = {
         id: message.id,
         threadid: message.threadId,
         from: getMessageHeader(message.payload.headers, 'From'),
         to: getMessageHeader(message.payload.headers, 'To'),
         subject: getMessageHeader(message.payload.headers, 'Subject'),
         date: getMessageHeader(message.payload.headers, 'Date'),
         body: getMessageBody(message.payload),
         assigned: null,
         attachment: getAttachments(message),
         label: 'INBOX',
         replyid: getMessageHeader(message.payload.headers, 'Message-ID'),
         cc: getMessageHeader(message.payload.headers, 'Cc'),
      }
   }

   if (message.labelIds.includes("SENT")) {
      parsedMessage = {
         id: message.id,
         threadid: message.threadId,
         from: getMessageHeader(message.payload.headers, 'From'),
         to: getMessageHeader(message.payload.headers, 'To'),
         subject: getMessageHeader(message.payload.headers, 'Subject'),
         date: getMessageHeader(message.payload.headers, 'Date'),
         body: getMessageBody(message.payload),
         assigned: null,
         attachment: getAttachments(message),
         label: 'SENT',
         cc: getMessageHeader(message.payload.headers, 'Cc'),
      }
   }

   return parsedMessage
}


function parseConversationDetails(message) {
   let parsedMessage;
   let labelcheck = ["SENT", "INBOX"]
   if (message.code === 404) {
      parsedMessage = 'errormessage'
   }
   else {
      let success = labelcheck.every((val) => message.labelIds.includes(val))
      if (success === false) {
         if (message.labelIds.includes("INBOX")) {
            parsedMessage = {
               id: message.id,
               threadid: message.threadId,
               from: getMessageHeader(message.payload.headers, 'From'),
               to: getMessageHeader(message.payload.headers, 'To'),
               subject: getMessageHeader(message.payload.headers, 'Subject'),
               date: getMessageHeader(message.payload.headers, 'Date'),
               body: getMessageBody(message.payload),
               assigned: null,
               attachment: getAttachments(message),
               label: 'INBOX',
               replyid: getMessageHeader(message.payload.headers, 'Message-ID'),
               cc: getMessageHeader(message.payload.headers, 'Cc'),
               snippet: message.snippet
            }
         }

         else if (message.labelIds.includes("SENT")) {
            parsedMessage = {
               id: message.id,
               threadid: message.threadId,
               to: getMessageHeader(message.payload.headers, 'To'),
               from: getMessageHeader(message.payload.headers, 'From'),
               subject: getMessageHeader(message.payload.headers, 'Subject'),
               date: getMessageHeader(message.payload.headers, 'Date'),
               body: getMessageBody(message.payload),
               assigned: null,
               attachment: getAttachments(message),
               label: 'SENT',
               cc: getMessageHeader(message.payload.headers, 'Cc'),
               bcc: getMessageHeader(message.payload.headers, 'Bcc'),
            }
         }

         else {
            parsedMessage = 'errormessage'
         }
      }
      if (success === true) {
         parsedMessage = 'errormessage'
      }
   }


   return parsedMessage;
}

function parseSentDetails(message) {
   let parsedMessage = {
      id: message.id,
      to: getMessageHeader(message.payload.headers, 'To'),
      from: getMessageHeader(message.payload.headers, 'From'),
      subject: getMessageHeader(message.payload.headers, 'Subject'),
      date: getMessageHeader(message.payload.headers, 'Date'),
      body: getMessageBody(message.payload),
      attachment: getAttachments(message),
      cc: getMessageHeader(message.payload.headers, 'Cc'),
      bcc: getMessageHeader(message.payload.headers, 'Bcc')
   }

   return parsedMessage;
}

function setconversationtoken(token) {
   return { type: 'SET_CONVERSATIONTOKEN', conversationtoken: token }
}

function setinboxtoken(token) {
   return { type: 'SET_INBOXTOKEN', inboxtoken: token }
}

function setsenttoken(token) {
   return { type: 'SET_SENTTOKEN', senttoken: token }
}

function sethistoryid(historyid) {
   return { type: 'SET_HISTORYID', historyid: historyid }
}

class GmailController extends Component {

   constructor(props) {
      super(props)
      this.outbox = [];
      this.pageToken = '';
      this.messages = [];
      this.sentToken = '';
      this.conversation = [];
      this.conversationToken = '';
      this.auth = ''
      this.readyState = false

   }

   //
   // This function authorizes the user with Google as long as they are currently logged in to GMail. But if the
   // user isn't logged in to GMail, this will fail and the user will need to click a "Log In" button in order
   // to log in using a popup dialog.
   //
   loadScript = (url) => new Promise((resolve, reject) => {
      const state = store.getState();
      const email_service = state.auth.email_service


      if (email_service === "gmail") {
         const script = document.createElement("script");
         script.src = "https://apis.google.com/js/client.js";

         document.body.appendChild(script);

         script.onload = () => {
            gapi.load('client', () => {
               gapi.client.setApiKey(apiKey);
               resolve()
            });
         };

      }

      else if (email_service === "outlook") {
         const script = document.createElement("script");
         script.src = "https://cdn.jsdelivr.net/npm/@microsoft/microsoft-graph-client/lib/graph-js-sdk.js";
         document.body.appendChild(script);
         resolve()
      }

      else {
         resolve()
      }




      /*let ready = false
      if (!document) {
         reject(new Error('document was not defined'));
      }
      const tag = document.getElementsByTagName('script')[0];
      const script = document.createElement('script');

      script.type = 'text/javascript';
      script.src = url;
      script.async = true;
      script.onreadystatechange = () => {
         if (!ready && (!this.readyState || this.readyState === 'complete')) {
            ready = true;
            resolve(script);
         }
      };
      script.onload = script.onreadystatechange;

      script.onerror = (msg) => {
         reject(new Error('Error loading script.'));
      };

      script.onabort = (msg) => {
         reject(new Error('Script loading aboirted.'));
      };

      if (tag.parentNode != null) {
         tag.parentNode.insertBefore(script, tag);
      } */
   });



   authorizeUser() {

      return new Promise(function (resolve, reject) {
         //
         // First, set the api key. Wait for it to stick.
         //
         const state = store.getState();
         const email_service = state.auth.email_service

         if (email_service === "gmail") {
            window.setTimeout(_ => {
               authorizeUserImmediate();
            }, 1);

            //
            // Then, authorize the user (OAuth login, get the user to accept, etc.)
            //
            var authorizeUserImmediate = () => {
               gapi.auth.authorize({
                  client_id: clientId,
                  scope: scopes,
                  immediate: true
               }, handleAuthResult);
            }

            var authorizeUser = () => {
               gapi.auth.authorize({
                  client_id: clientId,
                  scope: scopes,
                  immediate: false
               }, handleAuthResult);
            }

            var handleAuthResult = (authResult) => {
               if (authResult && !authResult.error) {
                  loadGmailApi()
               } else {
                  if (authResult.error === "popup_blocked_by_browser") {
                     resolve("unblock popup")
                  }
                  //
                  // We have a problem! The user will need to log in using the GMail popup dialog.
                  //
                  else {
                     authorizeUser()
                  }
                  ;
               }
            }

            var loadGmailApi = () => {
               gapi.client.load('gmail', 'v1', _ => {
                  resolve(true);
               });
            }
         }

         else if (email_service === "outlook") {
            const msalConfig = {
               auth: {
                  clientId: outlookclientId, // Client Id of the registered application
                  redirectUri: frontend_url,
               },
            };
            const graphScopes = ["user.read", "mail.send", "mail.readwrite"]; // An array of graph scopes

            // Important Note: This library implements loginPopup and acquireTokenPopup flow, remember this while initializing the msal
            // Initialize the MSAL @see https://github.com/AzureAD/microsoft-authentication-library-for-js#1-instantiate-the-useragentapplication
            const msalApplication = new UserAgentApplication(msalConfig);
            const provideroptions = new MSALAuthenticationProviderOptions(graphScopes);
            const authProvider = new ImplicitMSALAuthenticationProvider(msalApplication, provideroptions);
            const options = {
               authProvider, // An instance created from previous step
            };
            outlookclient = Client.initWithMiddleware(options);
         }

         else {
            resolve(true)
         }

      });
   }

   //
   // This is only called after the application has attempted to automatically authenticate the user with Google/GMail.
   // The only time this method is called is when the user tries to "Authorize with Google" but that fails because
   // the user isn't logged in to GMail. If that failure occurs, the user is taken to a new screen with a
   // "Log In" button. The user can click that button in order to see GMail's log in pop up.
   //
   logUserIn() {
      return new Promise(function (resolve, reject) {

         //
         // First, set the api key. Wait for it to stick.
         //
         gapi.client.setApiKey(apiKey);
         window.setTimeout(_ => {
            authorizeUserShowUserLoginForm();
         }, 1);

         //
         // This version is necessary for when the user isn't logged in. It causes the log in popup to show.
         //
         var authorizeUserShowUserLoginForm = () => {
            gapi.auth.authorize({
               client_id: clientId,
               scope: scopes,
               immediate: false
            }, handleAuthResult);
            return false;
         }

         //
         // Now, Google has authenticated the user.
         //
         var handleAuthResult = (authResult) => {
            if (authResult && !authResult.error) {
               loadGmailApi();
            } else {
               alert('Unexpected Error! - ' + authResult.error);
            }
         }

         var loadGmailApi = () => {
            gapi.client.load('gmail', 'v1', _ => {
               resolve(true);
            });
         }
      });
   }


   getSentMessages = (start, limit = 1) => {

      const state = store.getState();
      const senttoken = state.email.senttoken
      const email_service = state.auth.email_service

      return new Promise((resolve, reject) => {

         if (email_service === "gmail") {
            let sent = [];

            let getMessagesRequest = gapi.client.gmail.users.messages.list({
               'userId': 'me',
               'labelIds': 'SENT',
               'maxResults': limit,
            });

            getMessagesRequest.execute((response) => {
               if (response === null) {
                  resolve("error page")
               }

               else {
                  let numberOfMessageDetailsToFetch = response.messages.length;
                  store.dispatch(setsenttoken(response.nextPageToken))

                  response.messages.forEach((message, messageIndex) => {

                     //
                     // We put each message "stub" here. This means that "messages" will contain newest to oldest messages
                     // in the same order as you'd see them at gmail.com. Later, we'll retrieve the details for each message.
                     // When we do that, those details need to be put into the correct position/slot in "messages."
                     //
                     sent.push(message);

                     let messageDetailsRequest = gapi.client.gmail.users.messages.get({
                        'userId': 'me',
                        'id': message.id
                     });

                     messageDetailsRequest.execute((messageDetails) => {
                        //
                        // Replace the stub with the retrieved message. This allows us to get message details at different times
                        // (some take longer than others), but the message-with-details are in the same order as the original
                        // list we retrieved.
                        //
                        sent[messageIndex] = parseSentDetails(messageDetails)
                        numberOfMessageDetailsToFetch -= 1;
                        if (numberOfMessageDetailsToFetch === 0) {
                           resolve(sent);
                        }
                     });

                  });
               }
            });
         }

         else if (email_service === "outlook") {
            let sentFolderId
            let sent = []
            let mailFolders = outlookclient.api('/me/mailFolders').get().then((response) => {
               for (let i = 0; i < response.value.length; i++) {
                  if (response.value[i].displayName === "Sent Items") {
                     sentFolderId = response.value[i].id
                  }
               }
               outlookclient.api('/me/mailFolders/' + sentFolderId + '/messages')
                  .query({ $top: limit })
                  .get().then((response) => {
                     let numberofmessages = response.value.length
                     for (let i = 0; i < response.value.length; i++) {
                        let parsedmessage = {
                           id: response.value[i].id,
                           threadid: response.value[i].conversationId,
                           from: response.value[i].from,
                           to: response.value[i].toRecipients,
                           subject: response.value[i].subject,
                           date: response.value[i].sentDateTime,
                           body: response.value[i].body.content,
                           assigned: null,
                           attachment: [],
                           label: 'SENT',
                           cc: response.value[i].ccRecipients,
                           bcc: response.value[i].bccRecipients,
                        }
                        sent.push(parsedmessage)
                     }
                     resolve(sent)
                  })
            })

         }


      }); // promise

   }

   getSpecificConversation = (id) => {
      const state = store.getState();
      const email_service = state.auth.email_service

      return new Promise((resolve, reject) => {
         if (email_service === "gmail") {
            let getThread = gapi.client.gmail.users.threads.get({
               'userId': 'me',
               'id': id,
            });

            getThread.execute((threadDetails) => {
               if (threadDetails === null) {
                  resolve("error page")
               }

               else {
                  let conversation = []
                  for (let i = 0; i < threadDetails.messages.length; i++) {
                     if (parseConversationDetails(threadDetails.messages[i]) !== "errormessage") {
                        conversation.push(parseConversationDetails(threadDetails.messages[i]))
                     }
                  }
                  resolve(conversation)
               }
            })
         }
      })
   }

   getConversations = (start, limit = 1) => {

      const state = store.getState();
      const conversationtoken = state.email.conversationtoken
      const email_service = state.auth.email_service

      return new Promise((resolve, reject) => {

         if (email_service === "gmail") {
            let i
            let conversation = []
            let threadid = []
            let getThreadIds = gapi.client.gmail.users.threads.list({
               'userId': 'me',
               'labelIds': 'INBOX',
               'maxResults': limit,
               'q': "in:inbox -category:(promotions OR social)"
            })

            getThreadIds.execute((response) => {
               if (response === null) {
                  resolve("error page")
               }

               else {
                  let numberOfConversations = response.threads.length
                  store.dispatch(setconversationtoken(response.nextPageToken))

                  response.threads.forEach((thread, threadIndex) => {
                     let getConversationRequest = gapi.client.gmail.users.threads.get({
                        'userId': 'me',
                        'id': thread.id,
                     })
                     getConversationRequest.execute((threadDetails) => {
                        let intermediate = []
                        for (i = 0; i < threadDetails.messages.length; i++) {
                           if (parseConversationDetails(threadDetails.messages[i]) !== "errormessage") {
                              intermediate.push(parseConversationDetails(threadDetails.messages[i]))
                           }
                        }
                        if (intermediate.length !== 0) {
                           conversation.push(intermediate)
                        }
                        numberOfConversations -= 1;
                        if (numberOfConversations === 0) {
                           resolve(conversation)
                        }
                     })

                  })
               }
            })
         }

         else if (email_service === "outlook") {
            let inboxFolderId
            let sentFolderId
            let conversation = []
            let conversationIdList = []
            let mailFolders = outlookclient.api('/me/mailFolders').get().then((response) => {
               for (let i = 0; i < response.value.length; i++) {
                  if (response.value[i].displayName === "Inbox") {
                     inboxFolderId = response.value[i].id
                  }
                  else if (response.value[i].displayName === "Sent Items") {
                     sentFolderId = response.value[i].id
                  }
               }
               outlookclient.api('/me/mailFolders/' + inboxFolderId + '/messages')
                  .query({ $top: limit })
                  .get().then((response) => {
                     for (let i = 0; i < response.value.length; i++) {
                        let index = conversationIdList.findIndex(x => x == response.value[i].conversationId)
                        if (index === -1) {
                           conversationIdList.push(response.value[i].conversationId)
                        }
                        else {
                           console.log('conversation already exists')
                        }
                     }
                     let numberOfConversations = conversationIdList.length
                     for (let i = 0; i < conversationIdList.length; i++) {
                        outlookclient.api("/me/messages").filter(`conversationId eq '${conversationIdList[i]}'`).get().then((response) => {
                           let intermediate = []
                           for (let i = 0; i < response.value.length; i++) {
                              if (response.value[i].parentFolderId === inboxFolderId) {
                                 let parsedmessage = {
                                    id: response.value[i].id,
                                    threadid: response.value[i].conversationId,
                                    from: response.value[i].from,
                                    to: response.value[i].toRecipients,
                                    subject: response.value[i].subject,
                                    date: response.value[i].sentDateTime,
                                    body: response.value[i].body.content,
                                    assigned: null,
                                    attachment: [],
                                    label: 'INBOX',
                                    snippet: response.value[i].bodyPreview,
                                    cc: response.value[i].ccRecipients,
                                 }
                                 intermediate.push(parsedmessage)
                              }

                              else if (response.value[i].parentFolderId === sentFolderId) {
                                 let parsedmessage = {
                                    id: response.value[i].id,
                                    threadid: response.value[i].conversationId,
                                    from: response.value[i].from,
                                    to: response.value[i].toRecipients,
                                    subject: response.value[i].subject,
                                    date: response.value[i].sentDateTime,
                                    body: response.value[i].body.content,
                                    assigned: null,
                                    attachment: [],
                                    label: 'SENT',
                                    cc: response.value[i].ccRecipients,
                                    bcc: response.value[i].bccRecipients,
                                 }
                                 intermediate.push(parsedmessage)
                              }
                           }
                           if (intermediate.length !== 0) {
                              conversation.push(intermediate)
                           }
                           numberOfConversations -= 1
                           if (numberOfConversations === 0) {
                              resolve(conversation)
                           }
                        })
                     }
                  })
            })

         }

      });
   };

   getNextPageOfConversations = (start, limit = 5) => {

      const state = store.getState();
      const conversationtoken = state.email.conversationtoken
      const email_service = state.auth.email_service
      const conversationlist = state.email.conversationlist

      return new Promise((resolve, reject) => {
         if (email_service === "gmail") {
            let i
            let conversation = []
            let threadid = []
            let getThreadIds = gapi.client.gmail.users.threads.list({
               'userId': 'me',
               'labelIds': 'INBOX',
               'maxResults': limit,
               'pageToken': conversationtoken,
               'q': "in:inbox -category:(promotions OR social)"
            })

            getThreadIds.execute((response) => {
               if (response === null) {
                  resolve("error page")
               }

               else {
                  let numberOfConversations = response.threads.length
                  store.dispatch(setconversationtoken(response.nextPageToken))

                  response.threads.forEach((thread, threadIndex) => {
                     let getConversationRequest = gapi.client.gmail.users.threads.get({
                        'userId': 'me',
                        'id': thread.id,
                     })
                     getConversationRequest.execute((threadDetails) => {
                        let intermediate = []
                        let threadid = threadDetails.id
                        for (i = 0; i < threadDetails.messages.length; i++) {
                           if (parseConversationDetails(threadDetails.messages[i]) !== "errormessage") {
                              intermediate.push(parseConversationDetails(threadDetails.messages[i]))
                           }
                        }
                        if (intermediate.length !== 0) {
                           conversation.push(intermediate)
                        }
                        numberOfConversations -= 1;
                        if (numberOfConversations === 0) {
                           resolve(conversation)
                        }
                     })

                  })
               }
            })
         }

         else if (email_service === "outlook") {
            let inboxFolderId
            let sentFolderId
            let conversation = []
            let conversationIdList = []
            let skipnumber = conversationlist.length
            let mailFolders = outlookclient.api('/me/mailFolders').get().then((response) => {
               for (let i = 0; i < response.value.length; i++) {
                  if (response.value[i].displayName === "Inbox") {
                     inboxFolderId = response.value[i].id
                  }
                  else if (response.value[i].displayName === "Sent Items") {
                     sentFolderId = response.value[i].id
                  }
               }
               outlookclient.api('/me/mailFolders/' + inboxFolderId + '/messages')
                  .query({ $top: limit, $skip: skipnumber })
                  .get().then((response) => {
                     for (let i = 0; i < response.value.length; i++) {
                        let index = conversationIdList.findIndex(x => x == response.value[i].conversationId)
                        if (index === -1) {
                           conversationIdList.push(response.value[i].conversationId)
                        }
                        else {
                           console.log('conversation already exists')
                        }
                     }
                     let numberOfConversations = conversationIdList.length
                     for (let i = 0; i < conversationIdList.length; i++) {
                        outlookclient.api("/me/messages").filter(`conversationId eq '${conversationIdList[i]}'`).get().then((response) => {
                           let intermediate = []
                           for (let i = 0; i < response.value.length; i++) {
                              if (response.value[i].parentFolderId === inboxFolderId) {
                                 let parsedmessage = {
                                    id: response.value[i].id,
                                    threadid: response.value[i].conversationId,
                                    from: response.value[i].from,
                                    to: response.value[i].toRecipients,
                                    subject: response.value[i].subject,
                                    date: response.value[i].sentDateTime,
                                    body: response.value[i].body.content,
                                    assigned: null,
                                    attachment: [],
                                    label: 'INBOX',
                                    snippet: response.value[i].bodyPreview,
                                    cc: response.value[i].ccRecipients,
                                 }
                                 intermediate.push(parsedmessage)
                              }

                              else if (response.value[i].parentFolderId === sentFolderId) {
                                 let parsedmessage = {
                                    id: response.value[i].id,
                                    threadid: response.value[i].conversationId,
                                    from: response.value[i].from,
                                    to: response.value[i].toRecipients,
                                    subject: response.value[i].subject,
                                    date: response.value[i].sentDateTime,
                                    body: response.value[i].body.content,
                                    assigned: null,
                                    attachment: [],
                                    label: 'SENT',
                                    cc: response.value[i].ccRecipients,
                                    bcc: response.value[i].bccRecipients,
                                 }
                                 intermediate.push(parsedmessage)
                              }
                           }
                           if (intermediate.length !== 0) {
                              conversation.push(intermediate)
                           }
                           numberOfConversations -= 1
                           if (numberOfConversations === 0) {
                              resolve(conversation)
                           }
                        })
                     }
                  })
            })
         }
      });
   };

   getPageOfMessages = (start, limit = 1) => {

      const state = store.getState();
      const inboxtoken = state.email.inboxtoken
      const email_service = state.auth.email_service

      return new Promise((resolve, reject) => {

         if (email_service === "gmail") {
            let messages = [];

            let getMessagesRequest = gapi.client.gmail.users.messages.list({
               'userId': 'me',
               'labelIds': 'INBOX',
               'maxResults': limit,
               'q': "in:inbox -category:(promotions OR social)"
            });

            getMessagesRequest.execute((response) => {
               if (response === null) {
                  resolve("error page")
               }
               else {
                  let numberOfMessageDetailsToFetch = response.messages.length;
                  store.dispatch(setinboxtoken(response.nextPageToken))

                  response.messages.forEach((message, messageIndex) => {

                     //
                     // We put each message "stub" here. This means that "messages" will contain newest to oldest messages
                     // in the same order as you'd see them at gmail.com. Later, we'll retrieve the details for each message.
                     // When we do that, those details need to be put into the correct position/slot in "messages."
                     //
                     messages.push(message);

                     let messageDetailsRequest = gapi.client.gmail.users.messages.get({
                        'userId': 'me',
                        'id': message.id
                     });

                     messageDetailsRequest.execute((messageDetails) => {

                        //
                        // Replace the stub with the retrieved message. This allows us to get message details at different times
                        // (some take longer than others), but the message-with-details are in the same order as the original
                        // list we retrieved.
                        //
                        messages[messageIndex] = parseMessageDetails(messageDetails)
                        numberOfMessageDetailsToFetch -= 1;
                        if (numberOfMessageDetailsToFetch === 0) {
                           resolve(messages);
                        }
                     });

                  });
               }
            });
         }

         else if (email_service === "outlook") {
            let inboxFolderId
            let messages = []
            let mailFolders = outlookclient.api('/me/mailFolders').get().then((response) => {
               for (let i = 0; i < response.value.length; i++) {
                  if (response.value[i].displayName === "Inbox") {
                     inboxFolderId = response.value[i].id
                  }
               }
               outlookclient.api('/me/mailFolders/' + inboxFolderId + '/messages')
                  .query({ $top: limit })
                  .get().then((response) => {
                     let numberofmessages = response.value.length
                     for (let i = 0; i < response.value.length; i++) {
                        let parsedmessage = {
                           id: response.value[i].id,
                           threadid: response.value[i].conversationId,
                           from: response.value[i].from,
                           to: response.value[i].toRecipients,
                           subject: response.value[i].subject,
                           date: response.value[i].sentDateTime,
                           body: response.value[i].body.content,
                           assigned: null,
                           attachment: [],
                           label: 'INBOX',
                           snippet: response.value[i].bodyPreview,
                           cc: response.value[i].ccRecipients,
                        }
                        messages.push(parsedmessage)
                     }
                     resolve(messages)
                  })
            })
         }

      }); // promise

   }

   getNextPageOfMessages = (start, limit = 10) => {

      const state = store.getState();
      const inboxtoken = state.email.inboxtoken
      const email_service = state.auth.email_service
      const inboxlist = state.email.inboxlist

      return new Promise((resolve, reject) => {

         if (email_service === "gmail") {
            let messages = [];

            let getMessagesRequest = gapi.client.gmail.users.messages.list({
               'userId': 'me',
               'labelIds': 'INBOX',
               'maxResults': limit,
               'pageToken': inboxtoken,
               'q': "in:inbox -category:(promotions OR social)"
            });

            getMessagesRequest.execute((response) => {
               if (response === null) {
                  resolve("error page")
               }

               else {
                  let numberOfMessageDetailsToFetch = response.messages.length;
                  store.dispatch(setinboxtoken(response.nextPageToken))

                  response.messages.forEach((message, messageIndex) => {

                     //
                     // We put each message "stub" here. This means that "messages" will contain newest to oldest messages
                     // in the same order as you'd see them at gmail.com. Later, we'll retrieve the details for each message.
                     // When we do that, those details need to be put into the correct position/slot in "messages."
                     //
                     messages.push(message);

                     let messageDetailsRequest = gapi.client.gmail.users.messages.get({
                        'userId': 'me',
                        'id': message.id
                     });

                     messageDetailsRequest.execute((messageDetails) => {

                        //
                        // Replace the stub with the retrieved message. This allows us to get message details at different times
                        // (some take longer than others), but the message-with-details are in the same order as the original
                        // list we retrieved.
                        //
                        messages[messageIndex] = parseMessageDetails(messageDetails)
                        numberOfMessageDetailsToFetch -= 1;
                        if (numberOfMessageDetailsToFetch === 0) {
                           resolve(messages);
                        }
                     });

                  });
               }
            });
         }

         else if (email_service === "outlook") {
            let inboxFolderId
            let messages = []
            let skipnumber = inboxlist.length
            let mailFolders = outlookclient.api('/me/mailFolders').get().then((response) => {
               for (let i = 0; i < response.value.length; i++) {
                  if (response.value[i].displayName === "Inbox") {
                     inboxFolderId = response.value[i].id
                  }
               }
               outlookclient.api('/me/mailFolders/' + inboxFolderId + '/messages')
                  .query({ $top: limit, $skip: skipnumber })
                  .get().then((response) => {
                     let numberofmessages = response.value.length
                     for (let i = 0; i < response.value.length; i++) {
                        let parsedmessage = {
                           id: response.value[i].id,
                           threadid: response.value[i].conversationId,
                           from: response.value[i].from,
                           to: response.value[i].toRecipients,
                           subject: response.value[i].subject,
                           date: response.value[i].sentDateTime,
                           body: response.value[i].body.content,
                           assigned: null,
                           attachment: [],
                           label: 'INBOX',
                           snippet: response.value[i].bodyPreview,
                           cc: response.value[i].ccRecipients,
                        }
                        messages.push(parsedmessage)
                     }
                     resolve(messages)
                  })
            })
         }

      }); // promise

   }

   getNextSentMessages = (start, limit = 10) => {

      const state = store.getState();
      const senttoken = state.email.senttoken
      const email_service = state.auth.email_service
      const sentlist = state.email.sentlist

      return new Promise((resolve, reject) => {

         if (email_service === "gmail") {
            let sent = [];

            let getMessagesRequest = gapi.client.gmail.users.messages.list({
               'userId': 'me',
               'labelIds': 'SENT',
               'maxResults': limit,
               'pageToken': senttoken,
            });

            getMessagesRequest.execute((response) => {
               if (response === null) {
                  resolve("error page")
               }

               else {
                  let numberOfMessageDetailsToFetch = response.messages.length;
                  store.dispatch(setsenttoken(response.nextPageToken))

                  response.messages.forEach((message, messageIndex) => {

                     //
                     // We put each message "stub" here. This means that "messages" will contain newest to oldest messages
                     // in the same order as you'd see them at gmail.com. Later, we'll retrieve the details for each message.
                     // When we do that, those details need to be put into the correct position/slot in "messages."
                     //
                     sent.push(message);

                     let messageDetailsRequest = gapi.client.gmail.users.messages.get({
                        'userId': 'me',
                        'id': message.id
                     });

                     messageDetailsRequest.execute((messageDetails) => {
                        //
                        // Replace the stub with the retrieved message. This allows us to get message details at different times
                        // (some take longer than others), but the message-with-details are in the same order as the original
                        // list we retrieved.
                        //
                        sent[messageIndex] = parseSentDetails(messageDetails)
                        numberOfMessageDetailsToFetch -= 1;
                        if (numberOfMessageDetailsToFetch === 0) {
                           resolve(sent);
                        }
                     });

                  });
               }
            });

         }

         else if (email_service === "outlook") {
            let sentFolderId
            let sent = []
            let skipnumber = sentlist.length
            let mailFolders = outlookclient.api('/me/mailFolders').get().then((response) => {
               for (let i = 0; i < response.value.length; i++) {
                  if (response.value[i].displayName === "Sent Items") {
                     sentFolderId = response.value[i].id
                  }
               }
               outlookclient.api('/me/mailFolders/' + sentFolderId + '/messages')
                  .query({ $top: limit, $skip: skipnumber })
                  .get().then((response) => {
                     let numberofmessages = response.value.length
                     for (let i = 0; i < response.value.length; i++) {
                        let parsedmessage = {
                           id: response.value[i].id,
                           threadid: response.value[i].conversationId,
                           from: response.value[i].from,
                           to: response.value[i].toRecipients,
                           subject: response.value[i].subject,
                           date: response.value[i].sentDateTime,
                           body: response.value[i].body.content,
                           assigned: null,
                           attachment: [],
                           label: 'SENT',
                           cc: response.value[i].ccRecipients,
                           bcc: response.value[i].bccRecipients,
                        }
                        sent.push(parsedmessage)
                     }
                     resolve(sent)
                  })
            })
         }

      }); // promise

   }

   updateTicketEmail(emailIdList) {
      const state = store.getState();
      const email_service = state.auth.email_service

      return new Promise((resolve, reject) => {

         if (email_service === "gmail") {

         }

         else if (email_service === "outlook") {
            let inboxFolderId
            let sentFolderId
            let conversation = []
            let mailFolders = outlookclient.api('/me/mailFolders').get().then((response) => {
               for (let i = 0; i < response.value.length; i++) {
                  if (response.value[i].displayName === "Inbox") {
                     inboxFolderId = response.value[i].id
                  }
                  else if (response.value[i].displayName === "Sent Items") {
                     sentFolderId = response.value[i].id
                  }
               }
               let numberOfConversations = emailIdList.length
               for (let i = 0; i < emailIdList.length; i++) {
                  outlookclient.api("/me/messages").filter(`conversationId eq '${emailIdList[i]}'`).get().then((response) => {
                     let intermediate = []
                     for (let i = 0; i < response.value.length; i++) {
                        if (response.value[i].parentFolderId === inboxFolderId) {
                           let parsedmessage = {
                              id: response.value[i].id,
                              threadid: response.value[i].conversationId,
                              from: response.value[i].from,
                              to: response.value[i].toRecipients,
                              subject: response.value[i].subject,
                              date: response.value[i].sentDateTime,
                              body: response.value[i].body.content,
                              assigned: null,
                              attachment: [],
                              label: 'INBOX',
                              snippet: response.value[i].bodyPreview,
                              cc: response.value[i].ccRecipients,
                           }
                           intermediate.push(parsedmessage)
                        }

                        else if (response.value[i].parentFolderId === sentFolderId) {
                           let parsedmessage = {
                              id: response.value[i].id,
                              threadid: response.value[i].conversationId,
                              from: response.value[i].from,
                              to: response.value[i].toRecipients,
                              subject: response.value[i].subject,
                              date: response.value[i].sentDateTime,
                              body: response.value[i].body.content,
                              assigned: null,
                              attachment: [],
                              label: 'SENT',
                              cc: response.value[i].ccRecipients,
                              bcc: response.value[i].bccRecipients,
                           }
                           intermediate.push(parsedmessage)
                        }
                     }
                     if (intermediate.length !== 0) {
                        conversation.push(intermediate)
                     }
                     numberOfConversations -= 1
                     if (numberOfConversations === 0) {
                        resolve(conversation)
                     }
                  })
               }
            })
         }
      })
   }

   enqueueEmailToBeSent(email) {
      this.outbox.push(email);
   }

   sendQueuedEmails() {

      //
      // Bind the promise function to "this"
      //
      return new Promise((resolve, reject) => {

         if (this.outbox.length === 0) {
            setTimeout(_ => resolve(), 0);
         } else {
            let promises = [];

            //
            // Clone the outbox.
            //
            let outbox = this.outbox.slice();
            this.outbox.length = 0;

            //
            // Work from the clone. Create promises for each email that needs to be sent. These promises will
            // send the emails. 
            //
            outbox.forEach((email) => {
               promises.push(this.sendEmail(email));
            });

            //
            // Now, once all the emails have been sent, call the "resolve" function - so the client controller
            // knows the send is done.
            //
            Promise.all(promises).then(function (values) {
               resolve();
            });
         }
      });
   }

   sendEmail = (email) => {
      const state = store.getState();
      const email_service = state.auth.email_service

      return new Promise((resolve, reject) => {
         //
         // Create the email.
         //
         if (email_service === "gmail") {
            let i
            let attachments = ''
            for (i = 0; i < email.attachment.length; i++) {
               let content = email.attachment[i].data.split(",")[1];
               let attachment = ['--012boundary01\r\n',
                  'Content-Type: ' + email.attachment[i].type + '\r\n',
                  'MIME-Version: 1.0\r\n',
                  'Content-Transfer-Encoding: base64\r\n',
                  'Content-Disposition: attachment; filename=' + email.attachment[i].name + '\r\n\r\n',
                  content, '\r\n\r\n'].join('');
               attachments += attachment
            };
            var isHTML = RegExp.prototype.test.bind(/(<([^>]+)>)/i);
            let text
            let to
            if (isHTML(email.body)) {
               text = email.body
               text = text.replace(/\n/g, "<br />");
            }

            else {
               text = '<p>' + email.body + '</p>'
               text = text.replace(/\n/g, "<br />");
            }

            to = email.to.join()

            let mail = [
               'Content-Type: multipart/mixed; boundary="012boundary01"\r\n',
               'MIME-Version: 1.0\r\n',
               'To: ' + to + '\r\n',
               'Subject: ' + email.subject + '\r\n',
               'In-Reply-To: ' + email.replyid + '\r\n\r\n',
               '--012boundary01\r\n',
               'Content-Type: multipart/alternative; boundary=012boundary02\r\n\r\n',
               '--012boundary02\r\n',
               'Content-Type: text/html; charset=UTF-8\r\n',
               'Content-Transfer-Encoding: base64\r\n\r\n',
               text + '\r\n\r\n',
               '--012boundary02--\r\n',

               attachments,

               '--012boundary01--'
            ].join('');

            var sendRequest = gapi.client.gmail.users.messages.send({
               'userId': 'me',
               'resource': {
                  'raw': window.btoa(unescape(encodeURIComponent(mail))).replace(/\+/g, '-').replace(/\//g, '_'),
                  'threadId': email.threadid
               },
            });

            sendRequest.execute((response) => {
               resolve(response);
            });
         }

         else if (email_service === "outlook") {
            var isHTML = RegExp.prototype.test.bind(/(<([^>]+)>)/i);
            let text
            if (isHTML(email.body)) {
               text = email.body
               text = text.replace(/\n/g, "<br />");
            }

            else {
               text = '<p>' + email.body + '</p>'
               text = text.replace(/\n/g, "<br />");
            }

            let attachmentlist = []
            let to = []
            for (let i = 0; i < email.attachment.length; i++) {
               let contentbyte = email.attachment[i].data.split(',')[1]
               attachmentlist.push({
                  "@odata.type": "#Microsoft.OutlookServices.FileAttachment",
                  "Name": email.attachment[i].name,
                  "ContentBytes": contentbyte
               })
            }

            for (let i = 0; i < email.to.length; i++) {
               to.push(
                  {
                     emailAddress: {
                        address: email.to[i],
                     },
                  }
               )
            }

            let messageBody = {
               message: {
                  subject: email.subject,
                  body: {
                     contentType: "HTML",
                     content: text,
                  },
                  toRecipients: to,
                  attachments: attachmentlist
               },
            };
            if (email.microsoftreplyid) {
               outlookclient.api("/me/messages/" + email.microsoftreplyid + "/reply")
                  .headers({ "Content-Type": "application/json" })
                  .post(messageBody).then((response) => {
                     resolve()
                  })
            }

            else if (email.microsoftforwardid) {
               outlookclient.api("/me/messages/" + email.microsoftforwardid + "/forward")
                  .headers({ "Content-Type": "application/json" })
                  .post(messageBody).then((response) => {
                     resolve()
                  })
            }

            else {
               outlookclient.api("/me/sendMail")
                  .headers({ "Content-Type": "application/json" })
                  .post(messageBody).then((response) => {
                     resolve()
                  })
            }

         }
      });
   }

   watchNotifications = () => {
      const state = store.getState();
      const email_service = state.auth.email_service

      return new Promise((resolve, reject) => {

         if (email_service === "gmail") {
            let watchRequest = gapi.client.gmail.users.watch({
               'userId': 'me',
               'resource': {
                  'labelIds': ["INBOX", "SENT"],
                  'labelFilterAction': 'include',
                  'topicName': 'projects/ascendant-voice-274408/topics/EmailNotifications',
               },
            })
            watchRequest.execute((response) => {
               store.dispatch(sethistoryid(response.historyId))
               resolve();
            })
         }

         else if (email_service === "outlook") {
            resolve()
         }

      })
   }

   getHistoryList = () => {

      const state = store.getState();
      const historyid = state.email.historyid;
      const email_service = state.auth.email_service

      return new Promise((resolve, reject) => {

         if (email_service === "gmail") {
            let historyRequest = gapi.client.gmail.users.history.list({
               'userId': 'me',
               'startHistoryId': historyid,
               'historyTypes': "messageAdded",
            })

            let newmessages = []

            historyRequest.execute((response) => {
               store.dispatch(sethistoryid(response.historyId))
               try {
                  let numberOfMessageDetailsToFetch = response.history.length
                  response.history.forEach((message, messageIndex) => {
                     let messageDetailsRequest = gapi.client.gmail.users.messages.get({
                        'userId': 'me',
                        'id': message.messages[0].id
                     });

                     messageDetailsRequest.execute((messageDetails) => {
                        let intermediate = []
                        //
                        // Replace the stub with the retrieved message. This allows us to get message details at different times
                        // (some take longer than others), but the message-with-details are in the same order as the original
                        // list we retrieved.
                        if (parseConversationDetails(messageDetails) !== "errormessage") {
                           newmessages.push(parseConversationDetails(messageDetails))
                        }
                        numberOfMessageDetailsToFetch -= 1;
                        if (numberOfMessageDetailsToFetch === 0) {
                           resolve(newmessages);
                        }
                     });

                  })
               }

               catch (err) {
                  resolve();
               }

            })
         }

         else if (email_service === "outlook") {
            resolve()
         }
      })
   }

}

export { GmailController }