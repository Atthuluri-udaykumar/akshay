/**
 * styled page to display forms like FormPreview
 */
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { delay, forEach } from "lodash";
import useSingleRequirementForm from "../../../Pages/hooks/useSingleRequirementForm";
import LoadStateAndError from "../../../Pages/ReusableComponents/LoadStateAndError";
import AnswerFormLogic from "../RequirementsForm/AnswerFormLogic";
import { SearchRadioButtonsValue } from "./SearchRadioButton";
import SearchAPI, {
  IAnswerFormats,
  IAPIAnswerFormAnswerDataItem,
  IOriginalAnswerFormData,
} from "../../../api/search";
import { useRequest } from "ahooks";
import { useOperationWrapper } from "../../../Pages/hooks/useOperationWrapper";
import { FormQuestionType } from "../../../Pages/ReusableComponents/QuestionTable/types";
import { tryParseJSON } from "../../../util_funcs/reusables";
import useConfirmationPrompt from "../../hooks/useConfirmationPrompt";
import { assertItem, tryStringifyObject } from "../../../util_funcs/fns";
import {
  IQuestionAnswer,
  QuestionsAnswersMap,
} from "../RequirementsForm/types";

export interface IFormAnswer extends IAnswerFormats {
  submission_req_tmplt_id: number;
}

//get draft form answers
const getFormAnswers = SearchAPI.getFormAnswers;
//get finalized answers
const getFinalizedAnswers = SearchAPI.getFinalizedAnswers;

//check if there are draft answers
function hasDraftAnswers(items: IFormAnswer[]) {
  for (const item of items) {
    if (item.form_qstn_ansr_drft_data_id) {
      return true;
    }
  }
  return false;
}

function isFinalizedAnswers(items: IFormAnswer[]) {
  return items.some((item) => !!item.form_qstn_ansr_data_id);
}

function convertDraftAnswerToFormAnswer(
  items: Awaited<ReturnType<typeof getFormAnswers>>
): IFormAnswer[] {
  return items.map((item) => ({
    ...(item.answer || {}),
    submission_req_tmplt_id: item.submission_req_tmplt_id,
  }));
}

function convertFinalizedAnswerToFormAnswer(
  items: Awaited<ReturnType<typeof getFinalizedAnswers>>
): IFormAnswer[] {
  return items;
}

function formAnswerToQuestionAnswersMap(answers: IFormAnswer[]) {
  const answersMap: QuestionsAnswersMap = {};

  // if there are answers on the form tie answers to their associated fields
  answers.forEach((item) => {
    if (item?.submission_req_tmplt_id) {
      const incomingValue =
        item.txt_data ||
        item.cst_data ||
        item.duration_data ||
        item.lst_data ||
        item.dt_data;

      const value = tryStringifyObject(incomingValue, "", "String");
      const answer: IQuestionAnswer = {
        value,
        effectiveDate: item.effective_dt,
      };
      answersMap[item.submission_req_tmplt_id] = answer;
    }
  });

  return answersMap;
}

function isNotApplicable(item: IFormAnswer) {
  return !(
    item.cst_data ||
    item.dt_data ||
    item.duration_data ||
    item.lst_data ||
    item.txt_data
  );
}

function formAnswerToApiAnswer(
  formId: string | number,
  answers: IFormAnswer[],

  // isDraftUpdate means is this for updating or finalizing a form
  isDraftUpdate: boolean,

  // initialEdit means the first time a finalized form is edited
  initialEdit: boolean
): IAPIAnswerFormAnswerDataItem[] {
  return answers.map((item) => ({
    sub_req_forms_id: formId,
    req_question_type_lst_id: item.req_question_type_lst_id,
    submission_req_tmplt_id: item.submission_req_tmplt_id,
    not_applicable: isNotApplicable(item),
    is_active: true,
    draft: isDraftUpdate,
    fnl_form_qstn_ansr_data_id: isDraftUpdate
      ? item.form_qstn_ansr_data_id
      : undefined,
    form_qstn_ansr_data_id: isDraftUpdate
      ? undefined
      : item.form_qstn_ansr_data_id,

    //fnl_form_qstn_ansr_data_id: item.form_qstn_ansr_data_id,
    form_qstn_ansr_drft_data_id: initialEdit
      ? 0
      : item.form_qstn_ansr_drft_data_id,
    txt_data: item.txt_data,
    lst_data: item.lst_data,
    dt_data: item.dt_data,
    duration_data: item.duration_data,
    cst_data: item.cst_data,
    effective_dt: item.effective_dt,
  }));
}

const updateDraftAnswers = async (
  formId: string | number,
  countryId: string | number,
  answerDataList: IAPIAnswerFormAnswerDataItem[]
) => {
  const apiData: IOriginalAnswerFormData = {
    records: {
      answr_data: answerDataList,
      countries: [
        {
          countries_id: countryId,
          sub_req_forms_id: formId,
        },
      ],
    },
  };

  await SearchAPI.updateFormAnswers(apiData);
};

