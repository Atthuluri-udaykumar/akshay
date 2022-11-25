import React from "react";
import { useDispatch } from "react-redux";
import QuestionTemplateAPI from "../../api/questions";
import QuestionTemplateActions from "../../redux-store/questionTemplates/actions";
import QuestionTableSearchControls from "../ReusableComponents/QuestionTable/QuestionSearchControls";
import useMappedPaginatedData from "./useMappedPaginatedData";

function useSearchQuestionTemplates() {
  const dispatch = useDispatch();

  const hasOptions = React.useCallback((options) => {
    const checkLength = (item) => item.length > 0;
    const canSearch =
      Object.keys(options).findIndex((item) => checkLength(options[item])) !==
      -1;

    return canSearch;
  }, []);

  const internalFetch = React.useCallback(
    async ({ fetchExtra, pageNumber }) => {
      if (!hasOptions(fetchExtra)) {
        return;
      }

      const result = await QuestionTemplateAPI.searchTemplates(
        fetchExtra.questionText,
        fetchExtra,
        pageNumber
      );

      dispatch(
        QuestionTemplateActions.bulkAdd(
          result.data.map((question) => ({
            id: question.questionTemplateId,
            data: question,
          }))
        )
      );

      return result;
    },
    []
  );

  const pageHook = useMappedPaginatedData({
    defaultFetchExtra: QuestionTableSearchControls.defaultSelectedOptions,
    defaultPageSize: 5,
    manual: true,
    // idField: "questionTemplateId",
    fetch: internalFetch,
  });

  const clearResults = React.useCallback(() => {
    pageHook.clear();
    pageHook.setFetchExtra(QuestionTableSearchControls.defaultSelectedOptions);
  }, [pageHook]);

  return {
    ...pageHook,
    clearResults,
    hasOptions,
  };
}

export default useSearchQuestionTemplates;
