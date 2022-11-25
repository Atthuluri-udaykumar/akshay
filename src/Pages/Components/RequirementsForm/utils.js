import {
  capitalizeFirstLetter,
  decodeText,
  devLogError,
} from "../../../util_funcs/reusables";
import { trim, defaultTo } from "lodash";

/**
 * API data format
{​​​​​
  "records": [
    0: {
      "sub_req_forms_id": 0,
      "sub_typ_id": 2,
      "sub_typ_nm": "Clinical",
      "sub_req_forms_nm"?: "some name1",
      "is_active"?: true
    ​​​​}​,
    1: {
      "PRODUCT_TYPE": [
        {​​​​​
          "product_type_id": 1,
          "product_type_nm": "Device"
        }​​​​​
      ]
    },
    2: {
      "DOSSIER_REF": [
        {​​​​​
          "dossier_lst_id": 176,
          "dossier_lst_nm": "Module 1"
        }​​​​​
      ]
    },
    3: {
      "FORMS_QSTN_LST": [
        {​​​​​
          "SUBMISSION_REQ_TMPLT": {
            SUBMISSION_REQ_TMPLT: [
              ...questionTemplate  
            ] 
          },
          is_active: true,
          is_current: true,
          parent_id: null,
          qstn_logic: null, 
          sub_req_form_qstn_nmbr: 0,
          sub_req_forms_id: 43,
          sub_req_forms_qstn_lst_id: 26,
          submission_req_tmplt_id: 292
        }​​​​​
      ]
    }
  ]
}​​​​​
 */

/**
 * Local data format
{
  formId: 0,
  submissionType: 2,
  submissionTypeName?: string;
  formName: "some name1",
  isActive: true,
  productType: {optionId: 1, optionText: "" },
  dossierType: {optionId: 1, optionText: "" },
  questions: [
    {​​​​​
      formItemId: 0,
      questionTemplateId: 98,
      index: 1,
      formId: 0,
      logic: {
        [optionId: number]: [formItemIndex: number]
      },
      parentId: 0, // zero for null or root
      isActive: true
    }​​​​​,
    {​​​​​
      formItemId: 0,
      questionTemplateId: 99,
      index: 2,
      formId: 0,
      logic: [],
      parentId: 1,// based on index
      isActive: true
    }​​​​​,
  ]
}
 */

function uniqueFormItems(formItems) {
  formItems.sort((q1, q2) => {
    return q1.formItemId - q2.formItemId;
  });

  const existingQuestionIds = {};
  formItems = formItems.filter((formItem) => {
    if (!existingQuestionIds[formItem.questionTemplateId]) {
      existingQuestionIds[formItem.questionTemplateId] = true;
      return true;
    }

    return false;
  });

  return formItems;
}

const PRODUCT_TYPE_KEY = "PRODUCT_TYPE";
const DOSSIER_TYPE_KEY = "DOSSIER_REF";
const QUESTIONS_KEY = "FORMS_QSTN_LST";

/**
 * This is an async function, remember to call await on it
 * before using the data. We had to make it async cause of
 * an index mismatch bug that was discovered
 * @param {*} apiData
 * @returns
 */
function apiDataToAppData(apiData, isDraftForm) {
  const records = apiData.records || apiData;
  const productTypeList = records[PRODUCT_TYPE_KEY] || [];
  const dossierList = records[DOSSIER_TYPE_KEY] || [];

  // If you think this looks weird, it's because of John. LoL.
  const apiQuestions = (records[QUESTIONS_KEY] || {})[QUESTIONS_KEY] || [];
  const details = records;

  let productType = null;
  let dossierType = null;

  if (Array.isArray(productTypeList) && productTypeList.length > 0) {
    productType = {
      optionId: productTypeList[0].product_type_id,
      optionText: productTypeList[0].product_type_nm,
    };
  }

  if (Array.isArray(dossierList) && dossierList.length > 0) {
    dossierType = {
      optionId: dossierList[0].dossier_lst_id,
      optionText: decodeText(dossierList[0].dossier_lst_nm),
    };
  }

  const submissionTypeName = details.sub_typ_nm;
  let formName = details.sub_req_forms_nm;

  if (!formName && submissionTypeName) {
    if (submissionTypeName.toLowerCase() === "general") {
      formName = getGeneralRequirementFormName();
    } else {
      const productTypeName = productType?.optionText;
      const dossierTypeName = dossierType?.optionText;
      formName = getRequirementFormName(
        submissionTypeName,
        productTypeName,
        dossierTypeName
      );
    }
  }

  let formItems = apiQuestions.map((question) => {
    let logic = {};
    const questionTemplateId = question.submission_req_tmplt_id;

    if (question.qstn_logic) {
      try {
        logic = JSON.parse(question.qstn_logic);
      } catch (error) {
        devLogError(error);
      }
    }

    const questionListIdField = isDraftForm
      ? "drft_forms_qstn_lst_id"
      : "sub_req_forms_qstn_lst_id";
    const formIdField = isDraftForm ? "drft_form_id" : "sub_req_forms_id";
    return {
      logic,
      questionTemplateId,
      formItemId: question[questionListIdField],
      index: question.sub_req_form_qstn_nmbr,
      formId: question[formIdField],
      parentId: question.parent_id,
      isActive: question.is_active,
      isCurrent: question.is_current,
    };
  });

  formItems = uniqueFormItems(formItems);
  formItems = sortFormItems(formItems);

  const appData = {
    productType,
    dossierType,
    submissionTypeName,
    formName,
    formId: isDraftForm ? details.drft_form_id : details.sub_req_forms_id,
    submissionType: details.sub_typ_id,
    isActive: details.is_active === undefined ? true : details.is_active,
    questions: formItems,
  };

  return appData;
}

