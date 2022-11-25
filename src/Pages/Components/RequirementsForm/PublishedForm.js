import React from "react";
import PropTypes from "prop-types";
import useSingleRequirementForm from "../../hooks/useSingleRequirementForm";
import { noop } from "lodash";
import RequirementFormBase from "./RequirementFormBase";
import DraftFormAPI from "../../../api/draft";
import RequirementFormsAPI from "../../../api/forms";
import { useNavigate, useParams } from "react-router-dom";
import { searchFormByMetadataIds } from "./utils";

const PublishedForm = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const controller = useSingleRequirementForm({
    formId,
    isDraftForm: false,
    isPublishedFormId: true,
  });

  const { loading, initialized, error, getForm, form } = controller;

  const onEditForm = React.useCallback(async () => {
    const formIds = await DraftFormAPI.formExists(
      form.submissionType,
      form.productType?.optionId,
      form.dossierType?.optionId
    );

    const existingForms = await RequirementFormsAPI.getMultipleRequirementForms(
      formIds
    );

    const draftForm = searchFormByMetadataIds(existingForms, {
      submissionTypeId: form.submissionType,
      productTypeId: form.productType?.optionId,
      dossierTypeId: form.dossierType?.optionId,
    });

    if (draftForm) {
      navigate(`/draftforms/${draftForm.formId}`);
    } else {
      navigate(`/draftforms/${form.formId}?isPublishedFormId=true`);
    }
  }, [form, history]);

  return (
    <RequirementFormBase
      formDisabled
      form={form}
      loading={loading}
      initialized={initialized}
      error={error}
      isDraftForm={false}
      handleOnUpdateGoto={noop}
      onChangeOrder={noop}
      getForm={getForm}
      onEditForm={onEditForm}
      onSaveForm={noop}
      onPublishForm={noop}
      onCreateTask={noop}
      onCompleteReview={noop}
      onDeleteDraftForm={noop}
    />
  );
};

export default PublishedForm;
