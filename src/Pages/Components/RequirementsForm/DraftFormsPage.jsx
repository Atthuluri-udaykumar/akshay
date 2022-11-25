import React, { useState } from "react";
import RequirementFormsList from "./RequirementFormsList";
import { useNavigate } from "react-router-dom";
import useRequirementForms from "../../hooks/useRequirementForms";
import useSearchRequirementForms from "../../hooks/useSearchRequirementForms";

export default function DraftFormsPage() {
  const navigate = useNavigate();
  const formsHook = useRequirementForms({ isDraftForm: true });
  const searchHook = useSearchRequirementForms({ isDraftForm: true });
  const onSelectForm = (form) => {
    navigate(`/draftforms/${form.formId}`);
  };

  return (
    <RequirementFormsList
      formsHook={formsHook}
      searchHook={searchHook}
      onSelectForm={onSelectForm}
    />
  );
}
