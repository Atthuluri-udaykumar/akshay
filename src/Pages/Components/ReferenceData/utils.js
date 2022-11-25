/**
Submission type API format
[
  {
    "sub_typ_id": 91,
    "sub_typ_nm": "General",
    "is_active": false
  }
]

Question types API format
[
  {
    "req_question_type_lst_id": 3,
    "req_question_type_nm": "List of values - radio buttons",
    "is_active": true
  }
]

Product types API format
[
  {
    "product_type_id": 100,
    "product_type_nm": "05-050-21",
    "is_active": false
  },
  {
    "product_type_id": 78,
    "product_type_nm": "26 april",
    "is_active": false
  }
]

Dossier nodes API format
[
  {
    "dossier_lst_id": 1,
    "dossier_lst_nm": "Module 1 Administrative information",
    "parent_id": null,
    "is_active": true,
    "parent_path": "root"
  },
  {
    "dossier_lst_id": 2,
    "dossier_lst_nm": "Module 2 Summaries",
    "parent_id": null,
    "is_active": false,
    "parent_path": "root"
  },
]

Requirement category API format
[
  {
    "req_cat_lst_id": 38,
    "req_cat_lst_nm": "Certificate/Letter",
    "is_active": false
  }
]

General Requirement category API format
[
  {
    "gen_req_cat_lst_id": 40,
    "gen_req_cat_lst_nm": "Approval times",
    "is_active": false
  }
]

Region API format
[
  {
    "region_id": 197,
    "region_nm": "rt 2",
    "is_active": false
  },
  {
    "region_id": 190,
    "region_nm": "26 April_test3",
    "is_active": false
  }
]

Countries API format
[
  {
    "countries_id": 1,
    "country_nm": "",
    "region": 21,
    "is_active": true
  },
  {
    "countries_id": 148,
    "country_nm": "#",
    "region": 22,
    "is_active": true
  }
]
 */

import { decodeText } from "../../../util_funcs/reusables";
import { QuestionTemplateConverter } from "../../ReusableComponents/QuestionTable/utils";

const referenceDataFields = {
  general: {
    isActive: "is_active",
  },
  submissionType: {
    id: "sub_typ_id",
    name: "sub_typ_nm",
  },
  productType: {
    id: "product_type_id",
    name: "product_type_nm",
  },
  dossageForm: {
    id: "dosage_frm_lst_id",
    name: "dosage_frm_lst_nm",
  },
  reqCategory: {
    id: "req_cat_lst_id",
    name: "req_cat_lst_nm",
  },
  genReqCategory: {
    id: "gen_req_cat_lst_id",
    name: "gen_req_cat_lst_nm",
  },
  region: {
    id: "region_id",
    name: "region_nm",
  },
  country: {
    id: "countries_id",
    name: "country_nm",
    region: "region",
  },
  dossierNodes: {
    id: "dossier_lst_id",
    name: "dossier_lst_id",
    parentId: "parent_id",
    parentPath: "parentPath",
  },
  questionType: {
    id: "req_question_type_lst_id",
    name: "req_question_type_nm",
  }
};

function submissionTypeAPIDataToAppData(apiData) {
  return QuestionTemplateConverter.mapList(apiData, (item) => ({
    optionId: item.sub_typ_id,
    optionText: item.sub_typ_nm,
    isActive: item.is_active,
  }));
}

function dossageAPIDataToAppData(apiData) {
  return QuestionTemplateConverter.mapList(apiData, (item) => ({
    optionId: item.dosage_frm_lst_id,
    optionText: item.dosage_frm_lst_nm,
    isActive: item.is_active,
  }));
}

function productTypeAPIDataToAppData(apiData) {
  return QuestionTemplateConverter.mapList(apiData, (item) => ({
    optionId: item.product_type_id,
    optionText: item.product_type_nm,
    isActive: item.is_active,
  }));
}

function generalReqAPIDataToAppData(apiData) {
  return QuestionTemplateConverter.mapList(apiData, (item) => ({
    optionId: item.gen_req_cat_lst_id,
    optionText: item.gen_req_cat_lst_nm,
    isActive: item.is_active,
  }));
}

function questionTypesAPIDataToAppData(apiData) {
  const items = QuestionTemplateConverter.mapList(apiData, (item) => ({
    optionId: item.req_question_type_lst_id,
    optionText: item.req_question_type_nm,
    isActive: item.is_active,
  }));

  return items;
}

function dossierNodesAPIDataToAppData(apiData) {
  return QuestionTemplateConverter.mapList(apiData, (item) => ({
    optionId: item.dossier_lst_id,
    optionText: decodeText(item.dossier_lst_nm),
    isActive: item.is_active,
    parentId: item.parent_id,
    parentPath: item.parentPath,
  }));
}

function reqCategoryAPIDataToAppData(apiData) {
  return QuestionTemplateConverter.mapList(apiData, (item) => ({
    optionId: item.req_cat_lst_id,
    optionText: item.req_cat_lst_nm,
    isActive: item.is_active,
  }));
}

function regionAPIDataToAppData(apiData) {
  return QuestionTemplateConverter.mapList(apiData, (item) => ({
    optionId: item.region_id,
    optionText: item.region_nm,
    isActive: item.is_active,
  }));
}

function countryAPIDataToAppData(apiData) {
  return QuestionTemplateConverter.mapList(apiData, (item) => ({
    optionId: item.countries_id,
    optionText: item.country_nm,
    region: item.region,
    isActive: item.is_active,
  }));
}

function finalizedFormAPIDataToAppData(apiData) {
  return QuestionTemplateConverter.mapList(apiData, (item) => ({
    optionId: item.sub_req_forms_id,
    optionText: item.sub_req_forms_nm,
    isActive: item.is_active,
    country_id: item.country_id,
    country_nm: item.country_nm
  }));
}

export class ReferenceDataConverter {
  static submissionTypeAPIDataToAppData = submissionTypeAPIDataToAppData;
  static reqCategoryAPIDataToAppData = reqCategoryAPIDataToAppData;
  static productTypeAPIDataToAppData = productTypeAPIDataToAppData;
  static dossierNodesAPIDataToAppData = dossierNodesAPIDataToAppData;
  static questionTypesAPIDataToAppData = questionTypesAPIDataToAppData;
  static generalReqAPIDataToAppData = generalReqAPIDataToAppData;
  static regionAPIDataToAppData = regionAPIDataToAppData;
  static countryAPIDataToAppData = countryAPIDataToAppData;
  static dossageAPIDataToAppData = dossageAPIDataToAppData;
  static finalizedFormAPIDataToAppData = finalizedFormAPIDataToAppData;

  static fields = referenceDataFields;
}
