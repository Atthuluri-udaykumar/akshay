import React from "react";
import { useOperationWrapper } from "./useOperationWrapper";
import RequirementFormsAPI from "../../api/forms";
import { IForm } from "../Components/RequirementsForm/types";
import { searchFormByMetadataIds } from "../Components/RequirementsForm/utils";

export interface IUsePublishFormOnCompleteCbProps {
  formId: number | null;
}

export interface IUsePublishFormProps {
  saveFormFn: (form: IForm) => Promise<void> | void;
  onCompletePublishForm: (
    props: IUsePublishFormOnCompleteCbProps
  ) => Promise<void> | void;
}

export async function getPublishedFormUsingDraftForm(
  submissionTypeId: number,
  productTypeId?: number,
  dossierTypeId?: number
): Promise<IForm | undefined> {
  const formIds = await RequirementFormsAPI.formExists(
    submissionTypeId,
    productTypeId,
    dossierTypeId
  );

  const existingForms = await RequirementFormsAPI.getMultipleRequirementForms(
    formIds
  );

  const publishedForm = searchFormByMetadataIds(existingForms, {
    submissionTypeId,
    productTypeId,
    dossierTypeId,
  });

  return publishedForm;
}

export function usePublishForm(props: IUsePublishFormProps) {
  const { saveFormFn, onCompletePublishForm } = props;
  const publishFormFn = React.useCallback(
    async (form: IForm) => {
      await saveFormFn(form);

      // passed to onCompletePublishForm if draft form is new
      let newFormId = null;
      const publishedForm = await getPublishedFormUsingDraftForm(
        form.submissionType,
        form.productType?.optionId,
        form.dossierType?.optionId
      );

      if (publishedForm) {
        form.publishedFormId = publishedForm.formId;
        form.questions.forEach((item) => {
          const existingItem = publishedForm.questions.find(
            (item02) => item02.questionTemplateId === item.questionTemplateId
          );

          if (existingItem) {
            item.publishedFormFormItemId = existingItem.formItemId;
          } else {
            item.publishedFormFormItemId = 0;
          }
        });

        await RequirementFormsAPI.publishExistingForm(form);
      } else {
        newFormId = await RequirementFormsAPI.publishNewForm(form);
      }

      await onCompletePublishForm({ formId: newFormId });
    },
    [onCompletePublishForm, saveFormFn]
  );

  const publishFormHelper = useOperationWrapper(publishFormFn, {
    loadingMessage: "Publishing form...",
    successMessage: "Form published",
    defaultErrorMessage: "Error publishing form.",
  });

  return publishFormHelper;
}
