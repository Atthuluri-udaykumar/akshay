import { createAction } from "@reduxjs/toolkit";

const setUser = createAction("session/setUser");
const logoutUser = createAction("session/logoutUser");

export default class SessionActions {
  static setUser = setUser;
  static logoutUser = logoutUser;
}
