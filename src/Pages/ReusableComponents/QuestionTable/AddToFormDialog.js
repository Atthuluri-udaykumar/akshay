import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { flattenDeep } from "lodash";
import { devLogError, getPlural } from "../../../util_funcs/reusables";
import {
  getRequirementFormName,
  indexFormsByName,
  searchFormByMetadataIds,
} from "../../Components/RequirementsForm/utils";
import { useSnackbar } from "notistack";
import LoadStateAndError from "../LoadStateAndError";
import RequirementFormsAPI from "../../../api/forms";
import DraftFormsAPI from "../../../api/draft";
import { indexQuestionsById } from "./utils";
import { REJECTED } from "../../../util_funcs/awaitPromises";
import { useNavigate } from "react-router";
import AddToForm from "./AddToForm";

/**
 * - check if form exists
 *   - draft forms
 *   - published forms
 * - if it's in draft forms, get the draft form id to update the form with
 * - if it's in published forms, we'd create a new draft form from the questions
 *    and the existing form
 * - otherwise, create a new draft form (completely new)
 */

const useStyles = makeStyles(() => {
  return {
    dialogContent: { padding: "0px" },
    initializing: {
      padding: "0px 24px 16px 24px",
    },
  };
});

const GENERAL_SUBMISSION_TYPE = "general";
const MISSING_SUBMISSION_TYPE = "Missing submission type";

async function getExistingForms(inputForms) {
  const existingPublishedFormsId = await Promise.all(
    inputForms.map((item) => {
      return RequirementFormsAPI.formExists(
        item.submissionType?.optionId,
        item.productType?.optionId,
        item.dossierType?.optionId
      );
    })
  );

  const existingDraftFormsId = await Promise.all(
    inputForms.map((item) => {
      return DraftFormsAPI.formExists(
        item.submissionType?.optionId,
        item.productType?.optionId,
        item.dossierType?.optionId
      );
    })
  );

  const fetchedExistingPublishedForms =
    await RequirementFormsAPI.getMultipleRequirementForms(
      flattenDeep(existingPublishedFormsId)
    );

  const fetchedExistingDraftForms =
    await DraftFormsAPI.getMultipleRequirementForms(
      flattenDeep(existingDraftFormsId)
    );

  const newInputForms = inputForms.map((inputForm) => {
    const publishedForm = searchFormByMetadataIds(
      fetchedExistingPublishedForms,
      {
        submissionTypeId: inputForm.submissionType?.optionId,
        productTypeId: inputForm.productType?.optionId,
        dossierTypeId: inputForm.dossierType?.optionId,
      }
    );

    const draftForm = searchFormByMetadataIds(fetchedExistingDraftForms, {
      submissionTypeId: inputForm.submissionType?.optionId,
      productTypeId: inputForm.productType?.optionId,
      dossierTypeId: inputForm.dossierType?.optionId,
    });

    if (draftForm) {
      inputForm = {
        ...inputForm,
        draftForm,
        formId: draftForm.formId,
        formExists: true,
      };
    }

    if (publishedForm) {
      inputForm = {
        ...inputForm,
        publishedForm,
        publishedFormId: publishedForm.formId,
      };
    }

    return inputForm;
  });

  return {
    fetchedExistingPublishedForms,
    fetchedExistingDraftForms,
    inputForms: newInputForms,
  };
}

// Marks existing questions in-place
function markExistingQuestions(inputForms) {
  const newInputForms = inputForms.map((inputForm) => {
    const existingDraftForm = inputForm.draftForm;
    const existingPublishedForm = inputForm.publishedForm;

    if (existingDraftForm) {
      const newInputForm = { ...inputForm };
      const questionsMap = indexQuestionsById(existingDraftForm.questions);
      newInputForm.questions = newInputForm.questions.map((questionItem) => {
        const questionExists =
          !!questionsMap[questionItem.question.questionTemplateId];

        return { ...questionItem, questionExists };
      });
      return newInputForm;
    }

    if (existingPublishedForm) {
      const newInputForm = { ...inputForm };
      const questionsMap = indexQuestionsById(existingPublishedForm.questions);
      newInputForm.questions = newInputForm.questions.map((questionItem) => {
        const questionExists =
          !!questionsMap[questionItem.question.questionTemplateId];

        return { ...questionItem, questionExists };
      });

      return newInputForm;
    }

    return inputForm;
  });

  return newInputForms;
}

