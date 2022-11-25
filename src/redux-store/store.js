import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import questionTemplateReducer from "./questionTemplates/reducer";
import requirementFormsReducer from "./requirementForms/reducer";
import sessionReducer from "./session/reducer";

const reducer = combineReducers({
  forms: requirementFormsReducer,
  questions: questionTemplateReducer,
  session: sessionReducer,
});

const reduxStore = configureStore({
  reducer,
});

export default reduxStore;
