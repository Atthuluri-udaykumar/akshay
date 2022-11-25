import React from "react";
import { Typography } from "@mui/material";
// import AnswerFormOne from "./AnswerFormOne";
import AnswerFormTwo from "./AnswerFormTwo";
import AnswerFormLogic from "./AnswerFormLogic";
import { IForm, QuestionsAnswersMap } from "./types";

export interface FormPreviewProps {
  form: IForm;
  type: string;
  onClose: (form: IForm) => void;
}

const FormPreview = (props) => {
  const { form, type, onClose } = props;

  if (type === "preview_one") {
    return (
      <AnswerFormLogic
        form={form}
        onSubmit={onClose}
        onFinalize={onClose}
        onCancel={onClose}
      />
    );
  } else if (type === "preview_two") {
    return <AnswerFormTwo form={form} onSubmit={onClose} />;
  }

  return <Typography>Please select a preview type</Typography>;
};

export default FormPreview;
