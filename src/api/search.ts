import { API } from "aws-amplify";
import { apiBase, getLillyIDForAPI } from "./utils";
import { RequirementFormsConverter } from "../Pages/Components/RequirementsForm/utils";
import { isArray, isObject, defaultTo, uniqueId } from "lodash";
import { uniqueForms } from "./forms";
import { IAnswerTableSearchControlsOptions } from "../Pages/Components/RequirementsForm/types";
import { IOption } from "../global/types";
import moment from "moment";

const baseURL = "answerdata";
const unansweredFormURL = `${baseURL}/searchformsunfinished`;
const searchFinalizedAnswersURL = `${baseURL}/searchfinalizedanswers`;
const searchGeneralQuestionsURL = `${baseURL}/searchgeneralanswers`;

export interface ISearchFormsValue {
  submissionTypeId: number;
  formName?: string;
  countryIds?: number[];
  productTypeIds?: number[];
  dossierTypeIds?: number[];
}

export interface IFormCountry {
  country_nm: string;
  countries_id: number;
}

export interface IFormStatus {
  records: {
    sub_req_forms_id: number;
    sub_req_forms_nm: string;
    drafts?: IFormCountry[];
    finalized?: IFormCountry[];
  }[];
}

export interface IAnswerFormats {
  // for draft answers
  form_qstn_ansr_drft_data_id?: number;

  // for finalized answers
  fnl_form_qstn_ansr_data_id?: number;

  // for existing answers
  form_qstn_ansr_data_id?: number;

  // general fields
  req_question_type_lst_id: number;
  txt_data?: string; // text
  lst_data?: string; // list
  dt_data?: string; // date
  duration_data?: string; // duration
  cst_data?: number; // cost
  effective_dt?: string | null; // answer effective date
}

export interface IGetFormAnswers {
  records: {
    sub_req_forms_id: number;
    sub_req_forms_nm?: string;
    FORMS_QSTN_LST?: {
      FORMS_QSTN_LST: {
        submission_req_tmplt_id: number;
        answer: {
          not_applicable: boolean;
          submission_req_tmplt_id: number;
          country_nm: string;
        } & IAnswerFormats;
      }[];
    };
  };
}

//called from db
export interface ISearchFormResultItem {
  formId?: number;
  formName?: string | null;
  drafts?: IFormCountry[];
  finalized?: IFormCountry[];
}

export interface IEditFormAnswerResultItem {
  sub_req_forms_id: number;
  countries_id: number;
}

//called from db
export interface IGetAnswerFormData {
  formId: number;
  countryId: number;
}

//to be sent back to db
export interface IAPIAnswerFormAnswerDataItem extends IAnswerFormats {
  sub_req_forms_id: number | string;
  req_question_type_lst_id: number;
  submission_req_tmplt_id: number;
  not_applicable?: boolean;
  is_active: boolean;
  draft?: boolean;
}

export interface ISearchAnswersAPIParams {
  currentpage?: number;
  countries_id?: number[];
  sub_req_forms_id?: number[];
  data?: {
    qstn_txt: string;
    SUBMISSION_TYPE: {
      SUB_TYP_ID: number;
      SUB_TYP_NM: string;
      OPERATOR: string;
    }[];
    PRODUCT_TYPE: {
      PRODUCT_TYPE_ID: number;
      PRODUCT_TYPE_NM: string;
      OPERATOR: string;
    }[];
    DOSSIER_LST: {
      DOSSIER_LST_ID: number;
      DOSSIER_LST_NM: string;
      OPERATOR: string;
    }[];
    REQ_CAT_LST: {
      REQ_CAT_LST_ID: number;
      REQ_CAT_LST_NM: string;
      OPERATOR: string;
    }[];
    GEN_REQ_CAT_LST: {
      GEN_REQ_CAT_LST_ID: number;
      GEN_REQ_CAT_LST_NM: string;
    }[];
    countries: Array<{ country_id: number }>;
  };
}

//to be sent back to db
export interface IOrigAnswerFormCountryData {
  countries_id: string | number;
  sub_req_forms_id: string | number;
}

//to be sent back to db
export interface IOriginalAnswerFormData {
  records: {
    countries: IOrigAnswerFormCountryData[];
    answr_data: IAPIAnswerFormAnswerDataItem[];
  };
}

