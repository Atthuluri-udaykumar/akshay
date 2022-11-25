import { API } from "aws-amplify";
import { ReferenceDataConverter } from "../Pages/Components/ReferenceData/utils";
import { QuestionTemplateConverter } from "../Pages/ReusableComponents/QuestionTable/utils";
import { apiBase, getLillyIDForAPI } from "./utils";

const referenceDataPaths = {
  submissionType: {
    create: `submissiontype/addsubmissiontype`,
    read: `submissiontype/getallsubmissiontypes`,
    update: `submissiontype/updatesubmissiontype`,
  },
  productType: {
    create: `producttype/addproducttype`,
    read: `producttype/getallproducttype`,
    update: `producttype/updateproducttype`,
  },
  dossageForm: {
    create: `dosageformlist/adddosageform`,
    read: `dosageformlist/getalldosageforms`,
    update: `dosageformlist/updatedosageform`,
  },
  reqCategory: {
    create: `requirementcategorylist/addrequirementcategory`,
    read: `requirementcategorylist/getallrequirementcategorylist`,
    update: `requirementcategorylist/updaterequirementcategory`,
  },
  genReqCategory: {
    create: `generalrequirementcategorylist/addgeneralrequirementcategory`,
    read: `generalrequirementcategorylist/getallgeneralrequirementcategorylist`,
    update: `generalrequirementcategorylist/updategeneralrequirementcategory`,
  },
};

// Reference Data API
export async function getRefferenceData(path, idField, nameField) {
  const result = await API.get(apiBase.apiName, path);
  return QuestionTemplateConverter.mapList(result.records, (item) => ({
    optionId: item[idField],
    optionText: item[nameField],
    isActive: item[ReferenceDataConverter.fields.general.isActive]
  }));
}

export async function getCountryReferenceData(path, idField, nameField) {
  const result = await API.get(apiBase.apiName, path);
  return QuestionTemplateConverter.mapList(result.records, (item) => ({
    optionId: item[idField],
    optionText: item[nameField],
    isActive: item[ReferenceDataConverter.fields.general.isActive],
    countryDisplayName: item["country_display_nm"]?item["country_display_nm"]:item[nameField],
    comment:item["country_comment"]?item["country_comment"]:"",
  }));
}



export async function addRefferenceData(path) {
  // TODO: Lilly ID added in ReferenceDataComponent. Move it here.
  return await API.post(apiBase.apiName, path);
}

export async function updateRefferenceData(path) {
  // TODO: Lilly ID added in ReferenceDataComponent. Move it here.
  return await API.post(apiBase.apiName, path);
}

// // Dossier nodes API
async function getDossierNodes() {
  const path = "dossierlist/getalldossierlist2";
  const result = await API.get(apiBase.apiName, path);
  return ReferenceDataConverter.dossierNodesAPIDataToAppData(result.records);
}

async function updateDossierNode(id, parentId, active, name) {
  const params = new URLSearchParams();
  params.set("dossier_lst_id", id);
  params.set("parent_id", parentId);
  params.set("dossier_lst_nm", name);
  params.set("active", active);
  params.set("lilly_id", getLillyIDForAPI());

  const path = `dossierlist/updateDossiernode?${params.toString()}`;
  await API.post(apiBase.apiName, path);
}

async function addDossierListNode(parentId, name, active) {
  const params = new URLSearchParams();
  params.set("parent_id", parentId);
  params.set("name", name);
  params.set("active", active);
  params.set("lilly_id", getLillyIDForAPI());

  const path = `dossierlist/adddossierlistnode?${params.toString()}`;
  await API.post(apiBase.apiName, path);
}

// // Regions API
async function getRegions() {
  const path = "regions/getallregions";
  const result = await API.get(apiBase.apiName, path);
  return ReferenceDataConverter.regionAPIDataToAppData(result.records);
}

async function updateRegion(name, id, active) {
  const params = new URLSearchParams();
  params.set("region_id", id);
  params.set("region_nm", name);
  params.set("active", active);
  params.set("lilly_id", getLillyIDForAPI());

  const path = `regions/updateregion?${params.toString()}`;
  await API.post(apiBase.apiName, path);
}

async function addRegion(name) {
  const params = new URLSearchParams();
  params.set("region_nm", name);
  params.set("lilly_id", getLillyIDForAPI());

  const path = `regions/addregion?${params.toString()}`;
  await API.post(apiBase.apiName, path);
}

// // Countries API
async function getCountries() {
  const path = "countries/allcountries";
  const result = await API.get(apiBase.apiName, path);
  return ReferenceDataConverter.countryAPIDataToAppData(result.records);
}

// getActiveCountries
async function getActiveCountries(lilly_id) {
  const params = new URLSearchParams();
  params.set("lilly_id", lilly_id);
  const path = `countries/allactivecountries?${params.toString()}`;
  const result = await API.get(apiBase.apiName, path);
  return ReferenceDataConverter.countryAPIDataToAppData(result.records);
}

async function updateCountryRegion(countryId, regionId, active = true) {
  const params = new URLSearchParams();
  params.set("country_id", countryId);
  params.set("region_id", regionId);
  params.set("active", active);
  params.set("lilly_id", getLillyIDForAPI());

  const path = `countries/updatecountryregion?${params.toString()}`;
  await API.post(apiBase.apiName, path);
}

// Question types API
async function getQuestionTypes() {
  const result = await API.get(
    apiBase.apiName,
    "subreqtemplate/getreqquestiontypelist"
  );

  return ReferenceDataConverter.questionTypesAPIDataToAppData(result.records);
}

// get countries by lilly id
async function getCountriesByLillyId() {
  const params = new URLSearchParams();
  params.set("lilly_id", getLillyIDForAPI());
  const path = `users/getcountriesbyuser`;
  const result = await API.get(
    apiBase.apiName,
    `${path}?${params.toString()}`,
    {}
  );
  return ReferenceDataConverter.countryAPIDataToAppData(result.records);
}

//get all active countries
async function getAllActiveCountries() {
  const path = "countries/allactivecountries";
  const result = await API.get(apiBase.apiName, path);
  return ReferenceDataConverter.countryAPIDataToAppData(result.records);
}

async function updateCountryDisplay(countryId, countryName, countryDisplayName,comment, active ) {
    const params = new URLSearchParams();
    params.set("country_id", countryId);
    params.set("country_nm", countryName);
    params.set("country_display_nm", countryDisplayName);
    params.set("country_comment", comment);
    params.set("active", active);
    params.set("lilly_id", getLillyIDForAPI());
    const path = `countries/updatecountrybyid?${params.toString()}`;
    const response = await API.post(apiBase.apiName, path);
}

export default class ReferenceDataAPI {
  static getRefferenceData = getRefferenceData;
  static addRefferenceData = addRefferenceData;
  static updateRefferenceData = updateRefferenceData;
  static getDossierNodes = getDossierNodes;
  static addDossierListNode = addDossierListNode;
  static updateDossierNode = updateDossierNode;
  static getRegions = getRegions;
  static addRegion = addRegion;
  static updateRegion = updateRegion;
  static getCountries = getCountries;
  static updateCountryRegion = updateCountryRegion;
  static getQuestionTypes = getQuestionTypes;
  static getCountriesByLillyId = getCountriesByLillyId;
  static getAllActiveCountries = getAllActiveCountries;
  static getCountryReferenceData = getCountryReferenceData;
  static getActiveCountries = getActiveCountries;
  static updateCountryDisplay = updateCountryDisplay;
  static paths = referenceDataPaths;
}
