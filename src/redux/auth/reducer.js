import { actions } from './actions';

const initState = {
  userId: null,
  user: null,
  organisationId: null,
  organisation: null,
  error: null
};

export default function authReducer(state = initState, action) {

  switch (action.type) {
    case actions.LOGIN_REQUEST:
      return { ...state }
    case actions.LOGIN_SUCCESS:
      return { ...state, userId: action.userId, user: action.user, organisationId: action.organisationId, organisation: action.organisation, agents: action.agents }
    case actions.LOGIN_ERROR:
      return { ...state, error: action.error }
    default:
      return state;
  }
}
