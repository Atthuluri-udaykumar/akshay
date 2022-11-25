import React, { useState } from "react";
import RequirementFormsList from "./RequirementFormsList";
import { useNavigate } from "react-router-dom";
import useRequirementForms from "../../hooks/useRequirementForms";
import useSearchRequirementForms from "../../hooks/useSearchRequirementForms";

export default function PublishedFormsPage() {
  const navigate = useNavigate();
  const formsHook = useRequirementForms();
  const searchHook = useSearchRequirementForms();
  const onSelectForm = (form) => {
    navigate(`/publishedforms/${form.formId}`);
  };

  return (
    <RequirementFormsList
      formsHook={formsHook}
      searchHook={searchHook}
      onSelectForm={onSelectForm}
    />
  );
}
