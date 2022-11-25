import React from "react";
import useSingleRequirementForm from "../../hooks/useSingleRequirementForm";
import { useFormik } from "formik";
import { useRequest } from "ahooks";
import { FULFILLED } from "../../../util_funcs/awaitPromises";
import { END } from "./constants";
import { noop, delay } from "lodash";
import RequirementFormBase from "./RequirementFormBase";
import { useNavigate, useParams } from "react-router-dom";
import TasksAPI from "../../../api/task";
import { useOperationWrapper } from "../../hooks/useOperationWrapper";
import {
  getPublishedFormUsingDraftForm,
  usePublishForm,
} from "../../hooks/usePublishForm";
import { IForm } from "../RequirementsForm/types";
import { IWrappedAsyncFnResult } from "../../../util_funcs/awaitPromises";
import useConfirmationPrompt from "../../hooks/useConfirmationPrompt";

const DraftForm = (props) => {
  const { formId } = useParams();
  const query = window.location.search;
  const { confirm } = useConfirmationPrompt();

  const isPublishedFormId = React.useMemo(() => {
    return query.includes("isPublishedFormId");
  }, [query]);

  const isDiffMode = React.useMemo(() => {
    return query.includes("diffForm");
  }, [query]);

  const controller = useSingleRequirementForm({
    formId,
    isPublishedFormId,
    isDraftForm: true,
  });

  const {
    loading,
    initialized,
    error,
    updating,
    deleting,
    getForm,
    updateForm,
    saveNewDraftForm,
    deleteForm,
    form: initialForm,
  } = controller;

  const initialFormId = initialForm?.formId;
  const submissionTypeId = initialForm?.submissionType;
  const productTypeId = initialForm?.productType?.optionId;
  const dossierTypeId = initialForm?.dossierType?.optionId;
  const navigate = useNavigate();
  const internalSaveChanges = React.useCallback(
    async (formData: IForm) => {
      let result: IWrappedAsyncFnResult | undefined = undefined;

      if (isPublishedFormId) {
        formData.publishedFormId = formData.formId;
        formData.formId = 0;
        result = await saveNewDraftForm(formData);

        if (result?.status === FULFILLED) {
          const newDraftForm = result.value;

          //   Delay to prevent React shouting on you about
          ("attempting to update an unmounted component");
          delay(() => {
            navigate(`/draftforms/${newDraftForm}`);
          }, 500);
        }
      } else {
        result = await updateForm(formData);
      }

      if (result && result.status !== FULFILLED) {
        throw new Error(result.reason?.message);
      }
    },
    [isPublishedFormId]
  );

  const internalDeleteForm = React.useCallback(async () => {
    if (isPublishedFormId) {
      delay(() => {
        navigate(`/draftforms`);
      }, 500);
      return;
    }

    const result = await deleteForm();

    if (result?.status === FULFILLED) {
      // Delay to prevent React shouting on you about
      // "attempting to update an unmounted component"
      delay(() => {
        navigate(`/draftforms`);
      }, 500);
    } else {
      throw new Error(result?.reason?.message || "Error deleting form.");
    }
  }, [isPublishedFormId]);

  const deleteFormHelper = useOperationWrapper(internalDeleteForm, {
    loadingMessage: "Deleting draft form...",
    successMessage: "Draft form deleted.",
    defaultErrorMessage: "Error deleting draft form.",
  });

  const formik = useFormik({
    // force removing undefined here is okay, cause RequirementFormBase
    // which uses formik.values is not going to do anything with the form
    initialValues: initialForm!,
    onSubmit: internalSaveChanges,
  });

  const saveFormHelper = useOperationWrapper(formik.submitForm, {
    loadingMessage: "Saving draft form...",
    successMessage: "Draft form saved.",
    defaultErrorMessage: "Error saving draft form.",
  });

  const getTaskFn = React.useCallback(
    async (formId: number) => {
      if (!isPublishedFormId && formId) {
        const taskId = await TasksAPI.getTaskByDraftId(formId);

        if (taskId) {
          const task = await TasksAPI.getTask(taskId);
          return task;
        }
      }
    },
    [isPublishedFormId]
  );

  const getTaskResult = useRequest(getTaskFn, { manual: true });

  const getPublishedFormItemsFn = React.useCallback(
    async (
      submissionTypeId: number,
      productTypeId?: number,
      dossierTypeId?: number
    ) => {
      const publishedform = await getPublishedFormUsingDraftForm(
        submissionTypeId,
        productTypeId,
        dossierTypeId
      );

      if (publishedform) {
        return publishedform.questions;
      } else {
        return [];
      }
    },
    []
  );

  const getPublishedFormItemsResult = useRequest(getPublishedFormItemsFn, {
    manual: true,
  });

  React.useEffect(() => {
    // Reset the form values when the initial value changes either because the
    // selected form has finished loading or a new form is loaded
    if (initialForm) {
      formik.setValues(initialForm);
    }
  }, [initialForm]);

  React.useEffect(() => {
    if (initialFormId) {
      getTaskResult.run(initialFormId);
    }
  }, [initialFormId, getTaskResult.run]);

  React.useEffect(() => {
    if (submissionTypeId && isDiffMode) {
      getPublishedFormItemsResult.run(
        submissionTypeId,
        productTypeId,
        dossierTypeId
      );
    }
  }, [
    submissionTypeId,
    productTypeId,
    dossierTypeId,
    isDiffMode,
    getPublishedFormItemsResult.run,
  ]);

  const findFormItemIndexByQuestionId = (formItems, questionId) => {
    return formItems.findIndex(
      (item) => item.questionTemplateId === questionId
    );
  };

  const findFormItemByQuestionId = (formItems, questionId) => {
    return formItems.find((item) => item.questionTemplateId === questionId);
  };

  // Deletes goto logic options where the destination question/form item
  // is behind the form item
  const rebalanceFormItemLogic = (formItems) => {
    return formItems.map((formItem) => {
      formItem = { ...formItem };
      formItem.logic = { ...formItem.logic };
      Object.keys(formItem.logic).forEach((optionId) => {
        const destQuestionId = formItem.logic[optionId];

        if (destQuestionId === END) {
          return;
        }

        const destFormItem = findFormItemByQuestionId(
          formik.values.questions,
          destQuestionId
        );

        if (destFormItem?.index <= formItem.index) {
          delete formItem.logic[optionId];
        }
      });

      return formItem;
    });
  };

  const onChangeOrder = (formItem, up) => {
    let newFormItems = formik.values.questions;
    const index = findFormItemIndexByQuestionId(
      newFormItems,
      formItem.questionTemplateId
    );

    if (index === -1) {
      return;
    }

    if (up) {
      if (index > 0) {
        const prevFormItem = newFormItems[index - 1];
        newFormItems[index] = prevFormItem;
        newFormItems[index - 1] = formItem;
      }
    } else {
      if (index < newFormItems.length - 1) {
        const nextFormItem = newFormItems[index + 1];
        newFormItems[index] = nextFormItem;
        newFormItems[index + 1] = formItem;
      }
    }

    newFormItems = newFormItems.map((formItem, formItemIndex) => {
      return { ...formItem, index: formItemIndex };
    });
    newFormItems = rebalanceFormItemLogic(newFormItems);
    formik.setFieldValue("questions", newFormItems);
  };

  const handleOnUpdateGoto = (formItem, optionId, destQuestionId) => {
    const newQuestions = [...formik.values.questions];
    const formItemIndex = newQuestions.findIndex(
      (item) => item.questionTemplateId === formItem.questionTemplateId
    );

    if (formItemIndex === -1) {
      return;
    }

    const newFormItem = { ...formItem };
    newFormItem.logic = { ...newFormItem.logic };
    newFormItem.logic[optionId] = destQuestionId;
    newQuestions[formItemIndex] = newFormItem;

    const newForm = { ...formik.values, questions: newQuestions };
    formik.setValues(newForm);
  };

  const handleCompletePublishForm = React.useCallback(async ({ formId }) => {
    delay(() => {
      if (formId) {
        navigate(`/publishedforms/${formId}`);
      } else {
        navigate(`/forms`);
      }
    }, 500);
  }, []);

  const publishFormHelpers = usePublishForm({
    onCompletePublishForm: handleCompletePublishForm,
    saveFormFn: internalSaveChanges,
  });

  const handlePublishForm = React.useCallback(async () => {
    const formData = formik.values;
    await publishFormHelpers.run(formData);
  }, [formik.values, publishFormHelpers.run]);

  const onCreateTaskFn = React.useCallback(async () => {
    const formData = formik.values as IForm;
    await TasksAPI.newReviewDraftTask(formData.formId, formData.formName);
    await getTaskResult.run(formData.formId);
  }, [formik.values]);

  const createTaskHelper = useOperationWrapper(onCreateTaskFn, {
    loadingMessage: "Creating task...",
    successMessage: "Task created.",
    defaultErrorMessage: "Error creating task.",
  });

  const handleCompleteTaskFn = React.useCallback(async () => {
    if (getTaskResult.data) {
      await handlePublishForm();
      await TasksAPI.completeTask(getTaskResult.data.taskId);

      delay(() => {
        navigate("/assignedtasks");
      }, 500);
    }
  }, [getTaskResult.data, handlePublishForm]);

  const completeTaskHelper = useOperationWrapper(handleCompleteTaskFn, {
    loadingMessage: "Completing task...",
    successMessage: "Task completed.",
    defaultErrorMessage: "Error completing task.",
  });

  const pageLoading = loading || getTaskResult.loading;

  return (
    <RequirementFormBase
      isDraftForm
      form={formik.values}
      publishedFormItems={getPublishedFormItemsResult.data}
      formDisabled={false}
      loading={pageLoading}
      initialized={initialized}
      isSaving={updating}
      isPublishing={publishFormHelpers.loading}
      isDeleting={deleting}
      disableDeleteForm={isPublishedFormId}
      error={error}
      handleOnUpdateGoto={handleOnUpdateGoto}
      onChangeOrder={onChangeOrder}
      getForm={getForm}
      onEditForm={noop}
      onSaveForm={saveFormHelper.run}
      onPublishForm={handlePublishForm}
      onDeleteDraftForm={deleteFormHelper.run}
      isCreatingTask={createTaskHelper.loading}
      onCreateTask={createTaskHelper.run}
      draftFormTask={getTaskResult.data}
      isCompletingReview={completeTaskHelper.loading}
      onCompleteReview={completeTaskHelper.run}
    />
  );
};

export default DraftForm;

