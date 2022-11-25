import { API } from "aws-amplify";
import { RequirementFormsConverter } from "../Pages/Components/RequirementsForm/utils";
import { draftFormExistsResultConverter } from "../Pages/Components/RequirementsForm/newUtils";
import QuestionTemplateAPI from "./questions";
import { apiBase, getLillyIDForAPI } from "./utils";
import { isObject, isArray, uniq, compact } from "lodash";
import { cleanForms, uniqueForms } from "./forms";

const baseURL = "draftforms";
const saveDraftURL = `${baseURL}/savedraftform`;
const formExistsURL = `${baseURL}/searchdraftformnames`;

// a single parameter drft_form_id which is a number
const getDraftURL = `${baseURL}/getdraftform`;

// sub_typ_id = 14 & product_type=0 & dossier_lst_id=0
const searchDraftsURL = `${baseURL}/searchdraftforms`;

// Update draft form: Params drft_form_id and lilly_id
const updateDraftURL = `${baseURL}/updatedraftform`;
const getShortDraftURL = `${baseURL}/getalldraftformsshort`;
const deleteDraftFormURL = `${baseURL}/deletedraftform`;

async function getAllDraftForms(page) {
  const params = new URLSearchParams();
  params.set("currentpage", page);
  const apiData = await API.get(
    apiBase.apiName,
    `${getShortDraftURL}?${params.toString()}`
  );

  let forms = RequirementFormsConverter.mapShortListToAppData(
    apiData.records,
    true
  );

  // filter out forms with the same names
  forms = cleanForms(forms);
  forms = uniqueForms(forms);

  return { size: apiData.rowCount, data: forms };
}

async function searchDraftForms(form, page = 1) {
  const { submissionTypeId, formName } = form;
  const converted = RequirementFormsConverter.toSearchAPIData(form, true);
  const params = new URLSearchParams();

  params.set("sub_typ_id", submissionTypeId || 0);
  params.set("sub_req_forms_nm", formName || "");
  params.set("currentpage", page);

  const apiData = await API.post(
    apiBase.apiName,
    `${searchDraftsURL}?${params.toString()}`,
    {
      body: {
        formdata: JSON.stringify(converted),
      },
    }
  );

  if (isObject(apiData) && apiData.rowCount && isArray(apiData.records)) {
    let forms = apiData.records.map((item) =>
      // TODO(gabe): update code to use drafts format when we have short drafts form format
      RequirementFormsConverter.shortToAppData(item.records, true)
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

async function saveDraftForm(form) {
  const converted = RequirementFormsConverter.toAPIData(form, true);
  const params = new URLSearchParams();
  params.set("lilly_id", getLillyIDForAPI());
  params.set("sub_req_forms_id", form.publishedFormId || 0);
  const url = `${saveDraftURL}?${params.toString()}`;

  const apiData = await API.post(apiBase.apiName, url, {
    body: {
      formdata: JSON.stringify(converted),
    },
  });

  // TODO(gabe): make sure the apiData is new the draft form
  // and convert to appForm format
  return apiData;
}

async function updateDraftForm(form) {
  const converted = RequirementFormsConverter.toAPIData(form, true);
  const params = new URLSearchParams();
  params.set("lilly_id", getLillyIDForAPI());
  params.set("drft_form_id", form.formId);

  const url = `${updateDraftURL}?${params.toString()}`;

  await API.post(apiBase.apiName, url, {
    body: {
      formdata: JSON.stringify(converted),
    },
  });
}

async function getFormOnly(formId) {
  const params = new URLSearchParams();
  params.set("drft_form_id", formId);
  const apiData = await API.get(
    apiBase.apiName,
    `${getDraftURL}?${params.toString()}`
  );

  const form = RequirementFormsConverter.toAppData(apiData, true);
  return form;
}

async function getSingleDraftForm(formId) {
  const form = await getFormOnly(formId);
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

async function getMultipleRequirementForms(formIds) {
  const forms = await Promise.all(formIds.map((formId) => getFormOnly(formId)));
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

async function draftFormExists(submissionTypeId, productTypeId, dossierTypeId) {
  const params = new URLSearchParams();
  params.set("sub_typ_id", submissionTypeId || 0);
  params.set("product_type", productTypeId || 0);
  params.set("dossier_lst_id", dossierTypeId || 0);

  const apiData = await API.get(
    apiBase.apiName,
    `${formExistsURL}?${params.toString()}`
  );

  return draftFormExistsResultConverter(apiData);
}

async function deleteDraftForm(formId) {
  const params = new URLSearchParams();
  params.set("DRFT_FORM_ID", formId);
  await API.get(apiBase.apiName, `${deleteDraftFormURL}?${params.toString()}`);
}

export default class DraftFormsAPI {
  static addForm = saveDraftForm;
  static getForm = getSingleDraftForm;
  static getShortForms = getAllDraftForms;
  static updateForm = updateDraftForm;
  static searchForms = searchDraftForms;
  static getMultipleRequirementForms = getMultipleRequirementForms;
  static formExists = draftFormExists;
  static deleteForm = deleteDraftForm;
}
