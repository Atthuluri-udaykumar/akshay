import React from "react";
import { FULFILLED, wrapFnAsync } from "../../util_funcs/awaitPromises";
import RequirementFormsAPI from "../../api/forms";
import useMappedPaginatedData from "./useMappedPaginatedData";
import DraftFormsAPI from "../../api/draft";

function useRequirementForms(
  { manual, isDraftForm } = { manual: false, isDraftForm: false }
) {
  const loadForms = React.useCallback(async ({ pageNumber }) => {
    const result = await (isDraftForm
      ? DraftFormsAPI.getShortForms(pageNumber)
      : RequirementFormsAPI.getShortForms(pageNumber));
    return result;
  }, []);

  const pageHook = useMappedPaginatedData({
    manual,
    defaultPageSize: 5,
    fetch: loadForms,
  });

  const addForm = React.useCallback(
    async (form, preventLoadForms = false) => {
      if (!isDraftForm) {
        return;
      }

      const { status, reason } = await wrapFnAsync(() =>
        DraftFormsAPI.addForm(form)
      );

      if (status === FULFILLED) {
        if (!preventLoadForms) {
          pageHook.clear();
        }
      }

      return { status, reason, pageHook };
    },
    [loadForms]
  );

  const updateForm = React.useCallback(
    async (form, preventLoadForms = false) => {
      if (!isDraftForm) {
        return;
      }

      const { status, reason } = await wrapFnAsync(() =>
        DraftFormsAPI.updateForm(form)
      );

      if (status === FULFILLED) {
        if (!preventLoadForms) {
          pageHook.clear();
        }
      } else {
        throw reason;
      }
    },
    [pageHook]
  );

  return { addForm, updateForm, ...pageHook };
}

export default useRequirementForms;
