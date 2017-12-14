import stepReducer from './route/reducer';
import authReducer from './auth/reducer';
import chatReducer from './chat/reducer';
import locationsReducer from './locations/reducer';

export default {
  step: stepReducer,
  auth : authReducer,
  chat : chatReducer,
  locations : locationsReducer
};