// Produces forms from questions by this logic:
// - Add to "General Requirements" - if question has general submission type
// - Submission type - Product type [- Dossier type]
function produceForms(questions) {
  const goodFormsMap = {};
  const invalidQuestions = [];

  questions.forEach((question) => {
    let submissionTypes = question.submissionTypes || [];
    const productTypes = question.productTypes || [];
    const dossierTypes = question.dossierTypes || [];
    const generalSubmissionTypeItem = submissionTypes.find(
      //finding all the forms with general submission type
      (item) => item.optionText.toLowerCase() === GENERAL_SUBMISSION_TYPE
    );

    submissionTypes = submissionTypes.filter(
      //removing all the forms with general submission type from submission types
      (item) => item.optionText.toLowerCase() !== GENERAL_SUBMISSION_TYPE
    );
    if (submissionTypes.length > 0) {
      produceFormsFromSubmissionTypes(
        // adding all the submission types except general
        question,
        submissionTypes,
        productTypes,
        dossierTypes
      );
    }

    if (generalSubmissionTypeItem) {
      //now adding general submission type to forms
      addToGeneralRequirementForm(question, generalSubmissionTypeItem);
    }
  });

  function addToInvalidQuestions(question, issue) {
    invalidQuestions.push({ question, issue });
  }

  function addToGeneralRequirementForm(question, generalSubmissionTypeItem) {
    const formName = "General Requirements";
    const form = goodFormsMap[formName] || {
      formName: formName,
      submissionType: generalSubmissionTypeItem,
      general: true,
      isActive: false,
      questions: [],
    };

    form.questions.push({ question, isActive: true, questionExists: false });
    goodFormsMap[formName] = form;
  }

  function addToGoodForms(
    formName,
    question,
    submissionTypeItem,
    productTypeItem,
    dossierTypeItem
  ) {
    const form = goodFormsMap[formName] || {
      formName,
      submissionType: submissionTypeItem,
      productType: productTypeItem,
      dossierType: dossierTypeItem,
      isActive: false,
      questions: [],
    };

    form.questions.push({ question, isActive: true, questionExists: false });
    goodFormsMap[formName] = form;
  }

  function produceFormsFromDossierTypes(
    question,
    submissionTypeItem,
    productTypeItem,
    dossierTypes
  ) {
    dossierTypes.forEach((dossierTypeItem) => {
      if (!dossierTypeItem.optionText) {
        return;
      }

      const formName = getRequirementFormName(
        submissionTypeItem.optionText,
        productTypeItem.optionText,
        dossierTypeItem.optionText
      );

      addToGoodForms(
        formName,
        question,
        submissionTypeItem,
        productTypeItem,
        dossierTypeItem
      );
    });
  }

  function produceFormsFromProductTypes(
    question,
    submissionTypeItem,
    productTypes,
    dossierTypes
  ) {
    productTypes.forEach((productTypeItem) => {
      if (!productTypeItem.optionText) {
        return;
      }

      const formName = getRequirementFormName(
        submissionTypeItem.optionText,
        productTypeItem.optionText
      );

      addToGoodForms(formName, question, submissionTypeItem, productTypeItem);
      produceFormsFromDossierTypes(
        question,
        submissionTypeItem,
        productTypeItem,
        dossierTypes
      );
    });
  }

  function produceFormsFromSubmissionTypes(
    question,
    submissionTypes,
    productTypes,
    dossierTypes
  ) {
    submissionTypes.forEach((submissionTypeItem, i) => {
      if (!submissionTypeItem.optionText) {
        addToInvalidQuestions(question, MISSING_SUBMISSION_TYPE);
        return;
      }

      const formName = getRequirementFormName(submissionTypeItem.optionText);
      addToGoodForms(formName, question, submissionTypeItem);
      produceFormsFromProductTypes(
        question,
        submissionTypeItem,
        productTypes,
        dossierTypes
      );
    });
  }

  return { goodFormsMap, invalidQuestions };
}

