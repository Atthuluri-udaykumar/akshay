import React, { useEffect, useState } from "react";
import { Paper, Typography } from "@mui/material";
import TextInput from "../../ReusableComponents/form/TextInput";
import ReferenceDataAPI from "../../../api/referenceData";
import { ReferenceDataConverter } from "../ReferenceData/utils";
import { getActiveReferenceData } from "../../ReusableComponents/ReferenceDataComponent/utils";
import { IOption } from "../../../global/types";
import {
  defaultQuestionOptions,
  defaultSelectedQuestionOptions,
  IQuestionControlOptions,
  IQuestionSelectedControlOptions,
} from "../RequirementsForm/types";
import MultiSelectDropdown from "../../ReusableComponents/form/MultiSelectDropdown";
import ButtonInput from "../../ReusableComponents/form/ButtonInput";
import LoadStateAndError from "../../ReusableComponents/LoadStateAndError";
import SingleSelectDropdown from "../../ReusableComponents/form/SingleSelectDropdown";
import { isArray } from "lodash";
import { isQuestionWithOption } from "../RequirementsForm/utils";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import useConfirmationPrompt from "../../hooks/useConfirmationPrompt";
import QuestionTemplateAPI from "../../../api/questions";
import { useSnackbar } from "notistack";

export const defaultErrorMessages = {
  questionText: { toggle: false, message: "" },
  questionInfo: { toggle: false, message: "" },
  questionType: { toggle: false, message: "" },
  numOfAnswers: { toggle: false, message: "" },
  submissionTypes: { toggle: false, message: "" },
  productTypes: { toggle: false, message: "" },
  dossierTypes: { toggle: false, message: "" },
  generalRequirementCategories: { toggle: false, message: "" },
  requirementCategories: { toggle: false, message: "" },
  options: [] as any,
};

