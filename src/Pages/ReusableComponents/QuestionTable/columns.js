export const questionTableColumnFields = {
  questionId: "questionTemplateId",
  questionText: "questionText",
  answerType: "questionTypeName",
  submissionType: "submissionTypes",
  requirementForms: "requirementForms",
  productType: "productTypes",
  reqCategory: "requirementCategories",
  genReqCategory: "generalRequirementCategories",
  dossier: "dossierTypes",
};

export const questionTableColumns = [
  {
    id: questionTableColumnFields.questionText,
    field: questionTableColumnFields.questionText,
    headerName: "Question Text",
    width: 250,
  },
  {
    id: questionTableColumnFields.answerType,
    field: questionTableColumnFields.answerType,
    headerName: "Answer Type",
    width: 250,
  },
  {
    id: questionTableColumnFields.submissionType,
    field: questionTableColumnFields.submissionType,
    headerName: "Submission Type",
    width: 250,
  },
  // {
  //   id: questionTableColumnFields.requirementForms,
  //   field: questionTableColumnFields.requirementForms,
  //   headerName: "Requirement Forms",
  //   width: 250,
  // },
  {
    id: questionTableColumnFields.productType,
    field: questionTableColumnFields.productType,
    headerName: "Product Type",
    width: 250,
  },
  {
    id: questionTableColumnFields.reqCategory,
    field: questionTableColumnFields.reqCategory,
    headerName: "Requirement Category",
    width: 250,
  },
  {
    id: questionTableColumnFields.genReqCategory,
    field: questionTableColumnFields.genReqCategory,
    headerName: "General Requirement Category",
    width: 250,
  },
  {
    id: questionTableColumnFields.dossier,
    field: questionTableColumnFields.dossier,
    headerName: "Dossier",
    width: 250,
  },
];
