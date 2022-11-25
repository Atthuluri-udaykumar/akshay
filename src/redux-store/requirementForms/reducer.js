import { createReducer } from "@reduxjs/toolkit";
import { addBuilderContainerCases } from "../utils";
import RequirementFormActions from "./actions";

const defaultState = {
  isLoading: false,
  isSoftLoad: false,
  isDataLoaded: false,
  loadError: null,
  data: {},
  updatingItemsId: [],
};

const requirementFormsReducer = createReducer(defaultState, (builder) => {
  addBuilderContainerCases(builder, RequirementFormActions, defaultState);
});

export default requirementFormsReducer;
