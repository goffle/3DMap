import { all, takeEvery, put, call, select, take } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';

import { actions } from './actions';
import Firebase from '../../helpers/firebase.js';
import { getUserId, getOrganisationId, getCurrentTicketId } from './../selector';


export function* callSendMessage({ message, from }) {
  try {
    const organisationId = yield select(getOrganisationId);
    const clientId = yield select(getUserId);
    yield call(Firebase.sendMessage, organisationId, clientId, message, from);
  } catch (e) {
    console.log(e);
    yield put({ type: actions.SEND_MESSAGE_ERROR })
  }
};

function createEventChannel(organisationId, clientId) {
  return eventChannel(emit => {
    Firebase.listenNewMessages(organisationId, clientId, ((message) => emit(message)));
    return () => { };
  });
}

function listenPresence(action) {
  Firebase.listenPresence(action.organisationId, action.ticketId, action.userId);
}


export function* listenIncomingMessages(action) {
  const channel = yield call(createEventChannel, action.organisationId, action.userId);
  while (true) {
    const messages = yield take(channel);
    if (messages.length) {
      const currentTicketId = yield select(getCurrentTicketId);
      const newTicketId = messages[messages.length - 1].ticketId;
      if (newTicketId !== currentTicketId) {
        yield put({ type: actions.NEW_TICKET, ticketId: newTicketId, userId: action.userId, organisationId: action.organisationId })
      }
    }
    yield put({ type: actions.RECEIVED_MESSAGE_SUCCESS, messages })
  }
}

export default function* rootSaga() {
  yield all([
    takeEvery('SEND_MESSAGE', callSendMessage),
    takeEvery('LOGIN_SUCCESS', listenIncomingMessages),
    takeEvery('NEW_TICKET', listenPresence)
  ]);
}

