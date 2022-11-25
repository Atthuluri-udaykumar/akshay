function getUser(state) {
  return state.session.user;
}

export default class SessionSelectors {
  static getUser = getUser;
}
