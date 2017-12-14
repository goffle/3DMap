import { actions } from './actions';

const initState = {
  messages: [],
  newConversation: false
};

export default function authReducer(state = initState, action) {
  switch (action.type) {
    case actions.SEND_MESSAGE_SUCCESS:
    case actions.RECEIVED_MESSAGE_SUCCESS:
      {
        const newState = { ...state };
        newState.messages.push(...action.messages);
        return newState;
      }
    case actions.NEW_TICKET: {
      const newState = { ...state, ticketId: action.ticketId };
      return newState;
    }
    case actions.SEND_MESSAGE_ERROR:
      return { ...state}
    default:
      return state;
  }
}
