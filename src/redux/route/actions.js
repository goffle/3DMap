export const actions = {
  STEPCHANGE: 'STEPCHANGE',
};

export const changeStep = (step) => (
  {
    type: actions.STEPCHANGE,
    payload: step
  }
)
