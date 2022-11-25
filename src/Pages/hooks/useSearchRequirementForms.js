import React from "react";
import { useDispatch } from "react-redux";
import RequirementFormActions from "../../redux-store/requirementForms/actions";
import RequirementFormsAPI from "../../api/forms";
import RequirementFormsSearchOptions from "../Components/RequirementsForm/SearchOptions";
import useMappedPaginatedData from "./useMappedPaginatedData";
import DraftFormsAPI from "../../api/draft";

function useSearchRequirementForms({ isDraftForm } = { isDraftForm: false }) {
  const hasOptions = React.useCallback((options) => {
    return (
      !!options.submissionTypeId ||
      !!options.productTypeIds.length ||
      !!options.dossierTypeIds.length
    );
  }, []);

  const internalFetch = React.useCallback(
    async ({ fetchExtra, pageNumber }) => {
      if (!hasOptions(fetchExtra)) {
        return;
      }

      const result = await (isDraftForm
        ? DraftFormsAPI.searchForms(fetchExtra, pageNumber)
        : RequirementFormsAPI.searchForms(fetchExtra, pageNumber));

      return result;
    },
    []
  );

  const pageHook = useMappedPaginatedData({
    defaultFetchExtra: RequirementFormsSearchOptions.defaultOptions,
    defaultPageSize: 5,
    manual: true,
    fetch: internalFetch,
  });

  const clearResults = React.useCallback(() => {
    pageHook.clear();
    pageHook.setFetchExtra(RequirementFormsSearchOptions.defaultOptions);
  }, [pageHook]);

  return {
    ...pageHook,
    hasOptions,
    clearResults,
  };
}

export default useSearchRequirementForms;