export const QuestionTemplate = (props) => {
  const { questionTemplateId } = useParams();
  const location = useLocation();
  const [options, setOptions] = useState<IQuestionControlOptions>(
    defaultQuestionOptions
  );
  const [selectedOptions, setSelectedOptions] =
    useState<IQuestionSelectedControlOptions>(defaultSelectedQuestionOptions);
  const [fixedSelectedOptions, setFixedSelectedOptions] =
    useState<IQuestionSelectedControlOptions>(defaultSelectedQuestionOptions);
  const [loading, setLoading] = useState(false);
  const [buttonLoader, setButtonLoader] = useState(false);
  const [error, setError] = useState<any>(null);
  const [errorMessages, setErrorMessages] = useState(defaultErrorMessages);
  const [numberOfOption, setNumberOfOptions] = useState(0);
  const navigate = useNavigate();
  const { confirm } = useConfirmationPrompt();
  const { enqueueSnackbar } = useSnackbar();

  // Load meta
  const getData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [
        dossierList,
        productTypeList,
        submissionTypeList,
        reqCategoryList,
        genReqCategoryList,
        questionTypeList,
      ] = await Promise.all([
        ReferenceDataAPI.getDossierNodes(),
        ReferenceDataAPI.getRefferenceData(
          ReferenceDataAPI.paths.productType.read,
          ReferenceDataConverter.fields.productType.id,
          ReferenceDataConverter.fields.productType.name
        ),
        ReferenceDataAPI.getRefferenceData(
          ReferenceDataAPI.paths.submissionType.read,
          ReferenceDataConverter.fields.submissionType.id,
          ReferenceDataConverter.fields.submissionType.name
        ),
        ReferenceDataAPI.getRefferenceData(
          ReferenceDataAPI.paths.reqCategory.read,
          ReferenceDataConverter.fields.reqCategory.id,
          ReferenceDataConverter.fields.reqCategory.name
        ),
        ReferenceDataAPI.getRefferenceData(
          ReferenceDataAPI.paths.genReqCategory.read,
          ReferenceDataConverter.fields.genReqCategory.id,
          ReferenceDataConverter.fields.genReqCategory.name
        ),
        ReferenceDataAPI.getQuestionTypes(),
      ]);
      setOptions({
        ...options,
        dossierList: getActiveReferenceData(dossierList),
        productTypeList: getActiveReferenceData(productTypeList),
        submissionTypeList: getActiveReferenceData(submissionTypeList),
        reqCategoryList: getActiveReferenceData(reqCategoryList),
        genReqCategoryList: getActiveReferenceData(genReqCategoryList),
        questionTypeList: getActiveReferenceData(questionTypeList),
      });
      const questionResult = questionTemplateId
        ? await QuestionTemplateAPI.getSingleQuestion(questionTemplateId)
        : undefined;
      if (questionResult) {
        console.log({questionResult});
        
        setSelectedOptions(questionResult as any);
        setFixedSelectedOptions(questionResult as any);
        setNumberOfOptions(
          questionResult.options.length ? questionResult.options.length : 0
        );
      }
    } catch (err: any) {
      setLoading(false);
      setError(err);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    getData();
  }, [getData]);

  /* this useEffect is used when user is on question edit page and 
     user click directly on Question Builder option from sidebar component
  */
  useEffect(() => {
    if (location.pathname == '/questionbuilder') {
      setSelectedOptions(defaultSelectedQuestionOptions);
      setNumberOfOptions(0);
    }
  }, [location]);

  const setFormOptions = async (value, inputType) => {
    setSelectedOptions({
      ...selectedOptions,
      [inputType]: value,
    });

    /* handling the questionType input for options */
    if (inputType == "questionType") {
      if (!isQuestionWithOption(value)) {
        setSelectedOptions((prev) => {
          return {
            ...prev,
            options: [],
          };
        });
        setNumberOfOptions(0);
      }
    }
  };

  const setOptionsForQuestionType = (value) => {
    setNumberOfOptions(Number(value));
    if (!value || value == 0) {
      setSelectedOptions({
        ...selectedOptions,
        options: [],
      });
    }
    if (value && value != 0) {
      if (value < selectedOptions.options.length) {
        selectedOptions.options.pop();
      } else {
        setSelectedOptions({
          ...selectedOptions,
          options: [
            ...selectedOptions.options,
            {
              isActive: true,
              optionId: 0,
              optionText: "",
              questionTemplateId: 0,
            },
          ],
        });
      }
    }
  };

  const setTextValueForOption = (text, index) => {
    let arr: any = selectedOptions.options;
    arr[index].optionText = text;
    setSelectedOptions({
      ...selectedOptions,
      options: arr,
    });
  };

  const hasGeneralRequirement = (submissionTypes, nameField = "optionText") => {
    return !!submissionTypes.find(
      (option) => option[nameField]?.toLowerCase() === "general"
    );
  };

  const clearForm = async () => {
    setSelectedOptions({
      ...selectedOptions,
      questionTemplateId: 0,
      questionText: "",
      questionInfo:"",
      questionType: null as any,
      options: [],
      requirementCategories: [],
      generalRequirementCategories: [],
    });
  };

  const hasGenReq = hasGeneralRequirement(selectedOptions.submissionTypes);
  const hasOtherSubmissionTypes = hasGenReq
    ? selectedOptions.submissionTypes.length > 1
    : selectedOptions.submissionTypes.length > 0; //set's submission type in question builder to General or other

  const validateInputs = () => {
    let check = true;
    setErrorMessages(defaultErrorMessages);
    Object.keys(selectedOptions).map((key) => {
      if (selectedOptions[key] == null && key == "questionText") {
        check = false;
        setErrorMessages((prev) => {
          return {
            ...prev,
            questionText: {
              toggle: true,
              message: "Question text is required",
            },
          };
        });
      }
      if (
        typeof selectedOptions[key] == "string" &&
        key == "questionText" &&
        !selectedOptions[key]
      ) {
        check = false;
        setErrorMessages((prev) => {
          return {
            ...prev,
            questionText: {
              toggle: true,
              message: "Question text is required",
            },
          };
        });
      }
      if (
        typeof selectedOptions[key] == "object" &&
        key == "questionType" &&
        !selectedOptions[key].optionText
      ) {
        check = false;
        setErrorMessages((prev) => {
          return {
            ...prev,
            questionType: {
              toggle: true,
              message: "Question Type is required",
            },
          };
        });
      }
      if (
        isArray(selectedOptions[key]) &&
        key == "submissionTypes" &&
        !selectedOptions[key].length
      ) {
        check = false;
        setErrorMessages((prev) => {
          return {
            ...prev,
            submissionTypes: {
              toggle: true,
              message: "Submission type is required",
            },
          };
        });
      }
      if (
        key == "options" &&
        isQuestionWithOption(selectedOptions.questionType?.optionText) &&
        !selectedOptions[key]?.length
      ) {
        check = false;
        setErrorMessages((prev) => {
          return {
            ...prev,
            numOfAnswers: {
              toggle: true,
              message: "Number of options is required",
            },
          };
        });
      }
      if (
        typeof selectedOptions[key] == "object" &&
        key == "questionType" &&
        selectedOptions[key].optionText == "List of values - radio buttons" &&
        numberOfOption != 2
      ) {
        check = false;
        setErrorMessages((prev) => {
          return {
            ...prev,
            numOfAnswers: {
              toggle: true,
              message: "Number of options should be equal to 2",
            },
          };
        });
      }
      if (
        key == "options" &&
        isQuestionWithOption(selectedOptions.questionType?.optionText) &&
        selectedOptions[key]?.length
      ) {
        let options: any[] = errorMessages.options;
        for (let i = 0; i < selectedOptions[key].length; i++) {
          if (!selectedOptions[key][i]?.optionText) {
            let index = i + 1;
            options[i] = { toggle: false, message: "" };
            options[i] = {
              toggle: true,
              message: "Option " + index + " is required",
            };
            check = false;
            setErrorMessages((prev) => {
              return {
                ...prev,
                options: options,
              };
            });
          }
        }
      }
    });
    return check;
  };

  /* convert the payload to send to API endpoint */
  const convertPayload = () => {
    let payload = {
      questionTypeId: selectedOptions.questionType.optionId,
      questionText: selectedOptions.questionText,
      questionInfo: selectedOptions.questionInfo,
      questionTemplateId: questionTemplateId ? questionTemplateId : 0,
      options: selectedOptions.options,
      productTypes: selectedOptions.productTypes,
      submissionTypes: selectedOptions.submissionTypes,
      requirementCategories: selectedOptions.requirementCategories,
      dossierTypes: selectedOptions.dossierTypes,
      generalRequirementCategories:
        selectedOptions.generalRequirementCategories,
    };
    return payload;
  };
  const save = async () => {
    /* validate the inputs */
    const check = validateInputs();
    if (!check) {
      return;
    }
    try {
      setButtonLoader(true);
      const payload = convertPayload();
      const isDuplicate = await QuestionTemplateAPI.isDuplicateQuestion(
        payload.questionText,
        questionTemplateId
      );
      if (isDuplicate) {
        setErrorMessages({
          ...errorMessages,
          questionText: { toggle: true, message: "Duplicate question found" },
        });
        setButtonLoader(false);
        return;
      }
      /* edit question */
      if (questionTemplateId) {

        // Check if Question is Used in Form
        const isQuestionOnForm = await QuestionTemplateAPI.isQuestionInAForm(questionTemplateId);
        if (isQuestionOnForm) {
          const response = await confirm(
            `This question is part of an existing form, do you wish to continue with this edit?`,
            "alert"
          );
          if (response) {
            const result = await QuestionTemplateAPI.updateQuestion(payload);
            enqueueSnackbar("Question template has been edited", {
              variant: "success",
            });
            setButtonLoader(false);
            navigate(`/questionsearch`);
            return;
          } else {
            setButtonLoader(false);
            return
          }
        }

      }
      /* end edit question */

      /* save new question */
      const result = await QuestionTemplateAPI.saveQuestion(payload);
      enqueueSnackbar("Question template saved", {
        variant: "success",
      });
      setButtonLoader(false);
      const isConfirmed = await confirm(
        `Do you want to create a new question?`,
        "alert",
        "New Question Template"
      ); //message and dialogType needs to pass, title can be optional

      if (isConfirmed) {
        clearForm();
        return;
      }
      navigate(`/questionsearch`);
    } catch (err: any) {
      setError(err);
      setButtonLoader(false);
      enqueueSnackbar(err?.message || "Error saving question template", {
        variant: "error",
      });
    }
  };

  const cancel = async () => {
    navigate(`/questionsearch`);
  }

  if (loading || error) {
    return (
      <div style={{ marginTop: 30 }}>
        <LoadStateAndError
          loading={loading}
          loadingMessage="Loading options..."
          error={error?.message}
          reloadFunc={getData}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 30,
      }}
    >
      <Paper
        sx={{
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
          width: 400,
        }}
      >
        <Typography
          component="h2"
          variant="inherit"
          sx={{
            color: "#1e96f2",
            marginTop: 1,
            marginBottom: 2,
            textAlign: "center",
          }}
        >
          Question {questionTemplateId ? 'Edit' : 'Builder'}
        </Typography>

        {/* Question Text */}
        <TextInput
          label="Question Text"
          placeholder="Question Text"
          required={true}
          value={selectedOptions.questionText}
          onChange={(value) => {
            setFormOptions(value, "questionText");
            if (
              selectedOptions.questionType?.optionText ==
              "List of values - radio buttons"
            ) {
            }
            setErrorMessages((prev) => {
              return {
                ...prev,
                questionText: {
                  toggle: value ? false : true,
                  message: value ? "" : "Question text is required",
                },
              };
            });
          }}
          error={errorMessages.questionText.toggle}
          helperText={errorMessages.questionText.message}
        />

        {/* Question Info */}
        <TextInput
          label="Question Info"
          placeholder="Question Info"
          required={true}
          value={selectedOptions.questionInfo}
          onChange={(value) => {
            setFormOptions(value, "questionInfo");
            if (
              selectedOptions.questionType?.optionText ==
              "List of values - radio buttons"
            ) {
            }
            setErrorMessages((prev) => {
              return {
                ...prev,
                questionInfo: {
                  toggle: value ? false : true,
                  message: value ? "" : "Question info is required",
                },
              };
            });
          }}
          error={errorMessages.questionInfo.toggle}
          helperText={errorMessages.questionInfo.message}
        />

        {/* Question Type */}
        <SingleSelectDropdown
          label="Question type"
          options={options.questionTypeList}
          value={selectedOptions.questionType as any}
          getOptionLabel={(option: IOption) => option.optionText}
          isOptionEqualToValue={(option, value) =>
            option.optionId === value.optionId
          } //this function we use to suppress the warning generated by material
          onChange={(value) => {
            setFormOptions(value, "questionType");
            setErrorMessages((prev) => {
              return {
                ...prev,
                questionType: {
                  toggle: value?.optionText ? false : true,
                  message: value?.optionText ? "" : "Question type is required",
                },
              };
            });
          }}
          error={errorMessages.questionType.toggle}
          helperText={errorMessages.questionType.message}
          required={true}
        />

        {/* Number of answers */}
        {isQuestionWithOption(
          selectedOptions.questionType &&
            selectedOptions.questionType.optionText
            ? selectedOptions.questionType.optionText
            : ""
        ) && (
            <TextInput
              label="Number of answers"
              placeholder="Numeric value"
              required={true}
              type="number"
              value={numberOfOption}
              onChange={(value) => {
                setOptionsForQuestionType(value);
                setErrorMessages((prev) => {
                  return {
                    ...prev,
                    numOfAnswers: { toggle: false, message: "" },
                    options: [],
                  };
                });
                if (value == 0) {
                  setErrorMessages((prev) => {
                    return {
                      ...prev,
                      numOfAnswers: {
                        toggle: true,
                        message:
                          "Number of options should be greater than or equal to 1",
                      },
                    };
                  });
                }
                if (
                  selectedOptions.questionType?.optionText ==
                  "List of values - radio buttons" &&
                  value != 2
                ) {
                  setErrorMessages((prev) => {
                    return {
                      ...prev,
                      numOfAnswers: {
                        toggle: true,
                        message: "Number of options should be equal to 2",
                      },
                    };
                  });
                }
              }}
              error={errorMessages.numOfAnswers.toggle}
              helperText={errorMessages.numOfAnswers.message}
              min={0}
              max={15}
              onKeyDownDisable={true}
            />
          )}
        {selectedOptions.options.map((option, index) => {
          let i = index + 1;
          return (
            <TextInput
              key={index}
              placeholder={"option" + i}
              value={selectedOptions.options[index]?.optionText}
              required={true}
              onChange={(value) => {
                setTextValueForOption(value, index);
                let items = [...errorMessages.options];
                let item = { ...items[index] };
                item = {
                  toggle: value ? false : true,
                  message: value ? "" : "Option" + i + " is required",
                };
                items[index] = item;
                setErrorMessages((prev) => {
                  return {
                    ...prev,
                    options: items,
                  };
                });
              }}
              error={errorMessages.options[index]?.toggle}
              helperText={errorMessages.options[index]?.message}
            />
          );
        })}

        {/* SubmissionTypeList */}
        <MultiSelectDropdown
          label="Submission type"
          options={options.submissionTypeList}
          fixedSelectedOptions={fixedSelectedOptions.submissionTypes}
          value={selectedOptions.submissionTypes}
          disableClearable={true}
          getOptionLabel={(option: IOption) => option.optionText}
          isOptionEqualToValue={(option, value) =>
            option.optionId === value.optionId
          } //this function we use to suppress the warning generated by material
          onChange={(value) => {
            if (!hasGeneralRequirement(value)) {
              setSelectedOptions({
                ...selectedOptions,
                ["generalRequirementCategories"]: [],
              });
            }
            setFormOptions(value, "submissionTypes");
            setErrorMessages((prev) => {
              return {
                ...prev,
                submissionTypes: {
                  toggle: value && value.length ? false : true,
                  message:
                    value && value.length ? "" : "Submission type is required",
                },
              };
            });
          }}
          error={errorMessages.submissionTypes.toggle}
          helperText={errorMessages.submissionTypes.message}
          required={true}
        />

        {/* ProductTypeList */}
        <MultiSelectDropdown
          label="Product type"
          options={options.productTypeList}
          fixedSelectedOptions={fixedSelectedOptions.productTypes}
          value={selectedOptions.productTypes}
          disableClearable={true}
          getOptionLabel={(option: IOption) => option.optionText}
          isOptionEqualToValue={(option, value) =>
            option.optionId === value.optionId
          } //this function we use to suppress the warning generated by material
          //limitTags={1}
          onChange={(value) => setFormOptions(value, "productTypes")}
        />

        {/* DossierList */}
        <MultiSelectDropdown
          label="Dossier section"
          options={options.dossierList}
          fixedSelectedOptions={fixedSelectedOptions.dossierTypes}
          value={selectedOptions.dossierTypes}
          disableClearable={true}
          getOptionLabel={(option: IOption) => option.optionText}
          isOptionEqualToValue={(option, value) =>
            option.optionId === value.optionId
          } //this function we use to suppress the warning generated by material
          //limitTags={1}
          onChange={(value) => setFormOptions(value, "dossierTypes")}
        />

        {/* Requirement Category */}
        {hasOtherSubmissionTypes && (
          <MultiSelectDropdown
            label="Requirement category"
            options={options.reqCategoryList}
            value={selectedOptions.requirementCategories}
            getOptionLabel={(option: IOption) => option.optionText}
            isOptionEqualToValue={(option, value) =>
              option.optionId === value.optionId
            } //this function we use to suppress the warning generated by material
            //limitTags={1}
            onChange={(value) => setFormOptions(value, "requirementCategories")}
          />
        )}

        {/* General Requirement Category */}
        {hasGenReq && (
          <MultiSelectDropdown
            label="General Requirement category"
            options={options.genReqCategoryList}
            value={selectedOptions.generalRequirementCategories}
            getOptionLabel={(option: IOption) => option.optionText}
            isOptionEqualToValue={(option, value) =>
              option.optionId === value.optionId
            } //this function we use to suppress the warning generated by material
            //limitTags={1}
            onChange={(value) =>
              setFormOptions(value, "generalRequirementCategories")
            }
          />
        )}

        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* Submit button */}
          <ButtonInput
            disabled={buttonLoader}
            text="Save"
            color="primary"
            variant="contained"
            loading={buttonLoader}
            onClick={save}
          />

          {/* cancel button */}
          {questionTemplateId ? <ButtonInput
            disabled={buttonLoader}
            text="Cancel"
            color="error"
            variant="contained"
            onClick={cancel}
          /> : ''}
        </div>

      </Paper>
    </div>
  );
};
