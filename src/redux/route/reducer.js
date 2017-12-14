import { actions } from './actions';

const initState = {
  step: 'main',
};

export default function menuReducer(state = initState, action) {
  switch (action.type) {
    case actions.STEPCHANGE:
      return { step: action.payload }
    default:
      return state;
  }
}