function shortAPIDataToAppData(apiData, isDraftForm = false) {
  return {
    isActive: apiData.is_active,
    formId: isDraftForm ? apiData.drft_form_id : apiData.sub_req_forms_id,
    formName: apiData.sub_req_forms_nm,
    submissionType: apiData.sub_typ_id,
    submissionTypeName: apiData.sub_typ_nm,
  };
}

function appDataToAPIData(appData, isDraftForm = false) {
  const productTypeList = appData.productType
    ? [{ PRODUCT_TYPE_ID: appData.productType.optionId }]
    : [];

  const dossierList = appData.dossierType
    ? [{ DOSSIER_LST_ID: appData.dossierType.optionId }]
    : [];

  const questions = appData.questions.map((question) => {
    let logic = "";

    if (Object.keys(question.logic || {}).length > 0) {
      logic = JSON.stringify(question.logic);
    }

    const questionListIdField = isDraftForm
      ? "DRFT_FORMS_QSTN_LST_ID"
      : "SUB_REQ_FORMS_QSTN_LST_ID";

    const formIdField = isDraftForm ? "DRFT_FORM_ID" : "SUB_REQ_FORMS_ID";

    return {
      [questionListIdField]: question.formItemId,
      SUB_REQ_FORMS_QSTN_LST_ID: question.publishedFormFormItemId,
      SUBMISSION_REQ_TMPLT_ID: question.questionTemplateId,
      SUB_REQ_FORM_QSTN_NMBR: question.index,
      [formIdField]: question.formId,
      QSTN_LOGIC: logic,
      PARENT_ID: question.parentId,
      IS_ACTIVE: question.isActive,
      IS_CURRENT: question.isCurrent,
    };
  });

  const formIdField = isDraftForm ? "DRFT_FORM_ID" : "SUB_REQ_FORMS_ID";
  const records = {
    SUB_REQ_FORMS: {
      [formIdField]: appData.formId,
      SUB_TYP_ID: appData.submissionType,
      sub_req_forms_nm: appData.formName,
      IS_ACTIVE: appData.isActive,
      SUB_REQ_FORMS_ID: appData.publishedFormId,
    },
    PRODUCT_TYPE: productTypeList,
    DOSSIER_REF: dossierList,
    FORMS_QSTN_LST: questions,
  };

  const apiData = { records };
  return apiData;
}

function appDataToSearchAPIData(appData) {
  const productTypeList = appData.productTypeIds.map((id) => {
    return { PRODUCT_TYPE_ID: id, OPERATOR: "OR" };
  });

  const dossierList = appData.dossierTypeIds.map((id) => {
    return { DOSSIER_LST_ID: id, OPERATOR: "OR" };
  });

  let countryIds;

  if (appData.countryIds) {
    countryIds = appData.countryIds.map((id) => {
      return { COUNTRIES_ID: id, OPERATOR: "OR" };
    });
  }

  const records = {
    PRODUCT_TYPE: productTypeList,
    DOSSIER_REF: dossierList,
    COUNTRIES: countryIds,
  };

  const apiData = { records };
  return apiData;
}

export class RequirementFormsConverter {
  static shortToAppData = shortAPIDataToAppData;
  static toAPIData = appDataToAPIData;
  static toAppData = apiDataToAppData;
  static toSearchAPIData = appDataToSearchAPIData;

