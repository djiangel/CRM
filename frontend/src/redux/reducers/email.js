import { updateObject } from '../utility';

const initialState = {
	threadid: '',
	isSignedIn: false,
	replySubject: '',
	replyTo: [],
	conversationtoken: '',
	conversationlist: [],
	emailview: '',
	inboxlist: [],
	inboxtoken: '',
	sentlist: [],
	senttoken: '',
	historyid: '',
}

const changeThreadId = (state, action) => {
	return updateObject(state, {
		threadid: action.threadid
	});
}

const changeIsSignedIn = (state, action) => {
	return updateObject(state, {
		isSignedIn: true
	});
}

const changeReplySubject = (state, action) => {
	return updateObject(state, {
		replySubject: action.replySubject
	})
}

const changeReplyTo = (state, action) => {
	console.log(action.replyTo)
	return updateObject(state, {
		replyTo: action.replyTo
	})
}

const setConversationList = (state, action) => {
	return updateObject(state, {
		conversationlist: state.conversationlist.concat(action.conversationlist)
	})
}

const setInboxList = (state, action) => {
	return updateObject(state, {
		inboxlist: state.inboxlist.concat(action.inboxlist)
	})
}

const setSentList = (state, action) => {
	return updateObject(state, {
		sentlist: state.sentlist.concat(action.sentlist)
	})
}

const setConversationToken = (state, action) => {
	return updateObject(state, {
		conversationtoken: action.conversationtoken
	})
}

const setInboxToken = (state, action) => {
	return updateObject(state, {
		inboxtoken: action.inboxtoken
	})
}

const setSentToken = (state, action) => {
	return updateObject(state, {
		senttoken: action.senttoken
	})
}

const setEmailView = (state, action) => {
	return updateObject(state, {
		emailview: action.emailview
	})
}

const setHistoryId = (state, action) => {
	return updateObject(state, {
		historyid: action.historyid
	})
}

const updateThread = (state, action) => {
	let output = state.conversationlist;
	output[action.x].push(action.update)
	return updateObject(state, {
		conversationlist: output
	})
}

const updateConversationList = (state, action) => {
	console.log(action.update)
	console.log(state.conversationlist)
	return updateObject(state, {
		conversationlist: [action.update, ...state.conversationlist]
		//conversationlist: state.conversationlist.concat(action.update)
	})
}

const reducer = (state = initialState, action) => {
	switch (action.type) {
		case 'CHANGE_THREADID': return changeThreadId(state, action);
		case 'CHANGE_ISSIGNEDIN': return changeIsSignedIn(state, action);
		case 'CHANGE_REPLYSUBJECT': return changeReplySubject(state, action);
		case 'CHANGE_REPLYTO': return changeReplyTo(state, action);
		case 'SET_CONVERSATIONLIST': return setConversationList(state, action);
		case 'SET_CONVERSATIONTOKEN': return setConversationToken(state, action);
		case 'SET_EMAILVIEW': return setEmailView(state, action);
		case 'SET_INBOXLIST': return setInboxList(state, action);
		case 'SET_INBOXTOKEN': return setInboxToken(state, action);
		case 'SET_SENTLIST': return setSentList(state, action);
		case 'SET_SENTTOKEN': return setSentToken(state, action);
		case 'SET_HISTORYID': return setHistoryId(state, action);
		case 'UPDATE_THREAD': return updateThread(state, action);
		case 'UPDATE_CONVERSATIONLIST': return updateConversationList(state, action);
		default:
			return state;
	}
}

export default reducer;