import {
  kOptionIdField,
  kOptionNameField,
} from "../../../ReusableComponents/QuestionTable/utils";
import {
  indexReferenceDataRecords,
  sortRecordsById,
} from "../../../ReusableComponents/ReferenceDataComponent/utils";

const removeDuplicateNodes = (nodes) => {
  const seen = {};

  nodes = nodes.filter((node) => {
    const name = (node[kOptionNameField] || "").toLowerCase();
    const parentIds = seen[name] || [];
    let keep = true;

    if (parentIds.includes(node.parentId)) {
      keep = false;
    } else {
      keep = true;
    }

    parentIds.push(node.parentId);
    seen[name] = parentIds;
    return keep;
  });

  return nodes;
};

export function buildDossierTree(nodes) {
  sortRecordsById(nodes, kOptionIdField);
  nodes = removeDuplicateNodes(nodes);

  const map = indexReferenceDataRecords(nodes, kOptionIdField);
  let rootNodes = [];

  nodes.forEach((node, index) => {
    if (!node.children) {
      node.children = [];
    }

    const parent = map[node.parentId];

    if (parent) {
      const children = parent.children || [];
      children.push(index);
      parent.children = children;
    }

    if (!node.parentId) {
      rootNodes.push(index);
    }
  });

  rootNodes = sortRecordsById(rootNodes, kOptionIdField);

  return {
    nodes,
    rootNodes,
  };
}

export function getLastNodeIndex(name) {
  const split = name.split(" ");

  const numbersStr = split.find((str) => {
    const strSplit = str.split(".");
    const numbers = [];

    for (let i = 0; i < strSplit.length; i++) {
      const nextStr = strSplit[i];
      const nextNum = Number.parseInt(nextStr, 10);

      if (!Number.isNaN(nextNum)) {
        numbers.push(nextNum);
      }
    }

    return numbers.length > 0;
  });

  if (numbersStr) {
    return numbersStr.split(".");
  }

  return [];
}

export function getNewNodeIndex(parent, parentChildren) {
  const lastNode = parentChildren[parentChildren.length - 1];

  if (lastNode) {
    const lastNodeIndexArr = getLastNodeIndex(lastNode.optionText);

    if (lastNodeIndexArr.length > 0) {
      let lastNodeItemIndex = lastNodeIndexArr[lastNodeIndexArr.length - 1];
      lastNodeItemIndex = Number.parseInt(lastNodeItemIndex);

      const newNodeItemIndex = lastNodeItemIndex + 1;
      const newNodeIndexArr = [...lastNodeIndexArr];
      newNodeIndexArr[newNodeIndexArr.length - 1] = newNodeItemIndex;

      return newNodeIndexArr.join(".");
    }
  } else if (parent) {
    const parentIndexArr = getLastNodeIndex(parent.optionText);

    if (parentIndexArr.length > 0) {
      const newNodeItemIndex = 1;
      const newNodeIndexArr = [...parentIndexArr, newNodeItemIndex];

      return newNodeIndexArr.join(".");
    }
  }

  return null;
}
