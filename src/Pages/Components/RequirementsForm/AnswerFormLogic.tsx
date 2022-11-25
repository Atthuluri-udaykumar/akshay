import React from "react";
import {
  IForm,
  IFormItem,
  QuestionsAnswersMap,
  IQuestionAnswer,
} from "./types";
import { isNumber, isObject, isString, last } from "lodash";
import { END, NONE } from "./constants";
import AnswerFormRender from "./AnswerFormRender";
import { IDropdownTextFormItemValue } from "./DropdownWithTextFormItem";
import { isQuestionWithOption } from "./utils";
import { IOption } from "../../../global/types";

function hasLogic(formItem: IFormItem) {
  return Object.keys(formItem.logic || {}).length > 0;
}

interface IAnswerFormLogicState {
  slice: IFormItem[];
  answers: QuestionsAnswersMap; //Record<number, IQuestionAnswer>;
  isComplete?: boolean;
}

const allAnswersCompleted = (
  formItems: IFormItem[],
  answers: QuestionsAnswersMap
) => {
  return formItems.every((formItem) => {
    const answer = answers[formItem.questionTemplateId];

    if (
      answer?.value &&
      isQuestionWithOption(formItem.questionTemplate?.questionTypeName)
    ) {
      const answerOption = JSON.parse(answer.value); // seems like it is only called when a selected answer is changed
      const options = formItem.questionTemplate?.options || [];
      const optionsMap = options.reduce((map, option) => {
        map[option.optionId] = option;
        return map;
      }, {} as Record<number, IOption>);

      if (isString(answerOption) || isNumber(answerOption)) {
        return !!optionsMap[answerOption]; // check if the option exists
      } else if (Array.isArray(answerOption)) {
        return answerOption.some((opt) => !!optionsMap[opt]);
      } else if (answerOption?.dropdown) {
        return !!optionsMap[answerOption.dropdown];
      }

      return false;
    }

    return !!answer;
  });
};

type AddNextSliceResult = { isComplete?: boolean; slice: IFormItem[] };

function addNextSlice(
  currentSlice: IFormItem[],
  formItems: IFormItem[],
  sliceIndex = 0,
  answers: QuestionsAnswersMap = {}
): AddNextSliceResult {
  const questionsMap = formItems.reduce((map, item, i) => {
    map[item.questionTemplateId] = { formItemIndex: i, formItem: item };
    return map;
  }, {} as Record<number, { formItemIndex: number; formItem: IFormItem }>);

  const newSlice = currentSlice.slice(0, sliceIndex);
  const currentSliceItem = currentSlice[sliceIndex];
  let isComplete = false;
  let loopIndex = currentSliceItem ? currentSliceItem.index : 0;

  for (; loopIndex < formItems.length; ) {
    const formItem = formItems[loopIndex];
    newSlice.push(formItem);

    if (hasLogic(formItem)) {
      let answer = answers[formItem.questionTemplateId];

      if (isObject(answer?.value)) {
        answer.value = (answer.value as IDropdownTextFormItemValue)?.dropdown;
      }

      if (isString(answer?.value) || isNumber(answer?.value)) {
        const destQuestionTemplateId = formItem.logic[answer.value];

        if (destQuestionTemplateId === END) {
          isComplete = true;
          break;
        } else if (destQuestionTemplateId === NONE || !destQuestionTemplateId) {
          // do nothing
        } else {
          const { formItemIndex: destFormItemIndex } =
            questionsMap[destQuestionTemplateId];
          if (destFormItemIndex && destFormItemIndex > loopIndex) {
            loopIndex = destFormItemIndex;
            continue;
          }
        }
      } else {
        break;
      }
    }

    loopIndex++;
  }

  if (loopIndex === formItems.length) {
    isComplete = true;
  }

  return { isComplete, slice: newSlice };
}

export interface IAnswerFormLogicProps {
  countryName?: string;
  form: IForm;
  answers?: QuestionsAnswersMap;
  onCancel: () => void;
  onSubmit: (value: QuestionsAnswersMap) => void;
  onFinalize: (value: QuestionsAnswersMap) => void;
}

const AnswerFormLogic: React.FC<IAnswerFormLogicProps> = (props) => {
  const { form, onCancel, onSubmit, onFinalize, countryName } = props;
  const [{ slice, answers, isComplete }, setOpenQuestions] =
    React.useState<IAnswerFormLogicState>(() => {
      return {
        answers: props.answers || {},
        ...addNextSlice([], form.questions, 0, props.answers),
      };
    });

  const onAnswer = React.useCallback(
    (answer: IQuestionAnswer, sliceIndex: number) => {
      const formItem = slice[sliceIndex];
      const newAnswers = { ...answers };

      //check if answer is a string and if not then converts to string
      newAnswers[formItem.questionTemplateId] =
        !answer || !answer.value || isString(answer.value)
          ? answer
          : { ...answer, value: JSON.stringify(answer.value) };

      setOpenQuestions({ slice, isComplete, answers: newAnswers });
      if (hasLogic(formItem)) {
        setOpenQuestions({
          answers: newAnswers,
          ...addNextSlice(slice, form.questions, sliceIndex, newAnswers),
        });
      }
    },
    [slice, isComplete, form.questions, answers]
  );

  const isAnswerComplete = isComplete && allAnswersCompleted(slice, answers);
  return (
    <AnswerFormRender
      countryName={countryName}
      formName={form.formName}
      answers={answers}
      formItems={slice}
      isComplete={isAnswerComplete}
      onAnswer={onAnswer}
      onSubmit={onSubmit}
      onCancel={onCancel}
      onFinalize={onFinalize}
    />
  );
};

export default AnswerFormLogic;
