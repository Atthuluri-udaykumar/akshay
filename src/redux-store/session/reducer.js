import { createReducer } from "@reduxjs/toolkit";
import SessionActions from "./actions";

const sessionReducer = createReducer({}, (builder) => {
  builder.addCase(SessionActions.setUser, (state, action) => {
    state.user = action.payload;
  });

  builder.addCase(SessionActions.logoutUser, (state, action) => {
    return {};
  });
});

export default sessionReducer;