  static mapShortListToAppData(list = [], isDraftForm = false) {
    return list.map((item) =>
      RequirementFormsConverter.shortToAppData(item, isDraftForm)
    );
  }
}

// Requirment form utils

export function findFormByName(forms, name) {
  const lowercasedName = name.toLowerCase();
  return forms.find((form) => form.formName.toLowerCase() === lowercasedName);
}

export function findFormById(forms, id) {
  id = Number(id);

  if (Number.isNaN(id)) {
    return;
  }

  return forms.find((form) => form.formId === id);
}

// export function getGeneralRequirementFormName() {
//   return "General Requirements";
// }

export function sortFormItems(formItems) {
  return formItems.sort((a, b) => {
    return a.index - b.index;
  });
}

export function getRequirementFormName(
  submissionTypeName,
  productTypeName,
  dossierTypeName
) {
  const capSubTypeName = capitalizeFirstLetter(submissionTypeName);
  const capProdTypeName = capitalizeFirstLetter(trim(productTypeName));
  let str = `${capSubTypeName} Requirements`;

  if (capProdTypeName) {
    str = `${capSubTypeName} - ${capProdTypeName} Requirements`;
  }

  if (dossierTypeName) {
    const capDossierTypeName = capitalizeFirstLetter(trim(dossierTypeName));
    str = `${capSubTypeName} - ${capProdTypeName} - ${capDossierTypeName} Requirements`;
  }

  return str;
}

export function indexFormsByName(forms, lowercaseName = false) {
  return forms.reduce((map, form) => {
    const formName = lowercaseName
      ? form.formName.toLowerCase()
      : form.formName;
    map[formName] = form;
    return map;
  }, {});
}

export function indexFormsById(forms) {
  return forms.reduce((map, form) => {
    map[form.formId] = form;
    return map;
  }, {});
}

export const formQuestionTypes = {
  radio: "List of values - radio buttons",
  checkbox: "List of values - checkboxes",
  singleSelectDropdown: "List of values - dropdown",
  multiSelectDropdown: "List of values - multi-select dropdown",
  date: "Date",
  duration: "Duration",
  cost: "Cost",
  singleLineText: "Single line text",
  multiLineText: "Multi Line Text",
  dropdownWithText: "List of values - dropdown with text",
};

export const formQuestionTypesToIdMap = {
  radio: 3,
  checkbox: 4,
  singleSelectDropdown: 5,
  multiSelectDropdown: 6,
  date: 7,
  duration: 8,
  cost: 9,
  singleLineText: 1,
  multiLineText: 2,
  dropdownWithText: 10,
};

export const formQuestionTypesToIdReverseMap = Object.keys(
  formQuestionTypesToIdMap
).reduce((map, key) => {
  map[formQuestionTypesToIdMap[key]] = key;
  return map;
}, {});

const logicQuestionTypes = [
  formQuestionTypes.singleSelectDropdown,
  formQuestionTypes.radio,
  formQuestionTypes.dropdownWithText,
];

const questionsWithOptions = [
  formQuestionTypes.radio,
  formQuestionTypes.checkbox,
  formQuestionTypes.dropdownWithText,
  formQuestionTypes.singleSelectDropdown,
  formQuestionTypes.multiSelectDropdown,
];

export function isLogicQuestion(questionTypeName) {
  return logicQuestionTypes.includes(questionTypeName);
}

export function isQuestionWithOption(questionTypeName) {
  return questionsWithOptions.includes(questionTypeName);
}

export function getQuestionTypeName(questionTypeId) {
  return formQuestionTypes[formQuestionTypesToIdReverseMap[questionTypeId]];
}

export function isEmptyAnswer(answer) {
  if (answer === null || answer === undefined) {
    return true;
  }

  if (typeof answer === "object" && !Array.isArray(answer)) {
    if ((answer.dropdown || []).length === 0) {
      return (answer.text || "").length === 0;
    }

    return false;
  }

  // all answers are either arrays or strings and both have length fields
  return answer.length === 0;
}

export function searchFormByMetadataIds(
  forms,
  { submissionTypeId, productTypeId, dossierTypeId } = {}
) {
  for (const key in forms) {
    const form = forms[key];

    if (
      form.submissionType == submissionTypeId &&
      defaultTo(form.productType?.optionId, 0) == defaultTo(productTypeId, 0) &&
      defaultTo(form.dossierType?.optionId, 0) == defaultTo(dossierTypeId, 0)
    ) {
      return form;
    }
  }
}
