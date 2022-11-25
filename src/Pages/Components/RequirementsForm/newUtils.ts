import { IFormItem, IFormItemExtended } from "./types";

export function diffForms(
  inputDraftFormItems: IFormItem[],
  inputPublishedFormItems: IFormItem[]
) {
  const draftFormItems: IFormItemExtended[] = [];
  const publishedFormItems: IFormItemExtended[] = [];
  const draftFormItemsMap: Record<number, IFormItem> = {};
  const publishedFormItemsMap: Record<number, IFormItem> = {};
  inputDraftFormItems.forEach((item) => {
    draftFormItemsMap[item.questionTemplateId] = item;
  });

  inputPublishedFormItems.forEach((item) => {
    publishedFormItemsMap[item.questionTemplateId] = item;
  });

  const maxLength = Math.max(
    inputDraftFormItems.length,
    inputPublishedFormItems.length
  );

  for (let i = 0; i < maxLength; i++) {
    const draftFormItem = inputDraftFormItems[i];
    const publishedFormItem = inputPublishedFormItems[i];
    const publishedFormItemVersion =
      publishedFormItemsMap[draftFormItem?.questionTemplateId];
    const draftFormItemVersion =
      draftFormItemsMap[publishedFormItem?.questionTemplateId];

    if (draftFormItem && !publishedFormItemVersion) {
      draftFormItems.push({ ...draftFormItem, isNew: true });
    }

    if (publishedFormItem && !draftFormItemVersion) {
      publishedFormItems.push({ ...publishedFormItem, isDeleted: true });
    }

    if (publishedFormItem && draftFormItemVersion) {
      if (publishedFormItem.index === draftFormItemVersion.index) {
        draftFormItems.push(draftFormItemVersion);
        publishedFormItems.push(publishedFormItem);
      } else {
        draftFormItems.push({
          ...draftFormItemVersion,
          movedFrom: publishedFormItem.index,
          isUpdated: true,
        });
        publishedFormItems.push({
          ...publishedFormItem,
          movedTo: draftFormItemVersion.index,
          isUpdated: true,
        });
      }
    }

    // TODO (gabe): handle diffing questions for updates
  }

  return { draftFormItems, publishedFormItems };
}

export function draftFormExistsResultConverter(result): string[] {
  const existingDraftFormItems = result?.records || [];
  return existingDraftFormItems.map((item) => {
    return item.drft_form_id;
  });
}

export function publishedFormExistsResultConverter(result): string[] {
  const existingDraftFormItems = result?.records || [];
  return existingDraftFormItems.map((item) => {
    return item.sub_req_forms_id;
  });
}

// export async function
