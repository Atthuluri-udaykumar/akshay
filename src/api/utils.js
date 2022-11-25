import awsconfig from "../aws-config";
import SessionSelectors from "../redux-store/session/selectors";
import reduxStore from "../redux-store/store";

const apiName = awsconfig.api.endpoints[0].name;

export const apiBase = {
  apiName,
};

export function getLillyIDForAPI() {
  const user = SessionSelectors.getUser(reduxStore.getState());

  if (user) {
    return user.attributes.preferred_username;
  }
}
