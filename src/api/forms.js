import { API } from "aws-amplify";
import { RequirementFormsConverter } from "../Pages/Components/RequirementsForm/utils";
import { publishedFormExistsResultConverter } from "../Pages/Components/RequirementsForm/newUtils";
import QuestionTemplateAPI from "./questions";
import { apiBase, getLillyIDForAPI } from "./utils";
import {ReferenceDataConverter} from '../Pages/Components/ReferenceData/utils';
import { isObject, isArray, uniq, compact } from "lodash";
const baseURL = "submissionform";
const saveFormURL = `${baseURL}/savesubmissionform`;
const formExistsURL = `${baseURL}/searchformnames`;
const publishNewFormURL = `publishform/publishnewform`;
const publishExistingFormURL = `publishform/publishexistingform`;

// Requirement forms API
export function cleanForms(forms) {
  // removes forms without submission types
  return forms.filter((form) => {
    if (!form.submissionType) {
      return false;
    }

    return true;
  });
}

export function uniqueForms(forms) {
  // filter out forms with the same names
  const existingFormNames = {};

  // sort the forms to ensure a consistent result
  forms.sort((form1, form2) => {
    return form1.formId - form2.formId;
  });

  forms = forms.filter((form) => {
    if (!existingFormNames[form.formName]) {
      existingFormNames[form.formName] = form;
      return true;
    }

    return false;
  });

  // TODO: set duplicate forms as inactive

  return forms;
}

async function getShortRequirementForms(page) {
  const params = new URLSearchParams();
  params.set("currentpage", page);
  const apiData = await API.get(
    apiBase.apiName,
    `submissionform/getallsubmissionformsshort?${params.toString()}`
  );

  let forms = RequirementFormsConverter.mapShortListToAppData(apiData.records);

  // filter out forms with the same names
  forms = cleanForms(forms);
  forms = uniqueForms(forms);

  return { size: apiData.rowCount, data: forms };
}

async function getFormOnly(formId, isCurrent = true, activeQuestions = true) {
  const params = new URLSearchParams();
  params.set("sub_form_id", formId);
  params.set("is_current", isCurrent);
  params.set("active_questions", activeQuestions);

  const apiData = await API.get(
    apiBase.apiName,
    `submissionform/getsubmissionform?${params.toString()}`
  );

  const form = RequirementFormsConverter.toAppData(apiData);
  return form;
}

async function getSingleRequirementForm(
  formId,
  isCurrent = true,
  activeQuestions = true
) {
  const form = await getFormOnly(formId, isCurrent, activeQuestions);
  const questionIds = form.questions.map((item) => item.questionTemplateId);
  const templatesResult =
    await QuestionTemplateAPI.getMultipleQuestionTemplates(questionIds);

  templatesResult.forEach((item, index) => {
    if (form.questions[index]) {
      form.questions[index].questionTemplate = item;
    }
  });

  return form;
}

async function getMultipleRequirementForms(
  formIds,
  isCurrent = true,
  activeQuestions = true
) {
  const forms = await Promise.all(
    formIds.map((formId) => getFormOnly(formId, isCurrent, activeQuestions))
  );

  let questionIds = forms.reduce((ids, form) => {
    return ids.concat(form.questions.map((item) => item.questionTemplateId));
  }, []);

  questionIds = uniq(questionIds);
  let questions = await QuestionTemplateAPI.getMultipleQuestionTemplates(
    questionIds
  );

  questions = compact(questions);
  const questionsMap = questions.reduce((map, question) => {
    map[question.questionTemplateId] = question;
    return map;
  }, {});

  forms.forEach((form) => {
    form.questions.forEach((item) => {
      item.questionTemplate = questionsMap[item.questionTemplateId];
    });
  });

  return forms;
}

async function addRequirementForm(form) {
  const converted = RequirementFormsConverter.toAPIData(form);
  const params = new URLSearchParams();
  params.set("lilly_id", getLillyIDForAPI());

  const url = `${saveFormURL}?${params.toString()}`;

  await API.post(apiBase.apiName, url, {
    body: {
      formdata: JSON.stringify(converted),
    },
  });
}

async function searchRequirementForms(form, page) {
  const { submissionTypeId, formName } = form;
  const converted = RequirementFormsConverter.toSearchAPIData(form);
  const params = new URLSearchParams();

  params.set("sub_typ_id", submissionTypeId || 0);
  params.set("sub_req_forms_nm", formName || "");
  params.set("currentpage", page);
  params.set("is_current", true);

  const apiData = await API.post(
    apiBase.apiName,
    `submissionform/searchsubmissionforms?${params.toString()}`,
    {
      body: {
        formdata: JSON.stringify(converted),
      },
    }
  );

  if (isObject(apiData) && apiData.rowCount && isArray(apiData.records)) {
    let forms = apiData.records.map((item) =>
      RequirementFormsConverter.shortToAppData(item.records)
    );

    // filter out forms with the same names
    forms = uniqueForms(forms);
    forms = cleanForms(forms);

    return {
      data: forms,
      size: apiData.rowCount,
    };
  }

  return {
    size: 0,
    data: [],
  };
}

async function formExists(submissionTypeId, productTypeId, dossierTypeId) {
  const params = new URLSearchParams();
  params.set("sub_typ_id", submissionTypeId || 0);
  params.set("product_type", productTypeId || 0);
  params.set("dossier_lst_id", dossierTypeId || 0);

  const apiData = await API.get(
    apiBase.apiName,
    `${formExistsURL}?${params.toString()}`
  );

  return publishedFormExistsResultConverter(apiData);
}

async function publishNewForm(form) {
  const converted = RequirementFormsConverter.toAPIData(form, true);
  const params = new URLSearchParams();
  params.set("lilly_id", getLillyIDForAPI());
  params.set("drft_form_id", form.formId);
  const url = `${publishNewFormURL}?${params.toString()}`;

  return await API.post(apiBase.apiName, url, {
    body: {
      formdata: JSON.stringify(converted),
    },
  });
}

async function publishExistingForm(form) {
  const converted = RequirementFormsConverter.toAPIData(form, true);
  const params = new URLSearchParams();
  params.set("lilly_id", getLillyIDForAPI());
  params.set("drft_form_id", form.formId);
  const url = `${publishExistingFormURL}?${params.toString()}`;

  return await API.post(apiBase.apiName, url, {
    body: {
      formdata: JSON.stringify(converted),
    },
  });
}

async function getFinalizedFormsForCountry(country_id) {
  const params = new URLSearchParams();
  params.set("country_id", country_id);
  const path = "answerdata/finalizedformsforcountry";
  const forms = await API.get(apiBase.apiName, `${path}?${params.toString()}`);
  const apiData = ReferenceDataConverter.finalizedFormAPIDataToAppData(forms.records);
  return apiData;
}

export default class RequirementFormsAPI {
  static addForm = addRequirementForm;
  static getForm = getSingleRequirementForm;
  static getShortForms = getShortRequirementForms;
  static searchForms = searchRequirementForms;
  static getMultipleRequirementForms = getMultipleRequirementForms;
  static formExists = formExists;
  static publishNewForm = publishNewForm;
  static publishExistingForm = publishExistingForm;
  static getFinalizedFormsForCountry = getFinalizedFormsForCountry;
}
