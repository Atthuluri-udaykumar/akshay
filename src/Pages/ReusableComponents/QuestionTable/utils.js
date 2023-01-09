import { sortBy } from "lodash";
import { decodeText } from "../../../util_funcs/reusables";

export function getQuestionText(item) {
  const data = item.records || item;
  return data[0]?.req_type;
}

export function getQuestionAnswerType(item) {
  const data = item.records || item;
  return data[0]?.req_question_type_nm;
}

export function getQuestionSubmissionType(item) {
  const data = item.records || item;
  const sub = data[3]?.SUBMISSION_TYPE;
  return sub;
}

export function getQuestionProductType(item) {
  const data = item.records || item;
  return data[2]?.PRODUCT_TYPE;
}

export function getQuestionRequirementCategory(item) {
  const data = item.records || item;
  return data[4]?.REQ_CAT_LST;
}

export function getQuestionDossier(item) {
  const data = item.records || item;
  return data[5]?.DOSSIER_LST;
}

export function getQuestionGeneralRequirementCategory(item) {
  const data = item.records || item;
  return data[6]?.GEN_REQ_CAT_LST;
}

export function getQuestionId(item) {
  const data = item.records || item;
  return data[0]?.submission_req_tmplt_id;
}

export function getQuestionAnswers(item) {
  const data = item.records || item;
  return data[1]?.qstn_txt;
}

export function isQuestionDropdown(item) {
  return getQuestionAnswerType(item) === "List of values - dropdown";
}

export function getQuestionSubmissionTypeName(item) {
  return item.sub_typ_nm;
}

export function getQuestionProductTypeName(item) {
  return item.product_type_nm;
}

export function getQuestionRequirementCategoryName(item) {
  return item.req_cat_lst_nm;
}

export function getQuestionDossierName(item) {
  return item.dossier_lst_nm;
}

export function getQuestionGeneralRequirementCategoryName(item) {
  return item.gen_req_cat_lst_nm;
}

export function getQuestionSubmissionTypeId(item) {
  return item.sub_typ_id;
}

export function getQuestionProductTypeId(item) {
  return item.product_type_id;
}

export function getQuestionRequirementCategoryId(item) {
  return item.req_cat_lst_id;
}

export function getQuestionDossierId(item) {
  return item.dossier_lst_id;
}

export function getQuestionGeneralRequirementCategoryId(item) {
  return item.gen_req_cat_lst_id;
}

export function getQuestionAnswerName(item) {
  return item.req_qstn_txt;
}

export function findGeneralSubmissionType(submissionTypes) {
  return submissionTypes.find(
    (item) => getQuestionSubmissionTypeName(item) === "General"
  );
}

export function submissionTypeHasGeneralRequirement(submissionTypes) {
  return !!findGeneralSubmissionType(submissionTypes);
}

export function getQuestionOptionId(item) {
  return item.req_qstn_lst_txt_id;
}

export function getQuestionOptionText(item) {
  return item.req_qstn_txt;
}

/**
 *  Incoming question template API format
[
  0: {
    custom_allowed: true,
    req_question_type_lst_id: 3,
    req_question_type_nm: "List of values - radio buttons",
    req_type: "20april_1",
    submission_req_tmplt_id: 292
  },
  1: {
    qstn_txt: [
      {
        is_active: true,
        req_qstn_lst_txt_id: 148,
        req_qstn_txt: "yes",
        submission_req_tmplt_id: 292
      }
    ]
  },
  2: {
    PRODUCT_TYPE: [
      {
        product_type_id: 73, 
        product_type_nm: "Device"
      }
    ]
  },
  3: {
    SUBMISSION_TYPE: [
      {
        sub_typ_id: 90, 
        sub_typ_nm: "Clinical Trial Materials"
      }
    ]
  },
  4: {
    REQ_CAT_LST: [
      {
        req_cat_lst_id: 36, 
        req_cat_lst_nm: "CM&C"
      }
    ]
  },
  5: {
    DOSSIER_LST: [
      {
        dossier_lst_id: 3, 
        dossier_lst_nm: "Module 3 Quality"
      }
    ]
  },
  6: {
    GEN_REQ_CAT_LST: [
      {
        gen_req_cat_lst_id: 36,
        gen_req_cat_lst_nm: "FEES"
      }
    ]
  }
]
*/

