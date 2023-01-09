import { IOption } from "../../../global/types";

export interface IQuestionTemplateOption extends IOption {
  questionTemplateId: number;
  isActive?: boolean;
}

export enum FormQuestionType {
  SingleLineText = 1,
  MultiLineText = 2,
  Radio = 3,
  Checkbox = 4,
  SingleSelectDropdown = 5,
  MultiSelectDropdown = 6,
  Date = 7,
  Duration = 8,
  Cost = 9,
  DropdownWithText = 10,
}

export interface IQuestionTemplate {
  customAllowed: boolean;
  questionTypeId: number;
  questionTypeName: string;
  questionText: string;
  questionInfo: string;
  questionTemplateId: number;
  options?: IQuestionTemplateOption[];
  productTypes: IOption[];
  submissionTypes: IOption[];
  requirementCategories: IOption[];
  dossierTypes: IOption[];
  generalRequirementCategories: IOption[];
}
