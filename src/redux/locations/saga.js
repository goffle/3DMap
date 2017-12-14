import { all, takeEvery, put, call, select } from 'redux-saga/effects';

import { actions } from './actions';
import Firebase from '../../helpers/firebase.js';
import { getOrganisationId } from './../selector';


export function* getLocations() {
  try {
    const organisationId = yield select(getOrganisationId);
    const locations = yield call(Firebase.getLocations, organisationId);
    yield put({ type: actions.GET_LOCATION_SUCCESS, locations })
  } catch (e) {
    console.log(e);
    yield put({ type: actions.GET_LOCATION_ERROR })
  }
}


export default function* rootSaga() {
  yield all([
    takeEvery('LOGIN_SUCCESS', getLocations),
  ]);
}

