import { createReducer } from "@reduxjs/toolkit";
import { addBuilderContainerCases } from "../utils";
import QuestionTemplateActions from "./actions";

const defaultState = {
  isLoading: false,
  isSoftLoad: false,
  isDataLoaded: false,
  loadError: null,
  data: {},

  // indexed by item ids and value is like so
  // {
  //   id: number;
  //   fetching: boolean;
  //   isSoftLoad: boolean;
  //   updating: boolean;
  //   fetchError: string;
  //   updateError: string;
  // }
  itemsState: {},
};

const questionTemplateReducer = createReducer(defaultState, (builder) => {
  addBuilderContainerCases(builder, QuestionTemplateActions, defaultState);
});

export default questionTemplateReducer;