const AnswerUnansweredFormPage = () => {
  const { formId } = useParams();
  const params = new URLSearchParams(window.location.search);
  const countryId = params.get("countryId");
  const countryName = params.get("countryName");
  const isFinalizedFromQuery = params.has("isFinalized");
  const [formIsFinalized, setFormIsFinalized] =
    React.useState(isFinalizedFromQuery);
  const navigate = useNavigate();
  const controller = useSingleRequirementForm({
    formId,
    isDraftForm: false,
    isPublishedFormId: true,
  });

  const { loading: loadingForm, error: loadFormError, form } = controller;
  const { confirm } = useConfirmationPrompt();

  /**
   * 1st check if there is an existing draft
   *   - if there is, load draft
   * 2nd call finalized answers
   *   - convert the finalized answers into format for saving
   * 3rd save the finalized answers into a draft
   *   - set the draft id to zero and set the finalized id to the form question answer data id
   * 4th get the new draft answers and load them with new draft id
   */

  const getFormAnswers = React.useCallback(async () => {
    assertItem(countryId, "Country id missing");
    assertItem(formId, "Form id missing");

    //check if a draft exists
    let answers: IFormAnswer[] = convertDraftAnswerToFormAnswer(
      await SearchAPI.getFormAnswers(formId, countryId)
    );
    const isFinalized = isFinalizedAnswers(answers);
    setFormIsFinalized((v) => (v === true ? true : isFinalized));
    const finalizedAnswers = convertFinalizedAnswerToFormAnswer(
      await SearchAPI.getFinalizedAnswers(formId as any, countryId)
    );

    // if it is finalized and has no draft answers, get finalized answers
    if (isFinalizedFromQuery && !hasDraftAnswers(answers)) {
      // check if it is an initial edit or a draft update
      const apiAnswers = formAnswerToApiAnswer(
        formId,
        finalizedAnswers,
        true,
        true
      );

      // save the answers into draft, if it is initial edit id will be set to
      // zero or it will be the draft id
      await updateDraftAnswers(formId, countryId, apiAnswers);

      // get the new draft answers
      answers = convertDraftAnswerToFormAnswer(
        await SearchAPI.getFormAnswers(formId as string, countryId)
      );
    }

    if (finalizedAnswers?.length) {
      const finalizedAnswersMap = finalizedAnswers.reduce((map, next) => {
        map[next.submission_req_tmplt_id] = next;
        return map;
      }, {} as Record<number, IFormAnswer>);

      answers.forEach((answer) => {
        const finalAnswer = finalizedAnswersMap[answer.submission_req_tmplt_id];
        answer.fnl_form_qstn_ansr_data_id =
          finalAnswer?.fnl_form_qstn_ansr_data_id ||
          finalAnswer?.form_qstn_ansr_data_id;
      });
    }

    return answers;
  }, [formId, countryId, isFinalizedFromQuery]);

  const formAnswerResult = useRequest(getFormAnswers);
  const answers = React.useMemo(() => {
    if (formAnswerResult.data) {
      return formAnswerToQuestionAnswersMap(formAnswerResult.data);
    } else {
      return {} as QuestionsAnswersMap;
    }
  }, [formAnswerResult.data]);

  const questionIdToAnswerIdMap = React.useMemo(() => {
    const map: Record<number, { draftId?: number; finalId?: number }> = {};
    if (formAnswerResult.data) {
      formAnswerResult.data.forEach((item) => {
        if (item?.submission_req_tmplt_id) {
          map[item.submission_req_tmplt_id] = {
            draftId: item.form_qstn_ansr_drft_data_id || 0,
            finalId:
              item.fnl_form_qstn_ansr_data_id || item.form_qstn_ansr_data_id,
          };
        }
      });
    }

    return map;
  }, [formAnswerResult.data]);

  const transformToAPIAnswers = React.useCallback(
    (answers: QuestionsAnswersMap, isDraft: boolean) => {
      if (!form) {
        throw new Error("Form does not exist");
      }

      const answerDataList: IAPIAnswerFormAnswerDataItem[] = [];
      if (form.questions) {
        forEach(form.questions, (formItem, key) => {
          const answer = answers[formItem.questionTemplateId]; // get the answer for the question from the answers map
          const answerIds =
            questionIdToAnswerIdMap[formItem.questionTemplateId];

          if (!formItem.questionTemplate) {
            return;
          }

          const answerData: IAPIAnswerFormAnswerDataItem = {
            //form_qstn_ansr_data_id: answerIds.finalId,
            form_qstn_ansr_drft_data_id: isDraft
              ? answerIds.draftId
              : !answerIds.finalId
              ? answerIds.draftId
              : undefined,
            fnl_form_qstn_ansr_data_id: answerIds.finalId,
            draft: isDraft as boolean,
            is_active: true,
            req_question_type_lst_id: formItem.questionTemplate
              ?.questionTypeId as number,
            sub_req_forms_id: formId as string,
            submission_req_tmplt_id: formItem.questionTemplateId as number,
            effective_dt: answer.effectiveDate,
          };

          if (answer.value) {
            answerData.not_applicable = false;
            switch (formItem.questionTemplate.questionTypeId) {
              case FormQuestionType.SingleLineText:
              case FormQuestionType.MultiLineText:
              case FormQuestionType.Radio:
              case FormQuestionType.SingleSelectDropdown:
              case FormQuestionType.DropdownWithText:
                answerData.txt_data = answer.value;
                break;
              case FormQuestionType.Checkbox:
                answerData.lst_data = answer.value;
                break;
              case FormQuestionType.MultiSelectDropdown:
                answerData.lst_data = answer.value;
                break;
              case FormQuestionType.Date:
                answerData.dt_data = answer.value;
                break;
              case FormQuestionType.Duration:
                answerData.duration_data = answer.value;
                break;
              case FormQuestionType.Cost:
                answerData.cst_data = tryParseJSON(answer.value, 0);
                break;
            }
          } else {
            answerData.not_applicable = true;
          }

          answerDataList.push(answerData);
        });
      }

      return answerDataList;
    },
    [formId, form, questionIdToAnswerIdMap]
  );

  const updateFormAnswers = React.useCallback(
    async (value: QuestionsAnswersMap) => {
      assertItem(countryId, "country id missing");
      const answerDataList: IAPIAnswerFormAnswerDataItem[] =
        transformToAPIAnswers(value, /** isDraft */ true);
      await updateDraftAnswers(
        formId as unknown as number,
        countryId as unknown as number,
        answerDataList
      );
    },
    [countryId, formId, transformToAPIAnswers]
  );

  const { run: onUpdateAnswer } = useOperationWrapper(updateFormAnswers, {
    loadingMessage: "Updating answers...",
    successMessage: "Answers updated.",
    defaultErrorMessage: "Error updating answers.",
  });

  const promptSaveAnswers = async (value) => {
    const isConfirmed = await confirm(
      `Are you sure you want to save your changes?`,
      "confirmation",
      "Save form"
    ); //message and dialogType needs to pass, title can be optional
    if (!isConfirmed) return;
    onUpdateAnswer(value);
  };

  const deleteDraft = React.useCallback(async () => {
    if (!countryId) {
      throw new Error("country id missing");
    }
    if (!formId) {
      throw new Error("form id missing");
    }
    await SearchAPI.deleteDraftForm(formId, countryId);

    delay(() => {
      navigate(`/Search?tabs=${SearchRadioButtonsValue.Requirement}`);
    }, 500);
  }, [countryId, formId]);

  const finalizeForm = React.useCallback(
    async (value: QuestionsAnswersMap) => {
      if (!countryId) {
        throw new Error("country id missing");
      }

      const answerDataList: IAPIAnswerFormAnswerDataItem[] =
        transformToAPIAnswers(value, /** isDraft */ false);
      const apiData: IOriginalAnswerFormData = {
        records: {
          countries: [
            { countries_id: countryId, sub_req_forms_id: formId as string },
          ],
          answr_data: answerDataList,
        },
      };

      await SearchAPI.finalizeFormAnswers(apiData);
      delay(() => {
        navigate(`/Search?tabs=${SearchRadioButtonsValue.Requirement}`);
      }, 500);
    },
    [countryId, formId, transformToAPIAnswers]
  );

  const { run: onFinalizeAnswers } = useOperationWrapper(finalizeForm, {
    loadingMessage: "Finalizing answers...",
    successMessage: "Answers finalized.",
    defaultErrorMessage: "Error finalizing answers.",
  });

  const finalize = async (value) => {
    const isConfirmed: (text: any, title: any) => Promise<any> = await confirm(
      `Are you sure the form is ready to be finalized?`,
      "confirmation",
      "Finalize form"
    ); //message and title needs to pass, title can be optional
    if (!isConfirmed) return;
    onFinalizeAnswers(value);
  };

  useEffect(() => {
    if (!countryId) {
      navigate(`/Search?tabs=${SearchRadioButtonsValue.UnansweredForms}`);
    }
  }, []);

  if (
    loadingForm ||
    loadFormError ||
    !form ||
    formAnswerResult.loading ||
    formAnswerResult.error
  ) {
    return (
      <LoadStateAndError
        loading={loadingForm || !form}
        loadingMessage="Loading forms..."
        error={loadFormError?.message || formAnswerResult.error?.message}
      />
    );
  }

  return (
    <AnswerFormLogic
      countryName={countryName || undefined} 
      form={form}
      onCancel={deleteDraft}
      onSubmit={promptSaveAnswers}
      onFinalize={finalize}
      answers={answers}
    />
  );
};

export default AnswerUnansweredFormPage;
