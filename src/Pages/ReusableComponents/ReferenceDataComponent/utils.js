import { checkParamExists } from "../../../util_funcs/reusables";

export function checkIdFieldParamExists(idField) {
  checkParamExists(idField, "idField");
}

export function checkNameFieldParamExists(nameField) {
  checkParamExists(nameField, "nameField");
}

export function indexReferenceDataRecords(list, idField) {
  checkIdFieldParamExists(idField);

  return list.reduce((map, item) => {
    map[item[idField]] = item;
    return map;
  }, {});
}

export function findItem(list, itemId, idField) {
  checkIdFieldParamExists(idField);

  return list.find((item) => {
    return item[idField] === itemId;
  });
}

export function findItemIndex(list, itemId, idField) {
  checkIdFieldParamExists(idField);

  return list.findIndex((item) => {
    return item[idField] === itemId;
  });
}

export function sortRecordsAlphabetically(list, nameField) {
  checkNameFieldParamExists(nameField);

  return list.sort((item0, item1) => {
    const name0 = item0[nameField].toUpperCase();
    const name1 = item1[nameField].toUpperCase();

    if (name0 > name1) {
      return 1;
    } else if (name0 < name1) {
      return -1;
    } else {
      return 0;
    }
  });
}

export function sortRecordsById(records, idField) {
  checkIdFieldParamExists(idField);

  return records.sort((item1, item2) => {
    return item1[idField] - item2[idField];
  });
}

export function isNewReferenceData(item, idField) {
  checkIdFieldParamExists(idField);

  // New items won't have an id
  return !item[idField];
}

export function findRecords(list, recordIds, idField) {
  checkIdFieldParamExists(idField);

  const result = [];
  const indexedRecordIds = recordIds.reduce((map, id, index) => {
    map[id] = { id, index };
    return map;
  }, {});

  list.forEach((item, index) => {
    const id = item[idField];
    const idData = indexedRecordIds[id];

    if (idData) {
      result.push({ item, id, itemIndex: index, idIndex: idData.index });
    }
  });

  return result;
}

export function getUniqueRecordsUsingName(records, idField, nameField) {
  checkIdFieldParamExists(idField);
  checkNameFieldParamExists(nameField);

  // first sort for consistency in results
  records.sort((item1, item2) => {
    return item1[idField] - item2[nameField];
  });

  const seenNames = {};
  const uniqueItems = [];

  records.forEach((item) => {
    const itemName = item[nameField].toLowerCase();

    if (!seenNames[itemName]) {
      uniqueItems.push(item);
      seenNames[itemName] = true;
    }
  });

  return uniqueItems;
}

export function getActiveReferenceData(options) {
  return options.filter((option) => option.isActive);
}