export interface ISearchAnswerAPIRawResult {
  records: Array<{
    submission_req_tmplt_id: number;
    req_question_type_lst_id: number;
    req_question_type_nm: string;
    req_type: string;
    custom_allowed: boolean;
    qstn_txt: Array<{
      req_qstn_lst_txt_id: number;
      submission_req_tmplt_id: number;
      req_qstn_txt: string;
      is_active: boolean;
    }>;
    answers: Array<{
      form_qstn_ansr_data_id: number;
      submission_req_tmplt_id: number;
      req_question_type_lst_id: number;
      txt_data?: string;
      lst_data?: string;
      cst_data: any;
      dt_data?: string;
      duration_data: any;
      not_applicable: boolean;
      effective_dt: string;
      country_nm: string;
      sub_typ_nm: string;
      sub_req_forms_id: number;
      countries_id: number;
    }>;
  }>;
  rowCount: number;
}

export interface ISearchAnswerAPIResultItem {
  sub_req_forms_id: number;
  countries_id: number;
  id: number;
  form_qstn_ansr_data_id: number;
  req_question_type_nm: string;
  req_type: string;
  effective_dt: string;
  country_nm: string;
  txt_data: string; // text data can be null
  lst_data: string;
  cst_data: number;
  dt_data: string;
  duration_data: string;
  sub_typ_nm: string;
  answer_data: string;
}

export interface ISearchAnswerAPIResult {
  tableData: Array<ISearchAnswerAPIResultItem>;
}

export interface ISearchGeneralAnswerAPIResult {
  data: {
    qstn_txt: string;
    DOSSIER_LST: Array<any>;
    countries: Array<any>;
  };
}

function searchAnswerApiDataConverter(result: ISearchAnswerAPIRawResult) {
  let tableData: any = [];
  let obj = {};
  if (!result || !result.records.length) {
    return tableData;
  }

  for (let i = 0; i < result.records.length; i++) {
    const answerValue = result.records[i].answers;
    const questionValue = result.records[i].qstn_txt.length
      ? result.records[i].qstn_txt
      : [];

    /* iterate through the answers first as each answers beongs to one country at a time and 
        country is available inside answers array
    */
    for (let a = 0; a < answerValue.length; a++) {
      obj = {};
      let ans = "";
      /**
       * order: country question answer category effective date
       */
      obj["Country_Name"] = answerValue[a].country_nm;
      obj["Question_Text"] = result.records[i].req_type;
      obj["Answer"] =
        answerValue[a].txt_data ||
        answerValue[a].duration_data ||
        answerValue[a].cst_data ||
        moment(answerValue[a].dt_data).format("DD-MMM-YYYY");
      obj["Category"] = answerValue[a].sub_typ_nm;
      obj["Effective_Date"] = moment(answerValue[a].effective_dt).format(
        "DD-MMM-YYYY"
      );
      if (
        (result.records[i].submission_req_tmplt_id ===
          answerValue[a].submission_req_tmplt_id &&
          answerValue[a].dt_data) ||
        answerValue[a].duration_data ||
        answerValue[a].cst_data
      ) {
        obj["Answer"] =
          answerValue[a].txt_data ||
          answerValue[a].duration_data ||
          answerValue[a].cst_data ||
          moment(answerValue[a].dt_data).format("DD-MMM-YYYY");
        obj["Category"] = answerValue[a].sub_typ_nm;
        obj["Effective_Date"] = moment(answerValue[a].effective_dt).format(
          "DD-MMM-YYYY"
        );

        obj["unique_id"] = uniqueId("uni_");
        obj["id"] = answerValue[a].sub_req_forms_id;
        obj["countries_id"] = answerValue[a].countries_id;
        tableData.push(obj);
        break;
      }
      if (questionValue.length) {
        if (answerValue[a].lst_data) {
          let lst_data: [] = JSON.parse(answerValue[a].lst_data as string);
          ans = "";
          for (let l = 0; l < lst_data.length; l++) {
            for (let q = 0; q < questionValue.length; q++) {
              if (
                questionValue[q].submission_req_tmplt_id ===
                  answerValue[a].submission_req_tmplt_id &&
                questionValue[q].req_qstn_lst_txt_id === parseInt(lst_data[l])
              ) {
                ans = ans
                  ? ans + ", " + questionValue[q].req_qstn_txt
                  : "" + questionValue[q].req_qstn_txt;
              }
            }
          }
        }
        for (let q = 0; q < questionValue.length; q++) {
          if (
            questionValue[q].submission_req_tmplt_id ===
              answerValue[a].submission_req_tmplt_id &&
            typeof JSON.parse(answerValue[a].txt_data as string) != "object" &&
            questionValue[q].req_qstn_lst_txt_id ===
              parseInt(answerValue[a].txt_data as string)
          ) {
            obj["Country_Name"] = answerValue[a].country_nm;
            obj["Answer"] = questionValue[q].req_qstn_txt;
            obj["Category"] = answerValue[a].sub_typ_nm;
            obj["Effective_Date"] = moment(answerValue[a].effective_dt).format(
              "DD-MMM-YYYY"
            );
            obj["unique_id"] = uniqueId("uni_");
            obj["id"] = answerValue[a].sub_req_forms_id;
            obj["countries_id"] = answerValue[a].countries_id;
            tableData.push(obj);
            break;
          }
          if (
            questionValue[q].submission_req_tmplt_id ===
              answerValue[a].submission_req_tmplt_id &&
            typeof JSON.parse(answerValue[a].txt_data as string) === "object" &&
            questionValue[q].req_qstn_lst_txt_id ===
              parseInt(JSON.parse(answerValue[a].txt_data as string)?.dropdown)
          ) {
            obj["Country_Name"] = answerValue[a].country_nm;
            obj["Answer"] =
              questionValue[q].req_qstn_txt +
              ", " +
              JSON.parse(answerValue[a].txt_data as string).text;
            obj["Category"] = answerValue[a].sub_typ_nm;
            obj["Effective_Date"] = moment(answerValue[a].effective_dt).format(
              "DD-MMM-YYYY"
            );
            obj["unique_id"] = uniqueId("uni_");
            obj["id"] = answerValue[a].sub_req_forms_id;
            obj["countries_id"] = answerValue[a].countries_id;
            tableData.push(obj);
            break;
          }
        }
      }
      if (ans) {
        obj["Country_Name"] = answerValue[a].country_nm;
        obj["Answer"] = ans;
        obj["Category"] = answerValue[a].sub_typ_nm;
        obj["Effective_Date"] = moment(answerValue[a].effective_dt).format(
          "DD-MMM-YYYY"
        );
        obj["unique_id"] = uniqueId("uni_");
        obj["id"] = answerValue[a].sub_req_forms_id;
        obj["countries_id"] = answerValue[a].countries_id;
        tableData.push(obj);
      }
      if (!questionValue.length) {
        if (
          result.records[i].submission_req_tmplt_id ===
          answerValue[a].submission_req_tmplt_id
        ) {
          obj["Country_Name"] = answerValue[a].country_nm;
          obj["Effective_Date"] = moment(answerValue[a].effective_dt).format(
            "DD-MMM-YYYY"
          );
          obj["Category"] = answerValue[a].sub_typ_nm;
          obj["Answer"] =
            answerValue[a].txt_data ||
            answerValue[a].dt_data ||
            answerValue[a].cst_data ||
            answerValue[a].duration_data;
          obj["unique_id"] = uniqueId("uni_");
          obj["id"] = answerValue[a].sub_req_forms_id;
          obj["countries_id"] = answerValue[a].countries_id;
          tableData.push(obj);
        }
      }
    }
  }
  return tableData;
}

