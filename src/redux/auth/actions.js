export const actions = {
  LOGIN_REQUEST: 'LOGIN_REQUEST',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_ERROR: 'LOGIN_ERROR'
};

export const login = (organisationId) => ({
  type: actions.LOGIN_REQUEST,
  organisationId
});
