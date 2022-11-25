import { createAsyncThunk } from "@reduxjs/toolkit";
import RequirementFormsAPI from "../../api/forms";
import { devLogError } from "../../util_funcs/reusables";
import { getContainerActions } from "../utils";
import RequirementFormSelectors from "./selector";

const RequirementFormActionsBase = getContainerActions("forms");

/**
 * arg
 * {
 *    isSoftLoad: boolean - when to show loading indicator or not
 *      useful when loading data after an update, add, or delete
 * }
 */
const loadForms = createAsyncThunk(
  "forms/unused/loadForms",
  async (arg, thunkApi) => {
    if (RequirementFormSelectors.getLoading(thunkApi.getState())) {
      return;
    }

    thunkApi.dispatch(
      RequirementFormActions.setPending({ isSoftLoad: arg.isSoftLoad })
    );

    try {
      const shortForms = await RequirementFormsAPI.getShortForms();

      thunkApi.dispatch(
        RequirementFormActions.bulkAdd(
          shortForms.map((form) => ({ id: form.formId, data: form }))
        )
      );

      thunkApi.dispatch(RequirementFormActions.setFulfilled());
      return { forms: shortForms, successful: true };
    } catch (error) {
      devLogError(error);
      const errorMessage = error?.message || "Error loading requirement forms";
      thunkApi.dispatch(RequirementFormActions.setError(errorMessage));
      return { errorMessage, failed: true };
    }
  }
);

class RequirementFormActions extends RequirementFormActionsBase {
  static loadForms = loadForms;
}

export default RequirementFormActions;