export function toSearchFinalizedAnswersParams(
  appData: IAnswerTableSearchControlsOptions
): ISearchAnswersAPIParams["data"] {
  const apiData: ISearchAnswersAPIParams["data"] = {
    qstn_txt: appData.questionText,
    SUBMISSION_TYPE: appData.submissionTypeList.map((item: IOption) => ({
      SUB_TYP_ID: item.optionId, // submission type id - number
      SUB_TYP_NM: item.optionText, // submission type name - string
      OPERATOR: "OR",
    })),
    PRODUCT_TYPE: appData.productTypeList.map((item: IOption) => ({
      PRODUCT_TYPE_ID: item.optionId,
      PRODUCT_TYPE_NM: item.optionText,
      OPERATOR: "OR",
    })),
    REQ_CAT_LST: appData.reqCategoryList.map((item: IOption) => ({
      REQ_CAT_LST_ID: item.optionId,
      REQ_CAT_LST_NM: item.optionText,
      OPERATOR: "OR",
    })),
    DOSSIER_LST: appData.dossierList.map((item: IOption) => ({
      DOSSIER_LST_ID: item.optionId,
      DOSSIER_LST_NM: item.optionText,
      OPERATOR: "OR",
    })),
    GEN_REQ_CAT_LST: appData.genReqCategoryList.map((item: IOption) => ({
      GEN_REQ_CAT_LST_ID: item.optionId,
      GEN_REQ_CAT_LST_NM: item.optionText,
      OPERATOR: "OR",
    })),
    countries: appData.countries.map((c) => ({
      country_id: c.optionId,
    })),
  };

  return apiData;
}

//function that calls the api to search for any unfinished forms in the database
async function searchFinalizedAnswers(
  props: ISearchAnswersAPIParams
): Promise<any[]> {
  const { currentpage } = props;
  const params = new URLSearchParams();
  params.set("currentpage", (currentpage || 1).toString());
  const apiData: ISearchAnswerAPIRawResult = await API.post(
    apiBase.apiName,
    `${searchFinalizedAnswersURL}?${params.toString()}`,
    {
      body: {
        formdata: JSON.stringify({ data: props.data }),
      },
    }
  );
  const appData = searchAnswerApiDataConverter(apiData);
  return appData;
}

