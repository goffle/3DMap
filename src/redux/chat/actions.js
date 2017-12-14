export const actions = {
  SEND_MESSAGE: 'SEND_MESSAGE',
  SEND_MESSAGE_SUCCESS: 'SEND_MESSAGE_SUCCESS',
  SEND_MESSAGE_ERROR: 'SEND_MESSAGE_ERROR',
  RECEIVED_MESSAGE_SUCCESS: 'RECEIVED_MESSAGE_SUCCESS',
  NEW_MESSAGE: 'NEW_MESSAGE',
  NEW_TICKET: 'NEW_TICKET'
};

export const sendMessage = (message, from = 'client') => ({
  type: actions.SEND_MESSAGE,
  message,
  from
});