/**
 * Question template local format
{
  customAllowed: true,
  questionTypeId: 3,
  questionTypeName: "List of values - radio buttons",
  questionText: "20april_1",
  questionTemplateId: 292,
  options?: [
    {
        isActive: true,
        optionId: 148,
        optionText: "yes",
        questionTemplateId: 292
    }
  ],
  productTypes: [
    {
      optionId: 73,
      optionText: "Device",
    }
  ],
  submissionTypes: [
    {
      optionId: 90, 
      optionText: "Clinical Trial Materials"
    }
  ],
  requirementCategories: [
    {
      optionId: 36, 
      optionText: "CM&C"
    }
  ],
  dossierTypes: [
    {
      optionId: 3, 
      optionText: "Module 3 Quality"
    }
  ],
  "generalRequirementCategories": [
    {
      optionId: 20,
      optionText: "test march 3"
    }
  ]
}
*/

/**
 * Question template search format
 * {
    "SUBMISSION_TYPE": [
      { "SUB_TYP_ID": 91, "SUB_TYP_NM": "General", "OPERATOR": "OR" },
      { "SUB_TYP_ID": 83, "SUB_TYP_NM": "Renewal", "OPERATOR": "OR" }
    ],
    "PRODUCT_TYPE": [
      {
        "PRODUCT_TYPE_ID": 100,
        "PRODUCT_TYPE_NM": "05-050-21",
        "OPERATOR": "OR"
      },
      {
        "PRODUCT_TYPE_ID": 78,
        "PRODUCT_TYPE_NM": "26 april",
        "OPERATOR": "OR"
      },
      {
        "PRODUCT_TYPE_ID": 71,
        "PRODUCT_TYPE_NM": "Biological/Biotech",
        "OPERATOR": "OR"
      }
    ],
    "REQ_CAT_LST": [
      {
        "REQ_CAT_LST_ID": 38,
        "REQ_CAT_LST_NM": "Certificate/Letter",
        "OPERATOR": "OR"
      },
      {
        "REQ_CAT_LST_ID": 34,
        "REQ_CAT_LST_NM": "General Information",
        "OPERATOR": "OR"
      }
    ],
    "DOSSIER_LST": [
      {
        "DOSSIER_LST_ID": 1,
        "DOSSIER_LST_NM": "Module 1 Administrative information",
        "OPERATOR": "OR"
      },
      {
        "DOSSIER_LST_ID": 2,
        "DOSSIER_LST_NM": "Module 2 Summaries",
        "OPERATOR": "OR"
      }
    ],
    "GEN_REQ_CAT_LST": [
      {
        "GEN_REQ_CAT_LST_ID": 40,
        "GEN_REQ_CAT_LST_NM": "Approval times",
        "OPERATOR": "OR"
      },
      {
        "GEN_REQ_CAT_LST_ID": 36,
        "GEN_REQ_CAT_LST_NM": "FEES",
        "OPERATOR": "OR"
      }
    ]
  }
 */

export const kOptionIdField = "optionId";
export const kOptionNameField = "optionText";

function productTypeToAppFormat(
  type,
  idField = kOptionIdField,
  nameField = kOptionNameField
) {
  return {
    [idField]: type.product_type_id,
    // [nameField]: decodeURIComponent(type.product_type_nm),
    [nameField]: type.product_type_nm,
  };
}

function submissionTypeToAppFormat(
  type,
  idField = kOptionIdField,
  nameField = kOptionNameField
) {
  return {
    [idField]: type.sub_typ_id,
    // [nameField]: decodeURIComponent(type.sub_typ_nm),
    [nameField]: type.sub_typ_nm,
  };
}

function dossierTypeToAppFormat(
  type,
  idField = kOptionIdField,
  nameField = kOptionNameField
) {
  return {
    [idField]: type.dossier_lst_id,
    [nameField]: decodeText(type.dossier_lst_nm),
    parentId: type.parent_id,
    isActive: type.is_active,
  };
}

function reqCategoryToAppFormat(
  type,
  idField = kOptionIdField,
  nameField = kOptionNameField
) {
  return {
    [idField]: type.req_cat_lst_id,
    // [nameField]: decodeURIComponent(type.req_cat_lst_nm),
    [nameField]: type.req_cat_lst_nm,
  };
}

function genReqCategoryToAppFormat(
  type,
  idField = kOptionIdField,
  nameField = kOptionNameField
) {
  return {
    [idField]: type.gen_req_cat_lst_id,
    // [nameField]: decodeURIComponent(type.gen_req_cat_lst_nm),
    [nameField]: type.gen_req_cat_lst_nm,
  };
}

function questionTypeToAppFormat(
  type,
  idField = kOptionIdField,
  nameField = kOptionNameField
) {
  return {
    [idField]: type.req_question_type_lst_id,
    // [nameField]: decodeURIComponent(type.req_question_type_nm),
    [nameField]: type.req_question_type_nm,
  };
}

function mapProductTypeToAppFormat(
  list,
  idField = kOptionIdField,
  nameField = kOptionNameField
) {
  return mapList(list, (data) =>
    productTypeToAppFormat(data, idField, nameField)
  );
}

