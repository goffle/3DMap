import { actions } from './actions';

const initState = {
  locations: [],
};

export default function authReducer(state = initState, action) {
  switch (action.type) {
    case actions.GET_LOCATION_SUCCESS:
      return action.locations;
    default:
      return state;
  }
}
