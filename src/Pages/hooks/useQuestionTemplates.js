import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { unwrapResult } from "@reduxjs/toolkit";
import QuestionTemplateActions from "../../redux-store/questionTemplates/actions";
import QuestionTemplateSelectors from "../../redux-store/questionTemplates/selector";

function useQuestionTemplates(props = { shouldInitialize: true }) {
  const dispatch = useDispatch();

  const showLoading = useSelector(QuestionTemplateSelectors.showLoading);
  const isSoftLoad = useSelector(QuestionTemplateSelectors.getIsSoftLoad);
  const loadError = useSelector(QuestionTemplateSelectors.getError);
  const areItemsLoaded = useSelector(QuestionTemplateSelectors.areItemsLoaded);
  const questionsMap = useSelector(QuestionTemplateSelectors.getItems);
  const isLoading = useSelector(QuestionTemplateSelectors.getLoading);
  const questionsArr = React.useMemo(() => {
    return Object.values(questionsMap);
  }, [questionsMap]);

  const loadQuestions = React.useCallback(
    async (isSoftLoad = false) => {
      if (isLoading) {
        return;
      }

      let result = await dispatch(
        QuestionTemplateActions.loadQuestions({ isSoftLoad })
      );

      result = unwrapResult(result);
      return result;
    },
    [dispatch]
  );

  const addQuestion = React.useCallback(
    async (question) => {
      let result = await dispatch(
        QuestionTemplateActions.addQuestion({ question })
      );

      result = unwrapResult(result);
      return result;
    },
    [dispatch]
  );

  const updateQuestion = React.useCallback(
    async (question) => {
      let result = await dispatch(
        QuestionTemplateActions.updateQuestion({ question })
      );

      result = unwrapResult(result);
      return result;
    },
    [dispatch]
  );

  const [initialized, setInitialized] = React.useState(!props.shouldInitialize);

  React.useEffect(() => {
    // run only once
    if (initialized) {
      return;
    }

    setInitialized(true);
    loadQuestions();
  }, [initialized, loadQuestions]);

  return {
    showLoading,
    isSoftLoad,
    loadError,
    areItemsLoaded,
    isLoading,
    loadQuestions,
    addQuestion,
    updateQuestion,
    questions: questionsArr,
  };
}

export default useQuestionTemplates;
