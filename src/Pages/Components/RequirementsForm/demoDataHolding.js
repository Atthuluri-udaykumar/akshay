import {
  getQuestionId,
  getQuestionSubmissionType,
  getQuestionProductType,
  getQuestionGeneralRequirementCategory,
  getQuestionSubmissionTypeName,
  getQuestionProductTypeName,
  submissionTypeHasGeneralRequirement,
  getQuestionDossier,
  getQuestionDossierName,
} from "../../ReusableComponents/ReusableTable/utils";
import importedQuestionTemplates from "./question_templates.json";
import { capitalizeFirstLetter } from "../../../util_funcs/reusables";

/**
 * => Form structure
 * formId: number
 * formItemIndexes: number[]
 * formName: string
 * productType?: string | null
 * submissionType?: string | null
 * general?: boolean | null
 *
 * => Form item (Question) structure
 * formId: number
 * formItemId: number
 * questionIndex: number
 * order: number | null
 * goto: object
 *    isActive: boolean
 *    gotos: array
 */

// For demo use, until we connect with the API

function getUniqueQuestionTemplates() {
  const seen = {};
  let duplicates = [];

  const uniques = importedQuestionTemplates.filter((question) => {
    const exists = seen[getQuestionId(question)];

    if (exists) {
      duplicates.push(question);
    }

    return !exists;
  });

  return uniques;
}

function prepareQuestionTemplates() {
  const uniques = getUniqueQuestionTemplates();
  return uniques;
}

function mapQuestionTemplates(questions) {
  return questions.reduce((map, question, index) => {
    const id = getQuestionId(question);
    map[id] = { id, index, question };
    return map;
  }, {});
}

let demoForms = [];
let demoFormItems = [];
let demoQuestionTemplates = prepareQuestionTemplates();
let demoQuestionTemplatesMap = mapQuestionTemplates(demoQuestionTemplates);

export function getQuestionTemplates() {
  return demoQuestionTemplates;
}

export function getForms() {
  return demoForms;
}

export function getFormItems() {
  return demoFormItems;
}

export function findForm(forms, id) {
  return forms.find((form) => form.formId === id);
}

export function findFormByName(forms, name) {
  const lowercasedName = name.toLowerCase();
  return forms.find((form) => form.formName.toLowerCase() === lowercasedName);
}

export function findFormIndex(forms, id) {
  return forms.findIndex((form) => form.formId === id);
}

export function findFormItem(formItems, id) {
  return formItems.find((formItem) => formItem.formItemId === id);
}

export function findFormItemIndex(formItems, id) {
  return formItems.findIndex((formItem) => formItem.formItemId === id);
}

export function addQuestionsToForm(form, questions) {
  if (!Array.isArray(questions)) {
    questions = [questions];
  }

  const formItems = questions.map((question, index) => {
    const id = getQuestionId(question);
    const meta = demoQuestionTemplatesMap[id];

    if (meta) {
      return {
        formId: form.formId,
        formItemId: index + demoFormItems.length,
        questionIndex: meta.index,
        order: index + demoFormItems.length,
        goto: { gotos: [], isActive: false },
      };
    } else {
      const index = demoQuestionTemplates.length;

      demoQuestionTemplates.push(question);
      demoQuestionTemplatesMap[id] = { id, index, question };

      return {
        formId: form.formId,
        formItemId: index + demoFormItems.length,
        questionIndex: index,
        order: index + demoFormItems.length,
        goto: { gotos: [], isActive: false },
      };
    }
  });

  form.formItemIndexes = form.formItemIndexes.concat(
    formItems.map((item, index) => index + demoFormItems.length)
  );

  demoFormItems = demoFormItems.concat(formItems);
}

export function getQuestionForms(question) {
  const id = getQuestionId(question);
  const meta = demoQuestionTemplatesMap[id];

  if (meta) {
    const formItems = demoFormItems.filter((item) => {
      return item.questionIndex === meta.index;
    });

    return formItems.map((item) =>
      demoForms.find((form) => form.formId === item.formId)
    );
  }

  demoQuestionTemplates.push(question);
  demoQuestionTemplatesMap[id] = {
    id,
    question,
    index: demoQuestionTemplates.length,
  };

  return [];
}

export function addForm(form) {
  const existingForm = findFormByName(demoForms, form.formName);

  if (!existingForm) {
    demoForms.push(form);
    return form;
  }

  return existingForm;
}

export function updateForm(form, updates) {
  const index = findFormIndex(demoForms, form.formId);

  if (index !== -1) {
    const data = { ...form, ...updates };
    demoForms[index] = data;
  }
}

export function updateFormItem(formItem, updates) {
  const index = findFormItemIndex(demoFormItems, formItem.formItemId);

  if (index !== -1) {
    const data = { ...formItem, ...updates };
    demoFormItems[index] = data;
  }
}

export function replaceFormItems(formItems) {
  const demoFormItemsMap = demoFormItems.reduce((map, item, index) => {
    map[item.formItemId] = index;
    return map;
  }, {});

  formItems.forEach((formItem) => {
    const index = demoFormItemsMap[formItem.formItemId];

    if (index >= 0) {
      demoFormItems[index] = formItem;
    }
  });
}

export function deleteFormItem(formItem) {
  const index = findFormItemIndex(demoFormItems, formItem.formItemId);

  if (index !== -1) {
    demoFormItems.splice(index, 1);
  }
}

export function getFormFormItems(form) {
  return demoFormItems.filter((formItem) => {
    return formItem.formId === form.formId;
  });
}

export function sortFormItems(formItems) {
  return formItems.sort((a, b) => {
    return a.order - b.order;
  });
}

export function getFormItemQuestion(formItem) {
  const question = demoQuestionTemplates[formItem.questionIndex];
  return question;
}