const AddToFormDialog = (props) => {
  const { open, questions, handleClose, handleSave } = props;
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [forms, setForms] = React.useState({});
  const [invalidQuestions, setInvalidQuestions] = React.useState([]);

  const [isSubmitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState();
  const [isInitialized, setInitialized] = React.useState(false);

  const navigate = useNavigate();

  /**
   *  initialize the creation of a new form from either questions
   */
  const initFunction = React.useCallback(async () => {
    setInitialized(false);

    const { goodFormsMap, invalidQuestions } = produceForms(questions);
    let goodFormsList = Object.values(goodFormsMap);
    const data = await getExistingForms(goodFormsList);
    goodFormsList = markExistingQuestions(data.inputForms);
    setForms(indexFormsByName(goodFormsList, false));
    setInvalidQuestions(invalidQuestions);
    setInitialized(true);
  }, [questions]);

  React.useEffect(() => {
    initFunction();
  }, [initFunction]);

  const toggleQuestionInForm = React.useCallback(
    (form, questionIndex, checked) => {
      const { question } = form.questions[questionIndex];
      const newQuestionData = { question, isActive: checked };
      const newQuestions = [...form.questions];
      const newForm = { ...form };
      const newForms = { ...forms };

      newQuestions[questionIndex] = newQuestionData;
      newForm.questions = newQuestions;
      newForms[form.formName] = newForm;
      setForms(newForms);
    },
    [forms]
  );

  const toggleForm = React.useCallback(
    (form, checked) => {
      const newForm = { ...form, isActive: checked };
      const newForms = { ...forms, [newForm.formName]: newForm };
      setForms(newForms);
    },
    [forms]
  );

  const internalOnSubmit = React.useCallback(async () => {
    try {
      let submittedFormsList = Object.values(forms);

      if (submittedFormsList.length === 0) {
        return;
      }

      setSubmitting(true);
      const data = await getExistingForms(submittedFormsList);
      submittedFormsList = markExistingQuestions(data.inputForms);
      setForms(indexFormsByName(submittedFormsList, false));
      const result = await handleSave(
        submittedFormsList,
        data.fetchedExistingDraftForms,
        data.fetchedExistingPublishedForms
      );

      if (result) {
        const failed = [];
        const succeeded = [];

        result.forEach((item) => {
          if (item.status === REJECTED) {
            failed.push(item);
          } else {
            succeeded.push(item);
          }
        });

        if (succeeded.length > 0) {
          enqueueSnackbar(
            `${succeeded.length} ${getPlural(
              "form",
              succeeded.length
            )} saved successfully`,
            { variant: "success" }
          );

          // if success redirect to requirements form page
          navigate(`/forms?isDraft=true`);
        }

        if (failed.length > 0) {
          enqueueSnackbar(
            `Failed to save ${failed.length} ${getPlural(
              "form",
              failed.length
            )}`,
            {
              variant: "error",
            }
          );

          failed.forEach((item) =>
            devLogError(item.extra?.formName, item.reason)
          );

          throw new Error("Error saving some changes");
        }
      }

      setSubmitting(false);
      handleClose();
    } catch (error) {
      devLogError(error);
      const errorMessage = error?.message || "Error saving changes";
      setError(errorMessage);
      setSubmitting(false);
    }
  }, [forms, handleSave]);

  const internalOnClose = () => {
    if (!isSubmitting) {
      handleClose();
    }
  };

  const formsList = Object.values(forms);
  const hasValidForms = formsList.length > 0;

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={internalOnClose}>
      <DialogTitle>Requirement Forms</DialogTitle>
      <DialogContent className={classes.dialogContent}>
        {(!isInitialized || error) && (
          <div className={classes.initializing}>
            <LoadStateAndError
              loading={!isInitialized}
              loadingMessage="Initializing..."
              error={error}
            />
          </div>
        )}
        {isInitialized && (
          <AddToForm
            forms={formsList}
            invalidQuestions={invalidQuestions}
            toggleForm={toggleForm}
            toggleQuestionInForm={toggleQuestionInForm}
            disabled={isSubmitting}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={internalOnClose}
          color="primary"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          color="primary"
          disabled={isSubmitting || !hasValidForms}
          onClick={internalOnSubmit}
        >
          {isSubmitting ? "Submitting" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddToFormDialog;
