// sagas.js
import { all, fork } from "redux-saga/effects";
import rootSaga from "./sagas";
import notificationSaga from "./workflow";
import workflowSaga from "./notification";
import authenticationSaga from "./auth";
import ticketSaga from "./ticket";
import userprofileSaga from "./userprofile";
import calendarSaga from "./calendar";

export default function* combinedSage () {
  yield all([
    fork(workflowSaga),
    fork(rootSaga),
    fork(notificationSaga),
    fork(authenticationSaga),
    fork(ticketSaga),
    fork(userprofileSaga),
    fork(calendarSaga),
  ]);
}