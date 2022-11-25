import React from "react";
import { useDispatch } from "react-redux";
import useRequest from "./useRequest";
//import DraftFormsAPI from "../../api/forms";
import DraftFormsAPI from "../../api/draft";
import { FULFILLED, wrapFnAsync } from "../../util_funcs/awaitPromises";

function useDraftForm({ draftId } = {}) {
  const dispatch = useDispatch();

  const getDraft = React.useCallback(async () => {
    return await DraftFormsAPI.getForm(draftId);
  }, [draftId]);

  const [updating, setUpdating] = React.useState(false);
  const [updateError, setUpdateError] = React.useState();
  const { loading, error, run, data: draft } = useRequest(getDraft);

  const updateForm = React.useCallback(
    async (draft) => {
      if (loading || updating) {
        return;
      }

      setUpdating(true);
      setUpdateError(null);
      const { status, reason } = await wrapFnAsync(() =>
        DraftFormsAPI.updateForm(draft)
      );

      if (status === FULFILLED) {
        setUpdating(false);
        run();
      } else {
        setUpdateError(reason?.message || "Error updating draft");
        setUpdating(false);
      }

      return { status, reason };
    },
    [loading, updating, dispatch, run]
  );

  const addForm = React.useCallback(
    async (draft) => {
      return await wrapFnAsync(() => DraftFormsAPI.addForm(draft));
    },
    [dispatch]
  );

  return {
    draft,
    loading,
    error,
    updating,
    updateError,
    addForm,
    updateForm,
    getDraft: run,
  };
}

export default useDraftForm;
