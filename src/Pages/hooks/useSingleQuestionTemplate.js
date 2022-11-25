import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { unwrapResult } from "@reduxjs/toolkit";
import QuestionTemplateActions from "../../redux-store/questionTemplates/actions";
import QuestionTemplateSelectors from "../../redux-store/questionTemplates/selector";

function useSingleQuestionTemplate({ questionTemplateId, preventInit } = {}) {
  const dispatch = useDispatch();
  const [preventLoadEffect, setPreventLoadEffect] = React.useState(preventInit);

  // Check if we have the questionTemplateId cause some questions have their ID as undefined
  const question = useSelector(
    (state) =>
      questionTemplateId &&
      QuestionTemplateSelectors.getOne(state, questionTemplateId)
  );
  const itemState = useSelector((state) =>
    QuestionTemplateSelectors.getItemState(state, questionTemplateId)
  );
  const loading =
    itemState?.fetching || itemState?.isSoftLoad || itemState?.updating;
  const questionLoaded = !!question;
  const showLoading =
    (questionTemplateId && !questionLoaded) ||
    (itemState?.fetching && !itemState?.isSoftLoad);

  const getQuestion = React.useCallback(
    async (isSoftLoad = false) => {
      let result = await dispatch(
        QuestionTemplateActions.getQuestion({ questionTemplateId, isSoftLoad })
      );

      result = unwrapResult(result);
      return result;
    },
    [dispatch, questionTemplateId]
  );

  // This effect attempts to fetch the question if we have an ID
  // and the question is not in Redux or soft reload
  // the data otherwise to get the latest version on component mount
  React.useEffect(() => {
    if (!questionTemplateId || preventLoadEffect) {
      return;
    }

    // we want this effect to run only once
    setPreventLoadEffect(true);

    if (questionLoaded) {
      if (!loading) {
        getQuestion({ isSoftLoad: true });
      }
    } else {
      if (!loading) {
        getQuestion();
      }
    }
  }, [loading, questionLoaded, getQuestion, questionTemplateId]);

  // React.useEffect(() => {
  //   if (questionTemplateId) {
  //     if (question && question.questionTemplateId !== questionTemplateId) {

  //     }
  //   }
  // }, [])

  const updateQuestion = React.useCallback(
    async (data, sendNotification) => {
      let result = await dispatch(
        QuestionTemplateActions.updateQuestion({
          sendNotification,
          question: data,
        })
      );
      result = unwrapResult(result);
      return result;
    },
    [dispatch]
  );

  const addQuestion = React.useCallback(
    async (data) => {
      let result = await dispatch(
        QuestionTemplateActions.addQuestion({ question: data })
      );
      result = unwrapResult(result);
      return result;
    },
    [dispatch]
  );

  return {
    itemState,
    question,
    showLoading,
    addQuestion,
    getQuestion,
    updateQuestion,
  };
}

export default useSingleQuestionTemplate;
