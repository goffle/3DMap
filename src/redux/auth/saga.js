import { all, takeEvery, put, fork, call } from 'redux-saga/effects';
import { actions } from './actions';
import Firebase from '../../helpers/firebase.js';
import MixPanel from '../../helpers/mixpanel.js';

export function* loginRequest() {
  yield takeEvery(actions.LOGIN_REQUEST, function* callLogin({ organisationId }) {
    try {
      console.log('Get user');
      const user = yield call(Firebase.signinOrCreateUser, organisationId);
      console.log('Get organisation');
      const organisation = yield call(Firebase.getOrganisation, organisationId);
      console.log('Get agents');
      const agents = yield call(Firebase.getAgents, organisationId);
      yield call(Firebase.trackActivity, organisationId, user.id);
      console.log('Start mixpanel');
      MixPanel.identify(user.id);
      MixPanel.register({ organisationId });
      MixPanel.track('login');
      console.log('End mixpanel');
      yield put({ type: actions.LOGIN_SUCCESS, organisationId, userId: user.id, user, organisation, agents,error: null })
    } catch (e) {
      console.log(e);
      console.log('Can\'t login with api key ' + organisationId);
      yield put({ type: actions.LOGIN_ERROR, user: null, userId: null, organisation: null, error: e })
    }
  });
}

export default function* rootSaga() {
  yield all([
    fork(loginRequest)
  ]);
}

