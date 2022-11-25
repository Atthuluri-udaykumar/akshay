import React from "react";
import { useDispatch } from "react-redux";
import useRequest from "./useRequest";
import DraftFormsAPI from "../../api/draft";
import RequirementFormsAPI from "../../api/forms";
import {
  FULFILLED,
  wrapFnAsync,
  IWrappedAsyncFnResult,
} from "../../util_funcs/awaitPromises";
import { IForm } from "../Components/RequirementsForm/types";

export interface IUseSingleRequirementFormProps {
  formId?: number | string;
  isDraftForm?: boolean;
  isPublishedFormId?: boolean;
}

export interface IUseSingleRequirementFormResult {
  form?: IForm;
  initialized?: boolean;
  loading?: boolean;
  error?: Error;
  updating?: boolean;
  deleting?: boolean;
  updateForm: (form: IForm) => Promise<IWrappedAsyncFnResult | undefined>;
  saveNewDraftForm: (form: IForm) => Promise<IWrappedAsyncFnResult | undefined>;
  deleteForm: () => Promise<IWrappedAsyncFnResult | undefined>;
  getForm: () => void;
}

/**
 * Fetch requirement form.
 */
function useSingleRequirementForm(
  props: IUseSingleRequirementFormProps
): IUseSingleRequirementFormResult {
  const { formId, isDraftForm, isPublishedFormId } = props;
  const dispatch = useDispatch();
  const [updating, setUpdating] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const getForm = React.useCallback(async () => {
    let form: IForm | null = null;

    if (isPublishedFormId || !isDraftForm) {
      form = await RequirementFormsAPI.getForm(formId);
    } else {
      form = await DraftFormsAPI.getForm(formId);
    }

    return form;
  }, [formId, isPublishedFormId, isDraftForm]);

  // When formId, isDraftForm, isPublishedFormId change, useRequest
  // calls getForm again to reload the data
  const { loading, initialized, error, run, data: form } = useRequest(getForm);
  const disableMutateFunction = loading || updating || !isDraftForm;
  const updateForm = React.useCallback(
    async (form) => {
      if (disableMutateFunction) {
        return;
      }

      setUpdating(true);
      const result = await wrapFnAsync(() => DraftFormsAPI.updateForm(form));
      const { status } = result;

      if (status === FULFILLED) {
        setUpdating(false);
        run();
      } else {
        setUpdating(false);
      }

      return result;
    },
    [disableMutateFunction, dispatch, run]
  );

  const deleteForm = React.useCallback(async () => {
    if (disableMutateFunction) {
      return;
    }

    setDeleting(true);
    const result = await wrapFnAsync(() => DraftFormsAPI.deleteForm(formId));
    const { status } = result;

    if (status === FULFILLED) {
      setDeleting(false);
    } else {
      setDeleting(false);
    }

    return result;
  }, [disableMutateFunction, dispatch, run]);

  const saveNewDraftForm = React.useCallback(
    async (form) => {
      if (loading || updating || !isDraftForm) {
        return;
      }

      setUpdating(true);
      const result = await wrapFnAsync(() => DraftFormsAPI.addForm(form));
      setUpdating(false);
      return result;
    },
    [loading, updating, dispatch, run, isDraftForm]
  );

  return {
    form,
    initialized,
    loading,
    error,
    updating,
    deleting,
    updateForm,
    saveNewDraftForm,
    deleteForm,
    getForm: run,
  };
}

export default useSingleRequirementForm;
