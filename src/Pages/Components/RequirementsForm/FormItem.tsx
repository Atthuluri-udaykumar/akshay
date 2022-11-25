import React from "react";
import { formQuestionTypes } from "./utils";
import RadioButtonsFormItem, {
  IRadioButtonsFormItemProps,
} from "./RadioButtonsFormItem";
import CheckboxesFormItem, {
  ICheckboxesFormItemProps,
} from "./CheckboxesFormItem";
import TextFormItem, { ITextFormItemProps } from "./TextFormItem";
import { Theme, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import DateFormItem, { IDateFormItemProps } from "./DateFormItem";
import NumberFormItem, { INumberFormItemProps } from "./NumberFormItem";
import CostFormItem from "./CostFormItem";
import DropdownWithTextFormItem, {
  IDropdownWithTextFormItemProps,
} from "./DropdownWithTextFormItem";
import { isEmptyString, tryParseJSON } from "../../../util_funcs/reusables";
import classNames from "classnames";
import { IFormItem } from "./types";
import SingleSelectDropdownFormItem, {
  ISingleSelectDropdownFormItemProps,
} from "./SingleSelectDropdownFormItem";
import MultiSelectDropdownFormItem, {
  IMultiSelectDropdownFormItemProps,
} from "./MultiSelectDropdownFormItem";

export interface FormItemProps {
  value:
    | IRadioButtonsFormItemProps["value"]
    | ICheckboxesFormItemProps["value"]
    | ISingleSelectDropdownFormItemProps["value"]
    | IDropdownWithTextFormItemProps["value"]
    | ITextFormItemProps["value"]
    | IDateFormItemProps["value"]
    | INumberFormItemProps["value"]
    | IMultiSelectDropdownFormItemProps["value"];
  formItem: IFormItem;
  onChange:
    | IRadioButtonsFormItemProps["onChange"]
    | ICheckboxesFormItemProps["onChange"]
    | ISingleSelectDropdownFormItemProps["onChange"]
    | IDropdownWithTextFormItemProps["onChange"]
    | ITextFormItemProps["onChange"]
    | IDateFormItemProps["onChange"]
    | INumberFormItemProps["onChange"]
    | IMultiSelectDropdownFormItemProps["onChange"];
}

const useStyles = makeStyles((theme: Theme) => {
  return {
    questionText: { marginBottom: theme.spacing(1) },
    answerNodeMargin: { marginTop: "16px" },
    dropdownsAndTexts: { width: "400px !important" },
  };
});

const FormItem = (props: FormItemProps) => {
  const { formItem } = props;
  const classes = useStyles();

  let answerNode: React.ReactNode = null;
  if (!formItem.questionTemplate) {
    return null;
  }
  let value = props.value as any;
  const onChange = props.onChange as any;
  const options = formItem.questionTemplate.options || [];

  switch (formItem.questionTemplate.questionTypeName) {
    case formQuestionTypes.radio:
      answerNode = (
        <RadioButtonsFormItem
          value={tryParseJSON(value, "")}
          options={options}
          onChange={onChange}
        />
      );
      break;

    case formQuestionTypes.checkbox:
      answerNode = (
        <CheckboxesFormItem
          value={tryParseJSON(value, [])}
          options={options}
          onChange={onChange}
        />
      );
      break;

    case formQuestionTypes.singleSelectDropdown:
      value = tryParseJSON(value, "");
      answerNode = (
        <SingleSelectDropdownFormItem
          value={value}
          options={options}
          onChange={onChange}
          className={classes.dropdownsAndTexts}
        />
      );
      break;

    case formQuestionTypes.multiSelectDropdown:
      answerNode = (
        <MultiSelectDropdownFormItem
          value={tryParseJSON(value, [])}
          options={options}
          onChange={onChange}
          className={classes.dropdownsAndTexts}
        />
      );
      break;

    case formQuestionTypes.date:
      answerNode = (
        /**
         * TODO: Solve the issue of the datepicker not updating the value when the user clicks a new date
         */
        <DateFormItem value={tryParseJSON(value, "")} onChange={onChange} />
      );
      break;

    case formQuestionTypes.duration:
      answerNode = (
        <NumberFormItem value={tryParseJSON(value, "")} onChange={onChange} />
      );
      break;

    case formQuestionTypes.cost:
      answerNode = (
        <CostFormItem value={tryParseJSON(value, 0)} onChange={onChange} />
      );
      break;

    case formQuestionTypes.singleLineText:
      answerNode = (
        <TextFormItem
          value={tryParseJSON(value, "")}
          onChange={onChange}
          className={classes.dropdownsAndTexts}
        />
      );
      break;

    case formQuestionTypes.multiLineText:
      answerNode = (
        <TextFormItem
          multiline
          value={tryParseJSON(value, "")}
          onChange={onChange}
          className={classes.dropdownsAndTexts}
        />
      );
      break;

    case formQuestionTypes.dropdownWithText:
      answerNode = (
        <DropdownWithTextFormItem
          value={tryParseJSON(value, {})}
          options={options}
          onChange={onChange}
          className={classNames(
            classes.answerNodeMargin,
            classes.dropdownsAndTexts
          )}
        />
      );
      break;
  }

  return (
    <div>
      <Typography variant="body1" className={classes.questionText}>
        {isEmptyString(formItem.questionTemplate.questionText)
          ? "[No question text]"
          : formItem.questionTemplate.questionText}
      </Typography>
      {answerNode}
    </div>
  );
};

export default FormItem;

