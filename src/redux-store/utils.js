import { createAction, createReducer } from "@reduxjs/toolkit";
import { mergeData } from "../util_funcs/reusables";
import SessionActions from "./session/actions";

export function getContainerActions(name) {
  // takes an object with structure
  // { id: number, data: object }
  const add = createAction(`${name}/add`);

  // takes an object with structure
  // { id: number, data: object, meta: { *check mergeData params } }
  const update = createAction(`${name}/update`);

  // takes the item id as argument
  const remove = createAction(`${name}/remove`);

  // takes an array of add()'s arguments
  const bulkAdd = createAction(`${name}/bulkAdd`);

  // takes an array of update()'s arguments
  const bulkUpdate = createAction(`${name}/bulkUpdate`);

  // takes an array of remove()'s arguments
  const bulkRemove = createAction(`${name}/bulkRemove`);

  // takes an object with structure
  // { isSoftLoad: boolean }
  // softLoad is when you load data and don't want to show
  // a loading screen
  const setPending = createAction(`${name}/setPending`);

  // takes no arguments
  const setFulfilled = createAction(`${name}/setFulfilled`);

  // takes an error message as argument
  // a default error message is assigned if one is not provided
  const setError = createAction(`${name}/setError`);

  // {
  //   id: number;
  //   fetching: boolean;
  //   isSoftLoad: boolean;
  //   updating: boolean;
  //   fetchError: string;
  //   updateError: string;
  // }
  const updateItemState = createAction(`${name}/updateItemState`);

  // arguments same is updateItemState
  const replaceItemState = createAction(`${name}/replaceItemState`);

  // takes the item id as argument
  const removeItemState = createAction(`${name}/removeItemState`);

  return class {
    static add = add;
    static update = update;
    static remove = remove;
    static bulkAdd = bulkAdd;
    static bulkUpdate = bulkUpdate;
    static bulkRemove = bulkRemove;
    static setPending = setPending;
    static setFulfilled = setFulfilled;
    static setError = setError;
    static updateItemState = updateItemState;
    static replaceItemState = replaceItemState;
    static removeItemState = removeItemState;
  };
}

export function addBuilderContainerCases(builder, actions, defaultState) {
  if (actions.add) {
    builder.addCase(actions.add, (state, action) => {
      state = state.data;
      state[action.payload.id] = action.payload.data;
    });
  }

  if (actions.update) {
    builder.addCase(actions.update, (state, action) => {
      state = state.data;
      state[action.payload.id] = mergeData(
        state[action.payload.id],
        action.payload.data,
        action.payload.meta
      );
    });
  }

  if (actions.remove) {
    builder.addCase(actions.remove, (state, action) => {
      state = state.data;
      delete state[action.payload.id];
    });
  }

  if (actions.bulkAdd) {
    builder.addCase(actions.bulkAdd, (state, action) => {
      action.payload.forEach((item) => {
        state.data[item.id] = item.data;
      });
    });
  }

  if (actions.bulkUpdate) {
    builder.addCase(actions.bulkUpdate, (state, action) => {
      state = state.data;
      action.payload.forEach((item) => {
        state[item.id] = mergeData(state[item.id], item.data, item.meta);
      });
    });
  }

  if (actions.bulkRemove) {
    builder.addCase(actions.bulkRemove, (state, action) => {
      state = state.data;
      action.payload.forEach((item) => delete state[item.id]);
    });
  }

  if (actions.setPending) {
    builder.addCase(actions.setPending, (state, action) => {
      state.isLoading = true;
      state.isSoftLoad = action.payload.isSoftLoad || false;
    });
  }

  if (actions.setFulfilled) {
    builder.addCase(actions.setFulfilled, (state) => {
      state.isLoading = false;
      state.isSoftLoad = false;
      state.isDataLoaded = true;
    });
  }

  if (actions.setError) {
    builder.addCase(actions.setError, (state, action) => {
      state.isLoading = false;
      state.isSoftLoad = false;
      state.loadError = action.payload || "An error occurred";
    });
  }

  if (actions.updateItemState) {
    builder.addCase(actions.updateItemState, (state, action) => {
      const existing = state.itemsState[action.payload.id] || {};
      state.itemsState[action.payload.id] = {
        ...existing,
        ...action.payload,
      };
    });
  }

  if (actions.replaceItemState) {
    builder.addCase(actions.replaceItemState, (state, action) => {
      state.itemsState[action.payload.id] = {
        ...action.payload,
      };
    });
  }

  if (actions.removeUpdatedItemId) {
    builder.addCase(actions.removeUpdatedItemId, (state, action) => {
      delete state.itemsState[action.payload];
    });
  }

  builder.addCase(SessionActions.logoutUser, (state, action) => {
    return defaultState;
  });
}

export function getContainerReducer(actions, defaultState) {
  return createReducer(defaultState || {}, (builder) => {
    addBuilderContainerCases(builder, actions, defaultState);
  });
}

export function getContainerSelectors(key) {
  function getOne(state, id) {
    if (state[key]) {
      state = state[key];
      state = state.data;
      return state[id];
    }
  }

  function getMany(state, ids) {
    state = state[key];
    state = state.data;
    return ids.reduce((items, id) => {
      if (state && state[id]) {
        items.push(state[id]);
      }

      return items;
    }, []);
  }

  function filter(state, fn) {
    state = state[key];
    state = state.data;
    return Object.values(state || {}).filter((item) => fn(item));
  }

  function getMap(state) {
    state = state[key];
    state = state.data;

    if (state) {
      return state;
    }
  }

  function getLoading(state) {
    state = state[key];
    return state?.isLoading;
  }

  function getIsSoftLoad(state) {
    state = state[key];
    return state?.isSoftLoad;
  }

  function showLoading(state) {
    return getLoading(state) && !getIsSoftLoad(state);
  }

  function getError(state) {
    state = state[key];
    return state?.loadError;
  }

  function getItemState(state, id) {
    state = state[key] || {};
    return (state.itemsState || {})[id];
  }

  function areItemsLoaded(state) {
    state = state[key];
    return state?.isDataLoaded;
  }

  function getItems(state) {
    state = state[key];
    return state?.data || [];
  }

  return class {
    static getOne = getOne;
    static getMany = getMany;
    static filter = filter;
    static getMap = getMap;
    static getItems = getItems;
    static getLoading = getLoading;
    static getIsSoftLoad = getIsSoftLoad;
    static showLoading = showLoading;
    static getError = getError;
    static getItemState = getItemState;
    static areItemsLoaded = areItemsLoaded;
  };
}
