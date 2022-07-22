import { combineReducers } from 'redux';
import auth from './auth';
import messages from './messages';
import notifications from './notifications';
import api from './api'
import workflow from './workflow';
import ticket from './ticket';
import loading from './loading';
import mediaquery from './mediaquery';
import userprofile from './userprofile';
import calendar from './calendar';
import email from './email';
import layout from './layout';

export default combineReducers({
  auth,
  messages,
  notifications,
  api,
  workflow,
  ticket,
  loading,
  mediaquery,
  userprofile,
  calendar,
  email,
  layout,
});