function mapSubmissionTypeToAppFormat(
  list,
  idField = kOptionIdField,
  nameField = kOptionNameField
) {
  return mapList(list, (data) =>
    submissionTypeToAppFormat(data, idField, nameField)
  );
}

function mapDossierTypeToAppFormat(
  list,
  idField = kOptionIdField,
  nameField = kOptionNameField
) {
  return mapList(list, (data) => {
    const item = dossierTypeToAppFormat(data, idField, nameField);
    return item;
  });
}

function mapQuestionTypeList(
  list,
  idField = kOptionIdField,
  nameField = kOptionNameField
) {
  return mapList(list, (data) =>
    questionTypeToAppFormat(data, idField, nameField)
  );
}

function mapReqCategoriesToAppFormat(
  list,
  idField = kOptionIdField,
  nameField = kOptionNameField
) {
  return mapList(list, (data) =>
    reqCategoryToAppFormat(data, idField, nameField)
  );
}

function mapGenReqCategoriesToAppFormat(
  list,
  idField = kOptionIdField,
  nameField = kOptionNameField
) {
  return mapList(list, (data) =>
    genReqCategoryToAppFormat(data, idField, nameField)
  );
}

function mapList(list = [], func = null) {
  if (func) {
    let result = [];
    list.forEach((item) => {
      const mappedItem = func(item);

      if (mappedItem.optionText) {
        result.push(mappedItem);
      }
    });

    result = sortBy(result, ["optionText"]);
    return result;
  }

  return list;
}

function questionAPIDataToAppData(apiData) {
  apiData = apiData.records || apiData;
  const options = apiData.qstn_txt || [];
  const productTypes = apiData.PRODUCT_TYPE;
  const submissionTypes = apiData.SUBMISSION_TYPE;
  const requirementCategories = apiData.REQ_CAT_LST;
  const dossierTypes = apiData.DOSSIER_LST;
  const generalRequirementCategories = apiData.GEN_REQ_CAT_LST;

  if (!apiData.submission_req_tmplt_id) {
    console.log("Question without ID, report to Abayomi", apiData);
  }

  return {
    customAllowed: apiData.custom_allowed,
    questionTypeId: apiData.req_question_type_lst_id,
    questionTypeName: apiData.req_question_type_nm,
    questionText: apiData.req_type,
    questionInfo:apiData.tooltip,
    questionTemplateId: apiData.submission_req_tmplt_id,
    options: options.map((option) => {
      return {
        isActive: option.is_active,
        optionId: option.req_qstn_lst_txt_id,
        optionText: option.req_qstn_txt,
        questionTemplateId: option.submission_req_tmplt_id,
      };
    }),
    productTypes: mapList(productTypes, productTypeToAppFormat),
    submissionTypes: mapList(submissionTypes, submissionTypeToAppFormat),
    requirementCategories: mapList(
      requirementCategories,
      reqCategoryToAppFormat
    ),
    dossierTypes: mapList(dossierTypes, dossierTypeToAppFormat),
    generalRequirementCategories: mapList(
      generalRequirementCategories,
      genReqCategoryToAppFormat
    ),
  };
}

function singleQuestionAPIDataToAppData(apiData) {
  apiData = apiData.records || apiData;
  const options = apiData.qstn_txt || [];
  const productTypes = apiData.PRODUCT_TYPE;
  const submissionTypes = apiData.SUBMISSION_TYPE;
  const requirementCategories = apiData.REQ_CAT_LST;
  const dossierTypes = apiData.DOSSIER_LST;
  const generalRequirementCategories = apiData.GEN_REQ_CAT_LST;

  if (!apiData.submission_req_tmplt_id) {
    console.log("Question without ID, report to Anil or John", apiData);
  }

  return {
    questionText: apiData.req_type,
    questionInfo:apiData.tooltip,
    questionType: {
      optionId: apiData.req_question_type_lst_id,
      optionText: apiData.req_question_type_nm,
    },
    questionTemplateId: apiData.submission_req_tmplt_id,
    options: options.map((option) => {
      return {
        isActive: option.is_active,
        optionId: option.req_qstn_lst_txt_id,
        optionText: option.req_qstn_txt,
        questionTemplateId: option.submission_req_tmplt_id,
      };
    }),
    productTypes: mapList(productTypes, productTypeToAppFormat),
    submissionTypes: mapList(submissionTypes, submissionTypeToAppFormat),
    requirementCategories: mapList(
      requirementCategories,
      reqCategoryToAppFormat
    ),
    dossierTypes: mapList(dossierTypes, dossierTypeToAppFormat),
    generalRequirementCategories: mapList(
      generalRequirementCategories,
      genReqCategoryToAppFormat
    ),
  };
}

/**
 * Transforms save question result to app format
 * @param {object} apiData
 * @returns {object}
 */