async function searchGeneralAnswers(
  props: ISearchAnswersAPIParams
): Promise<any[]> {
  const apiData: ISearchAnswerAPIRawResult = await API.post(
    apiBase.apiName,
    `${searchGeneralQuestionsURL}`,
    {
      body: {
        formdata: JSON.stringify({ data: props.data }),
      },
    }
  );
  const appData = searchAnswerApiDataConverter(apiData);

  return appData;
}

async function searchFormUnfinished(
  form: ISearchFormsValue
): Promise<ISearchFormResultItem[]> {
  const { submissionTypeId, formName, countryIds } = form;
  const converted = RequirementFormsConverter.toSearchAPIData(form);
  const params = new URLSearchParams();

  params.set("sub_typ_id", (submissionTypeId || 0).toString());
  params.set("sub_req_forms_nm", formName || "");
  params.set("COUNTRIES_ID", (countryIds || []).toString());

  const apiData: IFormStatus | undefined = await API.post(
    apiBase.apiName,
    `${unansweredFormURL}?${params.toString()}`,
    {
      body: {
        formdata: JSON.stringify(converted),
      },
    }
  );

  if (isObject(apiData) && isArray(apiData.records)) {
    let forms: ISearchFormResultItem[] = apiData.records.map((item) => {
      return {
        formId: item.sub_req_forms_id,
        formName: item.sub_req_forms_nm,
        drafts: defaultTo(item.drafts, []),
        finalized: defaultTo(item.finalized, []),
      };
    });

    // filter out forms with the same names
    forms = uniqueForms(forms);

    return forms;
  }
  return [];
}

async function updateFormAnswer(props: IOriginalAnswerFormData) {
  const params = new URLSearchParams();
  params.set("lilly_id", getLillyIDForAPI());
  await API.post(
    apiBase.apiName,
    `answerdata/updateformanswers?${params.toString()}`,
    {
      body: {
        formdata: JSON.stringify(props),
      },
    }
  );
}

async function finalizeFormAnswers(props: IOriginalAnswerFormData) {
  const params = new URLSearchParams();
  params.set("lilly_id", getLillyIDForAPI());

  await API.post(
    apiBase.apiName,
    `answerdata/savefinalform?${params.toString()}`,
    {
      body: {
        formdata: JSON.stringify(props),
      },
    }
  );
}

async function getFormAnswers(formId: number | string, countryId: string) {
  const params = new URLSearchParams();
  params.set("form_id", formId.toString());
  params.set("country_id", countryId.toString());
  const result: IGetFormAnswers = await API.get(
    apiBase.apiName,
    `answerdata/getdraftfomranswers?${params.toString()}`,
    {}
  );

  return result.records.FORMS_QSTN_LST?.FORMS_QSTN_LST || [];
}

async function deleteDraftForm(
  form_id: number | string,
  country_id: number | string
) {
  const params = new URLSearchParams();
  params.set("form_id", form_id.toString());
  params.set("country_id", country_id.toString());
  const result: IOrigAnswerFormCountryData = await API.get(
    apiBase.apiName,
    `answerdata/deletedraftform?${params.toString()}`,
    {}
  );
  return result;
}

async function getFinalizedAnswers(formId: number, countryId: string) {
  const params = new URLSearchParams();
  params.set("form_id", formId.toString());
  params.set("country_id", countryId.toString());
  const result: Array<
    IAnswerFormats & {
      not_applicable: boolean;
      req_question_type_lst_id: number;
      submission_req_tmplt_id: number;
    }
  > = await API.get(
    apiBase.apiName,
    `answerdata/getfinalizedanswers?${params.toString()}`,
    {}
  );
  return result || [];
}

async function checkIfFormExistForCountry(formId: number, countryId: string) {
  const params = new URLSearchParams();
  params.set("form_id", formId.toString());
  params.set("country_id", countryId.toString());
  const result: IGetFormAnswers = await API.get(
    apiBase.apiName,
    `answerdata/isfinalizedform?${params.toString()}`,
    {}
  );
  return result;
}

export default class SearchAPI {
  static searchFormUnfinished = searchFormUnfinished;
  static deleteDraftForm = deleteDraftForm;
  static getFormAnswers = getFormAnswers;
  static finalizeFormAnswers = finalizeFormAnswers;
  static updateFormAnswers = updateFormAnswer;
  static getFinalizedAnswers = getFinalizedAnswers;
  static checkIfFormExistForCountry = checkIfFormExistForCountry;
  static searchFinalizedAnswers = searchFinalizedAnswers;
  static searchGeneralAnswers = searchGeneralAnswers;
}
