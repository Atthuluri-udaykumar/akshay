import { QuestionTemplateConverter } from "../Pages/ReusableComponents/QuestionTable/utils";
import { apiBase, getLillyIDForAPI } from "./utils";
import { API } from "aws-amplify";
import { isArray, isObject } from "lodash";
import { FULFILLED, wrapFnAsync } from "../util_funcs/awaitPromises";

const baseURL = "subreqtemplate";
const saveQuestionURL = `${baseURL}/savesubmissionrequirementtemplate`;
const updateQuestionURL = `${baseURL}/updatesubmissionrequirementtemplate`;

async function getQuestionTemplate(templateId) {
  const params = new URLSearchParams();
  params.set("sub_id", templateId);

  const result = await API.get(
    apiBase.apiName,
    `subreqtemplate/getsubmissionrequirementtemplate?${params.toString()}`
  );

  const appData = QuestionTemplateConverter.apiDataToAppData(result.records);
  return appData;
}
async function getSingleQuestion(templateId) {
  const params = new URLSearchParams();
  params.set("sub_id", templateId);

  const result = await API.get(
    apiBase.apiName,
    `subreqtemplate/getsubmissionrequirementtemplate?${params.toString()}`
  );

  const appData = QuestionTemplateConverter.singleQuestionAPIDataToAppData(
    result.records
  );
  return appData;
}

async function isQuestionInAForm(templateId) {
  const params = new URLSearchParams();
  params.set("sub_id", templateId);

  const result = await API.get(
    apiBase.apiName,
    `subreqtemplate/isquestioninaform?${params.toString()}`
  );
    
  return result;
}

async function saveQuestionTemplate(form) {
  const params = new URLSearchParams();
  params.set("req_typ", form.questionText);
  params.set("req_question_type_id", form.questionTypeId);
  params.set("custom_allowed", form.customAllowed);
  params.set("lilly_id", getLillyIDForAPI());
  params.set("is_on_form", true);
  params.set("has_answers", false);
  params.set("tooltip", form.questionInfo);

  const fullURL = `${saveQuestionURL}?${params.toString()}`;
  const apiForm = QuestionTemplateConverter.questionAppDataToAPIData(form);

  const body = {
    body: {
      req_qstn_txt: JSON.stringify({
        data: apiForm,
      }),
    },
  };

  await API.post(apiBase.apiName, fullURL, body);
}

async function searchQuestionTemplates(questionText, form, last,limit) {
  const apiData =
    QuestionTemplateConverter.questionAppDataToSearchAPIData(form);
  const params = new URLSearchParams();
  params.set("req_typ", questionText);
  params.set("last", last);
  params.set("limit", limit);

  const path = `subreqtemplate/searchsubmissionreqtemplates?${params.toString()}`;
  const questionSearchBody = {
    body: {
      data: JSON.stringify({ data: apiData }),
    },
  };

  const result = await API.post(apiBase.apiName, path, questionSearchBody);

  if (isObject(result) && result.rowCount && isArray(result.records)) {
    const appData = result.records.map((item) =>
      QuestionTemplateConverter.apiDataToAppData(item)
    );

    return {
      size: result.rowCount,
      data: appData,
    };
  }

  return {
    size: 0,
    data: [],
  };
}

async function getAllQuestionTemplates() {
  const params = new URLSearchParams();
  params.set("allActive", false);

  let result = await API.get(
    apiBase.apiName,
    `subreqtemplate/getallsubmissionrequirementtemplates?${params.toString()}`
  );

  result = result.records || result;

  if (Array.isArray(result)) {
    const appData = result.map((item) =>
      QuestionTemplateConverter.apiDataToAppData(item)
    );

    return appData;
  }

  return [];
}

async function isDuplicateQuestion(text, questionTemplateId) {
  const params = new URLSearchParams();
  params.set("req_type", text);

  const result = await API.get(
    apiBase.apiName,
    `subreqtemplate/isduplicatequestion?${params.toString()}`
  );
  /* Check duplicate question for existing question or at the time of new Question creation */
  if (result?.records?.isDuplicate) {
    if (result?.records?.SUBMISSION_REQ_TMPLT_ID == questionTemplateId) {
      return false;
    } else {
      return true;
    }
  }
  return result?.records?.isDuplicate;
}

async function updateQuestionTemplate(form) {
  const params = new URLSearchParams();
  params.set("sub_id", form.questionTemplateId);
  params.set("req_type", form.questionText);
  params.set("req_question_type_id", form.questionTypeId);
  params.set("active", true);
  params.set("lilly_id", getLillyIDForAPI());
  params.set("is_on_form", true);
  params.set("has_answers", false);
  params.set("tooltip", form.questionInfo);

  const fullURL = `${updateQuestionURL}?${params.toString()}`;
  const apiForm = QuestionTemplateConverter.questionAppDataToAPIData(form);

  const body = {
    body: {
      req_qstn_txt: JSON.stringify({
        data: apiForm,
      }),
    },
  };

  await API.post(apiBase.apiName, fullURL, body);
}

async function getMultipleQuestionTemplates(ids) {
  const promises = ids.map((id) => {
    return wrapFnAsync(() => QuestionTemplateAPI.getQuestion(id));
  });

  const templatesResult = await Promise.all(promises);
  return templatesResult.map((item) => {
    if (item.status === FULFILLED) {
      return item.value;
    } else {
      throw new Error("Error loading form questions");
    }
  });
}

export default class QuestionTemplateAPI {
  static saveQuestion = saveQuestionTemplate;
  static getQuestion = getQuestionTemplate;
  static getSingleQuestion = getSingleQuestion;
  static searchTemplates = searchQuestionTemplates;
  static getAllQuestions = getAllQuestionTemplates;
  static updateQuestion = updateQuestionTemplate;
  static isQuestionInAForm = isQuestionInAForm;
  static isDuplicateQuestion = isDuplicateQuestion;
  static getMultipleQuestionTemplates = getMultipleQuestionTemplates;
}