function questionSaveAPIDataToAppData(apiData) {
  apiData = apiData.records || apiData;
  const details = apiData[0];

  return {
    questionTemplateId: details.submission_req_tmplt_id,
  };
}

function questionAppDataToAPIData(appData) {
  const apiData = {
    ["qstn_txt"]: appData.options.map((item) => ({
      REQ_QSTN_LST_TXT_ID: item.optionId,
      Text: item.optionText,
      IS_ACTIVE: item.isActive,
    })),
    ["SUBMISSION_TYPE"]: appData.submissionTypes.map((item) => ({
      SUB_TYP_ID: item.optionId,
      SUB_TYP_NM: item.optionText,
    })),
    ["PRODUCT_TYPE"]: appData.productTypes.map((item) => ({
      PRODUCT_TYPE_ID: item.optionId,
      PRODUCT_TYPE_NM: item.optionText,
    })),
    ["REQ_CAT_LST"]: appData.requirementCategories.map((item) => ({
      REQ_CAT_LST_ID: item.optionId,
      REQ_CAT_LST_NM: item.optionText,
    })),
    ["DOSSIER_LST"]: appData.dossierTypes.map((item) => ({
      DOSSIER_LST_ID: item.optionId,
      DOSSIER_LST_NM: item.optionText,
    })),
    ["GEN_REQ_CAT_LST"]: appData.generalRequirementCategories.map((item) => ({
      GEN_REQ_CAT_LST_ID: item.optionId,
      GEN_REQ_CAT_LST_NM: item.optionText,
    })),
  };

  return apiData;
}

function questionAppDataToSearchAPIData(appData) {
  const apiData = {
    ["SUBMISSION_TYPE"]: appData.submissionTypes.map((item) => ({
      SUB_TYP_ID: item.optionId,
      SUB_TYP_NM: item.optionText,
      OPERATOR: "OR",
    })),
    ["PRODUCT_TYPE"]: appData.productTypes.map((item) => ({
      PRODUCT_TYPE_ID: item.optionId,
      PRODUCT_TYPE_NM: item.optionText,
      OPERATOR: "OR",
    })),
    ["REQ_CAT_LST"]: appData.requirementCategories.map((item) => ({
      REQ_CAT_LST_ID: item.optionId,
      REQ_CAT_LST_NM: item.optionText,
      OPERATOR: "OR",
    })),
    ["DOSSIER_LST"]: appData.dossierTypes.map((item) => ({
      DOSSIER_LST_ID: item.optionId,
      DOSSIER_LST_NM: item.optionText,
      OPERATOR: "OR",
    })),
    ["GEN_REQ_CAT_LST"]: appData.generalRequirementCategories.map((item) => ({
      GEN_REQ_CAT_LST_ID: item.optionId,
      GEN_REQ_CAT_LST_NM: item.optionText,
      OPERATOR: "OR",
    })),
  };

  return apiData;
}

export class QuestionTemplateConverter {
  static apiDataToAppData = questionAPIDataToAppData;
  static singleQuestionAPIDataToAppData = singleQuestionAPIDataToAppData;
  static dossierTypeToAppFormat = dossierTypeToAppFormat;
  static productTypeToAppFormat = productTypeToAppFormat;
  static submissionTypeToAppFormat = submissionTypeToAppFormat;
  static dossierTypeToAppFormat = dossierTypeToAppFormat;
  static genReqCategoryToAppFormat = genReqCategoryToAppFormat;
  static reqCategoryToAppFormat = reqCategoryToAppFormat;
  static questionTypeToAppFormat = questionTypeToAppFormat;
  static mapProductTypeToAppFormat = mapProductTypeToAppFormat;
  static mapSubmissionTypeToAppFormat = mapSubmissionTypeToAppFormat;
  static mapDossierTypeToAppFormat = mapDossierTypeToAppFormat;
  static mapGenReqCategoriesToAppFormat = mapGenReqCategoriesToAppFormat;
  static mapReqCategoriesToAppFormat = mapReqCategoriesToAppFormat;
  static mapQuestionTypeList = mapQuestionTypeList;
  static mapList = mapList;
  static questionAppDataToAPIData = questionAppDataToAPIData;
  static questionAppDataToSearchAPIData = questionAppDataToSearchAPIData;
  static questionSaveAPIDataToAppData = questionSaveAPIDataToAppData;
}

export function hasGeneralRequirement(
  submissionTypes,
  nameField = kOptionNameField
) {
  return !!submissionTypes.find(
    (option) => option[nameField]?.toLowerCase() === "general"
  );
}

export function indexQuestionsById(questions) {
  return questions.reduce((map, formItem) => {
    map[formItem.questionTemplateId] = formItem;
    return map;
  }, {});
}
