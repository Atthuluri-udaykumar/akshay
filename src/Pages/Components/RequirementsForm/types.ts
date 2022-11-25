import { IQuestionTemplate } from "../../../Pages/ReusableComponents/QuestionTable/types";
import { IOption } from "../../../global/types";
import { END, NONE } from "./constants";

export interface IFormItem {
  formItemId: number;
  questionTemplateId: number;
  index: number;
  formId: number;
  logic: {
    [optionId: number]: number | typeof END | typeof NONE;
  };
  parentId: number; // zero for null or root
  isActive: boolean;

  publishedFormFormItemId?: number;
  questionTemplate?: IQuestionTemplate;
}

export interface IFormItemExtended extends IFormItem {
  isNew?: boolean; // green background color
  isUpdated?: boolean; // yellow bg
  isDeleted?: boolean; // red bg
  movedFrom?: number;
  movedTo?: number;
}

export interface IForm {
  formId: number;
  submissionType: number;
  submissionTypeName: string;
  formName: string;
  isActive: boolean;
  productType?: IOption | null;
  dossierType?: IOption | null;
  questions: IFormItem[];
  submissionTypeId?: number;
  publishedFormId?: number;
}

export interface IQuestionAnswer {
  value: any;
  effectiveDate?: string | null;
}

export interface IAnswerTableSearchControlsOptions {
  questionText: string;
  dossierList: IOption[];
  productTypeList: IOption[];
  submissionTypeList: IOption[];
  reqCategoryList: IOption[];
  genReqCategoryList: IOption[];
  countries: Array<IOption>;
}

export const defaultSelectedOptions: IAnswerTableSearchControlsOptions = {
  questionText: "",
  submissionTypeList: [],
  productTypeList: [],
  dossierList: [],
  genReqCategoryList: [],
  reqCategoryList: [],
  countries: [],
};

export type QuestionsAnswersMap = Record<number, IQuestionAnswer>;

export interface IQuestionControlOptions {
  questionText: string;
  questionTypeList: IOption[];
  dossierList: IOption[];
  productTypeList: IOption[];
  submissionTypeList: IOption[];
  reqCategoryList: IOption[];
  genReqCategoryList: IOption[];
}

export const defaultQuestionOptions: IQuestionControlOptions = {
  questionText: "",
  questionTypeList: [],
  submissionTypeList: [],
  productTypeList: [],
  dossierList: [],
  genReqCategoryList: [],
  reqCategoryList: [],
};

export interface IQuestionSelectedControlOptions {
  questionType: IOption;
  questionTemplateId: number;
  options: any[];
  questionText: string;
  questionInfo: string;
  productTypes: IOption[];
  submissionTypes: IOption[];
  requirementCategories: IOption[];
  dossierTypes: IOption[];
  generalRequirementCategories: IOption[];
}

export const defaultSelectedQuestionOptions: IQuestionSelectedControlOptions = {
  questionTemplateId: 0,
  options: [],
  questionText: "",
  questionInfo:"",
  questionType: null as any,
  productTypes: [],
  submissionTypes: [],
  requirementCategories: [],
  dossierTypes: [],
  generalRequirementCategories: [],
};
