import { createAsyncThunk, unwrapResult } from "@reduxjs/toolkit";
import QuestionTemplateAPI from "../../api/questions";
import { devLogError } from "../../util_funcs/reusables";
import { getContainerActions } from "../utils";
import QuestionTemplateSelectors from "./selector";

const QuestionTemplateActionsBase = getContainerActions("questions");

/**
 * arg
 * {
 *    isSoftLoad: boolean - when to show loading indicator or not
 *      useful when loading data after an update, add, or delete
 * }
 */
const loadQuestions = createAsyncThunk(
  "questions/unused/loadQuestions",
  async (arg, thunkApi) => {
    if (QuestionTemplateSelectors.getLoading(thunkApi.getState())) {
      return;
    }

    thunkApi.dispatch(
      QuestionTemplateActions.setPending({ isSoftLoad: arg.isSoftLoad })
    );

    try {
      const questions = await QuestionTemplateAPI.getAllQuestions();
      thunkApi.dispatch(
        QuestionTemplateActions.bulkAdd(
          questions.map((question) => ({
            id: question.questionTemplateId,
            data: question,
          }))
        )
      );

      thunkApi.dispatch(QuestionTemplateActions.setFulfilled());
      return { successful: true };
    } catch (error) {
      devLogError(error);
      const errorMessage = error?.message || "Error loading question templates";
      thunkApi.dispatch(QuestionTemplateActions.setError(errorMessage));
      return { errorMessage, failed: true };
    }
  }
);

/**
 * arg
 * {
 *    question: QuestionTemplate -
 *      check web_app\src\Pages\ReusableComponents\QuestionTable\utils.js for details
 * }
 */
const addQuestion = createAsyncThunk(
  "questions/unused/addQuestion",
  async (arg, thunkApi) => {
    try {
      await QuestionTemplateAPI.saveQuestion(arg.question);

      // await thunkApi.dispatch(
      //   getQuestion({
      //     questionTemplateId: result.questionTemplateId,
      //   })
      // );

      // const question = QuestionTemplateSelectors.getOne(
      //   thunkApi.getState(),
      //   result.questionTemplateId
      // );

      // return { question, successful: true };

      // Reload all the questions
      thunkApi.dispatch(
        loadQuestions({
          isSoftLoad: true,
        })
      );

      return { successful: true };
    } catch (error) {
      devLogError(error);
      const errorMessage = error?.message || "Error adding question template";
      return { errorMessage, failed: true };
    }
  }
);

/**
 * arg
 * {
 *    sendNotification: boolean
 *    question: QuestionTemplate -
 *      check web_app\src\Pages\ReusableComponents\QuestionTable\utils.js for details
 * }
 */
const updateQuestion = createAsyncThunk(
  "questions/unused/updateQuestion",
  async (arg, thunkApi) => {
    const itemState = QuestionTemplateSelectors.getItemState(
      thunkApi.getState(),
      arg.question.questionTemplateId
    );

    if (itemState?.fetching || itemState?.updating) {
      return;
    }

    thunkApi.dispatch(
      QuestionTemplateActions.replaceItemState({
        id: arg.question.questionTemplateId,
        updating: true,
      })
    );

    let result;

    try {
      await QuestionTemplateAPI.updateQuestion(arg.question, arg.notification);

      await thunkApi.dispatch(
        getQuestion({
          questionTemplateId: arg.question.questionTemplateId,
        })
      );

      thunkApi.dispatch(
        QuestionTemplateActions.replaceItemState({
          id: arg.question.questionTemplateId,
          updating: false,
        })
      );

      result = { successful: true };
    } catch (error) {
      devLogError(error);
      const errorMessage = error?.message || "Error updating question template";
      result = { errorMessage, failed: true };
      thunkApi.dispatch(
        QuestionTemplateActions.replaceItemState({
          id: arg.question.questionTemplateId,
          updating: false,
          updateError: errorMessage,
        })
      );
    }

    return result;
  }
);

/**
 * arg
 * {
 *    questionTemplateId: number;
 *    isSoftLoad: boolean;
 * }
 */
const getQuestion = createAsyncThunk(
  "questions/unused/getQuestion",
  async (arg, thunkApi) => {
    const itemState = QuestionTemplateSelectors.getItemState(
      thunkApi.getState(),
      arg.questionTemplateId
    );

    if (itemState?.fetching || itemState?.updating) {
      return;
    }

    thunkApi.dispatch(
      QuestionTemplateActions.replaceItemState({
        id: arg.questionTemplateId,
        fetching: true,
        isSoftLoad: arg.isSoftLoad,
      })
    );

    try {
      const question = await QuestionTemplateAPI.getQuestion(
        arg.questionTemplateId
      );

      thunkApi.dispatch(
        QuestionTemplateActions.add({
          id: arg.questionTemplateId,
          data: question,
        })
      );

      thunkApi.dispatch(
        QuestionTemplateActions.replaceItemState({
          id: arg.questionTemplateId,
          fetching: false,
        })
      );

      return { successful: true };
    } catch (error) {
      devLogError(error);
      const errorMessage = error?.message || "Error loading question templates";
      thunkApi.dispatch(
        QuestionTemplateActions.replaceItemState({
          id: arg.questionTemplateId,
          fetching: false,
          fetchError: errorMessage,
        })
      );

      return { errorMessage, failed: true };
    }
  }
);

class QuestionTemplateActions extends QuestionTemplateActionsBase {
  static loadQuestions = loadQuestions;
  static addQuestion = addQuestion;
  static updateQuestion = updateQuestion;
  static getQuestion = getQuestion;
}

export default QuestionTemplateActions;
